import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import { ArrowRightCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "~/lib/utils";
import { courses } from "~/server/db/schema";
import { type api } from "~/trpc/server";

type CoursePreviewProps = typeof courses.$inferSelect & {
  author: Awaited<ReturnType<typeof api.users.getFootprintById>>;
};

const CoursePreview: React.FC<CoursePreviewProps> = ({ author, ...course }) => {
  const shadowColors = ["shadow-accent/50", "shadow-primary/50"];
  const randomShadow =
    shadowColors.at(Math.floor(Math.random() * shadowColors.length)) ??
    "shadow-accent";

  return (
    <div
      className={cn(
        "group flex min-w-80 flex-col overflow-hidden rounded-xl shadow",
        randomShadow,
      )}
    >
      <div className="flex h-full items-center px-2 py-3 shadow-inner">
        {course.image && (
          <Image
            src={course.image}
            alt="Course banner"
            width={640}
            height={360}
            className="rounded-lg"
          />
        )}
      </div>
      <div className="flex grow flex-col justify-end gap-2 px-2.5 pt-1 pb-3">
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold">{course.title}</h2>
          <Button
            asChild
            variant="link"
            className="group/button_link px-0 text-inherit hover:no-underline"
          >
            <Link href={`/${author?.username}`}>
              <Avatar>
                <AvatarImage src={author?.image ?? ""} />
                <AvatarFallback>{author?.name.at(0)}</AvatarFallback>
              </Avatar>
              <span className="inline group-hover/button_link:underline">
                By {author?.name}
              </span>
            </Link>
          </Button>
          <p>{course.description}</p>
        </div>
        <Button
          asChild
          className="group-hover:bg-primary relative overflow-hidden bg-slate-100 text-black group-hover:text-white"
        >
          <Link href={`/course/${course.id}/overview`}>
            <span className="absolute -translate-x-[300%] transition-transform group-hover:static group-hover:translate-0">
              See Course Details
            </span>
            <ArrowRightCircleIcon className="transition-[display_opacity] group-hover:hidden group-hover:opacity-0" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default CoursePreview;
