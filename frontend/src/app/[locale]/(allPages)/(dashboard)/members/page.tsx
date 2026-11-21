import { setRequestLocale } from "next-intl/server";
import { Layout } from "../../../../components/Layout/Layout";
import { MembersPageContent } from "../../../../components/MembersPageContent/MembersPageContent";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Layout>
      <MembersPageContent />
    </Layout>
  );
}
