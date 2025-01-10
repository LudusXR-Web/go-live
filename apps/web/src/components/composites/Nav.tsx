import Link from "next/link";
import Image from "next/image";
import type { Session } from "next-auth";
import { SettingsIcon, UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@repo/ui/menubar";

import Search from "~/components/nav/Search";
import SignInButton from "~/components/auth/SignInButton";
import LanguageSelector from "~/components/composites/LanguageSelector";

type NavProps = {
  session: Session;
  hideSearchBar?: boolean;
};

const Nav: React.FC<NavProps> = async ({ session, hideSearchBar = false }) => {
  return (
    <nav className="px-6 py-4">
      <div className="mx-auto flex max-w-[2200px] items-center justify-between">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Going Live Logo"
            width={200 / 2.5}
            height={132 / 2.5}
          />
        </Link>
        {!hideSearchBar && (
          <Search searchClassName="relative" typeWriterClassName="top-3" />
        )}
        <div className="inline-grid grid-flow-col items-center gap-3">
          <LanguageSelector defaultLocale="en" />
          {session ? (
            <Menubar disableDefaultClassName>
              <MenubarMenu>
                <MenubarTrigger
                  asChild
                  disableDefaultClassName
                  className="peer"
                >
                  <div className="inline-flex cursor-pointer items-center space-x-2 rounded px-1.5 py-1 ring-1 ring-primary/20 transition-shadow hover:shadow-md">
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
                </MenubarTrigger>
                <MenubarContent align="end">
                  <MenubarItem
                    asChild
                    className="transition-colors focus:bg-muted"
                  >
                    <Link href="/profile" className="flex justify-between">
                      Profile
                      <UserIcon className="opacity-50" size={20} />
                    </Link>
                  </MenubarItem>
                  <MenubarItem
                    asChild
                    className="transition-colors focus:bg-muted"
                  >
                    <Link href="/settings" className="flex justify-between">
                      Settings
                      <SettingsIcon className="opacity-50" size={20} />
                    </Link>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
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

type StyledSearchProps = {
  className?: string;
  searchClassName?: string;
  placeholder?: string;
};

export default Nav;
