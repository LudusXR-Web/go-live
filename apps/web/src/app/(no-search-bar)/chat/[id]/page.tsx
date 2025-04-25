import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Cryptr from "cryptr";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";

import { env } from "~/env";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import ChatInput from "~/components/composites/ChatInput";
import ChatView from "~/components/composites/ChatView";
import ChatList from "~/components/composites/ChatList";
import UpdateGroupDetailsModal from "~/components/modals/UpdateGroupDetailsModal";
import ManageGroupMembersModal from "~/components/modals/ManageGroupMembersModal";
import { UserIcon } from "lucide-react";

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
  const isGroupChat = room.members.length > 2 || !!room.title;

  const initialMessages = await api.chat.getMessagesByRoomId(room.id);
  const cryptoModule = new Cryptr(env.AUTH_SECRET);

  for (const message of initialMessages)
    message.content = cryptoModule.decrypt(message.content);

  const recipients = initialMessages.length
    ? [
        ...new Set(
          initialMessages
            .map((m) => m.authorId)
            .filter((memberId) => memberId !== session.user.id),
        ),
      ]
    : room.members.filter((memberId) => memberId !== session.user.id);

  const recipientFootprints =
    await api.users.getMultipleFootprintsById(recipients);

  const chatList = await api.chat.getRoomsByMemberId(session.user.id);
  const chatListFootprints = await api.users.getMultipleFootprintsById([
    ...chatList.reduce((acc, curr) => {
      for (const member of curr.members) acc.add(member);
      return acc;
    }, new Set<string>()),
  ]);

  return (
    <main className="container h-full w-full">
      <div className="mx-auto flex h-full overflow-hidden rounded-r-md border-x">
        <div className="h-full flex-1">
          <ChatList
            rooms={chatList}
            footprints={chatListFootprints}
            session={session}
            currentRoomId={id}
          />
        </div>
        <div className="flex h-full flex-3 flex-col">
          <div
            id="chat_head"
            className="bg-primary/15 flex w-full justify-between gap-2 rounded-tl-md p-2 shadow-md *:first:grow"
          >
            {isGroupChat ? (
              <>
                <UpdateGroupDetailsModal room={room}>
                  <div className="hover:bg-primary/20 flex cursor-pointer items-center gap-2 rounded-md transition-all hover:shadow-md">
                    <Avatar className="border border-slate-300">
                      <AvatarImage src={room.image ?? ""} />
                      <AvatarFallback>
                        {room.title!.at(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h1 className="font-medium">{room.title}</h1>
                  </div>
                </UpdateGroupDetailsModal>
                <ManageGroupMembersModal room={room} session={session}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/20 transition-all hover:shadow-md"
                  >
                    <UserIcon />
                  </Button>
                </ManageGroupMembersModal>
              </>
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
          <div
            id="chat_content"
            className="w-full grow *:only:max-h-[80dvh] *:only:min-h-[70dvh]"
          >
            <ChatView
              initialMessages={initialMessages}
              session={session}
              memberFootprints={recipientFootprints}
              isGroupChat={isGroupChat}
            />
          </div>
          <div
            id="chat_input"
            className="bg-primary/15 w-full rounded-bl-md p-4 shadow-md"
          >
            <ChatInput roomId={room.id} session={session} />
          </div>
        </div>
      </div>
    </main>
  );
}
