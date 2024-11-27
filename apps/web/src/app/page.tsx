import { Input } from "@repo/ui/input";

import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="grid h-dvh w-full content-center justify-center">
        <div className="font-semibold">Stuff. Things.</div>
        <Input className="GAY" />
      </main>
    </HydrateClient>
  );
}
