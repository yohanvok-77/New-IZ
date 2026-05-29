import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ForbiddenAdmin } from "@/components/admin/ForbiddenAdmin";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getDictionary } from "@/lib/i18n";
import { getCurrentLanguage } from "@/lib/i18nServer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
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
    select: { status: true, accessUntil: true },
  });
  const now = Date.now();
  const total = users.length;
  const activeAccess = users.filter(
    (item) => item.status !== "BLOCKED" && item.accessUntil && item.accessUntil.getTime() > now,
  ).length;
  const expired = users.filter((item) => item.accessUntil && item.accessUntil.getTime() <= now).length;
  const blocked = users.filter((item) => item.status === "BLOCKED").length;
  const stats = [
    [t.totalUsers, total, "text-blue"],
    [t.activeAccess, activeAccess, "text-success"],
    [t.expiredAccess, expired, "text-gold"],
    [t.blockedUsers, blocked, "text-danger"],
  ];

  return (
    <AdminLayout
      title={t.adminTitle}
      language={language}
      currentUser={{
        name: user.name,
        email: user.email,
        role: user.role,
        accessUntil: user.accessUntil?.toISOString() || null,
      }}
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, color]) => (
          <article key={label} className="glass-panel rounded-3xl p-5">
            <p className="text-sm font-semibold text-muted">{label}</p>
            <strong className={`mt-4 block text-4xl font-black ${color}`}>{value}</strong>
          </article>
        ))}
      </section>
    </AdminLayout>
  );
}
