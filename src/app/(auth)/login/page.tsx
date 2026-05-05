"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { Heart, Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 gradient-brand-soft">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-brand shadow-lg mb-4 animate-pulse-brand">
            <Heart className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-brand-900)]">
            Saber<span className="text-[var(--color-brand-600)]">Cuidar</span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Gestão inteligente para Home Care
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-8 bg-white/80 backdrop-blur-sm border-[var(--color-brand-100)]">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[var(--color-brand-900)]">
              Bem-vindo de volta
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Acesse sua conta para gerenciar seus pacientes.
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--color-brand-800)] mb-1.5"
              >
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-brand-400)]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  required
                  className="input pl-10"
                  defaultValue="admin@sabercuidar.com.br"
                />
              </div>
              {state?.errors?.email && (
                <p className="text-xs text-danger mt-1">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[var(--color-brand-800)]"
                >
                  Senha
                </label>
                <Link
                  href="#"
                  className="text-xs text-[var(--color-brand-600)] hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-brand-400)]" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="input pl-10"
                  defaultValue="123456"
                />
              </div>
              {state?.errors?.password && (
                <p className="text-xs text-danger mt-1">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            {state?.message && !state?.errors && (
              <div className="p-3 rounded-md bg-red-50 border border-red-100 text-xs text-red-600">
                {state.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary w-full justify-center py-2.5 text-base"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar no sistema
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              Ainda não tem acesso?{" "}
              <Link
                href="/"
                className="text-[var(--color-brand-600)] font-medium hover:underline"
              >
                Saiba mais
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-[var(--color-text-light)]">
          © {new Date().getFullYear()} SaberCuidar. Sistema Restrito.
        </p>
      </div>
    </div>
  );
}
