"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Mail, UserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getMe } from "../../api/services/auth";
import { Card, Loader } from "../../compLibrary";
import { formatDate } from "../../utils/format";

export function ProfileContent() {
  const t = useTranslations("profile");
  const errors = useTranslations("errors");
  const locale = useLocale();
  const { data: admin, isPending, isError } = useQuery({ queryKey: ["me"], queryFn: getMe });

  if (isPending) return <Card><Loader label={t("loading")} /></Card>;
  if (isError || !admin) return <Card><p className="text-sm text-danger">{errors("generic")}</p></Card>;

  const rows = [
    { icon: UserRound, label: t("fullName"), value: admin.fullName },
    { icon: Mail, label: t("email"), value: admin.email },
    { icon: CalendarDays, label: t("createdAt"), value: formatDate(admin.createdAt.slice(0, 10), locale) },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </header>

      <Card title={t("title")} subtitle={t("subtitle")}>
        <div className="mb-6 flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/15 text-lg font-semibold text-brand">
            {admin.fullName.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <p className="text-lg font-semibold text-ink">{admin.fullName}</p>
            <p className="text-sm text-muted">{admin.email}</p>
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-surface-2/50 p-4">
            <dt className="text-xs text-muted">{t("id")}</dt>
            <dd className="mt-1 break-all font-mono text-xs text-ink">{admin.id}</dd>
          </div>
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border border-line bg-surface-2/50 p-4">
              <dt className="flex items-center gap-2 text-xs text-muted">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </dt>
              <dd className="mt-1 text-sm text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
