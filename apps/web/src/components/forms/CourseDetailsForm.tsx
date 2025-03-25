"use client";

import z from "zod";
import { useRouter } from "next/navigation";
import { type Session } from "next-auth";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon, XIcon } from "lucide-react";
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
import { Textarea } from "@repo/ui/textarea";
import { Button } from "@repo/ui/button";
import { Switch } from "@repo/ui/switch";

import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { type courses } from "~/server/db/schema";

const formSchema = z.object({
  title: z.string().min(3).max(50),
  description: z.string().max(160),
  longDescription: z.string(),
  tags: z.set(z.string().min(2).max(32)),
  public: z.boolean(),
});

type CourseDetailsFormProps = {
  serverSession: Session;
  defaultValues?: typeof courses.$inferSelect;
  hidePublicSwitch?: boolean;
};

const CourseDetailsForm: React.FC<CourseDetailsFormProps> = ({
  serverSession,
  defaultValues,
  hidePublicSwitch = false,
}) => {
  const createCourse = api.courses.create.useMutation();
  const updateCourse = api.courses.update.useMutation();
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [tags, setTags] = useState<Set<string>>(
    new Set<string>(defaultValues?.tags ?? []),
  );
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      longDescription: defaultValues?.longDescription ?? "",
      tags: new Set(tags),
      public: defaultValues?.public ?? false,
    },
  });

  const descriptionRef = form.watch("description");
  useEffect(
    () => setDescriptionLength(descriptionRef?.length ?? 0),
    [descriptionRef.length],
  );

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (defaultValues)
      return await updateCourse.mutateAsync({
        ...data,
        id: defaultValues.id,
        tags: [...data.tags],
      });

    const newCourseId = await createCourse.mutateAsync({
      ...data,
      tags: [...data.tags],
      authorId: serverSession.user.id,
    });

    router.push(`/course-builder/${newCourseId}`);
  }

  const pending = createCourse.status !== "idle" || updateCourse.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Title <span className="text-red-400">*</span>
              </FormLabel>
              <FormControl>
                <Input required maxLength={50} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Textarea maxLength={160} {...field} />
              </FormControl>
              <FormDescription className="flex w-full justify-between">
                <span>Write a short description to the course.</span>
                <span
                  className={cn(
                    "text-sm font-light",
                    descriptionLength >= 160
                      ? "text-red-400"
                      : "text-slate-300",
                  )}
                >
                  {descriptionLength}/160
                </span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="longDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                Write a more detailed description to the course that will be
                shown to users looking to find out more about the course.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Search Tags</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {[...tags].map((t, idx, array) => (
                      <span
                        className="bg-primary/20 flex w-fit items-center overflow-hidden rounded-lg border pr-2"
                        key={idx}
                      >
                        <button
                          type="button"
                          className="hover:bg-primary/50 h-full cursor-pointer px-1 transition-colors"
                          onClick={() => {
                            const newTags = new Set(
                              array.filter((_, i) => i !== idx),
                            );

                            setTags(newTags);
                            form.setValue("tags", newTags, {
                              shouldDirty: true,
                              shouldTouch: true,
                            });
                          }}
                        >
                          <XIcon size={16} />
                        </button>
                        <span className="pl-1 select-none">{t}</span>
                      </span>
                    ))}
                  </div>
                  <Input
                    maxLength={32}
                    id="tags-input"
                    name={field.name}
                    disabled={field.disabled}
                    onKeyDown={(e) => {
                      if (e.code === "Enter") {
                        e.preventDefault();

                        if (e.currentTarget.value.length < 2)
                          return form.setError("tags", {
                            message: "Tags must be at least 2 characters long.",
                            type: "minLength",
                          });

                        const tempTags = tags;
                        tempTags.add(e.currentTarget.value.toLowerCase());
                        form.setValue("tags", tempTags, {
                          shouldDirty: true,
                          shouldTouch: true,
                        });

                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!hidePublicSwitch && defaultValues?.image && (
          <FormField
            control={form.control}
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
                    Allow public access to the course
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button
          type="submit"
          disabled={pending}
          className={pending ? "px-[2.5ch]" : ""}
        >
          {pending ? <LoaderCircleIcon className="animate-spin" /> : "Save"}
        </Button>
      </form>
    </Form>
  );
};

export default CourseDetailsForm;
