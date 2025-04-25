"use client";

import { Fragment, useEffect, useState, type PropsWithChildren } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtSignIcon, XIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@repo/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/form";
import { Input } from "@repo/ui/input";

import { api } from "~/trpc/react";
import type { chatRooms } from "~/server/db/schema";
import MemberSearchPopover from "~/components/composites/MemberSearchPopover";
import ChangeGroupIcon from "~/components/media-uploaders/ChangeGroupIcon";

const formSchema = z
  .object({
    title: z.string().max(50).optional(),
    image: z.string().optional(),
    recipients: z.set(z.string().cuid2()).min(1),
    member_query: z.string().optional(),
  })
  .refine(
    (data) =>
      data.recipients.size === 1 || (data.recipients.size > 1 && data.title),
    {
      message: "Group chats require a name.",
      path: ["title"],
    },
  )
  .refine((data) => !!data.recipients.size, {
    message: "You cannot create a chat without adding any members.",
    path: ["member_query"],
  });

type CreateChatModalProps = {
  session: Session;
} & PropsWithChildren;

const CreateChatModal: React.FC<CreateChatModalProps> = ({
  session,
  children,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      title: "",
      image: "",
      recipients: new Set(),
      member_query: "",
    },
  });

  const recipientsValue = form.watch("recipients");
  const memberQueryValue = form.watch("member_query");
  const recipientsSearchQuery = api.users.searchByUsername.useQuery(
    (memberQueryValue?.length ?? 0) >= 2 ? memberQueryValue! : "  ",
    {
      enabled: false,
    },
  );
  const recipientsQuery = api.users.getMultipleFootprintsById.useQuery([
    ...recipientsValue,
  ]);
  const chatRoomMutation = api.chat.create.useMutation();

  const [queryFocused, setQueryFocused] = useState(false);
  const [carouselApi, setApi] = useState<CarouselApi>();
  const [newRoom, setNewRoom] = useState<typeof chatRooms.$inferSelect>();

  useEffect(() => {
    if (!memberQueryValue?.length || memberQueryValue.length < 2) return;

    let timeout: NodeJS.Timeout;

    if (recipientsSearchQuery.isLoading)
      timeout = setTimeout(() => {
        void recipientsSearchQuery.refetch();
      }, 500);
    else void recipientsSearchQuery.refetch();

    return () => clearTimeout(timeout);
  }, [memberQueryValue]);

  const addRecipient = (id: string) =>
    form.setValue("recipients", recipientsValue.add(id));
  const removeRecipient = (id: string) => {
    recipientsValue.delete(id);
    form.setValue("recipients", recipientsValue);
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const roomId = await chatRoomMutation.mutateAsync({
      ...data,
      members: [...data.recipients, session.user.id],
    });

    if (data.recipients.size === 1) redirect(`/chat/${roomId}`);

    setNewRoom({
      id: roomId,
      title: data.title ?? null,
      members: [...data.recipients, session.user.id],
      image: null,
    });
    carouselApi?.scrollNext();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <Carousel
          setApi={setApi}
          opts={{
            watchDrag: false,
          }}
          className="-ml-4"
        >
          <CarouselContent className="ml-0">
            <CarouselItem>
              <DialogHeader className="mb-2">
                <DialogTitle>Create a New Chat</DialogTitle>
                <DialogDescription>
                  You can either create a new direct chat or a group chat.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="max-w-[462px] space-y-4"
                >
                  {recipientsValue.size > 1 && (
                    <>
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Group Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Macrodata Refinement"
                              />
                            </FormControl>
                            <FormDescription>
                              The name of your upcoming group chat.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  <FormField
                    control={form.control}
                    name="member_query"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Members Added</FormLabel>
                        <FormControl>
                          <div className="border-input rounded-md border bg-white">
                            <div className="min-h-18 p-2">
                              {!recipientsValue.size && (
                                <span className="text-muted-foreground text-sm">
                                  No members added
                                </span>
                              )}
                              <div className="flex flex-wrap gap-2">
                                {[...recipientsValue].map((id, idx) => {
                                  const member = (
                                    recipientsQuery.data ?? []
                                  ).find((u) => u.id === id);

                                  if (!member) return <Fragment key={idx} />;

                                  return (
                                    <div
                                      key={member.id}
                                      className="bg-muted flex w-fit items-center gap-x-3 rounded-md p-2 transition-colors"
                                    >
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
                                      <button
                                        onClick={() =>
                                          removeRecipient(member.id)
                                        }
                                        className="cursor-pointer rounded-sm p-1 text-red-500 transition-colors hover:bg-red-100"
                                      >
                                        <XIcon size={20} />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="flex">
                              <span className="border-input bg-muted text-muted-foreground h-full rounded-bl-md border-t border-r px-1.5 py-2">
                                <AtSignIcon size={20} />
                              </span>
                              <div className="w-full">
                                <Input
                                  {...field}
                                  autoComplete="off"
                                  className="rounded-t-none rounded-l-none border-x-0 border-b-0"
                                  placeholder="john.doe"
                                  onFocus={(e) => {
                                    setQueryFocused(true);
                                    e.target.focus();
                                  }}
                                  onBlur={(e) => {
                                    setQueryFocused(false);
                                    field.onBlur();
                                    e.target.blur();
                                  }}
                                />
                                <MemberSearchPopover
                                  open={
                                    (field.value?.length ?? 0) >= 2 &&
                                    queryFocused
                                  }
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
                          </div>
                        </FormControl>
                        <FormDescription>
                          Search{" "}
                          <span className="text-primary font-medium">
                            Going
                          </span>
                          <span className="text-accent font-medium">Live</span>{" "}
                          members by their username and add them to your new
                          chat.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={chatRoomMutation.isPending}>
                      Create Chat
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </CarouselItem>
            <CarouselItem className="w-full pr-8 pl-4">
              <div className="flex h-full max-w-[462px] flex-col justify-between">
                <DialogHeader>
                  <DialogTitle>Group Icon</DialogTitle>
                  <DialogDescription>
                    The group icon is optional and can be changed later.
                  </DialogDescription>
                </DialogHeader>
                <div className="self-center">
                  {newRoom && <ChangeGroupIcon room={newRoom} />}
                </div>
                <DialogFooter>
                  <Button asChild type="button">
                    <Link href={`./${newRoom?.id}`}>Continue</Link>
                  </Button>
                </DialogFooter>
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatModal;
