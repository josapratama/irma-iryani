"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { api, setAuthToken, setAuthEmail } from "@/lib/api";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");
    const errorDesc = searchParams.get("error_description");

    if (errorParam || errorDesc) {
      setError(errorDesc || errorParam || "Otorisasi SSO AuthHub dibatalkan.");
      setIsProcessing(false);
      return;
    }

    if (!code) {
      setError("Parameter kode otorisasi tidak ditemukan.");
      setIsProcessing(false);
      return;
    }

    const redirectUri = `${window.location.origin}/auth/callback`;

    api.admin
      .authHubCallback({ code, redirect_uri: redirectUri })
      .then((data) => {
        if (data.token) {
          setAuthToken(data.token);
          if (data.email) {
            setAuthEmail(data.email);
          }
          // Clean history URL state
          window.history.replaceState({}, document.title, "/admin");
          router.replace("/admin");
        } else {
          throw new Error("Token tidak diterima dari server SSO");
        }
      })
      .catch((err: any) => {
        const msg =
          err?.message ||
          "Gagal memverifikasi login AuthHub. Pastikan Anda memiliki hak akses.";
        setError(msg);
        setIsProcessing(false);
      });
  }, [searchParams, router]);

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="bg-[var(--color-cream-dark)]/50 dark:bg-[var(--color-cream-dark)]/20 backdrop-blur-xl border border-[var(--color-brown-light)]/20 rounded-2xl p-6 sm:p-8 shadow-xl shadow-[var(--color-brown-dark)]/5 text-center">
        {isProcessing ? (
          <div className="py-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-brown)]/10 border border-[var(--color-brown)]/20 text-[var(--color-brown)] mb-4">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--color-text-main)] mb-2">
              Memverifikasi Akun AuthHub...
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Menghubungkan ke AuthHub SSO dan memverifikasi akun Irma Iryani.
            </p>
          </div>
        ) : error ? (
          <div className="py-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-red-500 mb-3">
              Autentikasi SSO Ditolak
            </h2>
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs text-left mb-6 leading-relaxed">
              {error}
            </div>
            <Link
              href="/admin/login"
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-[var(--color-brown)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Kembali ke Login
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--color-cream)] text-[var(--color-text-main)]">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[var(--color-brown)]/10 rounded-full blur-3xl pointer-events-none" />
      <Suspense
        fallback={
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
            Memuat otorisasi...
          </div>
        }
      >
        <CallbackHandler />
      </Suspense>
    </main>
  );
}
