import { toIntlLocale } from "../../i18n/routing";
import type { Currency } from "../types";

const turkmenMonths = ["Ýan", "Few", "Mar", "Apr", "Maý", "Iýn", "Iýl", "Awg", "Sen", "Okt", "Noý", "Dek"];
const uzbekMonths = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];

export function formatDate(value: string | undefined, locale: string): string {
  if (!value) return "—";

  // Chromium has no Turkmen ICU data and falls back to Russian for "tk".
  // Use fixed Turkmen month names so server and client always render the same text.
  if (locale === "tm" || locale === "uz") {
    const [year, month, day] = value.slice(0, 10).split("-");
    const monthName = (locale === "tm" ? turkmenMonths : uzbekMonths)[Number(month) - 1];
    return monthName ? `${day} ${monthName} ${year}` : value;
  }

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

export function formatAmount(amount: number, currency: Currency, locale: string): string {
  // "TL" is the project label for Turkish lira; Intl expects the ISO code "TRY".
  return new Intl.NumberFormat(toIntlLocale(locale), {
    style: "currency",
    currency: currency === "TL" ? "TRY" : currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function imageSrc(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const origin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:4000";
  return `${origin.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Forces a browser download through the authenticated API endpoint. */
export function imageDownloadSrc(path: string): string {
  const filename = path.split("/").pop();
  if (!filename) return "#";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
  return `${apiUrl.replace(/\/$/, "")}/uploads/download/${encodeURIComponent(filename)}`;
}
