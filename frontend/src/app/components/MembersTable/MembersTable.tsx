"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "../../../i18n/navigation";
import { formatAmount, formatDate, imageSrc } from "../../utils/format";
import { memberDetails, memberEdit } from "../../utils/routes";
import type { Member } from "../../types";

interface MembersTableProps {
  members: Member[];
  onDelete: (member: Member) => void;
}

export function MembersTable({ members, onDelete }: MembersTableProps) {
  const t = useTranslations("members.table");
  const locale = useLocale();
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium">{t("image")}</th>
            <th className="px-4 py-3 font-medium">{t("username")}</th>
            <th className="px-4 py-3 font-medium">{t("fullName")}</th>
            <th className="px-4 py-3 font-medium">{t("email")}</th>
            <th className="px-4 py-3 font-medium">{t("phone")}</th>
            <th className="px-4 py-3 font-medium">{t("product")}</th>
            <th className="px-4 py-3 font-medium">{t("amount")}</th>
            <th className="px-4 py-3 font-medium">{t("registrationDate")}</th>
            <th className="px-4 py-3 text-right font-medium">{t("actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {members.map((member) => (
            <tr
              key={member.id}
              onClick={() => router.push(memberDetails(member.id))}
              className="cursor-pointer transition hover:bg-surface-2/60"
            >
              <td className="px-4 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc(member.imagePath)}
                  alt={member.fullName}
                  className="h-10 w-10 rounded-lg object-cover ring-1 ring-line"
                />
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted">{member.username}</td>
              <td className="px-4 py-3 font-medium text-ink">{member.fullName}</td>
              <td className="px-4 py-3 text-muted">{member.email}</td>
              <td className="px-4 py-3 text-muted">{member.phone}</td>
              <td className="px-4 py-3 text-muted">{member.product}</td>
              <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">
                {formatAmount(member.amount, member.currency, locale)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-muted">
                {formatDate(member.registrationDate, locale)}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <button
                    type="button"
                    title={t("view")}
                    aria-label={t("view")}
                    onClick={(event) => {
                      event.stopPropagation();
                      router.push(memberDetails(member.id));
                    }}
                    className="rounded-md p-2 text-muted hover:bg-brand/10 hover:text-brand"
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    title={t("edit")}
                    aria-label={t("edit")}
                    onClick={(event) => {
                      event.stopPropagation();
                      router.push(memberEdit(member.id));
                    }}
                    className="rounded-md p-2 text-muted hover:bg-brand/10 hover:text-brand"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    title={t("delete")}
                    aria-label={t("delete")}
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(member);
                    }}
                    className="rounded-md p-2 text-muted hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
