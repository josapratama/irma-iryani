"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { useThemeLanguage } from "@/context/ThemeLanguageContext";
import { useMotion } from "@/lib/motion";
import Image from "next/image";

type Certificate = {
  id: number;
  title: { id: string; en: string };
  issuer: string;
  date: string;
  score?: string;
  category: string;
  image: string;
};

const certificates: Certificate[] = [
  {
    id: 1,
    title: {
      id: "Essential Skills: Digital Disruption & Transformation",
      en: "Essential Skills: Digital Disruption & Transformation",
    },
    issuer: "GNIK – Kemnaker RI",
    date: "17 Juli 2026",
    score: "Nilai 95",
    category: "Technology",
    image: "/certificates/cert-digital-disruption.png",
  },
  {
    id: 2,
    title: {
      id: "Essential Skills: Integrity at Work",
      en: "Essential Skills: Integrity at Work",
    },
    issuer: "GNIK – Kemnaker RI",
    date: "17 Juli 2026",
    score: "Nilai 86",
    category: "Professional",
    image: "/certificates/cert-integrity-at-work.png",
  },
  {
    id: 3,
    title: {
      id: "Essential Skills: Emotional Intelligence",
      en: "Essential Skills: Emotional Intelligence",
    },
    issuer: "GNIK – Kemnaker RI",
    date: "17 Juli 2026",
    score: "Nilai 95",
    category: "Soft Skills",
    image: "/certificates/cert-emotional-intelligence.png",
  },
  {
    id: 4,
    title: {
      id: "Essential Skills: Emotional Resilience",
      en: "Essential Skills: Emotional Resilience",
    },
    issuer: "GNIK – Kemnaker RI",
    date: "18 Juli 2026",
    score: "Nilai 90",
    category: "Soft Skills",
    image: "/certificates/cert-emotional-resilience.png",
  },
  {
    id: 5,
    title: {
      id: "Essential Skills: Social Influence",
      en: "Essential Skills: Social Influence",
    },
    issuer: "GNIK – Kemnaker RI",
    date: "17 Juli 2026",
    score: "Nilai 85",
    category: "Soft Skills",
    image: "/certificates/cert-social-influence.png",
  },
  {
    id: 6,
    title: {
      id: "Essential Skills: Adaptability",
      en: "Essential Skills: Adaptability",
    },
    issuer: "GNIK – Kemnaker RI",
    date: "17 Juli 2026",
    score: "Nilai 100",
    category: "Soft Skills",
    image: "/certificates/cert-adaptability.png",
  },
  {
    id: 7,
    title: {
      id: "Essential Skills: Self Efficacy",
      en: "Essential Skills: Self Efficacy",
    },
    issuer: "GNIK – Kemnaker RI",
    date: "16 Juli 2026",
    score: "Nilai 90",
    category: "Soft Skills",
    image: "/certificates/cert-self-efficacy.png",
  },
  {
    id: 8,
    title: {
      id: "Pengenalan Data Science dan Pemanfaatannya di Berbagai Sektor",
      en: "Introduction to Data Science and Its Applications",
    },
    issuer: "Komdigi – Digital Talent Scholarship 2026",
    date: "18 Juli 2026",
    category: "Data",
    image: "/certificates/cert-data-science.png",
  },
  {
    id: 9,
    title: {
      id: "Panitia Media Partner – Webinar Beasiswa Unggulan",
      en: "Media Partner Committee – Outstanding Scholarship Webinar",
    },
    issuer: "HMK FKIP Universitas Sriwijaya",
    date: "17 Juni 2023",
    category: "Organization",
    image: "/certificates/cert-webinar-beasiswa.png",
  },
  {
    id: 10,
    title: {
      id: "Panitia – Aruvena Education Class (AEC)",
      en: "Committee – Aruvena Education Class (AEC)",
    },
    issuer: "Himpunan Mahasiswa Kimia UNSRI",
    date: "11 November 2023",
    category: "Organization",
    image: "/certificates/cert-aec.png",
  },
  {
    id: 11,
    title: {
      id: "Panitia Humas – BIRUNI (Bincang Asik Bareng Alumni)",
      en: "Public Relations Committee – BIRUNI Alumni Event",
    },
    issuer: "Himpunan Mahasiswa Kimia UNSRI",
    date: "13 Juli 2023",
    category: "Organization",
    image: "/certificates/cert-biruni.png",
  },
  {
    id: 12,
    title: {
      id: "Panitia – Dies Natalis HMK ke-38",
      en: "Committee – HMK 38th Anniversary",
    },
    issuer: "Himpunan Mahasiswa Kimia UNSRI",
    date: "05 Mei 2024",
    category: "Organization",
    image: "/certificates/cert-dies-natalis.png",
  },
];

