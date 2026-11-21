import { setRequestLocale } from "next-intl/server";
import { Layout } from "../../../../../../components/Layout/Layout";
import { MemberEditContent } from "../../../../../../components/MemberEditContent/MemberEditContent";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <Layout>
      <MemberEditContent id={id} />
    </Layout>
  );
}
