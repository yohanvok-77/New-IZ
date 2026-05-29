import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";

export const SESSION_COOKIE_NAME = "trading_ideas_session";

export interface SessionPayload {
  userId: string;
  role: UserRole;
}

const encoder = new TextEncoder();

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET || "dev-secret-change-me-for-production-32-chars";
  return encoder.encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ userId: payload.userId, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSessionSecret());
}

export async function readSessionToken(token?: string): Promise<SessionPayload | null> {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecret());

    if (typeof payload.userId !== "string" || (payload.role !== "USER" && payload.role !== "ADMIN")) {
      return null;
    }

    return {
      userId: payload.userId,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function getSession() {
  return readSessionToken(cookies().get(SESSION_COOKIE_NAME)?.value);
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);

  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
