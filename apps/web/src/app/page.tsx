import { Button } from "@repo/ui/button";
import { auth, signIn } from "~/server/auth";

import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="grid h-dvh w-full content-center justify-center">
        <div className="font-semibold">Stuff. Things.</div>
        <form
          action={async () => {
            "use server";

            return signIn("google");
          }}
        >
          <Button type="submit">Sign in with Google</Button>
        </form>

        {!!session && (
          <>
            <pre className="h-max">{JSON.stringify(session, null, 2)}</pre>
          </>
        )}
      </main>
    </HydrateClient>
  );
}
