"use client";

import Link from "next/link";
import { ArrowDownToLineIcon, FileIcon, TrashIcon } from "lucide-react";
import { Button } from "@repo/ui/button";
import { cn } from "~/lib/utils";

type FileViewProps = {
  name: string;
  href: string;
  removeFile?: () => void;
};

const FileView: React.FC<FileViewProps> = ({ name, href, removeFile }) => (
  <div className="relative">
    <Link
      target="_blank"
      href={href}
      download={name}
      className={cn(
        "group/file_display relative flex cursor-pointer items-center gap-x-2 overflow-hidden rounded-lg border p-3",
        removeFile ? "pr-6" : "",
      )}
    >
      <FileIcon />
      <span>{name}</span>
      <div className="absolute top-3 left-0 flex h-full w-full translate-y-full items-center justify-center gap-x-1 rounded-t-[40%_30%] bg-red-400 text-white transition-transform *:-mt-3 group-hover/file_display:translate-0">
        <ArrowDownToLineIcon size={20} />
        <span>Download</span>
      </div>
    </Link>
    {removeFile && (
      <Button
        variant="outline"
        className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 px-2 py-1"
        onClick={removeFile}
      >
        <span className="sr-only">Remove file</span>
        <TrashIcon />
      </Button>
    )}
  </div>
);

export default FileView;
