"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useUploadFile } from "better-upload/client";
import {
  ArrowDownToLineIcon,
  FileIcon,
  FileUpIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { buttonVariants } from "@repo/ui/button";

import { env } from "~/env";
import { api } from "~/trpc/react";
import { type CourseContent } from "~/server/db/schema";
import { useCourseContent } from "./CourseEditor";

type ChangeFileElementProps = {
  element: CourseContent;
};

const ChangeFileElement: React.FC<ChangeFileElementProps> = ({ element }) => {
  const courseContent = useCourseContent();
  const fileDetailsQuery = api.media.getByKey.useQuery(element.content);
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState(
    element.content ? `/api/cdn/${element.content}` : "",
  );
  const [invalidUpload, setInvalidUpload] = useState(false);
  const mediaMutation = api.media.create.useMutation();

  useEffect(() => {
    if (fileDetailsQuery.data) setFileName(fileDetailsQuery.data.fileName);
  }, [fileDetailsQuery.isSuccess]);

  const { isPending, upload, reset } = useUploadFile({
    route: "file",
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
        disposition: "attachment",
        url,
      });

      setFileName(file.name);
      courseContent.updateElement(element.id, file.objectKey);
    },
  });

  return (
    <div className="group flex w-full flex-col items-center justify-center gap-y-3">
      <Suspense fallback={<LoaderCircleIcon className="animate-spin" />}>
        {fileName && (
          <Link
            target="_blank"
            href={fileUrl}
            download={fileName}
            className="group/file_display relative flex cursor-pointer items-center gap-x-2 overflow-hidden rounded-lg border p-3"
          >
            <FileIcon />
            <span>{fileName}</span>
            <div className="absolute top-3 left-0 flex h-full w-full translate-y-full items-center justify-center gap-x-1 rounded-t-[40%_30%] bg-red-400 text-white transition-transform *:-mt-3 group-hover/file_display:translate-0">
              <ArrowDownToLineIcon size={20} />
              <span>Download</span>
            </div>
          </Link>
        )}
        <div className="flex flex-col justify-center gap-y-2">
          <label
            id="overlay"
            htmlFor={`element_file_${element.id}`}
            data-loading={isPending ? "true" : "false"}
            className={buttonVariants({
              className: fileName && "hover:bg-slate-100",
              variant: fileName ? "outline" : "default",
            })}
          >
            {!isPending ? (
              <div className="mx-auto flex items-center gap-2">
                <FileUpIcon />
                <span>{fileName ? "Change" : "Upload"} File</span>
              </div>
            ) : (
              <LoaderCircleIcon className="animate-spin" />
            )}
          </label>
          {invalidUpload && (
            <div className="rounded-full bg-red-400 px-2 py-0.5 text-white transition-colors hover:bg-red-500">
              Invalid file uploaded!
            </div>
          )}
        </div>
        <input
          type="file"
          name="file"
          id={`element_file_${element.id}`}
          className="sr-only mt-16 ml-8"
          onChange={async (e) => {
            if (e.target.files?.[0]) {
              if (e.target.files[0].size > 52428800) {
                setFileName("");
                setInvalidUpload(true);
                courseContent.deletePendingUpload(element.id);

                return;
              }

              setFileName(e.target.files[0].name);
              setFileUrl(URL.createObjectURL(e.target.files[0]));
              setInvalidUpload(false);

              const uploadFunction = upload.bind(null, e.target.files[0], {
                metadata: {
                  elementId: element.id,
                  timestamp: Date.now(),
                  path: "course-content",
                },
              });

              courseContent.createPendingUpload(element.id, uploadFunction);
            }
          }}
        />
      </Suspense>
    </div>
  );
};

export default ChangeFileElement;
