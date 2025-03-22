"use server";

import { redirect } from "next/navigation";

function removeNonStringFields(obj: Record<string, unknown>) {
  for (const entry in obj)
    if (typeof obj[entry] !== "string") delete obj[entry];
  return obj as Record<string, string>;
}

export default async function redirectForSearch(
  search: Record<string, string | undefined>,
) {
  const sanitizedSearch = removeNonStringFields(search);
  redirect(`/search?${new URLSearchParams(sanitizedSearch).toString()}`);
}
