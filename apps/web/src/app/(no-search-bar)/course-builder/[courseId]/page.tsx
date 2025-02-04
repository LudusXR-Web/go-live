import { notFound } from "next/navigation";

import { auth } from "~/server/auth";

type CourseBuilderPageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseBuilderPage({
  params,
}: CourseBuilderPageProps) {
  const { courseId } = await params;
  const session = await auth();

  if (!session) notFound();

  return <main></main>;
}
