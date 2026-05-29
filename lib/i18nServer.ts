import { cookies } from "next/headers";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/i18n";

export function getCurrentLanguage() {
  return normalizeLanguage(cookies().get(LANGUAGE_COOKIE)?.value);
}
