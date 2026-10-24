"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  Briefcase,
  Building2,
  Cpu,
  FileText,
  Mail,
  Eye,
  EyeOff,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  ExternalLink,
  KeyRound,
  RefreshCw,
  Search,
  CheckCircle2,
  X,
  Loader2,
  Check,
  ChevronRight,
  Inbox,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import {
  api,
  getAuthToken,
  clearAuthToken,
  getAuthEmail,
  type Certificate,
  type Project,
  type Experience,
  type SkillGroup,
  type RecommendationLetter,
  type ContactMessage,
  type ContactStats,
} from "@/lib/api";

type TabType =
  | "certificates"
  | "projects"
  | "experiences"
  | "skills"
  | "letters"
  | "contacts";

export default function AdminDashboardPage() {
  const router = useRouter();

  // Auth & Page State
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("certificates");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Data States
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<SkillGroup[]>([]);
  const [letters, setLetters] = useState<RecommendationLetter[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [contactStats, setContactStats] = useState<ContactStats | null>(null);

  // Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Generic Edit/Create Modals
  const [editingCert, setEditingCert] = useState<Partial<Certificate> | null>(null);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [editingExp, setEditingExp] = useState<Partial<Experience> | null>(null);
  const [editingSkillGroup, setEditingSkillGroup] = useState<Partial<SkillGroup> | null>(null);
  const [editingLetter, setEditingLetter] = useState<Partial<RecommendationLetter> | null>(null);
  const [viewingContact, setViewingContact] = useState<ContactMessage | null>(null);

  // New Skill Item inline input (groupId -> { name, level })
  const [newSkillItem, setNewSkillItem] = useState<{ [groupId: string]: { name: string; level: number } }>({});

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // ── Auth Verification & Data Loading ──────────────────────────────────────
  const checkAuthAndLoad = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    try {
      const me = await api.admin.getMe();
      setAdminEmail(me.email || getAuthEmail() || "admin");
    } catch {
      clearAuthToken();
      router.replace("/admin/login");
      return;
    }

    setIsLoading(true);
    try {
      const [certsData, projsData, expsData, skillsData, lettersData, contactsData, statsData] =
        await Promise.allSettled([
          api.admin.getCertificates(),
          api.admin.getProjects(),
          api.admin.getExperiences(),
          api.admin.getSkills(),
          api.admin.getRecommendationLetters(),
          api.admin.getContacts(1, 50),
          api.admin.getContactStats(),
        ]);

      if (certsData.status === "fulfilled") setCertificates(certsData.value || []);
      if (projsData.status === "fulfilled") setProjects(projsData.value || []);
      if (expsData.status === "fulfilled") setExperiences(expsData.value || []);
      if (skillsData.status === "fulfilled") setSkills(skillsData.value || []);
      if (lettersData.status === "fulfilled") setLetters(lettersData.value || []);
      if (contactsData.status === "fulfilled") setContacts(contactsData.value.data || []);
      if (statsData.status === "fulfilled") setContactStats(statsData.value || null);
    } catch (err: unknown) {
      showFeedback("error", "Gagal memuat sebagian data dari backend.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuthAndLoad();
  }, [checkAuthAndLoad]);

  const handleLogout = () => {
    clearAuthToken();
    router.replace("/admin/login");
  };

  // ── Password Change Handler ──────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showFeedback("error", "Konfirmasi password baru tidak cocok.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showFeedback("error", "Password baru minimal 6 karakter.");
      return;
    }

    setActionLoading("password");
    try {
      await api.admin.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showFeedback("success", "Password berhasil diubah!");
      setIsPasswordModalOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      showFeedback("error", err instanceof Error ? err.message : "Gagal mengubah password.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Certificates Handlers ────────────────────────────────────────────────
  const handleToggleCertVisibility = async (cert: Certificate) => {
    const newVis = !cert.isVisible;
    try {
      await api.admin.toggleCertificateVisibility(cert._id, newVis);
      setCertificates((prev) =>
        prev.map((c) => (c._id === cert._id ? { ...c, isVisible: newVis } : c)),
      );
      showFeedback("success", `Visibilitas ${cert.title.id || cert.title.en} diperbarui.`);
    } catch {
      showFeedback("error", "Gagal memperbarui visibilitas.");
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm("Hapus sertifikat ini secara permanen?")) return;
    try {
      await api.admin.deleteCertificate(id);
      setCertificates((prev) => prev.filter((c) => c._id !== id));
      showFeedback("success", "Sertifikat berhasil dihapus.");
    } catch {
      showFeedback("error", "Gagal menghapus sertifikat.");
    }
  };

  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;

    setActionLoading("saveCert");
    try {
      if (editingCert._id) {
        const updated = await api.admin.updateCertificate(editingCert._id, editingCert);
        setCertificates((prev) =>
          prev.map((c) => (c._id === editingCert._id ? updated : c)),
        );
        showFeedback("success", "Sertifikat berhasil diperbarui.");
      } else {
        const created = await api.admin.createCertificate(editingCert);
        setCertificates((prev) => [...prev, created]);
        showFeedback("success", "Sertifikat baru berhasil ditambahkan.");
      }
      setEditingCert(null);
    } catch (err: unknown) {
      showFeedback("error", err instanceof Error ? err.message : "Gagal menyimpan sertifikat.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Projects Handlers ────────────────────────────────────────────────────
  const handleToggleProjectVisibility = async (proj: Project) => {
    const newVis = !proj.isVisible;
    try {
      await api.admin.toggleProjectVisibility(proj._id, newVis);
      setProjects((prev) =>
        prev.map((p) => (p._id === proj._id ? { ...p, isVisible: newVis } : p)),
      );
      showFeedback("success", `Visibilitas proyek diperbarui.`);
    } catch {
      showFeedback("error", "Gagal memperbarui visibilitas.");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Hapus proyek ini secara permanen?")) return;
    try {
      await api.admin.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      showFeedback("success", "Proyek berhasil dihapus.");
    } catch {
      showFeedback("error", "Gagal menghapus proyek.");
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setActionLoading("saveProject");
    try {
      if (editingProject._id) {
        const updated = await api.admin.updateProject(editingProject._id, editingProject);
        setProjects((prev) =>
          prev.map((p) => (p._id === editingProject._id ? updated : p)),
        );
        showFeedback("success", "Proyek berhasil diperbarui.");
      } else {
        const created = await api.admin.createProject(editingProject);
        setProjects((prev) => [...prev, created]);
        showFeedback("success", "Proyek baru berhasil ditambahkan.");
      }
      setEditingProject(null);
    } catch (err: unknown) {
      showFeedback("error", err instanceof Error ? err.message : "Gagal menyimpan proyek.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Experiences Handlers ─────────────────────────────────────────────────
  const handleToggleExpVisibility = async (exp: Experience) => {
    const newVis = !exp.isVisible;
    try {
      await api.admin.toggleExperienceVisibility(exp._id, newVis);
      setExperiences((prev) =>
        prev.map((e) => (e._id === exp._id ? { ...e, isVisible: newVis } : e)),
      );
      showFeedback("success", `Visibilitas pengalaman diperbarui.`);
    } catch {
      showFeedback("error", "Gagal memperbarui visibilitas.");
    }
  };

  const handleDeleteExp = async (id: string) => {
    if (!confirm("Hapus pengalaman ini?")) return;
    try {
      await api.admin.deleteExperience(id);
      setExperiences((prev) => prev.filter((e) => e._id !== id));
      showFeedback("success", "Pengalaman berhasil dihapus.");
    } catch {
      showFeedback("error", "Gagal menghapus pengalaman.");
    }
  };

  const handleSaveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp) return;

    setActionLoading("saveExp");
    try {
      if (editingExp._id) {
        const updated = await api.admin.updateExperience(editingExp._id, editingExp);
        setExperiences((prev) =>
          prev.map((ex) => (ex._id === editingExp._id ? updated : ex)),
        );
        showFeedback("success", "Pengalaman berhasil diperbarui.");
      } else {
        const created = await api.admin.createExperience(editingExp);
        setExperiences((prev) => [...prev, created]);
        showFeedback("success", "Pengalaman baru berhasil ditambahkan.");
      }
      setEditingExp(null);
    } catch (err: unknown) {
      showFeedback("error", err instanceof Error ? err.message : "Gagal menyimpan pengalaman.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Skills Handlers ──────────────────────────────────────────────────────
  const handleToggleSkillVisibility = async (group: SkillGroup) => {
    const newVis = !group.isVisible;
    try {
      await api.admin.toggleSkillGroupVisibility(group._id, newVis);
      setSkills((prev) =>
        prev.map((g) => (g._id === group._id ? { ...g, isVisible: newVis } : g)),
      );
      showFeedback("success", `Visibilitas grup skill diperbarui.`);
    } catch {
      showFeedback("error", "Gagal memperbarui visibilitas.");
    }
  };

  const handleDeleteSkillGroup = async (id: string) => {
    if (!confirm("Hapus grup keahlian ini beserta seluruh isinya?")) return;
    try {
      await api.admin.deleteSkillGroup(id);
      setSkills((prev) => prev.filter((g) => g._id !== id));
      showFeedback("success", "Grup keahlian dihapus.");
    } catch {
      showFeedback("error", "Gagal menghapus grup keahlian.");
    }
  };

  const handleAddSkillItem = async (groupId: string) => {
    const input = newSkillItem[groupId];
    if (!input || !input.name.trim()) return;

    try {
      const updated = await api.admin.addSkillItem(groupId, {
        name: input.name.trim(),
        level: Number(input.level) || 80,
      });
      setSkills((prev) => prev.map((g) => (g._id === groupId ? updated : g)));
      setNewSkillItem((prev) => ({
        ...prev,
        [groupId]: { name: "", level: 80 },
      }));
      showFeedback("success", `Item ${input.name} ditambahkan.`);
    } catch {
      showFeedback("error", "Gagal menambahkan item skill.");
    }
  };

  const handleDeleteSkillItem = async (groupId: string, itemIdx: number) => {
    try {
      const updated = await api.admin.deleteSkillItem(groupId, itemIdx);
      setSkills((prev) => prev.map((g) => (g._id === groupId ? updated : g)));
      showFeedback("success", "Item skill dihapus.");
    } catch {
      showFeedback("error", "Gagal menghapus item skill.");
    }
  };

  // ── Recommendation Letters Handlers ──────────────────────────────────────
  const handleToggleLetterVisibility = async (letter: RecommendationLetter) => {
    const newVis = !letter.isVisible;
    try {
      await api.admin.toggleRecommendationLetterVisibility(letter._id, newVis);
      setLetters((prev) =>
        prev.map((l) => (l._id === letter._id ? { ...l, isVisible: newVis } : l)),
      );
      showFeedback("success", `Visibilitas surat rekomendasi diperbarui.`);
    } catch {
      showFeedback("error", "Gagal memperbarui visibilitas.");
    }
  };

  const handleDeleteLetter = async (id: string) => {
    if (!confirm("Hapus surat rekomendasi ini?")) return;
    try {
      await api.admin.deleteRecommendationLetter(id);
      setLetters((prev) => prev.filter((l) => l._id !== id));
      showFeedback("success", "Surat rekomendasi berhasil dihapus.");
    } catch {
      showFeedback("error", "Gagal menghapus surat rekomendasi.");
    }
  };

  const handleSaveLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLetter) return;

    setActionLoading("saveLetter");
    try {
      if (editingLetter._id) {
        const updated = await api.admin.updateRecommendationLetter(editingLetter._id, editingLetter);
        setLetters((prev) =>
          prev.map((l) => (l._id === editingLetter._id ? updated : l)),
        );
        showFeedback("success", "Surat rekomendasi berhasil diperbarui.");
      } else {
        const created = await api.admin.createRecommendationLetter(editingLetter);
        setLetters((prev) => [...prev, created]);
        showFeedback("success", "Surat rekomendasi baru ditambahkan.");
      }
      setEditingLetter(null);
    } catch (err: unknown) {
      showFeedback("error", err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Contacts Handlers ────────────────────────────────────────────────────
  const handleViewContact = async (contact: ContactMessage) => {
    setViewingContact(contact);
    if (contact.status === "unread") {
      try {
        await api.admin.getContactById(contact._id);
        setContacts((prev) =>
          prev.map((c) => (c._id === contact._id ? { ...c, status: "read" } : c)),
        );
        if (contactStats && contactStats.unread > 0) {
          setContactStats({
            ...contactStats,
            unread: contactStats.unread - 1,
            read: contactStats.read + 1,
          });
        }
      } catch {
        // Abaikan jika gagal update read di background
      }
    }
  };

  const handleMarkReplied = async (id: string) => {
    try {
      const updated = await api.admin.updateContactStatus(id, "replied");
      setContacts((prev) => prev.map((c) => (c._id === id ? updated : c)));
      if (viewingContact && viewingContact._id === id) {
        setViewingContact(updated);
      }
      showFeedback("success", "Status pesan ditandai telah dibalas.");
    } catch {
      showFeedback("error", "Gagal mengupdate status.");
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Hapus pesan ini secara permanen?")) return;
    try {
      await api.admin.deleteContact(id);
      setContacts((prev) => prev.filter((c) => c._id !== id));
      if (viewingContact && viewingContact._id === id) setViewingContact(null);
      showFeedback("success", "Pesan berhasil dihapus.");
    } catch {
      showFeedback("error", "Gagal menghapus pesan.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)] text-[var(--color-text-main)] flex flex-col">
      {/* ── Topbar ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[var(--color-cream-dark)]/80 dark:bg-[var(--color-cream-dark)]/40 backdrop-blur-md border-b border-[var(--color-brown-light)]/20 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-brown)] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            II
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base leading-tight">
              Irma Iryani <span className="text-[var(--color-brown)] font-normal">Dashboard</span>
            </h1>
            <p className="text-[10px] text-[var(--color-text-muted)] truncate max-w-[180px] sm:max-w-none">
              Masuk sebagai: <span className="font-medium text-[var(--color-text-main)]">{adminEmail}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 text-xs font-medium text-[var(--color-text-main)] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[var(--color-brown)]" />
            <span>Lihat Web</span>
          </Link>

          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 text-xs font-medium text-[var(--color-text-main)] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            title="Ganti Password"
          >
            <KeyRound className="w-3.5 h-3.5 text-[var(--color-brown)]" />
            <span className="hidden sm:inline">Password</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer border border-red-500/20"
            title="Keluar"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* ── Feedback Notification ───────────────────────────────────────────── */}
      {feedback && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl text-xs font-medium shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom-2 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="ml-2 hover:opacity-75 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Main Container ──────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[var(--color-brown-light)]/20 custom-scrollbar">
          {[
            { id: "certificates", label: "Sertifikat", icon: Award, count: certificates.length },
            { id: "projects", label: "Proyek", icon: Briefcase, count: projects.length },
            { id: "experiences", label: "Pengalaman", icon: Building2, count: experiences.length },
            { id: "skills", label: "Keahlian", icon: Cpu, count: skills.length },
            { id: "letters", label: "Surat Rekomendasi", icon: FileText, count: letters.length },
            {
              id: "contacts",
              label: "Pesan Masuk",
              icon: Inbox,
              badge: contactStats?.unread || 0,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setSearchQuery("");
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[var(--color-brown)] text-white shadow-sm"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-brown-light)]/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {tab.badge}
                  </span>
                ) : tab.count !== undefined ? (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? "bg-white/20 text-white" : "bg-[var(--color-brown-light)]/20 text-[var(--color-text-muted)]"
                    }`}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}

          <div className="ml-auto pl-2 flex items-center gap-2">
            <button
              onClick={checkAuthAndLoad}
              disabled={isLoading}
              className="p-2 rounded-xl border border-[var(--color-brown-light)]/30 text-[var(--color-text-muted)] hover:text-[var(--color-brown)] transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Tab Content ────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[var(--color-text-muted)]">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brown)] mb-3" />
            <p className="text-xs">Memuat data dari database...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4">
            {/* ════════════════ CERTIFICATES TAB ════════════════ */}
            {activeTab === "certificates" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-base font-bold">Manajemen Sertifikat</h2>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Kelola daftar sertifikat pelatihan, kompetensi, dan penghargaan
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setEditingCert({
                        title: { id: "", en: "" },
                        issuer: "",
                        date: "",
                        category: "Technology",
                        images: [],
                        order: certificates.length + 1,
                        isVisible: true,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--color-brown)] text-white text-xs font-semibold hover:bg-[var(--color-brown-dark)] transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Sertifikat</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certificates.map((cert) => (
                    <div
                      key={cert._id}
                      className={`rounded-2xl border p-4 flex flex-col justify-between transition-all bg-[var(--color-cream-dark)]/40 ${
                        cert.isVisible
                          ? "border-[var(--color-brown-light)]/30 shadow-xs"
                          : "border-dashed border-[var(--color-brown-light)]/20 opacity-60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--color-brown)]/15 text-[var(--color-brown)]">
                            {cert.category}
                          </span>
                          <span className="text-[10px] text-[var(--color-text-muted)]">
                            Urutan: #{cert.order}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm leading-snug text-[var(--color-text-main)]">
                          {cert.title.id || cert.title.en}
                        </h3>
                        {cert.title.en && cert.title.id !== cert.title.en && (
                          <p className="text-xs text-[var(--color-text-muted)] italic mt-0.5">
                            {cert.title.en}
                          </p>
                        )}
                        <p className="text-xs text-[var(--color-text-muted)] mt-2">
                          🏛️ {cert.issuer} • 🗓️ {cert.date}
                        </p>
                        {cert.score && (
                          <p className="text-xs text-[var(--color-brown)] font-semibold mt-1">
                            Nilai / Skor: {cert.score}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-[var(--color-brown-light)]/20 flex items-center justify-between">
                        <button
                          onClick={() => handleToggleCertVisibility(cert)}
                          className={`text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                            cert.isVisible
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                              : "bg-neutral-500/10 border-neutral-500/30 text-neutral-500"
                          }`}
                        >
                          {cert.isVisible ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Tampil</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Disembunyikan</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingCert(cert)}
                            className="p-1.5 rounded-lg border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 text-[var(--color-brown)] transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCert(cert._id)}
                            className="p-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════════════════ PROJECTS TAB ════════════════ */}
            {activeTab === "projects" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-base font-bold">Manajemen Proyek & Modul</h2>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Kelola daftar modul ajar, penelitian, dan karya pendidikan
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setEditingProject({
                        title: { id: "", en: "" },
                        description: { id: "", en: "" },
                        tags: [],
                        pdfPath: "",
                        fileName: "",
                        order: projects.length + 1,
                        isVisible: true,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--color-brown)] text-white text-xs font-semibold hover:bg-[var(--color-brown-dark)] transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Proyek</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((proj) => (
                    <div
                      key={proj._id}
                      className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all bg-[var(--color-cream-dark)]/40 ${
                        proj.isVisible
                          ? "border-[var(--color-brown-light)]/30 shadow-xs"
                          : "border-dashed border-[var(--color-brown-light)]/20 opacity-60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-[var(--color-text-muted)]">
                            Urutan: #{proj.order}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-[var(--color-text-main)]">
                          {proj.title.id || proj.title.en}
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1.5 line-clamp-3">
                          {proj.description.id || proj.description.en}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {proj.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--color-brown)]/10 text-[var(--color-brown)]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        {proj.pdfPath && (
                          <p className="text-[11px] text-[var(--color-text-muted)] mt-2.5 truncate">
                            📄 File PDF: <span className="underline">{proj.fileName || proj.pdfPath}</span>
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-[var(--color-brown-light)]/20 flex items-center justify-between">
                        <button
                          onClick={() => handleToggleProjectVisibility(proj)}
                          className={`text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                            proj.isVisible
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                              : "bg-neutral-500/10 border-neutral-500/30 text-neutral-500"
                          }`}
                        >
                          {proj.isVisible ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Tampil</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Disembunyikan</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingProject(proj)}
                            className="p-1.5 rounded-lg border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 text-[var(--color-brown)] transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(proj._id)}
                            className="p-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════════════════ EXPERIENCES TAB ════════════════ */}
            {activeTab === "experiences" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-base font-bold">Manajemen Pengalaman</h2>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Kelola riwayat magang mengajar dan pengalaman kepengurusan organisasi
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setEditingExp({
                        type: "internship",
                        title: { id: "", en: "" },
                        org: "",
                        period: "",
                        points: [],
                        images: [],
                        order: experiences.length + 1,
                        isVisible: true,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--color-brown)] text-white text-xs font-semibold hover:bg-[var(--color-brown-dark)] transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Pengalaman</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {experiences.map((exp) => (
                    <div
                      key={exp._id}
                      className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all bg-[var(--color-cream-dark)]/40 ${
                        exp.isVisible
                          ? "border-[var(--color-brown-light)]/30 shadow-xs"
                          : "border-dashed border-[var(--color-brown-light)]/20 opacity-60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              exp.type === "internship"
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                : "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                            }`}
                          >
                            {exp.type === "internship" ? "Magang / Mengajar" : "Organisasi"}
                          </span>
                          <span className="text-[10px] text-[var(--color-text-muted)]">
                            Urutan: #{exp.order}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-[var(--color-text-main)]">
                          {exp.title.id || exp.title.en}
                        </h3>
                        <p className="text-xs font-semibold text-[var(--color-brown)] mt-0.5">
                          {exp.org} • <span className="font-normal">{exp.period}</span>
                        </p>

                        <div className="mt-3 space-y-1">
                          {exp.points?.slice(0, 3).map((pt, i) => (
                            <div key={i} className="text-xs text-[var(--color-text-muted)] flex items-start gap-1.5">
                              <span className="text-[var(--color-brown)]">•</span>
                              <span className="line-clamp-1">{pt.id || pt.en}</span>
                            </div>
                          ))}
                          {exp.points && exp.points.length > 3 && (
                            <p className="text-[10px] text-[var(--color-brown)] font-medium">
                              +{exp.points.length - 3} poin tugas lainnya
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[var(--color-brown-light)]/20 flex items-center justify-between">
                        <button
                          onClick={() => handleToggleExpVisibility(exp)}
                          className={`text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                            exp.isVisible
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                              : "bg-neutral-500/10 border-neutral-500/30 text-neutral-500"
                          }`}
                        >
                          {exp.isVisible ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Tampil</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Disembunyikan</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingExp(exp)}
                            className="p-1.5 rounded-lg border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 text-[var(--color-brown)] transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExp(exp._id)}
                            className="p-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════════════════ SKILLS TAB ════════════════ */}
            {activeTab === "skills" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-base font-bold">Manajemen Keahlian</h2>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Kelola grup keahlian (Hard Skills, Soft Skills, Bahasa) dan persentase penguasaan
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setEditingSkillGroup({
                        category: "hard",
                        label: { id: "", en: "" },
                        items: [],
                        order: skills.length + 1,
                        isVisible: true,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--color-brown)] text-white text-xs font-semibold hover:bg-[var(--color-brown-dark)] transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Grup Keahlian</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {skills.map((group) => (
                    <div
                      key={group._id}
                      className="rounded-2xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/40 p-5 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--color-brown-light)]/20">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--color-brown)]/15 text-[var(--color-brown)]">
                              {group.category}
                            </span>
                            <h3 className="font-bold text-sm text-[var(--color-text-main)]">
                              {group.label.id || group.label.en}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleSkillVisibility(group)}
                            className={`text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                              group.isVisible
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                : "bg-neutral-500/10 border-neutral-500/30 text-neutral-500"
                            }`}
                          >
                            {group.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span>{group.isVisible ? "Tampil" : "Hidden"}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSkillGroup(group._id)}
                            className="p-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                            title="Hapus Grup"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-4">
                        {group.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/20 text-xs"
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold truncate">{item.name}</span>
                                <span className="text-[var(--color-brown)] font-bold text-[10px]">
                                  {item.level}%
                                </span>
                              </div>
                              <div className="w-full bg-[var(--color-brown-light)]/20 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-[var(--color-brown)] h-full rounded-full"
                                  style={{ width: `${item.level}%` }}
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteSkillItem(group._id, idx)}
                              className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                              title="Hapus Item"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Item Inline */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-brown-light)]/15">
                        <input
                          type="text"
                          placeholder="Nama skill baru (mis: Kurikulum Merdeka)"
                          value={newSkillItem[group._id]?.name || ""}
                          onChange={(e) =>
                            setNewSkillItem({
                              ...newSkillItem,
                              [group._id]: {
                                name: e.target.value,
                                level: newSkillItem[group._id]?.level || 80,
                              },
                            })
                          }
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                        />
                        <input
                          type="number"
                          min={1}
                          max={100}
                          placeholder="Level %"
                          value={newSkillItem[group._id]?.level || 80}
                          onChange={(e) =>
                            setNewSkillItem({
                              ...newSkillItem,
                              [group._id]: {
                                name: newSkillItem[group._id]?.name || "",
                                level: Number(e.target.value),
                              },
                            })
                          }
                          className="w-20 px-3 py-1.5 text-xs rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                        />
                        <button
                          onClick={() => handleAddSkillItem(group._id)}
                          className="px-3 py-1.5 rounded-xl bg-[var(--color-brown)] text-white text-xs font-semibold hover:bg-[var(--color-brown-dark)] transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Item</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════════════════ RECOMMENDATION LETTERS TAB ════════════════ */}
            {activeTab === "letters" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-base font-bold">Manajemen Surat Rekomendasi</h2>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Kelola dokumen surat rekomendasi dari dosen dan instansi
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setEditingLetter({
                        title: { id: "", en: "" },
                        issuer: "",
                        date: "",
                        pages: [],
                        order: letters.length + 1,
                        isVisible: true,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--color-brown)] text-white text-xs font-semibold hover:bg-[var(--color-brown-dark)] transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Surat</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {letters.map((letter) => (
                    <div
                      key={letter._id}
                      className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all bg-[var(--color-cream-dark)]/40 ${
                        letter.isVisible
                          ? "border-[var(--color-brown-light)]/30 shadow-xs"
                          : "border-dashed border-[var(--color-brown-light)]/20 opacity-60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-[var(--color-text-muted)]">
                            Urutan: #{letter.order}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[var(--color-brown)]/15 text-[var(--color-brown)] font-semibold">
                            {letter.pages?.length || 0} Halaman
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-[var(--color-text-main)]">
                          {letter.title.id || letter.title.en}
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                          ✍️ Penerbit: <span className="font-medium text-[var(--color-text-main)]">{letter.issuer}</span>
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          🗓️ Tanggal: {letter.date}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[var(--color-brown-light)]/20 flex items-center justify-between">
                        <button
                          onClick={() => handleToggleLetterVisibility(letter)}
                          className={`text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                            letter.isVisible
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                              : "bg-neutral-500/10 border-neutral-500/30 text-neutral-500"
                          }`}
                        >
                          {letter.isVisible ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Tampil</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Disembunyikan</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingLetter(letter)}
                            className="p-1.5 rounded-lg border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 text-[var(--color-brown)] transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLetter(letter._id)}
                            className="p-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════════════════ CONTACTS TAB ════════════════ */}
            {activeTab === "contacts" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-base font-bold">Pesan Masuk (Kontak)</h2>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Daftar formulir kontak yang dikirim oleh pengunjung portfolio
                    </p>
                  </div>

                  {contactStats && (
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/15 text-red-600">
                        {contactStats.unread} Belum Dibaca
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--color-brown)]/15 text-[var(--color-brown)]">
                        {contactStats.total} Total Pesan
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {contacts.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-[var(--color-brown-light)]/30 rounded-2xl text-xs text-[var(--color-text-muted)]">
                      Belum ada pesan yang masuk.
                    </div>
                  ) : (
                    contacts.map((contact) => (
                      <div
                        key={contact._id}
                        onClick={() => handleViewContact(contact)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          contact.status === "unread"
                            ? "bg-[var(--color-cream-dark)]/80 border-[var(--color-brown)] shadow-xs"
                            : "bg-[var(--color-cream-dark)]/30 border-[var(--color-brown-light)]/20 hover:border-[var(--color-brown-light)]/40"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                contact.status === "unread"
                                  ? "bg-red-500"
                                  : contact.status === "replied"
                                  ? "bg-emerald-500"
                                  : "bg-neutral-400"
                              }`}
                            />
                            <span className="font-bold text-xs text-[var(--color-text-main)] truncate">
                              {contact.name}
                            </span>
                            <span className="text-[11px] text-[var(--color-text-muted)] truncate">
                              &lt;{contact.email}&gt;
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-[var(--color-text-main)] truncate">
                            {contact.subject}
                          </h4>
                          <p className="text-xs text-[var(--color-text-muted)] line-clamp-1 mt-0.5">
                            {contact.message}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <span className="text-[11px] text-[var(--color-text-muted)]">
                            {new Date(contact.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              contact.status === "unread"
                                ? "bg-red-500/20 text-red-600"
                                : contact.status === "replied"
                                ? "bg-emerald-500/20 text-emerald-600"
                                : "bg-neutral-500/20 text-neutral-600"
                            }`}
                          >
                            {contact.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════════════════ MODAL: EDIT/CREATE CERTIFICATE ════════════════ */}
      {editingCert && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-brown-light)]/20 mb-4">
              <h3 className="font-bold text-sm">
                {editingCert._id ? "Edit Sertifikat" : "Tambah Sertifikat Baru"}
              </h3>
              <button onClick={() => setEditingCert(null)} className="cursor-pointer">
                <X className="w-4 h-4 text-[var(--color-text-muted)]" />
              </button>
            </div>

            <form onSubmit={handleSaveCert} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Judul (Bahasa Indonesia)</label>
                <input
                  type="text"
                  required
                  value={editingCert.title?.id || ""}
                  onChange={(e) =>
                    setEditingCert({
                      ...editingCert,
                      title: { ...(editingCert.title || { id: "", en: "" }), id: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Judul (English)</label>
                <input
                  type="text"
                  required
                  value={editingCert.title?.en || ""}
                  onChange={(e) =>
                    setEditingCert({
                      ...editingCert,
                      title: { ...(editingCert.title || { id: "", en: "" }), en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Penerbit (Issuer)</label>
                  <input
                    type="text"
                    required
                    value={editingCert.issuer || ""}
                    onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tanggal (mis: Mei 2024)</label>
                  <input
                    type="text"
                    required
                    value={editingCert.date || ""}
                    onChange={(e) => setEditingCert({ ...editingCert, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Kategori</label>
                  <select
                    value={editingCert.category || "Technology"}
                    onChange={(e) =>
                      setEditingCert({
                        ...editingCert,
                        category: e.target.value as Certificate["category"],
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Professional">Professional</option>
                    <option value="Soft Skills">Soft Skills</option>
                    <option value="Data">Data</option>
                    <option value="Organization">Organization</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Skor / Nilai (Opsional)</label>
                  <input
                    type="text"
                    placeholder="mis: 95/100 atau Grade A"
                    value={editingCert.score || ""}
                    onChange={(e) => setEditingCert({ ...editingCert, score: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">URL Gambar (pisahkan dengan koma jika banyak)</label>
                <input
                  type="text"
                  placeholder="/certificates/cert1.jpg, /certificates/cert1_back.jpg"
                  value={editingCert.images?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingCert({
                      ...editingCert,
                      images: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Urutan Tampil (Order)</label>
                  <input
                    type="number"
                    value={editingCert.order || 1}
                    onChange={(e) => setEditingCert({ ...editingCert, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCert.isVisible ?? true}
                      onChange={(e) => setEditingCert({ ...editingCert, isVisible: e.target.checked })}
                      className="rounded accent-[var(--color-brown)] w-4 h-4"
                    />
                    <span className="font-semibold">Tampilkan di Publik</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[var(--color-brown-light)]/20">
                <button
                  type="button"
                  onClick={() => setEditingCert(null)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "saveCert"}
                  className="px-4 py-2 rounded-xl bg-[var(--color-brown)] text-white font-semibold hover:bg-[var(--color-brown-dark)] cursor-pointer"
                >
                  {actionLoading === "saveCert" ? "Menyimpan..." : "Simpan Sertifikat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════ MODAL: EDIT/CREATE PROJECT ════════════════ */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-brown-light)]/20 mb-4">
              <h3 className="font-bold text-sm">
                {editingProject._id ? "Edit Proyek" : "Tambah Proyek Baru"}
              </h3>
              <button onClick={() => setEditingProject(null)} className="cursor-pointer">
                <X className="w-4 h-4 text-[var(--color-text-muted)]" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Judul Proyek (ID)</label>
                <input
                  type="text"
                  required
                  value={editingProject.title?.id || ""}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      title: { ...(editingProject.title || { id: "", en: "" }), id: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Judul Proyek (EN)</label>
                <input
                  type="text"
                  required
                  value={editingProject.title?.en || ""}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      title: { ...(editingProject.title || { id: "", en: "" }), en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Deskripsi (ID)</label>
                <textarea
                  rows={3}
                  required
                  value={editingProject.description?.id || ""}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      description: { ...(editingProject.description || { id: "", en: "" }), id: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Deskripsi (EN)</label>
                <textarea
                  rows={3}
                  required
                  value={editingProject.description?.en || ""}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      description: { ...(editingProject.description || { id: "", en: "" }), en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Tags (pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="Kimia, Modul Ajar, STEM, Kurikulum Merdeka"
                  value={editingProject.tags?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">URL Path File PDF</label>
                  <input
                    type="text"
                    placeholder="/projects/modul-termokimia.pdf"
                    value={editingProject.pdfPath || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, pdfPath: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Nama File (Download Label)</label>
                  <input
                    type="text"
                    placeholder="Modul_Ajar_Kimia.pdf"
                    value={editingProject.fileName || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, fileName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Urutan</label>
                  <input
                    type="number"
                    value={editingProject.order || 1}
                    onChange={(e) => setEditingProject({ ...editingProject, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProject.isVisible ?? true}
                      onChange={(e) => setEditingProject({ ...editingProject, isVisible: e.target.checked })}
                      className="rounded accent-[var(--color-brown)] w-4 h-4"
                    />
                    <span className="font-semibold">Tampilkan di Publik</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[var(--color-brown-light)]/20">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "saveProject"}
                  className="px-4 py-2 rounded-xl bg-[var(--color-brown)] text-white font-semibold hover:bg-[var(--color-brown-dark)] cursor-pointer"
                >
                  {actionLoading === "saveProject" ? "Menyimpan..." : "Simpan Proyek"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════ MODAL: EDIT/CREATE EXPERIENCE ════════════════ */}
      {editingExp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-brown-light)]/20 mb-4">
              <h3 className="font-bold text-sm">
                {editingExp._id ? "Edit Pengalaman" : "Tambah Pengalaman Baru"}
              </h3>
              <button onClick={() => setEditingExp(null)} className="cursor-pointer">
                <X className="w-4 h-4 text-[var(--color-text-muted)]" />
              </button>
            </div>

            <form onSubmit={handleSaveExp} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tipe Pengalaman</label>
                  <select
                    value={editingExp.type || "internship"}
                    onChange={(e) =>
                      setEditingExp({
                        ...editingExp,
                        type: e.target.value as Experience["type"],
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                  >
                    <option value="internship">Magang / Mengajar</option>
                    <option value="organization">Organisasi</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Periode (mis: Jul - Des 2024)</label>
                  <input
                    type="text"
                    required
                    value={editingExp.period || ""}
                    onChange={(e) => setEditingExp({ ...editingExp, period: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Posisi / Peran (ID)</label>
                <input
                  type="text"
                  required
                  placeholder="Guru PPL Kimia"
                  value={editingExp.title?.id || ""}
                  onChange={(e) =>
                    setEditingExp({
                      ...editingExp,
                      title: { ...(editingExp.title || { id: "", en: "" }), id: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Posisi / Peran (EN)</label>
                <input
                  type="text"
                  required
                  placeholder="Chemistry Teaching Intern"
                  value={editingExp.title?.en || ""}
                  onChange={(e) =>
                    setEditingExp({
                      ...editingExp,
                      title: { ...(editingExp.title || { id: "", en: "" }), en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Instansi / Sekolah / Organisasi</label>
                <input
                  type="text"
                  required
                  placeholder="SMA Negeri 1 Palembang"
                  value={editingExp.org || ""}
                  onChange={(e) => setEditingExp({ ...editingExp, org: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Poin Tugas / Prestasi (pisahkan baris baru untuk tiap poin)
                </label>
                <textarea
                  rows={4}
                  placeholder="Merancang modul pembelajaran kimia berbasis kurikulum merdeka&#10;Melaksanakan asesmen diagnostik dan formatif"
                  value={editingExp.points?.map((p) => p.id || p.en).join("\n") || ""}
                  onChange={(e) => {
                    const lines = e.target.value.split("\n").filter((l) => l.trim().length > 0);
                    setEditingExp({
                      ...editingExp,
                      points: lines.map((line) => ({ id: line.trim(), en: line.trim() })),
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Urutan</label>
                  <input
                    type="number"
                    value={editingExp.order || 1}
                    onChange={(e) => setEditingExp({ ...editingExp, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingExp.isVisible ?? true}
                      onChange={(e) => setEditingExp({ ...editingExp, isVisible: e.target.checked })}
                      className="rounded accent-[var(--color-brown)] w-4 h-4"
                    />
                    <span className="font-semibold">Tampilkan di Publik</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[var(--color-brown-light)]/20">
                <button
                  type="button"
                  onClick={() => setEditingExp(null)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "saveExp"}
                  className="px-4 py-2 rounded-xl bg-[var(--color-brown)] text-white font-semibold hover:bg-[var(--color-brown-dark)] cursor-pointer"
                >
                  {actionLoading === "saveExp" ? "Menyimpan..." : "Simpan Pengalaman"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════ MODAL: EDIT/CREATE SKILL GROUP ════════════════ */}
      {editingSkillGroup && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/30 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-brown-light)]/20 mb-4">
              <h3 className="font-bold text-sm">
                {editingSkillGroup._id ? "Edit Grup Keahlian" : "Tambah Grup Keahlian Baru"}
              </h3>
              <button onClick={() => setEditingSkillGroup(null)} className="cursor-pointer">
                <X className="w-4 h-4 text-[var(--color-text-muted)]" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setActionLoading("saveSkillGroup");
                try {
                  if (editingSkillGroup._id) {
                    const updated = await api.admin.updateSkillGroup(editingSkillGroup._id, editingSkillGroup);
                    setSkills((prev) =>
                      prev.map((g) => (g._id === editingSkillGroup._id ? updated : g)),
                    );
                    showFeedback("success", "Grup keahlian diperbarui.");
                  } else {
                    const created = await api.admin.createSkillGroup(editingSkillGroup);
                    setSkills((prev) => [...prev, created]);
                    showFeedback("success", "Grup keahlian dibuat.");
                  }
                  setEditingSkillGroup(null);
                } catch (err: unknown) {
                  showFeedback("error", err instanceof Error ? err.message : "Gagal menyimpan.");
                } finally {
                  setActionLoading(null);
                }
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1">Kategori</label>
                <select
                  value={editingSkillGroup.category || "hard"}
                  onChange={(e) =>
                    setEditingSkillGroup({
                      ...editingSkillGroup,
                      category: e.target.value as SkillGroup["category"],
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                >
                  <option value="hard">Hard Skills / Teknis</option>
                  <option value="soft">Soft Skills / Interpersonal</option>
                  <option value="language">Bahasa / Language</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Label Grup (ID)</label>
                <input
                  type="text"
                  required
                  placeholder="mis: Pedagogik & Kurikulum"
                  value={editingSkillGroup.label?.id || ""}
                  onChange={(e) =>
                    setEditingSkillGroup({
                      ...editingSkillGroup,
                      label: { ...(editingSkillGroup.label || { id: "", en: "" }), id: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Label Grup (EN)</label>
                <input
                  type="text"
                  required
                  placeholder="mis: Pedagogy & Curriculum"
                  value={editingSkillGroup.label?.en || ""}
                  onChange={(e) =>
                    setEditingSkillGroup({
                      ...editingSkillGroup,
                      label: { ...(editingSkillGroup.label || { id: "", en: "" }), en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[var(--color-brown-light)]/20">
                <button
                  type="button"
                  onClick={() => setEditingSkillGroup(null)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "saveSkillGroup"}
                  className="px-4 py-2 rounded-xl bg-[var(--color-brown)] text-white font-semibold hover:bg-[var(--color-brown-dark)] cursor-pointer"
                >
                  Simpan Grup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════ MODAL: EDIT/CREATE RECOMMENDATION LETTER ════════════════ */}
      {editingLetter && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-brown-light)]/20 mb-4">
              <h3 className="font-bold text-sm">
                {editingLetter._id ? "Edit Surat Rekomendasi" : "Tambah Surat Rekomendasi Baru"}
              </h3>
              <button onClick={() => setEditingLetter(null)} className="cursor-pointer">
                <X className="w-4 h-4 text-[var(--color-text-muted)]" />
              </button>
            </div>

            <form onSubmit={handleSaveLetter} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Judul Surat (ID)</label>
                <input
                  type="text"
                  required
                  value={editingLetter.title?.id || ""}
                  onChange={(e) =>
                    setEditingLetter({
                      ...editingLetter,
                      title: { ...(editingLetter.title || { id: "", en: "" }), id: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Judul Surat (EN)</label>
                <input
                  type="text"
                  required
                  value={editingLetter.title?.en || ""}
                  onChange={(e) =>
                    setEditingLetter({
                      ...editingLetter,
                      title: { ...(editingLetter.title || { id: "", en: "" }), en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Pemberi Rekomendasi (Issuer)</label>
                  <input
                    type="text"
                    required
                    value={editingLetter.issuer || ""}
                    onChange={(e) => setEditingLetter({ ...editingLetter, issuer: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tanggal Surat</label>
                  <input
                    type="text"
                    required
                    value={editingLetter.date || ""}
                    onChange={(e) => setEditingLetter({ ...editingLetter, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">URL Gambar Halaman (pisahkan koma)</label>
                <input
                  type="text"
                  placeholder="/letters/letter1_page1.jpg, /letters/letter1_page2.jpg"
                  value={editingLetter.pages?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingLetter({
                      ...editingLetter,
                      pages: e.target.value
                        .split(",")
                        .map((p) => p.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[var(--color-brown-light)]/20">
                <button
                  type="button"
                  onClick={() => setEditingLetter(null)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "saveLetter"}
                  className="px-4 py-2 rounded-xl bg-[var(--color-brown)] text-white font-semibold hover:bg-[var(--color-brown-dark)] cursor-pointer"
                >
                  Simpan Surat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════ MODAL: DETAIL PESAN KONTAK ════════════════ */}
      {viewingContact && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-brown-light)]/20 mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[var(--color-brown)]" />
                <h3 className="font-bold text-sm">Pesan dari {viewingContact.name}</h3>
              </div>
              <button onClick={() => setViewingContact(null)} className="cursor-pointer">
                <X className="w-4 h-4 text-[var(--color-text-muted)]" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[var(--color-cream-dark)]/40 p-3 rounded-xl space-y-1">
                <p>
                  <span className="font-semibold text-[var(--color-text-muted)]">Pengirim:</span>{" "}
                  {viewingContact.name}
                </p>
                <p>
                  <span className="font-semibold text-[var(--color-text-muted)]">Email:</span>{" "}
                  <a
                    href={`mailto:${viewingContact.email}?subject=Re: ${encodeURIComponent(viewingContact.subject)}`}
                    className="text-[var(--color-brown)] underline"
                  >
                    {viewingContact.email}
                  </a>
                </p>
                <p>
                  <span className="font-semibold text-[var(--color-text-muted)]">Waktu:</span>{" "}
                  {new Date(viewingContact.createdAt).toLocaleString("id-ID")}
                </p>
                <p>
                  <span className="font-semibold text-[var(--color-text-muted)]">Status:</span>{" "}
                  <span className="uppercase font-bold text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-brown)]/15 text-[var(--color-brown)]">
                    {viewingContact.status}
                  </span>
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-1">{viewingContact.subject}</h4>
                <div className="p-3.5 rounded-xl bg-[var(--color-cream-dark)]/30 border border-[var(--color-brown-light)]/20 whitespace-pre-wrap leading-relaxed">
                  {viewingContact.message}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[var(--color-brown-light)]/20">
                <button
                  onClick={() => handleDeleteContact(viewingContact._id)}
                  className="px-3 py-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>

                <div className="flex items-center gap-2">
                  {viewingContact.status !== "replied" && (
                    <button
                      onClick={() => handleMarkReplied(viewingContact._id)}
                      className="px-3 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 font-semibold cursor-pointer"
                    >
                      Tandai Sudah Dibalas
                    </button>
                  )}
                  <a
                    href={`mailto:${viewingContact.email}?subject=Re: ${encodeURIComponent(viewingContact.subject)}`}
                    className="px-4 py-1.5 rounded-xl bg-[var(--color-brown)] text-white font-semibold hover:bg-[var(--color-brown-dark)] cursor-pointer"
                  >
                    Balas via Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ MODAL: CHANGE PASSWORD ════════════════ */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/30 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-brown-light)]/20 mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[var(--color-brown)]" />
                <h3 className="font-bold text-sm">Ganti Password Admin</h3>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="cursor-pointer"
              >
                <X className="w-4 h-4 text-[var(--color-text-muted)]" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Password Saat Ini</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Password Baru</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[var(--color-brown-light)]/20">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "password"}
                  className="px-4 py-1.5 rounded-xl bg-[var(--color-brown)] text-white font-semibold hover:bg-[var(--color-brown-dark)] cursor-pointer"
                >
                  {actionLoading === "password" ? "Menyimpan..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
