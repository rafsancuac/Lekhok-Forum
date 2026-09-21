'use client'

/**
 * Task 43 — অভিযোগ-রিভিউ ডেস্ক (/admin/support/reports)
 *
 * ম্যানেজার (admin/super_admin) বা নির্বাচিত সাপোর্ট-অ্যাডমিন:
 *   • স্টেটাস-ট্যাব: PENDING / IN_PROGRESS / RESOLVED (লাইভ-কাউন্টসহ)
 *   • অভিযোগ-কার্ড: প্রেরক + সময় + লেখা + মিডিয়া-প্রিভিউ (ছবি/অডিও/ভিডিও)
 *   • অ্যাকশন: স্টেটাস-পরিবর্তন + অ্যাডমিন-নোট (সেভ)
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Mic,
  ShieldAlert,
  Video,
} from 'lucide-react'
import AdminGate, { useAdminGate } from '@/components/admin/AdminGate'

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
  createdAt: string
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
        flash(payload.status ? `স্টেটাস → ${STATUS_LABEL[payload.status]}` : 'নোট সংরক্ষিত')
      } catch (err) {
        flash(err instanceof Error ? err.message : 'আপডেট ব্যর্থ')
      } finally {
        setBusy(null)
      }
    },
    [flash, load]
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
        <Link
          href="/admin"
          className="px-3 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded-[8px] text-xs font-bold transition shrink-0"
        >
          ← ড্যাশবোর্ড
        </Link>
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
          <p className="text-sm text-[#65676B]">
            {STATUS_LABEL[tab]} স্টেটাসে কোনো অভিযোগ নেই
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((r) => (
            <article
              key={r.id}
              className="bg-white border border-[#CED0D4] rounded-[10px] p-4 shadow-2xs space-y-3"
            >
              {/* প্রেরক-বার */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-[13px] font-bold flex items-center gap-2 flex-wrap">
                    {r.senderName}
                    {r.senderEmail && (
                      <span className="text-[10.5px] font-normal text-[#65676B]">
                        ({r.senderEmail})
                      </span>
                    )}
                  </p>
                  <p className="text-[10.5px] text-[#65676B] mt-0.5">
                    {new Date(r.createdAt).toLocaleString('bn-BD', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
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

              {/* অভিযোগ-লেখা */}
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words bg-[#F7F8FA] border border-[#E4E6EB] rounded-[8px] p-3">
                {r.messageText}
              </p>

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
                      <img
                        src={r.mediaUrl}
                        alt="অভিযোগের সংযুক্তি"
                        className="max-h-56 rounded-[8px] border border-[#E4E6EB] object-contain"
                      />
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
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
