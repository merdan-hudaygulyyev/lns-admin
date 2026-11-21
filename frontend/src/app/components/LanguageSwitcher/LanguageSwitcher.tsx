"use client";

import { Check, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "../../../i18n/navigation";
import { locales } from "../../../i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("language");
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t("title")}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-muted transition hover:bg-surface-2 hover:text-ink"
      >
        <Globe className="h-5 w-5" aria-hidden="true" />
        <span className="hidden uppercase sm:inline">{locale}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-40 rounded-xl border border-line bg-surface p-1 shadow-card">
          {locales.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setOpen(false);
                if (item !== locale) router.replace(pathname, { locale: item });
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-surface-2 ${
                item === locale ? "text-brand" : "text-ink"
              }`}
            >
              <span className="flex-1 text-left">{t(item)}</span>
              {item === locale && <Check className="h-4 w-4" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
