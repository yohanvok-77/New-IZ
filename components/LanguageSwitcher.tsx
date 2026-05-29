"use client";

import { useRouter } from "next/navigation";
import { LANGUAGE_COOKIE, type Language } from "@/lib/i18n";

interface LanguageSwitcherProps {
  language: Language;
}

export function LanguageSwitcher({ language }: LanguageSwitcherProps) {
  const router = useRouter();

  function setLanguage(nextLanguage: Language) {
    document.cookie = `${LANGUAGE_COOKIE}=${nextLanguage}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="inline-flex rounded-full border border-white/12 bg-white/[0.06] p-1 backdrop-blur-xl">
      {(["ru", "en"] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLanguage(item)}
          className={[
            "rounded-full px-3 py-1.5 text-xs font-black transition",
            language === item ? "bg-blue text-white shadow-glow" : "text-muted hover:text-text",
          ].join(" ")}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
