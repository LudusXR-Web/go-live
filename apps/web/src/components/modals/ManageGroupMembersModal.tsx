"use client";

import { Fragment, useEffect, useState, type PropsWithChildren } from "react";
import type { Session } from "next-auth";
import { AtSignIcon, XIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import { Label } from "@repo/ui/label";
import { Input } from "@repo/ui/input";

import { api } from "~/trpc/react";
import type { chatRooms } from "~/server/db/schema";
import MemberSearchPopover from "~/components/composites/MemberSearchPopover";
import ConfirmationModal from "~/components/modals/ConfirmationModal";

type ManageGroupMembersModalProps = {
  room: typeof chatRooms.$inferSelect;
  session: Session;
} & PropsWithChildren;

const ManageGroupMembersModal: React.FC<ManageGroupMembersModalProps> = ({
  room,
  session,
  children,
}) => {
  const [memberQueryValue, setMemberQueryValue] = useState("");
  const [recipientsValue, setRecipientsValue] = useState(new Set(room.members));
  const [queryFocused, setQueryFocused] = useState(false);

  const chatRoomMutation = api.chat.update.useMutation();
  const recipientsSearchQuery = api.users.searchByUsername.useQuery(
    (memberQueryValue.length ?? 0) >= 2 ? memberQueryValue : "  ",
    {
      enabled: false,
    },
  );
  const recipientsQuery = api.users.getMultipleFootprintsById.useQuery([
    ...recipientsValue,
  ]);

  useEffect(() => {
    if (!memberQueryValue.length || memberQueryValue.length < 2) return;

    let timeout: NodeJS.Timeout;

    if (recipientsSearchQuery.isLoading)
      timeout = setTimeout(() => {
        void recipientsSearchQuery.refetch();
      }, 500);
    else void recipientsSearchQuery.refetch();

    return () => clearTimeout(timeout);
  }, [memberQueryValue]);

  useEffect(() => {
    console.log("[DEBUG] MUST UPDATE GROUP");

    chatRoomMutation.mutate({
      id: room.id,
      members: [...recipientsValue],
    });
  }, [recipientsValue]);

  const addRecipient = (id: string) => {
    recipientsValue.add(id);
    setRecipientsValue(recipientsValue);

    chatRoomMutation.mutate({
      id: room.id,
      members: [...recipientsValue],
    });
  };
  const removeRecipient = (id: string) => {
    recipientsValue.delete(id);
    setRecipientsValue(recipientsValue);

    chatRoomMutation.mutate({
      id: room.id,
      members: [...recipientsValue],
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage &quot;{room.title}&quot; Memebrs</DialogTitle>
          <DialogDescription>
            Add and remove members by using the fields below.
          </DialogDescription>
          <div>
            <Label>Members Added</Label>
            <div className="border-input rounded-md border bg-white">
              <div className="flex">
                <span className="border-input bg-muted text-muted-foreground h-full rounded-tl-md border-r border-b px-1.5 py-2">
                  <AtSignIcon size={20} />
                </span>
                <div className="w-full">
                  <Input
                    autoComplete="off"
                    className="rounded-l-none rounded-b-none border-x-0 border-t-0"
                    placeholder="john.doe"
                    value={memberQueryValue}
                    onChange={(e) => setMemberQueryValue(e.target.value)}
                    onFocus={(e) => {
                      setQueryFocused(true);
                      e.target.focus();
                    }}
                    onBlur={(e) => {
                      setQueryFocused(false);
                      e.target.blur();
                    }}
                  />
                  <MemberSearchPopover
                    disableMemberRemoval
                    open={(memberQueryValue.length ?? 0) >= 2 && queryFocused}
                    memberFootprints={
                      recipientsSearchQuery.data?.filter(
                        (v) => v.id !== session.user.id,
                      ) ?? []
                    }
                    addMember={addRecipient}
                    removeMember={removeRecipient}
                    memberArray={recipientsValue}
                  />
                </div>
              </div>
              <div className="min-h-18 p-2">
                {!recipientsValue.size && (
                  <span className="text-muted-foreground text-sm">
                    No members added
                  </span>
                )}
                <div className="flex flex-col gap-2 *:w-full">
                  {[...recipientsValue]
                    .sort((_, b) => (b === session.user.id ? -1 : 0))
                    .map((id, idx) => {
                      const member = (recipientsQuery.data ?? []).find(
                        (u) => u.id === id,
                      );

                      if (!member) return <Fragment key={idx} />;

                      return (
                        <div
                          key={member.id}
                          className="bg-muted flex w-fit items-center justify-between gap-x-3 rounded-md p-2 transition-colors"
                        >
                          <div className="flex gap-x-3">
                            <Avatar>
                              <AvatarImage src={member.image ?? ""} />
                              <AvatarFallback>
                                {member.name.at(0)!.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                              <h4>{member.name}</h4>
                              <p className="text-muted-foreground">
                                @{member.username}
                              </p>
                            </div>
                          </div>
                          {member.id !== session.user.id && (
                            <ConfirmationModal
                              reversible
                              question={`Are you sure you would like to remove ${member.name} from the group?`}
                              onConfirm={() => removeRecipient(member.id)}
                            >
                              <button className="cursor-pointer rounded-sm p-1 text-red-500 transition-colors hover:bg-red-100">
                                <XIcon size={20} />
                              </button>
                            </ConfirmationModal>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ManageGroupMembersModal;
