import z from "zod";
import { arrayContained, arrayContains, and, asc, eq } from "drizzle-orm";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { TRPCError } from "@trpc/server";
import Cryptr from "cryptr";

import { env } from "~/env";
import { chatRooms, chatMessages } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const chatRouter = createTRPCRouter({
  getActionById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      if (input === ctx.session.user.id)
        throw new TRPCError({ code: "BAD_REQUEST" });

      const room = await ctx.db.query.chatRooms.findFirst({
        where: (chat, { eq }) => eq(chat.id, input),
      });

      if (room) {
        if (!room.members.some((id) => id === ctx.session.user.id))
          throw new TRPCError({ code: "UNAUTHORIZED" });

        return {
          action: "sustain",
          room,
        } as const;
      }

      const userShell = await ctx.db.query.users.findFirst({
        where: (user, { eq }) => eq(user.id, input),
        columns: {
          id: true,
        },
      });

      if (!userShell) return null;

      const relevantRoom = await ctx.db.query.chatRooms.findFirst({
        where: (chat, { and }) =>
          and(
            arrayContains(chat.members, [input, ctx.session.user.id]),
            arrayContained(chat.members, [input, ctx.session.user.id]),
          ),
      });

      if (relevantRoom)
        return {
          action: "redirect",
          href: `/chat/${relevantRoom.id}`,
          room: relevantRoom,
        } as const;

      const [newRoom] = await ctx.db
        .insert(chatRooms)
        .values({
          members: [input, ctx.session.user.id],
        })
        .returning({ id: chatRooms.id });

      if (!newRoom) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return {
        action: "redirect",
        href: `/chat/${newRoom.id}`,
        room: {
          id: newRoom.id,
          members: [input, ctx.session.user.id],
        },
      } as const;
    }),
  getRoomById: protectedProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) =>
      (await ctx.db.query.chatRooms.findFirst({
        where: (chat, { eq }) => eq(chat.id, input),
      })) ?? null,
  ),
  getRoomsByMemberId: protectedProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) =>
      (await ctx.db.query.chatRooms.findMany({
        where: (room) => arrayContains(room.members, [input]),
      })) ?? null,
  ),
  getMessagesByRoomId: protectedProcedure.input(z.string().cuid2()).query(
    async ({ ctx, input }) =>
      (await ctx.db
        .select({
          id: chatMessages.id,
          roomId: chatMessages.roomId,
          authorId: chatMessages.authorId,
          createdAt: chatMessages.createdAt,
          updatedAt: chatMessages.updatedAt,
          content: chatMessages.content,
        })
        .from(chatRooms)
        .where(
          and(
            eq(chatRooms.id, input),
            arrayContains(chatRooms.members, [ctx.session.user.id]),
          ),
        )
        .rightJoin(chatMessages, eq(chatMessages.roomId, input))
        .orderBy(asc(chatMessages.createdAt))) ?? null,
  ),
  getLastMessagesFromMultipleRooms: protectedProcedure
    .input(z.string().cuid2().array())
    .query(async ({ ctx, input }) => {
      const messagePromises = input.map(
        async (id) =>
          await ctx.db.query.chatMessages.findFirst({
            where: (message, { eq }) => eq(message.roomId, id),
            orderBy: (message, { desc }) => desc(message.createdAt),
          }),
      );

      const messages = (await Promise.all(messagePromises)).filter(
        (message) => !!message,
      );
      const cryptoModule = new Cryptr(env.AUTH_SECRET);

      for (const message of messages)
        message.content = cryptoModule.decrypt(message.content);

      return messages;
    }),

  create: protectedProcedure
    .input(createInsertSchema(chatRooms).omit({ id: true }))
    .mutation(
      async ({ ctx, input }) =>
        (
          await ctx.db
            .insert(chatRooms)
            .values({
              ...input,
            })
            .returning({ id: chatRooms.id })
        ).at(0)!.id,
    ),
  update: protectedProcedure
    .input(
      createUpdateSchema(chatRooms).merge(z.object({ id: z.string().cuid2() })),
    )
    .mutation(
      async ({ ctx, input: { id, ...input } }) =>
        await ctx.db.update(chatRooms).set(input).where(eq(chatRooms.id, id)),
    ),
});

export default chatRouter;
