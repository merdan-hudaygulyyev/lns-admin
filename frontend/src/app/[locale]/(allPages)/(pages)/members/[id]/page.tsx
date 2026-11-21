import { setRequestLocale } from "next-intl/server";
import { Layout } from "../../../../../components/Layout/Layout";
import { MemberDetailsContent } from "../../../../../components/MemberDetailsContent/MemberDetailsContent";

export default async function MemberDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <Layout>
      <MemberDetailsContent id={id} />
    </Layout>
  );
}
