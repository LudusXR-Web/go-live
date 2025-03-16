"use client";

import Image from "next/image";
import { create } from "zustand";
import { useUploadFile } from "better-upload/client";
import { createId } from "@paralleldrive/cuid2";
import {
  ImageIcon,
  PaperclipIcon,
  XCircleIcon,
  ZoomInIcon,
} from "lucide-react";
import { toggleVariants } from "@repo/ui/toggle";
import { Button } from "@repo/ui/button";

import { env } from "~/env";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { type contentDispositionEnum } from "~/server/db/schema";
import { exposedRevalidatePath as revalidatePath } from "~/server/actions/exposedRevalidate";
import RichEditor, {
  useCustomEditor,
} from "~/components/composites/RichEditor";
import FileView from "~/components/media-display/FileView";
import LargeFileWarning from "~/components/modals/LargeFileWarning";
import ImageZoom from "~/components/modals/ImageZoom";

type PendingUpload = {
  id: string;
  fileName: string;
  tempUrl: string;
  disposition: (typeof contentDispositionEnum.enumValues)[number];
  execute: () => Promise<void> | void;
};

type PostAttachmentsState = {
  fileSizeError: boolean;
  uploadInProgress: boolean;
  pendingUploads: PendingUpload[];
  uploadedFiles: string[];
};

type PostAttachmentsActions = {
  toggleFileSizeError: (newState?: boolean) => void;
  toggleUploadInProgress: (newState?: boolean) => void;

  createPendingUpload: (pendingUpload: PendingUpload) => void;
  deletePendingUpload: (id: string) => void;
  clearPendingUploads: () => void;

  addUploadedFile: (id: string) => void;
  clearUploadedFiles: () => void;
};

type PostAttachments = PostAttachmentsState & PostAttachmentsActions;

const usePostAttachments = create<PostAttachments>((set) => ({
  fileSizeError: false,
  uploadInProgress: false,
  pendingUploads: [] as PendingUpload[],
  uploadedFiles: [] as string[],

  toggleFileSizeError(newState) {
    return set((state) => ({
      fileSizeError: newState ?? !state.fileSizeError,
    }));
  },
  toggleUploadInProgress(newState) {
    return set((state) => ({
      uploadInProgress: newState ?? !state.uploadInProgress,
    }));
  },

  createPendingUpload(pendingUpload) {
    return set((state) => {
      const uploadIdx = state.pendingUploads.findIndex(
        (u) => u.id === pendingUpload.id,
      );

      if (uploadIdx >= 0) {
        state.pendingUploads.splice(uploadIdx, 1, pendingUpload);
      } else {
        state.pendingUploads.push(pendingUpload);
      }

      return {
        pendingUploads: state.pendingUploads,
      };
    });
  },
  deletePendingUpload(id) {
    return set((state) => {
      const uploadIdx = state.pendingUploads.findIndex((u) => u.id === id);

      if (uploadIdx < 0) return {};

      state.pendingUploads.splice(uploadIdx, 1);

      return {
        pendingUploads: state.pendingUploads,
      };
    });
  },
  clearPendingUploads() {
    return set({ pendingUploads: [] });
  },

  addUploadedFile(id) {
    return set((state) => {
      const isAlreadyInList = state.uploadedFiles.some((f) => f === id);

      if (isAlreadyInList) {
        return {};
      }

      state.uploadedFiles.push(id);

      return {
        uploadedFiles: state.uploadedFiles,
      };
    });
  },
  clearUploadedFiles() {
    return set({ uploadedFiles: [] });
  },
}));

const CreatePostForm: React.FC = () => {
  const editor = useCustomEditor();
  const attachments = usePostAttachments();
  const postMutation = api.posts.create.useMutation({
    onSuccess() {
      editor!.commands.clearContent(true);
      attachments.clearPendingUploads();

      revalidatePath("/profile");
    },
  });

  async function publishPost() {
    attachments.toggleUploadInProgress(true);

    for (const upload of attachments.pendingUploads) {
      await upload.execute();
    }

    postMutation.mutate({
      content: editor!.getHTML(),
      attachments: attachments.uploadedFiles,
    });

    attachments.toggleUploadInProgress(false);
  }

  return (
    <form
      className="border-b-primary rounded-none border-x border-b"
      onSubmit={(e) => {
        e.preventDefault();
        publishPost();
      }}
    >
      <RichEditor
        customEditor={editor}
        className="rounded-none border-0 px-1 py-2.5"
      />
      <div
        id="attachments-display"
        className={cn(
          attachments.pendingUploads.filter(
            (a) => a.disposition === "attachment",
          ).length
            ? "space-y-6"
            : "",
        )}
      >
        <div id="images" className="flex flex-wrap gap-x-6 gap-y-2 px-2">
          {attachments.pendingUploads
            .filter((a) => a.disposition === "inline")
            .map((file) => (
              <div
                key={file.id}
                className="group/image_display relative flex h-20 w-30 cursor-pointer items-center justify-center overflow-hidden rounded-xl text-white"
              >
                <button
                  type="button"
                  onClick={() => attachments.deletePendingUpload(file.id)}
                  className="peer/close_button absolute top-1 right-1 z-20 cursor-pointer"
                >
                  <XCircleIcon size={20} />
                </button>
                <ImageZoom image={file.tempUrl} fileName={file.fileName}>
                  <button type="button" className="z-10">
                    <div className="absolute inset-0 -z-10 flex h-full w-full items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover/image_display:opacity-100 peer-hover/close_button:opacity-0">
                      <ZoomInIcon />
                    </div>
                    <Image
                      src={file.tempUrl}
                      alt=""
                      className="absolute inset-0 -z-20 h-full w-auto blur-xs"
                      width={128}
                      height={80}
                    />
                  </button>
                </ImageZoom>
              </div>
            ))}
        </div>
        <div id="attachments" className="flex flex-wrap gap-x-6 gap-y-2 px-2">
          {attachments.pendingUploads
            .filter((a) => a.disposition === "attachment")
            .map((file) => (
              <FileView
                key={file.id}
                name={file.fileName}
                href={file.tempUrl}
                removeFile={attachments.deletePendingUpload.bind(null, file.id)}
              />
            ))}
        </div>
      </div>
      <div
        id="bottom-buttons"
        className="flex justify-between py-2 pr-1.5 pl-1"
      >
        <div className="flex items-center gap-1 divide-x">
          <div className="space-x-1 pr-1">
            <Button
              asChild
              type="button"
              variant="ghost"
              className={toggleVariants({
                size: "sm",
              })}
            >
              <label htmlFor="post_image">
                <span className="sr-only">Attach image</span>
                <ImageIcon />
              </label>
            </Button>
            <Button
              asChild
              type="button"
              variant="ghost"
              className={toggleVariants({
                size: "sm",
              })}
            >
              <label htmlFor="post_file">
                <span className="sr-only">Attach file</span>
                <PaperclipIcon />
              </label>
            </Button>
          </div>
          {/* space for additional buttons here */}
        </div>
        <Button
          type="submit"
          className="rounded-full font-medium"
          disabled={
            !editor?.getText().length ||
            postMutation.isPending ||
            attachments.uploadInProgress
          }
        >
          Post
        </Button>
      </div>

      {/* Hidden Inputs */}
      <FileUploader />
      <ImageUploader />

      {/* Upload Error Display */}
      <LargeFileWarning
        open={attachments.fileSizeError}
        onOpenChange={attachments.toggleFileSizeError}
      />
    </form>
  );
};

