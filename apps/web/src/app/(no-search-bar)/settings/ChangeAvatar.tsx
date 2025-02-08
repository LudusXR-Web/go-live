"use client";

import { useState } from "react";
import { type Session } from "next-auth";
import { useUploadFile } from "better-upload/client";
import { ImageUpIcon, LoaderCircleIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";

import { api } from "~/trpc/react";
import { env } from "~/env";

type ChangeAvatarProps = {
  user: Session["user"];
};

const ChangeAvatar: React.FC<ChangeAvatarProps> = ({ user }) => {
  const [avatarUrl, setAvatarUrl] = useState(user.image);
  const mutation = api.users.update.useMutation();

  const { isPending, upload, reset } = useUploadFile({
    route: "image",
    api: "/api/upload/profile-pictures",
    onUploadError: (error) => {
      console.log(`[UPLOAD_ERROR] ${error.type}\n${error.message}`);
      reset();
    },
    onUploadComplete: ({ file }) => {
      mutation.mutate({
        id: user.id,
        image: env.NEXT_PUBLIC_AWS_OBJECT_PREFIX + file.objectKey,
      });

      setAvatarUrl(env.NEXT_PUBLIC_AWS_OBJECT_PREFIX + file.objectKey);
    },
  });

  return (
    <div>
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
              upload(e.target.files[0], {
                metadata: {
                  userId: user.id,
                  timestamp: Date.now(),
                  path: "avatar-images",
                },
              });
            }
          }}
        />
        <AvatarImage
          src={avatarUrl ?? undefined}
          alt="Profile Avatar Image"
          className="transition-[filter] group-hover:blur-xs"
        />
        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default ChangeAvatar;
