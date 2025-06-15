import { notFound } from "next/navigation";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { SocketOpener } from "~/lib/socket";
import ChatList from "~/components/composites/ChatList";

export default async function CleanChatPage() {
  const session = await auth();

  if (!session) notFound();

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
          />
        </div>
        <div className="flex h-full flex-3 flex-col">
          <div
            id="chat_content"
            className="flex max-h-[80dvh] min-h-[70dvh] w-full grow items-center justify-center border-l"
          >
            <div className="bg-accent/30 hover:bg-accent/20 rounded-full px-3 py-1 transition-colors">
              <p className="text-center text-lg font-medium">
                Select a member or a group to begin chatting!
              </p>
            </div>
          </div>
        </div>
      </div>
      <SocketOpener />
    </main>
  );
}
