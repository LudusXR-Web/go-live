import "server-only";
import { headers } from "next/headers";
import { type Server } from "socket.io";
import Cryptr from "cryptr";

import { env } from "~/env";
import { db } from "~/server/db";
import { dictionaries } from "~/app/dictionaries";
import { globalLanguageHeader } from "~/middleware";
import { type messageBody } from "~/server/db/schema";
import { saveMessage } from "~/server/actions/chatActions";

export const getDictionaryFromHeaders = async () =>
  dictionaries[
    (await headers()).get(globalLanguageHeader)! as keyof typeof dictionaries
  ]();

export const getLocaleFromHeaders = async () =>
  (await headers()).get(globalLanguageHeader)! as keyof typeof dictionaries;

interface ServerToClientEvents {
  "message:incoming": (messageBody: messageBody) => void;
}

interface ClientToServerEvents {
  "room:join": (roomId: string) => void;
  "message:new": (messageBody: messageBody) => void;
}

declare global {
  var __io: Server<ClientToServerEvents, ServerToClientEvents>;
  var __IO_SETUP: boolean;
}

export const ioInit = async () => {
  const io = globalThis.__io;

  if (!io) throw new Error("Websocket server failed to initialise.");

  try {
    io.on("connection", async (socket) => {
      const currentSession =
        (await db.query.sessions.findFirst({
          where: (session, { eq, and, gte }) =>
            and(
              eq(session.sessionToken, socket.handshake.auth.token),
              gte(session.expires, new Date()),
            ),
        })) ?? null;

      if (!currentSession && env.NODE_ENV !== "development")
        socket.disconnect();

      socket.on("room:join", (roomId) => {
        socket.join(roomId);
      });

      socket.on("message:new", async (message) => {
        io.to(message.roomId).emit("message:incoming", message);

        const cryptoModule = new Cryptr(env.AUTH_SECRET);

        await saveMessage({
          ...message,
          content: cryptoModule.encrypt(message.content),
          createdAt: new Date(message.createdAt),
          updatedAt: new Date(message.createdAt),
        });
      });
    });

    globalThis.__IO_SETUP = true;
  } catch (error) {
    throw new Error(`Websocket server failed to initialise. ${error}`, {
      cause: error,
    });
  }
};
