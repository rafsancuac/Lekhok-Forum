'use client'

/**
 * Task 43 — অভিযোগ-রিভিউ ডেস্ক (/admin/support/reports)
 *
 * ম্যানেজার (admin/super_admin) বা নির্বাচিত সাপোর্ট-অ্যাডমিন:
 *   • স্টেটাস-ট্যাব: PENDING / IN_PROGRESS / RESOLVED (লাইভ-কাউন্টসহ)
 *   • অভিযোগ-কার্ড: প্রেরক + সময় + লেখা + মিডিয়া-প্রিভিউ (ছবি/অডিও/ভিডিও)
 *   • অ্যাকশন: স্টেটাস-পরিবর্তন + অ্যাডমিন-নোট (সেভ)
 * session202 — অ্যাওয়্যারনেস-প্যাক:
 *   • CSV-এক্সপোর্ট (UTF-8 BOM, বাংলা-হেডার, RFC-4180-escape)
 *   • স্টেটাস-রঙা বাম-অ্যাকসেন্ট বর্ডার + প্রেরক-অ্যাভাটার (ডিটারমিনিস্টিক রঙ)
 *   • বাংলা আপেক্ষিক-সময় (টাইটেলে পূর্ণ-স্ট্যাম্প) + লেখা-কপি বাটন
 *   • ছবি-লাইটবক্স (Esc/ব্যাকড্রপ-বন্ধ) + শীল্ড ইম্পটি-স্টেট
 *   • আপডেটে 'lf:support-changed' ডিসপ্যাচ → সাইডবার/ড্যাশবোর্ড ব্যাজ তাৎক্ষণিক
 * session207 — অ্যানালিটিক্স + ফিল্টার-ডেপথ প্যাক:
 *   • পরিসংখ্যান মিনি-কার্ড ×৪ (মোট/নতুন/চলমান/সমাধান — ক্লিকে ট্যাব-সুইচ, শেয়ার-বার)
 *   • তারিখ-সীমা চিপ (আজ/৭ দিন/৩০ দিন) + ক্রম-টগল (সাম্প্রতক↔পুরাতন)
 *   • CSV এখন বর্তমান-ফিল্টার-অনুযায়ী রপ্তানি (Task57-প্রস্তাব-④)
 *   • "/" কীবোর্ড-শর্টকাটে অনুসন্ধান-ফোকাস
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowDownWideNarrow,
  CalendarDays,
  Check,
  CheckCircle2,
  Copy,
  Download,
  History,
  Hourglass,
  Inbox,
  Image as ImageIcon,
  Loader2,
  Mic,
  Pencil,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Video,
  X,
  XCircle,
} from 'lucide-react'
import AdminGate, { useAdminGate } from '@/components/admin/AdminGate'
import { bn } from '@/lib/format'

type Status = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'

interface Report {
  id: string
  senderId: string
  senderName: string
  senderEmail: string | null
  messageText: string
  mediaType: string // TEXT | IMAGE | AUDIO | VIDEO
  mediaUrl: string | null
  status: Status
  adminNote: string | null
  noteHistory?: string | null
  createdAt: string
}

/** session205 (Task 56) — অ্যাকশন-ইতিহাস-এন্ট্রি (noteHistory JSON থেকে);
 *  session208 — নোট-এন্ট্রিতে সম্পাদনা-মেটাডেটা (editedAt/editedBy/editedByRole) ঐচ্ছিক */
interface HistoryEntry {
  t: 'note' | 'status'
  note?: string
  from?: string
  to?: string
  at: string
  by?: string
  byRole?: string
  editedAt?: string
  editedBy?: string
  editedByRole?: string
}

/** noteHistory JSON-পার্স — করাপ্ট/অবৈধ হলে খালি-অ্যারে (নিরাপদ) */
function parseHistory(raw: string | null | undefined): HistoryEntry[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.filter((e) => e && (e.t === 'note' || e.t === 'status')) as HistoryEntry[]
  } catch {
    return []
  }
}

const TABS: { key: Status; label: string; cls: string }[] = [
  { key: 'PENDING', label: 'নতুন অভিযোগ', cls: 'bg-amber-500' },
  { key: 'IN_PROGRESS', label: 'চলমান', cls: 'bg-sky-600' },
  { key: 'RESOLVED', label: 'সমাধান', cls: 'bg-emerald-600' },
]

const STATUS_LABEL: Record<Status, string> = {
  PENDING: 'নতুন',
  IN_PROGRESS: 'চলমান',
  RESOLVED: 'সমাধান',
}

/** session206 (Task 57) — মিডিয়া-টাইপ ফিল্টার-চিপ */
const MEDIA_FILTERS: { key: string; label: string }[] = [
  { key: 'ALL', label: 'সব মিডিয়া' },
  { key: 'TEXT', label: 'লেখা' },
  { key: 'IMAGE', label: 'ছবি' },
  { key: 'AUDIO', label: 'অডিও' },
  { key: 'VIDEO', label: 'ভিডিও' },
]
const MEDIA_FILTER_ICON: Record<string, React.ReactNode> = {
  TEXT: null,
  IMAGE: <ImageIcon className="w-3 h-3" aria-hidden />,
  AUDIO: <Mic className="w-3 h-3" aria-hidden />,
  VIDEO: <Video className="w-3 h-3" aria-hidden />,
}

/** session207 — তারিখ-সীমা ফিল্টার (ক্লায়েন্ট-সাইড, API-বদল-শূন্য) */
const DATE_RANGES: { key: string; label: string }[] = [
  { key: 'ALL', label: 'সব-সময়' },
  { key: 'TODAY', label: 'আজ' },
  { key: '7D', label: '৭ দিন' },
  { key: '30D', label: '৩০ দিন' },
]
function dateCutoff(key: string): number | null {
  if (key === 'TODAY') {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }
  if (key === '7D') return Date.now() - 7 * 864e5
  if (key === '30D') return Date.now() - 30 * 864e5
  return null
}

