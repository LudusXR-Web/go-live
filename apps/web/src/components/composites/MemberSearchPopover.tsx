"use client";

import { Fragment } from "react";
import { CheckIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Popover, PopoverAnchor, PopoverContent } from "@repo/ui/popover";

import { cn } from "~/lib/utils";
import { type api as serverApi } from "~/trpc/server";

type MemberSearchPopoverProps = {
  open?: boolean;
  memberFootprints: Awaited<
    ReturnType<typeof serverApi.users.searchByUsername>
  >;
  addMember: (id: string) => void;
  removeMember: (id: string) => void;
  memberArray: Set<string>;

  disableMemberRemoval?: boolean;
};

const MemberSearchPopover: React.FC<MemberSearchPopoverProps> = ({
  open,
  memberFootprints,
  addMember,
  removeMember,
  memberArray,

  disableMemberRemoval = false,
}) => (
  <Popover open={open}>
    <PopoverAnchor className="absolute left-44 size-0 select-none" />
    <PopoverContent
      className="space-y-2"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      {!!memberFootprints.length && (
        <div className="space-y-0.5">
          {memberFootprints.map((member) => (
            <Fragment key={member.id}>
              <button
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-md p-2 transition-colors",
                  memberArray.has(member.id)
                    ? "bg-green-100 hover:bg-green-200"
                    : "hover:bg-muted",
                )}
                onClick={() =>
                  memberArray.has(member.id)
                    ? disableMemberRemoval
                      ? () => null
                      : removeMember(member.id)
                    : addMember(member.id)
                }
              >
                <div className="flex gap-x-3">
                  <Avatar>
                    <AvatarImage src={member.image ?? ""} />
                    <AvatarFallback>
                      {member.name.at(0)!.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-start text-sm">
                    <h4>{member.name}</h4>
                    <p className="text-muted-foreground text-start">
                      @{member.username.slice(0, 20)}
                      {member.username.length > 20 && "..."}
                    </p>
                  </div>
                </div>
                {memberArray.has(member.id) && (
                  <CheckIcon
                    size={20}
                    className="justify-self-end text-green-500"
                  />
                )}
              </button>
              <div className="border-muted mt-1 mb-0 h-1 w-full border-t" />
            </Fragment>
          ))}
        </div>
      )}
      <h3 className="text-muted-foreground text-center text-xs">
        {!memberFootprints.length ? "No members found" : "Search results"}
      </h3>
    </PopoverContent>
  </Popover>
);

export default MemberSearchPopover;
