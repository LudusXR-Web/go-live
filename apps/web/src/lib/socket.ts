"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io({ autoConnect: false });

export const useSocket = (sessionToken: string) => {
  const [isReady, setIsReady] = useState(socket.connected);
  const [transport, setTransport] = useState("N/A");

  socket.auth = {
    token: sessionToken,
  };

  socket.connect();

  useEffect(() => {
    if (socket.connected) {
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

      socket.disconnect();
    };
  }, []);

  return { isReady, socket, transport };
};
