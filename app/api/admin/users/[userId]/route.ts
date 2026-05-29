import { NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/currentUser";
import {
  blockUser,
  changeUserRole,
  grantAccess,
  revokeAccess,
  unblockUser,
  type AccessDuration,
} from "@/lib/admin/accessActions";

export const runtime = "nodejs";

interface RouteContext {
  params: {
    userId: string;
  };
}

export async function POST(request: Request, context: RouteContext) {
  const admin = await getCurrentUser();

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ message: "Недостаточно прав." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const action = typeof body.action === "string" ? body.action : "";
    const userId = context.params.userId;

    if (action === "grant") {
      await grantAccess({
        userId,
        adminId: admin.id,
        duration: body.duration as AccessDuration,
        customDate: typeof body.customDate === "string" ? body.customDate : undefined,
      });
    } else if (action === "revoke") {
      await revokeAccess(userId, admin.id);
    } else if (action === "block") {
      await blockUser(userId, admin.id);
    } else if (action === "unblock") {
      await unblockUser(userId, admin.id);
    } else if (action === "role") {
      const role = body.role === "ADMIN" ? "ADMIN" : "USER";
      await changeUserRole(userId, role as UserRole, admin.id);
    } else {
      return NextResponse.json({ message: "Неизвестное действие." }, { status: 400 });
    }

    return NextResponse.json({ message: "Изменения сохранены." });
  } catch (error) {
    if (error instanceof Error && error.message === "LAST_ADMIN") {
      return NextResponse.json(
        { message: "Нельзя снять роль admin у последнего администратора." },
        { status: 400 },
      );
    }

    if (
      error instanceof Error &&
      (error.message === "INVALID_DURATION" || error.message === "INVALID_CUSTOM_DATE")
    ) {
      return NextResponse.json({ message: "Проверьте срок доступа." }, { status: 400 });
    }

    return NextResponse.json({ message: "Не удалось выполнить действие." }, { status: 500 });
  }
}
