import Image from "next/image";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";

import { cn } from "~/lib/utils";
import { api } from "~/trpc/server";
import { auth } from "~/server/auth";
import Post from "~/components/composites/Post";
import MultilineText from "~/components/media-display/MultilineText";
import Link from "next/link";
import { MessageCircleMoreIcon } from "lucide-react";

type GenericProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function GenericProfilePage({
  params,
}: GenericProfilePageProps) {
  const { username } = await params;

  if (username.length < 2 || username.length > 50) notFound();

  const userFootprint = await api.users.getFootprintByUsername(username);

  if (!userFootprint) notFound();

  const userDetails = await api.users.getPersonalDetailsById(userFootprint.id);

  const user = {
    ...userFootprint,
    details: { ...userDetails },
  };

  const posts = await api.posts.getByAuthorId(user.id);
  const session = await auth();

  return (
    <main className="container w-full">
      <div className="mx-auto flex w-(--breakpoint-lg) flex-col justify-center">
        <div
          id="personal-details"
          className="border-b-accent w-full space-y-3 border-b-2"
        >
          <div
            id="avatar-banner"
            className="relative w-full space-y-3 overflow-y-hidden rounded-t-2xl"
          >
            <div
              id="banner-container"
              className="max-h-52 w-full overflow-y-hidden"
            >
              <div
                className={cn(
                  "relative h-60 w-full overflow-hidden rounded",
                  user.details.banner ? "bg-slate-50" : "bg-slate-200",
                )}
              >
                {user.details.banner && (
                  <Image
                    src={user.details.banner}
                    alt={""}
                    width={1280}
                    height={720}
                    className="mx-auto -mt-[20%] w-full transition-[filter]"
                  />
                )}
              </div>
            </div>
            <div id="avatar-container" className="relative">
              <div className="*:border-primary-foreground absolute -top-[7rem] left-10 z-40 size-44 *:border-[8px]">
                <Avatar className="size-40 border">
                  <AvatarImage src={user.image ?? ""} />
                  <AvatarFallback>
                    {user.name.toUpperCase().at(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="flex flex-wrap justify-between gap-6 pt-16">
              <div className="flex h-fit gap-6 pb-4 *:pr-6">
                <div className="border-r-2">
                  <h1 className="text-3xl font-bold text-nowrap">
                    {user.name}
                  </h1>{" "}
                  {user.details.pronouns && (
                    <span className="align-middle text-xl font-light">
                      {user.details.pronouns}
                    </span>
                  )}
                </div>
                <p
                  style={{
                    wordBreak: "break-all",
                  }}
                >
                  {user.details.bio?.length ? (
                    <MultilineText>{user.details.bio}</MultilineText>
                  ) : (
                    <em>
                      <MultilineText>
                        {`We don't know much about ${user.name.split(" ").at(0)},
                        but we are sure, they are a great member of the
                        GoingLive community!`}
                      </MultilineText>
                    </em>
                  )}
                </p>
              </div>
              <Button
                asChild
                variant="ghost"
                className="hover:bg-primary rounded-full px-2.5 py-0 hover:text-white"
              >
                <Link href={`/chat/${user.id}`}>
                  <MessageCircleMoreIcon className="scale-130" />
                  <span className="sr-only">Chat with {user.name}</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div
          id="posts"
          className="w-full divide-y *:pb-4 *:not-first:pt-4 *:first:pt-6"
        >
          {posts.map((post) => (
            <Post
              key={post.id}
              author={user}
              hideCommentButton={!session}
              {...post}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
