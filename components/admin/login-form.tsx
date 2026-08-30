"use client";

import { FormEvent, useState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Brand } from "@/components/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get("erro") === "sem-permissao" ? "Esta conta não tem permissão administrativa." : "");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Configure as variáveis do Supabase antes de acessar o painel.");
      return;
    }
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: String(data.get("email") || ""),
        password: String(data.get("password") || "")
      });
      if (authError) {
        setError("E-mail ou senha inválidos.");
        setLoading(false);
        return;
      }

      const { data: admin, error: permissionError } = await supabase
        .from("admin_users")
        .select("id")
        .maybeSingle();

      if (permissionError || !admin) {
        await supabase.auth.signOut();
        setError("Esta conta não tem permissão administrativa.");
        setLoading(false);
        return;
      }

      window.location.assign("/admin");
    } catch {
      setError("Não foi possível concluir o acesso. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <main className="grain relative grid min-h-screen place-items-center overflow-hidden bg-[#03060d] p-4">
      <div className="absolute h-[32rem] w-[32rem] rounded-full border border-[#0b66ff]/20 shadow-[0_0_180px_rgba(11,102,255,.2)]" />
      <div className="relative z-10 w-full max-w-md rounded-[1.5rem] border border-white/10 bg-[#071126]/88 p-7 shadow-2xl backdrop-blur-xl sm:p-9">
        <Brand />
        <div className="mt-12 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#0b66ff]/15 text-[#62b8ff]"><LockKeyhole className="h-4 w-4" /></span><div><h1 className="text-lg font-bold">Painel administrativo</h1><p className="mt-1 text-sm text-white/42">Entre para gerenciar o site.</p></div></div>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block text-[0.65rem] font-bold uppercase tracking-[0.13em] text-white/58">E-mail<input name="email" type="email" required autoComplete="email" className="field mt-2" /></label>
          <label className="block text-[0.65rem] font-bold uppercase tracking-[0.13em] text-white/58">Senha<input name="password" type="password" required autoComplete="current-password" minLength={8} className="field mt-2" /></label>
          {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300" role="alert">{error}</p>}
          <button type="submit" disabled={loading} className="button-primary w-full disabled:opacity-60">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{loading ? "Entrando" : "Entrar"}</button>
        </form>
        <Link href="/" className="mt-6 block text-center text-xs text-white/38 hover:text-white">← Voltar ao site</Link>
      </div>
    </main>
  );
}
