import Image from "next/image";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import Generic from "~/img/generic.webp";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) notFound();

  const personalDetails = await api.users.getPersonalDetailsById(
    session.user.id,
  );

  return (
    <main className="flex w-full justify-center">
      <div
        id="personal-details"
        className="max-w-(--breakpoint-lg) space-y-3 divide-y-2 divide-accent"
      >
        <div
          id="avatar-banner"
          className="relative w-full space-y-3 overflow-y-hidden rounded-t-2xl"
        >
          <div
            id="banner-container"
            className="max-h-52 w-full overflow-y-hidden"
          >
            <Image src={Generic} alt="generic" width={1280} />
          </div>
          <div id="avatar-container">
            <Avatar className="absolute left-10 top-[8rem] size-44 border-[8px] border-primary-foreground hover:shadow-sm">
              <AvatarImage
                src={session.user.image ?? undefined}
                alt="Profile Avatar Image"
              />
              <AvatarFallback>
                {session.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="ml-[14.5rem] flex gap-4 divide-x-2">
            <div>
              <h1 className="text-nowrap text-3xl font-bold">
                {session.user.name}
              </h1>{" "}
              {personalDetails.pronouns && (
                <span className="align-middle text-xl font-light">
                  {personalDetails.pronouns}
                </span>
              )}
            </div>
            <p className="min-h-20 pl-4">
              {personalDetails.bio?.length ? (
                personalDetails.bio
              ) : (
                <i>
                  We don't know much about {session.user.name.split(" ").at(0)},
                  but we are sure, they are a great member of the GoingLive
                  community!
                </i>
              )}
            </p>
          </div>
        </div>
        <div id="content-details"></div>
      </div>
    </main>
  );
}
