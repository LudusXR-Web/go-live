"use client";

import { useEffect, useState } from "react";
import { BlobReader, BlobWriter, TextWriter, ZipReader } from "@zip.js/zip.js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/alert-dialog";
import { CheckIcon, Loader2Icon } from "lucide-react";

import { cn } from "~/lib/utils";

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

type ExternalCourseUploadModalProps = {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  zipFile?: File;
};

const ExternalCourseUploadModal: React.FC<ExternalCourseUploadModalProps> = ({
  open,
  onOpenChange,
  zipFile,
}) => {
  const [stageIdx, setStageIdx] = useState<number>(0);
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!zipFile) return;

    (async () => {
      const zipFileReader = new BlobReader(zipFile);
      const fileWriter = new BlobWriter();
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
        const filePromises = entries.map(async (v) => {
          await v.getData!(fileWriter);
          return await fileWriter.getData();
        });
        const blobs = await Promise.all(filePromises);
        const files = new Map<string, Blob>();

        for (const blob of blobs)
          files.set(fileNames.at(blobs.indexOf(blob))!, blob);
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
      // do uploads
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
              "relative flex flex-col items-center gap-1 text-sm transition-colors",
            )}
          >
            {stageIdx < 3 ? (
              <>
                <Loader2Icon className="animate-spin" size={128} />
                <strong>{stages[stageIdx]}</strong>
              </>
            ) : (
              <>
                <CheckIcon size={128} />
                <strong>{stages[stageIdx]}</strong>
              </>
            )}
          </div>
        )}

        {error && (
          <>
            <p className="text-center text-red-500">{error}</p>
            <AlertDialogCancel>Return</AlertDialogCancel>
          </>
        )}

        {confirmationPending && (
          <>
            <p>
              Files have been successfully read. Would you like to continue?
            </p>
            <div>
              <AlertDialogCancel>Return</AlertDialogCancel>
              <AlertDialogAction>Upload Course</AlertDialogAction>
            </div>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExternalCourseUploadModal;
