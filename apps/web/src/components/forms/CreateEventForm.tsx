"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
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

const formSchema = z.object({
  courseId: z.string().cuid2(),
  maxAttendees: z.number().min(2).finite().optional(),
  sendNotifications: z.enum(["none", "externalOnly", "all"]).optional(),
  attendees: z.string().email().array(),
  description: z.string().optional(),
  title: z.string(),
  start_date: z.date(),
  start_hr: z.number().min(0).max(23),
  start_min: z.number().min(0).max(59),
  end_date: z.date(),
  end_hr: z.number().min(0).max(23),
  end_min: z.number().min(0).max(59),
});

type CreateEventFormProps = {
  defaultValues?: Partial<z.infer<typeof formSchema>>;
  courseFootprints: {
    id: string;
    title: string;
  }[];
};

const CreateEventForm: React.FC<CreateEventFormProps> = ({ defaultValues }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultValues,
      start_hr: 12,
      start_min: 0,
      end_hr: 14,
      end_min: 0,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    //TODO
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h1 className="text-lg font-bold">
          Create a New Event and{" "}
          <span className="text-primary font-extrabold">Go</span>
          <span className="text-accent font-extrabold">Live</span>
        </h1>
        <div className="flex w-full flex-wrap gap-x-12 *:flex-1">
          <div>
            <FormLabel>Start Datetime</FormLabel>
            <div className="flex w-full gap-x-2">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <DatePicker
                        inputProps={field}
                        defaultValue={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-1 gap-x-2">
                <FormField
                  control={form.control}
                  name="start_hr"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          {...field}
                          value={`${field.value ?? ""}`}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="hover:bg-muted max-w-[9ch] bg-white transition-colors">
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
                      <span className="fixed text-xs opacity-70">
                        Use your local timezone
                      </span>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <span className="mt-1 h-fit">:</span>
                <FormField
                  control={form.control}
                  name="start_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          {...field}
                          value={`${field.value ?? ""}`}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="hover:bg-muted max-w-[9ch] bg-white transition-colors">
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
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <DatePicker
                        inputProps={field}
                        defaultValue={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-1 gap-x-2">
                <FormField
                  control={form.control}
                  name="end_hr"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          {...field}
                          value={`${field.value ?? ""}`}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="hover:bg-muted max-w-[9ch] bg-white transition-colors">
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
                      <span className="fixed text-xs opacity-70">
                        Use your local timezone
                      </span>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <span className="mt-1 h-fit">:</span>
                <FormField
                  control={form.control}
                  name="end_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          {...field}
                          value={`${field.value ?? ""}`}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="hover:bg-muted max-w-[9ch] bg-white transition-colors">
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
        <div className="flex w-full">
          <div>{/* TITLE AND DESCRIPTION */}</div>
          <div>{/* COURSE AND SMTH ELSE */}</div>
        </div>
      </form>
    </Form>
  );
};

export default CreateEventForm;
