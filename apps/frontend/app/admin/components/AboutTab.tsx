"use client";

import React, { useState } from "react";
import {
  Save,
  Plus,
  Trash2,
  Sparkles,
  Tag,
  Award,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import type { ProfileData, AboutHighlight } from "@/lib/api";

interface AboutTabProps {
  profile: ProfileData | null;
  onSave: (data: Partial<ProfileData>) => Promise<void>;
  isLoading: boolean;
}

export default function AboutTab({ profile, onSave, isLoading }: AboutTabProps) {
  const [form, setForm] = useState<Partial<ProfileData>>(() => profile || {});
  const [lang, setLang] = useState<"id" | "en" | "ja">("id");

  // State for new highlight item
  const [newHighlight, setNewHighlight] = useState<{
    label: { id: string; en: string; ja: string };
    value: string;
  }>({
    label: { id: "", en: "", ja: "" },
    value: "",
  });

  // State for new trait item
  const [newTrait, setNewTrait] = useState<{ id: string; en: string; ja: string }>({
    id: "",
    en: "",
    ja: "",
  });

  const handleTextChange = (
    field: "aboutTag" | "aboutTitle" | "aboutBio" | "contactSubtitle" | "footerText",
    val: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || { id: "", en: "", ja: "" }),
        [lang]: val,
      },
    }));
  };

  const handleAddHighlight = () => {
    if (!newHighlight.label.id.trim() || !newHighlight.value.trim()) return;
    const item: AboutHighlight = {
      label: {
        id: newHighlight.label.id.trim(),
        en: newHighlight.label.en.trim() || newHighlight.label.id.trim(),
        ja: newHighlight.label.ja?.trim() || "",
      },
      value: newHighlight.value.trim(),
    };
    setForm((prev) => ({
      ...prev,
      aboutHighlights: [...(prev.aboutHighlights || []), item],
    }));
    setNewHighlight({
      label: { id: "", en: "", ja: "" },
      value: "",
    });
  };

  const handleRemoveHighlight = (index: number) => {
    setForm((prev) => ({
      ...prev,
      aboutHighlights: (prev.aboutHighlights || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddTrait = () => {
    if (!newTrait.id.trim()) return;
    const item = {
      id: newTrait.id.trim(),
      en: newTrait.en.trim() || newTrait.id.trim(),
      ja: newTrait.ja?.trim() || "",
    };
    setForm((prev) => ({
      ...prev,
      aboutTraits: [...(prev.aboutTraits || []), item],
    }));
    setNewTrait({ id: "", en: "", ja: "" });
  };

  const handleRemoveTrait = (index: number) => {
    setForm((prev) => ({
      ...prev,
      aboutTraits: (prev.aboutTraits || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-xs">
      {/* Header card with action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-cream-dark)]/40 p-4 sm:p-5 rounded-2xl border border-[var(--color-brown-light)]/20">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--color-brown)]" />
            Manajemen Konten Tentang Saya & Footer
          </h2>
          <p className="text-[11px] sm:text-xs text-[var(--color-text-muted)] mt-0.5">
            Ubah deskripsi bio naratif, badge sorotan (IPK, angkatan, dsb), karakter/traits personal, subjudul kontak, dan teks footer.
          </p>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-brown)] to-[var(--color-brown-dark)] text-white font-bold cursor-pointer hover:shadow-lg hover:shadow-[var(--color-brown)]/20 transition-all disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? "Menyimpan..." : "Simpan Perubahan"}</span>
        </button>
      </div>

      {/* Language switcher */}
      <div className="flex items-center justify-between gap-2 bg-[var(--color-cream-dark)]/30 p-2.5 rounded-xl border border-[var(--color-brown-light)]/20">
        <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-2">
          Bahasa yang diedit saat ini:
        </span>
        <div className="flex items-center gap-1">
          {(["id", "en", "ja"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                lang === l
                  ? "bg-[var(--color-brown)] text-white shadow-sm"
                  : "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
              }`}
            >
              {l === "id" ? "🇮🇩 ID (Indonesia)" : l === "en" ? "🇬🇧 EN (English)" : "🇯🇵 JA (日本語)"}
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: Tagline & Headings */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-cream-dark)]/20 border border-[var(--color-brown-light)]/20 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2 text-[var(--color-text-main)] border-b border-[var(--color-brown-light)]/20 pb-2">
          <Tag className="w-4 h-4 text-[var(--color-brown)]" />
          Tagline & Judul Section Tentang Saya
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
              Badge Tagline ({lang.toUpperCase()})
            </label>
            <input
              type="text"
              value={form.aboutTag?.[lang] || ""}
              onChange={(e) => handleTextChange("aboutTag", e.target.value)}
              placeholder="Contoh: Tentang Saya / About Me"
              className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/30 focus:border-[var(--color-brown)] outline-none text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
              Judul Utama ({lang.toUpperCase()})
            </label>
            <input
              type="text"
              value={form.aboutTitle?.[lang] || ""}
              onChange={(e) => handleTextChange("aboutTitle", e.target.value)}
              placeholder="Contoh: Dedikasi untuk Keunggulan & Profesionalisme"
              className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/30 focus:border-[var(--color-brown)] outline-none text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
            Bio Naratif Lengkap ({lang.toUpperCase()})
          </label>
          <textarea
            rows={5}
            value={form.aboutBio?.[lang] || ""}
            onChange={(e) => handleTextChange("aboutBio", e.target.value)}
            placeholder="Tuliskan latar belakang, dedikasi, minat profesional, atau cerita perjalanan karier..."
            className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/30 focus:border-[var(--color-brown)] outline-none text-xs resize-y"
          />
        </div>
      </div>

      {/* Section 2: Highlights / Sorotan (IPK, Universitas, Jurusan, dll) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-cream-dark)]/20 border border-[var(--color-brown-light)]/20 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2 text-[var(--color-text-main)] border-b border-[var(--color-brown-light)]/20 pb-2">
          <Award className="w-4 h-4 text-[var(--color-brown)]" />
          Kartu Sorotan Kunci (Highlights)
        </h3>
        <p className="text-[11px] text-[var(--color-text-muted)]">
          Kartu mini di samping narasi (contoh: Indeks Prestasi Kumulatif, Universitas, Jurusan, Status Kelulusan).
        </p>

        {/* Existing Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(form.aboutHighlights || []).map((hl, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/30"
            >
              <div className="min-w-0 pr-2">
                <div className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">
                  {hl.label[lang] || hl.label.id}
                </div>
                <div className="text-xs font-extrabold text-[var(--color-text-main)] truncate mt-0.5">
                  {hl.value}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveHighlight(idx)}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {(!form.aboutHighlights || form.aboutHighlights.length === 0) && (
            <div className="sm:col-span-2 text-center py-4 text-[var(--color-text-muted)] text-[11px]">
              Belum ada kartu sorotan. Tambahkan di bawah.
            </div>
          )}
        </div>

        {/* Add Highlight */}
        <div className="p-3 rounded-xl bg-[var(--color-bg-primary)]/60 border border-dashed border-[var(--color-brown-light)]/40 space-y-2">
          <div className="text-[11px] font-bold text-[var(--color-text-main)]">Tambah Kartu Sorotan Baru:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-[var(--color-text-muted)] mb-0.5">Label (ID)</label>
              <input
                type="text"
                placeholder="Misal: IPK / Universitas"
                value={newHighlight.label.id}
                onChange={(e) =>
                  setNewHighlight((p) => ({ ...p, label: { ...p.label, id: e.target.value } }))
                }
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/30 outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--color-text-muted)] mb-0.5">Label (EN - opsional)</label>
              <input
                type="text"
                placeholder="Misal: GPA / University"
                value={newHighlight.label.en}
                onChange={(e) =>
                  setNewHighlight((p) => ({ ...p, label: { ...p.label, en: e.target.value } }))
                }
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/30 outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--color-text-muted)] mb-0.5">Nilai / Value</label>
              <input
                type="text"
                placeholder="Misal: 3.86 / UPNVJ"
                value={newHighlight.value}
                onChange={(e) =>
                  setNewHighlight((p) => ({ ...p, value: e.target.value }))
                }
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/30 outline-none text-xs"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddHighlight}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-brown)] text-white font-bold cursor-pointer hover:bg-[var(--color-brown-dark)] transition-colors mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Sorotan</span>
          </button>
        </div>
      </div>

      {/* Section 3: Traits / Karakteristik Personal */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-cream-dark)]/20 border border-[var(--color-brown-light)]/20 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2 text-[var(--color-text-main)] border-b border-[var(--color-brown-light)]/20 pb-2">
          <ShieldCheck className="w-4 h-4 text-[var(--color-brown)]" />
          Karakter & Nilai Personal (Personal Traits)
        </h3>
        <p className="text-[11px] text-[var(--color-text-muted)]">
          Pills/tags seperti: Detail-Oriented, Adaptable, Problem Solver, Team Player, Analytical Thinking.
        </p>

        <div className="flex flex-wrap gap-2">
          {(form.aboutTraits || []).map((trait, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/40 text-xs font-semibold text-[var(--color-text-main)] shadow-sm"
            >
              <span>{trait[lang] || trait.id}</span>
              <button
                type="button"
                onClick={() => handleRemoveTrait(idx)}
                className="text-rose-500 hover:text-rose-700 cursor-pointer ml-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
          {(!form.aboutTraits || form.aboutTraits.length === 0) && (
            <div className="text-[var(--color-text-muted)] text-[11px]">Belum ada traits.</div>
          )}
        </div>

        {/* Add Trait */}
        <div className="p-3 rounded-xl bg-[var(--color-bg-primary)]/60 border border-dashed border-[var(--color-brown-light)]/40 space-y-2">
          <div className="text-[11px] font-bold text-[var(--color-text-main)]">Tambah Nilai/Karakter Baru:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-[var(--color-text-muted)] mb-0.5">Nama Trait (ID)</label>
              <input
                type="text"
                placeholder="Misal: Berorientasi pada Detail"
                value={newTrait.id}
                onChange={(e) => setNewTrait((p) => ({ ...p, id: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/30 outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[var(--color-text-muted)] mb-0.5">Nama Trait (EN)</label>
              <input
                type="text"
                placeholder="Misal: Detail-Oriented"
                value={newTrait.en}
                onChange={(e) => setNewTrait((p) => ({ ...p, en: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/30 outline-none text-xs"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddTrait}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-brown)] text-white font-bold cursor-pointer hover:bg-[var(--color-brown-dark)] transition-colors mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Trait</span>
          </button>
        </div>
      </div>

      {/* Section 4: Contact Subtitle & Footer Text */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--color-cream-dark)]/20 border border-[var(--color-brown-light)]/20 space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2 text-[var(--color-text-main)] border-b border-[var(--color-brown-light)]/20 pb-2">
          <MessageSquare className="w-4 h-4 text-[var(--color-brown)]" />
          Subjudul Kontak & Teks Footer
        </h3>

        <div>
          <label className="block text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
            Subjudul Bagian Kontak ({lang.toUpperCase()})
          </label>
          <input
            type="text"
            value={form.contactSubtitle?.[lang] || ""}
            onChange={(e) => handleTextChange("contactSubtitle", e.target.value)}
            placeholder="Contoh: Silakan tinggalkan pesan atau hubungi langsung melalui kontak berikut."
            className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/30 focus:border-[var(--color-brown)] outline-none text-xs"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[var(--color-text-muted)] mb-1">
            Teks Hak Cipta / Footer ({lang.toUpperCase()})
          </label>
          <input
            type="text"
            value={form.footerText?.[lang] || ""}
            onChange={(e) => handleTextChange("footerText", e.target.value)}
            placeholder="Contoh: Irma Iryani. Hak Cipta Dilindungi Undang-Undang."
            className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-brown-light)]/30 focus:border-[var(--color-brown)] outline-none text-xs"
          />
        </div>
      </div>

      {/* Save button sticky/footer */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-brown)] to-[var(--color-brown-dark)] text-white font-bold cursor-pointer hover:shadow-lg hover:shadow-[var(--color-brown)]/20 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? "Menyimpan..." : "Simpan Perubahan"}</span>
        </button>
      </div>
    </form>
  );
}
