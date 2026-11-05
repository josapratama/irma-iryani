"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { api, getAuthToken, setAuthToken, setAuthEmail } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDirect, setShowDirect] = useState(false);
  const [ssoConfig, setSsoConfig] = useState({
    authhub_url: "https://auth.josapratama.com",
    client_id: "ah_client_irma_5a6b7c",
    client_slug: "irma-iryani",
  });

  // Jika sudah punya token, redirect ke /admin
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.admin
        .getMe()
        .then(() => {
          router.replace("/admin");
        })
        .catch(() => {
          // Token expired atau invalid
        });
    }

    api.admin
      .getAuthHubConfig()
      .then((cfg) => {
        if (cfg) setSsoConfig(cfg);
      })
      .catch(() => {});
  }, [router]);

  const handleAuthHubSSO = () => {
    const redirectUri = `${window.location.origin}/auth/callback`;
    const ssoUrl = `${ssoConfig.authhub_url}/?oauth=1&client_id=${ssoConfig.client_id}&client_slug=${ssoConfig.client_slug}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=irma_sso&response_type=code`;
    window.location.href = ssoUrl;
  };

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
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-brown)]/10 border border-[var(--color-brown)]/20 text-[var(--color-brown)] mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-main)]">
              Admin Irma Iryani
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Pusat Otentikasi Dashboard Portfolio
            </p>
          </div>

          {/* Info Notice */}
          <div className="mb-6 p-3.5 rounded-xl bg-[var(--color-brown)]/10 border border-[var(--color-brown)]/20 text-xs text-[var(--color-text-main)] leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 text-[var(--color-brown)] mb-1">
              <span>🌸</span>
              <span>AuthHub Dedicated SSO</span>
            </div>
            Login menggunakan akun khusus <strong>Irma Iryani</strong> di AuthHub. Pendaftaran publik dinonaktifkan demi privasi dan keamanan data portfolio.
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2 animate-in fade-in">
              <span className="font-bold">⚠️</span>
              <span className="flex-1 leading-relaxed">{error}</span>
            </div>
          )}

          {/* Primary SSO Button */}
          <button
            type="button"
            onClick={handleAuthHubSSO}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:opacity-95 active:scale-[0.99] text-white font-semibold text-xs shadow-lg shadow-amber-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Masuk dengan AuthHub SSO</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Toggle Direct Login */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setShowDirect(!showDirect)}
              className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-brown)] inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{showDirect ? "Sembunyikan Login Manual" : "Login Manual / Sandi"}</span>
              {showDirect ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Form Direct Login */}
          {showDirect && (
            <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-[var(--color-brown-light)]/20 space-y-3.5 animate-in fade-in">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1"
                >
                  Email Admin
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="irma@josapratama.com"
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/30 focus:border-[var(--color-brown)] outline-none transition-all placeholder:text-[var(--color-text-muted)]/50 text-[var(--color-text-main)]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-[11px] font-semibold text-[var(--color-text-main)] mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/30 focus:border-[var(--color-brown)] outline-none transition-all placeholder:text-[var(--color-text-muted)]/50 text-[var(--color-text-main)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-brown)] transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-xl bg-[var(--color-brown)] hover:bg-[var(--color-brown-dark)] active:scale-[0.99] text-white font-medium text-xs shadow-md shadow-[var(--color-brown)]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <span>Masuk Manual</span>
                )}
              </button>
            </form>
          )}

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-[var(--color-brown-light)]/15 text-center">
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Portfolio Resmi Irma Iryani • Hak Akses Terbatas
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
