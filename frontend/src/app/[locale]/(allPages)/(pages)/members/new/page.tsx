import { setRequestLocale } from "next-intl/server";
import { Layout } from "../../../../../components/Layout/Layout";
import { MemberForm } from "../../../../../components/MemberForm/MemberForm";

export default async function NewMemberPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Layout>
      <MemberForm mode="create" />
    </Layout>
  );
}
