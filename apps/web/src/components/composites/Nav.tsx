import type { Session } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";

type NavProps = {
  session: Session;
};

const Nav: React.FC<NavProps> = async ({ session }) => {
  return (
    <nav className="flex items-center justify-between border-b px-6 py-3">
      <h1 className="text-2xl font-semibold">Branding here</h1>
      <div className="inline-grid grid-flow-col items-center gap-3">
        {session && (
          <Avatar className="transition-shadow hover:shadow">
            <AvatarImage
              src={session.user.image ?? undefined}
              alt="Profile Avatar Image"
            />
            <AvatarFallback>
              {session.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </nav>
  );
};

export default Nav;
