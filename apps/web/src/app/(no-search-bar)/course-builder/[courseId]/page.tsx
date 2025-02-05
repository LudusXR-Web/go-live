import Image from "next/image";
import { notFound } from "next/navigation";
import { MonitorIcon, TableOfContentsIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import CourseDetailsForm from "~/components/forms/CourseDetailsForm";
import ChangeCourseBanner from "./ChangeCourseBanner";

type CourseBuilderPageProps = {
  params: Promise<{ courseId: string }>;
};

const tabsTriggerStyle =
  "relative flex w-full select-none items-center gap-4 rounded-sm border-b bg-slate-200/20 px-2 py-1.5 text-sm outline-none transition-all data-[disabled]:pointer-events-none data-[state=active]:bg-slate-200 data-[disabled]:opacity-50 data-[state=active]:shadow";

export default async function CourseBuilderPage({
  params,
}: CourseBuilderPageProps) {
  const { courseId } = await params;
  const session = await auth();

  if (!session) notFound();

  const course = await api.courses.getById(courseId);

  if (!course || course.authorId !== session.user.id) notFound();

  return (
    <Tabs defaultValue="basic" asChild>
      <main className="flex h-full w-full divide-x-2 divide-accent/55 overflow-y-hidden">
        <TabsList disableDefaultStyles className="flex-1 space-y-2 pr-6 pt-2">
          <TabsTrigger
            disableDefaultStyles
            value="basic"
            className={tabsTriggerStyle}
          >
            <MonitorIcon className="opacity-50" size={20} />
            <span>Basic Information</span>
          </TabsTrigger>
          <TabsTrigger
            disableDefaultStyles
            value="content"
            className={tabsTriggerStyle}
          >
            <TableOfContentsIcon className="opacity-50" size={20} />
            <span>Content Editor</span>
          </TabsTrigger>
        </TabsList>
        <div className="relative flex-[4] pb-16 pl-6 pr-20">
          <TabsContent value="basic" className="space-y-3">
            <ChangeCourseBanner course={course} />
            <CourseDetailsForm serverSession={session} defaultValues={course} />
          </TabsContent>
          <TabsContent value="content">2</TabsContent>
        </div>
      </main>
    </Tabs>
  );
}
