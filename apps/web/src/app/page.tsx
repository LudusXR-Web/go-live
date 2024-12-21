import { auth } from "~/server/auth";
import Nav from "~/components/composites/Nav";

export default async function Home() {
  const session = await auth();

  return (
    <div>
      <Nav session={session} />
      <main className="grid h-full w-full content-center justify-center p-6"></main>
    </div>
  );
}
