import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  ArrowRightCircleIcon,
  CheckIcon,
  ExternalLinkIcon,
  HeadsetIcon,
} from "lucide-react";
import { Button } from "@repo/ui/button";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { formatDatetimeNoYear } from "~/lib/utils";
import AuthorLink from "~/components/composites/AuthorLink";
import CourseRatingSelector from "~/components/composites/CourseRatingSelector";

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

  const upcomingEvents = await api.calendar.getPublicEventsByCourseId(courseId);

  if (!course || !courseBinding) notFound();

  return (
    <main className="flex flex-wrap gap-4">
      <div className="flex-3 space-y-3">
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <div className="w-fit">
          <AuthorLink userId={course.authorId} />
        </div>
        {course.external ? (
          <iframe src={course.externalUrl!} className="aspect-video w-full" />
        ) : (
          <>
            <p>
              This course consists of {course.content.sections.length} chapters
            </p>
            <div id="toc" className="space-y-3">
              {course.content.sections.map((section, idx) => (
                <Link
                  key={section.id}
                  href={`/course/${courseId}/${section.id}`}
                  className="group/section hover:border-accent flex w-full max-w-250 items-center justify-between rounded-lg border-2 py-2 pr-3 pl-4 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="group-hover/section:text-accent w-6 text-center text-4xl font-extrabold text-slate-300 transition-colors">
                      {idx + 1}
                    </span>
                    <h2 className="font-medium">{section.title}</h2>
                  </div>
                  <Button
                    variant="ghost"
                    className="relative rounded-full px-2 py-0.5 transition-[background-color_shadow] hover:bg-slate-100 hover:shadow"
                  >
                    {courseBinding.sectionsViewed.some(
                      (s) => s === section.id,
                    ) && (
                      <div className="absolute inset-1/2 grid size-6 -translate-1/2 content-center justify-center rounded-full bg-green-600 transition-[scale] group-hover/section:scale-0">
                        <CheckIcon className="text-white" />
                      </div>
                    )}
                    <ArrowRightCircleIcon />
                  </Button>
                </Link>
              ))}
            </div>
          </>
        )}
        <div className="mx-auto flex w-fit flex-col items-center space-y-3 pt-6">
          <h2 className="text-lg font-medium">
            Like this course? Rate it so there are more courses like this!
          </h2>
          <CourseRatingSelector
            courseId={courseId}
            userId={session.user.id}
            defaultRating={courseBinding.rating ?? 0}
          />
        </div>
      </div>
      {!!upcomingEvents && (
        <div className="flex-1 space-y-3">
          <h2 className="text-lg font-medium md:text-end">Upcoming events</h2>
          <div className="flex flex-col gap-2">
            {upcomingEvents.fetchedEvents.map((event) => {
              const stored = upcomingEvents.storedEvents.find(
                (e) => e.id === event.id,
              )!;

              return (
                <div key={event.id} className="space-y-1 rounded-md border p-2">
                  <h3>{event.summary}</h3>
                  <p className="text-muted-foreground text-sm">
                    {event.description}
                  </p>
                  <p className="text-sm">
                    {formatDatetimeNoYear(new Date(event.start!.dateTime!))}
                    {" - "}
                    {formatDatetimeNoYear(new Date(event.end!.dateTime!))}
                  </p>
                  {event.attendees?.some(
                    (attendee) => attendee.email === session.user.email,
                  ) ? (
                    <div className="mt-2 flex flex-wrap justify-between gap-2">
                      <Button variant="link" asChild className="px-1 py-0">
                        <Link
                          href={event.htmlLink!}
                          target="_blank"
                          className="flex items-center gap-1"
                        >
                          <span>Event details</span>
                          <ExternalLinkIcon size={20} />
                        </Link>
                      </Button>
                      {event.hangoutLink &&
                        +new Date() >
                          +new Date(event.start!.dateTime!) -
                            1000 * 60 * 30 && (
                          <Button
                            variant="outline"
                            asChild
                            className="hover:bg-muted"
                          >
                            <Link
                              href={event.hangoutLink}
                              target="_blank"
                              className="flex items-center gap-1"
                            >
                              <span>Join Meeting</span>
                              <HeadsetIcon size={20} />
                            </Link>
                          </Button>
                        )}
                    </div>
                  ) : (
                    <form
                      className="mt-2 flex w-full flex-wrap items-center justify-between gap-2"
                      action={async () => {
                        "use server";

                        if (
                          (stored.maxAttendees ?? 2) <=
                          (event.attendees?.length ?? 0)
                        )
                          return;

                        await api.calendar.signUpForEventById(event.id!);

                        revalidatePath(`/course/${courseId}`);
                      }}
                    >
                      <Button
                        type="submit"
                        disabled={
                          (stored.maxAttendees ?? 2) <=
                          (event.attendees?.length ?? 0)
                        }
                      >
                        Sign Up
                      </Button>
                      {!!stored.maxAttendees && (
                        <span>
                          {stored.maxAttendees - (event.attendees?.length ?? 0)}{" "}
                          spots left
                        </span>
                      )}
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
