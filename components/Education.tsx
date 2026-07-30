"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap, BookOpen } from "lucide-react";
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
    courseLabel: "Mata Kuliah Relevan",
    courses: [
      "Statistik Pendidikan",
      "Perencanaan Pembelajaran Kimia",
      "Pengelolaan Kelas Digital",
      "Komputasi Pembelajaran Kimia",
      "Pengelolaan Laboratorium Kimia",
      "Evaluasi Proses dan Hasil Pembelajaran",
    ],
  },
  en: {
    sectionTag: "Educational Background",
    title: "Education",
    degree: "Bachelor of Chemistry Education",
    university: "Sriwijaya University",
    period: "August 2022 – May 2026",
    gpa: "GPA 3.90",
    courseLabel: "Relevant Courses",
    courses: [
      "Educational Statistics",
      "Chemistry Learning Planning",
      "Digital Classroom Management",
      "Chemistry Learning Computing",
      "Chemistry Laboratory Management",
      "Process & Learning Outcome Evaluation",
    ],
  },
};

export default function Education() {
  const { language } = useThemeLanguage();
  const c = content[language];
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
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
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
                <div className="mb-3 flex items-center gap-2">
                  <BookOpen size={14} className="shrink-0 text-brown" />
                  <p className="text-sm font-medium text-text-main">
                    {c.courseLabel}
                  </p>
                </div>
                <motion.div
                  variants={stagger(0.05)}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  className="flex flex-wrap gap-2"
                >
                  {c.courses.map((course) => (
                    <motion.span
                      key={course}
                      variants={slideUp}
                      className="rounded-full border border-brown/20 bg-brown/10 px-3 py-1 text-xs text-brown"
                    >
                      {course}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
