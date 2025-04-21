import "server-only";
import { headers } from "next/headers";
import { type Server, type Socket } from "socket.io";

import { dictionaries } from "~/app/dictionaries";
import { globalLanguageHeader } from "~/middleware";
import { auth } from "~/server/auth";

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
  const session = await auth();
  const io = globalThis.__io;

  if (!io) throw new Error("Websocket server failed to initialise.");

  try {
    io.use(async (socket, next) => {
      if (session) next();

      io.in(socket.id).disconnectSockets();
    });

    io.on("connection", (socket) => {
      io.in(socket.id).emit("handshake", Math.floor(Date.now() / 1000));
    });

    //TODO
    io.on("join-room", (socket, roomId) => {});
    io.on("message", (socket) => {});

    globalThis.__IO_SETUP = true;
  } catch (error) {
    throw new Error("Websocket server failed to initialise.", { cause: error });
  }
};
