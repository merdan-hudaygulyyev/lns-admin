"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Pencil, ShieldAlert, Trash2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getMember } from "../../api/services/members";
import { Button, Card, Loader } from "../../compLibrary";
import { useRouter } from "../../../i18n/navigation";
import type { Member } from "../../types";
import { formatAmount, formatDate, imageDownloadSrc, imageSrc } from "../../utils/format";
import { memberEdit, ROUTES } from "../../utils/routes";
import { DeleteMemberModal } from "../DeleteMemberModal/DeleteMemberModal";

export function MemberDetailsContent({ id }: { id: string }) {
  const t = useTranslations("memberDetails");
  const fields = useTranslations("fields");
  const errorsT = useTranslations("errors");
  const locale = useLocale();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { data: member, isPending, isError } = useQuery({
    queryKey: ["member", id],
    queryFn: () => getMember(id),
  });

  const photos = member?.imagePaths?.length
    ? member.imagePaths
    : member?.imagePath
      ? [member.imagePath]
      : [];

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current === null ? null : (current + 1) % photos.length));
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) =>
          current === null ? null : (current - 1 + photos.length) % photos.length,
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, photos.length]);

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

      <div className="grid gap-5 lg:grid-cols-[minmax(280px,380px)_1fr]">
        <Card title={t("photos")} subtitle={t("imageCount", { count: photos.length })}>
          {photos.length === 0 ? (
            <p className="text-sm text-muted">{t("noImages")}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((path, index) => (
                <div
                  key={`${path}-${index}`}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-surface-2"
                >
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={t("imageAlt", { name: member.fullName, index: index + 1 })}
                    className="absolute inset-0 h-full w-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageSrc(path)}
                      alt={t("imageAlt", { name: member.fullName, index: index + 1 })}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {t("viewImage")}
                    </span>
                  </button>
                  <a
                    href={imageDownloadSrc(path)}
                    download
                    aria-label={t("downloadImage", { index: index + 1 })}
                    title={t("downloadImage", { index: index + 1 })}
                    className="absolute right-2 top-2 z-10 rounded-md bg-black/60 p-1.5 text-white transition hover:bg-black/80"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
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

      {activeIndex !== null && photos[activeIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("photos")}
          onClick={() => setActiveIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            aria-label={t("closeImage")}
            className="absolute right-4 top-4 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          <a
            href={imageDownloadSrc(photos[activeIndex])}
            download
            aria-label={t("downloadImage", { index: activeIndex + 1 })}
            title={t("downloadImage", { index: activeIndex + 1 })}
            className="absolute right-16 top-4 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <Download className="h-5 w-5" aria-hidden="true" />
          </a>

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex((current) => (current === null ? null : (current - 1 + photos.length) % photos.length));
              }}
              aria-label={t("previousImage")}
              className="absolute left-4 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 sm:left-8"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc(photos[activeIndex])}
            alt={t("imageAlt", { name: member.fullName, index: activeIndex + 1 })}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[82vh] max-w-full rounded-xl object-contain shadow-2xl"
          />

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex((current) => (current === null ? null : (current + 1) % photos.length));
              }}
              aria-label={t("nextImage")}
              className="absolute right-4 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 sm:right-8"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          )}

          <span className="absolute bottom-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
            {t("imageCounter", { current: activeIndex + 1, total: photos.length })}
          </span>
        </div>
      )}

      <DeleteMemberModal
        member={deleteOpen ? (member as Member) : null}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => router.push(ROUTES.members)}
      />
    </div>
  );
}
