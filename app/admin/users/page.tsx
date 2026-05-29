import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ForbiddenAdmin } from "@/components/admin/ForbiddenAdmin";
import { UsersTable } from "@/components/admin/UsersTable";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getDictionary } from "@/lib/i18n";
import { getCurrentLanguage } from "@/lib/i18nServer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const language = getCurrentLanguage();
  const t = getDictionary(language);
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    return <ForbiddenAdmin language={language} />;
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      accessUntil: true,
      createdAt: true,
    },
  });

  return (
    <AdminLayout
      title={t.users}
      language={language}
      currentUser={{
        name: user.name,
        email: user.email,
        role: user.role,
        accessUntil: user.accessUntil?.toISOString() || null,
      }}
    >
      <UsersTable
        language={language}
        users={users.map((item) => ({
          ...item,
          accessUntil: item.accessUntil?.toISOString() || null,
          createdAt: item.createdAt.toISOString(),
        }))}
      />
    </AdminLayout>
  );
}
