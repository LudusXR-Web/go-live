import { createServer } from "node:http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import next from "next";

import conf from "./next.config.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.NODE_ENV !== "production" ? "::" : "localhost";
const port = 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port, conf });
const handler = app.getRequestHandler();

app.prepare().then(async () => {
  await import("./src/env.js");

  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true,
    },
  });

  instrument(io, {
    auth: false,
    mode: "development",
  });

  globalThis.__io = io;

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
