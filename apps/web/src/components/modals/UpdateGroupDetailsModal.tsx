"use client";

import { type PropsWithChildren, useRef, useState } from "react";
import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";

import { api } from "~/trpc/react";
import { chatRooms } from "~/server/db/schema";
import { exposedRevalidatePath as revalidatePath } from "~/server/actions/exposedRevalidate";
import ChangeGroupIcon from "~/components/media-uploaders/ChangeGroupIcon";

type UpdateGroupDetailsModalProps = {
  room: typeof chatRooms.$inferSelect;
} & PropsWithChildren;

const UpdateGroupDetailsModal: React.FC<UpdateGroupDetailsModalProps> = ({
  room,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const roomNameInputRef = useRef<HTMLInputElement>(null);
  const chatRoomMutation = api.chat.update.useMutation({
    onSuccess() {
      revalidatePath(`/chat/${room.id}`);
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogTitle className="sr-only">
          Edit {room.title!} details.
        </DialogTitle>
        <div className="mx-auto">
          <ChangeGroupIcon room={room} />
        </div>
        <form
          className="space-y-4"
          onSubmit={() => {
            chatRoomMutation.mutate({
              id: room.id,
              title: roomNameInputRef.current?.value,
            });
          }}
        >
          <div>
            <Label htmlFor="name">Group Name</Label>
            <Input
              ref={roomNameInputRef}
              id="name"
              placeholder="Macrodata Refinement"
              defaultValue={room.title!}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={chatRoomMutation.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateGroupDetailsModal;
