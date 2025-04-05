import "server-only";

import { z } from "zod";
import { google } from "googleapis";
import { createId } from "@paralleldrive/cuid2";

import { auth } from "~/server/google/api";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const calendar = google.calendar({
  version: "v3",
  auth,
});

const calendarRouter = createTRPCRouter({
  createEvent: protectedProcedure
    .input(
      z.object({
        userId: z.string().cuid2().optional(),
        maxAttendees: z.number().min(2).finite().optional(),
        sendNotifications: z.boolean().optional(),
        attendees: z.string().email().array().default([]),
        description: z.string().optional(),
        title: z.string(),
        start: z.string().datetime(),
        end: z.string().datetime(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userAccount = await ctx.db.query.accounts.findFirst({
        where: (account, { eq }) =>
          eq(account.userId, input.userId ?? ctx.session.user.id),
        columns: {
          access_token: true,
          refresh_token: true,
          scope: true,
        },
      });

      if (
        !userAccount ||
        !userAccount.access_token ||
        !userAccount.refresh_token ||
        !userAccount.scope
      )
        return null;

      //@ts-ignore
      auth.setCredentials({ ...userAccount });

      await calendar.events.insert({
        auth,
        calendarId: "primary",
        conferenceDataVersion: 1,
        maxAttendees: input.maxAttendees,
        sendUpdates: `${input.sendNotifications ?? false}`,
        requestBody: {
          summary: input.title,
          description: input.description,
          eventType: "birthday",
          start: {
            dateTime: input.start,
          },
          end: {
            dateTime: input.end,
          },
          attendees: input.attendees.map((email) => ({
            email,
          })),
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
    }),
});

export default calendarRouter;
