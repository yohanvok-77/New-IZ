import { redirect } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { hasActiveAccess } from "@/lib/auth/access";
import { getCurrentLanguage } from "@/lib/i18nServer";

export const dynamic = "force-dynamic";

export default async function SignalsPage() {
  const language = getCurrentLanguage();
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!hasActiveAccess(user)) {
    redirect("/no-access");
  }

  return (
    <Dashboard
      currentUser={{
        name: user.name,
        email: user.email,
        role: user.role,
        accessUntil: user.accessUntil?.toISOString() || null,
      }}
      language={language}
    />
  );
}
