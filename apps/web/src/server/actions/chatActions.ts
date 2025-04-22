import "server-only";

import { db } from "~/server/db";
import { chatMessages } from "~/server/db/schema";

export async function saveMessage(message: typeof chatMessages.$inferInsert) {
  const [partialMessage] = await db
    .insert(chatMessages)
    .values(message)
    .returning({ id: chatMessages.id });

  if (!partialMessage) throw new Error("Message creation failed.");

  return partialMessage.id;
}
