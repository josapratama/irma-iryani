"use client";

import React, { useState, useEffect } from "react";
import { X, GraduationCap, Save } from "lucide-react";
import type { EducationItem } from "@/lib/api";

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<EducationItem>) => Promise<void>;
  initialData: Partial<EducationItem> | null;
  isLoading: boolean;
}

export default function EducationModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isLoading,
}: EducationModalProps) {
  const [lang, setLang] = useState<"id" | "en">("id");
  const [degree, setDegree] = useState({ id: "", en: "" });
  const [university, setUniversity] = useState({ id: "", en: "" });
  const [period, setPeriod] = useState({ id: "", en: "" });
  const [gpa, setGpa] = useState("");
  const [description, setDescription] = useState({ id: "", en: "" });
  const [order, setOrder] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (initialData) {
      setDegree({
        id: initialData.degree?.id || "",
        en: initialData.degree?.en || "",
      });
      setUniversity({
        id: initialData.university?.id || "",
        en: initialData.university?.en || "",
      });
      setPeriod({
        id: initialData.period?.id || "",
        en: initialData.period?.en || "",
      });
      setGpa(initialData.gpa || "");
      setDescription({
        id: initialData.description?.id || "",
        en: initialData.description?.en || "",
      });
      setOrder(initialData.order ?? 0);
      setIsVisible(initialData.isVisible ?? true);
    } else {
      setDegree({ id: "", en: "" });
      setUniversity({ id: "", en: "" });
      setPeriod({ id: "", en: "" });
      setGpa("");
      setDescription({ id: "", en: "" });
      setOrder(0);
      setIsVisible(true);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!degree.id.trim() || !university.id.trim() || !period.id.trim()) {
      alert("Gelar, Universitas, dan Periode wajib diisi.");
      return;
    }

    await onSave({
      ...(initialData?._id ? { _id: initialData._id } : {}),
      degree: {
        id: degree.id.trim(),
        en: degree.en.trim() || degree.id.trim(),
      },
      university: {
        id: university.id.trim(),
        en: university.en.trim() || university.id.trim(),
      },
      period: {
        id: period.id.trim(),
        en: period.en.trim() || period.id.trim(),
      },
      gpa: gpa.trim() || undefined,
      description:
        description.id.trim() || description.en.trim()
          ? {
              id: description.id.trim(),
              en: description.en.trim() || description.id.trim(),
            }
          : undefined,
      order: Number(order) || 0,
      isVisible,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-brown-light)]/20 bg-[var(--color-cream-dark)]/40">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[var(--color-brown)]" />
            <h3 className="text-sm sm:text-base font-bold text-[var(--color-text-main)]">
              {initialData?._id ? "Edit Riwayat Pendidikan" : "Tambah Riwayat Pendidikan"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--color-brown-light)]/20 text-[var(--color-text-muted)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Language Switch */}
          <div className="flex items-center justify-between bg-[var(--color-cream-dark)]/30 p-2 rounded-xl border border-[var(--color-brown-light)]/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] px-2">
              Bahasa Input:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setLang("id")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === "id"
                    ? "bg-[var(--color-brown)] text-white shadow-sm"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                }`}
              >
                🇮🇩 Indonesia
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === "en"
                    ? "bg-[var(--color-brown)] text-white shadow-sm"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          {/* Degree */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
              Gelar / Program Studi ({lang.toUpperCase()}) *
            </label>
            <input
              type="text"
              required
              value={degree[lang]}
              onChange={(e) => setDegree((p) => ({ ...p, [lang]: e.target.value }))}
              placeholder={
                lang === "id"
                  ? "Misal: Sarjana Ilmu Komunikasi (S.I.Kom)"
                  : "e.g. Bachelor of Communication Science"
              }
              className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/30 focus:border-[var(--color-brown)] outline-none text-xs"
            />
          </div>

          {/* University */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
              Universitas / Institusi ({lang.toUpperCase()}) *
            </label>
            <input
              type="text"
              required
              value={university[lang]}
              onChange={(e) => setUniversity((p) => ({ ...p, [lang]: e.target.value }))}
              placeholder={
                lang === "id"
                  ? "Misal: Universitas Pembangunan Nasional Veteran Jakarta"
                  : "e.g. UPN Veteran Jakarta"
              }
              className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/30 focus:border-[var(--color-brown)] outline-none text-xs"
            />
          </div>

          {/* Period */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
              Periode Studi ({lang.toUpperCase()}) *
            </label>
            <input
              type="text"
              required
              value={period[lang]}
              onChange={(e) => setPeriod((p) => ({ ...p, [lang]: e.target.value }))}
              placeholder={lang === "id" ? "Misal: 2021 – 2025" : "e.g. 2021 – 2025"}
              className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/30 focus:border-[var(--color-brown)] outline-none text-xs"
            />
          </div>

          {/* GPA & Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
                IPK / Nilai Kelulusan (opsional)
              </label>
              <input
                type="text"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                placeholder="Misal: 3.86 / 4.00"
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/30 focus:border-[var(--color-brown)] outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
                Urutan Tampil (Order)
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/30 focus:border-[var(--color-brown)] outline-none text-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
              Deskripsi / Catatan Prestasi ({lang.toUpperCase()})
            </label>
            <textarea
              rows={3}
              value={description[lang]}
              onChange={(e) => setDescription((p) => ({ ...p, [lang]: e.target.value }))}
              placeholder={
                lang === "id"
                  ? "Misal: Lulus dengan predikat Pujian (Cumlaude), fokus pada Komunikasi Strategis & Media."
                  : "e.g. Graduated with Honors (Cumlaude), focused on Strategic Communication."
              }
              className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/30 focus:border-[var(--color-brown)] outline-none text-xs resize-y"
            />
          </div>

          {/* Visibility Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="edu-visible"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="rounded border-[var(--color-brown-light)] text-[var(--color-brown)] focus:ring-[var(--color-brown)] cursor-pointer"
            />
            <label htmlFor="edu-visible" className="text-xs font-semibold cursor-pointer">
              Tampilkan di Halaman Utama (Visible)
            </label>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-brown-light)]/20">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-[var(--color-brown-light)]/40 hover:bg-[var(--color-brown-light)]/10 text-[var(--color-text-main)] font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[var(--color-brown)] to-[var(--color-brown-dark)] text-white font-bold cursor-pointer hover:shadow-lg hover:shadow-[var(--color-brown)]/20 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? "Menyimpan..." : "Simpan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
