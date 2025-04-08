"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar } from "@repo/ui/calendar";

import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

const AdvancedCalendar: React.FC = () => {
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
        Day: ({ day, modifiers, className, ...props }) => (
          <td className={cn(className, "relative h-32!")} {...props}>
            <button className="hover:bg-primary/10 z-20 flex h-full w-full cursor-pointer px-0.5 transition-colors">
              <span className="mb-0.5 pt-1 pl-1 text-start">
                {day.date.getDate()}
              </span>
            </button>
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

export default AdvancedCalendar;
