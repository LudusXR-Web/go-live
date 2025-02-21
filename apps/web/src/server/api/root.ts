import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import userRouter from "./routers/users";
import s3Router from "./routers/s3";
import sessionRourter from "./routers/session";
import courseRouter from "./routers/courses";
import mediaRouter from "./routers/media";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  session: sessionRourter,
  users: userRouter,
  courses: courseRouter,
  s3: s3Router,
  media: mediaRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
