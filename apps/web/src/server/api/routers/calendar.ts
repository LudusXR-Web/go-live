import "server-only";

import { z } from "zod";
import { google } from "googleapis";
import { createId } from "@paralleldrive/cuid2";

import { auth } from "~/server/google/api";
import { createTRPCRouter, OAuthProcedure, protectedProcedure } from "../trpc";

const calendar = google.calendar({
  version: "v3",
  auth,
});

const calendarRouter = createTRPCRouter({
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

    if (res.status === 200 && res.data.items)
      return res.data.items.sort(
        (a, b) => +new Date(a.start?.dateTime!) - +new Date(b.start?.dateTime!),
      );

    return null;
  }),
  createOwnEvent: OAuthProcedure.input(
    z.object({
      maxAttendees: z.number().min(2).finite().optional(),
      sendNotifications: z.enum(["none", "externalOnly", "all"]).optional(),
      attendees: z.string().email().array().default([]),
      description: z.string().optional(),
      title: z.string(),
      start: z.string().datetime(),
      end: z.string().datetime(),
    }),
  ).mutation(async ({ ctx, input }) => {
    auth.setCredentials({ ...ctx.account });

    const res = await calendar.events.insert({
      auth,
      calendarId: "primary",
      conferenceDataVersion: 0,
      maxAttendees: input.maxAttendees,
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
