"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useThemeLanguage } from "@/context/ThemeLanguageContext";
import { useMotion } from "@/lib/motion";
import emailjs from "@emailjs/browser";

const content = {
  id: {
    sectionTag: "Kontak",
    title: "Hubungi Saya",
    subtitle:
      "Terbuka untuk peluang kerja, kolaborasi, atau sekadar berdiskusi.",
    namePlaceholder: "Nama Anda",
    emailPlaceholder: "Email Anda",
    messagePlaceholder: "Pesan Anda...",
    send: "Kirim Pesan",
    sent: "Terkirim!",
    sending: "Mengirim...",
    successMsg:
      "Terima kasih! Pesan Anda sudah terkirim, saya akan segera membalas.",
    errorMsg:
      "Gagal mengirim pesan. Silakan coba lagi atau hubungi langsung via email.",
  },
  en: {
    sectionTag: "Contact",
    title: "Get In Touch",
    subtitle:
      "Open to job opportunities, collaborations, or just having a conversation.",
    namePlaceholder: "Your Name",
    emailPlaceholder: "Your Email",
    messagePlaceholder: "Your Message...",
    send: "Send Message",
    sent: "Sent!",
    sending: "Sending...",
    successMsg: "Thank you! Your message has been sent, I will reply soon.",
    errorMsg:
      "Failed to send message. Please try again or contact me directly via email.",
  },
};

// Read from environment variables
const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "";
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "";

export default function Contact() {
  const { language } = useThemeLanguage();
  const c = content[language];
  const ref = useRef(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const { slideUp, slideRight, slideLeft, stagger } = useMotion();

  // Reset status when language changes to avoid stale "sent/error" UI
  const prevLang = useRef(language);
  useEffect(() => {
    if (prevLang.current !== language) {
      prevLang.current = language;
      if (status !== "idle" && status !== "sending") setStatus("idle");
    }
  }, [language, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    // Fallback: if EmailJS not configured, open mailto
    if (!SERVICE_ID || SERVICE_ID === "your_service_id") {
      const subject = encodeURIComponent(`Pesan dari ${form.name}`);
      const body = encodeURIComponent(
        `Nama: ${form.name}\nEmail: ${form.email}\n\n${form.message}`,
      );
      window.open(
        `mailto:irmairyani@gmail.com?subject=${subject}&body=${body}`,
      );
      return;
    }

    setStatus("sending");

    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, {
        publicKey: PUBLIC_KEY,
      });
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("EmailJS error:", err);
      setStatus("error");
    }
  };

  const contactItems = [
    {
      icon: <Mail size={18} />,
      label: "Email",
      value: "irmairyani@gmail.com",
      href: "mailto:irmairyani@gmail.com",
    },
    {
      icon: <Phone size={18} />,
      label: "Telepon",
      value: "0887437204107",
      href: "tel:0887437204107",
    },
    {
      icon: <MapPin size={18} />,
      label: "Lokasi",
      value: "Prabumulih, Sumatera Selatan",
      href: null,
    },
  ];

  return (
    <section
      id="contact"
      className="section-shell bg-cream-dark pt-10 pb-20 md:pt-14 md:pb-24 px-4 sm:px-6 lg:px-8"
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
          <p className="mt-4 text-sm text-text-muted">{c.subtitle}</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-start">
          {/* Contact info */}
          <motion.div
            variants={stagger(0.08)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="space-y-4"
          >
            {contactItems.map((item) => (
              <motion.div
                key={item.label}
                variants={slideRight}
                className="flex items-center gap-4 rounded-2xl border border-brown-light/20 bg-cream p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brown-light/20 bg-brown/10 text-brown">
                  {item.icon}
                </div>
                <div>
                  <p className="mb-0.5 text-xs text-text-muted">{item.label}</p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-sm font-medium text-text-main transition-colors hover:text-brown"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-text-main">
                      {item.value}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.form
            ref={formRef}
            variants={slideLeft}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-brown-light/20 bg-cream p-5 sm:p-6"
          >
            {/*
              Field names MUST match the EmailJS template variables:
              name="from_name", name="from_email", name="message"
            */}
            <input
              type="text"
              name="from_name"
              required
              placeholder={c.namePlaceholder}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-brown-light/20 bg-cream-dark px-4 py-3 text-sm text-text-main outline-none transition-colors focus:border-brown placeholder:text-text-muted/60"
            />
            <input
              type="email"
              name="from_email"
              required
              placeholder={c.emailPlaceholder}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-brown-light/20 bg-cream-dark px-4 py-3 text-sm text-text-main outline-none transition-colors focus:border-brown placeholder:text-text-muted/60"
            />
            <textarea
              name="message"
              required
              rows={5}
              placeholder={c.messagePlaceholder}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full resize-none rounded-xl border border-brown-light/20 bg-cream-dark px-4 py-3 text-sm text-text-main outline-none transition-colors focus:border-brown placeholder:text-text-muted/60"
            />

            {/* Success message */}
            {status === "sent" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
                style={{ color: "#16a34a", backgroundColor: "#f0fdf4" }}
              >
                <CheckCircle size={16} className="mt-0.5 shrink-0" />
                {c.successMsg}
              </motion.div>
            )}

            {/* Error message */}
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
                style={{ color: "#dc2626", backgroundColor: "#fef2f2" }}
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>
                  {c.errorMsg}{" "}
                  <a
                    href="mailto:irmairyani@gmail.com"
                    className="underline font-medium"
                  >
                    irmairyani@gmail.com
                  </a>
                </span>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={status === "sending" || status === "sent"}
              whileHover={{ scale: status === "idle" ? 1.02 : 1 }}
              whileTap={{ scale: status === "idle" ? 0.98 : 1 }}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brown py-3 text-sm font-semibold text-white disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === "sending" ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      ease: "linear",
                    }}
                    className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                  />
                  {c.sending}
                </>
              ) : status === "sent" ? (
                <>
                  <CheckCircle size={16} />
                  {c.sent}
                </>
              ) : (
                <>
                  <Send size={15} />
                  {c.send}
                </>
              )}
            </motion.button>

            {/* Retry button after error */}
            {status === "error" && (
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="w-full rounded-xl border border-brown-light/30 py-2.5 text-sm font-medium text-text-muted transition-colors hover:text-brown cursor-pointer"
              >
                {language === "id" ? "Coba Lagi" : "Try Again"}
              </button>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
}
