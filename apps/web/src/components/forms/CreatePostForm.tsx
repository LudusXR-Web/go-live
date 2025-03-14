"use client";

import { ImageIcon, PaperclipIcon } from "lucide-react";
import { useUploadFile } from "better-upload/client";
import { toggleVariants } from "@repo/ui/toggle";
import { Button } from "@repo/ui/button";

import { env } from "~/env";
import { api } from "~/trpc/react";
import { type contentDispositionEnum } from "~/server/db/schema";
import RichEditor, {
  useCustomEditor,
} from "~/components/composites/RichEditor";

type PendingUpload = {
  id: string;
  fileName: string;
  disposition: (typeof contentDispositionEnum.enumValues)[number];
  tempUrl: string;
  execute: () => Promise<void> | void;
};

type PostAttachmentsState = {
  pendingUploads: PendingUpload[];
  createPendingUpload: (
    id: string,
    uploadFunction: () => Promise<void> | void,
  ) => void;
  deletePendingUpload: (id: string) => void;
  clearPendingUploads: () => void;
};

const CreatePostForm: React.FC = () => {
  const editor = useCustomEditor();
  const postMutation = api.posts.create.useMutation({
    onSuccess() {
      editor!.commands.clearContent(true);
    },
  });
  const mediaMutation = api.media.create.useMutation();

  const {
    isPending: isUploadPending,
    upload,
    reset,
  } = useUploadFile({
    route: "image",
    api: "/api/upload/post-contents",
    onUploadError: (error) => {
      console.log(`[UPLOAD_ERROR] ${error.type}\n${error.message}`);
      reset();
    },
    onUploadComplete: ({ file, metadata }) => {
      const url = env.NEXT_PUBLIC_AWS_OBJECT_PREFIX + file.objectKey;

      mediaMutation.mutate({
        fileName: file.name,
        key: file.objectKey,
        public: true,
        disposition:
          metadata.disposition as (typeof contentDispositionEnum.enumValues)[number],
        url,
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        postMutation.mutate({
          content: editor!.getHTML(),
        });
      }}
      className="border-b-primary rounded-none border-x border-b"
    >
      <RichEditor
        customEditor={editor}
        className="rounded-none border-0 px-1 py-2.5"
      />
      <div className="flex justify-between py-2 pr-1.5 pl-1">
        <div className="flex items-center gap-1 divide-x">
          <div className="space-x-1 pr-1">
            <Button
              variant="ghost"
              className={toggleVariants({
                size: "sm",
              })}
            >
              <ImageIcon />
            </Button>
            <Button
              variant="ghost"
              className={toggleVariants({
                size: "sm",
              })}
            >
              <PaperclipIcon />
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
            isUploadPending
          }
        >
          Post
        </Button>
      </div>
    </form>
  );
};

const ImageUploader: React.FC = () => {
  return null;
};

const FileUploader: React.FC = () => {
  return null;
};

export default CreatePostForm;