/** session207 — পরিসংখ্যান-কার্ডের রঙ (ট্যাব-রঙের সাথে সমস্বর) */
const STAT_TONE: Record<Status, { tBorder: string; bar: string; text: string }> = {
  PENDING: { tBorder: 'border-t-amber-500', bar: 'bg-amber-500', text: 'text-amber-700' },
  IN_PROGRESS: { tBorder: 'border-t-sky-600', bar: 'bg-sky-600', text: 'text-sky-700' },
  RESOLVED: { tBorder: 'border-t-emerald-600', bar: 'bg-emerald-600', text: 'text-emerald-700' },
}

/** session202 — স্টেটাস-ভিত্তিক বাম-অ্যাকসেন্ট বর্ডার (কার্ডে এক-নজরে স্টেটাস) */
const ACCENT: Record<Status, string> = {
  PENDING: 'border-l-amber-500',
  IN_PROGRESS: 'border-l-sky-600',
  RESOLVED: 'border-l-emerald-600',
}

/** session202 — প্রেরক-অ্যাভাটারের ডিটারমিনিস্টিক রঙ (নাম-হ্যাশ → ফিক্সড প্যালেট) */
const AVATAR_COLORS = ['#006A4E', '#7C3AED', '#B45309', '#0E7490', '#BE185D', '#4D7C0F', '#DC2626', '#0369A1']
function avatarColorFor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

/** বাংলা আপেক্ষিক-সময় — এখনই / X মিনিট আগে / X ঘণ্টা আগে / X দিন আগে / তারিখ */
function relTimeBn(iso: string): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const m = Math.floor((Date.now() - t) / 60000)
  if (m < 1) return 'এখনই'
  if (m < 60) return `${bn(m)} মিনিট আগে`
  const h = Math.floor(m / 60)
  if (h < 24) return `${bn(h)} ঘণ্টা আগে`
  const d = Math.floor(h / 24)
  if (d < 30) return `${bn(d)} দিন আগে`
  return new Date(iso).toLocaleDateString('bn-BD', { dateStyle: 'medium' })
}

/** RFC-4180 CSV-সেল-escape */
function csvCell(v: string): string {
  return `"${String(v ?? '').replace(/"/g, '""')}"`
}

