import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { ChevronsDownIcon, MessageCircleIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";

import { posts, users } from "~/server/db/schema";
import { api } from "~/trpc/server";
import { cn, formatPostDate } from "~/lib/utils";
import ImageZoom from "~/components/modals/ImageZoom";
import FileView from "~/components/media-display/FileView";
import CreatePostModal from "~/components/modals/CreatePostModal";
import { Button } from "@repo/ui/button";

type PostProps = typeof posts.$inferSelect & {
  author: Pick<typeof users.$inferSelect, "name" | "image">;
  hideExpansionLink?: boolean;
  hideCommentButton?: boolean;
};

const Post: React.FC<PostProps> = async ({
  hideExpansionLink,
  hideCommentButton,
  author,
  ...post
}) => {
  const media = [];

  for (const key of post.attachments) {
    media.push(await api.media.getByKey(key));
  }

  const images = media.filter((m) => m?.disposition === "inline");
  const files = media.filter((m) => m?.disposition === "attachment");

  return (
    <article className="flex gap-x-3 px-2 transition-colors hover:bg-slate-100">
      <Avatar>
        <AvatarImage src={author.image ?? ""} />
        <AvatarFallback>{author.name.toUpperCase().at(0)}</AvatarFallback>
      </Avatar>
      <div className="-mt-0.75 w-full">
        <div className="divide-x divide-slate-300">
          <h3 className="inline pr-1.5 font-medium">{author.name}</h3>
          <span className="inline px-1.5">
            {formatPostDate(post.createdAt)}
          </span>
          {!hideCommentButton && (
            <CreatePostModal
              title={`Comment on ${author.name.split(" ").at(0)}'s post`}
              parentId={post.id}
            >
              <button className="group relative ml-2 h-fit translate-y-1 cursor-pointer rounded-full px-1.5 py-0">
                <div className="absolute top-1/2 left-1/2 -z-10 size-8 -translate-1/2 rounded-full bg-slate-200 opacity-0 transition-opacity group-hover:opacity-100" />
                <MessageCircleIcon size={20} />
                <span className="sr-only">Comment</span>
              </button>
            </CreatePostModal>
          )}
        </div>
        <section className="prose max-w-full **:m-0">
          <Markdown rehypePlugins={[rehypeRaw]}>
            {post.content.replaceAll("<p></p>", "<p><br></p>")}
          </Markdown>
        </section>
        <section>
          <div
            id="images"
            className={cn(
              "flex flex-wrap gap-x-6 gap-y-2",
              images.length ? "pt-3" : "",
            )}
          >
            {images.map((image, idx) => (
              <div
                key={post.attachments.at(idx)}
                className="rounded-md bg-white p-3"
              >
                {image && (
                  <ImageZoom
                    image={`/api/cdn/${image.key}`}
                    fileName={image.fileName}
                  >
                    <Image
                      src={`/api/cdn/${image.key}`}
                      className="h-auto max-h-60 w-auto rounded-lg"
                      alt="Image attached to the post"
                      width={1280}
                      height={720}
                    />
                  </ImageZoom>
                )}
              </div>
            ))}
          </div>
          <div
            id="attachments"
            className={cn("flex flex-wrap gap-2", images.length ? "pt-3" : "")}
          >
            {files.map((file, idx) => (
              <Fragment key={post.attachments.at(idx)}>
                {file && (
                  <FileView
                    name={file.fileName}
                    href={`/api/cdn/${file.key}`}
                  />
                )}
              </Fragment>
            ))}
          </div>
        </section>
        {!hideExpansionLink && (
          <Button
            asChild
            variant="ghost"
            className="mx-auto flex size-fit flex-col items-center gap-y-0.5 hover:bg-slate-200"
          >
            <Link href={`/post/${post.id}`}>
              <span className="sr-only">See more</span>
              <ChevronsDownIcon />
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
};

export default Post;
