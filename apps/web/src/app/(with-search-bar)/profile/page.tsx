import { notFound } from "next/navigation";

import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import ChangeAvatar from "~/components/media-uploaders/ChangeAvatar";
import ChangeProfileBanner from "~/components/media-uploaders/ChangeProfileBanner";
import CreatePostForm from "~/components/forms/CreatePostForm";

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
        className="divide-accent w-(--breakpoint-lg) space-y-3 divide-y-2"
      >
        <div
          id="avatar-banner"
          className="relative w-full space-y-3 overflow-y-hidden rounded-t-2xl"
        >
          <div
            id="banner-container"
            className="max-h-52 w-full overflow-y-hidden"
          >
            <ChangeProfileBanner personalDetails={personalDetails} />
          </div>
          <div id="avatar-container">
            <ChangeAvatar
              user={session.user}
              className="*:border-primary-foreground absolute top-[7rem] left-10 z-40 size-44 *:border-[8px] *:hover:shadow-sm"
            />
          </div>
          <div className="flex h-fit pt-16 pb-4">
            <div className="border-r-2 pr-6">
              <h1 className="text-3xl font-bold text-nowrap">
                {session.user.name}
              </h1>{" "}
              {personalDetails.pronouns && (
                <span className="align-middle text-xl font-light">
                  {personalDetails.pronouns}
                </span>
              )}
            </div>
            <p
              className="pl-6"
              style={{
                wordBreak: "break-all",
              }}
            >
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
        <div id="content-details" className="-mt-3">
          <CreatePostForm />
        </div>
      </div>
    </main>
  );
}
