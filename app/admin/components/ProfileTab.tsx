"use client";

import React, { useState } from "react";
import {
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  User,
  Mail,
  Phone,
  MapPin,
  FileDown,
  Share2,
} from "lucide-react";
import type { ProfileData, CVItem, SocialLinkItem } from "@/lib/api";

interface ProfileTabProps {
  profile: ProfileData | null;
  onSave: (data: Partial<ProfileData>) => Promise<void>;
  isLoading: boolean;
}

export default function ProfileTab({ profile, onSave, isLoading }: ProfileTabProps) {
  const [form, setForm] = useState<Partial<ProfileData>>(() => profile || {});
  const [lang, setLang] = useState<"id" | "en" | "ja">("id");

  // New CV item input
  const [newCv, setNewCv] = useState<CVItem>({ label: "", url: "", description: "" });
  // New Social link input
  const [newSocial, setNewSocial] = useState<SocialLinkItem>({ name: "", url: "", label: "" });

  const handleTextChange = (
    field: "greeting" | "title" | "subtitle" | "description",
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

  const handleAddCv = () => {
    if (!newCv.label.trim() || !newCv.url.trim()) return;
    setForm((prev) => ({
      ...prev,
      cvItems: [...(prev.cvItems || []), { ...newCv }],
    }));
    setNewCv({ label: "", url: "", description: "" });
  };

  const handleRemoveCv = (index: number) => {
    setForm((prev) => ({
      ...prev,
      cvItems: (prev.cvItems || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddSocial = () => {
    if (!newSocial.name.trim() || !newSocial.url.trim()) return;
    setForm((prev) => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), { ...newSocial }],
    }));
    setNewSocial({ name: "", url: "", label: "" });
  };

  const handleRemoveSocial = (index: number) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).filter((_, i) => i !== index),
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
            Manajemen Profil & Hero Section
          </h2>
          <p className="text-[11px] sm:text-xs text-[var(--color-text-muted)] mt-0.5">
            Ubah identitas utama, foto profil, deskripsi hero, kontak, link unduh CV, dan media sosial.
          </p>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-brown)] to-[var(--color-brown-dark)] text-white font-bold cursor-pointer hover:shadow-lg hover:shadow-[var(--color-brown)]/20 transition-all disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? "Menyimpan..." : "Simpan Profil"}</span>
        </button>
      </div>

      {/* Grid: Identitas & Foto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identitas Diri */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--color-brown-light)]/20 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] space-y-3.5">
          <h3 className="font-extrabold text-sm flex items-center gap-2 border-b border-[var(--color-brown-light)]/15 pb-2">
            <User className="w-4 h-4 text-[var(--color-brown)]" />
            Identitas Utama
          </h3>

          <div>
            <label className="block font-bold mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Irma Iryani"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-bold text-sm"
            />
          </div>

          {/* Photo URL with Live Avatar Preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-brown-light)]/20 bg-[var(--color-cream-dark)]/25">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-[var(--color-brown-light)]/40 bg-[var(--color-cream-dark)] shrink-0 flex items-center justify-center shadow-xs">
              {form.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.photoUrl}
                  alt={form.name || "Foto"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <User className="w-5 h-5 text-[var(--color-brown)] opacity-50" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <label className="block font-bold mb-1 text-[11px]">Path / URL Foto Profil</label>
              <input
                type="text"
                value={form.photoUrl || ""}
                onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                placeholder="/profile.jpg atau URL gambar"
                className="w-full px-3 py-1.5 rounded-lg border border-[var(--color-brown-light)]/30 bg-[var(--color-bg-primary)] outline-none focus:border-[var(--color-brown)] font-medium text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block font-bold mb-1 text-[11px]">Nilai IPK</label>
              <input
                type="text"
                value={form.gpa || ""}
                onChange={(e) => setForm({ ...form, gpa: e.target.value })}
                placeholder="3,90"
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-[11px]">Badge Gelar</label>
              <input
                type="text"
                value={form.degreeBadge || ""}
                onChange={(e) => setForm({ ...form, degreeBadge: e.target.value })}
                placeholder="S1 Kim. Pendidikan"
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
              />
            </div>
            <div>
              <label className="block font-bold mb-1 text-[11px]">Badge Kampus</label>
              <input
                type="text"
                value={form.universityBadge || ""}
                onChange={(e) => setForm({ ...form, universityBadge: e.target.value })}
                placeholder="Universitas Sriwijaya"
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
              />
            </div>
          </div>
        </div>

        {/* Informasi Kontak */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--color-brown-light)]/20 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] space-y-3.5">
          <h3 className="font-extrabold text-sm flex items-center gap-2 border-b border-[var(--color-brown-light)]/15 pb-2">
            <Mail className="w-4 h-4 text-[var(--color-brown)]" />
            Informasi Kontak
          </h3>

          <div>
            <label className="block font-bold mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[var(--color-brown)]" /> Email Utama
            </label>
            <input
              type="email"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="irmairyani698@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[var(--color-brown)]" /> Nomor Telepon / WhatsApp
            </label>
            <input
              type="text"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0887437204107"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[var(--color-brown)]" /> Domisili / Lokasi
            </label>
            <input
              type="text"
              value={form.location || ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Prabumulih, Sumatera Selatan"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
            />
          </div>
        </div>
      </div>

      {/* Multilingual Text Section */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--color-brown-light)]/20 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--color-brown-light)]/15 pb-2">
          <h3 className="font-extrabold text-sm">
            Teks Hero (Multi-Bahasa)
          </h3>
          <div className="flex items-center gap-1.5 bg-[var(--color-cream-dark)]/40 p-1 rounded-xl">
            {(["id", "en", "ja"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  lang === l
                    ? "bg-[var(--color-brown)] text-white shadow-xs"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                }`}
              >
                {l === "id" ? "🇮🇩 ID" : l === "en" ? "🇬🇧 EN" : "🇯🇵 JA"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block font-bold mb-1">
              Teks Salam ({lang.toUpperCase()})
            </label>
            <input
              type="text"
              value={form.greeting?.[lang] || ""}
              onChange={(e) => handleTextChange("greeting", e.target.value)}
              placeholder={lang === "id" ? "Halo, saya" : lang === "en" ? "Hello, I'm" : "こんにちは、"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">
              Judul Profesi ({lang.toUpperCase()})
            </label>
            <input
              type="text"
              value={form.title?.[lang] || ""}
              onChange={(e) => handleTextChange("title", e.target.value)}
              placeholder={lang === "id" ? "Lulusan S1 Pendidikan Kimia" : lang === "en" ? "Chemistry Education Graduate" : "化学教育学士"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold mb-1">
            Subjudul / Tagline ({lang.toUpperCase()})
          </label>
          <input
            type="text"
            value={form.subtitle?.[lang] || ""}
            onChange={(e) => handleTextChange("subtitle", e.target.value)}
            placeholder="Analitis · Terstruktur · Berorientasi Solusi"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
          />
        </div>

        <div>
          <label className="block font-bold mb-1">
            Deskripsi Singkat Hero ({lang.toUpperCase()})
          </label>
          <textarea
            rows={3}
            value={form.description?.[lang] || ""}
            onChange={(e) => handleTextChange("description", e.target.value)}
            placeholder="Ringkasan profil yang tampil di bagian paling atas..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium resize-y"
          />
        </div>
      </div>

      {/* CV Download Items */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--color-brown-light)]/20 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] space-y-4">
        <h3 className="font-extrabold text-sm flex items-center gap-2 border-b border-[var(--color-brown-light)]/15 pb-2">
          <FileDown className="w-4 h-4 text-[var(--color-brown)]" />
          Daftar File Unduh CV
        </h3>

        {/* Existing CV Items */}
        <div className="space-y-2">
          {(form.cvItems || []).map((cv, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[var(--color-brown-light)]/20 bg-[var(--color-cream-dark)]/30"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-[var(--color-text-main)] truncate">{cv.label}</p>
                <p className="text-[11px] text-[var(--color-text-muted)] truncate">{cv.url} {cv.description && `· ${cv.description}`}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveCv(idx)}
                className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                title="Hapus CV"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(!form.cvItems || form.cvItems.length === 0) && (
            <p className="text-center py-3 text-[var(--color-text-muted)] italic">
              Belum ada link CV khusus. Sistem akan memakai CV default.
            </p>
          )}
        </div>

        {/* Add new CV Item form */}
        <div className="pt-2 border-t border-[var(--color-brown-light)]/15 grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
          <div>
            <label className="block font-bold mb-1">Nama CV</label>
            <input
              type="text"
              value={newCv.label}
              onChange={(e) => setNewCv({ ...newCv, label: e.target.value })}
              placeholder="mis: CV Asisten Statistisi"
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">URL / Path PDF</label>
            <input
              type="text"
              value={newCv.url}
              onChange={(e) => setNewCv({ ...newCv, url: e.target.value })}
              placeholder="/curriculum-vitae/asisten-statistisi.pdf"
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCv.description || ""}
              onChange={(e) => setNewCv({ ...newCv, description: e.target.value })}
              placeholder="Keterangan singkat"
              className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none"
            />
            <button
              type="button"
              onClick={handleAddCv}
              className="px-3 py-2 rounded-xl bg-[var(--color-brown)] text-white font-bold flex items-center gap-1 cursor-pointer hover:bg-[var(--color-brown-dark)]"
            >
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[var(--color-brown-light)]/20 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] space-y-4">
        <h3 className="font-extrabold text-sm flex items-center gap-2 border-b border-[var(--color-brown-light)]/15 pb-2">
          <Share2 className="w-4 h-4 text-[var(--color-brown)]" />
          Link Media Sosial
        </h3>

        {/* Existing Social links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {(form.socialLinks || []).map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-[var(--color-brown-light)]/20 bg-[var(--color-cream-dark)]/30"
            >
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs text-[var(--color-text-main)]">{s.name}: </span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[var(--color-brown)] hover:underline inline-flex items-center gap-1 truncate"
                >
                  {s.url} <ExternalLink className="w-3 h-3 inline shrink-0" />
                </a>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSocial(idx)}
                className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                title="Hapus media sosial"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add new Social link form */}
        <div className="pt-2 border-t border-[var(--color-brown-light)]/15 grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
          <div>
            <label className="block font-bold mb-1">Platform (mis: LinkedIn, Instagram, TikTok, dll)</label>
            <input
              type="text"
              value={newSocial.name}
              onChange={(e) => setNewSocial({ ...newSocial, name: e.target.value })}
              placeholder="Instagram"
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none"
            />
          </div>
          <div>
            <label className="block font-bold mb-1">URL Profil</label>
            <input
              type="text"
              value={newSocial.url}
              onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
              placeholder="https://instagram.com/username"
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSocial.label || ""}
              onChange={(e) => setNewSocial({ ...newSocial, label: e.target.value })}
              placeholder="Label tampilan (opsional)"
              className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none"
            />
            <button
              type="button"
              onClick={handleAddSocial}
              className="px-3 py-2 rounded-xl bg-[var(--color-brown)] text-white font-bold flex items-center gap-1 cursor-pointer hover:bg-[var(--color-brown-dark)]"
            >
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
