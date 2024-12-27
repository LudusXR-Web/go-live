import type { Session } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";

import Search from "~/components/nav/Search";
import SignInButton from "~/components/auth/SignInButton";
import LanguageSelector from "~/components/composites/LanguageSelector";

type NavProps = {
  session: Session;
};

const Nav: React.FC<NavProps> = async ({ session }) => {
  return (
    <nav className="px-6 py-4">
      <div className="mx-auto flex max-w-[2200px] items-center justify-between">
        <h1 className="text-2xl font-semibold">Branding</h1>
        <div className="relative w-[50%] after:absolute after:left-0.5 after:top-0.5 after:-z-10 after:h-12 after:w-full after:rounded-md after:bg-accent">
          <Search
            placeholder="Search for courses tailored to your needs"
            className="h-12 w-full min-w-full border-accent bg-white focus-visible:ring-0"
          />
        </div>
        <div className="inline-grid grid-flow-col items-center gap-3">
          <LanguageSelector defaultLocale="en" />
          {session ? (
            <div className="inline-flex items-center space-x-2 rounded px-1.5 py-1 ring-1 ring-primary/20 transition-shadow hover:shadow-md">
              <div className="divide-y divide-primary/70 *:text-right *:text-sm">
                <p className="font-medium">{session.user.name}</p>
                <p className="font-light">Student</p>
              </div>
              <Avatar className="transition-shadow hover:shadow">
                <AvatarImage
                  src={session.user.image ?? undefined}
                  alt="Profile Avatar Image"
                />
                <AvatarFallback>
                  {session.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
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
