import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export const getCurrentUser = cache(async () => {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      accessUntil: true,
      createdAt: true,
      updatedAt: true,
    },
  });
});
