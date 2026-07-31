"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Award, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useThemeLanguage } from "@/context/ThemeLanguageContext";
import { useMotion } from "@/lib/motion";
import Image from "next/image";

// Photos for each experience item
const photos = {
  internship: [
    {
      src: "/experiences/exp-plp-ceremony.jpeg",
      caption: {
        id: "Upacara Pelepasan Mahasiswa PLP",
        en: "PLP Student Departure Ceremony",
      },
    },
    {
      src: "/experiences/exp-plp-ceremony-2.png",
      caption: {
        id: "Dokumentasi Kegiatan PLP",
        en: "PLP Activity Documentation",
      },
    },
    {
      src: "/experiences/exp-plp-ceremony-3.png",
      caption: {
        id: "Kegiatan Praktik Mengajar PLP",
        en: "PLP Teaching Practice Activity",
      },
    },
  ],
  org: [
    {
      src: "/experiences/exp-hmk-members.png",
      caption: {
        id: "Foto Bersama Anggota HMK UNSRI",
        en: "Group Photo with HMK UNSRI Members",
      },
    },
  ],
};

const content = {
  id: {
    sectionTag: "Pengalaman",
    title: "Pengalaman & Organisasi",
    photoLabel: "Dokumentasi",
    internship: {
      label: "Magang",
      title: "Mahasiswa Praktik PLP Pendidikan Kimia",
      org: "SMA Negeri 1 Indralaya Utara",
      period: "Oktober 2025 – November 2025",
      points: [
        "Melaksanakan praktik mengajar, membimbing, dan berinteraksi secara langsung dengan siswa dalam proses pembelajaran.",
        "Mengembangkan kemampuan komunikasi, adaptasi, dan pengelolaan kelas.",
      ],
    },
    org: {
      label: "Organisasi",
      title: "Anggota Aktif",
      org: "Himpunan Mahasiswa Kimia (HMK)",
      period: "2022 – 2024",
      points: [
        "Aktif berpartisipasi dalam kegiatan organisasi sebagai bentuk pengembangan diri dan kontribusi akademik.",
        "Berkontribusi dalam berbagai kegiatan yang mendukung peningkatan kemampuan kerja sama tim dan komunikasi.",
        "Mengembangkan sikap tanggung jawab, disiplin, dan kemampuan beradaptasi dalam lingkungan organisasi.",
      ],
    },
    committee: {
      label: "Kepanitiaan",
      events: [
        {
          title: "Webinar Beasiswa Unggulan",
          role: "Divisi Media Partner",
          period: "Juni 2023",
          points: [
            "Menjalin kerja sama dengan media partner untuk mendukung publikasi kegiatan.",
            "Membantu memperluas jangkauan informasi dan meningkatkan partisipasi peserta.",
          ],
        },
        {
          title: "ARUVENA Education Class (AEC)",
          role: "Divisi Humas",
          period: "November 2023",
          points: [
            "Menyusun dan menyebarkan surat undangan kepada dosen dan organisasi terkait.",
            "Melakukan publikasi kegiatan melalui penyebaran pamflet sebelum dan saat acara berlangsung.",
          ],
        },
        {
          title: "BIRUNI (Bincang Asik Bareng Alumni)",
          role: "Divisi Humas",
          period: "Juli 2023",
          points: [
            "Bertanggung jawab dalam penyebaran surat undangan kepada dosen dan pihak terkait.",
            "Menjalin komunikasi dengan peserta dan pihak eksternal untuk mendukung kelancaran acara.",
          ],
        },
        {
          title: "Dies Natalis HMK ke-38",
          role: "Divisi Transportasi",
          period: "Mei 2024",
          points: [
            "Mengatur dan mengoordinasikan kebutuhan transportasi kegiatan.",
            "Memastikan kelancaran mobilisasi panitia, tamu, dan perlengkapan acara.",
          ],
        },
      ],
    },
  },
  en: {
    sectionTag: "Experience",
    title: "Experience & Organization",
    photoLabel: "Documentation",
    internship: {
      label: "Internship",
      title: "PLP Chemistry Education Student Practice",
      org: "SMA Negeri 1 Indralaya Utara",
      period: "October 2025 – November 2025",
      points: [
        "Conducted teaching practice, mentoring, and directly interacted with students in the learning process.",
        "Developed communication, adaptation, and classroom management skills.",
      ],
    },
    org: {
      label: "Organization",
      title: "Active Member",
      org: "Chemistry Student Association (HMK)",
      period: "2022 – 2024",
      points: [
        "Actively participated in organizational activities for self-development and academic contribution.",
        "Contributed to various activities supporting teamwork and communication improvement.",
        "Developed responsibility, discipline, and adaptability in the organizational environment.",
      ],
    },
    committee: {
      label: "Committee",
      events: [
        {
          title: "Webinar Beasiswa Unggulan",
          role: "Media Partner Division",
          period: "June 2023",
          points: [
            "Established cooperation with media partners to support event publication.",
            "Helped expand information reach and increase participant engagement.",
          ],
        },
        {
          title: "ARUVENA Education Class (AEC)",
          role: "Public Relations Division",
          period: "November 2023",
          points: [
            "Drafted and distributed invitation letters to lecturers and related organizations.",
            "Performed event publication through flyer distribution before and during the event.",
          ],
        },
        {
          title: "BIRUNI (Alumni Discussion Event)",
          role: "Public Relations Division",
          period: "July 2023",
          points: [
            "Responsible for distributing invitation letters to lecturers and related parties.",
            "Maintained communication with participants and external parties to ensure event success.",
          ],
        },
        {
          title: "HMK 38th Anniversary",
          role: "Transportation Division",
          period: "May 2024",
          points: [
            "Arranged and coordinated transportation needs for the event.",
            "Ensured smooth mobilization of committee, guests, and event equipment.",
          ],
        },
      ],
    },
  },
};

