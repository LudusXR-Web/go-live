"use server";

import { redirect } from "next/navigation";

export default async function redirectForSearch(formData: FormData) {
  redirect(`/search?q=${formData.get("query") as string}`);
}
