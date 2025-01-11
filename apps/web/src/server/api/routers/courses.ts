import { z } from "zod";
import { arrayOverlaps } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const courseRouter = createTRPCRouter({
  getById: protectedProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) =>
      await ctx.db.query.courses.findFirst({
        where: (course, { eq }) => eq(course.id, input),
      }),
  ),
  getByDetails: publicProcedure
    .input(
      z.object({
        query: z.string().min(3).max(50),
        tags: z.array(z.string()),
      }),
    )
    .query(
      async ({ ctx, input }) =>
        await ctx.db.query.courses.findMany({
          where: (course, { or, ilike }) =>
            or(
              ilike(course.title, input.query),
              ilike(course.description, input.query),
              arrayOverlaps(course.tags, input.tags),
            ),
        }),
    ),
});

export default courseRouter;
