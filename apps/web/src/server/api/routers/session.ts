import { createTRPCRouter, protectedProcedure } from "../trpc";

const sessionRourter = createTRPCRouter({
  getSession: protectedProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
});

export default sessionRourter;
