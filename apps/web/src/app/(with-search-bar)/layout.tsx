import { type PropsWithChildren } from "react";

import { auth } from "~/server/auth";
import Nav from "~/components/composites/Nav";

export default async function SearchBarLayout({ children }: PropsWithChildren) {
  const session = await auth();

  return (
    <div className="container mx-auto flex h-full w-full flex-col [&>main]:p-6">
      <Nav session={session!} />
      {children}
    </div>
  );
}
