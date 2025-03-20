import { XIcon } from "lucide-react";

type SearchParams = { q: string; tags: string };

type TagSelectorProps = {
  searchParams: SearchParams;
};

const TagSelector: React.FC<TagSelectorProps> = ({ searchParams }) => {
  const initialTags = searchParams.tags.split(" ") ?? [];
  const tags = new Set(initialTags);

  return (
    <div className="flex flex-wrap gap-2">
      {[...tags].map((t, idx) => (
        <span
          className="bg-primary/20 flex w-fit items-center overflow-hidden rounded-lg border pr-2"
          key={idx}
        >
          <button
            type="button"
            className="hover:bg-primary/50 h-full cursor-pointer px-1 transition-colors"
          >
            <XIcon size={16} />
          </button>
          <span className="pl-1 select-none">{t}</span>
        </span>
      ))}
    </div>
  );
};

export default TagSelector;
