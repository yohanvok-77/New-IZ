import type { User, UserRole, UserStatus } from "@prisma/client";

export type AccessUser =
  | Pick<User, "status" | "accessUntil">
  | {
      status: UserStatus | "active" | "blocked";
      accessUntil: Date | string | null;
    };

export function hasActiveAccess(user: AccessUser | null | undefined) {
  if (!user) {
    return false;
  }

  const status = String(user.status).toLowerCase();

  return Boolean(
    status !== "blocked" &&
      user.accessUntil &&
      new Date(user.accessUntil).getTime() > Date.now(),
  );
}

export function getRoleLabel(role: UserRole) {
  return role === "ADMIN" ? "Admin" : "User";
}

export function getUserStatusLabel(status: UserStatus) {
  return status === "BLOCKED" ? "Заблокирован" : "Активен";
}
