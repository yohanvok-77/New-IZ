import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AccessDuration = "7d" | "1m" | "3m" | "6m" | "12m" | "custom";

interface GrantAccessInput {
  userId: string;
  adminId: string;
  duration: AccessDuration;
  customDate?: string;
}

export async function grantAccess({ userId, adminId, duration, customDate }: GrantAccessInput) {
  if (!isValidDuration(duration)) {
    throw new Error("INVALID_DURATION");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const oldValue = user.accessUntil?.toISOString() || null;
  const baseDate =
    user.accessUntil && user.accessUntil.getTime() > Date.now() ? new Date(user.accessUntil) : new Date();
  const accessUntil = duration === "custom" ? parseCustomDate(customDate) : addDuration(baseDate, duration);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { accessUntil, status: "ACTIVE" },
  });

  await writeAccessLog(adminId, userId, `grant_access:${duration}`, oldValue, accessUntil.toISOString());

  return updated;
}

export async function revokeAccess(userId: string, adminId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { accessUntil: null },
  });

  await writeAccessLog(adminId, userId, "revoke_access", user.accessUntil?.toISOString() || null, null);

  return updated;
}

export async function blockUser(userId: string, adminId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: "BLOCKED" },
  });

  await writeAccessLog(adminId, userId, "block_user", "ACTIVE", "BLOCKED");

  return user;
}

export async function unblockUser(userId: string, adminId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
  });

  await writeAccessLog(adminId, userId, "unblock_user", "BLOCKED", "ACTIVE");

  return user;
}

export async function changeUserRole(userId: string, role: UserRole, adminId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (user.role === "ADMIN" && role === "USER") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });

    if (adminCount <= 1) {
      throw new Error("LAST_ADMIN");
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  await writeAccessLog(adminId, userId, "change_role", user.role, role);

  return updated;
}

function addDuration(base: Date, duration: Exclude<AccessDuration, "custom">) {
  const next = new Date(base);

  if (duration === "7d") {
    next.setDate(next.getDate() + 7);
    return next;
  }

  const months = {
    "1m": 1,
    "3m": 3,
    "6m": 6,
    "12m": 12,
  }[duration];

  next.setMonth(next.getMonth() + months);
  return next;
}

function isValidDuration(duration: string): duration is AccessDuration {
  return ["7d", "1m", "3m", "6m", "12m", "custom"].includes(duration);
}

function parseCustomDate(customDate?: string) {
  if (!customDate) {
    throw new Error("INVALID_CUSTOM_DATE");
  }

  const date = new Date(`${customDate}T23:59:59`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("INVALID_CUSTOM_DATE");
  }

  return date;
}

function writeAccessLog(
  adminId: string,
  userId: string,
  action: string,
  oldValue: string | null,
  newValue: string | null,
) {
  return prisma.accessLog.create({
    data: {
      adminId,
      userId,
      action,
      oldValue,
      newValue,
    },
  });
}
