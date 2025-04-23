"use client";

import { type PropsWithChildren } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";

type ConfirmationModalProps = {
  question: React.ReactNode;
  onConfirm: () => any;
  reversible?: boolean;
} & PropsWithChildren;

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  question,
  children,
  onConfirm,
  reversible = false,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{question}</DialogTitle>
          <DialogDescription>
            {reversible
              ? "This action can be reversed later."
              : "This action is irreversible."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="hover:bg-slate-100">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" onClick={onConfirm}>
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
