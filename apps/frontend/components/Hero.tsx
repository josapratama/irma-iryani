"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Download, ChevronDown } from "lucide-react";
import { useThemeLanguage } from "@/context/ThemeLanguageContext";
import { useMotion } from "@/lib/motion";
import { useProfile } from "@/hooks/useProfile";
import Image from "next/image";
import SocialLinks from "@/components/SocialLinks";

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const navHeight = 72;
  const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
  window.scrollTo({ top, behavior: "smooth" });
}

export default function Hero() {
  const { language, t } = useThemeLanguage();
  const { data: profile } = useProfile();
  const [isCvOpen, setIsCvOpen] = useState(false);

  const c = {
    greeting: (profile?.greeting && profile.greeting[language]) || profile?.greeting?.en || profile?.greeting?.id || t("hero.greeting", "Halo, saya"),
    title: (profile?.title && profile.title[language]) || profile?.title?.en || profile?.title?.id || t("hero.title", "Lulusan S1 Pendidikan Kimia"),
    subtitle: (profile?.subtitle && profile.subtitle[language]) || profile?.subtitle?.en || profile?.subtitle?.id || (language === "en" ? "Analytical · Structured · Solution-Oriented" : (language === "ja" ? "分析的 · 構造化 · ソリューション志向" : "Analitis · Terstruktur · Berorientasi Solusi")),
    description: (profile?.description && profile.description[language]) || profile?.description?.en || profile?.description?.id || t("hero.description", "Lulusan Universitas Sriwijaya dengan IPK 3,90."),
    cta: t("hero.cta_cv", "Unduh CV"),
    contact: t("hero.cta_contact", "Kontak Saya"),
  };
  const { slideUp, slideRight, slideLeft, scale } = useMotion();

  const fullName = profile?.name?.trim() || "Irma Iryani";
  const nameParts = fullName.split(" ");
  const firstName = nameParts[0];
  const restName = nameParts.slice(1).join(" ");

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
              {firstName} {restName && <span className="text-brown">{restName}</span>}
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
                {profile?.location || "Prabumulih, Sumatera Selatan"}
              </span>
              <a
                href={`mailto:${profile?.email || "irmairyani698@gmail.com"}`}
                className="flex items-center gap-1.5 rounded-full border border-brown-light/15 bg-cream-dark/60 px-3 py-1.5 text-xs text-text-muted transition-colors hover:text-brown"
              >
                <Mail size={12} className="shrink-0 text-brown" />
                {profile?.email || "irmairyani698@gmail.com"}
              </a>
              <a
                href={`tel:${profile?.phone || "0887437204107"}`}
                className="flex items-center gap-1.5 rounded-full border border-brown-light/15 bg-cream-dark/60 px-3 py-1.5 text-xs text-text-muted transition-colors hover:text-brown"
              >
                <Phone size={12} className="shrink-0 text-brown" />
                {profile?.phone || "0887437204107"}
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

              {/* CV dropdown */}
              <div className="relative group">
                <motion.button
                  type="button"
                  onClick={() => setIsCvOpen(!isCvOpen)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 rounded-full border border-brown-light/30 px-6 py-2.5 text-sm font-semibold text-brown transition-colors hover:bg-brown/8 cursor-pointer"
                  aria-expanded={isCvOpen}
                >
                  <Download size={14} />
                  <span>{c.cta}</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${
                      isCvOpen ? "rotate-180" : ""
                    }`}
                  />
                </motion.button>

                {/* Dropdown menu */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-full z-30 mt-2 w-64 rounded-2xl border border-brown-light/20 bg-cream shadow-xl transition-all duration-200 ${
                    isCvOpen
                      ? "pointer-events-auto opacity-100 translate-y-0"
                      : "pointer-events-none opacity-0 translate-y-1 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0"
                  }`}
                >
                  <div className="p-2">
                    {(profile?.cvItems && profile.cvItems.length > 0
                      ? profile.cvItems
                      : [
                          {
                            label: "CV Asisten Statistisi",
                            url: "/curriculum-vitae/bps-asisten-statistisi.pdf",
                            description: "PDF · BPS",
                          },
                          {
                            label: "CV Pranata Komputer",
                            url: "/curriculum-vitae/bps-pranata-komputer.pdf",
                            description: "PDF · BPS",
                          },
                        ]
                    ).map((cv, idx) => (
                      <a
                        key={idx}
                        href={cv.url}
                        download
                        onClick={() => setIsCvOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-text-muted transition-colors hover:bg-cream-dark hover:text-brown"
                      >
                        <Download size={13} className="shrink-0 text-brown" />
                        <div>
                          <p className="font-semibold text-text-main">
                            {cv.label}
                          </p>
                          {cv.description && (
                            <p className="text-xs text-text-muted">{cv.description}</p>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Social media links */}
            <motion.div
              variants={slideUp}
              className="mt-7 flex justify-center lg:justify-start"
            >
              <SocialLinks links={profile?.socialLinks} orientation="horizontal" size="md" />
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
                  src={profile?.photoUrl || "/profile.jpg"}
                  alt={fullName}
                  fill
                  className="object-cover object-[center_45%]"
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
                <p className="text-xl font-bold text-brown">{profile?.gpa || "3,90"}</p>
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
                  {profile?.degreeBadge || "S1 Kim. Pendidikan"}
                </p>
                <p className="text-xs text-text-muted">{profile?.universityBadge || "Universitas Sriwijaya"}</p>
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
