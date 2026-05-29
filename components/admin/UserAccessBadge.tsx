import type { UserRole, UserStatus } from "@prisma/client";
import { formatDate } from "@/lib/format";
import type { Language } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

interface UserAccessBadgeProps {
  accessUntil: string | null;
  status: UserStatus;
  language: Language;
}

export function UserAccessBadge({ accessUntil, status, language }: UserAccessBadgeProps) {
  const t = getDictionary(language);

  if (status === "BLOCKED") {
    return <span className="rounded-full border border-danger/30 bg-danger/15 px-3 py-1 text-xs font-black text-danger">{t.accessBlocked}</span>;
  }

  if (!accessUntil) {
    return <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-black text-muted">{t.accessNone}</span>;
  }

  const expired = new Date(accessUntil).getTime() <= Date.now();

  return expired ? (
    <span className="rounded-full border border-gold/35 bg-gold/15 px-3 py-1 text-xs font-black text-gold">
      {t.accessExpired} {formatDate(accessUntil)}
    </span>
  ) : (
    <span className="rounded-full border border-success/35 bg-success/15 px-3 py-1 text-xs font-black text-success">
      {t.accessActiveUntil} {formatDate(accessUntil)}
    </span>
  );
}

export function RoleBadge({ role, language }: { role: UserRole; language: Language }) {
  const t = getDictionary(language);

  return role === "ADMIN" ? (
    <span className="rounded-full border border-blue/35 bg-blue/15 px-3 py-1 text-xs font-black text-blue">{t.roleAdmin}</span>
  ) : (
    <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-black text-muted">{t.roleUser}</span>
  );
}
