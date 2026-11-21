"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, CircleUserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { getMe } from "../../api/services/auth";
import { Link } from "../../../i18n/navigation";
import { ROUTES } from "../../utils/routes";
import { LogoutButton } from "../LogoutButton/LogoutButton";

export function ProfileDropdown() {
  const t = useTranslations("nav");
  const { data: admin } = useQuery({ queryKey: ["me"], queryFn: getMe });
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

  const initials = (admin?.fullName ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t("profile")}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg p-1 pr-2 transition hover:bg-surface-2"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/15 text-xs font-semibold text-brand">
          {initials}
        </span>
        <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-line bg-surface p-2 shadow-card">
          <div className="border-b border-line px-3 py-2">
            <p className="truncate text-sm font-medium text-ink">{admin?.fullName ?? "..."}</p>
            <p className="truncate text-xs text-muted">{admin?.email ?? "..."}</p>
          </div>
          <Link
            href={ROUTES.profile}
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface-2"
          >
            <CircleUserRound className="h-4 w-4" aria-hidden="true" />
            {t("profile")}
          </Link>
          <LogoutButton />
        </div>
      )}
    </div>
  );
}
