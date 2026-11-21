import { defineRouting } from "next-intl/routing";

/**
 * Locale codes follow the project requirement:
 * tk = Turkish, ru = Russian, tm = Turkmenistan (Turkmen).
 * `tm` uses fixed Turkmen date names and `tr` Intl number formatting because
 * Chromium has no Turkmen ICU data.
 */
export const locales = ["tk", "ru", "tm"] as const;
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
  return locale;
}
