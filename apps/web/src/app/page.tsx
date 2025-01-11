import Image from "next/image";

import { auth } from "~/server/auth";
import Nav from "~/components/composites/Nav";
import FeatureCard from "~/components/composites/FeatureCard";
import Search from "~/components/nav/Search";

export default async function Home() {
  const session = await auth();

  return (
    <div className="container m-auto flex w-full flex-col">
      <Nav session={session} hideSearchBar />
      <main className="relative w-full grow space-y-16 border-b border-b-slate-200 p-6">
        <div className="flex flex-col items-center justify-center gap-10">
          <h1 className="border-b-8 border-primary text-6xl font-black tracking-tighter max-lg:text-center">
            Find your dream course today!
          </h1>
          <Search
            className="h-16 w-[80%] after:h-16 xl:w-[60%] [&>input]:py-6 [&>input]:text-2xl [&>input]:font-medium [&>span]:py-6 [&>span]:text-2xl [&>span]:font-medium"
            searchClassName="h-16"
          />
        </div>
        <div className="w-full space-y-8">
          <FeatureCard title="Learn New Skills!" />
          <FeatureCard title="Share Your Knowledge!" side="right" />
        </div>
      </main>
    </div>
  );
}
