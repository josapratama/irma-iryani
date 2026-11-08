"use client";

import { useEffect, useRef, useState } from "react";
import { FileText } from "lucide-react";

interface PdfThumbnailProps {
  pdfUrl: string;
  className?: string;
}

export default function PdfThumbnail({ pdfUrl, className = "" }: PdfThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function renderFirstPage() {
      try {
        // Dynamic import agar tidak di-bundle saat SSR
        const pdfjs = await import("pdfjs-dist");

        // Set worker — gunakan CDN yang sesuai versi
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        if (cancelled) return;

        const page = await pdf.getPage(1);

        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Hitung scale agar fit ke lebar canvas (300px)
        const viewport = page.getViewport({ scale: 1 });
        const scale = 300 / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;

        if (!cancelled) setStatus("done");
      } catch (err) {
        console.error("PdfThumbnail error:", err);
        if (!cancelled) setStatus("error");
      }
    }

    renderFirstPage();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  return (
    <div className={`relative flex h-full w-full items-center justify-center ${className}`}>
      {/* Canvas — ditampilkan saat done */}
      <canvas
        ref={canvasRef}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          status === "done" ? "opacity-100" : "opacity-0 absolute inset-0"
        }`}
        style={{ objectFit: "cover", objectPosition: "top" }}
      />

      {/* Fallback loading / error */}
      {status !== "done" && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-brown/5">
          {status === "loading" ? (
            <>
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brown/30 border-t-brown" />
              <span className="text-xs text-brown/50">Memuat preview...</span>
            </>
          ) : (
            <>
              <FileText size={36} className="text-brown/40" />
              <span className="text-xs font-medium text-brown/60">PDF</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
