export const dictionaries = {
  en: () => import("./_dictionaries/en.json").then((module) => module.default),
  da: () => import("./_dictionaries/da.json").then((module) => module.default),
};

export const localeNames = {
  en: "English",
  da: "Dansk",
};

export const getDictionary = async (locale: keyof typeof dictionaries) =>
  dictionaries[locale]();
