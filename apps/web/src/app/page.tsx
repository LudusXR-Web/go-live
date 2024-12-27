import Image from "next/image";

import { auth } from "~/server/auth";
import Nav from "~/components/composites/Nav";
import Search from "~/components/nav/Search";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex h-full flex-col">
      <Nav session={session!} hideSearchBar />
      <main className="w-full grow border-b border-b-slate-200 p-6">
        <div className="flex flex-col items-center justify-center gap-10">
          <div className="flex items-center gap-5">
            <h1 className="border-b-8 border-primary text-6xl font-black tracking-tighter">
              Find your dream course today!
            </h1>
            <Image
              src="/logo.png"
              alt="Going Live Logo"
              width={200 / 1.75}
              height={132 / 1.75}
            />
          </div>
          <Search
            className="w-[35%] after:h-16 [&>input]:py-6 [&>input]:text-2xl [&>input]:font-medium"
            searchClassName="h-16"
          />
        </div>
      </main>
    </div>
  );
}
