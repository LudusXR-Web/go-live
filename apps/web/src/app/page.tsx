import { auth } from "~/server/auth";
import Nav from "~/components/composites/Nav";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex h-full flex-col">
      <Nav session={session!} />
      <main className="grid w-full grow content-center justify-center bg-secondary p-6"></main>
    </div>
  );
}
