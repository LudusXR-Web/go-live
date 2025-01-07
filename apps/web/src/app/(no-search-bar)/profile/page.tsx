import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Input } from "@repo/ui/input";

import { auth } from "~/server/auth";

const ProfilePage = async () => {
  const session = await auth();

  if (!session) {
    return notFound();
  }

  return (
    <main className="flex h-full w-full divide-x-2 divide-accent/55 !px-14">
      <div className="flex-1 pl-20 pr-6">place sections here</div>
      <div className="flex-[3] pl-6 pr-20">
        <div className="flex items-center justify-between gap-16">
          <div className="w-full space-y-4 [&>*>label]:font-medium">
            <div>
              <label htmlFor="name">Name</label>
              <Input
                id="name"
                name="name"
                defaultValue={session.user.name}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="email">E-mail</label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={session.user.email}
                className="w-full"
              />
            </div>
          </div>
          <div>
            <Avatar className="size-40 transition-shadow hover:shadow">
              <AvatarImage
                src={session.user.image ?? undefined}
                alt="Profile Avatar Image"
              ></AvatarImage>
              <AvatarFallback>
                {session.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
