"use client";

import { useState } from "react";
import { create } from "zustand";
import {
  useEditor,
  EditorContent,
  BubbleMenu,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import { BoldIcon, ItalicIcon, LinkIcon, UnderlineIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { toggleVariants } from "@repo/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/toggle-group";

import { cn } from "~/lib/utils";
import "~/styles/editor.scss";

type MenuState = {
  menuState: string[];
  setMenuState: (newState: string[]) => void;
};

const useMenuState = create<MenuState>((set) => ({
  menuState: [] as string[],
  setMenuState(menuState) {
    return set({ menuState });
  },
}));

type CustomEditorHookArguments = {
  defaultContent?: string;
  placeholder?: string;
  internalClassAttributes?: string;
  onUpdate?: (content: string) => void;
};

export const useCustomEditor = ({
  defaultContent,
  placeholder,
  internalClassAttributes,
  onUpdate,
}: CustomEditorHookArguments = {}) =>
  useEditor({
    content: defaultContent,
    extensions: [
      StarterKit,
      Typography,
      Underline,
      Link,
      Placeholder.configure({
        placeholder: placeholder ?? "Anything new? :)",
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

type TextEditorProps = CustomEditorHookArguments & {
  className?: string;
  containerClassName?: string;
  customEditor?: Editor | null;
};

const TextEditor: React.FC<TextEditorProps> = ({
  className,
  containerClassName,
  internalClassAttributes,
  defaultContent,
  placeholder,
  onUpdate,
  customEditor,
}) => {
  const internalCustomEditor = useCustomEditor({
    internalClassAttributes,
    defaultContent,
    placeholder,
    onUpdate,
  });

  const editor =
    customEditor !== undefined ? customEditor : internalCustomEditor;

  const { setMenuState } = useMenuState();

  return (
    <div className={containerClassName}>
      {editor && (
        <BubbleMenu
          editor={editor}
          className="rounded bg-white px-1.5 py-1 drop-shadow-lg"
          tippyOptions={{
            onMount: () =>
              setMenuState([
                editor.isActive("bold") ? "bold" : "",
                editor.isActive("italic") ? "italic" : "",
                editor.isActive("underline") ? "underline" : "",
              ]),
          }}
        >
          <EditorMenu customEditor={editor} />{" "}
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

type EditorMenuProps = {
  customEditor?: Editor | null;
};

export const EditorMenu: React.FC<EditorMenuProps> = ({
  customEditor: editor,
}) => {
  const { menuState, setMenuState } = useMenuState();
  const [showLinkPopover, setShowLinkPopover] = useState(false);

  return (
    <>
      {editor && (
        <div className="flex gap-0.5">
          <ToggleGroup
            type="multiple"
            size="sm"
            value={menuState}
            onValueChange={(v: string[]) => setMenuState(v)}
          >
            <ToggleGroupItem
              onClick={() => editor.chain().focus().toggleBold().run()}
              value="bold"
            >
              <span className="sr-only">Bold font</span>
              <BoldIcon size={16} />
            </ToggleGroupItem>
            <ToggleGroupItem
              onClick={() => editor.chain().focus().toggleItalic().run()}
              value="italic"
            >
              <span className="sr-only">Italic font</span>
              <ItalicIcon size={16} />
            </ToggleGroupItem>
            <ToggleGroupItem
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              value="underline"
            >
              <span className="sr-only">Underline text</span>
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
              <span className="sr-only">Insert link</span>
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
                  <span className="sr-only">Insert link</span>
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
      )}
    </>
  );
};

export default TextEditor;
