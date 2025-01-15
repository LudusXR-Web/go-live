export const dictionaries = {
  en: () => import("./_dictionaries/en.json").then((module) => module.default),
  da: () => import("./_dictionaries/da.json").then((module) => module.default),
  el: () => import("./_dictionaries/el.json").then((module) => module.default),
};

export const localeNames = {
  en: "English",
  da: "Dansk",
  el: "Ελληνικά",
};

export const getDictionary = async (locale: keyof typeof dictionaries) =>
  dictionaries[locale]();
