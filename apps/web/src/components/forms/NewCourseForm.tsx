"use client";

import z from "zod";
import { useRouter } from "next/navigation";
import { type Session } from "next-auth";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { XIcon } from "lucide-react";
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

import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { type courses } from "~/server/db/schema";

const formSchema = z.object({
  title: z.string().min(3).max(50),
  description: z.string().max(160),
  tags: z.set(z.string().min(2).max(32)),
});

type NewCourseFormProps = {
  serverSession: Session;
  defaultValues?: typeof courses.$inferSelect;
};

const NewCourseForm: React.FC<NewCourseFormProps> = ({
  serverSession,
  defaultValues,
}) => {
  const createCourse = api.courses.create.useMutation();
  const updateCourse = api.courses.update.useMutation();
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [tags, setTags] = useState<Set<string>>(new Set<string>());
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      tags: new Set(defaultValues?.tags ?? tags),
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input maxLength={50} {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <div>
                  <Textarea maxLength={160} {...field} />
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
                </div>
              </FormControl>
              <FormDescription>
                Write a short description to the course.
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
                        className="flex w-fit items-center overflow-hidden rounded-lg border bg-primary/20 pr-2"
                        key={idx}
                      >
                        <button
                          type="button"
                          className="h-full px-1 transition-colors hover:bg-primary/50"
                          onClick={() =>
                            setTags(new Set(array.filter((_, i) => i !== idx)))
                          }
                        >
                          <XIcon size={16} />
                        </button>
                        <span className="pl-1">{t}</span>
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
                        tempTags.add(e.currentTarget.value);
                        form.setValue("tags", tempTags);

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
        <Button
          type="submit"
          disabled={createCourse.isPending || updateCourse.isPending}
        >
          Go Live!
        </Button>
      </form>
    </Form>
  );
};

export default NewCourseForm;
