import "server-only";
import { headers } from "next/headers";
import { type Server } from "socket.io";
import Cryptr from "cryptr";

import { env } from "~/env";
import { db } from "~/server/db";
import { dictionaries } from "~/app/dictionaries";
import { globalLanguageHeader } from "~/middleware";
import { type chatMessages, type messageBody } from "~/server/db/schema";
import { saveMessage } from "~/server/actions/chatActions";

export const getDictionaryFromHeaders = async () =>
  dictionaries[
    (await headers()).get(globalLanguageHeader)! as keyof typeof dictionaries
  ]();

export const getLocaleFromHeaders = async () =>
  (await headers()).get(globalLanguageHeader)! as keyof typeof dictionaries;

interface ServerToClientEvents {
  "message:incoming": (messageBody: typeof chatMessages.$inferSelect) => void;
}

interface ClientToServerEvents {
  "room:join": (roomId: string) => void;
  "message:new": (messageBody: messageBody) => void;
}

declare global {
  var __io: Server<ClientToServerEvents, ServerToClientEvents>; //eslint-disable-line no-var
  var __IO_SETUP: boolean; //eslint-disable-line no-var
}

export const ioInit = async () => {
  const io = globalThis.__io;

  if (!io) throw new Error("Websocket server failed to initialise.");

  try {
    io.use((socket, next) => {
      void (async () => {
        const currentSession =
          (await db.query.sessions.findFirst({
            where: (session, { eq, and, gte }) =>
              and(
                eq(session.sessionToken, socket.handshake.auth.token as string),
                gte(session.expires, new Date()),
              ),
          })) ?? null;

        if (currentSession || env.NODE_ENV === "development") next();
      })();
    });

    io.on("connection", (socket) => {
      if (env.NODE_ENV === "development")
        console.log(
          "[CONNECTION]",
          socket.handshake.auth,
          socket.handshake.time,
        );

      socket.on("room:join", async (roomId) => {
        await socket.join(roomId);
      });

      socket.on("message:new", async (message) => {
        if (env.NODE_ENV === "development") console.log("[MESSAGE]", message);

        const cryptoModule = new Cryptr(env.AUTH_SECRET);

        const messageId = await saveMessage({
          ...message,
          content: cryptoModule.encrypt(message.content),
          createdAt: new Date(message.createdAt),
          updatedAt: new Date(message.createdAt),
        });

        io.to(message.roomId).emit("message:incoming", {
          ...message,
          id: messageId,
          createdAt: new Date(message.createdAt),
          updatedAt: new Date(message.createdAt),
        });
      });
    });

    globalThis.__IO_SETUP = true;
  } catch (error) {
    throw new Error(
      `Websocket server failed to initialise. ${error as string}`,
      {
        cause: error,
      },
    );
  }
};
