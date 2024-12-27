"use client";

import { usePathname } from "next/navigation";
import { GlobeIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";

import { localeNames } from "~/app/dictionaries";
import changeLocaleHeader from "~/server/actions/changeLocaleHeader";
import { exposedRevalidatePath as revalidatePath } from "~/server/actions/exposedRevalidate";

type LanguageSelectorProps = {
  defaultLocale: keyof typeof localeNames;
};

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  defaultLocale,
}) => {
  const pathname = usePathname();

  return (
    <Select
      defaultValue={defaultLocale}
      onValueChange={async (value: keyof typeof localeNames) => {
        await changeLocaleHeader(value);
        void revalidatePath(pathname);
      }}
    >
      <SelectTrigger className="inline-flex max-w-fit items-center gap-1 border-none shadow-none transition-colors hover:bg-primary/10">
        <GlobeIcon size={18} />
        <SelectValue placeholder={defaultLocale} />
      </SelectTrigger>
      <SelectContent>
        {Object.keys(localeNames).map((lang) => {
          return (
            <SelectItem
              key={lang}
              value={lang}
              className="transition-colors focus:bg-muted"
            >
              {localeNames[lang as keyof typeof localeNames]}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
