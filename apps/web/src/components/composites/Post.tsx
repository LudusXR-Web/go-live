import { Fragment } from "react";
import Image from "next/image";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";

import { posts, users } from "~/server/db/schema";
import { api } from "~/trpc/server";
import { cn, formatPostDate } from "~/lib/utils";
import ImageZoom from "~/components/modals/ImageZoom";
import FileView from "~/components/media-display/FileView";

type PostProps = typeof posts.$inferSelect & {
  author: Pick<typeof users.$inferSelect, "name" | "image">;
};

const Post: React.FC<PostProps> = async ({ author, ...post }) => {
  const media = [];

  for (const key of post.attachments) {
    media.push(await api.media.getByKey(key));
  }

  const images = media.filter((m) => m?.disposition === "inline");
  const files = media.filter((m) => m?.disposition === "attachment");

  return (
    <article className="flex gap-x-3">
      <Avatar>
        <AvatarImage src={author.image ?? ""} />
        <AvatarFallback>{author.name.toUpperCase().at(0)}</AvatarFallback>
      </Avatar>
      <div className="-mt-0.5">
        <div className="divide-x divide-slate-300">
          <h3 className="inline pr-1.5 font-medium">{author.name}</h3>
          <span className="inline pl-1.5">
            {formatPostDate(post.createdAt)}
          </span>
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
              <Fragment key={post.attachments.at(idx)}>
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
              </Fragment>
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
      </div>
    </article>
  );
};

export default Post;
