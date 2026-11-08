"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Calendar,
  Building,
  Award,
} from "lucide-react";
import type { EducationItem } from "@/lib/api";

interface EducationsTabProps {
  educations: EducationItem[];
  onOpenCreate: () => void;
  onOpenEdit: (item: EducationItem) => void;
  onDelete: (id: string) => Promise<void>;
  onToggleVisibility: (item: EducationItem) => Promise<void>;
  isLoading: boolean;
}

export default function EducationsTab({
  educations,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  onToggleVisibility,
  isLoading,
}: EducationsTabProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus riwayat pendidikan ini?")) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--color-cream-dark)]/40 p-4 sm:p-5 rounded-2xl border border-[var(--color-brown-light)]/20">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[var(--color-brown)]" />
            Manajemen Riwayat Pendidikan ({educations.length})
          </h2>
          <p className="text-[11px] sm:text-xs text-[var(--color-text-muted)] mt-0.5">
            Kelola daftar latar belakang akademis, gelar, institusi, periode, dan prestasi.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-brown)] to-[var(--color-brown-dark)] text-white font-bold cursor-pointer hover:shadow-lg hover:shadow-[var(--color-brown)]/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pendidikan</span>
        </button>
      </div>

      {/* Educations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {educations.map((edu) => (
          <div
            key={edu._id}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              edu.isVisible
                ? "bg-[var(--color-cream-dark)]/25 border-[var(--color-brown-light)]/30 hover:border-[var(--color-brown)]/50"
                : "bg-gray-500/5 border-dashed border-gray-400/30 opacity-75"
            }`}
          >
            <div>
              {/* Top metadata */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    edu.isVisible
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : "bg-gray-500/10 text-gray-500 border border-gray-400/20"
                  }`}
                >
                  {edu.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {edu.isVisible ? "Tampil" : "Tersembunyi"}
                </span>

                {edu.gpa && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-brown)]/10 text-[var(--color-brown)] border border-[var(--color-brown)]/20">
                    <Award className="w-3 h-3" />
                    IPK: {edu.gpa}
                  </span>
                )}
              </div>

              {/* Title & University */}
              <h4 className="text-sm font-extrabold text-[var(--color-text-main)] leading-snug">
                {edu.degree.id}
              </h4>
              {edu.degree.en && edu.degree.en !== edu.degree.id && (
                <div className="text-[11px] text-[var(--color-text-muted)] italic">
                  {edu.degree.en}
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brown)] mt-1.5">
                <Building className="w-3.5 h-3.5 shrink-0" />
                <span>{edu.university.id}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] mt-1">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>{edu.period.id}</span>
              </div>

              {edu.description?.id && (
                <p className="text-[11px] text-[var(--color-text-muted)] mt-3 line-clamp-3 leading-relaxed border-t border-[var(--color-brown-light)]/20 pt-2">
                  {edu.description.id}
                </p>
              )}
            </div>

            {/* Actions footer */}
            <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-[var(--color-brown-light)]/20">
              <button
                type="button"
                onClick={() => onToggleVisibility(edu)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-brown-light)]/20 cursor-pointer transition-colors"
                title={edu.isVisible ? "Sembunyikan" : "Tampilkan"}
              >
                {edu.isVisible ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Sembunyikan</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Tampilkan</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onOpenEdit(edu)}
                  className="p-1.5 rounded-lg text-[var(--color-brown)] hover:bg-[var(--color-brown)]/10 cursor-pointer transition-colors"
                  title="Edit Pendidikan"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={deletingId === edu._id}
                  onClick={() => handleDelete(edu._id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors disabled:opacity-50"
                  title="Hapus Pendidikan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {educations.length === 0 && (
          <div className="md:col-span-2 text-center py-12 bg-[var(--color-cream-dark)]/20 rounded-2xl border border-dashed border-[var(--color-brown-light)]/40">
            <GraduationCap className="w-8 h-8 text-[var(--color-text-muted)] mx-auto mb-2 opacity-50" />
            <div className="text-xs font-bold text-[var(--color-text-main)]">
              Belum ada data pendidikan
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
              Klik &quot;Tambah Pendidikan&quot; untuk menambahkan riwayat studi Anda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