const ImageUploader: React.FC = () => {
  const attachments = usePostAttachments();
  const mediaMutation = api.media.create.useMutation();

  const { upload, reset } = useUploadFile({
    route: "image",
    api: "/api/upload/post-contents",
    onUploadBegin: () => attachments.toggleUploadInProgress(true),
    onUploadSettled: () => {
      if (!attachments.pendingUploads.length)
        attachments.toggleUploadInProgress(false);
    },

    onUploadError: (error) => {
      console.log(`[UPLOAD_ERROR] ${error.type}\n${error.message}`);
      reset();
    },
    onUploadComplete: ({ file }) => {
      const url = env.NEXT_PUBLIC_AWS_OBJECT_PREFIX + file.objectKey;

      mediaMutation.mutate({
        fileName: file.name,
        key: file.objectKey,
        public: true,
        disposition: "inline",
        url,
      });

      attachments.addUploadedFile(file.objectKey);
    },
  });

  return (
    <input
      type="file"
      accept="image/*"
      name="post_image"
      id="post_image"
      className="sr-only"
      onChange={(e) => {
        if (e.target.files?.[0]) {
          const fileReader = new FileReader();

          console.log("UPLOADING IMAGE");

          const id = createId();
          const name = e.target.files[0].name;
          const uploadFunction = upload.bind(null, e.target.files[0], {
            metadata: {
              timestamp: Date.now(),
              path: "post-contents",
              disposition: "inline",
            },
          });

          fileReader.onload = () => {
            const result = fileReader.result as string;

            if (
              !result.startsWith("data:image") ||
              e.target.files![0]!.size > 4194304
            ) {
              attachments.toggleFileSizeError(true);
              return;
            }

            attachments.createPendingUpload({
              id,
              fileName: name,
              tempUrl: result,
              disposition: "inline",
              execute: uploadFunction,
            });
          };

          fileReader.readAsDataURL(e.target.files[0]);
        }
      }}
    />
  );
};

const FileUploader: React.FC = () => {
  const attachments = usePostAttachments();
  const mediaMutation = api.media.create.useMutation();

  const { upload, reset } = useUploadFile({
    route: "file",
    api: "/api/upload/post-contents",
    onUploadBegin: () => attachments.toggleUploadInProgress(true),
    onUploadSettled: () => {
      if (!attachments.pendingUploads.length)
        attachments.toggleUploadInProgress(false);
    },

    onUploadError: (error) => {
      console.log(`[UPLOAD_ERROR] ${error.type}\n${error.message}`);
      reset();
    },
    onUploadComplete: ({ file }) => {
      const url = env.NEXT_PUBLIC_AWS_OBJECT_PREFIX + file.objectKey;

      mediaMutation.mutate({
        fileName: file.name,
        key: file.objectKey,
        public: true,
        disposition: "attachment",
        url,
      });

      attachments.addUploadedFile(file.objectKey);
    },
  });

  return (
    <input
      type="file"
      name="post_file"
      id="post_file"
      className="sr-only"
      onChange={(e) => {
        if (e.target.files?.[0]) {
          if (e.target.files[0].size > 52428800) {
            attachments.toggleFileSizeError(true);
            return;
          }

          const id = createId();
          const url = URL.createObjectURL(e.target.files[0]);
          const uploadFunction = upload.bind(null, e.target.files[0], {
            metadata: {
              timestamp: Date.now(),
              path: "post-contents",
              disposition: "attachment",
            },
          });

          attachments.createPendingUpload({
            id,
            fileName: e.target.files[0].name,
            tempUrl: url,
            disposition: "attachment",
            execute: uploadFunction,
          });
        }
      }}
    />
  );
};

export default CreatePostForm;
