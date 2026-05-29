import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, isValidPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { getStringValue, isValidEmail, normalizeEmail } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = getStringValue(body.name);
    const email = normalizeEmail(getStringValue(body.email));
    const password = getStringValue(body.password);
    const confirmPassword = getStringValue(body.confirmPassword);

    if (!name || !isValidEmail(email) || !isValidPassword(password) || password !== confirmPassword) {
      return NextResponse.json(
        { message: "Проверьте имя, email и пароль. Пароль должен быть не короче 8 символов." },
        { status: 400 },
      );
    }

    const exists = await prisma.user.findUnique({ where: { email } });

    if (exists) {
      return NextResponse.json({ message: "Пользователь с таким email уже существует." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        role: "USER",
        status: "ACTIVE",
        accessUntil: null,
      },
      select: { id: true, role: true },
    });

    await setSessionCookie({ userId: user.id, role: user.role });

    return NextResponse.json({
      message: "Аккаунт создан. Доступ к торговым идеям будет активирован администратором.",
    });
  } catch {
    return NextResponse.json(
      { message: "Не удалось создать аккаунт. Попробуйте позже." },
      { status: 500 },
    );
  }
}
