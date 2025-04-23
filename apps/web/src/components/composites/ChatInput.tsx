"use client";

import { useRef } from "react";
import { type Session } from "next-auth";
import { SendHorizonalIcon } from "lucide-react";

import { useSocket } from "~/lib/socket";

type ChatInputProps = {
  roomId: string;
  session: Session;
};

const ChatInput: React.FC<ChatInputProps> = ({ roomId, session }) => {
  const { socket } = useSocket(session.sessionToken);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      className="flex items-center overflow-hidden rounded-md bg-white pr-3"
      onSubmit={(e) => {
        e.preventDefault();

        const message = inputRef.current?.value.trim();

        if (!message) return;
        e.currentTarget.reset();

        socket.emit("message:new", {
          roomId,
          authorId: session.user.id,
          content: message,
          createdAt: Date.now(),
        });
      }}
    >
      <input
        ref={inputRef}
        className="grow p-2 focus-visible:outline-0"
        placeholder="Message"
      />
      <button
        type="submit"
        className="cursor-pointer rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100"
      >
        <SendHorizonalIcon />
      </button>
    </form>
  );
};

export default ChatInput;
