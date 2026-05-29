import Link from "next/link";
import type { Language } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export function ForbiddenAdmin({ language }: { language: Language }) {
  const t = getDictionary(language);

  return (
    <main className="relative min-h-screen bg-base px-4 py-8 text-text">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center">
        <div className="glass-panel rounded-[2rem] p-8 text-center">
          <h1 className="text-4xl font-black">403</h1>
          <p className="mt-3 text-muted">{t.forbiddenText}</p>
          <Link className="mt-6 inline-flex rounded-2xl bg-blue px-5 py-3 font-black text-white" href="/">
            {t.back}
          </Link>
        </div>
      </section>
    </main>
  );
}
