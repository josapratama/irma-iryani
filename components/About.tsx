"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useThemeLanguage } from "@/context/ThemeLanguageContext";
import { useMotion } from "@/lib/motion";

export default function About() {
  const { language, t } = useThemeLanguage();
  const c = {
    sectionTag: t("about.section_tag", "Tentang Saya"),
    title: t("about.title", "Profil Singkat"),
    bio: t("about.bio", "Saya merupakan lulusan S1 Pendidikan Kimia Universitas Sriwijaya dengan IPK 3,90."),
    highlights: [
      { label: t("about.gpa", "IPK"), value: "3,90" },
      { label: t("about.university", "Universitas"), value: "UNSRI" },
      { label: t("about.major", "Jurusan"), value: "Pend. Kimia" },
      { label: t("about.batch", "Angkatan"), value: "2022" },
    ],
    traits: [
      language === "en" ? "Analytical" : (language === "ja" ? "分析的" : "Analitis"),
      language === "en" ? "Meticulous" : (language === "ja" ? "几帳面" : "Teliti"),
      language === "en" ? "Structured" : (language === "ja" ? "構造化" : "Terstruktur"),
      language === "en" ? "Adaptive" : (language === "ja" ? "適応力" : "Adaptif"),
      language === "en" ? "Collaborative" : (language === "ja" ? "協力的" : "Kolaboratif"),
      language === "en" ? "Systematic" : (language === "ja" ? "体系的" : "Sistematis"),
    ],
  };
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { slideUp, slideRight, slideLeft, stagger } = useMotion();

  return (
    <section
      id="about"
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

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
          {/* Bio + traits */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <p className="mb-8 text-base leading-relaxed text-text-muted">
              {c.bio}
            </p>
            <motion.div
              variants={stagger(0.05)}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="flex flex-wrap gap-2"
            >
              {c.traits.map((trait) => (
                <motion.span
                  key={trait}
                  variants={slideUp}
                  className="cursor-default rounded-full border border-brown-light/35 bg-cream-dark px-4 py-1.5 text-sm text-text-muted"
                >
                  {trait}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          {/* Highlight cards */}
          <motion.div
            variants={stagger(0.08)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid grid-cols-2 gap-4"
          >
            {c.highlights.map((item) => (
              <motion.div
                key={item.label}
                variants={slideLeft}
                className="rounded-2xl border border-brown-light/20 bg-cream-dark p-5"
              >
                <p className="mb-1 text-xs uppercase tracking-wider text-text-muted">
                  {item.label}
                </p>
                <p className="text-2xl font-bold text-brown">{item.value}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
