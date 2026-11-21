import { setRequestLocale } from "next-intl/server";
import { Layout } from "../../../../components/Layout/Layout";
import { ProfileContent } from "../../../../components/ProfileContent/ProfileContent";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Layout>
      <ProfileContent />
    </Layout>
  );
}
