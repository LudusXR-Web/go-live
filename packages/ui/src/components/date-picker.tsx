"use client";

import React, { forwardRef, useState } from "react";
import { format, subDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "./button";
import { DynamicCalendar as Calendar, type CalendarProps } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const DisabledFunctions = {
  onlyPast: (date: Date) => date > new Date(),
  onlyFuture: (date: Date) => date < new Date(),
  onlyFutureInclToday: (date: Date) => date < subDays(new Date(), 1),
};

type DatePickerProps = {
  defaultValue?: Date;
  constraint?: keyof typeof DisabledFunctions | ((date: Date) => boolean);
  inputProps?: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "readOnly" | "type" | "defaultValue"
  >;
  inputRef?: React.ForwardedRef<HTMLInputElement> | null;
} & Omit<CalendarProps, "onSelect" | "selected" | "autoFocus" | "mode">;

const DatePickerBase: React.FC<DatePickerProps> = ({
  defaultValue,
  className,
  constraint: disabledServerCondition,
  inputProps,
  inputRef,
  ...calendarProps
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    defaultValue
  );

  const required = inputProps?.required ?? false;

  return (
    <>
      <Popover modal>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full pl-3 text-left font-normal hover:bg-muted",
              !selectedDate && "text-muted-foreground"
            )}
          >
            {selectedDate ? (
              format(selectedDate, "dd.MM.yyyy")
            ) : (
              <span>Pick a date</span>
            )}
            <CalendarIcon className="ml-auto size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="py-3 px-0 flex justify-center">
          <Calendar
            autoFocus
            mode="single"
            required={required}
            className={cn("grow", className)}
            selected={selectedDate}
            onSelect={setSelectedDate}
            weekStartsOn={1}
            disabled={
              disabledServerCondition
                ? typeof disabledServerCondition === "string"
                  ? DisabledFunctions[disabledServerCondition]
                  : disabledServerCondition
                : false
            }
            {...calendarProps}
          />
        </PopoverContent>
      </Popover>
      <input
        {...inputProps}
        readOnly
        type="hidden"
        ref={inputRef}
        name={inputProps?.name ? inputProps.name : "date"}
        value={format(selectedDate ?? 0, "y-MM-dd")}
      />
    </>
  );
};

const DatePicker = forwardRef<HTMLInputElement | null, DatePickerProps>(
  (props, ref) => <DatePickerBase {...props} inputRef={ref} />
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
