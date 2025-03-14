"use client";

import { Button } from "@repo/ui/button";

import { api } from "~/trpc/react";
import RichEditor, {
  EditorMenu,
  useCustomEditor,
} from "~/components/composites/RichEditor";
import { ImageIcon, PaperclipIcon } from "lucide-react";
import { toggleVariants } from "@repo/ui/toggle";

const CreatePostForm: React.FC = () => {
  const editor = useCustomEditor();
  const postMutation = api.posts.create.useMutation({
    onSuccess() {
      editor!.setOptions({
        content: "",
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
          <EditorMenu customEditor={editor} />
        </div>
        <Button
          type="submit"
          className="rounded-full font-medium"
          disabled={!editor?.getText().length || postMutation.isPending}
        >
          Post
        </Button>
      </div>
    </form>
  );
};

export default CreatePostForm;
