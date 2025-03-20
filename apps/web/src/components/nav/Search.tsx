"use client";

import {
  useState,
  type DetailedHTMLProps,
  type InputHTMLAttributes,
} from "react";
import { TypeAnimation } from "react-type-animation";
import { Input } from "@repo/ui/input";

import { cn } from "~/lib/utils";
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
        "after:bg-accent relative w-[50%] after:absolute after:top-0.5 after:left-0.5 after:-z-20 after:h-12 after:w-full after:rounded-md",
        className,
      )}
      onSubmit={async (e) => {
        e.preventDefault();
        await redirectForSearch(new FormData(e.currentTarget));
      }}
    >
      <Input
        id={inputName}
        name={inputName}
        value={searchValue}
        maxLength={160}
        onChange={(e) => setSearchValue(e.target.value)}
        className={cn(
          "border-accent absolute h-12 w-full min-w-full bg-white focus-visible:ring-0",
          searchClassName,
        )}
        {...props}
      />
      {!searchValue && (
        <label htmlFor={inputName}>
          <TypeAnimation
            sequence={placeholderOptions}
            wrapper="span"
            speed={50}
            repeat={Infinity}
            className={cn(
              "text-muted-foreground absolute -top-2 left-3 cursor-pointer select-none",
              typeWriterClassName,
            )}
          />
        </label>
      )}
    </form>
  );
};

export default Search;
