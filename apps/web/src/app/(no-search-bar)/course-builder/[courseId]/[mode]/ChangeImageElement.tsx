"use client";

import { useState } from "react";
import Image from "next/image";
import { useUploadFile } from "better-upload/client";
import { ImageUpIcon, LoaderCircleIcon } from "lucide-react";

import { env } from "~/env";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { type CourseContent } from "~/server/db/schema";
import { useCourseContent } from "./CourseEditor";

type ChangeImageElementProps = {
  element: CourseContent;
};

const ChangeImageElement: React.FC<ChangeImageElementProps> = ({ element }) => {
  const courseContent = useCourseContent();
  const [imageUrl, setImageUrl] = useState(
    element.content ? `/api/cdn/${element.content}` : "",
  );
  const mediaMutation = api.media.create.useMutation();

  const { isPending, upload, reset } = useUploadFile({
    route: "image",
    api: "/api/upload/course-content",
    onUploadError: (error) => {
      console.log(`[UPLOAD_ERROR] ${error.type}\n${error.message}`);
      reset();
    },
    onUploadComplete: ({ file }) => {
      const url = env.NEXT_PUBLIC_AWS_OBJECT_PREFIX + file.objectKey;

      mediaMutation.mutate({
        key: file.objectKey,
        public: true,
        url,
      });

      setImageUrl(`/api/cdn/${file.objectKey}`);
    },
  });

  return (
    <div
      className={cn(
        "group relative min-h-60 w-full overflow-hidden rounded first:[&>label]:hover:opacity-100",
        imageUrl ? "bg-slate-50" : "bg-slate-200",
      )}
    >
      <label
        id="overlay"
        htmlFor="element_image"
        data-loading={isPending || !imageUrl ? "true" : "false"}
        className="absolute z-20 grid h-full w-full cursor-pointer content-center justify-center bg-black/60 font-medium text-white opacity-0 transition-opacity data-[loading=true]:opacity-100"
      >
        {!isPending ? (
          <div className="flex items-center gap-2">
            <span>{imageUrl ? "Change" : "Upload"} Image</span>
            <ImageUpIcon />
          </div>
        ) : (
          <LoaderCircleIcon className="animate-spin" />
        )}
      </label>
      <input
        type="file"
        accept="image/*"
        name="image"
        id="element_image"
        className="sr-only mt-16 ml-8"
        onChange={async (e) => {
          if (e.target.files?.[0]) {
            const uploadFunction = upload.bind(null, e.target.files[0], {
              metadata: {
                elementId: element.id,
                timestamp: Date.now(),
                path: "course-content",
              },
            });

            courseContent.createPendingUpload(element.id, uploadFunction);

            //TODO: figure out temporary image display
            // setImageUrl(await e.target.files[0].text());
          }
        }}
      />
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={""}
          width={1280}
          height={720}
          className="m-auto aspect-auto h-full w-fit transition-[filter] group-hover:blur-xs"
        />
      )}
    </div>
  );
};

export default ChangeImageElement;
