"use client";

import { useActionState, useState } from "react";
import { resetPasswordAction } from "@/actions/auth";
import { Heart, Lock, Mail, Loader2, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

        {/* Card */}
        <div className="card p-8 bg-white/80 backdrop-blur-sm border-[var(--color-brand-100)]">
          {state?.success ? (
            <div className="text-center space-y-6 animate-fade-in py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--color-brand-900)]">Senha Redefinida!</h2>
                <p className="text-[var(--color-text-muted)] text-sm mt-2">
                  Sua senha foi alterada com sucesso. Você já pode acessar o sistema com sua nova senha.
                </p>
              </div>
              <Link 
                href="/login" 
                className="btn btn-primary w-full justify-center py-2.5 text-base"
              >
                Voltar para o Login
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[var(--color-brand-900)]">
                  Redefinir Senha
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Informe seu e-mail e escolha uma nova senha para acessar o sistema.
                </p>
              </div>

              <form action={formAction} className="space-y-5">
                {/* E-mail */}
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
                      className="input pl-icon"
                    />
                  </div>
                  {state?.errors?.email && (
                    <p className="text-xs text-danger mt-1">
                      {state.errors.email[0]}
                    </p>
                  )}
                </div>

                {/* Nova Senha */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[var(--color-brand-800)] mb-1.5"
                  >
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-brand-400)]" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="input pl-icon pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-400)] hover:text-[var(--color-brand-600)] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {state?.errors?.password && (
                    <p className="text-xs text-danger mt-1">
                      {state.errors.password[0]}
                    </p>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-[var(--color-brand-800)] mb-1.5"
                  >
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-brand-400)]" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="input pl-icon pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-brand-400)] hover:text-[var(--color-brand-600)] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {state?.errors?.confirmPassword && (
                    <p className="text-xs text-danger mt-1">
                      {state.errors.confirmPassword[0]}
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
                      Redefinindo...
                    </>
                  ) : (
                    <>
                      Redefinir senha
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Lembrou a senha?{" "}
                  <Link
                    href="/login"
                    className="text-[var(--color-brand-600)] font-medium hover:underline"
                  >
                    Voltar para o login
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        <p className="text-center mt-8 text-xs text-[var(--color-text-light)]">
          © {new Date().getFullYear()} SaberCuidar. Sistema Restrito.
        </p>
      </div>
    </div>
  );
}
