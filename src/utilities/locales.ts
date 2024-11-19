export const VALID_LOCALES = [
  "en",
  "en-US",
  "en_US",
  "ru",
  "ru-RU",
  "ru_RU",
  "uk",
  "uk-UA",
  "uk_UA",
];

export function validateLocale(locale: string): boolean {
  return VALID_LOCALES.includes(locale);
}
