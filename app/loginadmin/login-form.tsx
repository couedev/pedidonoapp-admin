"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/app/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const { error: signInError } = await getSupabaseClient().auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("E-mail ou senha inválidos.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Não foi possível iniciar sessão. Verifique a configuração do Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="email">
        E-mail
      </label>
      <input
        className="h-12 w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500"
        id="email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="E-mail"
        required
        disabled={isSubmitting}
      />
      <label className="sr-only" htmlFor="password">
        Senha
      </label>
      <input
        className="h-12 w-full rounded-lg border border-white/10 bg-white/[0.06] px-4 text-white outline-none placeholder:text-zinc-500 focus:border-zinc-500"
        id="password"
        type="password"
        name="password"
        autoComplete="current-password"
        placeholder="Senha"
        required
        disabled={isSubmitting}
      />
      {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
      <button
        className="h-12 w-full rounded-lg bg-white text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200 focus:outline-none focus:ring-4 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
