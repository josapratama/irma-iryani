"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Wrench, Globe, RefreshCw } from "lucide-react";
import { useThemeLanguage } from "@/context/ThemeLanguageContext";
import { useMotion } from "@/lib/motion";
import { useSkills } from "@/hooks/useSkills";

// ─────────────────────────────────────────────
// STATIC CONTENT (labels & trainings hanya teks, tidak perlu API)
// ─────────────────────────────────────────────
const content = {
  id: {
    sectionTag: "Kompetensi",
    title: "Keahlian",
    trainingLabel: "Pelatihan",
    trainings: [
      "Digital Disruption & Transformation",
      "Integrity at Work",
      "Data Science",
      "Emotional Intelligence",
      "Emotional Resilience",
      "Social Influence",
      "Adaptability",
      "Self Efficacy",
    ],
  },
  en: {
    sectionTag: "Competencies",
    title: "Skills",
    trainingLabel: "Trainings",
    trainings: [
      "Digital Disruption & Transformation",
      "Integrity at Work",
      "Data Science",
      "Emotional Intelligence",
      "Emotional Resilience",
      "Social Influence",
      "Adaptability",
      "Self Efficacy",
    ],
  },
};

// ─────────────────────────────────────────────
// SKILL BAR
// ─────────────────────────────────────────────
function SkillBar({
  name,
  level,
  note,
  inView,
}: {
  name: string;
  level: number;
  note?: string;
  inView: boolean;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm text-text-main">
          {name}
          {note && (
            <span className="ml-1.5 text-xs text-text-muted">({note})</span>
          )}
        </span>
        <span className="text-xs font-semibold text-brown">{level}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-brown-light/20">
        <motion.div
          className="h-full rounded-full bg-brown"
          initial={{ width: 0 }}
          animate={{ width: inView ? `${level}%` : 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────
function SkillSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i}>
          <div className="mb-1.5 flex justify-between">
            <div className="h-3 w-32 rounded bg-brown-light/15" />
            <div className="h-3 w-8 rounded bg-brown-light/10" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-brown-light/10" />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function Skills() {
  const { language } = useThemeLanguage();
  const c = content[language];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { slideUp, slideLeft, slideRight, stagger } = useMotion();

  // Fetch semua skill groups sekaligus
  const { status, data: skillGroups, error, isTimeout, refetch } = useSkills();

  // Pisahkan berdasar category dari response API
  const softGroup = skillGroups?.find((g) => g.category === "soft");
  const hardGroup = skillGroups?.find((g) => g.category === "hard");

  // Language group: pakai category eksplisit "language" dari backend
  // Fallback ke statis jika backend belum support category ini
  const langGroup = skillGroups?.find((g) => g.category === "language");

  return (
    <section
      id="skills"
      className="section-shell pt-10 pb-20 md:pt-14 md:pb-24 px-4 sm:px-6 lg:px-8"
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
                : (error ??
                  (language === "id"
                    ? "Gagal memuat data keahlian"
                    : "Failed to load skills"))}
            </p>
            <button
              onClick={refetch}
              className="flex items-center gap-1.5 rounded-full border border-brown-light/30 px-4 py-1.5 text-xs font-medium text-brown transition-colors hover:bg-brown/5"
            >
              <RefreshCw size={12} />
              {language === "id" ? "Coba lagi" : "Retry"}
            </button>
          </div>
        )}

        {/* Main grid */}
        {status !== "error" && (
          <motion.div
            variants={stagger(0.1)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid gap-8 md:grid-cols-3"
          >
            {/* ── Soft Skills ─────────────────────────────── */}
            <motion.div
              variants={slideLeft}
              className="rounded-2xl border border-brown-light/20 bg-cream-dark p-6"
            >
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brown/10">
                  <Brain size={16} className="text-brown" />
                </div>
                <h3 className="font-semibold text-text-main">
                  {softGroup
                    ? softGroup.label[language]
                    : language === "id"
                      ? "Soft Skill"
                      : "Soft Skills"}
                </h3>
              </div>
              <div className="space-y-4">
                {status === "loading" ? (
                  <SkillSkeleton />
                ) : (
                  (softGroup?.items ?? []).map((item) => (
                    <SkillBar
                      key={item.name}
                      name={item.name}
                      level={item.level}
                      inView={inView}
                    />
                  ))
                )}
              </div>
            </motion.div>

            {/* ── Hard Skills ─────────────────────────────── */}
            <motion.div
              variants={slideUp}
              className="rounded-2xl border border-brown-light/20 bg-cream-dark p-6"
            >
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brown/10">
                  <Wrench size={16} className="text-brown" />
                </div>
                <h3 className="font-semibold text-text-main">
                  {hardGroup
                    ? hardGroup.label[language]
                    : language === "id"
                      ? "Hard Skill"
                      : "Hard Skills"}
                </h3>
              </div>
              <div className="space-y-4">
                {status === "loading" ? (
                  <SkillSkeleton />
                ) : (
                  (hardGroup?.items ?? []).map((item) => (
                    <SkillBar
                      key={item.name}
                      name={item.name}
                      level={item.level}
                      inView={inView}
                    />
                  ))
                )}
              </div>
            </motion.div>

            {/* ── Bahasa + Pelatihan ───────────────────────── */}
            <motion.div variants={slideRight} className="space-y-6">
              {/* Bahasa */}
              <div className="rounded-2xl border border-brown-light/20 bg-cream-dark p-6">
                <div className="mb-5 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brown/10">
                    <Globe size={16} className="text-brown" />
                  </div>
                  <h3 className="font-semibold text-text-main">
                    {langGroup
                      ? langGroup.label[language]
                      : language === "id"
                        ? "Bahasa"
                        : "Languages"}
                  </h3>
                </div>
                <div className="space-y-4">
                  {status === "loading" ? (
                    <SkillSkeleton />
                  ) : langGroup ? (
                    langGroup.items.map((item) => (
                      <SkillBar
                        key={item.name}
                        name={item.name}
                        level={item.level}
                        inView={inView}
                      />
                    ))
                  ) : (
                    // Fallback statis bahasa jika tidak ada di API
                    <>
                      <SkillBar
                        name="Bahasa Indonesia"
                        level={98}
                        note={language === "id" ? "Fasih" : "Native"}
                        inView={inView}
                      />
                      <SkillBar
                        name="English"
                        level={50}
                        note={language === "id" ? "Dasar" : "Basic"}
                        inView={inView}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Pelatihan */}
              <div className="rounded-2xl border border-brown-light/20 bg-cream-dark p-6">
                <h3 className="mb-4 font-semibold text-text-main">
                  {c.trainingLabel}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {c.trainings.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-brown-light/25 bg-cream px-3 py-1 text-xs font-medium text-brown"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
