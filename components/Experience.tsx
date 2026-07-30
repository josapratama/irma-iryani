"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Users, Award } from "lucide-react";
import { useThemeLanguage } from "@/context/ThemeLanguageContext";
import { useMotion } from "@/lib/motion";

const content = {
  id: {
    sectionTag: "Pengalaman",
    title: "Pengalaman & Organisasi",
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
          {[
            {
              icon: <Briefcase size={20} className="text-brown" />,
              data: c.internship,
            },
            { icon: <Users size={20} className="text-brown" />, data: c.org },
          ].map(({ icon, data }) => (
            <motion.div
              key={data.title}
              variants={slideUp}
              className="rounded-2xl border border-brown-light/20 bg-cream-dark p-5 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brown-light/30 bg-brown/10">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-brown">
                    {data.label}
                  </span>
                  <h4 className="mt-0.5 font-bold text-text-main">
                    {data.title}
                  </h4>
                  <p className="mt-0.5 text-sm font-medium text-brown">
                    {data.org}
                  </p>
                  <p className="mb-4 mt-1 text-xs text-text-muted">
                    {data.period}
                  </p>
                  <ul className="space-y-2.5">
                    {data.points.map((p, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-text-muted"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brown-light" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
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
