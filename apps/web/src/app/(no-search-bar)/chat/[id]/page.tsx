import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Cryptr from "cryptr";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";

import { env } from "~/env";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import ChatInput from "~/components/composites/ChatInput";
import ChatView from "~/components/composites/ChatView";

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

  const { room } = actionInstance;
  const recipients = room.members.filter(
    (memberId) => memberId !== session.user.id,
  );
  const isGroupChat = recipients.length > 1;

  const recipientFootprints =
    await api.users.getMultipleFootprintsById(recipients);

  const initialMessages = await api.chat.getMessagesByRoomId(room.id);
  const cryptoModule = new Cryptr(env.AUTH_SECRET);

  for (const message of initialMessages) {
    message.content = cryptoModule.decrypt(message.content);
  }

  return (
    <main className="container h-full w-full">
      <div className="mx-auto flex h-full overflow-hidden rounded-r-md border-x">
        <div className="h-full p-2">chat list here</div>
        <div className="flex h-full grow flex-col">
          <div
            id="chat_head"
            className="bg-primary/15 w-full rounded-tl-md p-2"
          >
            {isGroupChat ? (
              <div className="group/button_link flex items-center gap-2">
                <Avatar className="border border-slate-300">
                  <AvatarImage src={room.image ?? ""} />
                  <AvatarFallback>
                    {room.title!.at(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h1 className="font-medium group-hover/button_link:underline">
                  {room.title}
                </h1>
              </div>
            ) : (
              <Link
                href={`/${recipientFootprints.at(0)!.username}`}
                className="group/button_link flex items-center gap-2"
              >
                <Avatar className="border border-slate-300">
                  <AvatarImage src={recipientFootprints.at(0)!.image ?? ""} />
                  <AvatarFallback>
                    {recipientFootprints.at(0)!.name.at(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h1 className="font-medium group-hover/button_link:underline">
                  {recipientFootprints.at(0)!.name}
                </h1>
              </Link>
            )}
          </div>
          <div id="chat_content" className="w-full grow *:only:min-h-[70dvh]">
            <ChatView initialMessages={initialMessages} />
          </div>
          <div
            id="chat_input"
            className="bg-primary/15 w-full rounded-bl-md p-4"
          >
            <ChatInput roomId={room.id} session={session} />
          </div>
        </div>
      </div>
    </main>
  );
}
