"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Globe, Menu, X } from "lucide-react";
import { useThemeLanguage } from "@/context/ThemeLanguageContext";

const navItems = {
  id: [
    { label: "Beranda", href: "hero" },
    { label: "Tentang", href: "about" },
    { label: "Pendidikan", href: "education" },
    { label: "Pengalaman", href: "experience" },
    { label: "Keahlian", href: "skills" },
    { label: "Sertifikat", href: "certificates" },
    { label: "Kontak", href: "contact" },
  ],
  en: [
    { label: "Home", href: "hero" },
    { label: "About", href: "about" },
    { label: "Education", href: "education" },
    { label: "Experience", href: "experience" },
    { label: "Skills", href: "skills" },
    { label: "Certificates", href: "certificates" },
    { label: "Contact", href: "contact" },
  ],
};

export default function Navbar() {
  const { theme, language, toggleTheme, toggleLanguage } = useThemeLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = [
        "contact",
        "certificates",
        "skills",
        "experience",
        "education",
        "about",
        "hero",
      ];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll handler — works reliably on all mobile browsers including iOS Safari
  const scrollTo = useCallback((id: string) => {
    // Close menu first, then scroll after a short delay
    // so the menu animation doesn't interfere with scrolling
    setMenuOpen(false);

    setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;

      const navHeight = 72; // approximate navbar height in px
      const top = el.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top, behavior: "smooth" });
    }, 50);
  }, []);

  const items = navItems[language];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:px-6"
      style={{ backdropFilter: "blur(12px)" }}
    >
      <div
        className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-all duration-300 sm:px-5 md:py-3.5"
        style={{
          backgroundColor: scrolled
            ? "color-mix(in srgb, var(--color-cream) 92%, transparent)"
            : "color-mix(in srgb, var(--color-cream) 72%, transparent)",
          borderColor: scrolled
            ? "color-mix(in srgb, var(--color-brown-light) 22%, transparent)"
            : "color-mix(in srgb, var(--color-brown-light) 10%, transparent)",
          boxShadow: scrolled
            ? "0 8px 32px rgba(0,0,0,0.14)"
            : "0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo — nama lengkap */}
        <button
          onClick={() => scrollTo("hero")}
          className="shrink-0 cursor-pointer font-bold tracking-tight text-brown transition-opacity hover:opacity-80 text-sm sm:text-base"
        >
          Irma Iryani
          <span className="font-normal text-text-muted">.</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden items-center gap-0.5 rounded-full border border-brown-light/10 bg-cream-dark/30 px-2 py-1.5 md:flex lg:gap-1 lg:px-3">
          {items.map((item) => {
            const isActive = activeSection === item.href;
            return (
              <button
                key={item.href}
                onClick={() => scrollTo(item.href)}
                className={`relative cursor-pointer rounded-full px-2.5 py-1.5 text-xs font-medium transition-all duration-200 lg:px-3 lg:text-sm ${
                  isActive
                    ? "font-semibold text-brown"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute -bottom-0.5 left-2.5 right-2.5 h-0.5 rounded-full bg-brown lg:left-3 lg:right-3"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex shrink-0 items-center gap-2">
          <motion.button
            onClick={toggleLanguage}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-brown-light/25 bg-cream-dark/35 px-3 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:text-brown"
          >
            <Globe size={12} />
            {language === "id" ? "EN" : "ID"}
          </motion.button>

          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="cursor-pointer rounded-full border border-brown-light/25 bg-cream-dark/35 p-2 text-text-muted transition-colors hover:text-brown"
          >
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </motion.button>

          {/* Hamburger — mobile only */}
          <motion.button
            onClick={() => setMenuOpen((v) => !v)}
            whileTap={{ scale: 0.94 }}
            className="cursor-pointer rounded-full border border-brown-light/25 bg-cream-dark/35 p-2 text-text-muted md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl border border-brown-light/15"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--color-cream) 96%, transparent)",
            }}
          >
            <div className="px-4 pb-3 pt-2">
              {items.map((item, i) => (
                <motion.button
                  key={item.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => scrollTo(item.href)}
                  className={`block w-full cursor-pointer border-b border-brown-light/10 py-3 text-left text-sm transition-colors last:border-0 ${
                    activeSection === item.href
                      ? "font-semibold text-brown"
                      : "text-text-muted hover:text-brown"
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
