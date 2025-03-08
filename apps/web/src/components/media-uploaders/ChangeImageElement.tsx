"use client";

import { useState } from "react";
import Image from "next/image";
import { useUploadFile } from "better-upload/client";
import { ImageUpIcon, LoaderCircleIcon } from "lucide-react";

import { env } from "~/env";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { type CourseContent } from "~/server/db/schema";
import { useCourseContent } from "~/components/composites/CourseEditor";

type ChangeImageElementProps = {
  element: CourseContent;
};

const ChangeImageElement: React.FC<ChangeImageElementProps> = ({ element }) => {
  const courseContent = useCourseContent();
  const [imageUrl, setImageUrl] = useState(
    element.content ? `/api/cdn/${element.content}` : "",
  );
  const [invalidUpload, setInvalidUpload] = useState(false);
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
        fileName: file.name,
        key: file.objectKey,
        public: false,
        url,
      });

      setImageUrl(`/api/cdn/${file.objectKey}`);
      courseContent.updateElement(element.id, file.objectKey);
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
        htmlFor={`element_image_${element.id}`}
        data-loading={isPending || !imageUrl ? "true" : "false"}
        className="absolute z-20 grid h-full w-full cursor-pointer content-center justify-center bg-black/60 font-medium text-white opacity-0 transition-opacity data-[loading=true]:opacity-100"
      >
        {!isPending ? (
          <div className="flex flex-col justify-center gap-y-2">
            <div className="mx-auto flex items-center gap-2">
              <span>{imageUrl ? "Change" : "Upload"} Image</span>
              <ImageUpIcon />
            </div>
            {invalidUpload && (
              <div className="rounded-full bg-red-400 px-2 py-0.5 text-white transition-colors hover:bg-red-500">
                Invalid image file uploaded!
              </div>
            )}
          </div>
        ) : (
          <LoaderCircleIcon className="animate-spin" />
        )}
      </label>
      <input
        type="file"
        accept="image/*"
        name="image"
        id={`element_image_${element.id}`}
        className="sr-only mt-16 ml-8"
        onChange={async (e) => {
          if (e.target.files?.[0]) {
            let uploadSuccess = true;
            const fileReader = new FileReader();

            fileReader.onload = () => {
              const result = fileReader.result as string;

              if (
                !result.startsWith("data:image") ||
                e.target.files![0]!.size > 4194304
              ) {
                setImageUrl("");
                setInvalidUpload(true);
                uploadSuccess = false;
                courseContent.deletePendingUpload(element.id);

                return;
              }

              setImageUrl((fileReader.result as string) ?? "");
              setInvalidUpload(false);
            };

            fileReader.readAsDataURL(e.target.files[0]);

            if (uploadSuccess) {
              const uploadFunction = upload.bind(null, e.target.files[0], {
                metadata: {
                  elementId: element.id,
                  timestamp: Date.now(),
                  path: "course-content",
                },
              });

              courseContent.createPendingUpload(element.id, uploadFunction);
            }
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
