"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap } from "lucide-react";
import { useThemeLanguage } from "@/context/ThemeLanguageContext";
import { useMotion } from "@/lib/motion";

const content = {
  id: {
    sectionTag: "Riwayat Pendidikan",
    title: "Pendidikan",
    degree: "S1 Pendidikan Kimia",
    university: "Universitas Sriwijaya",
    period: "Agustus 2022 – Mei 2026",
    gpa: "IPK 3,90",
  },
  en: {
    sectionTag: "Educational Background",
    title: "Education",
    degree: "Bachelor of Chemistry Education",
    university: "Sriwijaya University",
    period: "August 2022 – May 2026",
    gpa: "GPA 3.90",
  },
};

export default function Education() {
  const { language } = useThemeLanguage();
  const c = content[language];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { slideUp } = useMotion();

  return (
    <section
      id="education"
      className="section-shell bg-cream-dark pt-10 pb-20 md:pt-14 md:pb-24 px-4 sm:px-6 lg:px-8"
      ref={ref}
    >
      <div className="mx-auto max-w-6xl">
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

        <motion.div
          variants={slideUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mx-auto max-w-4xl"
        >
          <div className="rounded-3xl border border-brown-light/20 bg-cream p-6 sm:p-8 lg:p-10">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-brown-light/30 bg-brown/10">
                <GraduationCap size={24} className="text-brown" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-text-main">
                      {c.degree}
                    </h3>
                    <p className="mt-0.5 font-medium text-brown">
                      {c.university}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm text-text-muted">{c.period}</p>
                    <p className="mt-1 text-lg font-bold text-brown">{c.gpa}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
