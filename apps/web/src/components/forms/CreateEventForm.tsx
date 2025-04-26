"use client";

import EventEmitter from "events";
import React, {
  type FormEvent,
  Fragment,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtSignIcon, Loader2Icon, XIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/form";
import DatePicker from "@repo/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Input } from "@repo/ui/input";
import { Textarea } from "@repo/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Switch } from "@repo/ui/switch";
import { Button } from "@repo/ui/button";

import { api } from "~/trpc/react";
import MemberSearchPopover from "~/components/composites/MemberSearchPopover";

const dateFormSchema = z.object({
  start_date: z.date(),
  start_hr: z.number().min(0).max(23),
  start_min: z.number().min(0).max(59),
  end_date: z.date(),
  end_hr: z.number().min(0).max(23),
  end_min: z.number().min(0).max(59),
});

const leftFormSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().optional(),
});

const rightFormSchema = z.object({
  courseId: z.string().cuid2(),
  attendees: z.set(z.string().cuid2()),
  member_query: z.string().optional(),
  maxAttendees: z.number().min(2).finite().optional(),
  sendNotifications: z.boolean(),
  public: z.boolean(),
});

const formSchema = z
  .object({})
  .merge(dateFormSchema)
  .merge(leftFormSchema)
  .merge(rightFormSchema);

const formClient = new EventEmitter();

type CreateEventFormProps = {
  defaultValues?: Omit<Partial<z.infer<typeof formSchema>>, "member_query">;
  courseFootprints: {
    id: string;
    title: string;
    public: boolean;
  }[];
} & (
  | {
      variant?: "default";
      eventId?: undefined;
    }
  | {
      variant?: "update";
      eventId: string;
    }
);

