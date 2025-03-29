import z from "zod";
import { eq } from "drizzle-orm";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { media } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const mediaRouter = createTRPCRouter({
  getById: publicProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) =>
      (await ctx.db.query.media.findFirst({
        where: (media, { eq }) => eq(media.id, input),
      })) ?? null,
  ),
  getByKey: publicProcedure.input(z.string()).query(
    async ({ ctx, input }) =>
      (await ctx.db.query.media.findFirst({
        where: (media, { eq }) => eq(media.key, input),
      })) ?? null,
  ),
  create: protectedProcedure
    .input(
      createInsertSchema(media)
        .omit({ id: true, authorId: true })
        .merge(z.object({ authorId: z.string().cuid2().optional() })),
    )
    .mutation(
      async ({ ctx, input }) =>
        (
          await ctx.db
            .insert(media)
            .values({
              ...input,
              authorId: input.authorId ?? ctx.session.user.id,
            })
            .returning({ id: media.id })
        ).at(0)!.id,
    ),
  update: protectedProcedure
    .input(
      createUpdateSchema(media).merge(z.object({ id: z.string().cuid2() })),
    )
    .mutation(
      async ({ ctx, input: { id, ...input } }) =>
        await ctx.db.update(media).set(input).where(eq(media.id, id)),
    ),
});

export default mediaRouter;
