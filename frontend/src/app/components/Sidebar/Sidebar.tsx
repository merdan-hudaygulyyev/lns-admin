"use client";

import { ChevronLeft, ChevronRight, LayoutGrid, ShieldCheck, UserRound, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "../../../i18n/navigation";
import { useCurrentAdmin } from "../../hooks/useCurrentAdmin";
import { ROUTES } from "../../utils/routes";
import { BrandLogo } from "../BrandLogo/BrandLogo";
import { LogoutButton } from "../LogoutButton/LogoutButton";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const t = useTranslations("nav");
  const common = useTranslations("common");
  const pathname = usePathname();
  const { data: currentAdmin } = useCurrentAdmin();

  const items = [
    { href: ROUTES.members, label: t("members"), icon: LayoutGrid },
    ...(currentAdmin?.role === "super_admin"
      ? [{ href: ROUTES.admins, label: t("admins"), icon: ShieldCheck }]
      : []),
    { href: ROUTES.profile, label: t("profile"), icon: UserRound },
  ];

  const width = collapsed ? "lg:w-[80px]" : "lg:w-[260px]";

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label={t("closeMenu")}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-line bg-surface transition-[width,transform] duration-200 ${width} w-[260px] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-line px-5">
          <Link href={ROUTES.members} className="flex items-center gap-3 overflow-hidden">
            {!collapsed || mobileOpen ? (
              <>
                <BrandLogo className="h-9 w-[119px]" alt={common("appName")} />
                <span className="sr-only">{common("appName")}</span>
              </>
            ) : (
              <BrandLogo variant="mark" className="h-9 w-9" alt={common("appName")} />
            )}
          </Link>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-md p-1 text-muted hover:bg-surface-2 lg:hidden"
            aria-label={t("closeMenu")}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="mt-6 flex-1 space-y-1 px-3" aria-label={t("section")}>
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={onCloseMobile}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-brand/10 font-medium text-brand"
                    : "text-muted hover:bg-surface-2 hover:text-ink"
                } ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {(!collapsed || mobileOpen) && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line p-3">
          <LogoutButton collapsed={collapsed} mobileOpen={mobileOpen} />
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="absolute -right-3 top-20 hidden h-6 w-6 place-items-center rounded-full border border-line bg-surface text-muted shadow-sm lg:grid"
          aria-label={collapsed ? t("expand") : t("collapse")}
          title={collapsed ? t("expand") : t("collapse")}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
      </aside>
    </>
  );
}
