import { createTRPCRouter, protectedProcedure } from "../trpc";

const sessionRourter = createTRPCRouter({
  getSession: protectedProcedure.query(({ ctx }) => ctx.session) ?? null,
});

export default sessionRourter;
