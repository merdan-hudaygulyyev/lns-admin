import { toIntlLocale } from "../../i18n/routing";
import type { Currency } from "../types";

export function formatDate(value: string | undefined, locale: string): string {
  if (!value) return "—";
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
  return new Intl.NumberFormat(toIntlLocale(locale), {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function imageSrc(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const origin = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:4000";
  return `${origin.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
