"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import {
  X,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Images,
  FileText,
  Download,
  ExternalLink,
  ScrollText,
  Award,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import { useThemeLanguage } from "@/context/ThemeLanguageContext";
import { useMotion } from "@/lib/motion";
import Image from "next/image";
import PdfThumbnail from "@/components/PdfThumbnail";
import { useCertificates } from "@/hooks/useCertificates";
import { useRecommendationLetters } from "@/hooks/useRecommendationLetters";
import { useProjects } from "@/hooks/useProjects";
import type { Certificate, RecommendationLetter, Project } from "@/lib/api";

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const catColors: Record<string, { bg: string; text: string; border: string }> =
  {
    Technology: { bg: "#dbeafe", text: "#1447e6", border: "#bedbff" },
    Professional: { bg: "#f3e8ff", text: "#7e22ce", border: "#e9d5ff" },
    "Soft Skills": { bg: "#fef3c7", text: "#b45309", border: "#fde68a" },
    Data: { bg: "#cffafe", text: "#0e7490", border: "#a5f3fc" },
    Organization: { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" },
  };

const FILTERS: { key: string; id: string; en: string }[] = [
  { key: "All", id: "Semua", en: "All" },
  { key: "Technology", id: "Teknologi", en: "Technology" },
  { key: "Soft Skills", id: "Soft Skills", en: "Soft Skills" },
  { key: "Professional", id: "Profesional", en: "Professional" },
  { key: "Data", id: "Data", en: "Data" },
  { key: "Organization", id: "Organisasi", en: "Organization" },
];

// ─────────────────────────────────────────────
// SKELETON COMPONENTS
// ─────────────────────────────────────────────
function CertSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-brown-light/20 bg-cream-dark animate-pulse">
      <div className="h-36 w-full bg-brown-light/10" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-20 rounded-full bg-brown-light/15" />
        <div className="h-4 w-full rounded bg-brown-light/10" />
        <div className="h-3 w-3/4 rounded bg-brown-light/10" />
      </div>
    </div>
  );
}

function CardSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:max-w-3xl lg:mx-auto">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-brown-light/20 bg-cream-dark animate-pulse"
        >
          <div className="h-48 w-full bg-brown-light/10" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-full rounded bg-brown-light/10" />
            <div className="h-3 w-2/3 rounded bg-brown-light/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
  language,
}: {
  message: string;
  onRetry: () => void;
  language: "id" | "en";
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-sm text-text-muted">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 rounded-full border border-brown-light/30 px-4 py-1.5 text-xs font-medium text-brown transition-colors hover:bg-brown/5"
      >
        <RefreshCw size={12} />
        {language === "id" ? "Coba lagi" : "Retry"}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// CERTIFICATE LIGHTBOX
// ─────────────────────────────────────────────
function CertLightbox({
  cert,
  startIdx,
  language,
  onClose,
}: {
  cert: Certificate;
  startIdx: number;
  language: "id" | "en";
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const [dir, setDir] = useState(0);
  const total = cert.images.length;

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.28, ease: "easeOut" as const },
    },
    exit: (d: number) => ({
      x: d > 0 ? -80 : 80,
      opacity: 0,
      transition: { duration: 0.22 },
    }),
  };

  const go = (newIdx: number) => {
    setDir(newIdx > idx ? 1 : -1);
    setIdx(newIdx);
  };

  const cat = catColors[cert.category] ?? catColors["Soft Skills"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-cream shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-3 top-3 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
        >
          <X size={15} />
        </button>

        {total > 1 && (
          <div className="absolute left-3 top-3 z-20 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {idx + 1} / {total}
          </div>
        )}

        <div className="relative aspect-4/3 w-full overflow-hidden bg-cream-dark">
          <AnimatePresence custom={dir} mode="wait">
            <motion.div
              key={idx}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
            >
              <Image
                src={cert.images[idx]}
                alt={`${cert.title[language]} — ${idx + 1}`}
                fill
                className="object-contain"
                sizes="672px"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {total > 1 && (
            <>
              <button
                onClick={() => go((idx - 1 + total) % total)}
                className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                aria-label="Sebelumnya"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => go((idx + 1) % total)}
                className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                aria-label="Berikutnya"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {total > 1 && (
          <div className="flex justify-center gap-1.5 pb-1 pt-3">
            {cert.images.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Gambar ${i + 1}`}
                className={`h-1.5 cursor-pointer rounded-full transition-all duration-200 ${
                  i === idx
                    ? "w-5 bg-brown"
                    : "w-1.5 bg-brown-light/40 hover:bg-brown-light/70"
                }`}
              />
            ))}
          </div>
        )}

        <div className="border-t border-brown-light/20 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full border px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: cat.bg,
                    color: cat.text,
                    borderColor: cat.border,
                  }}
                >
                  {cert.category}
                </span>
                {total > 1 && (
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <Images size={11} />
                    {total} halaman
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold leading-snug text-text-main">
                {cert.title[language]}
              </h3>
              <p className="mt-0.5 text-xs text-text-muted">{cert.issuer}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-medium text-brown">{cert.date}</p>
              {cert.score && (
                <p className="mt-0.5 text-sm font-bold text-brown">
                  {cert.score}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// RECOMMENDATION LETTER LIGHTBOX
// ─────────────────────────────────────────────
function RecoLightbox({
  letter,
  language,
  onClose,
}: {
  letter: RecommendationLetter;
  language: "id" | "en";
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(0);
  const total = letter.pages.length;

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.26, ease: "easeOut" as const },
    },
    exit: (d: number) => ({
      x: d > 0 ? -60 : 60,
      opacity: 0,
      transition: { duration: 0.2 },
    }),
  };

  const go = (newIdx: number) => {
    setDir(newIdx > idx ? 1 : -1);
    setIdx(newIdx);
  };

  const pageLabel = language === "id" ? "Halaman" : "Page";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="flex items-center gap-2">
            <ScrollText size={15} className="shrink-0 text-slate-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {language === "id"
                ? "Surat Rekomendasi"
                : "Recommendation Letter"}
            </span>
          </div>
          {total > 1 && (
            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {pageLabel} {idx + 1} / {total}
            </span>
          )}
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-200 text-slate-600 transition-colors hover:bg-slate-300"
          >
            <X size={14} />
          </button>
        </div>

        <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
          <AnimatePresence custom={dir} mode="wait">
            <motion.div
              key={idx}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
            >
              <Image
                src={letter.pages[idx]}
                alt={`${letter.title[language]} — ${pageLabel} ${idx + 1}`}
                fill
                className="object-contain"
                sizes="672px"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {total > 1 && (
            <>
              <button
                onClick={() => go((idx - 1 + total) % total)}
                className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => go((idx + 1) % total)}
                className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {total > 1 && (
          <div className="flex justify-center gap-2 border-t border-slate-200 bg-slate-50 py-3">
            {letter.pages.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`${pageLabel} ${i + 1}`}
                className={`h-1.5 cursor-pointer rounded-full transition-all duration-200 ${
                  i === idx
                    ? "w-5 bg-slate-500"
                    : "w-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
          <h3 className="text-sm font-bold leading-snug text-slate-800">
            {letter.title[language]}
          </h3>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-xs text-slate-500">{letter.issuer}</p>
            <p className="shrink-0 text-xs font-medium text-slate-500">
              {letter.date}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function Certificates() {
  const { language } = useThemeLanguage();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [selected, setSelected] = useState<{
    cert: Certificate;
    imgIdx: number;
  } | null>(null);
  const [selectedReco, setSelectedReco] = useState<RecommendationLetter | null>(
    null,
  );
  const [activeFilter, setActiveFilter] = useState("All");
  const { slideUp, stagger } = useMotion();

  // ── API data ───────────────────────────────────────────────────────────────
  const {
    status: certStatus,
    data: certificates,
    error: certError,
    isTimeout: certTimeout,
    refetch: refetchCerts,
  } = useCertificates();

  const {
    status: recoStatus,
    data: recommendationLetters,
    error: recoError,
    isTimeout: recoTimeout,
    refetch: refetchReco,
  } = useRecommendationLetters();

  const {
    status: projStatus,
    data: projects,
    error: projError,
    isTimeout: projTimeout,
    refetch: refetchProj,
  } = useProjects();

  // ── Translations ──────────────────────────────────────────────────────────
  const t = {
    id: {
      certTag: "Sertifikat",
      certTitle: "Sertifikat & Penghargaan",
      view: "Lihat",
      recoTag: "Surat Rekomendasi",
      recoTitle: "Surat Rekomendasi",
      recoDesc:
        "Dokumen resmi yang menerangkan kompetensi dan rekomendasi kerja dari lembaga pelatihan.",
      recoPages: "halaman",
      recoView: "Buka Surat",
      projectTag: "Proyek",
      projectTitle: "Portofolio Proyek",
      projectDesc:
        "Dokumen portofolio berisi hasil kerja nyata dan proyek yang telah diselesaikan.",
      download: "Unduh PDF",
      open: "Buka PDF",
    },
    en: {
      certTag: "Certificates",
      certTitle: "Certificates & Achievements",
      view: "View",
      recoTag: "Recommendation Letters",
      recoTitle: "Recommendation Letters",
      recoDesc:
        "Official documents stating competency and work recommendations from training institutions.",
      recoPages: "pages",
      recoView: "Open Letter",
      projectTag: "Projects",
      projectTitle: "Project Portfolio",
      projectDesc:
        "Portfolio document containing real work results and completed projects.",
      download: "Download PDF",
      open: "Open PDF",
    },
  };
  const c = t[language];

  // ── Filtered certs ─────────────────────────────────────────────────────────
  const filtered =
    certStatus === "success" && certificates
      ? activeFilter === "All"
        ? certificates
        : certificates.filter((cert) => cert.category === activeFilter)
      : [];

  const totalPerCategory = (key: string) => {
    if (!certificates) return 0;
    return key === "All"
      ? certificates.length
      : certificates.filter((c) => c.category === key).length;
  };

  return (
    <section
      id="certificates"
      className="section-shell pt-10 pb-20 md:pt-14 md:pb-24 px-4 sm:px-6 lg:px-8"
      ref={ref}
    >
      <div className="mx-auto max-w-7xl space-y-20">
        {/* ══════════════════════════════════════════
            SECTION 1 — SERTIFIKAT
        ══════════════════════════════════════════ */}
        <div>
          {/* Heading */}
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="mb-10 text-center"
          >
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brown-light/25 bg-cream-dark/60 px-4 py-1.5">
              <Award size={13} className="text-brown" />
              <span className="text-xs font-semibold uppercase tracking-widest text-brown">
                {c.certTag}
              </span>
            </div>
            <h2 className="mt-2 text-3xl font-bold text-text-main lg:text-4xl">
              {c.certTitle}
            </h2>
            <div className="section-divider" />
          </motion.div>

          {/* Filter tabs */}
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="mb-8 flex flex-wrap justify-center gap-2"
          >
            {FILTERS.map((f) => {
              const isActive = activeFilter === f.key;
              const count = totalPerCategory(f.key);
              return (
                <motion.button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "border-brown bg-brown text-white shadow-md shadow-brown/20"
                      : "border-brown-light/25 bg-cream-dark/60 text-text-muted hover:border-brown/40 hover:text-text-main"
                  }`}
                >
                  {f[language]}
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-brown-light/15 text-text-muted"
                    }`}
                  >
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Certificate grid */}
          {certStatus === "loading" && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CertSkeleton key={i} />
              ))}
            </div>
          )}

          {certStatus === "error" && (
            <ErrorState
              message={
                certTimeout
                  ? language === "id"
                    ? "Server tidak merespons. Pastikan backend sedang berjalan."
                    : "Server is not responding. Make sure the backend is running."
                  : (certError ??
                    (language === "id"
                      ? "Gagal memuat sertifikat"
                      : "Failed to load certificates"))
              }
              onRetry={refetchCerts}
              language={language}
            />
          )}

          {certStatus === "success" && (
            <motion.div
              variants={stagger(0.04)}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((cert) => {
                  const cat =
                    catColors[cert.category] ?? catColors["Soft Skills"];
                  const hasMultiple = cert.images.length > 1;
                  return (
                    <motion.div
                      key={cert._id}
                      layout
                      variants={slideUp}
                      initial="hidden"
                      animate="visible"
                      exit={{
                        opacity: 0,
                        scale: 0.88,
                        transition: { duration: 0.18 },
                      }}
                      whileHover={{ y: -4, transition: { duration: 0.18 } }}
                      onClick={() =>
                        cert.images.length > 0
                          ? setSelected({ cert, imgIdx: 0 })
                          : cert.pdfPath
                            ? window.open(cert.pdfPath, "_blank")
                            : undefined
                      }
                      className="group cursor-pointer overflow-hidden rounded-2xl border border-brown-light/20 bg-cream-dark transition-all duration-200 hover:border-brown/40 hover:shadow-lg"
                    >
                      <div className="relative h-36 w-full overflow-hidden bg-cream-dark/80">
                        {cert.images.length > 0 ? (
                          <>
                            <Image
                              src={cert.images[0]}
                              alt={cert.title[language]}
                              fill
                              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                            />
                            {hasMultiple && (
                              <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                                <Images size={10} />
                                {cert.images.length}
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-brown/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              <span className="flex items-center gap-1.5 text-sm font-medium text-white">
                                <ZoomIn size={16} />
                                {c.view}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="relative h-full w-full overflow-hidden">
                            {cert.pdfPath ? (
                              <PdfThumbnail
                                pdfUrl={cert.pdfPath}
                                className="h-full w-full"
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-brown/5">
                                <FileText size={36} className="text-brown/40" />
                                <span className="text-xs font-medium text-brown/60">
                                  PDF
                                </span>
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-brown/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              <span className="flex items-center gap-1.5 text-sm font-medium text-white">
                                <ExternalLink size={16} />
                                {c.open}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="mb-2.5 flex items-start justify-between gap-2">
                          <span
                            className="shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: cat.bg,
                              color: cat.text,
                              borderColor: cat.border,
                            }}
                          >
                            {cert.category}
                          </span>
                          {cert.score && (
                            <span className="text-xs font-bold text-brown">
                              {cert.score}
                            </span>
                          )}
                        </div>
                        <h3 className="mb-1 line-clamp-2 text-sm font-bold leading-snug text-text-main">
                          {cert.title[language]}
                        </h3>
                        <p className="mb-1 line-clamp-1 text-xs text-text-muted">
                          {cert.issuer}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-brown">{cert.date}</p>
                          {hasMultiple && (
                            <span className="flex items-center gap-1 text-xs text-text-muted">
                              <Images size={11} className="text-brown-light" />
                              {cert.images.length} foto
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {certStatus === "success" && filtered.length === 0 && (
            <div className="py-16 text-center text-sm text-text-muted">
              {language === "id"
                ? "Tidak ada sertifikat ditemukan."
                : "No certificates found."}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════
            SECTION 2 — SURAT REKOMENDASI
        ══════════════════════════════════════════ */}
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <div className="mb-8 text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-4 py-1.5">
              <ScrollText size={13} className="text-slate-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {c.recoTag}
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-text-main lg:text-3xl">
              {c.recoTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-text-muted">
              {c.recoDesc}
            </p>
            <div className="mx-auto mt-4 h-px w-16 rounded-full bg-slate-300" />
          </div>

          {recoStatus === "loading" && <CardSkeleton count={2} />}
          {recoStatus === "error" && (
            <ErrorState
              message={
                recoTimeout
                  ? language === "id"
                    ? "Server tidak merespons. Pastikan backend sedang berjalan."
                    : "Server is not responding. Make sure the backend is running."
                  : (recoError ??
                    (language === "id"
                      ? "Gagal memuat surat rekomendasi"
                      : "Failed to load recommendation letters"))
              }
              onRetry={refetchReco}
              language={language}
            />
          )}

          {recoStatus === "success" && recommendationLetters && (
            <motion.div
              variants={stagger(0.08)}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="grid gap-5 sm:grid-cols-2 lg:max-w-3xl lg:mx-auto"
            >
              {recommendationLetters.map((letter) => (
                <motion.div
                  key={letter._id}
                  variants={slideUp}
                  whileHover={{ y: -3, transition: { duration: 0.18 } }}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-slate-400 hover:shadow-md"
                >
                  <div
                    className="relative h-48 w-full cursor-pointer overflow-hidden bg-slate-100"
                    onClick={() => setSelectedReco(letter)}
                  >
                    <Image
                      src={letter.pages[0]}
                      alt={letter.title[language]}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    {letter.pages.length > 1 && (
                      <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                        <FileText size={10} />
                        {letter.pages.length} {c.recoPages}
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-700">
                        <ZoomIn size={13} />
                        {c.recoView}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5">
                      <ScrollText size={10} className="text-slate-500" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        {language === "id"
                          ? "Surat Rekomendasi"
                          : "Recommendation Letter"}
                      </span>
                    </div>
                    <h3 className="mb-1 line-clamp-2 text-sm font-bold leading-snug text-slate-800">
                      {letter.title[language]}
                    </h3>
                    <p className="mb-3 text-xs text-slate-500">
                      {letter.issuer}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-400">{letter.date}</p>
                      <button
                        onClick={() => setSelectedReco(letter)}
                        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-100"
                      >
                        <ZoomIn size={11} />
                        {c.recoView}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* ══════════════════════════════════════════
            SECTION 3 — PORTOFOLIO PROYEK
        ══════════════════════════════════════════ */}
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <div className="mb-8 text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brown-light/25 bg-cream-dark/60 px-4 py-1.5">
              <FolderOpen size={13} className="text-brown" />
              <span className="text-xs font-semibold uppercase tracking-widest text-brown">
                {c.projectTag}
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-text-main lg:text-3xl">
              {c.projectTitle}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-text-muted">
              {c.projectDesc}
            </p>
            <div className="section-divider" />
          </div>

          {projStatus === "loading" && <CardSkeleton count={2} />}
          {projStatus === "error" && (
            <ErrorState
              message={
                projTimeout
                  ? language === "id"
                    ? "Server tidak merespons. Pastikan backend sedang berjalan."
                    : "Server is not responding. Make sure the backend is running."
                  : (projError ??
                    (language === "id"
                      ? "Gagal memuat proyek"
                      : "Failed to load projects"))
              }
              onRetry={refetchProj}
              language={language}
            />
          )}

          {projStatus === "success" && projects && (
            <motion.div
              variants={stagger(0.08)}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="grid gap-5 sm:grid-cols-2 lg:max-w-3xl lg:mx-auto"
            >
              {projects.map((project) => (
                <motion.div
                  key={project._id}
                  variants={slideUp}
                  whileHover={{ y: -3, transition: { duration: 0.18 } }}
                  className="overflow-hidden rounded-2xl border border-brown-light/20 bg-cream-dark transition-all duration-200 hover:border-brown/40 hover:shadow-lg"
                >
                  <div className="group relative h-40 w-full overflow-hidden bg-cream-dark/80">
                    <PdfThumbnail
                      pdfUrl={project.pdfPath}
                      className="h-full w-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-brown/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <a
                        href={project.pdfPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-medium text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={16} />
                        {c.open}
                      </a>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="mb-1.5 text-sm font-bold leading-snug text-text-main">
                      {project.title[language]}
                    </h3>
                    <p className="mb-4 text-xs leading-relaxed text-text-muted">
                      {project.description[language]}
                    </p>
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-brown-light/20 bg-cream px-2.5 py-0.5 text-[10px] font-medium text-brown"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={project.pdfPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-brown-light/30 bg-cream px-3 py-2 text-xs font-semibold text-brown transition-colors hover:bg-brown/8 hover:border-brown/40"
                      >
                        <ExternalLink size={12} />
                        {c.open}
                      </a>
                      <a
                        href={project.pdfPath}
                        download={project.fileName}
                        className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brown px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-brown/20 transition-colors hover:bg-brown/90"
                      >
                        <Download size={12} />
                        {c.download}
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Lightboxes ── */}
      <AnimatePresence>
        {selected && (
          <CertLightbox
            cert={selected.cert}
            startIdx={selected.imgIdx}
            language={language}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedReco && (
          <RecoLightbox
            letter={selectedReco}
            language={language}
            onClose={() => setSelectedReco(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
