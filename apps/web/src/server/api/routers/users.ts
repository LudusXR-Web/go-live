import z from "zod";
import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { users } from "~/server/db/schema";

const userRouter = createTRPCRouter({
  update: protectedProcedure
    .input(
      createInsertSchema(users)
        .omit({
          createdAt: true,
          updatedAt: true,
        })
        .partial()
        .merge(
          z.object({
            id: z.string().cuid2(),
            email: z.string().email().optional(),
            image: z.string().url().optional(),
          }),
        ),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({
          ...input,
          id: undefined,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.id));
    }),
});

export default userRouter;
