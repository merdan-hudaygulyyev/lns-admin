import { defineRouting } from "next-intl/routing";

/**
 * Locale codes follow the project requirement:
 * tk = Turkish, ru = Russian, tm = Turkmenistan (Turkmen), uz = Uzbekistan.
 * `tm` and `uz` use fixed month names because Chromium has no reliable ICU data.
 */
export const locales = ["tk", "ru", "tm", "uz"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "tk",
  localePrefix: "as-needed",
});

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/**
 * BCP-47 tag used by Intl for a project locale code.
 * Project `tk` means Turkish -> `tr`; project `tm` also uses `tr` for numbers
 * because browsers fall back to Russian for the `tk` BCP-47 tag.
 */
export function toIntlLocale(locale: string): string {
  if (locale === "tk" || locale === "tm") return "tr";
  if (locale === "uz") return "uz-UZ";
  return locale;
}
