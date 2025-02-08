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
            className="font-medium text-secondary-foreground"
          >
            See courses by other users...
          </Button>
        </Link>
      </div>
      <div className="pt-4">
        {!!memberCourses.length ? (
          memberCourses.map((course) => (
            <Link key={course.id} href={`/course-builder/${course.id}`}>
              <div className="max-w-80 rounded shadow transition-shadow hover:shadow-lg">
                {course.image ? (
                  <Image
                    src={course.image}
                    alt={course.title}
                    width={1280}
                    height={720}
                    className="py-3"
                  />
                ) : (
                  <div className="flex h-32 w-full select-none items-center justify-center gap-2 bg-slate-200">
                    <CameraOffIcon size={20} />
                    <span className="text-sm">No Course Banner Selected</span>
                  </div>
                )}
                <div className="p-2">
                  <h2 className="text-lg font-semibold">{course.title}</h2>
                  <p className="font-light">{course.description}</p>
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
