import { setRequestLocale } from "next-intl/server";
import { redirect } from "../../i18n/navigation";
import { ROUTES } from "../utils/routes";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect({ href: ROUTES.members, locale });
}
