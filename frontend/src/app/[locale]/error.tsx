"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("errors");
  const common = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="card mx-auto mt-16 max-w-lg p-8 text-center">
      <AlertTriangle className="mx-auto h-10 w-10 text-danger" aria-hidden="true" />
      <h1 className="mt-4 text-lg font-semibold text-ink">{t("generic")}</h1>
      <button type="button" onClick={reset} className="btn-primary mx-auto mt-6">
        {common("retry")}
      </button>
    </div>
  );
}
