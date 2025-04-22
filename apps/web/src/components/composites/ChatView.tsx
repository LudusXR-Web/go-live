"use client";

import { ScrollArea } from "@repo/ui/scroll-area";

import { chatMessages } from "~/server/db/schema";

type ChatViewProps = {
  initialMessages: (typeof chatMessages.$inferSelect)[];
};

const ChatView: React.FC<ChatViewProps> = ({ initialMessages }) => {
  return (
    <ScrollArea className="h-full border-l">
      {initialMessages.map((message) => {
        return <div key={message.id}>{message.content}</div>;
      })}
    </ScrollArea>
  );
};

export default ChatView;
