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
              className="rounded-3xl border border-brown-light/20 bg-cream p-5 sm:p-8 lg:p-10 shadow-sm hover:border-brown/40 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3.5 sm:gap-6">
                <div className="flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border border-brown-light/30 bg-brown/10 text-brown shadow-xs">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-text-main leading-snug">
                        {item.degree}
                      </h3>
                      <p className="mt-0.5 text-sm sm:text-base font-semibold text-brown">
                        {item.university}
                      </p>
                      {item.description && (
                        <p className="mt-2 text-xs sm:text-sm text-text-muted leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-left sm:text-right pt-1 sm:pt-0 border-t sm:border-t-0 border-brown-light/15 mt-2 sm:mt-0">
                      <p className="text-xs sm:text-sm font-medium text-text-muted">{item.period}</p>
                      <span className="inline-block mt-1 sm:mt-1.5 px-3 py-1 rounded-full bg-brown/10 border border-brown/20 text-xs sm:text-sm font-bold text-brown">
                        {language === "id" ? `IPK ${item.gpa}` : `GPA ${item.gpa}`}
                      </span>
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
