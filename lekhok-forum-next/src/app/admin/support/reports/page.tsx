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
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  History,
  Image as ImageIcon,
  Loader2,
  Mic,
  ShieldAlert,
  ShieldCheck,
  Video,
  X,
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

/** session205 (Task 56) — অ্যাকশন-ইতিহাস-এন্ট্রি (noteHistory JSON থেকে) */
interface HistoryEntry {
  t: 'note' | 'status'
  note?: string
  from?: string
  to?: string
  at: string
  by?: string
  byRole?: string
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
 *  ৪-এর-বেশি হলে পুরোনোগুলো কোলাপ্সড — "আরও Nটি" টগল। */
function ActionHistory({ entries }: { entries: HistoryEntry[] }) {
  const [expanded, setExpanded] = useState(false)
  if (entries.length === 0) return null
  const visible = expanded ? entries : entries.slice(-4)
  const hiddenCount = entries.length - visible.length
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
          return (
            <div key={i} className="relative pl-4">
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
              </div>
              {e.t === 'note' ? (
                <p className="text-[11.5px] text-[#4B4C4F] leading-relaxed whitespace-pre-wrap break-words mt-0.5">
                  {e.note}
                </p>
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

  /** CSV-এক্সপোর্ট — সব-স্টেটাস, UTF-8 BOM (এক্সেলে বাংলা ঠিক), RFC-4180 (session202) */
  const exportCsv = useCallback(async () => {
    setExporting(true)
    try {
      const header = ['তারিখ', 'প্রেরক', 'ইমেইল', 'স্টেটাস', 'মিডিয়া', 'অভিযোগ', 'অ্যাডমিন-নোট']
      const rows = reports.map((r) => [
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
      flash(`CSV ডাউনলোড শুরু — ${bn(reports.length)}টি রেকর্ড`)
    } finally {
      setExporting(false)
    }
  }, [reports, flash])

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

  const shown = reports.filter((r) => r.status === tab)
  const total = counts.PENDING + counts.IN_PROGRESS + counts.RESOLVED

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
            disabled={reports.length === 0 || exporting}
            type="button"
            className="px-3 py-2 bg-white border border-[#CED0D4] hover:border-[#006A4E] hover:text-[#006A4E] text-[#4B4C4F] rounded-[8px] text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>CSV</span>
          </button>
          <Link
            href="/admin"
            className="px-3 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded-[8px] text-xs font-bold transition"
          >
            ← ড্যাশবোর্ড
          </Link>
        </div>
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

      {/* তালিকা */}
      {loading ? (
        <div className="bg-white border border-[#CED0D4] rounded-[10px] p-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#006A4E]" />
        </div>
      ) : shown.length === 0 ? (
        <div className="bg-white border border-[#CED0D4] rounded-[10px] p-10 text-center">
          <ShieldCheck className="w-8 h-8 text-[#CED0D4] mx-auto mb-2" aria-hidden />
          <p className="text-sm text-[#65676B]">{STATUS_LABEL[tab]} স্টেটাসে কোনো অভিযোগ নেই</p>
          <p className="text-[11px] text-[#8A8D91] mt-1">
            সাপোর্ট-চ্যাটে নতুন অভিযোগ এলে এখানে লাইভ দেখা যাবে
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((r) => (
            <article
              key={r.id}
              className={`bg-white border border-[#CED0D4] rounded-[10px] p-4 shadow-2xs space-y-3 border-l-4 ${ACCENT[r.status]} lf-anim-fade`}
            >
              {/* প্রেরক-বার (session202: অ্যাভাটার + আপেক্ষিক-সময়) */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-2.5 min-w-0">
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

              {/* অ্যাকশন-ইতিহাস টাইমলাইন (session205) — নোট + স্টেটাস-বদল */}
              <ActionHistory entries={parseHistory(r.noteHistory)} />
            </article>
          ))}
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