// "use client";

// import { useSearchParams } from "next/navigation";

import { api } from "~/trpc/server";
import TagSelector from "~/components/nav/TagSelector";

type SearchParams = Promise<{ q: string; tags: string }>;
type SearchPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;

  const relevantCourses = api.courses.getByDetails({
    query: searchParams.q ?? "",
    tags: searchParams.tags?.split(" ") ?? [""],
  });

  return (
    <main className="divide-accent/55 container flex h-full w-full divide-x-2">
      <div className="max-w-75 space-y-1.5 pr-6">
        <h3 className="font-semibold">Search Criteria</h3>
        <div>
          <h4 className="pb-1 font-medium opacity-50">Tags</h4>
          <TagSelector searchParams={searchParams} />
        </div>
      </div>
      <div className="pl-6">Courses go here</div>
    </main>
  );
}
