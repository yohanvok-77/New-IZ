"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { Language } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export function LoginForm({ language }: { language: Language }) {
  const router = useRouter();
  const t = getDictionary(language);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const data = await response.json();

    setLoading(false);

    if (!response.ok) {
      setError(language === "ru" ? data.message || t.loginFailed : t.loginFailed);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-bold text-muted">{t.email}</span>
        <input
          name="email"
          type="email"
          required
          className="rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-text outline-none transition focus:border-blue/60"
          placeholder="you@example.com"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-bold text-muted">{t.password}</span>
        <input
          name="password"
          type="password"
          required
          className="rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-text outline-none transition focus:border-blue/60"
          placeholder={t.passwordPlaceholder}
        />
      </label>

      {error ? <p className="rounded-2xl border border-danger/25 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-2xl bg-blue px-5 py-3 font-black text-white shadow-glow transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? t.loggingIn : t.login}
      </button>

      <p className="text-center text-sm text-muted">
        {t.noAccount}{" "}
        <Link href="/register" className="font-black text-blue hover:text-white">
          {t.createAccount}
        </Link>
      </p>
    </form>
  );
}
