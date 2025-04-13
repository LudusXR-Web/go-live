"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "~/lib/utils";
import { buttonVariants } from "./button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      weekStartsOn={1}
      showOutsideDays={showOutsideDays}
      className={cn("p-3 w-full", className)}
      classNames={{
        ...getDefaultClassNames(),
        months: "flex flex-col sm:flex-row gap-2 relative",
        month: "flex flex-col gap-4 px-6 w-full",
        month_caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-start pt-1 w-fit gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-1 opacity-50 hover:opacity-100",
          "absolute left-1"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-1 opacity-50 hover:opacity-100",
          "absolute right-1"
        ),
        month_grid: "w-full border-collapse space-x-1  border-b ",
        weekdays: "flex w-full mb-2",
        weekday: "flex-1",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full justify-between",
        day: cn(
          "relative p-0 h-20 text-center border-t border-x last:border-r text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].range-end)]:rounded-r-md flex-1",
          props.mode === "range"
            ? "[&:has(>.range-end)]:rounded-r-md [&:has(>.range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "items-start justify-start relative p-0 w-full h-full font-normal aria-selected:opacity-100 rounded-none"
        ),
        range_start:
          "range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        range_end:
          "range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "outside text-muted-foreground aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) => (
          <>
            {orientation === "left" ? (
              <ChevronLeft className={cn("size-4", className)} {...props} />
            ) : orientation === "right" ? (
              <ChevronRight className={cn("size-4", className)} {...props} />
            ) : orientation === "up" ? (
              <ChevronUp className={cn("size-4", className)} {...props} />
            ) : (
              <ChevronDown className={cn("size-4", className)} {...props} />
            )}
          </>
        ),
      }}
      {...props}
    />
  );
}

function DynamicCalendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      weekStartsOn={1}
      showOutsideDays={showOutsideDays}
      className={cn("relative", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-y-0 mx-auto",
        month: "space-y-4 mx-auto",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "flex items-start",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          "absolute left-1"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          "absolute right-1"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex justify-around",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].range-end)]:rounded-r-md [&:has([aria-selected].outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        range_end: "range-end",
        selected:
          "bg-primary! text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        today: "bg-slate-200 rounded-md text-accent-foreground",
        outside:
          "outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) => (
          <>
            {orientation === "left" ? (
              <ChevronLeft className={cn("size-4", className)} {...props} />
            ) : orientation === "right" ? (
              <ChevronRight className={cn("size-4", className)} {...props} />
            ) : orientation === "up" ? (
              <ChevronUp className={cn("size-4", className)} {...props} />
            ) : (
              <ChevronDown className={cn("size-4", className)} {...props} />
            )}
          </>
        ),
      }}
      {...props}
    />
  );
}

export { Calendar, DynamicCalendar };
