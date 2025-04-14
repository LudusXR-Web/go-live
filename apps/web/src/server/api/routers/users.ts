import z from "zod";
import { eq } from "drizzle-orm";
import { createSelectSchema, createUpdateSchema } from "drizzle-zod";

import { personalDetails, users, userTypeEnum } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const userRouter = createTRPCRouter({
  getFootprintById: publicProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) =>
      (await ctx.db.query.users.findFirst({
        where: (user, { eq }) => eq(user.id, input),
        columns: {
          username: true,
          name: true,
          type: true,
          image: true,
        },
      })) ?? null,
  ),
  getMultipleFootprintsById: publicProcedure
    .input(z.string().cuid2().array())
    .query(
      async ({ ctx, input }) =>
        (await ctx.db.query.users.findMany({
          where: (user, { eq, or }) =>
            or(...input.map((id) => eq(user.id, id))),
          columns: {
            id: true,
            name: true,
            username: true,
            type: true,
            image: true,
          },
        })) ?? null,
    ),
  getFootprintByEmail: publicProcedure.input(z.string().email()).query(
    async ({ ctx, input }) =>
      (await ctx.db.query.users.findFirst({
        where: (user, { eq }) => eq(user.email, input),
        columns: {
          username: true,
          name: true,
          type: true,
          image: true,
        },
      })) ?? null,
  ),
  getMultipleFootprintsByEmail: publicProcedure
    .input(z.string().email().array())
    .query(
      async ({ ctx, input }) =>
        (await ctx.db.query.users.findMany({
          where: (user, { eq, or }) =>
            or(...input.map((id) => eq(user.email, id))),
          columns: {
            id: true,
            name: true,
            username: true,
            type: true,
            image: true,
          },
        })) ?? null,
    ),
  getFootprintByUsername: publicProcedure
    .input(z.string().min(2).max(50))
    .query(
      async ({ ctx, input }) =>
        (await ctx.db.query.users.findFirst({
          where: (user, { eq }) => eq(user.username, input),
          columns: {
            id: true,
            name: true,
            type: true,
            image: true,
          },
        })) ?? null,
    ),
  searchByUsername: protectedProcedure.input(z.string().min(2).max(50)).query(
    async ({ ctx, input }) =>
      (await ctx.db.query.users.findMany({
        where: (user, { or, ilike }) =>
          or(
            ilike(user.username, `%${input}%`),
            ilike(user.name, `%${input}%`),
          ),
        columns: {
          id: true,
          name: true,
          username: true,
          type: true,
          image: true,
        },
        limit: 10,
      })) ?? null,
  ),
  update: protectedProcedure
    .input(
      createUpdateSchema(users)
        .omit({
          createdAt: true,
          updatedAt: true,
        })
        .merge(
          z.object({
            id: z.string().cuid2(),
            email: z.string().email().optional(),
            image: z.string().url().optional(),
            type: z.enum(userTypeEnum.enumValues).optional(),
          }),
        ),
    )
    .mutation(
      async ({ ctx, input: { id, ...input } }) =>
        await ctx.db
          .update(users)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(users.id, id)),
    ),

  getPersonalDetailsById: publicProcedure
    .input(z.string().cuid2())
    .output(createSelectSchema(personalDetails))
    .query(
      async ({ ctx, input }) =>
        (await ctx.db.query.personalDetails.findFirst({
          where: (p, { eq }) => eq(p.userId, input),
        }))!,
    ),
  updatePersonalDetails: protectedProcedure
    .input(
      createUpdateSchema(personalDetails)
        .omit({
          updatedAt: true,
        })
        .merge(
          z.object({
            userId: z.string().cuid2(),
            banner: z.string().url().optional(),
          }),
        ),
    )
    .mutation(
      async ({ ctx, input: { userId, ...input } }) =>
        await ctx.db
          .update(personalDetails)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(personalDetails.userId, userId)),
    ),

  getCoursesById: protectedProcedure.input(z.string().cuid2().optional()).query(
    async ({ ctx, input }) =>
      (await ctx.db.query.usersToCourses.findMany({
        where: (link, { eq }) => eq(link.userId, input ?? ctx.session.user.id),
      })) ?? null,
  ),
});

export default userRouter;
