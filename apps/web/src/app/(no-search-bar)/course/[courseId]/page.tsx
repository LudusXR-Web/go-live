import { notFound } from "next/navigation";
import { ArrowRightCircleIcon, CheckIcon } from "lucide-react";
import { Button } from "@repo/ui/button";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import AuthorLink from "~/components/composites/AuthorLink";

type CourseMainPageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseMainPage({ params }: CourseMainPageProps) {
  const { courseId } = await params;
  const session = await auth();

  if (!session) notFound();

  const course = await api.courses.getFullCourseById(courseId);
  const enrolledCourses = await api.users.getCoursesById();
  const courseBinding = enrolledCourses.find((c) => c.courseId === courseId);

  if (!course || !courseBinding) notFound();

  return (
    <main className="space-y-3">
      <h1 className="text-center text-3xl font-bold">{course.title}</h1>
      <div className="mx-auto w-fit">
        <AuthorLink userId={course.authorId} />
      </div>
      <p className="text-center">
        This course consists of {course.content.sections.length} chapters
      </p>
      <div id="toc" className="space-y-3">
        {course.content.sections.map((section, idx) => (
          <div
            key={section.id}
            className="group/section hover:border-accent mx-auto flex w-full max-w-250 items-center justify-between rounded-lg border-2 py-2 pr-3 pl-4 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="group-hover/section:text-accent text-4xl font-extrabold text-slate-300 transition-colors">
                {idx + 1}
              </span>
              <span>{section.title}</span>
            </div>
            <Button
              variant="ghost"
              className="relative rounded-full px-2 py-0.5 transition-[background-color_shadow] hover:bg-slate-100 hover:shadow"
            >
              {courseBinding.sectionsViewed.some((s) => s === section.id) && (
                <div className="absolute inset-1/2 grid size-6 -translate-1/2 content-center justify-center rounded-full bg-green-600 transition-[scale] group-hover/section:scale-0">
                  <CheckIcon className="text-white" />
                </div>
              )}
              <ArrowRightCircleIcon />
            </Button>
          </div>
        ))}
      </div>
    </main>
  );
}
