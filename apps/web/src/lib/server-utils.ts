import { headers } from "next/headers";

import { dictionaries } from "~/app/dictionaries";
import { globalLanguageHeader } from "~/middleware";

export const getDictionaryFromHeaders = async () =>
  dictionaries[
    (await headers()).get(globalLanguageHeader)! as keyof typeof dictionaries
  ]();

export const getLocaleFromHeaders = async () =>
  (await headers()).get(globalLanguageHeader)! as keyof typeof dictionaries;
