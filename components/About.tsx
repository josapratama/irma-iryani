"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useThemeLanguage } from "@/context/ThemeLanguageContext";
import { useMotion } from "@/lib/motion";

const content = {
  id: {
    sectionTag: "Tentang Saya",
    title: "Profil Singkat",
    bio: "Saya merupakan lulusan S1 Pendidikan Kimia Universitas Sriwijaya dengan IPK 3,90 yang memiliki kemampuan analisis, pemecahan masalah, serta berpikir sistematis yang terbentuk dari latar belakang sains dan pengalaman penelitian. Terbiasa bekerja secara terstruktur, teliti dalam mengolah data, serta mampu beradaptasi dengan baik baik secara individu maupun dalam tim. Selain itu, memiliki pemahaman dalam evaluasi, perencanaan program, dan pendampingan individu dari pengalaman akademik di bidang pendidikan. Saya memiliki ketertarikan untuk berkontribusi dalam lingkungan kerja yang dinamis, khususnya pada bidang yang membutuhkan ketelitian, pengelolaan informasi, serta kemampuan komunikasi yang baik.",
    highlights: [
      { label: "IPK", value: "3,90" },
      { label: "Universitas", value: "UNSRI" },
      { label: "Jurusan", value: "Pend. Kimia" },
      { label: "Angkatan", value: "2022" },
    ],
    traits: [
      "Analitis",
      "Teliti",
      "Terstruktur",
      "Adaptif",
      "Kolaboratif",
      "Sistematis",
    ],
  },
  en: {
    sectionTag: "About Me",
    title: "Brief Profile",
    bio: "I am a graduate of Chemistry Education at Sriwijaya University with a GPA of 3.90, possessing analytical skills, problem-solving ability, and systematic thinking developed through a science background and research experience. Accustomed to working in a structured manner, meticulous in data processing, and able to adapt well both individually and in teams. I have an understanding of evaluation, program planning, and individual mentoring from academic experience in education. I am interested in contributing to a dynamic work environment, particularly in fields requiring precision, information management, and strong communication skills.",
    highlights: [
      { label: "GPA", value: "3.90" },
      { label: "University", value: "UNSRI" },
      { label: "Major", value: "Chem. Edu." },
      { label: "Batch", value: "2022" },
    ],
    traits: [
      "Analytical",
      "Meticulous",
      "Structured",
      "Adaptive",
      "Collaborative",
      "Systematic",
    ],
  },
};

export default function About() {
  const { language } = useThemeLanguage();
  const c = content[language];
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
