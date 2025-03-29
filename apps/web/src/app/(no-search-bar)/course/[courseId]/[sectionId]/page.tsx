import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import FileView from "~/components/media-display/FileView";
import ViewChecker from "./ViewCheker";

type SectionPageProps = {
  params: Promise<{
    courseId: string;
    sectionId: string;
  }>;
};

export default async function SectionPage({ params }: SectionPageProps) {
  const { courseId, sectionId } = await params;
  const session = await auth();

  if (!session) notFound();

  const course = await api.courses.getFullCourseById(courseId);
  const enrolledCourses = await api.users.getCoursesById();
  const courseBinding = enrolledCourses.find((c) => c.courseId === courseId);

  if (!course || !courseBinding) notFound();

  const section = course.content.sections.find((s) => s.id === sectionId);
  const sectionIndex = course.content.sections.findIndex(
    (s) => s.id === sectionId,
  );

  if (!section) notFound();

  const elements = course.content.elements.filter((e) =>
    section.children.some((c) => c === e.id),
  );

  return (
    <main>
      <div id="header" className="divide-accent mx-auto w-fit divide-y">
        <h1 className="text-center text-3xl font-bold">{section.title}</h1>
        <h2 className="text-center text-xl font-medium">{course.title}</h2>
      </div>
      <div id="content" className="space-y-3 py-6">
        {section.children.map(async (id) => {
          const element = elements.find((e) => e.id === id);

          switch (element?.type) {
            case "text":
              return (
                <div key={id} className="prose">
                  <Markdown rehypePlugins={[rehypeRaw]}>
                    {element.content}
                  </Markdown>
                </div>
              );
            case "image":
              return (
                <Image
                  key={id}
                  src={`/api/cdn/${element.content}`}
                  alt=""
                  width={1920}
                  height={1080}
                />
              );
            case "attachment":
              const fileDetails = await api.media.getByKey(element.content);

              if (!fileDetails) return null;

              return (
                <div className="w-fit max-w-60 min-w-40">
                  <FileView
                    key={id}
                    href={`/api/cdn/${element.content}`}
                    name={fileDetails.fileName}
                  />
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
      <div id="pagination" className="flex justify-between">
        <Link
          href={`/course/${courseId}/${sectionIndex === 0 ? "" : course.content.sections.at(sectionIndex - 1)?.id}`}
          className="hover:text-accent flex h-fit w-fit cursor-pointer items-center rounded-md px-3 py-2 font-medium transition-colors select-none hover:bg-slate-100"
        >
          <ChevronLeftIcon size={32} />
          {sectionIndex === 0 ? (
            <span>Course Overview</span>
          ) : (
            <span>{course.content.sections.at(sectionIndex - 1)?.title}</span>
          )}
        </Link>
        <Link
          href={`/course/${courseId}/${sectionIndex === course.content.sections.length - 1 ? "" : course.content.sections.at(sectionIndex + 1)?.id}`}
          className="hover:text-accent flex h-fit w-fit cursor-pointer items-center rounded-md px-3 py-2 font-medium transition-colors select-none hover:bg-slate-100"
        >
          {sectionIndex === course.content.sections.length - 1 ? (
            <span>Course Overview</span>
          ) : (
            <span>{course.content.sections.at(sectionIndex + 1)?.title}</span>
          )}
          <ChevronRightIcon size={32} />
        </Link>
      </div>
      <ViewChecker {...courseBinding} sectionId={sectionId} />
    </main>
  );
}