const CreateEventForm: React.FC<CreateEventFormProps> = ({
  variant = "default",
  eventId,
  defaultValues,
  courseFootprints,
}) => {
  const [formData, setFormData] = useState<
    Partial<z.infer<typeof formSchema>> & {
      dateFormFlag?: boolean;
      leftFormFlag?: boolean;
      rightFormFlag?: boolean;
    }
  >({});
  const [isPending, setPending] = useState(false);

  const router = useRouter();

  const eventMutation = api.calendar[
    variant === "default" ? "createOwnEvent" : "updateOwnEvent"
  ].useMutation({
    onSuccess(_, data) {
      if (!data.courseId) router.push("/profile"); //? maybe deal with this later differently

      router.push(`/course-builder/${data.courseId}/calendar`);
      setPending(false);
    },
  });

  useEffect(() => {
    formClient.on(
      "submit_form_response",
      (data: Partial<z.infer<typeof formSchema>>) =>
        setFormData((obj) => ({
          ...obj,
          ...data,
        })),
    );

    formClient.on("submit_form_error", () => {
      setFormData({});
      setPending(false);
    });

    formClient.on("submit_full", handleSubmitMutation);

    return () => {
      formClient.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    if (
      formData.dateFormFlag &&
      formData.leftFormFlag &&
      formData.rightFormFlag
    ) {
      formClient.emit("submit_full", formData);
      setFormData({});
    }
  }, [formData]);

  const DateForm = useMemo(
    () => (
      <IsolatedDateForm defaultValues={defaultValues} client={formClient} />
    ),
    [defaultValues],
  );
  const LeftForm = useMemo(
    () => (
      <IsolatedLeftForm defaultValues={defaultValues} client={formClient} />
    ),
    [defaultValues],
  );
  const RightForm = useMemo(
    () => (
      <IsolatedRightForm
        defaultValues={defaultValues}
        courseFootprints={courseFootprints}
        client={formClient}
      />
    ),
    [defaultValues, courseFootprints],
  );

  function onSubmit(e: FormEvent) {
    setPending(true);
    e.preventDefault();
    formClient.emit("submit");
  }

  function handleSubmitMutation(data: z.infer<typeof formSchema>) {
    const start = data.start_date;
    start.setHours(data.start_hr, data.start_min);

    const end = data.end_date;
    end.setHours(data.end_hr, data.end_min);

    eventMutation.mutate({
      ...data,
      eventId: eventId ?? "",
      start: start.toISOString(),
      end: end.toISOString(),
      attendees: [...data.attendees],
      sendNotifications: data.sendNotifications ? "all" : "none",
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-lg font-bold">
        {variant === "update" ? (
          defaultValues?.title ? (
            `Update the "${defaultValues.title}" Event`
          ) : (
            "Update a previously created event"
          )
        ) : (
          <>
            Create a New Event and{" "}
            <span className="text-primary font-extrabold">Go</span>
            <span className="text-accent font-extrabold">Live</span>
          </>
        )}
      </h1>
      {DateForm}
      <div className="flex w-full flex-wrap gap-x-12 gap-y-4 *:flex-1">
        {LeftForm}
        {RightForm}
      </div>
      <div className="flex w-full justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2Icon size={20} className="animate-spin" />
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </form>
  );
};

type PropsWithEventEmitter = {
  client: EventEmitter;
};

type IsolatedFormProps = Pick<CreateEventFormProps, "defaultValues"> &
  PropsWithEventEmitter;

const IsolatedDateForm: React.FC<IsolatedFormProps> = ({
  defaultValues,
  client,
}) => {
  const dateForm = useForm<z.infer<typeof dateFormSchema>>({
    resolver: zodResolver(dateFormSchema),
    defaultValues: {
      start_date: new Date(),
      start_hr: 12,
      start_min: 0,
      end_date: new Date(),
      end_hr: 14,
      end_min: 0,
      ...defaultValues,
    },
  });

  useEffect(() => {
    client.on("submit", () => {
      const formValues = dateForm.getValues();

      const start = formValues.start_date;
      start.setHours(formValues.start_hr, formValues.start_min);

      const end = formValues.end_date;
      end.setHours(formValues.end_hr, formValues.end_min);

      if (+start >= +end) {
        client.emit("submit_form_error", { title: "start_date" });

        return dateForm.setError("start_date", {
          type: "validate",
          message: "The event start time must be before its end time.",
        });
      }

      dateForm.clearErrors("start_date");

      client.emit("submit_form_response", {
        ...formValues,
        dateFormFlag: true,
      });
    });
  }, []);

  return (
    <Form {...dateForm}>
      <div className="flex w-full flex-wrap gap-x-12 *:flex-1">
        <div>
          <FormLabel>Start Datetime</FormLabel>
          <div className="flex w-full gap-x-2">
            <FormField
              control={dateForm.control}
              name="start_date"
              render={({ field }) => (
                <FormItem className="max-md:grow md:flex-1">
                  <FormControl>
                    <DatePicker
                      inputProps={field}
                      defaultValue={field.value}
                      onDayClick={(date) => field.onChange(date)}
                      startMonth={new Date()}
                      constraint="onlyFutureInclToday"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-x-2 md:flex-1">
              <FormField
                control={dateForm.control}
                name="start_hr"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        {...field}
                        value={`${field.value ?? ""}`}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <SelectTrigger className="hover:bg-muted max-w-[9ch] transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {new Array(24).fill(0).map((_, idx) => (
                            <SelectItem
                              key={idx}
                              value={idx.toString()}
                              className="focus:bg-muted"
                            >
                              {idx <= 9 ? "0" + idx : idx}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription className="w-0 text-nowrap">
                      Use your local timezone
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <span className="mt-1 h-fit">:</span>
              <FormField
                control={dateForm.control}
                name="start_min"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        {...field}
                        value={`${field.value ?? ""}`}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <SelectTrigger className="hover:bg-muted max-w-[9ch] transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {new Array(60).fill(0).map((_, idx) => (
                            <SelectItem
                              key={idx}
                              value={idx.toString()}
                              className="focus:bg-muted"
                            >
                              {idx <= 9 ? "0" + idx : idx}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        <div>
          <FormLabel>End Datetime</FormLabel>
          <div className="flex w-full gap-x-2">
            <FormField
              control={dateForm.control}
              name="end_date"
              render={({ field }) => (
                <FormItem className="max-md:grow md:flex-1">
                  <FormControl>
                    <DatePicker
                      inputProps={field}
                      defaultValue={field.value}
                      onDayClick={(date) => field.onChange(date)}
                      startMonth={new Date()}
                      constraint="onlyFutureInclToday"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-x-2 md:flex-1">
              <FormField
                control={dateForm.control}
                name="end_hr"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        {...field}
                        value={`${field.value ?? ""}`}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <SelectTrigger className="hover:bg-muted max-w-[9ch] transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {new Array(24).fill(0).map((_, idx) => (
                            <SelectItem
                              key={idx}
                              value={idx.toString()}
                              className="focus:bg-muted"
                            >
                              {idx <= 9 ? "0" + idx : idx}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription className="w-0 text-nowrap">
                      Use your local timezone
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <span className="mt-1 h-fit">:</span>
              <FormField
                control={dateForm.control}
                name="end_min"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        {...field}
                        value={`${field.value ?? ""}`}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <SelectTrigger className="hover:bg-muted max-w-[9ch] transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {new Array(60).fill(0).map((_, idx) => (
                            <SelectItem
                              key={idx}
                              value={idx.toString()}
                              className="focus:bg-muted"
                            >
                              {idx <= 9 ? "0" + idx : idx}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
};

const IsolatedLeftForm: React.FC<IsolatedFormProps> = ({
  defaultValues,
  client,
}) => {
  const leftForm = useForm<z.infer<typeof leftFormSchema>>({
    resolver: zodResolver(leftFormSchema),
    values: {
      title: "",
      description: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    client.on("submit", () => {
      void leftForm.handleSubmit(
        (data) =>
          client.emit("submit_form_response", { ...data, leftFormFlag: true }),
        (errors) => client.emit("submit_form_error", errors),
      )();
    });
  }, []);

  return (
    <Form {...leftForm}>
      <div className="space-y-4 max-md:min-w-72">
        <FormField
          control={leftForm.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input maxLength={160} placeholder="Waffle Party" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={leftForm.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Description</FormLabel>
              <FormControl>
                <Textarea placeholder="The party starts at 10 AM!" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
};

const IsolatedRightForm: React.FC<
  CreateEventFormProps & PropsWithEventEmitter
> = ({ defaultValues, client, courseFootprints }) => {
  const rightForm = useForm<z.infer<typeof rightFormSchema>>({
    resolver: zodResolver(rightFormSchema),
    values: {
      courseId: "",
      attendees: new Set(),
      member_query: "",
      maxAttendees: 10,
      sendNotifications: true,
      public: false,
      ...defaultValues,
    },
  });

  useEffect(() => {
    client.on("submit", () => {
      void rightForm.handleSubmit(
        (data) =>
          client.emit("submit_form_response", { ...data, rightFormFlag: true }),
        (errors) => client.emit("submit_form_error", errors),
      )();
    });
  }, []);

  const publicValue = rightForm.watch("public");

  const attendeesValue = rightForm.watch("attendees");
  const memberQueryValue = rightForm.watch("member_query");
  const attendeesSearchQuery = api.users.searchByUsername.useQuery(
    (memberQueryValue?.length ?? 0) >= 2 ? memberQueryValue! : "  ",
    {
      enabled: false,
    },
  );
  const attendeesQuery = api.users.getMultipleFootprintsById.useQuery([
    ...attendeesValue,
  ]);

  const [queryFocused, setQueryFocused] = useState(false);

  useEffect(() => {
    if (!memberQueryValue?.length || memberQueryValue.length < 2) return;

    let timeout: NodeJS.Timeout;

    if (attendeesSearchQuery.isLoading)
      timeout = setTimeout(() => {
        void attendeesSearchQuery.refetch();
      }, 500);
    else void attendeesSearchQuery.refetch();

    return () => clearTimeout(timeout);
  }, [memberQueryValue]);

  const addAttendee = (id: string) =>
    rightForm.setValue("attendees", attendeesValue.add(id));
  const removeAttendee = (id: string) => {
    attendeesValue.delete(id);
    rightForm.setValue("attendees", attendeesValue);
  };

  return (
    <Form {...rightForm}>
      <div className="space-y-4 max-md:min-w-72">
        <FormField
          control={rightForm.control}
          name="courseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Affiliated Course</FormLabel>
              <FormControl>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {courseFootprints.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}{" "}
                        {!course.public && (
                          <span className="opacity-70">(not public)</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={rightForm.control}
          name="member_query"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invited Members</FormLabel>
              <FormControl>
                <div className="border-input rounded-md border bg-white">
                  <div className="min-h-18 p-2">
                    {!attendeesValue.size && (
                      <span className="text-muted-foreground text-sm">
                        No attendees invited
                      </span>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {[...attendeesValue].map((id, idx) => {
                        const member = (attendeesQuery.data ?? []).find(
                          (u) => u.id === id,
                        );

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
                              onClick={() => removeAttendee(member.id)}
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
                        open={(field.value?.length ?? 0) >= 2 && queryFocused}
                        memberFootprints={attendeesSearchQuery.data ?? []}
                        addMember={addAttendee}
                        removeMember={removeAttendee}
                        memberArray={attendeesValue}
                      />
                    </div>
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                Search <span className="text-primary font-medium">Going</span>
                <span className="text-accent font-medium">Live</span> members by
                their username and invite them to your event.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={rightForm.control}
          name="maxAttendees"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Attendees</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={2}
                  disabled={!!field.disabled || !publicValue}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Limit the number of attendees to your event. This value is
                irrelevant for non-public events.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={rightForm.control}
          name="sendNotifications"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-2">
                <FormControl>
                  <Switch
                    {...field}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    value={field.value ? "checked" : "unchecked"}
                  />
                </FormControl>
                <FormLabel className="my-auto">
                  Automatically send e-mail invitations
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={rightForm.control}
          name="public"
          render={({ field }) => (
            <FormItem>
              <div className="flex gap-2">
                <FormControl>
                  <Switch
                    {...field}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    value={field.value ? "checked" : "unchecked"}
                  />
                </FormControl>
                <FormLabel className="my-auto">
                  Allow students to sign up for the meeting
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
};

export default CreateEventForm;
