"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";

type LargeFileWarningProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const LargeFileWarning: React.FC<LargeFileWarningProps> = ({
  open,
  onOpenChange,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="bg-accent border-accent **:text-white">
      <DialogHeader>
        <DialogTitle>This file is too large!</DialogTitle>
        <DialogDescription>
          You can only upload files up to 50MB and images up to 4MB
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
);

export default LargeFileWarning;
