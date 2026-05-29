import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import {
  importTelegramSignal,
  serializeImportedSignal,
} from "@/src/lib/signals/import-telegram-signal";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await getCurrentUser();

  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ message: "Not enough permissions." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text : "";
    const winrate = typeof body.winrate === "number" ? body.winrate : undefined;
    const expiresInHours = typeof body.expiresInHours === "number" ? body.expiresInHours : undefined;

    if (!text.trim()) {
      return NextResponse.json({ message: "Signal text is required." }, { status: 400 });
    }

    const result = await importTelegramSignal({ text, winrate, expiresInHours });

    return NextResponse.json(serializeImportedSignal(result));
  } catch (error) {
    console.error("[signal-import] failed to import telegram signal", error);
    return NextResponse.json({ message: "Could not parse signal text." }, { status: 400 });
  }
}