/** session205 — রোল-ব্যাজ (ইতিহাসে কে-কাজ-টা-করেছে) */
const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  super_admin: { label: 'সুপার অ্যাডমিন', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  admin: { label: 'অ্যাডমিন', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  member: { label: 'সাপোর্ট-এজেন্ট', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
}

/** session205 (Task 56) — অ্যাকশন-ইতিহাস টাইমলাইন: নোট + স্টেটাস-বদল এক-সুতোয় (নতুন-নিচে);
 *  ৪-এর-বেশি হলে পুরোনোগুলো কোলাপ্সড — "আরও Nটি" টগল;
 *  session208 — নোট-এন্ট্রি hover-রিভিল সম্পাদনা/মুছে-ফেলা (স্টেটাস-এন্ট্রি অডিট — লক),
 *  ইনলাইন-এডিট (Esc-বাতিল) + নিশ্চিত-মুছে-ফেলা + "সম্পাদিত"-ব্যাজ। */
function ActionHistory({
  entries,
  reportId,
  busy,
  onEdit,
  onDelete,
}: {
  entries: HistoryEntry[]
  reportId: string
  busy: boolean
  onEdit: (index: number, note: string) => void
  onDelete: (index: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [confirmDel, setConfirmDel] = useState<number | null>(null)
  if (entries.length === 0) return null
  const visible = expanded ? entries : entries.slice(-4)
  const hiddenCount = entries.length - visible.length

  const startEdit = (i: number, note: string) => {
    setConfirmDel(null)
    setEditing(i)
    setDraft(note ?? '')
  }
  const cancelEdit = () => {
    setEditing(null)
    setDraft('')
  }
  const saveEdit = (i: number) => {
    const note = draft.trim()
    if (!note) return
    onEdit(i, note)
    cancelEdit()
  }

  return (
    <div className="rounded-[8px] bg-[#FAFBFC] border border-[#E4E6EB] p-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        type="button"
        className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-[#65676B] hover:text-[#006A4E] transition cursor-pointer bg-transparent border-0 p-0"
        aria-expanded={expanded}
      >
        <History className="w-3.5 h-3.5" aria-hidden />
        <span>অ্যাকশন-ইতিহাস ({bn(entries.length)})</span>
        {entries.length > 4 && (
          <span className="text-[10px] font-bold text-[#006A4E]">
            {expanded ? '— সংক্ষিপ্ত' : `— আরও ${bn(hiddenCount)}টি`}
          </span>
        )}
      </button>
      <div className="mt-2.5 ml-1.5 border-l-2 border-[#E4E6EB] space-y-3 lf-anim-fade">
        {visible.map((e, i) => {
          const badge = ROLE_BADGE[e.byRole ?? ''] ?? null
          const isEditing = editing === i
          const isConfirming = confirmDel === i
          return (
            <div key={i} className="relative pl-4 group/entry">
              <span
                aria-hidden
                className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                  e.t === 'note' ? 'bg-[#006A4E]' : 'bg-sky-500'
                }`}
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-[#050505]">{e.by || 'অ্যাডমিন'}</span>
                {badge && (
                  <span
                    className={`text-[9.5px] font-extrabold px-1.5 py-px rounded-full border ${badge.cls}`}
                  >
                    {badge.label}
                  </span>
                )}
                <span
                  className="text-[9.5px] text-[#8A8D91]"
                  title={new Date(e.at).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                >
                  {relTimeBn(e.at)}
                </span>
                {e.t === 'note' && e.editedAt && (
                  <span
                    className="text-[9px] font-extrabold px-1.5 py-px rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5"
                    title={`সম্পাদিত ${relTimeBn(e.editedAt)} — ${e.editedBy || 'অ্যাডমিন'}`}
                  >
                    <Pencil className="w-2.5 h-2.5" aria-hidden />
                    সম্পাদিত
                  </span>
                )}
                {/* session208 — hover-রিভিল অ্যাকশন (শুধু নোট-এন্ট্রি; স্টেটাস = অডিট-লক) */}
                {e.t === 'note' && !isEditing && !isConfirming && (
                  <span className="ml-auto flex items-center gap-0.5 opacity-0 group-hover/entry:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => startEdit(i, e.note ?? '')}
                      disabled={busy}
                      aria-label="নোট সম্পাদনা"
                      title="নোট সম্পাদনা"
                      className="p-1 rounded-md text-[#8A8D91] hover:text-[#006A4E] hover:bg-[#006A4E]/10 disabled:opacity-40 transition cursor-pointer bg-transparent border-0"
                    >
                      <Pencil className="w-3 h-3" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDel(i)}
                      disabled={busy}
                      aria-label="নোট মুছে ফেলুন"
                      title="নোট মুছে ফেলুন"
                      className="p-1 rounded-md text-[#8A8D91] hover:text-red-600 hover:bg-red-50 disabled:opacity-40 transition cursor-pointer bg-transparent border-0"
                    >
                      <Trash2 className="w-3 h-3" aria-hidden />
                    </button>
                  </span>
                )}
              </div>
              {e.t === 'note' ? (
                isEditing ? (
                  <div className="mt-1.5 space-y-1.5">
                    <textarea
                      value={draft}
                      onChange={(ev) => setDraft(ev.target.value)}
                      onKeyDown={(ev) => {
                        if (ev.key === 'Escape') {
                          ev.preventDefault()
                          cancelEdit()
                        } else if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) {
                          ev.preventDefault()
                          saveEdit(i)
                        }
                      }}
                      rows={3}
                      maxLength={2000}
                      autoFocus
                      aria-label="নোট সম্পাদনা"
                      className="w-full text-[11.5px] text-[#050505] bg-white border border-[#006A4E]/40 focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/15 rounded-[8px] px-2.5 py-2 leading-relaxed resize-y outline-none transition"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => saveEdit(i)}
                        disabled={busy || !draft.trim()}
                        className="px-2.5 py-1 rounded-[6px] bg-[#006A4E] hover:bg-[#00523C] text-white text-[10px] font-bold transition disabled:opacity-50 cursor-pointer"
                      >
                        সংরক্ষণ
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-2.5 py-1 rounded-[6px] bg-white border border-[#CED0D4] hover:bg-[#F0F2F5] text-[#4B4C4F] text-[10px] font-bold transition cursor-pointer"
                      >
                        বাতিল
                      </button>
                      <span className="text-[9px] text-[#8A8D91] ml-auto">Esc = বাতিল · Ctrl+Enter = সংরক্ষণ</span>
                    </div>
                  </div>
                ) : isConfirming ? (
                  <div
                    className="mt-1.5 flex items-center gap-2 flex-wrap bg-red-50 border border-red-200 rounded-[8px] px-2.5 py-2"
                    role="alertdialog"
                    aria-label="নোট-মুছে-ফেলা নিশ্চিতকরণ"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600 shrink-0" aria-hidden />
                    <span className="text-[10.5px] font-bold text-red-700">এই জবাবটি মুছে ফেলবেন?</span>
                    <span className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(i)
                          setConfirmDel(null)
                        }}
                        disabled={busy}
                        className="px-2.5 py-1 rounded-[6px] bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold transition disabled:opacity-50 cursor-pointer"
                      >
                        মুছুন
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDel(null)}
                        className="px-2.5 py-1 rounded-[6px] bg-white border border-[#CED0D4] hover:bg-[#F0F2F5] text-[#4B4C4F] text-[10px] font-bold transition cursor-pointer"
                      >
                        বাতিল
                      </button>
                    </span>
                  </div>
                ) : (
                  <p className="text-[11.5px] text-[#4B4C4F] leading-relaxed whitespace-pre-wrap break-words mt-0.5">
                    {e.note}
                  </p>
                )
              ) : (
                <p className="text-[11px] text-[#4B4C4F] mt-0.5 flex items-center gap-1.5">
                  <span>স্টেটাস:</span>
                  <span className="font-bold">{STATUS_LABEL[(e.from as Status) ?? 'PENDING']}</span>
                  <span className="text-[#8A8D91]">→</span>
                  <span
                    className={`font-bold px-1.5 rounded ${
                      e.to === 'RESOLVED' ? 'text-emerald-700 bg-emerald-50' : e.to === 'IN_PROGRESS' ? 'text-sky-700 bg-sky-50' : 'text-amber-700 bg-amber-50'
                    }`}
                  >
                    {STATUS_LABEL[(e.to as Status) ?? 'PENDING']}
                  </span>
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function SupportReportsPage() {
  const { state, adminCandidates } = useAdminGate(false)

  return (
    <AdminGate state={state} adminCandidates={adminCandidates}>
      <SupportReportsPanel />
    </AdminGate>
  )
}

function SupportReportsPanel() {
  const [reports, setReports] = useState<Report[]>([])
  const [counts, setCounts] = useState<Record<Status, number>>({
    PENDING: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
  })
  const [tab, setTab] = useState<Status>('PENDING')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)
  // session202 — লেখা-কপি + ছবি-লাইটবক্স + CSV-ব্যাস্ট
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  // session206 (Task 57) — অনুসন্ধান + মিডিয়া-ফিল্টার + বাল্ক-অ্যাকশন
  const [query, setQuery] = useState('')
  const [mediaFilter, setMediaFilter] = useState('ALL')
  const [selected, setSelected] = useState<string[]>([])
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 })
  // session207 — তারিখ-সীমা + ক্রম + অনুসন্ধান-ফোকাস-রেফ
  const [dateRange, setDateRange] = useState('ALL')
  const [sortAsc, setSortAsc] = useState(false)
  const searchRef = React.useRef<HTMLInputElement>(null)

  const flash = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/support-reports')
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setReports(data.reports || [])
        setCounts(data.counts || counts)
      }
    } catch {
      /* পোল-নীরব */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(() => {
      if (!document.hidden) load()
    }, 15000)
    return () => clearInterval(t)
  }, [load])

  /** session207 — "/" চাপলে অনুসন্ধান-ফোকাস (ইনপুট/টেক্সট-এরিয়ায় না-থাকলে) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing =
        el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)
      if (e.key === '/' && !typing) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /** ছবি-লাইটবক্স Esc-বন্ধ (session202) */
  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  /** অভিযোগের লেখা কপি — clipboard API + legacy-fallback (session202) */
  const copyMsg = useCallback(async (r: Report) => {
    try {
      await navigator.clipboard.writeText(r.messageText)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = r.messageText
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
      } catch {
        /* নীরব */
      }
      ta.remove()
    }
    setCopiedId(r.id)
    setTimeout(() => setCopiedId((c) => (c === r.id ? null : c)), 1600)
  }, [])

  /** session207 — দৃশ্যমান-তালিকা: ট্যাব + মিডিয়া + তারিখ-সীমা + অনুসন্ধান + ক্রম (সব-ক্লায়েন্ট-সাইড) */
  const shown = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const cutoff = dateCutoff(dateRange)
    const list = reports.filter(
      (r) =>
        r.status === tab &&
        (mediaFilter === 'ALL' || r.mediaType === mediaFilter) &&
        (!cutoff || new Date(r.createdAt).getTime() >= cutoff) &&
        (!q ||
          r.senderName.toLowerCase().includes(q) ||
          (r.senderEmail ?? '').toLowerCase().includes(q) ||
          r.messageText.toLowerCase().includes(q)),
    )
    // session207 — ক্রম-টগল: সাম্প্রতক-আগে (ডিফল্ট) ↔ পুরাতন-আগে
    return list.sort((a, b) => {
      const da = new Date(a.createdAt).getTime()
      const db = new Date(b.createdAt).getTime()
      return sortAsc ? da - db : db - da
    })
  }, [reports, tab, mediaFilter, query, dateRange, sortAsc])

  /** CSV-এক্সপোর্ট — session207: বর্তমান-ফিল্টার-অনুযায়ী (ট্যাব+অনুসন্ধান+মিডিয়া+তারিখ+ক্রম), UTF-8 BOM, RFC-4180 */
  const exportCsv = useCallback(async () => {
    setExporting(true)
    try {
      const header = ['তারিখ', 'প্রেরক', 'ইমেইল', 'স্টেটাস', 'মিডিয়া', 'অভিযোগ', 'অ্যাডমিন-নোট']
      const rows = shown.map((r) => [
        new Date(r.createdAt).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }),
        r.senderName,
        r.senderEmail ?? '',
        STATUS_LABEL[r.status],
        r.mediaType,
        r.messageText,
        r.adminNote ?? '',
      ])
      const csv =
        '\uFEFF' + [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lekhok-support-reports-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      flash(`CSV ডাউনলোড শুরু — বর্তমান-ফিল্টারে ${bn(shown.length)}টি রেকর্ড`)
    } finally {
      setExporting(false)
    }
  }, [shown, flash])

  const update = useCallback(
    async (id: string, payload: { status?: Status; adminNote?: string }) => {
      setBusy(id)
      try {
        const res = await fetch('/api/admin/support-reports', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...payload }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || 'আপডেট ব্যর্থ')
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...data.report } : r)))
        await load() // কাউন্ট-রিফ্রেশ
        // session202 — সাইডবার/ড্যাশবোর্ড ব্যাজ তাৎক্ষণিক-রিফ্রেশ
        window.dispatchEvent(new Event('lf:support-changed'))
        // session203 — অভিযোগকারীকে SUPPORT_UPDATE নোটিফিকেশন গেছে-জানানো (স্টেটাস/নোট বদলেই)
        const statusChanged = payload.status && payload.status !== reports.find((r) => r.id === id)?.status
        const noteChanged = payload.adminNote !== undefined && payload.adminNote.trim() !== (reports.find((r) => r.id === id)?.adminNote ?? '')
        const notified = (statusChanged || noteChanged) ? ' · অভিযোগকারীকে নোটিফিকেশন পাঠানো হয়েছে' : ''
        flash(payload.status ? `স্টেটাস → ${STATUS_LABEL[payload.status]}${notified}` : `নোট সংরক্ষিত${notified}`)
      } catch (err) {
        flash(err instanceof Error ? err.message : 'আপডেট ব্যর্থ')
      } finally {
        setBusy(null)
      }
    },
    [flash, load, reports]
  )

  /** session206/207 — ট্যাব/ফিল্টার/তারিখ-বদলে নির্বাচন-পরিষ্কার (অদৃশ্য-কার্ডে বাল্ক-অ্যাকশন আটকায়) */
  useEffect(() => {
    setSelected([])
  }, [tab, mediaFilter, query, dateRange])

  /** session208 (Task 59) — ইতিহাস-এন্ট্রি সম্পাদনা/মুছে-ফেলা (PATCH); কাউন্ট-অপরিবর্তিত → load()-ছাড়াই
   *  লোকাল-স্টেট-আপডেট; ইউজার-দিকের my-reports-ও লাইভ-ইভেন্টে সিঙ্ক হয় */
  const patchHistory = useCallback(
    async (
      id: string,
      payload: { historyIndex: number; action: 'edit-note' | 'delete-note'; note?: string },
      okMsg: string,
    ) => {
      setBusy(id)
      try {
        const res = await fetch('/api/admin/support-reports', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...payload }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || 'ইতিহাস-আপডেট ব্যর্থ')
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...data.report } : r)))
        window.dispatchEvent(new Event('lf:support-changed'))
        flash(okMsg)
      } catch (err) {
        flash(err instanceof Error ? err.message : 'ইতিহাস-আপডেট ব্যর্থ')
      } finally {
        setBusy(null)
      }
    },
    [flash],
  )

  const total = counts.PENDING + counts.IN_PROGRESS + counts.RESOLVED
  const filtersActive = query.trim() !== '' || mediaFilter !== 'ALL' || dateRange !== 'ALL'
  const statPct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0)

  /** session206 — বাল্ক-স্টেটাস: নির্বাচিত-কার্ডে ক্রমিক PUT + প্রগ্রেস; শেষে একবার reload+ব্যাজ-সিঙ্ক */
  const bulkUpdate = useCallback(
    async (status: Status) => {
      if (selected.length === 0 || bulkBusy) return
      setBulkBusy(true)
      setBulkProgress({ done: 0, total: selected.length })
      let ok = 0
      for (const id of selected) {
        try {
          const res = await fetch('/api/admin/support-reports', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status }),
          })
          if (res.ok) ok++
        } catch {
          /* একটা-ব্যর্থ হলেও বাকিগুলো চলবে */
        }
        setBulkProgress((p) => ({ ...p, done: p.done + 1 }))
      }
      setBulkBusy(false)
      setSelected([])
      setBulkProgress({ done: 0, total: 0 })
      await load()
      window.dispatchEvent(new Event('lf:support-changed'))
      flash(
        `${bn(ok)}টি অভিযোগ → ${STATUS_LABEL[status]}${ok < selected.length ? ` (${bn(selected.length - ok)}টি ব্যর্থ)` : ''} · অভিযোগকারীরা নোটিফিকেশন পেয়েছেন`,
      )
    },
    [selected, bulkBusy, load, flash],
  )

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const allShownSelected = shown.length > 0 && shown.every((r) => selected.includes(r.id))

  return (
    <div className="font-hind text-[#050505] space-y-4">
      {/* টোস্ট */}
      {toast && (
        <div
          role="status"
          className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-[#006A4E] px-4 py-2.5 text-[12.5px] font-bold text-white shadow-lg lf-anim-fade"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* হেডার */}
      <div className="bg-white border border-[#CED0D4] rounded-[10px] p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#006A4E]" />
            <span>অভিযোগ রিভিউ ডেস্ক</span>
          </h1>
          <p className="text-xs text-[#65676B] mt-0.5">
            সাপোর্ট-চ্যাটে পাঠানো সব অভিযোগ — লেখা, ছবি, অডিও ও ভিডিও; মোট{' '}
            <b>{total}টি</b> রেকর্ড
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportCsv}
            disabled={shown.length === 0 || exporting}
            type="button"
            title="বর্তমান ফিল্টার-অনুযায়ী CSV রপ্তানি (session207)"
            className="px-3 py-2 bg-white border border-[#CED0D4] hover:border-[#006A4E] hover:text-[#006A4E] text-[#4B4C4F] rounded-[8px] text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>CSV</span>
            <span className="text-[10px] font-extrabold text-[#006A4E] bg-[#006A4E]/10 rounded-full px-1.5 py-px min-w-4 text-center">
              {bn(shown.length)}
            </span>
          </button>
          <Link
            href="/admin"
            className="px-3 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded-[8px] text-xs font-bold transition"
          >
            ← ড্যাশবোর্ড
          </Link>
        </div>
      </div>

      {/* session207 — পরিসংখ্যান মিনি-কার্ড ×৪ (স্টেটাস-কার্ড ক্লিকে ট্যাব-সুইচ; শেয়ার-বার = মোটের অনুপাত) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5" role="group" aria-label="অভিযোগ-পরিসংখ্যান">
        <div
          className="bg-white border border-[#CED0D4] border-t-[3px] border-t-[#006A4E] rounded-[10px] p-3 shadow-2xs transition-all"
          aria-label={`মোট ${bn(total)}টি অভিযোগ`}
        >
          <p className="text-[10.5px] font-bold text-[#65676B] flex items-center gap-1">
            <Inbox className="w-3.5 h-3.5 text-[#006A4E]" aria-hidden />
            মোট অভিযোগ
          </p>
          <p className="text-xl font-extrabold mt-1 leading-none">{bn(total)}</p>
          <div className="mt-2 h-1 rounded-full bg-[#F0F2F5] overflow-hidden">
            <div className="h-full w-full bg-[#006A4E] rounded-full" />
          </div>
          <p className="mt-1 text-[9.5px] text-[#8A8D91]">সব স্টেটাস মিলিয়ে</p>
        </div>
        {TABS.map((t) => {
          const tone = STAT_TONE[t.key]
          const n = counts[t.key]
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              aria-label={`${t.label}: ${bn(n)}টি — ক্লিকে ট্যাব-বদল`}
              className={`bg-white border border-[#CED0D4] border-t-[3px] ${tone.tBorder} rounded-[10px] p-3 shadow-2xs text-left transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 ${
                tab === t.key ? 'ring-2 ring-[#006A4E]/25 border-[#006A4E]' : ''
              }`}
            >
              <p className="text-[10.5px] font-bold text-[#65676B] flex items-center gap-1">
                {t.key === 'PENDING' && <ShieldAlert className={`w-3.5 h-3.5 ${tone.text}`} aria-hidden />}
                {t.key === 'IN_PROGRESS' && <Hourglass className={`w-3.5 h-3.5 ${tone.text}`} aria-hidden />}
                {t.key === 'RESOLVED' && <CheckCircle2 className={`w-3.5 h-3.5 ${tone.text}`} aria-hidden />}
                {t.label}
              </p>
              <p className={`text-xl font-extrabold mt-1 leading-none ${tone.text}`}>{bn(n)}</p>
              <div className="mt-2 h-1 rounded-full bg-[#F0F2F5] overflow-hidden">
                <div
                  className={`h-full ${tone.bar} rounded-full transition-all`}
                  style={{ width: `${statPct(n)}%` }}
                />
              </div>
              <p className="mt-1 text-[9.5px] text-[#8A8D91]">মোটের {bn(statPct(n))}%</p>
            </button>
          )
        })}
      </div>

      {/* স্টেটাস-ট্যাব (লাইভ-কাউন্ট) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            type="button"
            className={`px-3.5 py-2 rounded-[8px] text-xs font-bold border transition cursor-pointer flex items-center gap-2 ${
              tab === t.key
                ? 'bg-[#006A4E] text-white border-[#006A4E] shadow-sm'
                : 'bg-white text-[#4B4C4F] border-[#CED0D4] hover:border-[#006A4E]/50'
            }`}
          >
            <span
              className={`inline-block w-2 h-2 rounded-full ${t.cls} ${tab === t.key ? 'ring-2 ring-white/50' : ''}`}
              aria-hidden
            />
            {t.label}
            <span
              className={`min-w-5 h-5 px-1.5 rounded-full text-[10px] flex items-center justify-center font-extrabold ${
                tab === t.key ? 'bg-white/20 text-white' : 'bg-[#F0F2F5] text-[#65676B]'
              }`}
            >
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* session206 — অনুসন্ধান + মিডিয়া-ফিল্টার + ফলাফল-গণনা */}
      <div className="bg-white border border-[#CED0D4] rounded-[10px] p-3 shadow-2xs space-y-2.5">
        <div className="relative">
          <Search
            className="w-4 h-4 text-[#8A8D91] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="নাম, ইমেইল বা অভিযোগের লেখা দিয়ে খুঁজুন..."
            aria-label="অভিযোগ অনুসন্ধান"
            title="দ্রুত-অনুসন্ধান: / চেপে ফোকাস করুন"
            className="w-full text-[12.5px] bg-[#F7F8FA] border border-[#CED0D4] focus:bg-white focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/15 rounded-[8px] pl-9 pr-9 py-2.5 outline-none transition placeholder:text-[#8A8D91]"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              type="button"
              aria-label="অনুসন্ধান মুছুন"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#8A8D91] hover:text-[#050505] hover:bg-[#E4E6EB] transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" aria-hidden />
            </button>
          ) : (
            <kbd
              aria-hidden
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9.5px] font-bold text-[#8A8D91] bg-white border border-[#E4E6EB] rounded px-1.5 py-px shadow-2xs pointer-events-none"
            >
              /
            </kbd>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="মিডিয়া-ফিল্টার">
            {MEDIA_FILTERS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMediaFilter(m.key)}
                type="button"
                aria-pressed={mediaFilter === m.key}
                className={`px-2.5 py-1.5 rounded-full text-[10.5px] font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  mediaFilter === m.key
                    ? 'bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/40'
                    : 'bg-white text-[#65676B] border-[#CED0D4] hover:border-[#006A4E]/40 hover:text-[#006A4E]'
                }`}
              >
                {MEDIA_FILTER_ICON[m.key]}
                {m.label}
              </button>
            ))}
          </div>
          {filtersActive && (
            <p className="text-[10.5px] text-[#65676B] font-bold whitespace-nowrap" role="status">
              {bn(shown.length)}/{bn(total)}টি দেখানো হচ্ছে
              {shown.length < total && (
                <button
                  onClick={() => {
                    setQuery('')
                    setMediaFilter('ALL')
                    setDateRange('ALL')
                    setSortAsc(false)
                  }}
                  type="button"
                  className="ml-1.5 text-[#006A4E] hover:underline cursor-pointer"
                >
                  রিসেট
                </button>
              )}
            </p>
          )}
        </div>
        {/* session207 — তারিখ-সীমা চিপ + ক্রম-টগল (সব-ক্লায়েন্ট-সাইড) */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="তারিখ-সীমা ফিল্টার">
            <CalendarDays className="w-3.5 h-3.5 text-[#8A8D91] shrink-0" aria-hidden />
            {DATE_RANGES.map((d) => (
              <button
                key={d.key}
                onClick={() => setDateRange(d.key)}
                type="button"
                aria-pressed={dateRange === d.key}
                className={`px-2.5 py-1.5 rounded-full text-[10.5px] font-bold border transition cursor-pointer ${
                  dateRange === d.key
                    ? 'bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/40'
                    : 'bg-white text-[#65676B] border-[#CED0D4] hover:border-[#006A4E]/40 hover:text-[#006A4E]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSortAsc((v) => !v)}
            type="button"
            aria-label={sortAsc ? 'এখন পুরাতন-আগে — বদলে সাম্প্রতক-আগে করুন' : 'এখন সাম্প্রতক-আগে — বদলে পুরাতন-আগে করুন'}
            title="তালিকার ক্রম বদলান"
            className={`px-2.5 py-1.5 rounded-full text-[10.5px] font-bold border transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              sortAsc
                ? 'bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/40'
                : 'bg-white text-[#65676B] border-[#CED0D4] hover:border-[#006A4E]/40 hover:text-[#006A4E]'
            }`}
          >
            <ArrowDownWideNarrow className={`w-3.5 h-3.5 transition-transform ${sortAsc ? 'rotate-180' : ''}`} aria-hidden />
            {sortAsc ? 'পুরাতন আগে' : 'সাম্প্রতক আগে'}
          </button>
        </div>
      </div>

      {/* তালিকা */}
      {loading ? (
        <div className="bg-white border border-[#CED0D4] rounded-[10px] p-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#006A4E]" />
        </div>
      ) : shown.length === 0 ? (
        <div className="bg-white border border-[#CED0D4] rounded-[10px] p-10 text-center">
          {filtersActive ? (
            <>
              <XCircle className="w-8 h-8 text-[#CED0D4] mx-auto mb-2" aria-hidden />
              <p className="text-sm text-[#65676B]">ফিল্টার-শর্তে কোনো অভিযোগ মেলেনি</p>
              <p className="text-[11px] text-[#8A8D91] mt-1">অনুসন্ধান/মিডিয়া/তারিখ-ফিল্টার বদলে বা রিসেট করে আবার চেষ্টা করুন</p>
            </>
          ) : (
            <>
              <ShieldCheck className="w-8 h-8 text-[#CED0D4] mx-auto mb-2" aria-hidden />
              <p className="text-sm text-[#65676B]">{STATUS_LABEL[tab]} স্টেটাসে কোনো অভিযোগ নেই</p>
              <p className="text-[11px] text-[#8A8D91] mt-1">
                সাপোর্ট-চ্যাটে নতুন অভিযোগ এলে এখানে লাইভ দেখা যাবে
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* session206 — সম্পূর্ণ-নির্বাচন বার (বাল্ক-মোডে) */}
          <div className="flex items-center justify-between gap-2 bg-white border border-[#CED0D4] rounded-[8px] px-3 py-2 shadow-2xs">
            <label className="flex items-center gap-2 text-[11px] font-bold text-[#4B4C4F] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allShownSelected}
                onChange={() =>
                  setSelected(allShownSelected ? [] : shown.map((r) => r.id))
                }
                aria-label={allShownSelected ? 'নির্বাচন সরান' : 'দেখানো সব অভিযোগ নির্বাচন করুন'}
                className="w-4 h-4 accent-[#006A4E] cursor-pointer"
              />
              সব নির্বাচন ({bn(shown.length)})
            </label>
            {selected.length > 0 && (
              <span className="text-[10.5px] text-[#006A4E] font-extrabold" role="status">
                {bn(selected.length)}টি নির্বাচিত
              </span>
            )}
          </div>
          {shown.map((r) => (
            <article
              key={r.id}
              className={`bg-white border rounded-[10px] p-4 shadow-2xs space-y-3 border-l-4 transition-all hover:shadow-md lf-anim-fade ${
                selected.includes(r.id)
                  ? 'border-[#006A4E] ring-2 ring-[#006A4E]/20 ' + ACCENT[r.status].replace('border-l-', 'border-l-')
                  : `border-[#CED0D4] ${ACCENT[r.status]}`
              }`}
            >
              {/* বাল্ক-নির্বাচন + প্রেরক-বার (session202: অ্যাভাটার + আপেক্ষিক-সময়) */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={selected.includes(r.id)}
                    onChange={() => toggleSelect(r.id)}
                    aria-label={`${r.senderName}-এর অভিযোগ নির্বাচন করুন`}
                    className="w-4 h-4 mt-1 accent-[#006A4E] cursor-pointer transition-transform active:scale-90 shrink-0"
                  />
                  <span
                    aria-hidden
                    style={{ backgroundColor: avatarColorFor(r.senderName) }}
                    className="w-8 h-8 rounded-full text-white text-[12px] font-extrabold flex items-center justify-center shrink-0 select-none"
                  >
                    {r.senderName.trim().charAt(0) || '?'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold flex items-center gap-2 flex-wrap">
                      {r.senderName}
                      {r.senderEmail && (
                        <span className="text-[10.5px] font-normal text-[#65676B]">
                          ({r.senderEmail})
                        </span>
                      )}
                    </p>
                    <p
                      className="text-[10.5px] text-[#65676B] mt-0.5"
                      title={new Date(r.createdAt).toLocaleString('bn-BD', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    >
                      {relTimeBn(r.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {TABS.filter((t) => t.key !== r.status).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => update(r.id, { status: t.key })}
                      disabled={busy === r.id}
                      className="px-2.5 py-1.5 rounded-[6px] text-[10.5px] font-bold border transition disabled:opacity-50 cursor-pointer bg-white border-[#CED0D4] hover:border-[#006A4E] hover:text-[#006A4E]"
                      type="button"
                    >
                      → {STATUS_LABEL[t.key]}
                    </button>
                  ))}
                  {busy === r.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#006A4E]" />}
                </div>
              </div>

              {/* অভিযোগ-লেখা (session202: হোভার-কপি বাটন) */}
              <div className="relative group/msg">
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words bg-[#F7F8FA] border border-[#E4E6EB] rounded-[8px] p-3 pr-9">
                  {r.messageText}
                </p>
                <button
                  onClick={() => copyMsg(r)}
                  type="button"
                  aria-label="অভিযোগের লেখা কপি করুন"
                  title="লেখা কপি"
                  className="absolute top-2 right-2 p-1.5 rounded-[6px] bg-white border border-[#E4E6EB] text-[#65676B] hover:text-[#006A4E] hover:border-[#006A4E]/50 transition cursor-pointer"
                >
                  {copiedId === r.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden />
                  ) : (
                    <Copy className="w-3.5 h-3.5" aria-hidden />
                  )}
                </button>
              </div>

              {/* মিডিয়া-প্রিভিউ */}
              {r.mediaType !== 'TEXT' && r.mediaUrl && (
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-[6px] bg-[#F0F2F5] text-[#4B4C4F] border border-[#E4E6EB] flex items-center gap-1.5 shrink-0">
                    {r.mediaType === 'IMAGE' && <ImageIcon className="w-3 h-3" />}
                    {r.mediaType === 'AUDIO' && <Mic className="w-3 h-3" />}
                    {r.mediaType === 'VIDEO' && <Video className="w-3 h-3" />}
                    {r.mediaType}
                  </span>
                  <div className="min-w-0 flex-1">
                    {r.mediaType === 'IMAGE' && (
                      <button
                        type="button"
                        onClick={() => setLightbox(r.mediaUrl)}
                        className="p-0 border-0 bg-transparent cursor-zoom-in rounded-[8px] overflow-hidden block"
                        aria-label="ছবি বড় করে দেখুন"
                      >
                        <img
                          src={r.mediaUrl}
                          alt="অভিযোগের সংযুক্তি"
                          className="max-h-56 rounded-[8px] border border-[#E4E6EB] object-contain hover:opacity-90 transition"
                        />
                      </button>
                    )}
                    {r.mediaType === 'AUDIO' && (
                      <audio controls src={r.mediaUrl} className="w-full max-w-md" preload="none" />
                    )}
                    {r.mediaType === 'VIDEO' && (
                      <video
                        controls
                        src={r.mediaUrl}
                        className="max-h-64 rounded-[8px] border border-[#E4E6EB]"
                        preload="metadata"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* অ্যাডমিন-নোট */}
              <div className="flex items-end gap-2">
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={`note-${r.id}`}
                    className="text-[10.5px] font-bold text-[#65676B] block mb-1"
                  >
                    অ্যাডমিন-নোট (অভ্যন্তরীণ)
                  </label>
                  <textarea
                    id={`note-${r.id}`}
                    value={notes[r.id] ?? r.adminNote ?? ''}
                    onChange={(e) => setNotes((p) => ({ ...p, [r.id]: e.target.value }))}
                    rows={2}
                    maxLength={2000}
                    placeholder="ব্যবস্থা-গ্রহণ-নোট লিখুন..."
                    className="w-full text-[12px] bg-white border border-[#CED0D4] focus:border-[#006A4E] rounded-[8px] p-2.5 outline-none resize-y"
                  />
                </div>
                <button
                  onClick={() =>
                    update(r.id, { adminNote: notes[r.id] ?? r.adminNote ?? '' })
                  }
                  disabled={busy === r.id}
                  className="px-3.5 py-2 rounded-[8px] bg-[#006A4E] hover:bg-[#00523C] text-white text-[11px] font-bold transition disabled:opacity-50 shrink-0 cursor-pointer"
                  type="button"
                >
                  নোট সেভ
                </button>
              </div>

              {/* অ্যাকশন-ইতিহাস টাইমলাইন (session205) — নোট + স্টেটাস-বদল;
                  session208 — নোট-এন্ট্রি hover-সম্পাদনা/মুছে-ফেলা */}
              <ActionHistory
                entries={parseHistory(r.noteHistory)}
                reportId={r.id}
                busy={busy === r.id}
                onEdit={(idx, note) =>
                  patchHistory(
                    r.id,
                    { historyIndex: idx, action: 'edit-note', note },
                    'ইতিহাস-নোট সম্পাদিত · অভিযোগকারীকে নোটিফিকেশন পাঠানো হয়েছে',
                  )
                }
                onDelete={(idx) =>
                  patchHistory(
                    r.id,
                    { historyIndex: idx, action: 'delete-note' },
                    'ইতিহাস-এন্ট্রি মুছে ফেলা হয়েছে · অভিযোগকারীকে নোটিফিকেশন পাঠানো হয়েছে',
                  )
                }
              />
            </article>
          ))}
        </div>
      )}

      {/* session206 — ফ্লোটিং বাল্ক-অ্যাকশন বার (নির্বাচন-সক্রিয় হলে slide-up) */}
      {selected.length > 0 && (
        <div
          role="toolbar"
          aria-label="বাল্ক-স্টেটাস অ্যাকশন"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-xl bg-[#050505] text-white rounded-[12px] shadow-2xl border border-[#3e4042] px-4 py-3 flex items-center justify-between gap-3 flex-wrap lf-anim-pop"
          style={{ animationDuration: '0.18s' }}
        >
          <div className="min-w-0">
            <p className="text-[12px] font-extrabold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#33d79f]" aria-hidden />
              {bn(selected.length)}টি নির্বাচিত
            </p>
            {bulkBusy && bulkProgress.total > 0 && (
              <div className="mt-1.5" aria-live="polite">
                <div className="h-1.5 w-40 bg-white/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#33d79f] rounded-full transition-all"
                    style={{ width: `${Math.round((bulkProgress.done / bulkProgress.total) * 100)}%` }}
                  />
                </div>
                <p className="text-[9.5px] text-[#b0b3b8] mt-0.5">
                  {bn(bulkProgress.done)}/{bn(bulkProgress.total)} সম্পন্ন...
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {TABS.filter((t) => t.key !== 'PENDING').map((t) => (
              <button
                key={t.key}
                onClick={() => bulkUpdate(t.key)}
                disabled={bulkBusy}
                type="button"
                className={`px-3 py-1.5 rounded-[8px] text-[11px] font-bold transition disabled:opacity-50 cursor-pointer flex items-center gap-1 ${
                  t.key === 'RESOLVED'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-sky-600 hover:bg-sky-500 text-white'
                }`}
              >
                {bulkBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '→'} {STATUS_LABEL[t.key]}
              </button>
            ))}
            <button
              onClick={() => setSelected([])}
              disabled={bulkBusy}
              type="button"
              aria-label="নির্বাচন বাতিল"
              title="নির্বাচন বাতিল"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-50 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {/* ছবি-লাইটবক্স (session202) — Esc/ব্যাকড্রপ-ক্লিকে বন্ধ */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="অভিযোগের ছবি — পূর্ণ-ভিউ"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-6 cursor-zoom-out lf-anim-fade"
        >
          <img
            src={lightbox}
            alt="অভিযোগের সংযুক্তি — পূর্ণ-ভিউ"
            className="max-h-[85vh] max-w-full rounded-[10px] shadow-2xl object-contain"
          />
          <button
            type="button"
            aria-label="বন্ধ করুন"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-[#050505] hover:bg-white transition cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>
      )}
    </div>
  )
}