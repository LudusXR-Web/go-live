"use client";

import {
  useEffect,
  useState,
  type DetailedHTMLProps,
  type InputHTMLAttributes,
} from "react";
import { Input } from "@repo/ui/input";

import { cn, sleep } from "~/lib/utils";
import { useSearchParams } from "next/navigation";
import redirectForSearch from "~/server/actions/redirectForSearch";

type SearchProps = Exclude<
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
  "name"
> & {
  className?: string;
  searchClassName?: string;
  placeholder?: string;
};

const inputName = "query";
const placeholderOptions = [
  "Bartending...",
  "Cooking...",
  "Entertainment...",
  "Childcare...",
];

const Search: React.FC<SearchProps> = ({
  className,
  searchClassName,
  placeholder: defaultPlaceholder,
  ...props
}) => {
  const query = useSearchParams().get("q");

  const [placeholder, setPlaceholder] = useState(defaultPlaceholder ?? "");

  useEffect(() => {
    if (defaultPlaceholder) return () => {};

    let index = 0;
    let internalIndex = 1;
    let up = true;

    const interval = setInterval(async () => {
      if (index >= placeholderOptions.length) index = 0;

      setPlaceholder(placeholderOptions.at(index)!.slice(0, internalIndex));

      if (internalIndex >= placeholderOptions.at(index)!.length) {
        up = false;
        await sleep(600);
      }
      if (internalIndex === 0) await sleep(300);

      up ? internalIndex++ : internalIndex--;

      if (internalIndex === 0) {
        index++;
        up = true;
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <form
      className={cn(
        "relative w-[50%] after:absolute after:left-0.5 after:top-0.5 after:-z-10 after:h-12 after:w-full after:rounded-md after:bg-accent",
        className,
      )}
      onSubmit={async (e) => {
        e.preventDefault();
        await redirectForSearch(new FormData(e.currentTarget));
      }}
    >
      <Input
        name={inputName}
        defaultValue={query ?? ""}
        placeholder={placeholder}
        className={cn(
          "h-12 w-full min-w-full border-accent bg-white focus-visible:ring-0",
          searchClassName,
        )}
        {...props}
      />
    </form>
  );
};

export default Search;
