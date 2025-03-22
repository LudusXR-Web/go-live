import { XIcon } from "lucide-react";
import { Input } from "@repo/ui/input";

import redirectForSearch from "~/server/actions/redirectForSearch";

type SearchParams = { q: string; tags: string };

type TagSelectorProps = {
  searchParams: SearchParams;
};

const TagSelector: React.FC<TagSelectorProps> = ({ searchParams }) => {
  const initialTags = searchParams.tags?.split(" ") ?? [];
  const tags = new Set(initialTags.filter((t) => t.length));

  return (
    <div className="space-y-2">
      <form
        action={async (formData) => {
          "use server";
          const newTag = formData.get("new_tag");

          if (typeof newTag !== "string") return;

          tags.add(newTag);

          await redirectForSearch({
            q: searchParams.q,
            tags: [...tags].join(" "),
          });
        }}
      >
        <Input name="new_tag" placeholder="Add more tags" className="w-full" />
      </form>
      <div className="flex flex-wrap gap-2">
        {[...tags].map((t, idx) => (
          <form
            key={idx}
            action={async () => {
              "use server";
              tags.delete(t);

              await redirectForSearch({
                q: searchParams.q,
                tags: [...tags].join(" "),
              });
            }}
            className="bg-primary/20 flex w-fit items-center overflow-hidden rounded-lg border pr-2"
          >
            <button
              type="submit"
              className="hover:bg-primary/50 h-full cursor-pointer px-1 transition-colors"
            >
              <XIcon size={16} />
            </button>
            <span className="pl-1 select-none">{t}</span>
          </form>
        ))}
      </div>
    </div>
  );
};

export default TagSelector;
