"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap } from "lucide-react";
import { useThemeLanguage } from "@/context/ThemeLanguageContext";
import { useMotion } from "@/lib/motion";
import { useEducations } from "@/hooks/useEducations";

export default function Education() {
  const { language, t } = useThemeLanguage();
  const { data: educations } = useEducations();

  const c = {
    sectionTag: t("education.section_tag", "Riwayat Pendidikan"),
    title: t("education.title", "Pendidikan"),
  };

  const defaultItems = [
    {
      degree: language === "en" ? "Bachelor of Chemistry Education" : (language === "ja" ? "化学教育学士" : "S1 Pendidikan Kimia"),
      university: language === "en" ? "Sriwijaya University" : (language === "ja" ? "スリウィジャヤ大学" : "Universitas Sriwijaya"),
      period: language === "en" ? "August 2022 – May 2026" : (language === "ja" ? "2022年8月〜2026年5月" : "Agustus 2022 – Mei 2026"),
      gpa: "3,90",
      description: "",
    },
  ];

  const items = (educations && educations.length > 0)
    ? educations.map((edu) => ({
        degree: (edu.degree && edu.degree[language]) || edu.degree?.en || edu.degree?.id || "",
        university: (edu.university && edu.university[language]) || edu.university?.en || edu.university?.id || "",
        period: (edu.period && edu.period[language]) || edu.period?.en || edu.period?.id || "",
        gpa: edu.gpa || "3,90",
        description: (edu.description && edu.description[language]) || edu.description?.en || edu.description?.id || "",
      }))
    : defaultItems;

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { slideUp, stagger } = useMotion();

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
          variants={stagger(0.1)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mx-auto max-w-4xl space-y-6"
        >
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              variants={slideUp}
              className="rounded-3xl border border-brown-light/20 bg-cream p-6 sm:p-8 lg:p-10 shadow-sm"
            >
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-brown-light/30 bg-brown/10">
                  <GraduationCap size={24} className="text-brown" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-text-main">
                        {item.degree}
                      </h3>
                      <p className="mt-0.5 font-medium text-brown">
                        {item.university}
                      </p>
                      {item.description && (
                        <p className="mt-2 text-xs text-text-muted leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm text-text-muted">{item.period}</p>
                      <p className="mt-1 text-lg font-bold text-brown">
                        {language === "id" ? `IPK ${item.gpa}` : `GPA ${item.gpa}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
