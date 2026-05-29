import { redirect } from "next/navigation";
import { NoAccessScreen } from "@/components/auth/NoAccessScreen";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { hasActiveAccess } from "@/lib/auth/access";
import { getCurrentLanguage } from "@/lib/i18nServer";

export const dynamic = "force-dynamic";

export default async function NoAccessPage() {
  const language = getCurrentLanguage();
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (hasActiveAccess(user)) {
    redirect("/");
  }

  return <NoAccessScreen language={language} />;
}
