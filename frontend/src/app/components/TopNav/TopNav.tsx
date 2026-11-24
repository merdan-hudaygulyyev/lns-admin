"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "../LanguageSwitcher/LanguageSwitcher";
import { ProfileDropdown } from "../ProfileDropdown/ProfileDropdown";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";

interface TopNavProps {
  collapsed: boolean;
  onExpand: () => void;
  onOpenMobile: () => void;
}

export function TopNav({ onOpenMobile }: TopNavProps) {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-muted hover:bg-surface-2 lg:hidden"
          aria-label={t("openMenu")}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <div className="mx-1 h-6 w-px bg-line" />
        <ProfileDropdown />
      </div>
    </header>
  );
}
