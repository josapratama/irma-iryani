"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { api, getAuthToken, setAuthToken, setAuthEmail } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Jika sudah punya token, cek validitas ke backend dan redirect ke /admin
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.admin
        .getMe()
        .then(() => {
          router.replace("/admin");
        })
        .catch(() => {
          // Token expired atau invalid, biarkan di halaman login
        });
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await api.admin.login({
        email: email.trim(),
        password,
      });

      if (data.token) {
        setAuthToken(data.token);
        if (data.email) {
          setAuthEmail(data.email);
        }
        router.push("/admin");
      } else {
        throw new Error("Token tidak diterima dari server");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal login. Periksa email dan password Anda.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--color-cream)] text-[var(--color-text-main)]">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[var(--color-brown)]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-brown)] transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Kembali ke Portfolio</span>
        </Link>

        {/* Card */}
        <div className="bg-[var(--color-cream-dark)]/50 dark:bg-[var(--color-cream-dark)]/20 backdrop-blur-xl border border-[var(--color-brown-light)]/20 rounded-2xl p-6 sm:p-8 shadow-xl shadow-[var(--color-brown-dark)]/5">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-brown)]/10 border border-[var(--color-brown)]/20 text-[var(--color-brown)] mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-main)]">
              Admin Login
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Masuk untuk mengelola data portfolio Irma Iryani
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2 animate-in fade-in">
              <span className="font-bold">⚠️</span>
              <span className="flex-1 leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5"
              >
                Email Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@josapratama.com"
                  className="w-full pl-9.5 pr-4 py-2.5 text-xs rounded-xl bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/30 focus:border-[var(--color-brown)] focus:ring-2 focus:ring-[var(--color-brown)]/20 outline-none transition-all placeholder:text-[var(--color-text-muted)]/50 text-[var(--color-text-main)]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[var(--color-text-main)] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9.5 pr-10 py-2.5 text-xs rounded-xl bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/30 focus:border-[var(--color-brown)] focus:ring-2 focus:ring-[var(--color-brown)]/20 outline-none transition-all placeholder:text-[var(--color-text-muted)]/50 text-[var(--color-text-main)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-brown)] transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[var(--color-brown)] hover:bg-[var(--color-brown-dark)] active:scale-[0.99] text-white font-medium text-xs shadow-md shadow-[var(--color-brown)]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-[var(--color-brown-light)]/15 text-center">
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Panel Pengelola Konten & Database Portfolio
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
