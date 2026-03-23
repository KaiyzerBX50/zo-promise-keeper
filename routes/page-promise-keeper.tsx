import { useState, useEffect, useCallback, useRef } from "react";
import {
  Heart, Plus, CheckCircle, Clock, AlertCircle, Users, Zap, Send,
  ChevronDown, X, Edit3, Trash2, MessageSquare, Star, Calendar,
  RefreshCw, BookOpen, ArrowRight, Sun, Moon, Target, UserCheck, Filter,
  FileText, Copy, Check, LayoutGrid, GripVertical
} from "lucide-react";

const API = "/api/promise-keeper";

const CATEGORIES = ["Reply","Send","Do","Schedule","Buy","Check In","Deliver","Personal","Life Admin"];
const STATUSES = ["Inbox","Planned","On Track","Due Soon","Needs Attention","Waiting on Someone","Done","Dropped"];
const PRIORITIES = ["Low","Normal","Important","High"];
const EMOTIONAL_WEIGHTS = ["Light","Medium","Heavy"];
const RELATIONSHIP_TYPES = ["Friend","Family","Partner","Mentor","Client","Coworker","Collaborator","Other"];
const WARMTH_LEVELS = ["Cold","Steady","Warm","Close"];

const STATUS_COLORS: Record<string, string> = {
  "Inbox": "#CFE7FF",
  "Planned": "#CFE7FF",
  "On Track": "#B7F1D7",
  "Due Soon": "#FFD96A",
  "Needs Attention": "#FFB38A",
  "Waiting on Someone": "#CFE7FF",
  "Done": "#B7F1D7",
  "Dropped": "#F4EDE3",
};

const PRIORITY_COLORS: Record<string, string> = {
  "Low": "#CFE7FF",
  "Normal": "#B7F1D7",
  "Important": "#FFD96A",
  "High": "#FF8F7A",
};

const WARMTH_COLORS: Record<string, string> = {
  "Cold": "#CFE7FF",
  "Steady": "#B7F1D7",
  "Warm": "#FFD96A",
  "Close": "#FF8F7A",
};

const LIGHT = {
  bg: "linear-gradient(135deg, #FFE4D6 0%, #FFF9F2 40%, #FDF1B8 100%)",
  navBg: "#FFF9F2E6",
  navBorder: "#F4EDE3",
  cardBg: "rgba(255,255,255,0.8)",
  cardBorder: "rgba(244,237,227,0.6)",
  cardShadow: "0 2px 20px rgba(63,55,47,0.06)",
  cardHoverShadow: "0 4px 30px rgba(63,55,47,0.1)",
  textPrimary: "#3F372F",
  textSecondary: "#7D746B",
  accent: "#FF8F7A",
  accentLight: "#FFB38A",
  accentBg: "#FFB38A30",
  inputBg: "#FFF9F2",
  inputBorder: "#F4EDE3",
  chipBg: "#F4EDE3",
  modalBg: "#FFF9F2",
  modalOverlay: "rgba(0,0,0,0.2)",
  hoverBg: "rgba(255,255,255,0.6)",
  altRowBg: "#FFF9F2",
};

const DARK = {
  bg: "linear-gradient(135deg, #1A1520 0%, #1E1A24 40%, #1A1E20 100%)",
  navBg: "rgba(26,21,32,0.92)",
  navBorder: "#2D2535",
  cardBg: "rgba(35,30,42,0.85)",
  cardBorder: "rgba(55,48,65,0.6)",
  cardShadow: "0 2px 20px rgba(0,0,0,0.3)",
  cardHoverShadow: "0 4px 30px rgba(0,0,0,0.4)",
  textPrimary: "#F0EBE3",
  textSecondary: "#9B93A8",
  accent: "#FF8F7A",
  accentLight: "#FFB38A",
  accentBg: "rgba(255,143,122,0.15)",
  inputBg: "#2A2432",
  inputBorder: "#3D3548",
  chipBg: "#2D2535",
  modalBg: "#231E2A",
  modalOverlay: "rgba(0,0,0,0.5)",
  hoverBg: "rgba(255,255,255,0.05)",
  altRowBg: "#2A2432",
};

type Theme = typeof LIGHT;

function daysUntil(date: string) {
  if (!date) return Infinity;
  const d = new Date(date + "T00:00:00");
  const now = new Date();
  now.setHours(0,0,0,0);
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function StatusBadge({ status, dark }: { status: string; dark?: boolean }) {
  const bg = STATUS_COLORS[status] || "#F4EDE3";
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: dark ? bg + "40" : bg, color: dark ? "#F0EBE3" : "#3F372F" }}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority, dark }: { priority: string; dark?: boolean }) {
  const bg = PRIORITY_COLORS[priority] || "#F4EDE3";
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: dark ? bg + "40" : bg, color: dark ? "#F0EBE3" : "#3F372F" }}
    >
      {priority}
    </span>
  );
}

function Card({ children, className = "", onClick, theme }: { children: React.ReactNode; className?: string; onClick?: () => void; theme: Theme }) {
  return (
    <div
      onClick={onClick}
      className={`backdrop-blur-sm rounded-[24px] border p-6 ${onClick ? "cursor-pointer transition-shadow" : ""} ${className}`}
      style={{
        backgroundColor: theme.cardBg,
        borderColor: theme.cardBorder,
        boxShadow: theme.cardShadow,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle, action, theme }: { icon: any; title: string; subtitle?: string; action?: React.ReactNode; theme: Theme }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: theme.accentBg }}>
          <Icon size={20} style={{ color: theme.accent }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>{title}</h3>
          {subtitle && <p className="text-sm" style={{ color: theme.textSecondary }}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function EmptyState({ icon: Icon, message, theme }: { icon: any; message: string; theme: Theme }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: theme.accentBg }}>
        <Icon size={24} style={{ color: theme.accentLight }} />
      </div>
      <p className="text-sm" style={{ color: theme.textSecondary }}>{message}</p>
    </div>
  );
}

