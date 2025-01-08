import z from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const userRouter = createTRPCRouter({
  updateAvatar: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
        url: z.string().url(),
        timestamp: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({
          image: input.url,
          updatedAt: new Date(input.timestamp),
        })
        .where(eq(users.id, input.id));
    }),
});

export default userRouter;
