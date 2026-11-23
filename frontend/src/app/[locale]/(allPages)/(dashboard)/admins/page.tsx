import { setRequestLocale } from "next-intl/server";
import { AdminsContent } from "../../../../components/AdminsContent/AdminsContent";
import { Layout } from "../../../../components/Layout/Layout";

export default async function AdminsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Layout>
      <AdminsContent />
    </Layout>
  );
}
