"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { type Session } from "next-auth";
import { FilterIcon, PlusIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import { Checkbox } from "@repo/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { Label } from "@repo/ui/label";

import { cn } from "~/lib/utils";
import { useSocket } from "~/lib/socket";
import { api } from "~/trpc/react";
import { type api as serverApi } from "~/trpc/server";
import { type chatRooms } from "~/server/db/schema";
import CreateChatModal from "~/components/modals/CreateChatModal";

type ChatListProps = {
  rooms: (typeof chatRooms.$inferSelect)[];
  footprints: Awaited<
    ReturnType<typeof serverApi.users.getMultipleFootprintsById>
  >;
  session: Session;
  currentRoomId?: string;
};

const ChatList: React.FC<ChatListProps> = ({
  rooms,
  footprints,
  session,
  currentRoomId,
}) => {
  const [chatFilter, setChatFilter] = useState({ private: true, group: true });

  const { socket } = useSocket(session.sessionToken);
  const lastMessagesQuery = api.chat.getLastMessagesFromMultipleRooms.useQuery(
    rooms.map((r) => r.id),
  );

  useEffect(() => {
    for (const room of rooms) socket.emit("room:join", room.id);

    socket.on("message:incoming", () => void lastMessagesQuery.refetch());

    return () => {
      socket.off("message:incoming");
    };
  }, [socket]);

  return (
    <div>
      <div id="head" className="flex justify-between border-b p-2.25">
        <CreateChatModal session={session}>
          <Button variant="outline" size="icon" className="hover:bg-muted">
            <PlusIcon />
          </Button>
        </CreateChatModal>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="hover:bg-muted">
              <FilterIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="space-y-2">
            <div className="flex items-center gap-1">
              <Checkbox
                id="show:private"
                checked={chatFilter.private}
                onCheckedChange={(v) =>
                  setChatFilter((state) => ({
                    ...state,
                    private: v as boolean,
                  }))
                }
              />
              <Label htmlFor="show:private">Direct Chats</Label>
            </div>
            <div className="flex items-center gap-1">
              <Checkbox
                id="show:group"
                checked={chatFilter.group}
                onCheckedChange={(v) =>
                  setChatFilter((state) => ({ ...state, group: v as boolean }))
                }
              />
              <Label htmlFor="show:group">Group Chats</Label>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div id="list">
        {rooms.map((room) => {
          const isCurrentChat = room.id === currentRoomId;
          const isGroupChat = room.members.length > 2 || !!room.title;
          const shouldShow =
            (isGroupChat && chatFilter.group) ||
            (!isGroupChat && chatFilter.private) ||
            isCurrentChat;

          const recipientId = !isGroupChat
            ? room.members.find((id) => id !== session.user.id)
            : null;
          const recipientFootprint = !isGroupChat
            ? footprints.find((f) => f.id === recipientId)
            : null;

          if (!isGroupChat && (!recipientId || !recipientFootprint))
            return <Fragment key={room.id} />;
          if (!shouldShow) return <Fragment key={room.id} />;

          const lastMessage = lastMessagesQuery.data?.find(
            (m) => m.roomId === room.id,
          );
          const lastMessageSliceOpts = lastMessage?.content
            .split("")
            .map((ch, idx) => (ch === " " ? idx : undefined))
            .filter((v) => typeof v === "number");
          const spaceDistancesTo30 = lastMessageSliceOpts?.map((v) =>
            Math.abs(30 - v),
          );
          const minDistanceTo30 = spaceDistancesTo30
            ? Math.min(...spaceDistancesTo30)
            : Infinity;
          const lastMessageShouldSlice = lastMessageSliceOpts?.at(
            spaceDistancesTo30?.indexOf(minDistanceTo30) ?? 0,
          );

          const Comp = isCurrentChat ? "div" : Link;

          return (
            <Comp
              key={room.id}
              href={`/chat/${room.id}`}
              className={cn(
                "flex items-center gap-2 p-3",
                isCurrentChat ? "bg-primary" : "border-b",
              )}
            >
              <Avatar>
                <AvatarImage
                  src={
                    (isGroupChat ? room.image : recipientFootprint!.image) ?? ""
                  }
                />
                <AvatarFallback>
                  {isGroupChat
                    ? room.title!.at(0)!.toUpperCase()
                    : recipientFootprint!.name.at(0)!.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn("select-none", isCurrentChat ? "text-white" : "")}
              >
                <h2>{isGroupChat ? room.title! : recipientFootprint!.name}</h2>
                <span className="text-sm opacity-65">
                  {!!lastMessage?.content && (
                    <>
                      {lastMessage.content.length > 30
                        ? lastMessage.content.slice(
                            0,
                            lastMessageShouldSlice ?? 0,
                          )
                        : lastMessage.content}
                      {lastMessage.content.length > 30 && "..."}
                    </>
                  )}
                </span>
              </div>
            </Comp>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;
