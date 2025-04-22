import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const sessionRourter = createTRPCRouter({
  getSession: protectedProcedure.query(({ ctx }) => ctx.session) ?? null,
});

export default sessionRourter;
