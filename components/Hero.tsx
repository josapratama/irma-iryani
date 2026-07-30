"use client";

import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Download, ChevronDown } from "lucide-react";
import { useThemeLanguage } from "@/context/ThemeLanguageContext";
import { useMotion } from "@/lib/motion";
import Image from "next/image";

const content = {
  id: {
    greeting: "Halo, saya",
    title: "Lulusan S1 Pendidikan Kimia",
    subtitle: "Analitis · Terstruktur · Berorientasi Solusi",
    description:
      "Lulusan Universitas Sriwijaya dengan IPK 3,90. Terbiasa bekerja terstruktur, teliti mengolah data, dan berkomitmen mengembangkan kompetensi secara profesional.",
    cta: "Unduh CV",
    contact: "Kontak Saya",
  },
  en: {
    greeting: "Hello, I'm",
    title: "Chemistry Education Graduate",
    subtitle: "Analytical · Structured · Solution-Oriented",
    description:
      "Graduate of Sriwijaya University with GPA 3.90. Accustomed to structured work, meticulous in data processing, and committed to professionally developing competencies.",
    cta: "Download CV",
    contact: "Contact Me",
  },
};

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const navHeight = 72;
  const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
  window.scrollTo({ top, behavior: "smooth" });
}

export default function Hero() {
  const { language } = useThemeLanguage();
  const c = content[language];
  const { slideUp, slideRight, slideLeft, scale } = useMotion();

  return (
    <section
      id="hero"
      className="section-shell relative flex min-h-screen flex-col items-center justify-center px-4 pb-20 pt-24 sm:px-6 sm:pt-28 lg:px-8"
    >
      {/* Background blobs — pointer-events-none so they never block clicks */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 h-80 w-80 rounded-full bg-brown-light/10 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute left-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-brown/6 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-brown-light/6 blur-3xl" />
      </div>

      {/* ── Main content ── */}
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-12 xl:gap-20">
          {/* Left: Text */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            animate="visible"
            className="flex-1 text-center lg:text-left"
          >
            <motion.div
              variants={slideUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-brown-light/25 bg-cream-dark/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brown"
            >
              Portfolio
            </motion.div>

            <motion.p
              variants={slideUp}
              className="mb-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-brown-light sm:text-sm"
            >
              {c.greeting}
            </motion.p>

            <motion.h1
              variants={slideUp}
              className="mb-3 text-4xl font-bold leading-tight tracking-tight text-text-main sm:text-5xl xl:text-6xl"
            >
              Irma <span className="text-brown">Iryani</span>
            </motion.h1>

            <motion.p
              variants={slideUp}
              className="mb-2 text-lg font-semibold text-text-main sm:text-xl"
            >
              {c.title}
            </motion.p>

            <motion.p
              variants={slideUp}
              className="mb-6 text-xs uppercase tracking-[0.18em] text-brown-light"
            >
              {c.subtitle}
            </motion.p>

            <motion.p
              variants={slideUp}
              className="mx-auto mb-8 max-w-lg text-sm leading-7 text-text-muted lg:mx-0 lg:text-base"
            >
              {c.description}
            </motion.p>

            {/* Contact chips */}
            <motion.div
              variants={slideUp}
              className="mb-8 flex flex-wrap justify-center gap-2 lg:justify-start"
            >
              <span className="flex items-center gap-1.5 rounded-full border border-brown-light/15 bg-cream-dark/60 px-3 py-1.5 text-xs text-text-muted">
                <MapPin size={12} className="shrink-0 text-brown" />
                Prabumulih, Sumatera Selatan
              </span>
              <a
                href="mailto:irmairyani@gmail.com"
                className="flex items-center gap-1.5 rounded-full border border-brown-light/15 bg-cream-dark/60 px-3 py-1.5 text-xs text-text-muted transition-colors hover:text-brown"
              >
                <Mail size={12} className="shrink-0 text-brown" />
                irmairyani@gmail.com
              </a>
              <a
                href="tel:0887437204107"
                className="flex items-center gap-1.5 rounded-full border border-brown-light/15 bg-cream-dark/60 px-3 py-1.5 text-xs text-text-muted transition-colors hover:text-brown"
              >
                <Phone size={12} className="shrink-0 text-brown" />
                0887437204107
              </a>
            </motion.div>

            {/* CTA */}
            <motion.div
              variants={slideUp}
              className="flex flex-wrap justify-center gap-3 lg:justify-start"
            >
              <motion.a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("contact");
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full bg-brown px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brown/20"
              >
                {c.contact}
              </motion.a>
              <motion.a
                href="/cv.pdf"
                download
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-full border border-brown-light/30 px-6 py-2.5 text-sm font-semibold text-brown transition-colors hover:bg-brown/8"
              >
                <Download size={14} />
                {c.cta}
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Right: Photo — extra px padding so badges don't clip on mobile */}
          <motion.div
            variants={scale}
            initial="hidden"
            animate="visible"
            className="relative flex shrink-0 justify-center px-6 sm:px-8"
          >
            <div className="relative h-52 w-52 sm:h-64 sm:w-64 md:h-72 md:w-72 lg:h-80 lg:w-80 xl:h-96 xl:w-96">
              {/* Decorative rings */}
              <div className="pointer-events-none absolute inset-0 scale-[1.08] rounded-full border border-brown-light/20" />
              <div className="pointer-events-none absolute inset-0 scale-[1.18] rounded-full border border-brown/10" />
              <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(212,170,96,0.15),transparent_65%)]" />

              {/* Photo */}
              <div className="relative h-full w-full overflow-hidden rounded-full border-4 border-brown-light/30 bg-cream-dark shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                <Image
                  src="/profile.jpg"
                  alt="Irma Iryani"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 208px, (max-width: 768px) 256px, (max-width: 1024px) 288px, 384px"
                  priority
                />
              </div>

              {/* Badge — IPK (bottom-right, inside padding boundary) */}
              <motion.div
                variants={slideLeft}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.6 }}
                className="absolute -bottom-3 right-0 rounded-2xl border border-brown-light/25 bg-cream px-3 py-2 shadow-lg"
              >
                <p className="text-[9px] uppercase tracking-widest text-text-muted">
                  IPK
                </p>
                <p className="text-xl font-bold text-brown">3,90</p>
              </motion.div>

              {/* Badge — Prodi (top-left, inside padding boundary) */}
              <motion.div
                variants={slideRight}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.7 }}
                className="absolute -top-3 left-0 rounded-2xl border border-brown-light/25 bg-cream px-3 py-2 shadow-lg"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-brown">
                  S1 Kim. Pendidikan
                </p>
                <p className="text-xs text-text-muted">Universitas Sriwijaya</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll-to-next button — sits above everything, fully clickable */}
      <motion.button
        onClick={() => scrollToSection("about")}
        aria-label="Scroll ke bawah"
        variants={slideUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 1.1 }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 cursor-pointer rounded-full p-2 text-brown-light/70 transition-colors hover:text-brown focus:outline-none"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </motion.button>
    </section>
  );
}
