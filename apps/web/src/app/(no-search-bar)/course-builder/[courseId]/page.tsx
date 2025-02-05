import { notFound } from "next/navigation";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

type CourseBuilderPageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseBuilderPage({
  params,
}: CourseBuilderPageProps) {
  const { courseId } = await params;
  const session = await auth();

  if (!session) notFound();

  const course = await api.courses.getById(courseId);

  if (!course || course.authorId !== session.user.id) notFound();

  return <main></main>;
}
