import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDaysIcon,
  MonitorIcon,
  TableOfContentsIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import CourseDetailsForm from "~/components/forms/CourseDetailsForm";
import ChangeCourseBanner from "~/components/media-uploaders/ChangeCourseBanner";
import CourseEditor from "~/components/composites/CourseEditor";
import DummyButton from "~/components/test/DummyButton";

type CourseBuilderMode = "basic" | "content" | "calendar";

type CourseBuilderPageProps = {
  params: Promise<{ courseId: string; mode: CourseBuilderMode }>;
};

const tabsTriggerStyle =
  "relative flex w-full select-none items-center gap-4 rounded-sm border-b bg-slate-200/20 px-2 py-1.5 text-sm outline-hidden transition-all data-disabled:pointer-events-none data-[state=active]:bg-slate-200 data-disabled:opacity-50 data-[state=active]:shadow-sm";

export default async function CourseBuilderPage({
  params,
}: CourseBuilderPageProps) {
  const { courseId, mode } = await params;
  const session = await auth();

  if (!session) notFound();

  const course = await api.courses.getFullCourseById(courseId);

  if (!course || course.authorId !== session.user.id) notFound();

  return (
    <Tabs value={mode} asChild>
      <main className="divide-accent/55 flex h-full w-full divide-x-2">
        <TabsList disableDefaultStyles className="flex-1 space-y-2 pt-2 pr-6">
          <TabsTrigger
            asChild
            disableDefaultStyles
            value="basic"
            className={tabsTriggerStyle}
          >
            <Link href={`/course-builder/${courseId}/basic`}>
              <MonitorIcon className="opacity-50" size={20} />
              <span>Course Dashboard</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger
            asChild
            disableDefaultStyles
            value="content"
            className={tabsTriggerStyle}
          >
            <Link href={`/course-builder/${courseId}/content`}>
              <TableOfContentsIcon className="opacity-50" size={20} />
              <span>Content Editor</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger
            asChild
            disableDefaultStyles
            value="calendar"
            className={tabsTriggerStyle}
          >
            <Link href={`/course-builder/${courseId}/calendar`}>
              <CalendarDaysIcon className="opacity-50" size={20} />
              <span>Events & Meetings</span>
            </Link>
          </TabsTrigger>
        </TabsList>
        <div className="relative flex-4 pr-20 pb-16 pl-6">
          <TabsContent value="basic" className="space-y-3">
            <ChangeCourseBanner course={course} />
            <CourseDetailsForm serverSession={session} defaultValues={course} />
          </TabsContent>
          <TabsContent value="content">
            <CourseEditor
              course={{
                courseId,
                ...course.content,
              }}
            />
          </TabsContent>
          <TabsContent value="calendar">
            <DummyButton>CALENDAR TESTING</DummyButton>
          </TabsContent>
        </div>
      </main>
    </Tabs>
  );
}
