import { auth } from "~/server/auth";
import Nav from "~/components/composites/Nav";

export default async function Home() {
  const session = await auth();

  return (
    <div className="p-6">
      <Nav />
      <main className="grid h-full w-full content-center justify-center">
        {!!session && (
          <>
            <pre className="h-max">{JSON.stringify(session, null, 2)}</pre>
          </>
        )}
      </main>
    </div>
  );
}
