import { type PropsWithChildren } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";

import CreatePostForm from "~/components/forms/CreatePostForm";
import { redirect } from "next/navigation";

type CreatePostModalProps = {
  title: string;
  parentId?: string;
} & PropsWithChildren;

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  children,
  title,
  parentId,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-(--breakpoint-lg) grow">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <CreatePostForm
          standalone
          placeholder="Express your thoughts!"
          parentId={parentId}
          onSuccess={async () => {
            "use server";
            redirect(`/post/${parentId}`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
