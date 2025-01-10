"use client";

import { z } from "zod";
import { useEffect, useState } from "react";
import { Session } from "next-auth";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
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
import { api } from "~/trpc/react";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email().readonly(),
  profileType: z.boolean(),
});

type PersonalDetailsFormProps = {
  serverSession: Session;
};

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  serverSession,
}) => {
  const mutation = api.users.update.useMutation();
  const sessionQuery = api.session.getSession.useQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: serverSession.user.name ?? "",
      email: serverSession.user.email ?? "",
      profileType: serverSession.user.type === "teacher",
    },
    values: {
      name: sessionQuery.data?.user.name ?? "",
      email: sessionQuery.data?.user.email ?? "",
      profileType:
        (sessionQuery.data?.user.type ?? serverSession.user.type) === "teacher",
    },
  });

  async function onSubmit({
    name,
    email,
    profileType,
  }: z.infer<typeof formSchema>) {
    await mutation.mutateAsync({
      id: sessionQuery.data!.user.id,
      name,
      email,
      type: profileType ? "teacher" : "student",
    });

    await sessionQuery.refetch();
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-between gap-12">
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
            <ChangeAvatar user={serverSession.user} />
          </div>
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
                      checked={field.value}
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
        </form>
      </Form>
      <motion.div
        className="absolute bottom-0 space-x-6 rounded-sm border px-2 py-1 shadow-md"
        initial={{ translateY: "5rem" }}
        animate={{
          translateY: form.formState.isDirty ? "0" : "5rem",
        }}
        transition={{
          type: "spring",
          ease: "easeInOut",
          duration: 0.55,
        }}
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
          <Button
            type="submit"
            className="inline"
            onClick={form.handleSubmit(onSubmit)}
          >
            {form.formState.isLoading ? (
              <Loader2Icon className="animate-spin" size={20} />
            ) : (
              "Save"
            )}
          </Button>
        </span>
      </motion.div>
    </>
  );
};

export default PersonalDetailsForm;
