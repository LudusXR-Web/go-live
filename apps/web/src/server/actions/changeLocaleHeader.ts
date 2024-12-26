"use server";

import { cookies } from "next/headers";
import { type localeNames } from "~/app/dictionaries";
import { globalLanguageHeader } from "~/middleware";

export default async function changeLocaleHeader(
  newLocale: keyof typeof localeNames,
) {
  (await cookies()).set(globalLanguageHeader, newLocale);
}
