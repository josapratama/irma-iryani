"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Copy,
  Terminal,
  Sparkles,
  Layers,
  Calendar,
  Globe,
  SlidersHorizontal,
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
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

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

  // Modal active lang tab for bilingual fields
  const [modalLang, setModalLang] = useState<"id" | "en">("id");

  // Edit/Create Modal states
  const [editingCert, setEditingCert] = useState<Partial<Certificate> | null>(null);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [editingExp, setEditingExp] = useState<Partial<Experience> | null>(null);
  const [editingSkillGroup, setEditingSkillGroup] = useState<Partial<SkillGroup> | null>(null);
  const [editingLetter, setEditingLetter] = useState<Partial<RecommendationLetter> | null>(null);
  const [viewingContact, setViewingContact] = useState<ContactMessage | null>(null);

  // Inline skill item input per group
  const [newSkillItem, setNewSkillItem] = useState<{
    [groupId: string]: { name: string; level: number };
  }>({});

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
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
      const [
        certsData,
        projsData,
        expsData,
        skillsData,
        lettersData,
        contactsData,
        statsData,
      ] = await Promise.allSettled([
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
    } catch {
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
      showFeedback("success", "Visibilitas proyek diperbarui.");
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
      showFeedback("success", "Visibilitas pengalaman diperbarui.");
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
      showFeedback("success", "Visibilitas grup skill diperbarui.");
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
      showFeedback("success", "Visibilitas surat rekomendasi diperbarui.");
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
        const updated = await api.admin.updateRecommendationLetter(
          editingLetter._id,
          editingLetter,
        );
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
        // silent
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

  // ── Filtering Logic ──────────────────────────────────────────────────────
  const filteredCertificates = useMemo(() => {
    return certificates.filter((c) => {
      const matchQuery =
        !searchQuery ||
        (c.title.id && c.title.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.title.en && c.title.en.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.issuer && c.issuer.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = categoryFilter === "all" || c.category === categoryFilter;
      return matchQuery && matchCat;
    });
  }, [certificates, searchQuery, categoryFilter]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      return (
        !searchQuery ||
        (p.title.id && p.title.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.title.en && p.title.en.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    });
  }, [projects, searchQuery]);

  const filteredExperiences = useMemo(() => {
    return experiences.filter((e) => {
      const matchQuery =
        !searchQuery ||
        (e.title.id && e.title.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.title.en && e.title.en.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.org && e.org.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchType = categoryFilter === "all" || e.type === categoryFilter;
      return matchQuery && matchType;
    });
  }, [experiences, searchQuery, categoryFilter]);

  return (
    <div className="min-h-screen bg-[var(--color-cream)] text-[var(--color-text-main)] flex flex-col font-sans selection:bg-[var(--color-brown-light)]/30">
      {/* ── Topbar Header ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[var(--color-cream)]/90 dark:bg-[var(--color-cream-dark)]/85 backdrop-blur-md border-b border-[var(--color-brown-light)]/20 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--color-brown)] to-[var(--color-brown-light)] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-[var(--color-brown)]/20">
            II
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight leading-none text-[var(--color-text-main)]">
                Irma Iryani
              </h1>
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-brown)]/15 text-[var(--color-brown)]">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] truncate max-w-[160px] sm:max-w-none mt-0.5">
              {adminEmail}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 text-xs font-semibold text-[var(--color-text-main)] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[var(--color-brown)]" />
            <span>Lihat Website</span>
          </Link>

          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 text-xs font-semibold text-[var(--color-text-main)] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            title="Ganti Password"
          >
            <KeyRound className="w-3.5 h-3.5 text-[var(--color-brown)]" />
            <span className="hidden sm:inline">Password</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer border border-red-500/20"
            title="Keluar"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* ── Feedback Notification Toast ────────────────────────────────────── */}
      {feedback && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-600 text-white shadow-emerald-600/30"
              : "bg-red-600 text-white shadow-red-600/30"
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
            className="ml-2 hover:opacity-75 cursor-pointer p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── Main Container ──────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* ── Quick Overview Metric Cards ───────────────────────────────────── */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              id: "certificates",
              label: "Sertifikat",
              icon: Award,
              count: certificates.length,
              color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
            },
            {
              id: "projects",
              label: "Proyek & Modul",
              icon: Briefcase,
              count: projects.length,
              color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
            },
            {
              id: "experiences",
              label: "Pengalaman",
              icon: Building2,
              count: experiences.length,
              color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
            },
            {
              id: "skills",
              label: "Grup Keahlian",
              icon: Cpu,
              count: skills.length,
              color: "text-purple-600 bg-purple-500/10 border-purple-500/20",
            },
            {
              id: "letters",
              label: "Surat Rekomendasi",
              icon: FileText,
              count: letters.length,
              color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20",
            },
            {
              id: "contacts",
              label: "Pesan Masuk",
              icon: Inbox,
              count: contacts.length,
              badge: contactStats?.unread || 0,
              color: "text-rose-600 bg-rose-500/10 border-rose-500/20",
            },
          ].map((metric) => {
            const Icon = metric.icon;
            const isCurrent = activeTab === metric.id;
            return (
              <button
                key={metric.id}
                onClick={() => {
                  setActiveTab(metric.id as TabType);
                  setSearchQuery("");
                  setCategoryFilter("all");
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                  isCurrent
                    ? "bg-[var(--color-cream-dark)]/70 border-[var(--color-brown)] shadow-sm scale-[1.02]"
                    : "bg-[var(--color-cream-dark)]/30 border-[var(--color-brown-light)]/20 hover:border-[var(--color-brown-light)]/40 hover:bg-[var(--color-cream-dark)]/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl border ${metric.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {metric.badge !== undefined && metric.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                      {metric.badge} Baru
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <div className="text-xl font-extrabold tracking-tight text-[var(--color-text-main)]">
                    {metric.count}
                  </div>
                  <div className="text-[11px] font-semibold text-[var(--color-text-muted)] group-hover:text-[var(--color-brown)] transition-colors truncate">
                    {metric.label}
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        {/* ── Main Navigation Pill Tabs ──────────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--color-brown-light)]/20 custom-scrollbar">
          {[
            { id: "certificates", label: "Sertifikat", icon: Award, count: certificates.length },
            { id: "projects", label: "Proyek & Modul", icon: Briefcase, count: projects.length },
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
                  setCategoryFilter("all");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[var(--color-brown)] to-[var(--color-brown-dark)] text-white shadow-md shadow-[var(--color-brown)]/20"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-brown-light)]/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {tab.badge}
                  </span>
                ) : tab.count !== undefined ? (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[var(--color-brown-light)]/20 text-[var(--color-text-muted)]"
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
              className="p-2.5 rounded-xl border border-[var(--color-brown-light)]/30 text-[var(--color-text-muted)] hover:text-[var(--color-brown)] hover:bg-[var(--color-brown)]/10 transition-colors cursor-pointer"
              title="Muat Ulang Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── Tab Content ────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-16 text-center text-[var(--color-text-muted)]">
            <Loader2 className="w-9 h-9 animate-spin text-[var(--color-brown)] mb-3" />
            <p className="text-xs font-semibold">Memuat data dari server backend...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-5">
            {/* ════════════════ CERTIFICATES TAB ════════════════ */}
            {activeTab === "certificates" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight">Manajemen Sertifikat</h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      Kelola daftar sertifikat pelatihan, kompetensi, dan penghargaan
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCert({
                        title: { id: "", en: "" },
                        issuer: "",
                        date: "",
                        category: "Technology",
                        images: [],
                        order: certificates.length + 1,
                        isVisible: true,
                      });
                      setModalLang("id");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-brown)] to-[var(--color-brown-dark)] text-white text-xs font-bold hover:opacity-95 transition-all shadow-md shadow-[var(--color-brown)]/20 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Sertifikat</span>
                  </button>
                </div>

                {/* Filter and Search Bar */}
                {certificates.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center gap-3 mb-5">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                      <input
                        type="text"
                        placeholder="Cari sertifikat atau penerbit..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/30 focus:border-[var(--color-brown)] outline-none"
                      />
                    </div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full sm:w-auto px-3.5 py-2 text-xs rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/30 focus:border-[var(--color-brown)] outline-none font-semibold text-[var(--color-text-main)]"
                    >
                      <option value="all">Semua Kategori</option>
                      <option value="Technology">Technology</option>
                      <option value="Professional">Professional</option>
                      <option value="Soft Skills">Soft Skills</option>
                      <option value="Data">Data</option>
                      <option value="Organization">Organization</option>
                    </select>
                  </div>
                )}

                {/* Empty State Banner when 0 items */}
                {certificates.length === 0 ? (
                  <EmptyStateCard
                    title="Belum Ada Sertifikat di Database"
                    description="Database saat ini masih kosong. Anda bisa mengklik Tambah Sertifikat, atau menjalankan perintah seed di terminal backend untuk menyemai 20+ data bawaan sekaligus."
                    onAdd={() =>
                      setEditingCert({
                        title: { id: "", en: "" },
                        issuer: "",
                        date: "",
                        category: "Technology",
                        images: [],
                        order: 1,
                        isVisible: true,
                      })
                    }
                    onCopySeed={copyToClipboard}
                    copied={copiedCmd}
                  />
                ) : filteredCertificates.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-[var(--color-brown-light)]/30 rounded-2xl text-xs text-[var(--color-text-muted)]">
                    Tidak ditemukan sertifikat yang sesuai dengan kata kunci pencarian.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCertificates.map((cert) => (
                      <div
                        key={cert._id}
                        className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all bg-[var(--color-cream-dark)]/30 hover:bg-[var(--color-cream-dark)]/50 ${
                          cert.isVisible
                            ? "border-[var(--color-brown-light)]/30 shadow-xs"
                            : "border-dashed border-[var(--color-brown-light)]/20 opacity-60"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[var(--color-brown)]/15 text-[var(--color-brown)]">
                              {cert.category}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                              #{cert.order}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm leading-snug text-[var(--color-text-main)]">
                            {cert.title.id || cert.title.en}
                          </h3>
                          {cert.title.en && cert.title.id !== cert.title.en && (
                            <p className="text-xs text-[var(--color-text-muted)] italic mt-1">
                              {cert.title.en}
                            </p>
                          )}
                          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                            <span>🏛️</span>
                            <span className="truncate">{cert.issuer}</span>
                            <span>•</span>
                            <span>🗓️</span>
                            <span>{cert.date}</span>
                          </div>
                          {cert.score && (
                            <div className="mt-2 text-[11px] font-bold text-[var(--color-brown)]">
                              Nilai / Skor: {cert.score}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3.5 border-t border-[var(--color-brown-light)]/20 flex items-center justify-between">
                          <button
                            onClick={() => handleToggleCertVisibility(cert)}
                            className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
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
                                <span>Hidden</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingCert(cert);
                                setModalLang("id");
                              }}
                              className="p-2 rounded-xl border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 text-[var(--color-brown)] transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCert(cert._id)}
                              className="p-2 rounded-xl border border-red-500/30 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ════════════════ PROJECTS TAB ════════════════ */}
            {activeTab === "projects" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight">Manajemen Proyek & Modul</h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      Kelola daftar modul ajar, penelitian, dan karya pendidikan
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProject({
                        title: { id: "", en: "" },
                        description: { id: "", en: "" },
                        tags: [],
                        pdfPath: "",
                        fileName: "",
                        order: projects.length + 1,
                        isVisible: true,
                      });
                      setModalLang("id");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-brown)] to-[var(--color-brown-dark)] text-white text-xs font-bold hover:opacity-95 transition-all shadow-md shadow-[var(--color-brown)]/20 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Proyek</span>
                  </button>
                </div>

                {projects.length === 0 ? (
                  <EmptyStateCard
                    title="Belum Ada Proyek di Database"
                    description="Database proyek masih kosong. Tambah proyek baru secara manual atau jalankan seeder di container backend."
                    onAdd={() =>
                      setEditingProject({
                        title: { id: "", en: "" },
                        description: { id: "", en: "" },
                        tags: [],
                        pdfPath: "",
                        fileName: "",
                        order: 1,
                        isVisible: true,
                      })
                    }
                    onCopySeed={copyToClipboard}
                    copied={copiedCmd}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProjects.map((proj) => (
                      <div
                        key={proj._id}
                        className={`rounded-2xl border p-5 flex flex-col justify-between transition-all bg-[var(--color-cream-dark)]/30 hover:bg-[var(--color-cream-dark)]/50 ${
                          proj.isVisible
                            ? "border-[var(--color-brown-light)]/30 shadow-xs"
                            : "border-dashed border-[var(--color-brown-light)]/20 opacity-60"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                              Urutan: #{proj.order}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-[var(--color-text-main)]">
                            {proj.title.id || proj.title.en}
                          </h3>
                          <p className="text-xs text-[var(--color-text-muted)] mt-1.5 line-clamp-3 leading-relaxed">
                            {proj.description.id || proj.description.en}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {proj.tags?.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--color-brown)]/10 text-[var(--color-brown)]"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                          {proj.pdfPath && (
                            <p className="text-[11px] text-[var(--color-text-muted)] mt-2.5 truncate font-medium">
                              📄 PDF: <span className="underline">{proj.fileName || proj.pdfPath}</span>
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3.5 border-t border-[var(--color-brown-light)]/20 flex items-center justify-between">
                          <button
                            onClick={() => handleToggleProjectVisibility(proj)}
                            className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
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
                                <span>Hidden</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingProject(proj);
                                setModalLang("id");
                              }}
                              className="p-2 rounded-xl border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 text-[var(--color-brown)] transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(proj._id)}
                              className="p-2 rounded-xl border border-red-500/30 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ════════════════ EXPERIENCES TAB ════════════════ */}
            {activeTab === "experiences" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight">Manajemen Pengalaman</h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      Kelola riwayat magang mengajar dan pengalaman kepengurusan organisasi
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingExp({
                        type: "internship",
                        title: { id: "", en: "" },
                        org: "",
                        period: "",
                        points: [],
                        images: [],
                        order: experiences.length + 1,
                        isVisible: true,
                      });
                      setModalLang("id");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-brown)] to-[var(--color-brown-dark)] text-white text-xs font-bold hover:opacity-95 transition-all shadow-md shadow-[var(--color-brown)]/20 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Pengalaman</span>
                  </button>
                </div>

                {experiences.length === 0 ? (
                  <EmptyStateCard
                    title="Belum Ada Pengalaman di Database"
                    description="Riwayat pengalaman mengajar dan organisasi masih kosong."
                    onAdd={() =>
                      setEditingExp({
                        type: "internship",
                        title: { id: "", en: "" },
                        org: "",
                        period: "",
                        points: [],
                        images: [],
                        order: 1,
                        isVisible: true,
                      })
                    }
                    onCopySeed={copyToClipboard}
                    copied={copiedCmd}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredExperiences.map((exp) => (
                      <div
                        key={exp._id}
                        className={`rounded-2xl border p-5 flex flex-col justify-between transition-all bg-[var(--color-cream-dark)]/30 hover:bg-[var(--color-cream-dark)]/50 ${
                          exp.isVisible
                            ? "border-[var(--color-brown-light)]/30 shadow-xs"
                            : "border-dashed border-[var(--color-brown-light)]/20 opacity-60"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                                exp.type === "internship"
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                  : "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                              }`}
                            >
                              {exp.type === "internship" ? "Magang / Mengajar" : "Organisasi"}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                              Urutan: #{exp.order}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-[var(--color-text-main)]">
                            {exp.title.id || exp.title.en}
                          </h3>
                          <p className="text-xs font-semibold text-[var(--color-brown)] mt-0.5">
                            {exp.org} • <span className="font-normal">{exp.period}</span>
                          </p>

                          <div className="mt-3 space-y-1.5">
                            {exp.points?.slice(0, 3).map((pt, i) => (
                              <div
                                key={i}
                                className="text-xs text-[var(--color-text-muted)] flex items-start gap-1.5"
                              >
                                <span className="text-[var(--color-brown)] font-bold">•</span>
                                <span className="line-clamp-1">{pt.id || pt.en}</span>
                              </div>
                            ))}
                            {exp.points && exp.points.length > 3 && (
                              <p className="text-[10px] text-[var(--color-brown)] font-bold">
                                +{exp.points.length - 3} poin rincian tugas lainnya
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 pt-3.5 border-t border-[var(--color-brown-light)]/20 flex items-center justify-between">
                          <button
                            onClick={() => handleToggleExpVisibility(exp)}
                            className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
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
                                <span>Hidden</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingExp(exp);
                                setModalLang("id");
                              }}
                              className="p-2 rounded-xl border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 text-[var(--color-brown)] transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteExp(exp._id)}
                              className="p-2 rounded-xl border border-red-500/30 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ════════════════ SKILLS TAB ════════════════ */}
            {activeTab === "skills" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight">Manajemen Keahlian</h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      Kelola grup keahlian (Hard Skills, Soft Skills, Bahasa) dan persentase level
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingSkillGroup({
                        category: "hard",
                        label: { id: "", en: "" },
                        items: [],
                        order: skills.length + 1,
                        isVisible: true,
                      });
                      setModalLang("id");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-brown)] to-[var(--color-brown-dark)] text-white text-xs font-bold hover:opacity-95 transition-all shadow-md shadow-[var(--color-brown)]/20 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Grup Keahlian</span>
                  </button>
                </div>

                {skills.length === 0 ? (
                  <EmptyStateCard
                    title="Belum Ada Kategori Keahlian di Database"
                    description="Kategori Hard Skills, Soft Skills, dan Bahasa masih kosong."
                    onAdd={() =>
                      setEditingSkillGroup({
                        category: "hard",
                        label: { id: "", en: "" },
                        items: [],
                        order: 1,
                        isVisible: true,
                      })
                    }
                    onCopySeed={copyToClipboard}
                    copied={copiedCmd}
                  />
                ) : (
                  <div className="space-y-4">
                    {skills.map((group) => (
                      <div
                        key={group._id}
                        className="rounded-2xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/30 p-5 shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-[var(--color-brown-light)]/20">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[var(--color-brown)]/15 text-[var(--color-brown)]">
                              {group.category}
                            </span>
                            <h3 className="font-extrabold text-sm text-[var(--color-text-main)]">
                              {group.label.id || group.label.en}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleSkillVisibility(group)}
                              className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                                group.isVisible
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                  : "bg-neutral-500/10 border-neutral-500/30 text-neutral-500"
                              }`}
                            >
                              {group.isVisible ? (
                                <Eye className="w-3.5 h-3.5" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5" />
                              )}
                              <span>{group.isVisible ? "Tampil" : "Hidden"}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteSkillGroup(group._id)}
                              className="p-1.5 rounded-xl border border-red-500/30 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                              title="Hapus Grup"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Items Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 my-4">
                          {group.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/20 text-xs shadow-xs"
                            >
                              <div className="flex-1 min-w-0 pr-3">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="font-bold truncate">{item.name}</span>
                                  <span className="text-[var(--color-brown)] font-extrabold text-[10px]">
                                    {item.level}%
                                  </span>
                                </div>
                                <div className="w-full bg-[var(--color-brown-light)]/20 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-[var(--color-brown-light)] to-[var(--color-brown)] h-full rounded-full transition-all"
                                    style={{ width: `${item.level}%` }}
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteSkillItem(group._id, idx)}
                                className="text-red-500 hover:bg-red-500/10 p-1 rounded-md transition-colors cursor-pointer"
                                title="Hapus Item"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Inline Add Item Form */}
                        <div className="flex flex-col sm:flex-row items-center gap-2 pt-3 border-t border-[var(--color-brown-light)]/15">
                          <input
                            type="text"
                            placeholder="Nama keahlian baru (mis: Kurikulum Merdeka)"
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
                            className="w-full sm:flex-1 px-3.5 py-2 text-xs rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)] font-medium"
                          />
                          <div className="flex items-center gap-2 w-full sm:w-auto">
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
                              className="w-24 px-3 py-2 text-xs rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] outline-none focus:border-[var(--color-brown)] font-bold text-center"
                            />
                            <button
                              onClick={() => handleAddSkillItem(group._id)}
                              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[var(--color-brown)] text-white text-xs font-bold hover:bg-[var(--color-brown-dark)] transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tambah</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ════════════════ RECOMMENDATION LETTERS TAB ════════════════ */}
            {activeTab === "letters" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight">Manajemen Surat Rekomendasi</h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      Kelola dokumen surat rekomendasi akademik & profesional
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingLetter({
                        title: { id: "", en: "" },
                        issuer: "",
                        date: "",
                        pages: [],
                        order: letters.length + 1,
                        isVisible: true,
                      });
                      setModalLang("id");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-brown)] to-[var(--color-brown-dark)] text-white text-xs font-bold hover:opacity-95 transition-all shadow-md shadow-[var(--color-brown)]/20 cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Surat</span>
                  </button>
                </div>

                {letters.length === 0 ? (
                  <EmptyStateCard
                    title="Belum Ada Surat Rekomendasi"
                    description="Daftar surat rekomendasi masih kosong."
                    onAdd={() =>
                      setEditingLetter({
                        title: { id: "", en: "" },
                        issuer: "",
                        date: "",
                        pages: [],
                        order: 1,
                        isVisible: true,
                      })
                    }
                    onCopySeed={copyToClipboard}
                    copied={copiedCmd}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {letters.map((letter) => (
                      <div
                        key={letter._id}
                        className={`rounded-2xl border p-5 flex flex-col justify-between transition-all bg-[var(--color-cream-dark)]/30 hover:bg-[var(--color-cream-dark)]/50 ${
                          letter.isVisible
                            ? "border-[var(--color-brown-light)]/30 shadow-xs"
                            : "border-dashed border-[var(--color-brown-light)]/20 opacity-60"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                              Urutan: #{letter.order}
                            </span>
                            <span className="px-2.5 py-0.5 rounded text-[10px] bg-[var(--color-brown)]/15 text-[var(--color-brown)] font-bold">
                              {letter.pages?.length || 0} Halaman
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-[var(--color-text-main)]">
                            {letter.title.id || letter.title.en}
                          </h3>
                          <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                            ✍️ Pemberi:{" "}
                            <span className="font-bold text-[var(--color-text-main)]">
                              {letter.issuer}
                            </span>
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                            🗓️ Tanggal: {letter.date}
                          </p>
                        </div>

                        <div className="mt-4 pt-3.5 border-t border-[var(--color-brown-light)]/20 flex items-center justify-between">
                          <button
                            onClick={() => handleToggleLetterVisibility(letter)}
                            className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
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
                                <span>Hidden</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingLetter(letter);
                                setModalLang("id");
                              }}
                              className="p-2 rounded-xl border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 text-[var(--color-brown)] transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLetter(letter._id)}
                              className="p-2 rounded-xl border border-red-500/30 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ════════════════ CONTACTS TAB ════════════════ */}
            {activeTab === "contacts" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight">Pesan Masuk (Inbox)</h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      Daftar pesan formulir yang dikirim oleh pengunjung portfolio
                    </p>
                  </div>

                  {contactStats && (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-600 border border-rose-500/20">
                        {contactStats.unread} Belum Dibaca
                      </span>
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-brown)]/15 text-[var(--color-brown)] border border-[var(--color-brown)]/20">
                        {contactStats.total} Total Pesan
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {contacts.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-[var(--color-brown-light)]/30 rounded-2xl text-xs text-[var(--color-text-muted)]">
                      <Inbox className="w-8 h-8 mx-auto text-[var(--color-brown-light)] mb-2 opacity-50" />
                      <p className="font-semibold">Belum ada pesan yang masuk dari pengunjung.</p>
                    </div>
                  ) : (
                    contacts.map((contact) => (
                      <div
                        key={contact._id}
                        onClick={() => handleViewContact(contact)}
                        className={`p-4.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          contact.status === "unread"
                            ? "bg-[var(--color-cream-dark)]/70 border-[var(--color-brown)] shadow-xs"
                            : "bg-[var(--color-cream-dark)]/30 border-[var(--color-brown-light)]/20 hover:border-[var(--color-brown-light)]/40 hover:bg-[var(--color-cream-dark)]/40"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                contact.status === "unread"
                                  ? "bg-rose-500"
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
                          <h4 className="text-xs font-bold text-[var(--color-text-main)] truncate">
                            {contact.subject}
                          </h4>
                          <p className="text-xs text-[var(--color-text-muted)] line-clamp-1 mt-0.5">
                            {contact.message}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <span className="text-[11px] text-[var(--color-text-muted)] font-medium">
                            {new Date(contact.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              contact.status === "unread"
                                ? "bg-rose-500/20 text-rose-600"
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
      </main>

      {/* ════════════════ MODAL: EDIT/CREATE CERTIFICATE ════════════════ */}
      {editingCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/30 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-brown-light)]/20">
              <h3 className="font-extrabold text-base">
                {editingCert._id ? "Edit Sertifikat" : "Tambah Sertifikat Baru"}
              </h3>
              <button
                onClick={() => setEditingCert(null)}
                className="p-1 rounded-lg hover:bg-[var(--color-brown-light)]/10 text-[var(--color-text-muted)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCert} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Bilingual tabs */}
              <div className="flex items-center gap-2 border-b border-[var(--color-brown-light)]/20 pb-2">
                <button
                  type="button"
                  onClick={() => setModalLang("id")}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    modalLang === "id"
                      ? "bg-[var(--color-brown)] text-white"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                  }`}
                >
                  🇮🇩 Bahasa Indonesia
                </button>
                <button
                  type="button"
                  onClick={() => setModalLang("en")}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    modalLang === "en"
                      ? "bg-[var(--color-brown)] text-white"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>

              {modalLang === "id" ? (
                <div>
                  <label className="block font-bold mb-1.5">Judul Sertifikat (Bahasa Indonesia)</label>
                  <input
                    type="text"
                    required
                    placeholder="mis: Pelatihan Kurikulum Merdeka Jenjang SMA"
                    value={editingCert.title?.id || ""}
                    onChange={(e) =>
                      setEditingCert({
                        ...editingCert,
                        title: {
                          ...(editingCert.title || { id: "", en: "" }),
                          id: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold mb-1.5">Certificate Title (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Independent Curriculum Training for High School"
                    value={editingCert.title?.en || ""}
                    onChange={(e) =>
                      setEditingCert({
                        ...editingCert,
                        title: {
                          ...(editingCert.title || { id: "", en: "" }),
                          en: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold mb-1.5">Penerbit (Issuer)</label>
                  <input
                    type="text"
                    required
                    placeholder="Kemdikbud / GNIK / Universitas"
                    value={editingCert.issuer || ""}
                    onChange={(e) => setEditingCert({ ...editingCert, issuer: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1.5">Tanggal (mis: 17 Juli 2024)</label>
                  <input
                    type="text"
                    required
                    placeholder="Juli 2024"
                    value={editingCert.date || ""}
                    onChange={(e) => setEditingCert({ ...editingCert, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold mb-1.5">Kategori</label>
                  <select
                    value={editingCert.category || "Technology"}
                    onChange={(e) =>
                      setEditingCert({
                        ...editingCert,
                        category: e.target.value as Certificate["category"],
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-semibold"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Professional">Professional</option>
                    <option value="Soft Skills">Soft Skills</option>
                    <option value="Data">Data</option>
                    <option value="Organization">Organization</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1.5">Skor / Nilai (Opsional)</label>
                  <input
                    type="text"
                    placeholder="mis: 96/100 atau Grade A"
                    value={editingCert.score || ""}
                    onChange={(e) => setEditingCert({ ...editingCert, score: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1.5">
                  URL Gambar (pisahkan dengan koma jika ada halaman belakang)
                </label>
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block font-bold mb-1.5">Urutan Tampil (Order)</label>
                  <input
                    type="number"
                    value={editingCert.order || 1}
                    onChange={(e) =>
                      setEditingCert({ ...editingCert, order: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-bold text-center"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2.5 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={editingCert.isVisible ?? true}
                      onChange={(e) =>
                        setEditingCert({ ...editingCert, isVisible: e.target.checked })
                      }
                      className="rounded accent-[var(--color-brown)] w-4 h-4 cursor-pointer"
                    />
                    <span>Tampilkan di Publik</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-[var(--color-brown-light)]/20">
                <button
                  type="button"
                  onClick={() => setEditingCert(null)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "saveCert"}
                  className="px-5 py-2.5 rounded-xl bg-[var(--color-brown)] text-white font-bold hover:bg-[var(--color-brown-dark)] cursor-pointer shadow-md shadow-[var(--color-brown)]/20 flex items-center gap-2"
                >
                  {actionLoading === "saveCert" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Sertifikat</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════ MODAL: EDIT/CREATE PROJECT ════════════════ */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/30 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-brown-light)]/20">
              <h3 className="font-extrabold text-base">
                {editingProject._id ? "Edit Proyek" : "Tambah Proyek Baru"}
              </h3>
              <button
                onClick={() => setEditingProject(null)}
                className="p-1 rounded-lg hover:bg-[var(--color-brown-light)]/10 text-[var(--color-text-muted)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="flex items-center gap-2 border-b border-[var(--color-brown-light)]/20 pb-2">
                <button
                  type="button"
                  onClick={() => setModalLang("id")}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    modalLang === "id"
                      ? "bg-[var(--color-brown)] text-white"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                  }`}
                >
                  🇮🇩 Bahasa Indonesia
                </button>
                <button
                  type="button"
                  onClick={() => setModalLang("en")}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    modalLang === "en"
                      ? "bg-[var(--color-brown)] text-white"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>

              {modalLang === "id" ? (
                <>
                  <div>
                    <label className="block font-bold mb-1.5">Judul Proyek (ID)</label>
                    <input
                      type="text"
                      required
                      placeholder="Modul Ajar Termokimia Interaktif"
                      value={editingProject.title?.id || ""}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          title: {
                            ...(editingProject.title || { id: "", en: "" }),
                            id: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1.5">Deskripsi Proyek (ID)</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Jelaskan tujuan, metode, dan dampak karya pendidikan ini..."
                      value={editingProject.description?.id || ""}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          description: {
                            ...(editingProject.description || { id: "", en: "" }),
                            id: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium leading-relaxed"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-bold mb-1.5">Project Title (EN)</label>
                    <input
                      type="text"
                      required
                      placeholder="Interactive Thermochemistry Teaching Module"
                      value={editingProject.title?.en || ""}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          title: {
                            ...(editingProject.title || { id: "", en: "" }),
                            en: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1.5">Project Description (EN)</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe the pedagogy, objectives, and impact..."
                      value={editingProject.description?.en || ""}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          description: {
                            ...(editingProject.description || { id: "", en: "" }),
                            en: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium leading-relaxed"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block font-bold mb-1.5">Tags (pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="Kimia, STEM, Modul Ajar, PBL"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold mb-1.5">Path / URL File PDF</label>
                  <input
                    type="text"
                    placeholder="/projects/modul-termokimia.pdf"
                    value={editingProject.pdfPath || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, pdfPath: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1.5">Nama File Download</label>
                  <input
                    type="text"
                    placeholder="Modul_Termokimia_Irma.pdf"
                    value={editingProject.fileName || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, fileName: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block font-bold mb-1.5">Urutan Tampil (Order)</label>
                  <input
                    type="number"
                    value={editingProject.order || 1}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, order: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-bold text-center"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2.5 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={editingProject.isVisible ?? true}
                      onChange={(e) =>
                        setEditingProject({ ...editingProject, isVisible: e.target.checked })
                      }
                      className="rounded accent-[var(--color-brown)] w-4 h-4 cursor-pointer"
                    />
                    <span>Tampilkan di Publik</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-[var(--color-brown-light)]/20">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "saveProject"}
                  className="px-5 py-2.5 rounded-xl bg-[var(--color-brown)] text-white font-bold hover:bg-[var(--color-brown-dark)] cursor-pointer shadow-md shadow-[var(--color-brown)]/20 flex items-center gap-2"
                >
                  {actionLoading === "saveProject" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Proyek</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════ MODAL: EDIT/CREATE EXPERIENCE ════════════════ */}
      {editingExp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/30 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-brown-light)]/20">
              <h3 className="font-extrabold text-base">
                {editingExp._id ? "Edit Pengalaman" : "Tambah Pengalaman Baru"}
              </h3>
              <button
                onClick={() => setEditingExp(null)}
                className="p-1 rounded-lg hover:bg-[var(--color-brown-light)]/10 text-[var(--color-text-muted)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExp} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold mb-1.5">Tipe Pengalaman</label>
                  <select
                    value={editingExp.type || "internship"}
                    onChange={(e) =>
                      setEditingExp({
                        ...editingExp,
                        type: e.target.value as Experience["type"],
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-bold"
                  >
                    <option value="internship">Magang / Mengajar</option>
                    <option value="organization">Organisasi</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1.5">Periode (mis: Jul - Des 2024)</label>
                  <input
                    type="text"
                    required
                    placeholder="Juli - Desember 2024"
                    value={editingExp.period || ""}
                    onChange={(e) => setEditingExp({ ...editingExp, period: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1.5">Instansi / Sekolah / Organisasi</label>
                <input
                  type="text"
                  required
                  placeholder="SMA Negeri 1 Palembang / Himpunan Mahasiswa Kimia"
                  value={editingExp.org || ""}
                  onChange={(e) => setEditingExp({ ...editingExp, org: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold mb-1.5">Peran / Jabatan (ID)</label>
                  <input
                    type="text"
                    required
                    placeholder="Guru PPL Kimia"
                    value={editingExp.title?.id || ""}
                    onChange={(e) =>
                      setEditingExp({
                        ...editingExp,
                        title: {
                          ...(editingExp.title || { id: "", en: "" }),
                          id: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1.5">Role / Position (EN)</label>
                  <input
                    type="text"
                    required
                    placeholder="Chemistry Teaching Intern"
                    value={editingExp.title?.en || ""}
                    onChange={(e) =>
                      setEditingExp({
                        ...editingExp,
                        title: {
                          ...(editingExp.title || { id: "", en: "" }),
                          en: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1.5">
                  Rincian Tugas / Prestasi (pisahkan dengan baris baru untuk setiap butir)
                </label>
                <textarea
                  rows={4}
                  placeholder="Merancang modul ajar dan praktikum kimia terintegrasi&#10;Melakukan pendampingan belajar bagi siswa berprestasi"
                  value={editingExp.points?.map((p) => p.id || p.en).join("\n") || ""}
                  onChange={(e) => {
                    const lines = e.target.value.split("\n").filter((l) => l.trim().length > 0);
                    setEditingExp({
                      ...editingExp,
                      points: lines.map((line) => ({ id: line.trim(), en: line.trim() })),
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block font-bold mb-1.5">Urutan</label>
                  <input
                    type="number"
                    value={editingExp.order || 1}
                    onChange={(e) =>
                      setEditingExp({ ...editingExp, order: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-bold text-center"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2.5 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={editingExp.isVisible ?? true}
                      onChange={(e) =>
                        setEditingExp({ ...editingExp, isVisible: e.target.checked })
                      }
                      className="rounded accent-[var(--color-brown)] w-4 h-4 cursor-pointer"
                    />
                    <span>Tampilkan di Publik</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-[var(--color-brown-light)]/20">
                <button
                  type="button"
                  onClick={() => setEditingExp(null)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "saveExp"}
                  className="px-5 py-2.5 rounded-xl bg-[var(--color-brown)] text-white font-bold hover:bg-[var(--color-brown-dark)] cursor-pointer shadow-md shadow-[var(--color-brown)]/20 flex items-center gap-2"
                >
                  {actionLoading === "saveExp" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Pengalaman</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════ MODAL: EDIT/CREATE SKILL GROUP ════════════════ */}
      {editingSkillGroup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/30 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--color-brown-light)]/20 mb-4">
              <h3 className="font-extrabold text-base">
                {editingSkillGroup._id ? "Edit Grup Keahlian" : "Tambah Grup Keahlian Baru"}
              </h3>
              <button
                onClick={() => setEditingSkillGroup(null)}
                className="p-1 rounded-lg hover:bg-[var(--color-brown-light)]/10 text-[var(--color-text-muted)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setActionLoading("saveSkillGroup");
                try {
                  if (editingSkillGroup._id) {
                    const updated = await api.admin.updateSkillGroup(
                      editingSkillGroup._id,
                      editingSkillGroup,
                    );
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
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold mb-1.5">Kategori Utama</label>
                <select
                  value={editingSkillGroup.category || "hard"}
                  onChange={(e) =>
                    setEditingSkillGroup({
                      ...editingSkillGroup,
                      category: e.target.value as SkillGroup["category"],
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-bold"
                >
                  <option value="hard">Hard Skills (Teknis & Pembelajaran)</option>
                  <option value="soft">Soft Skills (Interpersonal & Kepemimpinan)</option>
                  <option value="language">Bahasa (Language Proficiency)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1.5">Nama Grup (ID)</label>
                <input
                  type="text"
                  required
                  placeholder="Pedagogik & Kurikulum"
                  value={editingSkillGroup.label?.id || ""}
                  onChange={(e) =>
                    setEditingSkillGroup({
                      ...editingSkillGroup,
                      label: {
                        ...(editingSkillGroup.label || { id: "", en: "" }),
                        id: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1.5">Group Label (EN)</label>
                <input
                  type="text"
                  required
                  placeholder="Pedagogy & Curriculum"
                  value={editingSkillGroup.label?.en || ""}
                  onChange={(e) =>
                    setEditingSkillGroup({
                      ...editingSkillGroup,
                      label: {
                        ...(editingSkillGroup.label || { id: "", en: "" }),
                        en: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-[var(--color-brown-light)]/20">
                <button
                  type="button"
                  onClick={() => setEditingSkillGroup(null)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "saveSkillGroup"}
                  className="px-5 py-2.5 rounded-xl bg-[var(--color-brown)] text-white font-bold hover:bg-[var(--color-brown-dark)] cursor-pointer shadow-md shadow-[var(--color-brown)]/20 flex items-center gap-2"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/30 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-brown-light)]/20">
              <h3 className="font-extrabold text-base">
                {editingLetter._id ? "Edit Surat Rekomendasi" : "Tambah Surat Rekomendasi Baru"}
              </h3>
              <button
                onClick={() => setEditingLetter(null)}
                className="p-1 rounded-lg hover:bg-[var(--color-brown-light)]/10 text-[var(--color-text-muted)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLetter} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1.5">Judul Surat (ID)</label>
                <input
                  type="text"
                  required
                  placeholder="Surat Rekomendasi Dekan FKIP"
                  value={editingLetter.title?.id || ""}
                  onChange={(e) =>
                    setEditingLetter({
                      ...editingLetter,
                      title: {
                        ...(editingLetter.title || { id: "", en: "" }),
                        id: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1.5">Title (EN)</label>
                <input
                  type="text"
                  required
                  placeholder="Dean Recommendation Letter"
                  value={editingLetter.title?.en || ""}
                  onChange={(e) =>
                    setEditingLetter({
                      ...editingLetter,
                      title: {
                        ...(editingLetter.title || { id: "", en: "" }),
                        en: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold mb-1.5">Pemberi Rekomendasi (Issuer)</label>
                  <input
                    type="text"
                    required
                    placeholder="Prof. Dr. H. Hartono, M.A."
                    value={editingLetter.issuer || ""}
                    onChange={(e) =>
                      setEditingLetter({ ...editingLetter, issuer: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1.5">Tanggal Surat</label>
                  <input
                    type="text"
                    required
                    placeholder="25 September 2024"
                    value={editingLetter.date || ""}
                    onChange={(e) => setEditingLetter({ ...editingLetter, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1.5">
                  URL Gambar Halaman (pisahkan koma jika multi-halaman)
                </label>
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-mono text-[11px]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-[var(--color-brown-light)]/20">
                <button
                  type="button"
                  onClick={() => setEditingLetter(null)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "saveLetter"}
                  className="px-5 py-2.5 rounded-xl bg-[var(--color-brown)] text-white font-bold hover:bg-[var(--color-brown-dark)] cursor-pointer shadow-md shadow-[var(--color-brown)]/20 flex items-center gap-2"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--color-brown-light)]/20 mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[var(--color-brown)]" />
                <h3 className="font-extrabold text-base">Pesan dari {viewingContact.name}</h3>
              </div>
              <button
                onClick={() => setViewingContact(null)}
                className="p-1 rounded-lg hover:bg-[var(--color-brown-light)]/10 text-[var(--color-text-muted)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-[var(--color-cream-dark)]/40 p-3.5 rounded-2xl space-y-1.5 border border-[var(--color-brown-light)]/15">
                <p>
                  <span className="font-bold text-[var(--color-text-muted)]">Pengirim:</span>{" "}
                  <span className="font-semibold text-[var(--color-text-main)]">
                    {viewingContact.name}
                  </span>
                </p>
                <p>
                  <span className="font-bold text-[var(--color-text-muted)]">Email:</span>{" "}
                  <a
                    href={`mailto:${viewingContact.email}?subject=Re: ${encodeURIComponent(
                      viewingContact.subject,
                    )}`}
                    className="text-[var(--color-brown)] font-semibold underline"
                  >
                    {viewingContact.email}
                  </a>
                </p>
                <p>
                  <span className="font-bold text-[var(--color-text-muted)]">Tanggal Masuk:</span>{" "}
                  {new Date(viewingContact.createdAt).toLocaleString("id-ID")}
                </p>
                <p>
                  <span className="font-bold text-[var(--color-text-muted)]">Status:</span>{" "}
                  <span className="uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-[var(--color-brown)]/15 text-[var(--color-brown)]">
                    {viewingContact.status}
                  </span>
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-sm mb-1.5">{viewingContact.subject}</h4>
                <div className="p-4 rounded-2xl bg-[var(--color-cream-dark)]/25 border border-[var(--color-brown-light)]/20 whitespace-pre-wrap leading-relaxed">
                  {viewingContact.message}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[var(--color-brown-light)]/20">
                <button
                  onClick={() => handleDeleteContact(viewingContact._id)}
                  className="px-3.5 py-2 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus</span>
                </button>

                <div className="flex items-center gap-2">
                  {viewingContact.status !== "replied" && (
                    <button
                      onClick={() => handleMarkReplied(viewingContact._id)}
                      className="px-3.5 py-2 rounded-xl border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 font-bold cursor-pointer"
                    >
                      Tandai Dibalas
                    </button>
                  )}
                  <a
                    href={`mailto:${viewingContact.email}?subject=Re: ${encodeURIComponent(
                      viewingContact.subject,
                    )}`}
                    className="px-4 py-2 rounded-xl bg-[var(--color-brown)] text-white font-bold hover:bg-[var(--color-brown-dark)] cursor-pointer shadow-md shadow-[var(--color-brown)]/20 inline-flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Balas via Email</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ MODAL: GANTI PASSWORD ════════════════ */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--color-cream)] dark:bg-[var(--color-cream-dark)] border border-[var(--color-brown-light)]/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--color-brown-light)]/20 mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[var(--color-brown)]" />
                <h3 className="font-extrabold text-base">Ganti Password Admin</h3>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--color-brown-light)]/10 text-[var(--color-text-muted)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1.5">Password Saat Ini</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1.5">Password Baru</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1.5">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Ketik ulang password baru"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-brown-light)]/30 bg-[var(--color-cream-dark)]/20 outline-none focus:border-[var(--color-brown)] font-medium"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-[var(--color-brown-light)]/20">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-brown-light)]/30 hover:bg-[var(--color-brown)]/10 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "password"}
                  className="px-5 py-2 rounded-xl bg-[var(--color-brown)] text-white font-bold hover:bg-[var(--color-brown-dark)] cursor-pointer shadow-md shadow-[var(--color-brown)]/20 flex items-center gap-2"
                >
                  {actionLoading === "password" ? "Memperbarui..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Component: Empty State with Terminal Seed Hint ────────────────────────
function EmptyStateCard({
  title,
  description,
  onAdd,
  onCopySeed,
  copied,
}: {
  title: string;
  description: string;
  onAdd: () => void;
  onCopySeed: (text: string) => void;
  copied: boolean;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-[var(--color-brown-light)]/40 p-8 sm:p-12 text-center bg-[var(--color-cream-dark)]/20 flex flex-col items-center justify-center max-w-2xl mx-auto shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-brown)]/10 text-[var(--color-brown)] flex items-center justify-center mb-4">
        <Sparkles className="w-7 h-7" />
      </div>

      <h3 className="font-extrabold text-base sm:text-lg text-[var(--color-text-main)] mb-1">
        {title}
      </h3>
      <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-brown)] text-white text-xs font-bold hover:bg-[var(--color-brown-dark)] shadow-md shadow-[var(--color-brown)]/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Manual Pertama</span>
        </button>
      </div>

      {/* Terminal Seed Instruction Box */}
      <div className="w-full bg-[var(--color-cream-dark)]/50 dark:bg-black/30 border border-[var(--color-brown-light)]/25 rounded-2xl p-4 text-left">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--color-brown-light)]/20">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-brown)]">
            <Terminal className="w-4 h-4" />
            <span>Cara Seed Otomatis Lewat Terminal Container Backend:</span>
          </div>
          <button
            onClick={() => onCopySeed("node dist/seed.js")}
            className="text-[11px] font-bold text-[var(--color-brown)] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Perintah</span>
              </>
            )}
          </button>
        </div>
        <p className="text-[11px] text-[var(--color-text-muted)] mb-2 leading-relaxed">
          Buka menu <strong>Terminal</strong> pada container <strong>irma-backend</strong> di Mini VPS Panel, lalu ketik perintah berikut:
        </p>
        <div className="font-mono text-xs bg-black/80 text-emerald-400 p-2.5 rounded-xl flex items-center justify-between select-all">
          <span>node dist/seed.js</span>
          <span className="text-[10px] text-neutral-400 font-sans">Tekan Enter</span>
        </div>
      </div>
    </div>
  );
}
