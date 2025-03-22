import { api } from "~/trpc/server";
import TagSelector from "~/components/nav/TagSelector";
import CoursePreview from "~/components/composites/CoursePreview";

type SearchParams = Promise<{ q: string; tags: string }>;
type SearchPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;

  const relevantCourses = await api.courses.getByDetails({
    query: searchParams.q ?? "",
    tags: searchParams.tags?.split(" ") ?? [""],
  });
  const getAuthorFootprint = async (id: string) =>
    await api.users.getFootprintById(id);

  return (
    <main className="divide-accent/55 container flex h-full w-full divide-x-2">
      <div className="max-w-75 min-w-70 space-y-1.5 pr-5">
        <h3 className="font-semibold">Search Criteria</h3>
        <div>
          <h4 className="pb-1 font-medium opacity-50">Tags</h4>
          <TagSelector searchParams={searchParams} />
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-6 pl-5 *:max-w-[30%]">
        {relevantCourses.map(async (course, idx) => (
          <CoursePreview
            key={idx}
            author={await getAuthorFootprint(course.authorId)}
            {...course}
          />
        ))}
      </div>
    </main>
  );
}
