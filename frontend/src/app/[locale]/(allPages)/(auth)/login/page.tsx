import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "../../../../components/LoginForm/LoginForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <LoginForm />
    </div>
  );
}
