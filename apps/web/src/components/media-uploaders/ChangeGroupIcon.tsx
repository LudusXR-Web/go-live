"use client";

import { type HTMLAttributes, useState } from "react";
import { useUploadFile } from "better-upload/client";
import { ImageUpIcon, LoaderCircleIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";

import { api } from "~/trpc/react";
import { env } from "~/env";
import type { chatRooms } from "~/server/db/schema";

const groupIconStyles = [
  "bg-red-400 text-white",
  "bg-amber-400 text-white",
  "bg-violet-500 text-white",
  "bg-green-400 text-white",
];

type ChangeGroupIconProps = HTMLAttributes<HTMLDivElement> & {
  room: typeof chatRooms.$inferSelect;
};

const ChangeGroupIcon: React.FC<ChangeGroupIconProps> = ({
  room,
  ...props
}) => {
  const [imageUrl, setImageUrl] = useState(room.image);
  const chatRoomMutation = api.chat.update.useMutation();
  const mediaMutation = api.media.create.useMutation();

  const { isPending, upload, reset } = useUploadFile({
    route: "image",
    api: "/api/upload/group-images",
    onUploadError: (error) => {
      console.log(`[UPLOAD_ERROR] ${error.type}\n${error.message}`);
      reset();
    },
    onUploadComplete: ({ file }) => {
      const url = env.NEXT_PUBLIC_AWS_OBJECT_PREFIX + file.objectKey;

      chatRoomMutation.mutate({
        id: room.id,
        image: `/api/cdn/${file.objectKey}`,
      });

      mediaMutation.mutate({
        fileName: file.name,
        key: file.objectKey,
        public: true,
        url,
      });

      setImageUrl(url);
    },
  });

  return (
    <div {...props}>
      <Avatar className="group size-40 border first:[&>label]:hover:opacity-100">
        <label
          id="overlay"
          htmlFor="avatar_image"
          data-loading={isPending ? "true" : "false"}
          className="absolute z-20 grid h-full w-full cursor-pointer content-center justify-center rounded-full bg-black/60 font-medium text-white opacity-0 transition-opacity data-[loading=true]:opacity-100"
        >
          {!isPending ? (
            <div className="flex items-center gap-2">
              <span>Change</span>
              <ImageUpIcon />
            </div>
          ) : (
            <LoaderCircleIcon className="animate-spin" />
          )}
        </label>
        <input
          type="file"
          accept="image/*"
          name="avatar"
          id="avatar_image"
          className="sr-only mt-16 ml-8"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              if (e.target.files[0].size > 4194304) return;

              void upload(e.target.files[0], {
                metadata: {
                  userId: room.id,
                  timestamp: Date.now(),
                  path: "group-images",
                },
              });
            }
          }}
        />
        <AvatarImage
          src={imageUrl ?? undefined}
          alt={`${room.title!} Group Icon`}
          className="transition-[filter] group-hover:blur-xs"
        />
        <AvatarFallback
          className={groupIconStyles.at(
            Math.floor(Math.random() * groupIconStyles.length),
          )}
        >
          {room.title!.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default ChangeGroupIcon;
