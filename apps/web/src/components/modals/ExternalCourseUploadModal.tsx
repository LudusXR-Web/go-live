"use client";

import { useEffect, useState } from "react";
import { BlobReader, BlobWriter, ZipReader, getMimeType } from "@zip.js/zip.js";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/alert-dialog";
import { useUploadFiles } from "better-upload/client";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { Button } from "@repo/ui/button";

import { cn } from "~/lib/utils";
import { env } from "~/env";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

const stages = [
  "Reading the Archive",
  "Getting File Data",
  "Uploading Files",
  "Complete",
];
const stageColors = [
  "text-red-500",
  "text-amber-500",
  "text-teal-500",
  "text-green-500",
];
const mimeTypeMap = new Map<string, string>([
  ["html", "text/html"],
  ["gif", "image/gif"],
  ["jpg", "image/jpeg"],
  ["png", "image/png"],
  ["mp4", "video/mp4"],
  ["ttf", "binary/octet-stream"],
  ["woff", "application/font-woff"],
  ["css", "text/css"],
  ["js", "application/javascript"],
]);

type ExternalCourseUploadModalProps = {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  courseId: string;
  shouldDeleteOldFiles?: boolean;
  zipFile?: File;
};

const ExternalCourseUploadModal: React.FC<ExternalCourseUploadModalProps> = ({
  open,
  onOpenChange,
  courseId,
  shouldDeleteOldFiles = false,
  zipFile,
}) => {
  const [stageIdx, setStageIdx] = useState<number>(0);
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [error, setError] = useState("");
  const [tempFiles, setTempFiles] = useState<File[]>();
  const [progress, setProgress] = useState(0);

  const purgeAwsMutation = api.s3.deleteFolderByName.useMutation();
  const courseMutation = api.courses.update.useMutation();

  const router = useRouter();

  const { upload, reset } = useUploadFiles({
    route: "externalContent",
    api: `/api/upload/external-course-contents/${courseId}`,
    sequential: true,
    onUploadProgress: (data) =>
      setProgress(Number((data.progress * 100).toFixed())),
    onUploadError: (error) => {
      console.log(`[UPLOAD_ERROR] ${error.type}\n${error.message}`);
      setError("An error occurred while uploading the files.");
      reset();
    },
    onUploadComplete: ({ files }) => {
      const indexFile = files.find((f) => f.name.endsWith("index.html"));
      if (!indexFile) throw new Error("[UPLOAD ERROR]: No index file found");

      const url = env.NEXT_PUBLIC_AWS_OBJECT_PREFIX + indexFile.objectKey;

      courseMutation.mutate({
        id: courseId,
        external: true,
        externalUrl: url,
      });

      setStageIdx(3);
    },
  });

  useEffect(() => {
    if (!zipFile) return;

    void (async () => {
      const zipFileReader = new BlobReader(zipFile);
      const zipReader = new ZipReader(zipFileReader);
      const entries = await zipReader.getEntries();

      const fileNames = entries.map((v) => v.filename);

      const improperForm = fileNames.some((n) => !n.startsWith("content"));
      const noIndexFile = !fileNames.some((n) => n === "content/index.html");

      if (improperForm || noIndexFile)
        return setError(
          "Invalid data shape. Only external courses created with Articulate Rise 360 are permitted.",
        );

      setStageIdx(1);

      try {
        const fileList = entries.filter((v) => !v.directory);
        const files: File[] = [];

        for (const file of fileList) {
          if (file.filename.endsWith("/")) continue;

          const extension = file.filename.split(".").at(-1)!;

          const blob = await file.getData!(
            new BlobWriter(
              mimeTypeMap.get(extension) ?? getMimeType(extension),
            ),
          );

          files.push(
            new File([blob], file.filename, {
              lastModified: Number(file.rawLastModDate),
              type: mimeTypeMap.get(extension) ?? getMimeType(extension),
            }),
          );
        }

        setTempFiles(files);
      } catch (error) {
        console.error(error as string);

        return setError(
          "An error occurred while reading the files. Try again later.",
        );
      }

      setConfirmationPending(true);
      setStageIdx(2);
    })();
  }, [zipFile]);

  useEffect(() => {
    if (!confirmationPending && stageIdx === 2) {
      if (!tempFiles)
        return setError("An error occurred while uploading the files.");

      try {
        if (shouldDeleteOldFiles)
          purgeAwsMutation.mutate({
            path: `external-course-contents/${courseId}`,
          });

        void upload(tempFiles, {
          metadata: {
            courseId: courseId,
            timestamp: Date.now(),
            path: "external-course-contents",
          },
        });
      } catch {
        return setError("An error occurred while uploading the files.");
      }
    }
  }, [confirmationPending]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Upload an External Course to GoingLive
          </AlertDialogTitle>
          <AlertDialogDescription>
            Do not close this dialog and tab while the files are uploading.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {!confirmationPending && !error && (
          <div
            className={cn(
              stageColors[stageIdx],
              stageIdx < 3 && "animate-pulse",
              "flex flex-col items-center gap-1 text-sm transition-colors",
            )}
          >
            {stageIdx < 3 ? (
              <>
                <div className="relative">
                  <Loader2Icon className="animate-spin" size={128} />
                  {stageIdx === 2 && (
                    <strong className="absolute top-1/2 left-1/2 -translate-1/2 text-base">
                      {progress}%
                    </strong>
                  )}
                </div>
                <strong>{stages[stageIdx]}</strong>
              </>
            ) : (
              <>
                <CheckIcon size={128} />
                <Button
                  className="mt-3"
                  onClick={() => {
                    router.push(`/course-builder/${courseId}/basic`);
                    if (onOpenChange) onOpenChange(false);
                  }}
                >
                  Complete
                </Button>
              </>
            )}
          </div>
        )}

        {error && (
          <>
            <p className="text-center text-red-500">{error}</p>
            <AlertDialogCancel className="hover:bg-muted">
              Return
            </AlertDialogCancel>
          </>
        )}

        {confirmationPending && (
          <>
            <p>Files have been read successfully. Would you like to proceed?</p>
            <div className="ml-auto space-x-2">
              <AlertDialogCancel className="hover:bg-muted">
                Return
              </AlertDialogCancel>
              <Button onClick={() => setConfirmationPending(false)}>
                Upload Course
              </Button>
            </div>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExternalCourseUploadModal;
