"use client";

import { useState } from "react";
import { BoldIcon, ItalicIcon, LinkIcon, UnderlineIcon } from "lucide-react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { toggleVariants } from "@repo/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/toggle-group";

import { cn } from "~/lib/utils";

type TextEditorProps = {
  className?: string;
  containerClassName?: string;
  internalClassAttributes?: string;
  defaultContent?: string;
  onUpdate?: (content: string) => void;
};

const TextEditor: React.FC<TextEditorProps> = ({
  className,
  containerClassName,
  internalClassAttributes,
  defaultContent,
  onUpdate,
}) => {
  const editor = useEditor({
    content: defaultContent,
    extensions: [
      StarterKit,
      Typography,
      Underline,
      Link,
      Placeholder.configure({
        placeholder: "",
      }),
    ],
    parseOptions: {
      preserveWhitespace: "full",
    },
    editorProps: {
      attributes: {
        class: cn(
          "focus:outline-none p-2 prose max-w-full **:m-0",
          internalClassAttributes,
        ),
      },
    },
    onUpdate: onUpdate ? (e) => onUpdate(e.editor.getHTML()) : undefined,
    immediatelyRender: false,
  });

  const [bubbleState, setBubbleState] = useState<string[]>([]);
  const [showLinkPopover, setShowLinkPopover] = useState(false);

  return (
    <div className={containerClassName}>
      {editor && (
        <BubbleMenu
          editor={editor}
          className="rounded bg-white px-1.5 py-1 drop-shadow-lg"
          tippyOptions={{
            onMount: () =>
              setBubbleState([
                editor.isActive("bold") ? "bold" : "",
                editor.isActive("italic") ? "italic" : "",
                editor.isActive("underline") ? "underline" : "",
              ]),
          }}
        >
          <div className="flex gap-0.5">
            <ToggleGroup
              type="multiple"
              size="sm"
              value={bubbleState}
              onValueChange={(v: string[]) => setBubbleState(v)}
            >
              <ToggleGroupItem
                onClick={() => editor.chain().focus().toggleBold().run()}
                value="bold"
              >
                <BoldIcon size={16} />
              </ToggleGroupItem>
              <ToggleGroupItem
                onClick={() => editor.chain().focus().toggleItalic().run()}
                value="italic"
              >
                <ItalicIcon size={16} />
              </ToggleGroupItem>
              <ToggleGroupItem
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                value="underline"
              >
                <UnderlineIcon size={16} />
              </ToggleGroupItem>
            </ToggleGroup>
            {editor.isActive("link") ? (
              <button
                type="button"
                data-state="on"
                className={toggleVariants({ size: "sm" })}
                onClick={() => {
                  if (editor.isActive("link"))
                    editor.chain().focus().unsetLink().run();
                }}
              >
                <LinkIcon size={16} />
              </button>
            ) : (
              <Popover
                open={showLinkPopover}
                onOpenChange={setShowLinkPopover}
                modal
              >
                <PopoverTrigger asChild>
                  <button className={toggleVariants({ size: "sm" })}>
                    <LinkIcon size={16} />
                  </button>
                </PopoverTrigger>
                <PopoverContent>
                  <h2 className="font-bold">Create a link</h2>
                  <div className="text-muted-foreground py-1.5 text-sm">
                    <p>
                      Press <kbd className="rounded-md border p-0.5">Enter</kbd>{" "}
                      to submit.
                    </p>
                  </div>
                  <form
                    id="link"
                    action={async (f) => {
                      const link = f.get("link") as string;

                      editor
                        .chain()
                        .focus()
                        .toggleLink({
                          href:
                            link.startsWith("http://") ||
                            link.startsWith("https://")
                              ? link
                              : `https://${link}`,
                        })
                        .run();

                      setShowLinkPopover(false);
                    }}
                  >
                    <input
                      required
                      form="link"
                      name="link"
                      className="w-full rounded border-2 border-slate-200 bg-slate-200 p-1 transition-colors focus:border-slate-300 focus:outline-none"
                    />
                  </form>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </BubbleMenu>
      )}
      <EditorContent
        editor={editor}
        className={cn("overflow-y-auto rounded border", className)}
        spellCheck
        required
      />
    </div>
  );
};

export default TextEditor;
