import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { Input } from "@repo/ui/input";

type SearchProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const Search: React.FC<SearchProps> = (props) => {
  return <Input {...props} />;
};

export default Search;
