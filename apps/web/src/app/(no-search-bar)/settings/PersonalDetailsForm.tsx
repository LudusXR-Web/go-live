"use client";

import { type Session } from "next-auth";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@repo/ui/input";
import { Switch } from "@repo/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/form";

import ChangeAvatar from "./ChangeAvatar";
import { cn } from "~/lib/utils";
import { Button } from "@repo/ui/button";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email().readonly(),
  profileType: z.boolean(),
});

type PersonalDetailsFormProps = {
  session: Session;
};

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  session,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: session.user.name,
      email: session.user.email,
      profileType: session.user.type === "teacher",
    },
  });

  function onSubmit(schema: z.infer<typeof formSchema>) {}

  return (
    <>
      <div className="space-y-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-center justify-between gap-12"
          >
            <div className="w-full space-y-4 [&>*>label]:font-medium">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input className="w-full" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        className="w-full !cursor-not-allowed"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <ChangeAvatar user={session.user} />
          </form>
          <FormField
            control={form.control}
            name="profileType"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Preferred Experience</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2 text-sm">
                    Student
                    <Switch
                      className="inline data-[state=checked]:bg-accent data-[state=unchecked]:bg-primary"
                      defaultChecked={form.formState.defaultValues?.profileType}
                      onClick={() => {
                        form.setValue(
                          "profileType",
                          !form.getValues("profileType"),
                          {
                            shouldTouch: true,
                            shouldDirty: true,
                          },
                        );
                      }}
                      disabled={field.disabled}
                      name={field.name}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      ref={field.ref}
                    />
                    Teacher
                  </div>
                </FormControl>
                <FormDescription>
                  Your <span className="text-accent">GoingLive</span> experience
                  will be adjusted based on this setting.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </div>
      <div
        className={cn(
          "absolute bottom-0 space-x-6 rounded-sm border px-2 py-1 shadow-md",
          form.formState.isDirty
            ? "ease-out animate-in slide-in-from-bottom-16 fill-mode-forwards"
            : "ease-in animate-out slide-out-to-bottom-16 fill-mode-forwards",
        )}
      >
        <span className="inline font-medium">Unsaved changes detected!</span>
        <span className="space-x-2">
          <Button
            className="inline hover:bg-slate-200/50"
            variant="ghost"
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button className="inline">Save</Button>
        </span>
      </div>
    </>
  );
};

export default PersonalDetailsForm;
