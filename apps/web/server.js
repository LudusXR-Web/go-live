import { createServer } from "node:http";
import { Server } from "socket.io";
import next from "next";

import conf from "./next.config.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port, conf });
const handler = app.getRequestHandler();

app.prepare().then(async () => {
  await import("./src/env.js");

  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  //TODO implement authentication middleware
  io.use((_socket, next) => {
    next();
  });

  io.on("connection", (socket) => {
    socket.send("Hello World!");
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
