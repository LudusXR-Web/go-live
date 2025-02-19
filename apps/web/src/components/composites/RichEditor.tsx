"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

const RichEditor: React.FC = () => {
  const editor = useEditor({
    extensions: [StarterKit],
  });

  return (
    <EditorContent
      className="**:prose w-full rounded border p-2 *:outline-none! **:mt-0 **:mb-0"
      editor={editor}
    />
  );
};

export default RichEditor;
