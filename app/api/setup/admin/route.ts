import { NextResponse } from "next/server";
import { hashPassword, isValidPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function isAuthorized(request: Request) {
  const expectedSecret = process.env.SETUP_SECRET;
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  const authHeader = request.headers.get("authorization");
  const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : null;

  return Boolean(expectedSecret && (querySecret === expectedSecret || bearerSecret === expectedSecret));
}

async function createInitialAdmin(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL || "");
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const adminName = process.env.ADMIN_NAME || "Admin";

  if (!isValidEmail(adminEmail) || !isValidPassword(adminPassword)) {
    return NextResponse.json(
      { message: "ADMIN_EMAIL or ADMIN_PASSWORD is missing/invalid." },
      { status: 400 },
    );
  }

  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });

  if (adminCount > 0) {
    return NextResponse.json({ message: "Admin already exists.", created: false });
  }

  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash: await hashPassword(adminPassword),
      role: "ADMIN",
      status: "ACTIVE",
      accessUntil: addMonths(new Date(), 12),
    },
    select: {
      id: true,
      email: true,
      role: true,
      accessUntil: true,
    },
  });

  return NextResponse.json({
    message: "Admin created.",
    created: true,
    admin: {
      ...admin,
      accessUntil: admin.accessUntil?.toISOString() || null,
    },
  });
}

export async function GET(request: Request) {
  return createInitialAdmin(request);
}

export async function POST(request: Request) {
  return createInitialAdmin(request);
}
