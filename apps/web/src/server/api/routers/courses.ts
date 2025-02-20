import { z } from "zod";
import { arrayOverlaps, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

import { courses } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const courseRouter = createTRPCRouter({
  getById: protectedProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) =>
      await ctx.db.query.courses.findFirst({
        where: (course, { eq }) => eq(course.id, input),
      }),
  ),
  getByAuthorId: protectedProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) =>
      await ctx.db.query.courses.findMany({
        where: (course, { eq }) => eq(course.authorId, input),
      }),
  ),
  getCourseContentById: protectedProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) =>
      await ctx.db.query.courseContents.findFirst({
        where: (content, { eq }) => eq(content.courseId, input),
      }),
  ),
  getFullCourseById: protectedProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) =>
      await ctx.db.query.courses.findFirst({
        where: (course, { eq }) => eq(course.id, input),
        with: {
          content: {
            columns: {
              courseId: false,
            },
          },
        },
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
  create: protectedProcedure
    .input(createInsertSchema(courses).omit({ id: true }))
    .output(z.string().cuid2())
    .mutation(
      async ({ ctx, input }) =>
        (
          await ctx.db
            .insert(courses)
            .values({ ...input })
            .returning({ id: courses.id })
        ).at(0)!.id,
    ),
  update: protectedProcedure
    .input(
      createInsertSchema(courses)
        .partial()
        .merge(
          z.object({
            id: z.string().cuid2(),
          }),
        ),
    )
    .mutation(
      async ({ ctx, input }) =>
        await ctx.db
          .update(courses)
          .set({
            ...input,
            id: undefined,
          })
          .where(eq(courses.id, input.id)),
    ),
});

export default courseRouter;
