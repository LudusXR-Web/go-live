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

export { Calendar };
