import { NextResponse } from "next/server";
import {
  importTelegramSignal,
  serializeImportedSignal,
} from "@/src/lib/signals/import-telegram-signal";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const expectedSecret = process.env.TELEGRAM_IMPORT_SECRET;
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";

  return Boolean(expectedSecret && token && token === expectedSecret);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text : "";
    const winrate = typeof body.winrate === "number" ? body.winrate : undefined;
    const expiresInHours = typeof body.expiresInHours === "number" ? body.expiresInHours : undefined;
    const publishedAt = typeof body.publishedAt === "string" ? new Date(body.publishedAt) : undefined;

    if (!text.trim()) {
      return NextResponse.json({ message: "Signal text is required." }, { status: 400 });
    }

    const result = await importTelegramSignal({
      text,
      winrate,
      expiresInHours,
      publishedAt,
    });

    return NextResponse.json(serializeImportedSignal(result));
  } catch (error) {
    console.error("[telegram-import] failed to import signal", error);
    return NextResponse.json({ message: "Could not parse signal text." }, { status: 400 });
  }
}
