import { notFound } from "next/navigation";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

type CourseMainPageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseMainPage({ params }: CourseMainPageProps) {
  const { courseId } = await params;
  const session = await auth();

  if (!session) notFound();

  const course = await api.courses.getFullCourseById(courseId);

  if (!course) notFound();

  return null;
}
