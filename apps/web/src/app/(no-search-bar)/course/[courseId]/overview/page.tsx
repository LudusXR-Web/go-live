import Image from "next/image";
import { notFound } from "next/navigation";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import MultilineText from "~/components/media-display/MultilineText";

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

  return (
    <main className="flex h-full w-full flex-col gap-y-6">
      <h1 className="text-3xl font-bold">{course.title}</h1>
      <div className="flex gap-x-6">
        <div className="max-w-225 overflow-hidden rounded-xl">
          <Image src={course.image!} alt="" width={1920} height={1080} />
        </div>
        <div className="text-lg">
          <MultilineText>{course.longDescription ?? ""}</MultilineText>
        </div>
      </div>
    </main>
  );
}
