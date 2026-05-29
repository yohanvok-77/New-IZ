import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { hasActiveAccess } from "@/lib/auth/access";
import { getDictionary } from "@/lib/i18n";
import { getCurrentLanguage } from "@/lib/i18nServer";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const language = getCurrentLanguage();
  const t = getDictionary(language);
  const user = await getCurrentUser();

  if (user) {
    redirect(hasActiveAccess(user) ? "/" : "/no-access");
  }

  return (
    <AuthLayout title={t.authLoginTitle} subtitle={t.authLoginSubtitle} language={language}>
      <LoginForm language={language} />
    </AuthLayout>
  );
}
