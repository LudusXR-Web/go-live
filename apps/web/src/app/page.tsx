import { auth } from "~/server/auth";
import Nav from "~/components/composites/Nav";
import Search from "~/components/nav/Search";

export default async function Home() {
  const session = await auth();

  return (
    <div className="container mx-auto flex w-full flex-col">
      <Nav session={session} hideSearchBar />
      <main className="relative w-full grow space-y-16 p-6">
        <div className="flex flex-col items-center justify-center gap-10">
          <h1 className="border-primary border-b-8 text-6xl font-black tracking-tighter max-lg:text-center">
            Find your dream course today!
          </h1>
          <Search
            className="h-16 w-[80%] after:h-16 xl:w-[60%] [&>input]:py-6 [&>input]:text-2xl [&>input]:font-medium [&>label>span]:py-6 [&>label>span]:text-2xl [&>label>span]:font-medium"
            searchClassName="h-16"
          />
        </div>
      </main>
    </div>
  );
}
