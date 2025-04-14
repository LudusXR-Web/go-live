import { notFound } from "next/navigation";

import { api } from "~/trpc/server";
import { auth } from "~/server/auth";
import CreateEventForm from "~/components/forms/CreateEventForm";

type EventUpdatePageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function EventUpdatePage({
  params,
}: EventUpdatePageProps) {
  const { eventId } = await params;

  const session = await auth();

  if (!session) notFound();

  const event = await api.calendar.getEventById(eventId);

  if (!event || event.authorId !== session.user.id) notFound();

  const courseFootprints = await api.courses.getByAuthorId({
    id: session.user.id,
    columns: {
      id: true,
      title: true,
      public: true,
    },
  });

  const invitedMemberFootprints = event.data.attendees
    ? await api.users.getMultipleFootprintsByEmail(
        event.data.attendees.map(({ email }) => email!),
      )
    : [];

  const start = new Date(event.data.start!.dateTime!);
  const end = new Date(event.data.end!.dateTime!);

  return (
    <main>
      <CreateEventForm
        variant="update"
        eventId={eventId}
        defaultValues={{
          start_date: start,
          start_hr: start.getHours(),
          start_min: start.getMinutes(),
          end_date: end,
          end_hr: end.getHours(),
          end_min: end.getMinutes(),
          title: event.data.summary ?? "",
          description: event.data.description ?? "",
          courseId: event.courseId ?? "",
          attendees: new Set(
            invitedMemberFootprints.map((member) => member.id),
          ),
          maxAttendees: event.maxAttendees ?? undefined,
          sendNotifications: event.sendNotifications,
          public: event.public,
        }}
        courseFootprints={courseFootprints}
      />
    </main>
  );
}
