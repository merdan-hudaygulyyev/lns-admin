"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil, ShieldAlert, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { getMember } from "../../api/services/members";
import { Button, Card, Loader } from "../../compLibrary";
import { useRouter } from "../../../i18n/navigation";
import type { Member } from "../../types";
import { formatAmount, formatDate, imageSrc } from "../../utils/format";
import { memberEdit, ROUTES } from "../../utils/routes";
import { DeleteMemberModal } from "../DeleteMemberModal/DeleteMemberModal";

export function MemberDetailsContent({ id }: { id: string }) {
  const t = useTranslations("memberDetails");
  const fields = useTranslations("fields");
  const errorsT = useTranslations("errors");
  const locale = useLocale();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: member, isPending, isError } = useQuery({
    queryKey: ["member", id],
    queryFn: () => getMember(id),
  });

  if (isPending) return <Card><Loader label={t("loading")} /></Card>;
  if (isError || !member) return <Card><p className="text-sm text-danger">{errorsT("notFound")}</p></Card>;

  const rows: Array<{ label: string; value: string | number }> = [
    { label: fields("id"), value: member.id },
    { label: fields("username"), value: member.username },
    { label: fields("fullName"), value: member.fullName },
    { label: fields("motherName"), value: member.motherName },
    { label: fields("heir"), value: member.heir },
    { label: fields("passportNumber"), value: member.passportNumber },
    { label: fields("birthDate"), value: formatDate(member.birthDate, locale) },
    { label: fields("secretQuestion"), value: member.secretQuestion },
    { label: fields("email"), value: member.email },
    { label: fields("phone"), value: member.phone },
    { label: fields("inviter"), value: member.inviter },
    { label: fields("product"), value: member.product },
    { label: fields("address"), value: member.address },
    { label: fields("postalIndex"), value: member.postalIndex },
    { label: fields("officialSite"), value: member.officialSite },
    { label: fields("registrationDate"), value: formatDate(member.registrationDate, locale) },
    { label: fields("amount"), value: formatAmount(member.amount, member.currency, locale) },
    { label: fields("currency"), value: member.currency },
    { label: fields("createdAt"), value: formatDate(member.createdAt.slice(0, 10), locale) },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button type="button" onClick={() => router.push(ROUTES.members)} className="back-link inline-flex items-center gap-1 text-sm text-muted hover:text-brand">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("backToList")}
          </button>
          <h1 className="mt-3 text-2xl font-semibold text-ink">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("subtitle", { name: member.fullName })}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push(memberEdit(member.id))}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            {t("edit")}
          </Button>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t("delete")}
          </Button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <Card title={t("photo")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc(member.imagePath)}
            alt={member.fullName}
            className="mx-auto max-h-80 w-full rounded-xl object-contain"
          />
        </Card>

        <Card title={t("fieldsTitle")}>
          <div className="mb-5 flex items-start gap-2 rounded-lg bg-brand/5 px-3 py-2 text-xs text-muted">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
            {t("passportNote")}
          </div>
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {rows.map(({ label, value }, index) => (
              <div key={`${label}-${index}`} className="border-b border-line/70 pb-3">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="mt-1 break-words text-sm text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <DeleteMemberModal
        member={deleteOpen ? (member as Member) : null}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => router.push(ROUTES.members)}
      />
    </div>
  );
}
