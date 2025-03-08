"use client";

import { type HTMLAttributes, useState } from "react";
import { type Session } from "next-auth";
import { useUploadFile } from "better-upload/client";
import { ImageUpIcon, LoaderCircleIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";

import { api } from "~/trpc/react";
import { env } from "~/env";

type ChangeAvatarProps = HTMLAttributes<HTMLDivElement> & {
  user: Session["user"];
};

const ChangeAvatar: React.FC<ChangeAvatarProps> = ({ user, ...props }) => {
  const [avatarUrl, setAvatarUrl] = useState(user.image);
  const userMutation = api.users.update.useMutation();
  const mediaMutation = api.media.create.useMutation();

  const { isPending, upload, reset } = useUploadFile({
    route: "image",
    api: "/api/upload/profile-pictures",
    onUploadError: (error) => {
      console.log(`[UPLOAD_ERROR] ${error.type}\n${error.message}`);
      reset();
    },
    onUploadComplete: ({ file }) => {
      const url = env.NEXT_PUBLIC_AWS_OBJECT_PREFIX + file.objectKey;

      userMutation.mutate({
        id: user.id,
        image: url,
      });

      mediaMutation.mutate({
        fileName: file.name,
        key: file.objectKey,
        public: true,
        url,
      });

      setAvatarUrl(url);
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

              upload(e.target.files[0], {
                metadata: {
                  userId: user.id,
                  timestamp: Date.now(),
                  path: "profile-pictures",
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
