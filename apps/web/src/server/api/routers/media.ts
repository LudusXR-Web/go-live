import z from "zod";
import { eq } from "drizzle-orm";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { media } from "~/server/db/schema";

const mediaRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      createInsertSchema(media)
        .omit({ id: true })
        .merge(z.object({ authorId: z.string().cuid2().optional() })),
    )
    .mutation(
      async ({ ctx, input }) =>
        (
          await ctx.db
            .insert(media)
            .values({
              ...input,
              authorId: ctx.session.user.id,
            })
            .returning({ id: media.id })
        ).at(0)!.id,
    ),
  update: protectedProcedure
    .input(
      createUpdateSchema(media).merge(z.object({ id: z.string().cuid2() })),
    )
    .mutation(
      async ({ ctx, input }) =>
        await ctx.db
          .update(media)
          .set({
            ...input,
            id: undefined,
          })
          .where(eq(media.id, input.id)),
    ),
});

export default mediaRouter;
