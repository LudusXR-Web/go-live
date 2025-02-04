import Link from "next/link";
import { notFound } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { Button } from "@repo/ui/button";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import NewCourseModal from "~/components/modals/NewCourse";

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
      {!!memberCourses.length ? (
        <>//TODO Show the courses created by the given member</>
      ) : (
        <></>
      )}
    </main>
  );
}
