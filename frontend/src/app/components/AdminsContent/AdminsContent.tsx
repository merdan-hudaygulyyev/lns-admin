"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, SearchX, ShieldAlert } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { getAdmins } from "../../api/services/admins";
import { Button, Card, Loader } from "../../compLibrary";
import { useCurrentAdmin } from "../../hooks/useCurrentAdmin";
import { formatDate } from "../../utils/format";
import { AddAdminModal } from "../AddAdminModal/AddAdminModal";

export function AdminsContent() {
  const t = useTranslations("admins");
  const common = useTranslations("common");
  const locale = useLocale();
  const { data: currentAdmin, isPending: mePending } = useCurrentAdmin();
  const isSuperAdmin = currentAdmin?.role === "super_admin";
  const [addOpen, setAddOpen] = useState(false);

  const adminsQuery = useQuery({
    queryKey: ["admins"],
    queryFn: getAdmins,
    enabled: isSuperAdmin,
  });

  if (mePending) {
    return <Card><Loader label={common("loading")} /></Card>;
  }

  if (!isSuperAdmin) {
    return (
      <Card>
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
          <div>
            <h1 className="text-lg font-semibold text-ink">{t("forbiddenTitle")}</h1>
            <p className="mt-1 text-sm text-muted">{t("forbiddenDescription")}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
        </div>
        <Button type="button" onClick={() => setAddOpen(true)}>
          {t("add")}
        </Button>
      </header>

      <div className="card overflow-hidden">
        {adminsQuery.isPending ? (
          <div className="divide-y divide-line">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex gap-6 px-4 py-4">
                <div className="skeleton h-4 w-1/4" />
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-4 w-1/5" />
              </div>
            ))}
          </div>
        ) : adminsQuery.isError ? (
          <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
            <AlertCircle className="h-8 w-8 text-danger" aria-hidden="true" />
            <p className="text-sm font-medium text-ink">{t("error")}</p>
            <Button variant="secondary" onClick={() => void adminsQuery.refetch()}>
              {common("retry")}
            </Button>
          </div>
        ) : !adminsQuery.data?.length ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <SearchX className="h-8 w-8 text-muted" aria-hidden="true" />
            <p className="text-sm text-muted">{t("empty")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-medium">{t("table.username")}</th>
                  <th className="px-4 py-3 font-medium">{t("table.email")}</th>
                  <th className="px-4 py-3 font-medium">{t("table.role")}</th>
                  <th className="px-4 py-3 font-medium">{t("table.createdAt")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {adminsQuery.data.map((admin) => (
                  <tr key={admin.id} className="transition hover:bg-surface-2/60">
                    <td className="px-4 py-3 font-medium text-ink">{admin.username}</td>
                    <td className="px-4 py-3 text-muted">{admin.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand/10 px-2 py-1 text-xs font-medium text-brand">
                        {t(`roles.${admin.role}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatDate(admin.createdAt.slice(0, 10), locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddAdminModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => setAddOpen(false)}
      />
    </div>
  );
}
