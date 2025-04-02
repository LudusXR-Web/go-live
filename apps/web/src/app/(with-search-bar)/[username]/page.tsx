import Image from "next/image";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";

import { cn } from "~/lib/utils";
import { api } from "~/trpc/server";
import Post from "~/components/composites/Post";

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
    details: { ...userDetails! },
  };

  const posts = await api.posts.getByAuthorId(user.id);

  return (
    <main className="container w-full">
      <div className="mx-auto flex w-(--breakpoint-lg) flex-col justify-center space-y-6">
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
            <div className="flex h-fit pt-16 pb-4">
              <div className="border-r-2 pr-6">
                <h1 className="text-3xl font-bold text-nowrap">{user.name}</h1>{" "}
                {user.details.pronouns && (
                  <span className="align-middle text-xl font-light">
                    {user.details.pronouns}
                  </span>
                )}
              </div>
              <p
                className="pl-6"
                style={{
                  wordBreak: "break-all",
                }}
              >
                {user.details.bio?.length ? (
                  user.details.bio
                ) : (
                  <i>
                    We don't know much about {user.name.split(" ").at(0)}, but
                    we are sure, they are a great member of the GoingLive
                    community!
                  </i>
                )}
              </p>
            </div>
          </div>
        </div>
        <div id="posts" className="w-full space-y-4 divide-y *:pb-4">
          {posts.map((post) => (
            <Post key={post.id} author={user} {...post} />
          ))}
        </div>
      </div>
    </main>
  );
}
