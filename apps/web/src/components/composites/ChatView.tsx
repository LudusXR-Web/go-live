"use client";

import { Fragment, useEffect, useRef } from "react";
import { type Session } from "next-auth";
import { create } from "zustand";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { ScrollArea } from "@repo/ui/scroll-area";

import { type api as serverApi } from "~/trpc/server";
import { type chatMessages } from "~/server/db/schema";
import { useSocket } from "~/lib/socket";
import { cn, formatDateNoYear, formatTime } from "~/lib/utils";

type Message = typeof chatMessages.$inferSelect;

interface ChatState {
  messages: Message[];
}
interface ChatActions {
  loadMessages: (initialMessages: Message[]) => void;
  addMessage: (message: Message) => void;
}

type Chat = ChatState & ChatActions;

const useChat = create<Chat>((set) => ({
  messages: [],

  loadMessages(initialMessages) {
    return set(() => ({ messages: initialMessages }));
  },
  addMessage(message) {
    return set((state) => ({
      messages: !state.messages.some((m) => m.id === message.id)
        ? [...state.messages, message]
        : state.messages,
    }));
  },
}));

type ChatViewProps = {
  initialMessages: Message[];
  session: Session;
  memberFootprints: Awaited<
    ReturnType<typeof serverApi.users.getMultipleFootprintsById>
  >;
  isGroupChat?: boolean;
};

const ChatView: React.FC<ChatViewProps> = ({
  initialMessages,
  session,
  memberFootprints,
  isGroupChat = false,
}) => {
  const { socket } = useSocket(session.sessionToken);
  const chat = useChat();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chat.loadMessages(initialMessages);
    containerRef.current!.scrollIntoView(false);

    socket.on("message:incoming", (message: Message) => {
      chat.addMessage({
        ...message,
        createdAt: new Date(message.createdAt),
        updatedAt: new Date(message.createdAt),
      });
    });
  }, []);

  useEffect(() => {
    containerRef.current!.scrollIntoView(false);
  }, [chat.messages]);

  return (
    <ScrollArea className="h-[70dvh] w-full border-l">
      <div ref={containerRef} className="flex flex-col scroll-smooth px-4 py-3">
        {chat.messages.map((message, idx, arr) => {
          const isOwnMessage = message.authorId === session.user.id;
          const isNewDay =
            idx === 0 ||
            arr.at(idx - 1)!.createdAt.getDate() !==
              message.createdAt.getDate();

          const shouldGroupToNext =
            idx !== arr.length - 1 &&
            message.authorId === arr.at(idx + 1)!.authorId &&
            Math.abs(+message.createdAt - +arr.at(idx + 1)!.createdAt) <=
              1000 * 60 * 5;

          const showAvatar = !shouldGroupToNext && !isOwnMessage && isGroupChat;
          const shiftMessage =
            shouldGroupToNext && !isOwnMessage && isGroupChat;

          const authorFootprint = memberFootprints.find(
            (m) => m.id === message.authorId,
          );

          return (
            <Fragment key={message.id}>
              {isNewDay && (
                <div className="text-muted-foreground bg-muted mb-2 w-fit self-center rounded-full px-4 py-0.5 text-xs">
                  {formatDateNoYear(message.createdAt)}
                </div>
              )}
              <div
                className={cn(
                  "flex w-fit flex-col gap-0.5",
                  isOwnMessage
                    ? "items-end self-end"
                    : "items-start self-start",
                  shouldGroupToNext ? "mb-1" : "mb-3",
                )}
              >
                <div className="flex items-center gap-2">
                  {showAvatar && (
                    <Avatar>
                      <AvatarImage src={authorFootprint?.image ?? ""} />
                      <AvatarFallback>
                        {authorFootprint?.name.at(0)!.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-md px-2 py-0.75",
                      isOwnMessage ? "bg-primary/25" : "bg-accent/25",
                      shiftMessage ? "ml-12" : "",
                    )}
                  >
                    <p className="space-x-2">
                      <span>{message.content}</span>
                      {!shouldGroupToNext && (
                        <span className="text-muted-foreground text-[0.6rem]">
                          {formatTime(message.createdAt)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ChatView;
