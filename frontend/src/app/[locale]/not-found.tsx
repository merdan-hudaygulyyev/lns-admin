import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("errors");
  return (
    <div className="card mx-auto mt-16 max-w-lg p-8 text-center">
      <h1 className="text-4xl font-bold text-ink">404</h1>
      <p className="mt-3 text-sm text-muted">{t("notFound")}</p>
    </div>
  );
}
