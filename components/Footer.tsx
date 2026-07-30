"use client";

import { motion } from "framer-motion";
import { useThemeLanguage } from "@/context/ThemeLanguageContext";
import { Heart } from "lucide-react";

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export default function Footer() {
  const { language } = useThemeLanguage();
  return (
    <footer className="border-t border-brown-light/15 px-4 py-10 sm:px-6 md:py-12 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 rounded-2xl border border-brown-light/10 bg-cream-dark/30 px-5 py-5 sm:flex-row sm:px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-1.5 text-center text-sm text-text-muted sm:text-left"
        >
          {language === "id" ? (
            <>
              Dibuat dengan{" "}
              <Heart size={12} className="fill-brown text-brown" /> oleh Irma
              Iryani © 2026
            </>
          ) : (
            <>
              Crafted with <Heart size={12} className="fill-brown text-brown" />{" "}
              by Irma Iryani © 2026
            </>
          )}
        </motion.p>
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="cursor-pointer text-xs font-medium text-text-muted transition-colors hover:text-brown"
        >
          ↑ {language === "id" ? "Kembali ke atas" : "Back to top"}
        </motion.button>
      </div>
    </footer>
  );
}
