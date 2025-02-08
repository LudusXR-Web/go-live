"use client";

import { z } from "zod";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Textarea } from "@repo/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/form";

import ChangeAvatar from "../../app/(no-search-bar)/settings/ChangeAvatar";
import { api } from "~/trpc/react";
import { userTypeEnum, type personalDetails } from "~/server/db/schema";
import { exposedRevalidatePath as revalidatePath } from "~/server/actions/exposedRevalidate";
import { cn } from "~/lib/utils";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Your name must be at least 2 characters long")
    .max(50, "Your pronouns must not be longer than 50 characters"),
  email: z.string().email().readonly(),
  type: z.enum(userTypeEnum.enumValues),

  pronouns: z
    .string()
    .max(16, "Your pronouns must not be longer than 16 characters")
    .optional(),
  bio: z.string().max(200, "Your bio may not exceed 200 characters").optional(),
});

type PersonalDetailsFormProps = {
  serverSession: Session;
  userDetails: typeof personalDetails.$inferSelect;
};

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  serverSession,
  userDetails,
}) => {
  const updateUser = api.users.update.useMutation();
  const updatePersonalDetails = api.users.updatePersonalDetails.useMutation();
  const sessionQuery = api.session.getSession.useQuery();
  const detailsQuery = api.users.getPersonalDetailsById.useQuery(
    serverSession.user.id,
  );
  const pathname = usePathname();
  const [bioLength, setBioLength] = useState(userDetails.bio?.length ?? 0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: serverSession.user.name ?? "",
      email: serverSession.user.email ?? "",
      type: serverSession.user.type,

      pronouns: userDetails.pronouns ?? "",
      bio: userDetails.bio ?? "",
    },
    values: {
      name: sessionQuery.data?.user.name ?? serverSession.user.name ?? "",
      email: sessionQuery.data?.user.email ?? serverSession.user.email ?? "",
      type: sessionQuery.data?.user.type ?? serverSession.user.type,

      pronouns: detailsQuery.data?.pronouns ?? userDetails.pronouns ?? "",
      bio: detailsQuery.data?.bio ?? userDetails.bio ?? "",
    },
  });

  const bioRef = form.watch("bio");
  useEffect(() => setBioLength(bioRef?.length ?? 0), [bioRef?.length]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    await updateUser.mutateAsync({
      id: serverSession.user.id,
      ...data,
    });

    await updatePersonalDetails.mutateAsync({
      userId: serverSession.user.id,
      ...data,
    });

    await sessionQuery.refetch();
    await detailsQuery.refetch();
    revalidatePath(pathname);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-start justify-between gap-12">
            <div className="w-full space-y-4 [&>*>label]:font-medium">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input className="w-full" maxLength={50} {...field} />
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
                        className="w-full cursor-not-allowed!"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Experience</FormLabel>
                    <FormControl>
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {userTypeEnum.enumValues.map((t) => (
                            <SelectItem
                              className="focus:bg-muted"
                              key={t}
                              value={t}
                            >
                              {/* text-transform doesn't work here for some reason */}
                              {t.slice(0, 1).toUpperCase()}
                              {t.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Your <span className="text-accent">GoingLive</span>{" "}
                      experience will be adjusted based on this setting.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pronouns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pronouns</FormLabel>
                    <FormControl>
                      <Input
                        className="max-w-[16ch]"
                        maxLength={16}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Your pronouns (if specified) will be shown in your public
                      profile.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <ChangeAvatar user={serverSession.user} />
          </div>
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <div>
                    <Textarea
                      className="max-w-[75ch]"
                      maxLength={200}
                      {...field}
                    />
                    <span
                      className={cn(
                        "text-sm font-light",
                        bioLength >= 200 ? "text-red-400" : "text-slate-300",
                      )}
                    >
                      {bioLength}/200
                    </span>
                  </div>
                </FormControl>
                <FormDescription>
                  Tell us about yourself! This bio will also be visible in your
                  public profile.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <AnimatePresence>
        {form.formState.isDirty && (
          <motion.div
            className="absolute bottom-0 space-x-6 rounded-sm border px-2 py-1 shadow-md"
            initial={{ translateY: "5rem" }}
            animate={{
              translateY: "0",
            }}
            exit={{ translateY: "5rem" }}
            transition={{
              type: "spring",
              ease: "easeInOut",
              duration: 0.55,
            }}
          >
            <span className="inline font-medium">
              Unsaved changes detected!
            </span>
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
        )}
      </AnimatePresence>
    </>
  );
};

export default PersonalDetailsForm;
