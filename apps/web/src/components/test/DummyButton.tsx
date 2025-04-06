"use client";

import React, { type PropsWithChildren } from "react";
import { Button } from "@repo/ui/button";

import { api } from "~/trpc/react";

type DummyButtonProps = PropsWithChildren;

const DummyButton: React.FC<DummyButtonProps> = ({ children }) => {
  const calendarMutation = api.calendar.createEvent.useMutation({
    onSettled(_data, error) {
      if (error) throw error;
    },
  });

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => {
          calendarMutation.mutate({
            title: "TESTING EVENT",
            start: new Date("2025-04-10T14:00:00Z").toISOString(),
            end: new Date("2025-04-10T15:00:00Z").toISOString(),
            maxAttendees: 5,
            description: "testing event",
          });
        }}
      >
        DUMMY BUTTON: {children}
      </Button>
      <span>{calendarMutation.data}</span>
      <span>
        {!!calendarMutation.error &&
          JSON.stringify(calendarMutation.error, null, 2)}
      </span>
    </>
  );
};

export default DummyButton;
