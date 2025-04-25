import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowRightCircleIcon } from "lucide-react";
import { Button } from "@repo/ui/button";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import MultilineText from "~/components/media-display/MultilineText";
import SignInButton from "~/components/auth/SignInButton";
import AuthorLink from "~/components/composites/AuthorLink";

type CourseOverviewPageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseOverviewPage({
  params,
}: CourseOverviewPageProps) {
  const { courseId } = await params;
  const session = await auth();

  const course = await api.courses.getById(courseId);
  const enrolledCourses = await api.users.getCoursesById();
  const isEnrolled = enrolledCourses.some((c) => c.courseId === courseId);

  if (!course) notFound();

  return (
    <main className="flex h-full w-full flex-col gap-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <AuthorLink userId={course.authorId} />
      </div>
      <div className="flex gap-x-6">
        <div className="max-w-225 overflow-hidden rounded-xl">
          <Image src={course.image!} alt="" width={1920} height={1080} />
        </div>
        <div className="flex flex-col items-center space-y-4 [&>form]:w-full">
          <div className="text-lg">
            <MultilineText>{course.longDescription ?? ""}</MultilineText>
          </div>
          {session ? (
            isEnrolled ? (
              <Button asChild className="relative w-full">
                <Link href={`/course/${course.id}`}>
                  <span>See Course Content</span>
                  <ArrowRightCircleIcon />
                </Link>
              </Button>
            ) : (
              <form
                action={async () => {
                  "use server";

                  await api.courses.enrolUserIntoCourse(courseId);
                  redirect(`/course/${courseId}`);
                }}
              >
                <Button className="bg-accent hover:bg-accent/80 w-full">
                  Enrol Into the Course
                </Button>
              </form>
            )
          ) : (
            <SignInButton className="w-full" />
          )}
        </div>
      </div>
    </main>
  );
}