const catColors: Record<string, { bg: string; text: string; border: string }> =
  {
    Technology: { bg: "#dbeafe", text: "#1447e6", border: "#bedbff" },
    Professional: { bg: "#f3e8ff", text: "#7e22ce", border: "#e9d5ff" },
    "Soft Skills": { bg: "#fef3c7", text: "#b45309", border: "#fde68a" },
    Data: { bg: "#cffafe", text: "#0e7490", border: "#a5f3fc" },
    Organization: { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" },
  };

export default function Certificates() {
  const { language } = useThemeLanguage();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [selected, setSelected] = useState<Certificate | null>(null);
  const { slideUp, scale, stagger } = useMotion();

  const sectionTag = language === "id" ? "Sertifikat" : "Certificates";
  const title =
    language === "id"
      ? "Sertifikat & Penghargaan"
      : "Certificates & Achievements";
  const viewLabel = language === "id" ? "Lihat" : "View";
  const closeLabel = language === "id" ? "Tutup" : "Close";

  return (
    <section
      id="certificates"
      className="section-shell pt-10 pb-20 md:pt-14 md:pb-24 px-4 sm:px-6 lg:px-8"
      ref={ref}
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-14 text-center"
        >
          <span className="text-xs font-medium uppercase tracking-widest text-brown">
            {sectionTag}
          </span>
          <h2 className="mt-2 text-3xl font-bold text-text-main lg:text-4xl">
            {title}
          </h2>
          <div className="section-divider" />
        </motion.div>

        <motion.div
          variants={stagger(0.04)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {certificates.map((cert) => {
            const cat = catColors[cert.category] ?? catColors["Soft Skills"];
            return (
              <motion.div
                key={cert.id}
                variants={slideUp}
                whileHover={{ y: -4, transition: { duration: 0.18 } }}
                onClick={() => setSelected(cert)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-brown-light/20 bg-cream-dark transition-all duration-200 hover:border-brown/40 hover:shadow-lg"
              >
                <div className="relative h-36 w-full overflow-hidden bg-cream-dark/80">
                  <Image
                    src={cert.image}
                    alt={cert.title[language]}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-brown/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-white">
                      <ZoomIn size={16} />
                      {viewLabel}
                    </span>
                  </div>
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
                  <p className="text-xs text-brown">{cert.date}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              variants={scale}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-cream shadow-2xl"
            >
              <button
                onClick={() => setSelected(null)}
                aria-label={closeLabel}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white"
              >
                <X size={16} />
              </button>
              <div className="relative aspect-4/3 w-full">
                <Image
                  src={selected.image}
                  alt={selected.title[language]}
                  fill
                  className="object-contain"
                  sizes="672px"
                />
              </div>
              <div className="border-t border-brown-light/20 px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold leading-snug text-text-main">
                      {selected.title[language]}
                    </h3>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {selected.issuer}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium text-brown">
                      {selected.date}
                    </p>
                    {selected.score && (
                      <p className="mt-0.5 text-sm font-bold text-brown">
                        {selected.score}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
