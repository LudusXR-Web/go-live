import type { Session } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";

import Search from "~/components/nav/Search";
import SignInButton from "../auth/SignInButton";

type NavProps = {
  session: Session;
};

const Nav: React.FC<NavProps> = async ({ session }) => {
  return (
    <nav className="border-b px-6 py-3">
      <div className="mx-auto flex max-w-[2200px] items-center justify-between">
        <h1 className="text-2xl font-semibold">Branding here</h1>
        <div className="relative w-[50%] after:absolute after:left-0.5 after:top-0.5 after:-z-10 after:h-12 after:w-full after:rounded-md after:bg-primary">
          <Search
            placeholder="Search for courses tailored to your needs"
            className="h-12 w-full min-w-full border-primary bg-white focus-visible:ring-0"
          />
        </div>
        <div className="inline-grid grid-flow-col items-center gap-3">
          {session ? (
            <Avatar className="transition-shadow hover:shadow">
              <AvatarImage
                src={session.user.image ?? undefined}
                alt="Profile Avatar Image"
              />
              <AvatarFallback>
                {session.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <SignInButton
              variant="ghost"
              className="h-12 text-lg font-bold hover:bg-primary/25"
            >
              Go Live!
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