// ── Photo lightbox ────────────────────────────────────────────────────
function Lightbox({
  photos: imgs,
  startIndex,
  lang,
  onClose,
}: {
  photos: { src: string; caption: { id: string; en: string } }[];
  startIndex: number;
  lang: "id" | "en";
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);
  const prev = () => setIdx((i) => (i - 1 + imgs.length) % imgs.length);
  const next = () => setIdx((i) => (i + 1) % imgs.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-cream shadow-2xl"
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Image */}
        <div className="relative aspect-video w-full bg-cream-dark">
          <Image
            src={imgs[idx].src}
            alt={imgs[idx].caption[lang]}
            fill
            className="object-cover"
            sizes="768px"
          />
          {/* Gradient overlay for caption */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/60 to-transparent" />
          <p className="absolute bottom-4 left-4 right-12 text-sm font-medium text-white drop-shadow">
            {imgs[idx].caption[lang]}
          </p>
        </div>

        {/* Nav arrows (only if multiple photos) */}
        {imgs.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
            {/* Dots */}
            <div className="flex justify-center gap-1.5 py-3">
              {imgs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === idx ? "w-5 bg-brown" : "w-1.5 bg-brown-light/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Photo strip thumbnail ─────────────────────────────────────────────
function PhotoStrip({
  photoKey,
  lang,
  label,
}: {
  photoKey: keyof typeof photos;
  lang: "id" | "en";
  label: string;
}) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const imgs = photos[photoKey];

  return (
    <>
      <div className="mt-4">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brown">
          <span className="inline-block h-px w-4 bg-brown" />
          {label}
        </p>
        <div className="flex flex-wrap gap-2">
          {imgs.map((img, i) => (
            <motion.button
              key={i}
              onClick={() => setLightboxIdx(i)}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="group relative h-20 w-32 cursor-pointer overflow-hidden rounded-xl border-2 border-brown-light/20 hover:border-brown/50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Image
                src={img.src}
                alt={img.caption[lang]}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="128px"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-brown/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                  Lihat
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          photos={imgs}
          startIndex={lightboxIdx}
          lang={lang}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────
export default function Experience() {
  const { language } = useThemeLanguage();
  const c = content[language];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { slideUp, stagger } = useMotion();

  return (
    <section
      id="experience"
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

        {/* Internship + Org */}
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-8 grid gap-5 xl:grid-cols-2"
        >
          {/* Internship */}
          <motion.div
            variants={slideUp}
            className="overflow-hidden rounded-2xl border border-brown-light/20 bg-cream-dark"
          >
            {/* Hero photo banner */}
            <div className="relative h-44 w-full overflow-hidden">
              <Image
                src="/experiences/exp-plp-ceremony.jpeg"
                alt={photos.internship[0].caption[language]}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1280px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
              {/* Label badge */}
              <span className="absolute left-4 top-4 rounded-full border border-brown-light/40 bg-brown/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                {c.internship.label}
              </span>
              {/* Title overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-xs text-white/80">{c.internship.org}</p>
                <h4 className="font-bold text-white leading-snug">
                  {c.internship.title}
                </h4>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6">
              <p className="mb-4 text-xs text-text-muted">
                {c.internship.period}
              </p>
              <ul className="space-y-2.5">
                {c.internship.points.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-text-muted"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brown-light" />
                    {p}
                  </li>
                ))}
              </ul>
              <PhotoStrip
                photoKey="internship"
                lang={language}
                label={c.photoLabel}
              />
            </div>
          </motion.div>

          {/* Organization */}
          <motion.div
            variants={slideUp}
            className="overflow-hidden rounded-2xl border border-brown-light/20 bg-cream-dark"
          >
            {/* Hero photo banner */}
            <div className="relative h-44 w-full overflow-hidden">
              <Image
                src="/experiences/exp-hmk-members.png"
                alt={photos.org[0].caption[language]}
                fill
                className="object-cover object-top"
                sizes="(max-width: 1280px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
              <span className="absolute left-4 top-4 rounded-full border border-brown-light/40 bg-brown/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                {c.org.label}
              </span>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-xs text-white/80">{c.org.org}</p>
                <h4 className="font-bold text-white leading-snug">
                  {c.org.title}
                </h4>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6">
              <p className="mb-4 text-xs text-text-muted">{c.org.period}</p>
              <ul className="space-y-2.5">
                {c.org.points.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-text-muted"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brown-light" />
                    {p}
                  </li>
                ))}
              </ul>
              <PhotoStrip photoKey="org" lang={language} label={c.photoLabel} />
            </div>
          </motion.div>
        </motion.div>

        {/* Committee */}
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <div className="mb-6 flex items-center justify-center gap-2">
            <Award size={14} className="text-brown" />
            <span className="text-sm font-semibold uppercase tracking-wider text-text-muted">
              {c.committee.label}
            </span>
          </div>
          <motion.div
            variants={stagger(0.07)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid gap-5 sm:grid-cols-2"
          >
            {c.committee.events.map((event) => (
              <motion.div
                key={event.title}
                variants={slideUp}
                className="rounded-2xl border border-brown-light/20 bg-cream-dark p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-text-main">
                      {event.title}
                    </h4>
                    <p className="mt-0.5 text-xs font-medium text-brown">
                      {event.role}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-text-muted">
                    {event.period}
                  </span>
                </div>
                <ul className="space-y-2">
                  {event.points.map((p, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm leading-relaxed text-text-muted"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brown-light" />
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
