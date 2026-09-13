"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  status: "loading" | "success" | "error";
  error?: string | null;
  skeletonCount?: number;
  skeletonClassName?: string;
  refetch?: () => void;
  children: React.ReactNode;
}

export default function ApiStateWrapper({
  status,
  error,
  skeletonCount = 4,
  skeletonClassName = "h-48 rounded-2xl",
  refetch,
  children,
}: Props) {
  if (status === "loading") {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className={`animate-pulse bg-brown-light/10 ${skeletonClassName}`}
          />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertCircle size={32} className="text-brown/40" />
        <p className="text-sm text-text-muted">{error ?? "Gagal memuat data"}</p>
        {refetch && (
          <button
            onClick={refetch}
            className="flex items-center gap-1.5 rounded-full border border-brown-light/30 px-4 py-1.5 text-xs font-medium text-brown transition-colors hover:bg-brown/5"
          >
            <RefreshCw size={12} />
            Coba lagi
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
