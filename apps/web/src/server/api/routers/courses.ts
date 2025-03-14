import { z } from "zod";
import { arrayOverlaps, eq } from "drizzle-orm";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import {
  courseContents,
  courses,
  type CourseSection,
  type CourseContent,
} from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const courseRouter = createTRPCRouter({
  getById: protectedProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) =>
      (await ctx.db.query.courses.findFirst({
        where: (course, { eq }) => eq(course.id, input),
      })) ?? null,
  ),
  getByAuthorId: protectedProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) =>
      (await ctx.db.query.courses.findMany({
        where: (course, { eq }) => eq(course.authorId, input),
      })) ?? null,
  ),
  getCourseContentById: protectedProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) =>
      (await ctx.db.query.courseContents.findFirst({
        where: (content, { eq }) => eq(content.courseId, input),
      })) ?? null,
  ),
  getFullCourseById: protectedProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) =>
      (await ctx.db.query.courses.findFirst({
        where: (course, { eq }) => eq(course.id, input),
        with: {
          content: {
            columns: {
              courseId: false,
            },
          },
        },
      })) ?? null,
  ),
  getByDetails:
    publicProcedure
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
      ) ?? null,
  create: protectedProcedure
    .input(
      createInsertSchema(courses)
        .omit({ id: true, authorId: true })
        .merge(
          z.object({
            authorId: z.string().cuid2().optional(),
          }),
        ),
    )
    .output(z.string().cuid2())
    .mutation(async ({ ctx, input }) => {
      const id = (
        await ctx.db
          .insert(courses)
          .values({ ...input, authorId: input.authorId ?? ctx.session.user.id })
          .returning({ id: courses.id })
      ).at(0)!.id;

      await ctx.db.insert(courseContents).values({
        courseId: id,
      });

      return id;
    }),
  update: protectedProcedure
    .input(
      createUpdateSchema(courses).merge(
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
  updateContent: protectedProcedure
    .input(
      createUpdateSchema(courseContents).merge(
        z.object({
          courseId: z.string().cuid2(),
        }),
      ),
    )
    .mutation(
      async ({ ctx, input }) =>
        await ctx.db
          .update(courseContents)
          .set({
            sections: input.sections as CourseSection[],
            elements: input.elements as CourseContent[],
            courseId: undefined,
          })
          .where(eq(courseContents.courseId, input.courseId)),
    ),
});

export default courseRouter;
