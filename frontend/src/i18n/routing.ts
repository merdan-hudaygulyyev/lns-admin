import { defineRouting } from "next-intl/routing";

/**
 * Locale codes follow the project requirement:
 * tk = Turkish, ru = Russian, tm = Turkmenistan (Turkmen).
 * `tm` is mapped to the `tk` Intl locale for date/number formatting.
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
 * Project `tk` means Turkish -> `tr`; project `tm` means Turkmen -> `tk`.
 */
export function toIntlLocale(locale: string): string {
  if (locale === "tk") return "tr";
  if (locale === "tm") return "tk";
  return locale;
}
