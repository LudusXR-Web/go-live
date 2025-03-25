import { notFound } from "next/navigation";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

type CourseOverviewPageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseOverviewPage({
  params,
}: CourseOverviewPageProps) {
  const { courseId } = await params;
  const session = await auth();

  const course = await api.courses.getById(courseId);

  if (!course) notFound();

  return <main className="h-full w-full"></main>;
}
