import { z } from "zod";
import { and, arrayOverlaps, avg, eq } from "drizzle-orm";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import {
  courseContents,
  courses,
  type CourseSection,
  type CourseContent,
  usersToCourses,
} from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

interface CoursesColumnFilter
  extends Partial<Record<keyof typeof courses._.columns, boolean>> {}

const courseRouter = createTRPCRouter({
  getById: protectedProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) =>
      (await ctx.db.query.courses.findFirst({
        where: (course, { eq }) => eq(course.id, input),
      })) ?? null,
  ),
  /**
   *! @summary If input is provided in the shape of `{ id: string; columns: object; }` the output fields will be limited to the fields supplied in the `columns` property.
   */
  getByAuthorId: protectedProcedure
    .input(
      z
        .string()
        .cuid2()
        .or(
          z.object({
            id: z.string().cuid2(),
            columns: z.custom<CoursesColumnFilter>().optional(),
          }),
        ),
    )
    .query(
      async ({ ctx, input }) =>
        (await ctx.db.query.courses.findMany({
          where: (course, { eq }) =>
            eq(course.authorId, typeof input === "string" ? input : input.id),
          columns: typeof input === "string" ? undefined : input.columns,
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
  getByDetails: publicProcedure
    .input(
      z.object({
        query: z.string().max(160),
        tags: z.array(z.string()),
      }),
    )
    .query(
      async ({ ctx, input }) =>
        (await ctx.db.query.courses.findMany({
          where: (course, { and, or, eq, ilike }) =>
            and(
              eq(course.public, true),
              or(
                ilike(course.title, `%${input.query}%`),
                ilike(course.description, `%${input.query}%`),
                ilike(course.longDescription, `%${input.query}%`),
              ),
              input.tags.length
                ? arrayOverlaps(course.tags, input.tags)
                : undefined,
            ),
          limit: 50,
        })) ?? null,
    ),
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
      async ({ ctx, input: { id, ...input } }) =>
        await ctx.db
          .update(courses)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(courses.id, id)),
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
      async ({ ctx, input: { courseId, ...input } }) =>
        await ctx.db
          .update(courseContents)
          .set({
            ...input,
            updatedAt: new Date(),
            sections: input.sections as CourseSection[],
            elements: input.elements as CourseContent[],
          })
          .where(eq(courseContents.courseId, courseId)),
    ),
  getAggregatedRating: publicProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) =>
      await ctx.db
        .select({
          rating: avg(usersToCourses.rating),
        })
        .from(usersToCourses)
        .where(eq(usersToCourses.courseId, input))
        .limit(1),
  ),
  enrolUserIntoCourse: protectedProcedure.input(z.string().cuid2()).mutation(
    async ({ ctx, input }) =>
      await ctx.db.insert(usersToCourses).values({
        userId: ctx.session.user.id,
        courseId: input,
      }),
  ),
  updateEnrolment: protectedProcedure
    .input(
      createUpdateSchema(usersToCourses).merge(
        z.object({
          userId: z.string().cuid2(),
          courseId: z.string().cuid2(),
        }),
      ),
    )
    .mutation(
      async ({ ctx, input: { userId, courseId, ...input } }) =>
        await ctx.db
          .update(usersToCourses)
          .set(input)
          .where(
            and(
              eq(usersToCourses.userId, userId),
              eq(usersToCourses.courseId, courseId),
            ),
          ),
    ),
});

export default courseRouter;
