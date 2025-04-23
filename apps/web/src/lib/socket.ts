"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

declare global {
  var __IO_CACHE: Socket;
}

/**
 * Cache the socket connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const socket = globalThis.__IO_CACHE ?? io();
if (process.env.NODE_ENV !== "production") globalThis.__IO_CACHE = socket;

export const useSocket = (sessionToken: string) => {
  const [isReady, setIsReady] = useState(false);
  const [transport, setTransport] = useState("N/A");

  socket.auth = {
    token: sessionToken,
  };

  useEffect(() => {
    if (isReady) {
      onConnect();
    }

    function onConnect() {
      setIsReady(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsReady(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return { isReady, socket, transport };
};
