import { notFound, redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

type ChatPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;

  if (!id) notFound();

  const session = await auth();

  if (!session) notFound();

  let actionInstance;

  try {
    actionInstance = await api.chat.getActionById(id);
  } catch {
    notFound();
  }

  if (!actionInstance) notFound();

  if (actionInstance.action === "redirect") redirect(actionInstance.href);

  //TODO render chat UI
  return null;
}
