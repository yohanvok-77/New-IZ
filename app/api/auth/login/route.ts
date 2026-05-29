import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { getStringValue, isValidEmail, normalizeEmail } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(getStringValue(body.email));
    const password = getStringValue(body.password);

    if (!isValidEmail(email) || !password) {
      return NextResponse.json({ message: "Введите корректный email и пароль." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true, passwordHash: true },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ message: "Неверный email или пароль." }, { status: 401 });
    }

    await setSessionCookie({ userId: user.id, role: user.role });

    return NextResponse.json({ message: "Вы вошли в аккаунт." });
  } catch {
    return NextResponse.json({ message: "Не удалось войти. Попробуйте позже." }, { status: 500 });
  }
}
