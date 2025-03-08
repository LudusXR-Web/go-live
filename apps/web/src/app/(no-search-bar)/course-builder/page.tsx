import Link from "next/link";
import { notFound } from "next/navigation";
import { CameraOffIcon, PlusIcon } from "lucide-react";
import { Button } from "@repo/ui/button";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import NewCourseModal from "~/components/modals/NewCourse";
import Image from "next/image";

export default async function CourseListPage() {
  const session = await auth();

  if (!session) notFound();

  const memberCourses = await api.courses.getByAuthorId(session.user.id);

  return (
    <main>
      <div className="flex items-center gap-x-4">
        <NewCourseModal session={session}>
          <Button className="flex items-center">
            <PlusIcon size={20} />
            <span>Create a Course</span>
          </Button>
        </NewCourseModal>
        <Link href="/search">
          <Button
            variant="link"
            className="text-secondary-foreground font-medium"
          >
            Find courses by other professionals...
          </Button>
        </Link>
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        {!!memberCourses.length ? (
          memberCourses.map((course) => (
            <Link key={course.id} href={`/course-builder/${course.id}`}>
              <div className="max-w-80 rounded shadow-sm transition-shadow hover:shadow-lg">
                {course.image ? (
                  <Image
                    src={course.image}
                    alt={course.title}
                    width={1280}
                    height={720}
                    className="h-36 py-3"
                  />
                ) : (
                  <div className="flex h-36 w-full items-center justify-center gap-2 bg-slate-200 px-10 select-none">
                    <CameraOffIcon size={20} />
                    <span className="text-sm">No Course Banner Selected</span>
                  </div>
                )}
                <div className="h-18 px-4 py-2">
                  <h2 className="text-lg font-semibold">{course.title}</h2>
                  <p className="truncate text-sm font-light">
                    {course.description?.length ? (
                      course.description
                    ) : (
                      <em>No description provided</em>
                    )}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <></>
        )}
      </div>
    </main>
  );
}
