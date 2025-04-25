"use client";

import { useState } from "react";
import Image from "next/image";
import { useUploadFile } from "better-upload/client";
import { ImageUpIcon, LoaderCircleIcon } from "lucide-react";

import { env } from "~/env";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import type { personalDetails } from "~/server/db/schema";

type ChangeProfileBannerProps = {
  personalDetails: typeof personalDetails.$inferSelect;
};

const ChangeProfileBanner: React.FC<ChangeProfileBannerProps> = ({
  personalDetails,
}) => {
  const [imageUrl, setImageUrl] = useState(personalDetails.banner);
  const courseMutation = api.users.updatePersonalDetails.useMutation();
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

      courseMutation.mutate({
        userId: personalDetails.userId,
        banner: `/api/cdn/${file.objectKey}`,
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
    <div
      className={cn(
        "group relative h-60 w-full overflow-hidden rounded first:[&>label]:hover:opacity-100",
        imageUrl ? "bg-slate-50" : "bg-slate-200",
      )}
    >
      <label
        id="overlay"
        htmlFor="profile_banner"
        data-loading={isPending || !imageUrl ? "true" : "false"}
        className="absolute z-20 grid h-full w-full cursor-pointer content-center justify-center bg-black/60 font-medium text-white opacity-0 transition-opacity data-[loading=true]:opacity-100"
      >
        {!isPending ? (
          <div className="flex items-center gap-2">
            <span>{imageUrl ? "Change" : "Upload"} Profile Banner</span>
            <ImageUpIcon />
          </div>
        ) : (
          <LoaderCircleIcon className="animate-spin" />
        )}
      </label>
      <input
        type="file"
        accept="image/*"
        name="banner"
        id="profile_banner"
        className="sr-only mt-16 ml-8"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            if (e.target.files[0].size > 4194304) return;

            void upload(e.target.files[0], {
              metadata: {
                courseId: personalDetails.userId,
                timestamp: Date.now(),
                path: "profile-pictures",
              },
            });
          }
        }}
      />
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={""}
          width={1280}
          height={720}
          className="mx-auto -mt-[20%] w-full transition-[filter] group-hover:blur-xs"
        />
      )}
    </div>
  );
};

export default ChangeProfileBanner;
