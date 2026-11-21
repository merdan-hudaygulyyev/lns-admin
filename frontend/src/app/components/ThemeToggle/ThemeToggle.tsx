"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

const options = [
  { value: "light", icon: Sun, key: "light" },
  { value: "dark", icon: Moon, key: "dark" },
  { value: "system", icon: Monitor, key: "system" },
] as const;

export function ThemeToggle() {
  const t = useTranslations("theme");
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const ActiveIcon = options.find((option) => option.value === theme)?.icon ?? Monitor;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t("title")}
        aria-expanded={open}
        className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-ink"
      >
        {mounted ? (
          <ActiveIcon className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Monitor className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-40 rounded-xl border border-line bg-surface p-1 shadow-card">
          {options.map(({ value, icon: Icon, key }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTheme(value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-surface-2 ${
                theme === value ? "text-brand" : "text-ink"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="flex-1 text-left">{t(key)}</span>
              {theme === value && <Check className="h-4 w-4" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
