import { notFound } from "next/navigation";

import { api } from "~/trpc/server";
import { auth } from "~/server/auth";
import CreateEventForm from "~/components/forms/CreateEventForm";

type EventCreatePageProps = {
  searchParams: Promise<{
    date: string;
    courseId: string;
  }>;
};

export default async function EventCreatePage({
  searchParams,
}: EventCreatePageProps) {
  const { date, courseId } = await searchParams;

  const session = await auth();

  if (!session) notFound();

  const courseFootprints = await api.courses.getByAuthorId({
    id: session.user.id,
    columns: {
      id: true,
      title: true,
      public: true,
    },
  });

  return (
    <main>
      <CreateEventForm
        defaultValues={{
          courseId,
          start_date: new Date(date),
          end_date: new Date(date),
        }}
        courseFootprints={courseFootprints}
      />
    </main>
  );
}
