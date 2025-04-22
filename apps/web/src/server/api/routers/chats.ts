import z from "zod";
import { arrayContained, arrayContains, eq } from "drizzle-orm";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { TRPCError } from "@trpc/server";

import { chatRooms, chatMessages } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { chat } from "googleapis/build/src/apis/chat";

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
        .where(arrayContains(chatRooms.members, [ctx.session.user.id]))
        .rightJoin(chatMessages, eq(chatMessages.roomId, input))) ?? null,
  ),
});

export default chatRouter;
