"use client";

import { useState } from "react";
import Image from "next/image";
import { useUploadFile } from "better-upload/client";
import { ImageUpIcon, LoaderCircleIcon } from "lucide-react";

import { env } from "~/env";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { courses } from "~/server/db/schema";

type ChangeCourseBannerProps = {
  course: typeof courses.$inferSelect;
};

const ChangeCourseBanner: React.FC<ChangeCourseBannerProps> = ({ course }) => {
  const [imageUrl, setImageUrl] = useState(course.image);
  const mutation = api.courses.update.useMutation();

  const { isPending, upload, reset } = useUploadFile({
    route: "image",
    api: "/api/upload/course-banners",
    onUploadError: (error) => {
      console.log(`[UPLOAD_ERROR] ${error.type}\n${error.message}`);
      reset();
    },
    onUploadComplete: ({ file }) => {
      mutation.mutate({
        id: course.id,
        image: env.NEXT_PUBLIC_AWS_OBJECT_PREFIX + file.objectKey,
      });

      setImageUrl(env.NEXT_PUBLIC_AWS_OBJECT_PREFIX + file.objectKey);
    },
  });

  return (
    <div
      className={cn(
        "group relative h-60 w-full overflow-hidden rounded hover:[&>label]:first:opacity-100",
        imageUrl ? "bg-slate-50" : "bg-slate-200",
      )}
    >
      <label
        id="overlay"
        htmlFor="course_banner"
        data-loading={isPending || !imageUrl ? "true" : "false"}
        className="absolute z-20 grid h-full w-full cursor-pointer content-center justify-center bg-black/60 font-medium text-white opacity-0 transition-opacity data-[loading=true]:opacity-100"
      >
        {!isPending ? (
          <div className="flex items-center gap-2">
            <span>{imageUrl ? "Change" : "Upload"} Course Banner</span>
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
        id="course_banner"
        className="sr-only ml-8 mt-16"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            upload(e.target.files[0], {
              metadata: {
                userId: course.id,
                timestamp: Date.now(),
                path: "course-banners",
              },
            });
          }
        }}
      />
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={course.title}
          width={1280}
          height={720}
          className="m-auto h-full w-fit transition-[filter] group-hover:blur-sm"
        />
      )}
    </div>
  );
};

export default ChangeCourseBanner;
