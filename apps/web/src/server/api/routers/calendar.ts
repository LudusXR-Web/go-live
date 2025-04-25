import "server-only";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { google } from "googleapis";
import { createId } from "@paralleldrive/cuid2";

import { createTRPCRouter, OAuthProcedure, protectedProcedure } from "../trpc";
import { auth } from "~/server/google/api";
import { accounts, courses, events } from "~/server/db/schema";

const calendar = google.calendar({
  version: "v3",
  auth,
});

const calendarRouter = createTRPCRouter({
  getEventById: OAuthProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) => {
      auth.setCredentials({ ...ctx.account });

      const storedEvent = await ctx.db.query.events.findFirst({
        where: (event, { eq }) => eq(event.id, input),
      });

      if (!storedEvent) return null;

      const res = await calendar.events.get({
        auth,
        calendarId: "primary",
        eventId: input,
      });

      if (res.status !== 200) return null;

      return {
        ...storedEvent,
        data: res.data,
      };
    },
  ),
  getOwnEvents: OAuthProcedure.input(
    z
      .object({
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
      })
      .optional(),
  ).query(async ({ ctx, input }) => {
    auth.setCredentials({ ...ctx.account });

    const res = await calendar.events.list({
      auth,
      calendarId: "primary",
      timeMin: input?.from,
      timeMax: input?.to,
    });

    if (res.status === 200 && res.data.items) {
      const googleEventIds = res.data.items.map((e) => e.id!);
      const storedEvents = await ctx.db.query.events.findMany({
        where: (event, { or, eq }) =>
          or(...googleEventIds.map((id) => eq(event.id, id))),
      });

      const sortedGoogleEvents = res.data.items.sort(
        (a, b) =>
          +new Date(a.start?.dateTime ?? 0) - +new Date(b.start?.dateTime ?? 0),
      );

      return {
        storedEvents,
        fetchedEvents: sortedGoogleEvents,
      };
    }

    return null;
  }),
  getPublicEventsByCourseId: protectedProcedure
    .input(z.string().cuid2())
    .query(async ({ ctx, input }) => {
      const storedEvents = await ctx.db.query.events.findMany({
        where: (event, { eq }) => eq(event.courseId, input),
      });

      if (!storedEvents.length) return null;

      const [queriedAccount] = await ctx.db
        .select({
          authorId: accounts.userId,
          access_token: accounts.access_token,
          refresh_token: accounts.refresh_token,
          scope: accounts.scope,
        })
        .from(courses)
        .where(eq(courses.id, input))
        .leftJoin(accounts, eq(courses.authorId, accounts.userId))
        .limit(1);

      if (!queriedAccount) throw new TRPCError({ code: "NOT_FOUND" });

      const { authorId: _authorId, ...account } = queriedAccount as Record<
        keyof typeof queriedAccount,
        NonNullable<string>
      >;

      auth.setCredentials({ ...account });

      const res = await calendar.events.list({
        auth,
        calendarId: "primary",
        timeMin: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
      });

      if (res.status !== 200 || !res.data.items)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const fetchedEvents = res.data.items
        .filter((googleEvent) =>
          storedEvents.some((event) => event.id === googleEvent.id),
        )
        .sort(
          (a, b) =>
            +new Date(a.start?.dateTime ?? 0) -
            +new Date(b.start?.dateTime ?? 0),
        );

      if (!fetchedEvents.length) return null;

      return {
        storedEvents,
        fetchedEvents,
      };
    }),
  createOwnEvent: OAuthProcedure.input(
    z.object({
      courseId: z.string().cuid2().optional(),
      maxAttendees: z.number().min(2).finite().optional(),
      sendNotifications: z.enum(["none", "externalOnly", "all"]).optional(),
      attendees: z.string().cuid2().array().default([]),
      description: z.string().optional(),
      title: z.string(),
      public: z.boolean(),
      start: z.string().datetime(),
      end: z.string().datetime(),
    }),
  ).mutation(async ({ ctx, input }) => {
    auth.setCredentials({ ...ctx.account });

    const res = await calendar.events.insert({
      auth,
      calendarId: "primary",
      conferenceDataVersion: 1,
      maxAttendees: input.public ? input.maxAttendees : undefined,
      sendUpdates: input.sendNotifications,
      requestBody: {
        summary: input.title,
        description: input.description,
        start: {
          dateTime: input.start,
        },
        end: {
          dateTime: input.end,
        },
        attendees: await ctx.db.query.users.findMany({
          where: (user, { or, eq }) =>
            or(...input.attendees.map((id) => eq(user.id, id))),
          columns: {
            email: true,
          },
        }),
        conferenceData: {
          conferenceSolution: {
            key: {
              type: "hangoutsMeet",
            },
          },
          createRequest: {
            requestId: createId(),
          },
        },
      },
    });

    if (res.status !== 200)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: res.statusText,
      });

    await ctx.db.insert(events).values({
      id: res.data.id!,
      authorId: ctx.session.user.id,
      courseId: input.courseId,
      maxAttendees: input.maxAttendees,
      sendNotifications: input.sendNotifications === "all",
      public: input.public,
    });
  }),
  updateOwnEvent: OAuthProcedure.input(
    z
      .object({
        courseId: z.string().cuid2().optional(),
        maxAttendees: z.number().min(2).finite().optional(),
        sendNotifications: z.enum(["none", "externalOnly", "all"]).optional(),
        attendees: z.string().cuid2().array().default([]),
        description: z.string().optional(),
        title: z.string(),
        public: z.boolean(),
        start: z.string().datetime(),
        end: z.string().datetime(),
      })
      .partial()
      .merge(z.object({ eventId: z.string() })),
  ).mutation(async ({ ctx, input }) => {
    auth.setCredentials({ ...ctx.account });

    const res = await calendar.events.update({
      auth,
      eventId: input.eventId,
      calendarId: "primary",
      maxAttendees: input.public ? input.maxAttendees : undefined,
      sendUpdates: input.sendNotifications,
      requestBody: {
        summary: input.title,
        description: input.description,
        start: {
          dateTime: input.start,
        },
        end: {
          dateTime: input.end,
        },
        attendees: input.attendees?.length
          ? await ctx.db.query.users.findMany({
              where: (user, { or, eq }) =>
                or(...input.attendees!.map((id) => eq(user.id, id))),
              columns: {
                email: true,
              },
            })
          : undefined,
      },
    });

    if (res.status !== 200)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: res.statusText,
      });

    await ctx.db
      .update(events)
      .set({
        courseId: input.courseId,
        maxAttendees: input.maxAttendees,
        sendNotifications: input.sendNotifications === "all",
        public: input.public,
      })
      .where(eq(events.id, input.eventId));
  }),
  signUpForEventById: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const storedEvent = await ctx.db.query.events.findFirst({
        where: (event, { eq }) => eq(event.id, input),
      });

      if (!storedEvent?.public) throw new TRPCError({ code: "NOT_FOUND" });

      const account = await ctx.db.query.accounts.findFirst({
        where: (account, { eq }) => eq(account.userId, storedEvent.authorId),
        columns: {
          access_token: true,
          refresh_token: true,
          scope: true,
        },
      });

      if (!account) throw new TRPCError({ code: "NOT_FOUND" });

      auth.setCredentials({ ...account });

      const fetchedEvent = await calendar.events.get({
        auth,
        calendarId: "primary",
        eventId: input,
      });

      if (!fetchedEvent.data) throw new TRPCError({ code: "NOT_FOUND" });

      if (
        (fetchedEvent.data.attendees ?? []).length >=
        (storedEvent.maxAttendees ?? 2)
      )
        throw new TRPCError({ code: "FORBIDDEN" });

      const res = await calendar.events.patch({
        auth,
        calendarId: "primary",
        eventId: input,
        requestBody: {
          attendees: [{ email: ctx.session.user.email }],
        },
      });

      if (res.status !== 200)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }),
});

export default calendarRouter;
