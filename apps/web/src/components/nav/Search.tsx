"use client";

import {
  useEffect,
  useState,
  type DetailedHTMLProps,
  type InputHTMLAttributes,
} from "react";
import { TypeAnimation } from "react-type-animation";
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
  typeWriterClassName?: string;
};

const inputName = "query";
const placeholderOptions = [
  "Bartending...",
  1000,
  "Cooking...",
  1000,
  "Entertainment...",
  1000,
  "Childcare...",
  1000,
];

const Search: React.FC<SearchProps> = ({
  className,
  searchClassName,
  typeWriterClassName,
  ...props
}) => {
  const query = useSearchParams().get("q");

  const [searchValue, setSearchValue] = useState(query ?? "");

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
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className={cn(
          "absolute h-12 w-full min-w-full border-accent bg-white focus-visible:ring-0",
          searchClassName,
        )}
        {...props}
      />
      {!searchValue && (
        <TypeAnimation
          sequence={placeholderOptions}
          wrapper="span"
          speed={50}
          repeat={Infinity}
          className={cn(
            "absolute -top-2 left-3 text-muted-foreground",
            typeWriterClassName,
          )}
        />
      )}
    </form>
  );
};

export default Search;
