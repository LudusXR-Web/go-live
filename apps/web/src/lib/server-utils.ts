import "server-only";
import { headers } from "next/headers";
import { type Server, type Socket } from "socket.io";

import { env } from "~/env";
import { db } from "~/server/db";
import { dictionaries } from "~/app/dictionaries";
import { globalLanguageHeader } from "~/middleware";
import { chatMessages } from "~/server/db/schema";

export const getDictionaryFromHeaders = async () =>
  dictionaries[
    (await headers()).get(globalLanguageHeader)! as keyof typeof dictionaries
  ]();

export const getLocaleFromHeaders = async () =>
  (await headers()).get(globalLanguageHeader)! as keyof typeof dictionaries;

declare global {
  var __io: Server;
  var __IO_SETUP: boolean;
}

export const ioInit = async () => {
  const io = globalThis.__io;

  if (!io) throw new Error("Websocket server failed to initialise.");

  try {
    io.on("connection", async (socket) => {
      if (
        env.NODE_ENV === "development" &&
        socket.handshake.auth.token === "sudo"
      ) {
        socket.emit("handshake", Math.floor(Date.now() / 1000));
      }

      const currentSession =
        (await db.query.sessions.findFirst({
          where: (session, { eq, and, gte }) =>
            and(
              eq(session.sessionToken, socket.handshake.auth.token),
              gte(session.expires, new Date()),
            ),
        })) ?? null;

      if (!currentSession) socket.disconnect();

      socket.on("room:join", (roomId) => {
        socket.join(roomId);
      });

      socket.on(
        "message:new",
        (messageBody: Omit<typeof chatMessages.$inferSelect, "updatedAt">) => {
          //TODO implement message handling
        },
      );
    });

    globalThis.__IO_SETUP = true;
  } catch (error) {
    throw new Error(`Websocket server failed to initialise. ${error}`, {
      cause: error,
    });
  }
};