function SelectField({ label, value, onChange, options, theme }: { label: string; value: string; onChange: (v: string) => void; options: string[]; theme: Theme }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: theme.textSecondary }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
        style={{ borderColor: theme.inputBorder, color: theme.textPrimary, backgroundColor: theme.inputBg }}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, multiline, theme }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; theme: Theme }) {
  const props = {
    value,
    onChange: (e: any) => onChange(e.target.value),
    placeholder,
    className: "w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2",
    style: { borderColor: theme.inputBorder, color: theme.textPrimary, backgroundColor: theme.inputBg } as any,
  };
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: theme.textSecondary }}>{label}</label>
      {multiline ? <textarea {...props} rows={3} /> : <input type="text" {...props} />}
    </div>
  );
}

function DateField({ label, value, onChange, theme }: { label: string; value: string; onChange: (v: string) => void; theme: Theme }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: theme.textSecondary }}>{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
        style={{ borderColor: theme.inputBorder, color: theme.textPrimary, backgroundColor: theme.inputBg }}
      />
    </div>
  );
}

function Modal({ open, onClose, title, children, theme }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; theme: Theme }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: theme.modalOverlay }} />
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-[28px] shadow-xl p-6"
        style={{ backgroundColor: theme.modalBg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold" style={{ color: theme.textPrimary }}>{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5"><X size={18} style={{ color: theme.textSecondary }} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const MESSAGE_TEMPLATES = [
  { title: "I'm on it", body: "Hey — just wanted to let you know I haven't forgotten about this. I'm working on it and will have something for you soon. Thanks for your patience!" },
  { title: "I need a bit more time", body: "Hi — I wanted to be upfront that I need a little more time on this. I want to do it well rather than rush it. Would [new date] work for you?" },
  { title: "Here's the update", body: "Quick update for you — here's where things stand: [update]. Let me know if you have any questions or need anything adjusted." },
  { title: "Can we move this deadline?", body: "Hey — I want to be honest with you. I'm not going to make the original timeline on this. Could we adjust to [new date]? I want to make sure I deliver something solid." },
  { title: "I haven't forgotten", body: "Just a note to say — this is still on my radar. Life got busy but I haven't dropped it. I'll circle back with you by [date]. Thanks for understanding!" },
  { title: "Here's what I can do next", body: "I've been thinking about the best next step here. Here's what I'd suggest: [action]. Does that work for you, or would you prefer something different?" },
];

const ZO_PROMPTS = [
  { title: "Extract commitments from a note", prompt: "Find anything that sounds like I said I would do. Turn it into promise entries with a person, due date, and next action.", icon: FileText },
  { title: "Turn a conversation into follow-ups", prompt: "Pull out commitments, promised actions, check-ins, and anything someone may be waiting on.", icon: MessageSquare },
  { title: "What needs my attention this week?", prompt: "Review all open promises and show what is due soon, overdue, emotionally important, or easy to close.", icon: AlertCircle },
  { title: "Who is waiting on me?", prompt: "Show the people connected to open commitments and suggest the most important follow-ups.", icon: Users },
  { title: "Draft a kind accountability message", prompt: "Write a warm, honest update for a promise that is delayed or needs renegotiation.", icon: Heart },
  { title: "What can I close in 10 minutes?", prompt: "Find the easiest promises or replies I can complete right now.", icon: Zap },
  { title: "Run my weekly review", prompt: "Summarize what I promised, what I completed, what slipped, and what needs a response or reset.", icon: RefreshCw },
];

const TABS = [
  { id: "home", label: "Home", icon: Sun },
  { id: "capture", label: "Capture", icon: Plus },
  { id: "board", label: "Board", icon: LayoutGrid },
  { id: "promises", label: "Promises", icon: BookOpen },
  { id: "people", label: "People", icon: Users },
  { id: "waiting", label: "Waiting On", icon: Clock },
  { id: "week", label: "This Week", icon: Calendar },
  { id: "review", label: "Review", icon: RefreshCw },
  { id: "templates", label: "Templates", icon: MessageSquare },
];

export default function PromiseKeeper() {
  const [tab, setTab] = useState("home");
  const [data, setData] = useState<any>({ promises: [], people: [], openPromiseCounts: {} });
  const [loading, setLoading] = useState(true);
  const [showAddPromise, setShowAddPromise] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [editingPromise, setEditingPromise] = useState<any>(null);
  const [editingPerson, setEditingPerson] = useState<any>(null);
  const [promiseFilter, setPromiseFilter] = useState("All Open");
  const [copiedTemplate, setCopiedTemplate] = useState<number | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<number | null>(null);
  const [draggedPromise, setDraggedPromise] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [expandedMobileCol, setExpandedMobileCol] = useState<string | null>(null);
  const [showMoveForId, setShowMoveForId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("pk-dark") === "1"; } catch { return false; }
  });
  const T = darkMode ? DARK : LIGHT;

  useEffect(() => {
    try { localStorage.setItem("pk-dark", darkMode ? "1" : "0"); } catch {}
  }, [darkMode]);

  const fetchData = useCallback(async () => {
    try {
      const r = await fetch(API, { headers: { Accept: "application/json" } });
      const d = await r.json();
      setData(d);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const api = async (action: string, body: any) => {
    await fetch(`${API}?action=${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    fetchData();
  };

  const promises = data.promises || [];
  const people = data.people || [];
  const openPromises = promises.filter((p: any) => !["Done","Dropped"].includes(p.status));
  const dueThisWeek = openPromises.filter((p: any) => { const d = daysUntil(p.dueDate); return d >= 0 && d <= 7; });
  const needsAttention = openPromises.filter((p: any) => p.status === "Needs Attention" || daysUntil(p.dueDate) < 0);
  const quickWins = openPromises.filter((p: any) => p.priority === "Low" || p.emotionalWeight === "Light").slice(0, 5);
  const waitingOnMe = openPromises.filter((p: any) => p.status !== "Waiting on Someone");
  const waitingOnOthers = openPromises.filter((p: any) => p.status === "Waiting on Someone");
  const closedRecently = promises.filter((p: any) => p.status === "Done").slice(-5).reverse();
  const peopleWaiting = people.filter((p: any) => (data.openPromiseCounts?.[p.id] || 0) > 0);
  const overdue = openPromises.filter((p: any) => daysUntil(p.dueDate) < 0);

  const getMotivation = () => {
    const total = openPromises.length;
    const done = promises.filter((p: any) => p.status === "Done").length;
    if (total === 0 && done === 0) return "Your slate is clean. Capture something when you're ready.";
    if (total === 0) return "Everything is closed. Great follow-through! ☀️";
    if (needsAttention.length > 3) return "A few things need your care. Let's clear some open loops.";
    if (dueThisWeek.length > 0) return `${dueThisWeek.length} promise${dueThisWeek.length > 1 ? "s" : ""} due this week. You're close to closing these.`;
    return "Good momentum. Keep it going! ✨";
  };

  const filteredPromises = () => {
    switch (promiseFilter) {
      case "All Open": return openPromises;
      case "Due This Week": return dueThisWeek;
      case "Needs Attention": return needsAttention;
      case "Overdue": return overdue;
      case "Quick Wins": return quickWins;
      case "Waiting on Someone": return waitingOnOthers;
      case "Done This Month": {
        const now = new Date();
        return promises.filter((p: any) => p.status === "Done" && p.completedOn && new Date(p.completedOn).getMonth() === now.getMonth());
      }
      case "All": return promises;
      default: return openPromises;
    }
  };

  const PromiseForm = ({ initial, onSave, onClose }: { initial?: any; onSave: (d: any) => void; onClose: () => void }) => {
    const [form, setForm] = useState(initial || {
      promise: "", personName: "", personId: null, category: "Do", dueDate: "",
      status: "Inbox", priority: "Normal", source: "", nextAction: "",
      notes: "", emotionalWeight: "Light", datePromised: today(),
    });
    const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
    return (
      <div className="space-y-4">
        <TextField label="What did you promise?" value={form.promise} onChange={(v) => set("promise", v)} placeholder="I said I would…" theme={T} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField label="Who is it for?" value={form.personName} onChange={(v) => set("personName", v)} placeholder="Name" theme={T} />
          <SelectField label="Category" value={form.category} onChange={(v) => set("category", v)} options={CATEGORIES} theme={T} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DateField label="Date Promised" value={form.datePromised} onChange={(v) => set("datePromised", v)} theme={T} />
          <DateField label="Due Date" value={form.dueDate} onChange={(v) => set("dueDate", v)} theme={T} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SelectField label="Status" value={form.status} onChange={(v) => set("status", v)} options={STATUSES} theme={T} />
          <SelectField label="Priority" value={form.priority} onChange={(v) => set("priority", v)} options={PRIORITIES} theme={T} />
          <SelectField label="Weight" value={form.emotionalWeight} onChange={(v) => set("emotionalWeight", v)} options={EMOTIONAL_WEIGHTS} theme={T} />
        </div>
        <TextField label="Next Action" value={form.nextAction} onChange={(v) => set("nextAction", v)} placeholder="What's the first step?" theme={T} />
        <TextField label="Source" value={form.source} onChange={(v) => set("source", v)} placeholder="Where did this come from?" theme={T} />
        <TextField label="Notes" value={form.notes} onChange={(v) => set("notes", v)} multiline placeholder="Anything else to remember…" theme={T} />
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onSave(form)}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: T.accent }}
          >
            {initial?.id ? "Save Changes" : "Add Promise"}
          </button>
          <button onClick={onClose} className="px-6 py-3 rounded-2xl text-sm font-medium" style={{ color: T.textSecondary, backgroundColor: T.chipBg }}>Cancel</button>
        </div>
      </div>
    );
  };

  const PersonForm = ({ initial, onSave, onClose }: { initial?: any; onSave: (d: any) => void; onClose: () => void }) => {
    const [form, setForm] = useState(initial || {
      name: "", relationshipType: "Other", lastContact: "", needsFollowUp: false,
      importantNotes: "", preferredComm: "", importantDates: "", warmth: "Steady", nextTouchpoint: "",
    });
    const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
    return (
      <div className="space-y-4">
        <TextField label="Name" value={form.name} onChange={(v) => set("name", v)} placeholder="Who is this person?" theme={T} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectField label="Relationship" value={form.relationshipType} onChange={(v) => set("relationshipType", v)} options={RELATIONSHIP_TYPES} theme={T} />
          <SelectField label="Warmth" value={form.warmth} onChange={(v) => set("warmth", v)} options={WARMTH_LEVELS} theme={T} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DateField label="Last Contact" value={form.lastContact} onChange={(v) => set("lastContact", v)} theme={T} />
          <DateField label="Next Touchpoint" value={form.nextTouchpoint} onChange={(v) => set("nextTouchpoint", v)} theme={T} />
        </div>
        <TextField label="Preferred Communication" value={form.preferredComm} onChange={(v) => set("preferredComm", v)} placeholder="Text, email, call…" theme={T} />
        <TextField label="Important Dates" value={form.importantDates} onChange={(v) => set("importantDates", v)} placeholder="Birthday, anniversary…" theme={T} />
        <TextField label="Important Notes" value={form.importantNotes} onChange={(v) => set("importantNotes", v)} multiline placeholder="What to remember about this person…" theme={T} />
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.needsFollowUp} onChange={(e) => set("needsFollowUp", e.target.checked)} className="rounded" />
          <span className="text-sm" style={{ color: T.textPrimary }}>Needs follow-up</span>
        </label>
        <div className="flex gap-3 pt-2">
          <button onClick={() => onSave(form)} className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white" style={{ backgroundColor: T.accent }}>
            {initial?.id ? "Save Changes" : "Add Person"}
          </button>
          <button onClick={onClose} className="px-6 py-3 rounded-2xl text-sm font-medium" style={{ color: T.textSecondary, backgroundColor: T.chipBg }}>Cancel</button>
        </div>
      </div>
    );
  };

  const PromiseRow = ({ p }: { p: any }) => {
    const days = daysUntil(p.dueDate);
    const dueLabel = p.dueDate ? (days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : days <= 7 ? `${days}d` : formatDate(p.dueDate)) : "";
    return (
      <div className="flex items-start sm:items-center gap-3 py-3 px-3 sm:px-4 rounded-2xl transition-colors group" style={{ ["--hover-bg" as any]: T.hoverBg }}>
        <button
          onClick={() => api("update-promise", { id: p.id, status: p.status === "Done" ? "On Track" : "Done" })}
          className="shrink-0 mt-0.5 sm:mt-0"
        >
          {p.status === "Done"
            ? <CheckCircle size={22} style={{ color: "#B7F1D7" }} fill="#B7F1D7" />
            : <div className="w-[22px] h-[22px] rounded-full border-2" style={{ borderColor: T.inputBorder }} />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${p.status === "Done" ? "line-through opacity-50" : ""}`} style={{ color: T.textPrimary }}>{p.promise}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {p.personName && <span className="text-xs" style={{ color: T.textSecondary }}>→ {p.personName}</span>}
            {p.category && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: T.chipBg, color: T.textSecondary }}>{p.category}</span>}
            {dueLabel && <span className="text-xs" style={{ color: days < 0 ? "#FF8F7A" : days <= 2 ? "#FFB38A" : T.textSecondary }}>{dueLabel}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <StatusBadge status={p.status} dark={darkMode} />
          <PriorityBadge priority={p.priority} dark={darkMode} />
          <button onClick={() => setEditingPromise(p)} className="p-1.5 rounded-lg sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/5">
            <Edit3 size={14} style={{ color: T.textSecondary }} />
          </button>
          <button onClick={() => api("delete-promise", { id: p.id })} className="p-1.5 rounded-lg sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/5">
            <Trash2 size={14} style={{ color: T.accent }} />
          </button>
        </div>
      </div>
    );
  };

  const renderHome = () => (
    <div className="space-y-6">
      <div className="text-center py-6">
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: T.textPrimary }}>Zo Promise Keeper</h1>
        <p className="mt-2 text-lg" style={{ color: T.accent }}>Keep your word, calmly.</p>
        <p className="mt-1 text-sm" style={{ color: T.textSecondary }}>{getMotivation()}</p>
      </div>

      <div className="flex justify-center gap-3 flex-wrap">
        <button onClick={() => setShowAddPromise(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white" style={{ backgroundColor: T.accent }}>
          <Plus size={16} /> Add a promise
        </button>
        <button onClick={() => setTab("review")} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium border" style={{ borderColor: T.accentLight, color: T.accent }}>
          <RefreshCw size={16} /> Weekly review
        </button>
        <button onClick={() => setTab("templates")} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium border" style={{ borderColor: T.accentLight, color: T.accent }}>
          <Send size={16} /> Draft a follow-up
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card theme={T}>
          <SectionTitle icon={Plus} title="Quick Capture" subtitle="Add a commitment fast" theme={T} />
          <QuickCapture onAdd={(p: any) => { api("add-promise", p); }} />
        </Card>

        <Card theme={T}>
          <SectionTitle icon={Calendar} title="Due This Week" subtitle={`${dueThisWeek.length} promise${dueThisWeek.length !== 1 ? "s" : ""}`} theme={T} />
          {dueThisWeek.length === 0
            ? <EmptyState icon={CheckCircle} message="Nothing due this week. Nice!" theme={T} />
            : dueThisWeek.slice(0, 4).map((p: any) => <PromiseRow key={p.id} p={p} />)}
        </Card>

        <Card theme={T}>
          <SectionTitle icon={Users} title="People Waiting" subtitle={`${peopleWaiting.length} people`} theme={T} />
          {peopleWaiting.length === 0
            ? <EmptyState icon={UserCheck} message="No one is waiting. You're all caught up!" theme={T} />
            : peopleWaiting.slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: T.accentLight }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium" style={{ color: T.textPrimary }}>{p.name}</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: T.accentBg, color: T.textSecondary }}>
                  {data.openPromiseCounts?.[p.id] || 0} open
                </span>
              </div>
            ))}
        </Card>

        <Card theme={T}>
          <SectionTitle icon={AlertCircle} title="Needs Attention" subtitle="Promises needing care" theme={T} />
          {needsAttention.length === 0
            ? <EmptyState icon={Heart} message="Everything looks good. No items at risk." theme={T} />
            : needsAttention.slice(0, 4).map((p: any) => <PromiseRow key={p.id} p={p} />)}
        </Card>

        <Card theme={T}>
          <SectionTitle icon={Zap} title="Quick Wins" subtitle="Close these fast" theme={T} />
          {quickWins.length === 0
            ? <EmptyState icon={Star} message="No quick wins right now." theme={T} />
            : quickWins.slice(0, 4).map((p: any) => <PromiseRow key={p.id} p={p} />)}
        </Card>

        <Card theme={T}>
          <SectionTitle icon={Clock} title="Waiting on Others" subtitle="Blocked by someone else" theme={T} />
          {waitingOnOthers.length === 0
            ? <EmptyState icon={Clock} message="Nothing blocked. Clear path ahead." theme={T} />
            : waitingOnOthers.slice(0, 4).map((p: any) => <PromiseRow key={p.id} p={p} />)}
        </Card>

        <Card theme={T}>
          <SectionTitle icon={CheckCircle} title="Closed Recently" subtitle="You kept your word here" theme={T} />
          {closedRecently.length === 0
            ? <EmptyState icon={Sun} message="Close your first promise to see momentum here." theme={T} />
            : closedRecently.map((p: any) => <PromiseRow key={p.id} p={p} />)}
        </Card>

        <Card className="md:col-span-2" theme={T}>
          <SectionTitle icon={Target} title="Weekly Reflection" subtitle="Let's clear a few open loops" theme={T} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Open", value: openPromises.length, color: "#FFB38A" },
              { label: "Due Soon", value: dueThisWeek.length, color: "#FFD96A" },
              { label: "At Risk", value: needsAttention.length, color: "#FF8F7A" },
              { label: "Done", value: promises.filter((p: any) => p.status === "Done").length, color: "#B7F1D7" },
            ].map((s) => (
              <div key={s.label} className="text-center py-4 rounded-2xl" style={{ backgroundColor: s.color + "20" }}>
                <p className="text-3xl font-bold" style={{ color: T.textPrimary }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: T.textSecondary }}>{s.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const QuickCapture = ({ onAdd }: { onAdd: (p: any) => void }) => {
    const [text, setText] = useState("");
    const [person, setPerson] = useState("");
    const [due, setDue] = useState("");
    const [next, setNext] = useState("");
    const submit = () => {
      if (!text.trim()) return;
      onAdd({ promise: text, personName: person, dueDate: due, nextAction: next, status: "Inbox", priority: "Normal", category: "Do", emotionalWeight: "Light", datePromised: today() });
      setText(""); setPerson(""); setDue(""); setNext("");
    };
    return (
      <div className="space-y-3">
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="What did you say you'd do?" className="w-full px-4 py-3 rounded-2xl border text-sm" style={{ borderColor: T.inputBorder, backgroundColor: T.inputBg, color: T.textPrimary }} onKeyDown={(e) => e.key === "Enter" && submit()} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input type="text" value={person} onChange={(e) => setPerson(e.target.value)} placeholder="Who for?" className="px-3 py-2 rounded-xl border text-xs" style={{ borderColor: T.inputBorder, backgroundColor: T.inputBg, color: T.textPrimary }} />
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="px-3 py-2 rounded-xl border text-xs" style={{ borderColor: T.inputBorder, backgroundColor: T.inputBg, color: T.textPrimary }} />
          <input type="text" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Next step?" className="px-3 py-2 rounded-xl border text-xs" style={{ borderColor: T.inputBorder, backgroundColor: T.inputBg, color: T.textPrimary }} />
        </div>
        <button onClick={submit} className="w-full py-2.5 rounded-2xl text-sm font-semibold text-white" style={{ backgroundColor: T.accent }}>Capture</button>
      </div>
    );
  };

  const renderCapture = () => (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold" style={{ color: T.textPrimary }}>Quick Capture</h2>
        <p className="text-sm mt-1" style={{ color: T.textSecondary }}>Capture a commitment in under 20 seconds.</p>
      </div>
      <Card theme={T}>
        <PromiseForm
          onSave={(d) => { api("add-promise", d); setTab("home"); }}
          onClose={() => setTab("home")}
        />
      </Card>
      <Card theme={T}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: T.textSecondary }}>Capture types</h3>
        <div className="flex flex-wrap gap-2">
          {["Promises","Follow-ups","Replies","Favors","Errands","Things to send","Things to schedule","Check-ins","Life admin"].map((t) => (
            <span key={t} className="px-3 py-1.5 rounded-full text-xs" style={{ backgroundColor: T.accentBg, color: T.accent }}>{t}</span>
          ))}
        </div>
      </Card>
    </div>
  );

  const PROMISE_FILTERS = ["All Open","Due This Week","Needs Attention","Overdue","Quick Wins","Waiting on Someone","Done This Month","All"];

  const renderPromises = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: T.textPrimary }}>Promises</h2>
          <p className="text-sm" style={{ color: T.textSecondary }}>{filteredPromises().length} promises in view</p>
        </div>
        <button onClick={() => setShowAddPromise(true)} className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold text-white" style={{ backgroundColor: T.accent }}>
          <Plus size={16} /> Add
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {PROMISE_FILTERS.map((f) => (
          <button key={f} onClick={() => setPromiseFilter(f)} className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors" style={{ backgroundColor: promiseFilter === f ? T.accent : T.chipBg, color: promiseFilter === f ? "#fff" : T.textSecondary }}>
            {f}
          </button>
        ))}
      </div>
      <Card theme={T}>
        {filteredPromises().length === 0
          ? <EmptyState icon={BookOpen} message="No promises match this filter." theme={T} />
          : filteredPromises().map((p: any) => <PromiseRow key={p.id} p={p} />)}
      </Card>
    </div>
  );

  const renderPeople = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: T.textPrimary }}>People</h2>
          <p className="text-sm" style={{ color: T.textSecondary }}>Your relationship context</p>
        </div>
        <button onClick={() => setShowAddPerson(true)} className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold text-white" style={{ backgroundColor: T.accent }}>
          <Plus size={16} /> Add
        </button>
      </div>
      {people.length === 0
        ? <Card theme={T}><EmptyState icon={Users} message="Add people to connect promises to relationships." theme={T} /></Card>
        : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {people.map((p: any) => (
            <Card key={p.id} theme={T}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white" style={{ backgroundColor: T.accentLight }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: T.textPrimary }}>{p.name}</h3>
                    <p className="text-xs" style={{ color: T.textSecondary }}>{p.relationshipType}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: WARMTH_COLORS[p.warmth] + "40", color: T.textPrimary }}>{p.warmth}</span>
                  <button onClick={() => setEditingPerson(p)} className="p-1 rounded-lg hover:bg-black/5"><Edit3 size={14} style={{ color: T.textSecondary }} /></button>
                  <button onClick={() => api("delete-person", { id: p.id })} className="p-1 rounded-lg hover:bg-black/5"><Trash2 size={14} style={{ color: T.accent }} /></button>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                {p.lastContact && <p className="text-xs" style={{ color: T.textSecondary }}>Last contact: {formatDate(p.lastContact)}</p>}
                {p.preferredComm && <p className="text-xs" style={{ color: T.textSecondary }}>Prefers: {p.preferredComm}</p>}
                {p.importantNotes && <p className="text-xs mt-2" style={{ color: T.textSecondary }}>{p.importantNotes}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: T.accentBg, color: T.textSecondary }}>
                    {data.openPromiseCounts?.[p.id] || 0} open promises
                  </span>
                  {p.needsFollowUp && <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: T.accentBg, color: T.accent }}>Needs follow-up</span>}
                </div>
              </div>
            </Card>
          ))}
        </div>}
    </div>
  );

  const renderWaiting = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: T.textPrimary }}>Waiting On</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card theme={T}>
          <SectionTitle icon={Target} title="Waiting on Me" subtitle={`${waitingOnMe.length} things I still need to do`} theme={T} />
          {waitingOnMe.length === 0
            ? <EmptyState icon={CheckCircle} message="Nothing waiting on you. Clean slate!" theme={T} />
            : waitingOnMe.slice(0, 10).map((p: any) => <PromiseRow key={p.id} p={p} />)}
        </Card>
        <Card theme={T}>
          <SectionTitle icon={Clock} title="Waiting on Others" subtitle={`${waitingOnOthers.length} things blocked by someone else`} theme={T} />
          {waitingOnOthers.length === 0
            ? <EmptyState icon={Clock} message="Nothing blocked. All clear." theme={T} />
            : waitingOnOthers.map((p: any) => <PromiseRow key={p.id} p={p} />)}
        </Card>
      </div>
    </div>
  );

  const reviewQuestions = [
    "What did I promise this week?",
    "What still needs my follow-through?",
    "Who is waiting on me?",
    "What is overdue and still worth doing?",
    "What can I close quickly?",
    "What needs a message, not just a task?",
    "What should I deliberately drop or renegotiate?",
  ];

  const renderReview = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold" style={{ color: T.textPrimary }}>Weekly Review</h2>
        <p className="text-sm mt-1" style={{ color: T.textSecondary }}>Encouraging, practical, honest, light.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open Loops", value: openPromises.length, color: "#FFB38A" },
          { label: "Due Soon", value: dueThisWeek.length, color: "#FFD96A" },
          { label: "At Risk", value: needsAttention.length, color: "#FF8F7A" },
          { label: "Closed", value: closedRecently.length, color: "#B7F1D7" },
        ].map((s) => (
          <Card key={s.label} theme={T}>
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: T.textSecondary }}>{s.label}</p>
            </div>
          </Card>
        ))}
      </div>
      <Card theme={T}>
        <SectionTitle icon={RefreshCw} title="Review Prompts" subtitle="Walk through these gently" theme={T} />
        <div className="space-y-3">
          {reviewQuestions.map((q, i) => (
            <div key={i} className="flex items-start gap-3 py-3 px-4 rounded-2xl" style={{ backgroundColor: i % 2 === 0 ? T.altRowBg : "transparent" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "#FFB38A30", color: "#FF8F7A" }}>{i + 1}</div>
              <p className="text-sm" style={{ color: T.textPrimary }}>{q}</p>
            </div>
          ))}
        </div>
      </Card>
      {overdue.length > 0 && (
        <Card theme={T}>
          <SectionTitle icon={AlertCircle} title="Open loops needing care" subtitle="These may need a reset or a message" theme={T} />
          {overdue.map((p: any) => <PromiseRow key={p.id} p={p} />)}
        </Card>
      )}
      {dueThisWeek.length > 0 && (
        <Card theme={T}>
          <SectionTitle icon={Calendar} title="You're close to closing these" theme={T} />
          {dueThisWeek.map((p: any) => <PromiseRow key={p.id} p={p} />)}
        </Card>
      )}
    </div>
  );

  const renderTemplates = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold" style={{ color: T.textPrimary }}>Message Templates</h2>
        <p className="text-sm mt-1" style={{ color: T.textSecondary }}>Warm, concise, and accountability-friendly.</p>
      </div>
      <div className="space-y-4">
        {MESSAGE_TEMPLATES.map((t, i) => (
          <Card key={i} theme={T}>
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-sm" style={{ color: T.textPrimary }}>"{t.title}"</h3>
              <button
                onClick={() => { navigator.clipboard.writeText(t.body); setCopiedTemplate(i); setTimeout(() => setCopiedTemplate(null), 2000); }}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: T.accentBg, color: T.accent }}
              >
                {copiedTemplate === i ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: T.textSecondary }}>{t.body}</p>
          </Card>
        ))}
      </div>

      <div className="pt-4">
        <h3 className="text-xl font-bold mb-4" style={{ color: T.textPrimary }}>Saved Zo Prompts</h3>
        <div className="space-y-4">
          {ZO_PROMPTS.map((p, i) => (
            <Card key={i} theme={T}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: T.accentBg }}>
                  <p.icon size={18} style={{ color: T.accent }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm" style={{ color: T.textPrimary }}>{p.title}</h4>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: T.textSecondary }}>{p.prompt}</p>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(p.prompt); setCopiedPrompt(i); setTimeout(() => setCopiedPrompt(null), 2000); }}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium shrink-0" style={{ backgroundColor: T.accentBg, color: T.accent }}
                >
                  {copiedPrompt === i ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderWeek = () => {
    const dueSoon = openPromises.filter((p: any) => { const d = daysUntil(p.dueDate); return d >= 0 && d <= 7; });
    const followUps = openPromises.filter((p: any) => p.category === "Reply" || p.category === "Send");
    const lifeAdmin = openPromises.filter((p: any) => p.category === "Life Admin" || p.category === "Personal");
    const topOne = dueSoon.length > 0 ? dueSoon.sort((a: any, b: any) => daysUntil(a.dueDate) - daysUntil(b.dueDate))[0] : null;
    return (
      <div className="space-y-5">
        <h2 className="text-2xl font-bold" style={{ color: T.textPrimary }}>This Week</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card theme={T}>
            <SectionTitle icon={Calendar} title="Due in 7 Days" subtitle={`${dueSoon.length} promises`} theme={T} />
            {dueSoon.length === 0 ? <EmptyState icon={CheckCircle} message="Nothing due this week." theme={T} /> : dueSoon.slice(0, 5).map((p: any) => <PromiseRow key={p.id} p={p} />)}
          </Card>
          <Card theme={T}>
            <SectionTitle icon={AlertCircle} title="Overdue / At Risk" subtitle={`${overdue.length} items`} theme={T} />
            {overdue.length === 0 ? <EmptyState icon={Heart} message="Nothing overdue. Great care!" theme={T} /> : overdue.slice(0, 5).map((p: any) => <PromiseRow key={p.id} p={p} />)}
          </Card>
          <Card theme={T}>
            <SectionTitle icon={Send} title="Follow-Ups to Send" subtitle={`${followUps.length} replies & sends`} theme={T} />
            {followUps.length === 0 ? <EmptyState icon={Send} message="No follow-ups pending." theme={T} /> : followUps.slice(0, 5).map((p: any) => <PromiseRow key={p.id} p={p} />)}
          </Card>
          <Card theme={T}>
            <SectionTitle icon={Zap} title="Quick Wins" subtitle="Under 10 minutes" theme={T} />
            {quickWins.length === 0 ? <EmptyState icon={Zap} message="No quick wins right now." theme={T} /> : quickWins.slice(0, 5).map((p: any) => <PromiseRow key={p.id} p={p} />)}
          </Card>
          <Card theme={T}>
            <SectionTitle icon={Users} title="People to Reply To" subtitle={`${peopleWaiting.length} people`} theme={T} />
            {peopleWaiting.length === 0 ? <EmptyState icon={UserCheck} message="No one waiting." theme={T} /> : peopleWaiting.slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center gap-2 py-2 px-3 rounded-xl">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: T.accentLight }}>{p.name.charAt(0)}</div>
                <span className="text-sm" style={{ color: T.textPrimary }}>{p.name}</span>
              </div>
            ))}
          </Card>
          <Card theme={T}>
            <SectionTitle icon={Star} title="Life Admin" subtitle={`${lifeAdmin.length} items`} theme={T} />
            {lifeAdmin.length === 0 ? <EmptyState icon={Star} message="Life admin is clear." theme={T} /> : lifeAdmin.slice(0, 5).map((p: any) => <PromiseRow key={p.id} p={p} />)}
          </Card>
          {topOne && (
            <Card className="md:col-span-2 lg:col-span-3" theme={T}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: T.accentBg }}>
                  <ArrowRight size={20} style={{ color: T.accent }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: T.textPrimary }}>One promise to close today</p>
                  <p className="text-sm" style={{ color: T.textSecondary }}>{topOne.promise}{topOne.personName ? ` → ${topOne.personName}` : ""}</p>
                </div>
                <button onClick={() => api("update-promise", { id: topOne.id, status: "Done" })} className="ml-auto px-4 py-2 rounded-2xl text-xs font-semibold text-white" style={{ backgroundColor: T.accent }}>Mark Done</button>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  };

  const renderBoard = () => {
    const boardStatuses = ["Inbox","Planned","On Track","Due Soon","Needs Attention","Waiting on Someone","Done","Dropped"];
    const handleDragStart = (e: React.DragEvent, promiseId: string) => { e.dataTransfer.setData("text/plain", promiseId); e.dataTransfer.effectAllowed = "move"; setDraggedPromise(promiseId); };
    const handleDragOver = (e: React.DragEvent, status: string) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverColumn(status); };
    const handleDragLeave = (e: React.DragEvent) => { const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); const { clientX, clientY } = e; if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) { setDragOverColumn(null); } };
    const handleDrop = (e: React.DragEvent, status: string) => { e.preventDefault(); const promiseId = e.dataTransfer.getData("text/plain"); if (promiseId) { const p = promises.find((pr: any) => pr.id === promiseId); if (p && p.status !== status) { api("update-promise", { id: promiseId, status }); } } setDraggedPromise(null); setDragOverColumn(null); };
    const handleDragEnd = () => { setDraggedPromise(null); setDragOverColumn(null); };

    const MobileStatusMove = ({ p }: { p: any }) => (
      <div className="flex flex-wrap gap-1 mt-2">
        {boardStatuses.filter(s => s !== p.status).map(s => (
          <button key={s} onClick={() => api("update-promise", { id: p.id, status: s })} className="px-2 py-0.5 rounded-full text-[10px] font-medium border" style={{ borderColor: T.inputBorder, color: T.textSecondary }}>\u2192 {s}</button>
        ))}
      </div>
    );

    const BoardCard = ({ p, status }: { p: any; status: string }) => {
      const days = daysUntil(p.dueDate);
      const dueLabel = p.dueDate ? (days < 0 ? \`\${Math.abs(days)}d overdue\` : days === 0 ? "Today" : \`\${days}d\`) : "";
      const isDragging = draggedPromise === p.id;
      const showMove = showMoveForId === p.id;
      return (
        <div key={p.id} draggable onDragStart={(e) => handleDragStart(e, p.id)} onDragEnd={handleDragEnd} className="p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all duration-150 group" style={{ backgroundColor: isDragging ? T.accentBg : T.inputBg, borderColor: isDragging ? T.accent : T.inputBorder, opacity: isDragging ? 0.4 : 1, transform: isDragging ? "scale(0.95)" : "scale(1)" }}>
          <div className="flex items-start gap-2">
            <GripVertical size={14} className="shrink-0 mt-0.5 opacity-30 group-hover:opacity-60 transition-opacity hidden sm:block" style={{ color: T.textSecondary }} />
            <div className="flex-1 min-w-0">
              <p className={\`text-sm font-medium leading-snug \${status === "Done" ? "line-through opacity-50" : ""}\`} style={{ color: T.textPrimary }}>{p.promise}</p>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {p.personName && <span className="text-[11px]" style={{ color: T.textSecondary }}>\u2192 {p.personName}</span>}
                <PriorityBadge priority={p.priority} dark={darkMode} />
                {dueLabel && <span className="text-[11px] font-medium" style={{ color: days < 0 ? "#FF8F7A" : days <= 2 ? "#FFB38A" : T.textSecondary }}>{dueLabel}</span>}
              </div>
              {p.nextAction && <p className="text-[11px] mt-1 truncate" style={{ color: T.textSecondary }}>\u2192 {p.nextAction}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <button onClick={(e) => { e.stopPropagation(); setEditingPromise(p); }} className="p-1 rounded-lg" style={{ backgroundColor: T.chipBg }}><Edit3 size={11} style={{ color: T.textSecondary }} /></button>
            {status !== "Done" && <button onClick={(e) => { e.stopPropagation(); api("update-promise", { id: p.id, status: "Done" }); }} className="p-1 rounded-lg" style={{ backgroundColor: T.chipBg }}><CheckCircle size={11} style={{ color: "#B7F1D7" }} /></button>}
            <button onClick={(e) => { e.stopPropagation(); api("delete-promise", { id: p.id }); }} className="p-1 rounded-lg" style={{ backgroundColor: T.chipBg }}><Trash2 size={11} style={{ color: T.accent }} /></button>
            <button onClick={(e) => { e.stopPropagation(); setShowMoveForId(showMove ? null : p.id); }} className="p-1 rounded-lg sm:hidden ml-auto" style={{ backgroundColor: T.chipBg }}><ArrowRight size={11} style={{ color: T.accent }} /></button>
          </div>
          {showMove && <MobileStatusMove p={p} />}
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold" style={{ color: T.textPrimary }}>Board</h2><p className="text-sm" style={{ color: T.textSecondary }}>Drag promises between statuses</p></div><button onClick={() => setShowAddPromise(true)} className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold text-white" style={{ backgroundColor: T.accent }}><Plus size={16} /> Add</button></div>
        <div className="hidden sm:block overflow-x-auto pb-4 -mx-4 px-4"><div className="flex gap-3" style={{ minWidth: \`\${boardStatuses.length * 272}px\` }}>{boardStatuses.map((status) => { const columnPromises = promises.filter((p: any) => p.status === status); const statusColor = STATUS_COLORS[status] || "#F4EDE3"; const isOver = dragOverColumn === status; return (<div key={status} className="flex-1 min-w-[256px] rounded-2xl border flex flex-col transition-all duration-150" style={{ backgroundColor: isOver ? (darkMode ? "rgba(255,143,122,0.08)" : "rgba(255,143,122,0.06)") : T.cardBg, borderColor: isOver ? T.accent : T.cardBorder, boxShadow: isOver ? \`0 0 0 1px \${T.accent}40\` : "none" }} onDragOver={(e) => handleDragOver(e, status)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, status)}><div className="px-3 py-2.5 border-b" style={{ borderColor: T.cardBorder }}><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor }} /><span className="text-xs font-semibold" style={{ color: T.textPrimary }}>{status}</span></div><span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: T.chipBg, color: T.textSecondary }}>{columnPromises.length}</span></div><div className="p-2 flex-1 space-y-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>{columnPromises.length === 0 ? (<div className="py-10 text-center rounded-xl border-2 border-dashed" style={{ borderColor: isOver ? T.accent : T.inputBorder }}><p className="text-xs" style={{ color: T.textSecondary }}>{isOver ? "Drop here" : "Empty"}</p></div>) : (columnPromises.map((p: any) => <BoardCard key={p.id} p={p} status={status} />))}</div></div>); })}</div></div>
        <div className="sm:hidden space-y-2">{boardStatuses.map((status) => { const columnPromises = promises.filter((p: any) => p.status === status); const statusColor = STATUS_COLORS[status] || "#F4EDE3"; const isExpanded = expandedMobileCol === status; return (<div key={status} className="rounded-2xl border overflow-hidden" style={{ backgroundColor: T.cardBg, borderColor: T.cardBorder }}><button onClick={() => setExpandedMobileCol(isExpanded ? null : status)} className="w-full flex items-center justify-between px-4 py-3"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor }} /><span className="text-sm font-semibold" style={{ color: T.textPrimary }}>{status}</span><span className="text-[11px] px-2 py-1 rounded-full font-medium" style={{ backgroundColor: T.chipBg, color: T.textSecondary }}>{columnPromises.length}</span></div><ChevronDown size={16} style={{ color: T.textSecondary, transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} /></button>{isExpanded && (<div className="px-3 pb-3 space-y-2">{columnPromises.length === 0 ? (<p className="text-xs text-center py-4" style={{ color: T.textSecondary }}>No promises here</p>) : (columnPromises.map((p: any) => <BoardCard key={p.id} p={p} status={status} />))}</div>)}</div>); })}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: T.bg }}>
        <div className="animate-pulse text-center">
          <Sun size={40} style={{ color: T.accentLight }} className="mx-auto mb-3" />
          <p style={{ color: T.textSecondary }}>Loading your promises…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: T.bg }}>
      <nav className="sticky top-0 z-40 backdrop-blur-md border-b" style={{ backgroundColor: T.navBg, borderColor: T.navBorder }}>
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors"
              style={{
                backgroundColor: tab === t.id ? T.accent : "transparent",
                color: tab === t.id ? "#fff" : T.textSecondary,
              }}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
            style={{ color: T.textSecondary }}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {tab === "home" && renderHome()}
        {tab === "capture" && renderCapture()}
        {tab === "board" && renderBoard()}
        {tab === "promises" && renderPromises()}
        {tab === "people" && renderPeople()}
        {tab === "waiting" && renderWaiting()}
        {tab === "week" && renderWeek()}
        {tab === "review" && renderReview()}
        {tab === "templates" && renderTemplates()}
      </main>

      <Modal open={showAddPromise} onClose={() => setShowAddPromise(false)} title="Add a Promise" theme={T}>
        <PromiseForm onSave={(d) => { api("add-promise", d); setShowAddPromise(false); }} onClose={() => setShowAddPromise(false)} />
      </Modal>
      <Modal open={showAddPerson} onClose={() => setShowAddPerson(false)} title="Add a Person" theme={T}>
        <PersonForm onSave={(d) => { api("add-person", d); setShowAddPerson(false); }} onClose={() => setShowAddPerson(false)} />
      </Modal>
      <Modal open={!!editingPromise} onClose={() => setEditingPromise(null)} title="Edit Promise" theme={T}>
        {editingPromise && <PromiseForm initial={editingPromise} onSave={(d) => { api("update-promise", { ...d, id: editingPromise.id }); setEditingPromise(null); }} onClose={() => setEditingPromise(null)} />}
      </Modal>
      <Modal open={!!editingPerson} onClose={() => setEditingPerson(null)} title="Edit Person" theme={T}>
        {editingPerson && <PersonForm initial={editingPerson} onSave={(d) => { api("update-person", { ...d, id: editingPerson.id }); setEditingPerson(null); }} onClose={() => setEditingPerson(null)} />}
      </Modal>
    </div>
  );
}
