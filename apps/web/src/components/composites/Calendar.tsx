"use client";

import React, { type PropsWithChildren, useEffect, useState } from "react";
import Link from "next/link";
import { Calendar } from "@repo/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import { Button } from "@repo/ui/button";

import { cn, formatFullDate, formatNumericalDate } from "~/lib/utils";
import { api } from "~/trpc/react";
import { ArrowRightCircleIcon } from "lucide-react";

type AdvancedCalendarProps = {
  course: {
    id: string;
    title: string;
  };
};

const AdvancedCalendar: React.FC<AdvancedCalendarProps> = ({ course }) => {
  const [month, setMonth] = useState(new Date());

  const events = api.calendar.getOwnEvents.useQuery({
    from: new Date(month.getFullYear(), month.getMonth(), 0).toISOString(),
    to: new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString(),
  });

  useEffect(() => {
    events.refetch();
  }, [month]);

  return (
    <Calendar
      classNames={{
        today: "bg-accent/40 hover:bg-transparent transition-colors",
      }}
      components={{
        Day: ({ day, className, ...props }) => (
          <td className={cn(className, "relative h-32!")} {...props}>
            {+day.date >= new Date().setHours(0, 0, 0, 0) ? (
              <NewEventPopover date={day.date} course={course}>
                <button className="hover:bg-primary/10 z-20 flex h-full w-full cursor-pointer px-0.5 transition-colors">
                  <span className="mb-0.5 pt-1 pl-1 text-start">
                    {day.date.getDate()}
                  </span>
                </button>
              </NewEventPopover>
            ) : (
              <div className="hover:bg-primary/10 z-20 flex h-full w-full px-0.5 transition-colors">
                <span className="mb-0.5 pt-1 pl-1 text-start">
                  {day.date.getDate()}
                </span>
              </div>
            )}
            <div className="absolute top-6 flex w-full flex-col gap-y-0.5 px-0.5">
              {events.data
                ?.filter((event) =>
                  day.dateLib.isSameDay(
                    day.date,
                    new Date(event.start?.dateTime ?? 0),
                  ),
                )
                .map((event) => (
                  <Link
                    key={event.id}
                    href={event.htmlLink!}
                    role="heading"
                    target="_blank"
                    className="z-50 w-full rounded-sm bg-amber-100 py-0.5 text-xs font-medium"
                  >
                    {event.summary}
                  </Link>
                ))}
            </div>
          </td>
        ),
      }}
      month={month}
      onMonthChange={setMonth}
    />
  );
};

type NewEventPopoverProps = {
  date: Date;
} & AdvancedCalendarProps &
  PropsWithChildren;

const NewEventPopover: React.FC<NewEventPopoverProps> = ({
  children,
  date,
  course,
}) => {
  const searchParams = new URLSearchParams({
    date: formatNumericalDate(date),
    courseId: course.id,
  });

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent>
        <div className="space-x-2">
          <h4 className="inline font-medium">Create an Event</h4>
          <p className="text-muted-foreground inline text-sm">
            {formatFullDate(date)}
          </p>
        </div>
        <p className="pt-1 pb-2 text-sm">
          Create an event for the {course.title} course.
        </p>
        <Button asChild>
          <Link href={`/calendar/create?${searchParams.toString()}`}>
            <span>Next</span>
            <ArrowRightCircleIcon />
          </Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default AdvancedCalendar;
