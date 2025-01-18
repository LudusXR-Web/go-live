import z from "zod";
import { eq } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { personalDetails, users, userTypeEnum } from "~/server/db/schema";

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
            type: z.enum(userTypeEnum.enumValues).optional(),
          }),
        ),
    )
    .mutation(
      async ({ ctx, input }) =>
        await ctx.db
          .update(users)
          .set({
            ...input,
            id: undefined,
            updatedAt: new Date(),
          })
          .where(eq(users.id, input.id)),
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
      createInsertSchema(personalDetails)
        .omit({
          updatedAt: true,
        })
        .partial()
        .merge(
          z.object({
            userId: z.string().cuid2(),
          }),
        ),
    )
    .mutation(
      async ({ ctx, input }) =>
        await ctx.db
          .update(personalDetails)
          .set({
            ...input,
            userId: undefined,
            updatedAt: new Date(),
          })
          .where(eq(personalDetails.userId, input.userId)),
    ),
});

export default userRouter;
