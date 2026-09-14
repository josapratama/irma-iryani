"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Award, X, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useThemeLanguage } from "@/context/ThemeLanguageContext";
import { useMotion } from "@/lib/motion";
import Image from "next/image";
import { useExperiences } from "@/hooks/useExperiences";
import type { Experience, ExperienceImage } from "@/lib/api";

// ─────────────────────────────────────────────
// STATIC UI LABELS
// ─────────────────────────────────────────────
const uiLabels = {
  id: {
    sectionTag: "Pengalaman",
    title: "Pengalaman & Organisasi",
    photoLabel: "Dokumentasi",
    committeeLabel: "Kepanitiaan",
    retryLabel: "Coba lagi",
    errorMsg: "Gagal memuat data pengalaman",
  },
  en: {
    sectionTag: "Experience",
    title: "Experience & Organization",
    photoLabel: "Documentation",
    committeeLabel: "Committee",
    retryLabel: "Retry",
    errorMsg: "Failed to load experience data",
  },
};

// ─────────────────────────────────────────────
// PHOTO LIGHTBOX
// ─────────────────────────────────────────────
function Lightbox({
  photos,
  startIndex,
  lang,
  onClose,
}: {
  photos: ExperienceImage[];
  startIndex: number;
  lang: "id" | "en";
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);
  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-cream shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="relative aspect-video w-full bg-cream-dark">
          <Image
            src={photos[idx].src}
            alt={photos[idx].caption[lang]}
            fill
            className="object-cover"
            sizes="768px"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
          <p className="absolute bottom-4 left-4 right-12 text-sm font-medium text-white drop-shadow">
            {photos[idx].caption[lang]}
          </p>
        </div>

        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              aria-label="Sebelumnya"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              aria-label="Berikutnya"
            >
              <ChevronRight size={18} />
            </button>
            <div className="flex justify-center gap-1.5 py-3 bg-cream">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-1.5 rounded-full cursor-pointer transition-all duration-200 ${
                    i === idx
                      ? "w-5 bg-brown"
                      : "w-1.5 bg-brown-light/40 hover:bg-brown-light/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// PHOTO STRIP COMPONENT
// ─────────────────────────────────────────────
function PhotoStrip({
  photos,
  label,
  lang,
}: {
  photos: ExperienceImage[];
  label: string;
  lang: "id" | "en";
}) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!photos.length) return null;

  return (
    <>
      <div className="mt-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brown">
          <span className="inline-block h-px w-4 bg-brown" />
          {label}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, i) => (
            <div
              key={i}
              onClick={() => setLightboxIdx(i)}
              className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg"
            >
              <Image
                src={photo.src}
                alt={photo.caption[lang]}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="120px"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                  {lang === "id" ? "Lihat" : "View"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            photos={photos}
            startIndex={lightboxIdx}
            lang={lang}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────
function ExperienceSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-brown-light/20 bg-cream-dark p-5"
        >
          <div className="mb-4 h-44 w-full rounded-xl bg-brown-light/10" />
          <div className="space-y-2">
            <div className="h-4 w-1/2 rounded bg-brown-light/15" />
            <div className="h-3 w-3/4 rounded bg-brown-light/10" />
            <div className="h-3 w-full rounded bg-brown-light/10" />
            <div className="h-3 w-5/6 rounded bg-brown-light/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function ExperienceSection() {
  const { language } = useThemeLanguage();
  const c = uiLabels[language];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { slideUp, slideLeft, slideRight, stagger } = useMotion();

  const {
    status,
    data: experiences,
    error,
    isTimeout,
    refetch,
  } = useExperiences();

  const internship = experiences?.find((e) => e.type === "internship");
  const organization = experiences?.find((e) => e.type === "organization");

  // Kepanitiaan: events array di dalam organization entry
  // committee[0] === organization, jadi cukup gunakan organization.events langsung
  const committeeEvents = organization?.events ?? [];

  return (
    <section
      id="experience"
      className="section-shell bg-cream-dark pt-10 pb-20 md:pt-14 md:pb-24 px-4 sm:px-6 lg:px-8"
      ref={ref}
    >
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-14 text-center"
        >
          <span className="text-xs font-medium uppercase tracking-widest text-brown">
            {c.sectionTag}
          </span>
          <h2 className="mt-2 text-3xl font-bold text-text-main lg:text-4xl">
            {c.title}
          </h2>
          <div className="section-divider" />
        </motion.div>

        {/* Error state */}
        {status === "error" && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-sm text-text-muted">
              {isTimeout
                ? language === "id"
                  ? "Server tidak merespons. Pastikan backend sedang berjalan."
                  : "Server is not responding. Make sure the backend is running."
                : (error ?? c.errorMsg)}
            </p>
            <button
              onClick={refetch}
              className="flex items-center gap-1.5 rounded-full border border-brown-light/30 px-4 py-1.5 text-xs font-medium text-brown transition-colors hover:bg-brown/5"
            >
              <RefreshCw size={12} />
              {c.retryLabel}
            </button>
          </div>
        )}

        {/* Loading */}
        {status === "loading" && (
          <div className="grid gap-8 md:grid-cols-2">
            <ExperienceSkeleton />
            <ExperienceSkeleton />
          </div>
        )}

        {/* Content */}
        {status === "success" && (
          <motion.div
            variants={stagger(0.12)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid gap-8 md:grid-cols-2"
          >
            {/* ── Magang (Internship) ─────────────────────── */}
            {internship && (
              <motion.div variants={slideLeft}>
                {/* Preview image */}
                {internship.images.length > 0 && (
                  <div className="relative mb-5 h-44 w-full overflow-hidden rounded-2xl">
                    <Image
                      src={internship.images[0].src}
                      alt={internship.images[0].caption[language]}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}

                <div className="rounded-2xl border border-brown-light/20 bg-cream p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <span className="mb-1 inline-block rounded-full bg-brown/10 px-2.5 py-0.5 text-xs font-semibold text-brown">
                        {language === "id" ? "Magang" : "Internship"}
                      </span>
                      <h3 className="text-base font-bold text-text-main">
                        {internship.title[language]}
                      </h3>
                    </div>
                    <Award size={18} className="mt-1 shrink-0 text-brown/40" />
                  </div>

                  <p className="mb-1 text-sm font-medium text-brown">
                    {internship.org}
                  </p>
                  <p className="mb-4 text-xs text-text-muted">
                    {internship.period}
                  </p>

                  <ul className="space-y-2.5">
                    {internship.points.map((p, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-text-muted"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brown-light" />
                        {p[language]}
                      </li>
                    ))}
                  </ul>

                  <PhotoStrip
                    photos={internship.images}
                    label={c.photoLabel}
                    lang={language}
                  />
                </div>
              </motion.div>
            )}

            {/* ── Organisasi ─────────────────────────────── */}
            {organization && (
              <motion.div variants={slideRight} className="space-y-6">
                {/* Foto organisasi */}
                {organization.images.length > 0 && (
                  <div className="relative h-44 w-full overflow-hidden rounded-2xl">
                    <Image
                      src={organization.images[0].src}
                      alt={organization.images[0].caption[language]}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}

                <div className="rounded-2xl border border-brown-light/20 bg-cream p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <span className="mb-1 inline-block rounded-full bg-brown/10 px-2.5 py-0.5 text-xs font-semibold text-brown">
                        {language === "id" ? "Organisasi" : "Organization"}
                      </span>
                      <h3 className="text-base font-bold text-text-main">
                        {organization.title[language]}
                      </h3>
                    </div>
                    <Award size={18} className="mt-1 shrink-0 text-brown/40" />
                  </div>

                  <p className="mb-1 text-sm font-medium text-brown">
                    {organization.org}
                  </p>
                  <p className="mb-4 text-xs text-text-muted">
                    {organization.period}
                  </p>

                  <ul className="space-y-2.5">
                    {organization.points.map((p, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-text-muted"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brown-light" />
                        {p[language]}
                      </li>
                    ))}
                  </ul>

                  <PhotoStrip
                    photos={organization.images}
                    label={c.photoLabel}
                    lang={language}
                  />
                </div>

                {/* ── Kepanitiaan ── */}
                {committeeEvents.length > 0 && (
                  <div>
                    <p className="mb-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brown">
                      <span className="inline-block h-px w-4 bg-brown" />
                      {c.committeeLabel}
                    </p>
                    <motion.div
                      variants={stagger(0.07)}
                      initial="hidden"
                      animate={inView ? "visible" : "hidden"}
                      className="space-y-3"
                    >
                      {committeeEvents.map((event, i) => (
                        <motion.div
                          key={i}
                          variants={slideUp}
                          className="rounded-2xl border border-brown-light/20 bg-cream-dark p-5"
                        >
                          <div className="mb-3 flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-sm text-text-main">
                                {event.name[language]}
                              </h4>
                              <p className="text-xs text-brown">
                                {event.role[language]}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full border border-brown-light/25 bg-cream px-2 py-0.5 text-[10px] font-medium text-text-muted">
                              {event.period}
                            </span>
                          </div>
                          <ul className="space-y-2">
                            {event.points.map((p, j) => (
                              <li
                                key={j}
                                className="flex items-start gap-2 text-sm leading-relaxed text-text-muted"
                              >
                                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brown-light" />
                                {p[language]}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
