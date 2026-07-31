"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Wrench, Globe } from "lucide-react";
import { useThemeLanguage } from "@/context/ThemeLanguageContext";
import { useMotion } from "@/lib/motion";

const content = {
  id: {
    sectionTag: "Kompetensi",
    title: "Keahlian",
    softSkills: {
      label: "Soft Skill",
      items: [
        { name: "Problem Solving", level: 88 },
        { name: "Critical Thinking", level: 85 },
        { name: "Teamwork", level: 92 },
        { name: "Time Management", level: 80 },
        { name: "Strategic Planning", level: 78 },
        { name: "Communication Skills", level: 90 },
      ],
    },
    hardSkills: {
      label: "Hard Skill",
      items: [
        { name: "Microsoft Word", level: 90 },
        { name: "Microsoft Excel", level: 85 },
        { name: "Microsoft PowerPoint", level: 88 },
        { name: "Copywriting", level: 80 },
      ],
    },
    languages: {
      label: "Bahasa",
      items: [
        { name: "Bahasa Indonesia", level: 98, note: "Fasih" },
        { name: "English", level: 50, note: "Dasar" },
      ],
    },
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
    softSkills: {
      label: "Soft Skills",
      items: [
        { name: "Problem Solving", level: 88 },
        { name: "Critical Thinking", level: 85 },
        { name: "Teamwork", level: 92 },
        { name: "Time Management", level: 80 },
        { name: "Strategic Planning", level: 78 },
        { name: "Communication Skills", level: 90 },
      ],
    },
    hardSkills: {
      label: "Hard Skills",
      items: [
        { name: "Microsoft Word", level: 90 },
        { name: "Microsoft Excel", level: 85 },
        { name: "Microsoft PowerPoint", level: 88 },
        { name: "Copywriting", level: 80 },
      ],
    },
    languages: {
      label: "Languages",
      items: [
        { name: "Bahasa Indonesia", level: 98, note: "Native" },
        { name: "English", level: 50, note: "Basic" },
      ],
    },
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
      <div className="skill-track">
        <motion.div
          className="skill-fill"
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function Skills() {
  const { language } = useThemeLanguage();
  const c = content[language];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { slideUp, stagger } = useMotion();

  const groups = [
    { Icon: Brain, label: c.softSkills.label, items: c.softSkills.items },
    { Icon: Wrench, label: c.hardSkills.label, items: c.hardSkills.items },
    { Icon: Globe, label: c.languages.label, items: c.languages.items },
  ];

  return (
    <section
      id="skills"
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
          className="mb-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {groups.map(({ Icon, label, items }) => (
            <motion.div
              key={label}
              variants={slideUp}
              className="rounded-2xl border border-brown-light/20 bg-cream p-5 sm:p-6"
            >
              <div className="mb-5 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brown/10">
                  <Icon size={17} className="text-brown" />
                </div>
                <h3 className="font-bold text-text-main">{label}</h3>
              </div>
              <div className="space-y-4">
                {items.map((item) => (
                  <SkillBar key={item.name} {...item} inView={inView} />
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trainings */}
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-muted">
            {c.trainingLabel}
          </p>
          <motion.div
            variants={stagger(0.06)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="flex flex-wrap justify-center gap-3"
          >
            {c.trainings.map((t) => (
              <motion.span
                key={t}
                variants={slideUp}
                className="rounded-full border border-brown-light/30 bg-cream px-4 py-2 text-sm text-text-muted"
              >
                {t}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
