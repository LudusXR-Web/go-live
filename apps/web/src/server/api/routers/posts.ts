import { z } from "zod";
import { eq } from "drizzle-orm";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { posts } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const postsRouter = createTRPCRouter({
  getById: protectedProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) =>
      (await ctx.db.query.posts.findFirst({
        where: (post, { eq }) => eq(post.id, input),
      })) ?? null,
  ),
  getByAuthorId: protectedProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) =>
      (await ctx.db.query.posts.findMany({
        where: (post, { eq }) => eq(post.authorId, input),
      })) ?? null,
  ),
  create: protectedProcedure
    .input(
      createInsertSchema(posts)
        .omit({ id: true })
        .merge(
          z.object({
            autorId: z.string().cuid2().optional(),
          }),
        ),
    )
    .output(z.string().cuid2())
    .mutation(async ({ ctx, input }) => {
      const id = (
        await ctx.db
          .insert(posts)
          .values({ ...input, authorId: ctx.session.user.id })
          .returning({ id: posts.id })
      ).at(0)!.id;

      return id;
    }),
  update: protectedProcedure
    .input(
      createUpdateSchema(posts).merge(
        z.object({
          id: z.string().cuid2(),
        }),
      ),
    )
    .mutation(
      async ({ ctx, input }) =>
        await ctx.db
          .update(posts)
          .set({
            ...input,
            id: undefined,
          })
          .where(eq(posts.id, input.id)),
    ),
});

export default postsRouter;
