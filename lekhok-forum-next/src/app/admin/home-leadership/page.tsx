'use client'

/**
 * হোম নেতৃত্ব ব্যবস্থাপনা (অ্যাডমিন প্যানেল /admin/home-leadership)
 *
 * ইউজার-স্পেক: হোমপেজের নেতৃত্ব-সেকশনে ঠিক যা দেখাবে তা-ই এখানে কনফিগার হয় —
 *   ① ৮টি স্থির-স্লট (প্রতিষ্ঠাতা সভাপতি/সাধারণ সম্পাদক + প্রতিষ্ঠাকালীন উপদেষ্টা ১-২,
 *      বর্তমান সভাপতি/সাধারণ সম্পাদক + বর্তমান উপদেষ্টা ১-২)
 *   ② কোনো পপ-আপ নেই — সেভ/সম্পাদনা সব কার্ডের ভেতরেই ইনলাইন; সফল হলে কার্ডেই
 *      "✓ সংরক্ষিত হয়েছে" সবুজ-চিহ্ন (ব্রাউজার alert/মোডাল/টোস্ট কিছুই নেই)
 *   ③ কার্যবর্ষ ড্রপডাউন (বানান-ভুল-প্রবণ টাইপিং বন্ধ) + "নিজে লিখি" বিকল্প
 *   ④ খালি-স্লটে কোনো সতর্কবার্তা নয় — "তথ্য দিন" বাটনে সরাসরি ম্যানুয়াল-ইনপুট
 *   ⑤ সেভ = POST upsert → সবসময় 200 + রেকর্ড; হোমপেজ /api/home-leadership থেকে হুবহু এটাই দেখায়
 * ছবি: ক্লায়েন্ট-কমপ্রেস (EXIF-ঠিক) → data-URI — /admin/leadership-প্যানেলের মতোই।
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { compressImage } from '@/lib/image-compress'
import type { FrontendUser } from '@/lib/types'

/* ─── কার্যবর্ষ-ড্রপডাউনের তালিকা ─── */
const ACADEMIC_SESSIONS = [
  '(২০২০-২১ কার্যবর্ষ)',
  '(২০২১-২২ কার্যবর্ষ)',
  '(২০২২-২৩ কার্যবর্ষ)',
  '(২০২৩-২৪ কার্যবর্ষ)',
  '(২০২৪-২৫ কার্যবর্ষ)',
  '(২০২৫-২৬ কার্যবর্ষ)',
  '(২০২৬-২৭ কার্যবর্ষ)',
  '(২০২৭-২৮ কার্যবর্ষ)',
]
const CUSTOM_TERM = '__custom__'

interface SlotData {
  slotKey: string
  slotLabel: string
  section: 'FOUNDING' | 'CURRENT'
  name: string
  role: string
  term: string
  quote: string
  imageUrl: string
}

type SaveStatus = '' | 'saving' | 'success' | 'error'

export default function HomeLeadershipAdminPage() {
  const [slots, setSlots] = useState<SlotData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [formData, setFormData] = useState<SlotData | null>(null)
  const [customTermMode, setCustomTermMode] = useState(false)
  const [saveStatus, setSaveStatus] = useState<Record<string, SaveStatus>>({})
  const [photoBusy, setPhotoBusy] = useState(false)
  const statusTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  /* ─── সেশন-গার্ড (ডেমো-সুইচ) — /admin/leadership-প্যানেলের মতোই ─── */
  const [sessionState, setSessionState] = useState<'loading' | 'ok' | 'denied'>('loading')
  const [adminCandidates, setAdminCandidates] = useState<FrontendUser[]>([])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setLoadError(false)
    try {
      const [sessRes, slotRes] = await Promise.all([
        fetch('/api/session'),
        fetch('/api/admin/home-leadership'),
      ])
      const sess = await sessRes.json().catch(() => ({}))
      setAdminCandidates((sess.users || []).filter((u: FrontendUser) => u.role === 'admin'))
      const role = sess.current?.role
      setSessionState(role === 'admin' ? 'ok' : 'denied')

      if (role === 'admin' && slotRes.ok) {
        const data: SlotData[] = await slotRes.json()
        if (Array.isArray(data)) setSlots(data)
        else setLoadError(true)
      } else if (role === 'admin') {
        setLoadError(true)
      }
    } catch {
      setSessionState('denied')
      setLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    /* আনমাউন্টে বাকি টাইমার পরিষ্কার */
    const timers = statusTimers.current
    return () => Object.values(timers).forEach(clearTimeout)
  }, [loadData])

  /* ─── ইনলাইন-সম্পাদনা নিয়ন্ত্রণ ─── */
  const handleStartEdit = (slot: SlotData) => {
    setEditingKey(slot.slotKey)
    setFormData({ ...slot })
    setCustomTermMode(Boolean(slot.term) && !ACADEMIC_SESSIONS.includes(slot.term))
  }

  const handleCancelEdit = () => {
    setEditingKey(null)
    setFormData(null)
    setCustomTermMode(false)
  }

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // একই-ফাইল পুনঃনির্বাচনেও onChange চলে
    if (!file || !formData) return
    setPhotoBusy(true)
    try {
      const compressed = await compressImage(file)
      const dataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('read-fail'))
        reader.readAsDataURL(compressed)
      })
      setFormData((prev) => (prev ? { ...prev, imageUrl: dataUri } : prev))
    } catch {
      setFormData((prev) => (prev ? { ...prev, imageUrl: URL.createObjectURL(file) } : prev))
    } finally {
      setPhotoBusy(false)
    }
  }

  /* ─── ইনলাইন-সেভ: কোনো পপ-আপ নেই — কার্ডেই সবুজ/লাল চিহ্ন ─── */
  const handleSave = async (slotKey: string) => {
    if (!formData) return
    setSaveStatus((prev) => ({ ...prev, [slotKey]: 'saving' }))
    try {
      const res = await fetch('/api/admin/home-leadership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        const saved: SlotData = await res.json()
        setSlots((prev) =>
          prev.map((s) =>
            s.slotKey === slotKey ? { ...s, ...formData, ...('name' in saved ? saved : {}) } : s
          )
        )
        setSaveStatus((prev) => ({ ...prev, [slotKey]: 'success' }))
        setEditingKey(null)
        setFormData(null)
        setCustomTermMode(false)
        clearTimeout(statusTimers.current[slotKey])
        statusTimers.current[slotKey] = setTimeout(() => {
          setSaveStatus((prev) => ({ ...prev, [slotKey]: '' }))
        }, 2500)
      } else {
        setSaveStatus((prev) => ({ ...prev, [slotKey]: 'error' }))
      }
    } catch {
      setSaveStatus((prev) => ({ ...prev, [slotKey]: 'error' }))
    }
  }

  /* ─── স্লট-কার্ড রেন্ডারার ─── */
  const renderSlotCard = (slot: SlotData) => {
    const isEditing = editingKey === slot.slotKey
    const current = isEditing && formData ? formData : slot
    const status = saveStatus[slot.slotKey]
    const isEmpty = !slot.name

    return (
      <div
        key={slot.slotKey}
        className={`bg-white border rounded-[10px] p-4 shadow-2xs flex flex-col justify-between transition-all duration-150 relative ${
          isEditing ? 'border-[#006A4E] ring-1 ring-[#006A4E]' : 'border-[#CED0D4] hover:border-[#006A4E]/50'
        }`}
      >
        {/* স্লট-ট্যাগ + ইনলাইন-স্টেটাস */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="bg-emerald-50 text-[#006A4E] border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-[4px]">
            {slot.slotLabel}
          </span>
          {status === 'success' && (
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <span aria-hidden>✓</span> সংরক্ষিত হয়েছে
            </span>
          )}
          {status === 'error' && (
            <span className="text-[11px] text-rose-600 font-bold">সংরক্ষণ ব্যর্থ — আবার চেষ্টা করুন</span>
          )}
        </div>

        {isEditing && formData ? (
          /* ═══ কার্ডের ভেতরেই ইনলাইন-এডিটর (কোনো পপ-আপ নেই) ═══ */
          <div className="space-y-2.5 flex-1">
            {/* ছবি */}
            <div className="flex items-center gap-2.5 bg-[#FAFBFB] p-2 rounded-[6px] border border-[#E4E6EB]">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-emerald-300 bg-white shrink-0 flex items-center justify-center">
                {current.imageUrl ? (
                   
                  <img src={current.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-[#65676B]">ছবি নেই</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {photoBusy ? (
                  <span className="text-[10.5px] text-[#65676B] flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" /> ছবি প্রসেস হচ্ছে...
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="w-full text-[10px] file:py-0.5 file:px-2 file:border-0 file:rounded file:bg-[#006A4E] file:text-white cursor-pointer"
                    />
                    {current.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="shrink-0 text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        মুছুন
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* নাম */}
            <div>
              <label className="text-[11px] font-bold text-[#65676B] block mb-0.5">সদস্যের নাম</label>
              <input
                type="text"
                value={current.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="পূর্ণ নাম লিখুন..."
                className="w-full bg-[#F0F2F5] focus:bg-white border border-[#CED0D4] focus:border-[#006A4E] rounded-[6px] px-2 py-1.5 text-xs outline-none font-bold"
              />
            </div>

            {/* পদবী */}
            <div>
              <label className="text-[11px] font-bold text-[#65676B] block mb-0.5">পদবী</label>
              <input
                type="text"
                value={current.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="যেমন: প্রতিষ্ঠাতা সভাপতি"
                className="w-full bg-[#F0F2F5] focus:bg-white border border-[#CED0D4] focus:border-[#006A4E] rounded-[6px] px-2 py-1.5 text-xs outline-none"
              />
            </div>

            {/* কার্যবর্ষ — ড্রপডাউন (বানান-ভুল বন্ধ) */}
            <div>
              <label className="text-[11px] font-bold text-[#65676B] block mb-0.5">কার্যবর্ষ</label>
              {customTermMode ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={current.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    placeholder="যেমন: (২০২৪-২৫ কার্যবর্ষ)"
                    className="w-full bg-[#F0F2F5] focus:bg-white border border-[#CED0D4] focus:border-[#006A4E] rounded-[6px] px-2 py-1.5 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCustomTermMode(false)
                      setFormData({ ...formData, term: ACADEMIC_SESSIONS[5] })
                    }}
                    className="shrink-0 text-[10px] font-bold text-[#006A4E] hover:underline cursor-pointer"
                  >
                    তালিকা
                  </button>
                </div>
              ) : (
                <select
                  value={ACADEMIC_SESSIONS.includes(current.term) ? current.term : CUSTOM_TERM}
                  onChange={(e) => {
                    if (e.target.value === CUSTOM_TERM) {
                      setCustomTermMode(true)
                      setFormData({ ...formData, term: '' })
                    } else {
                      setFormData({ ...formData, term: e.target.value })
                    }
                  }}
                  className="w-full bg-[#F0F2F5] focus:bg-white border border-[#CED0D4] focus:border-[#006A4E] rounded-[6px] px-2 py-1.5 text-xs outline-none cursor-pointer"
                >
                  {!ACADEMIC_SESSIONS.includes(current.term) && current.term && (
                    <option value={current.term}>{current.term}</option>
                  )}
                  {ACADEMIC_SESSIONS.map((sess) => (
                    <option key={sess} value={sess}>
                      {sess}
                    </option>
                  ))}
                  <option value={CUSTOM_TERM}>✍️ নিজে লিখি...</option>
                </select>
              )}
            </div>

            {/* বক্তব্য */}
            <div>
              <label className="text-[11px] font-bold text-[#65676B] block mb-0.5">বক্তব্য / বাণী</label>
              <textarea
                rows={3}
                value={current.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                placeholder="বক্তব্য লিখুন..."
                className="w-full bg-[#F0F2F5] focus:bg-white border border-[#CED0D4] focus:border-[#006A4E] rounded-[6px] p-2 text-xs outline-none font-kalpurush resize-none"
              />
            </div>

            {/* ইনলাইন-অ্যাকশন */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#E4E6EB]">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 py-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded-[6px] text-xs font-bold transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => handleSave(slot.slotKey)}
                disabled={status === 'saving' || photoBusy}
                className="flex-1 py-1.5 bg-[#006A4E] hover:bg-[#00523C] text-white rounded-[6px] text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                {status === 'saving' ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ'}
              </button>
            </div>
          </div>
        ) : (
          /* ═══ প্রদর্শন-মোড ═══ */
          <div className="flex flex-col justify-between flex-1">
            <div>
              {isEmpty ? (
                /* খালি-স্লট: কোনো হলুদ-সতর্কবার্তা নয় — সরাসরি ইনপুটের আমন্ত্রণ */
                <div className="border border-dashed border-emerald-300 bg-emerald-50/40 rounded-[8px] p-4 text-center my-2">
                  <span className="text-lg block mb-1" aria-hidden>✍️</span>
                  <p className="text-xs font-bold text-[#006A4E]">সদস্য যুক্ত নেই</p>
                  <p className="text-[10.5px] text-[#65676B] mt-0.5">
                    &quot;তথ্য দিন&quot; চেপে সরাসরি নাম, ছবি ও বাণী লিখে সেভ করুন
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-emerald-200 bg-emerald-50 shrink-0 flex items-center justify-center">
                      {slot.imageUrl ? (
                         
                        <img src={slot.imageUrl} alt={slot.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-[#006A4E]">{slot.name.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-bold text-[#050505] truncate">{slot.name}</h3>
                      <p className="text-[11px] font-semibold text-[#006A4E] truncate">{slot.role}</p>
                      <span className="text-[10px] text-[#65676B] block">{slot.term}</span>
                    </div>
                  </div>
                  <div className="bg-[#FAFBFB] border border-[#E4E6EB] rounded-[6px] p-2 mb-3">
                    <p className="text-[11px] text-[#4B4C4F] font-kalpurush line-clamp-3 leading-relaxed">
                      {slot.quote ? `“${slot.quote}”` : 'কোনো বক্তব্য যুক্ত করা হয়নি'}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E4E6EB]">
              <span className="text-[10px] text-[#8A8D91] font-mono truncate">{slot.slotKey}</span>
              <button
                type="button"
                onClick={() => handleStartEdit(slot)}
                className="shrink-0 px-3 py-1 bg-[#006A4E] hover:bg-[#00523C] text-white rounded-[6px] text-xs font-bold transition cursor-pointer"
              >
                {isEmpty ? 'তথ্য দিন' : 'সম্পাদনা'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ─── সেশন-গেট স্ক্রিন ─── */
  if (sessionState !== 'ok') {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4 font-hind text-[#050505]">
        <div className="bg-white border border-[#CED0D4] rounded-[10px] p-6 max-w-sm w-full text-center shadow-2xs">
          {sessionState === 'loading' || isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#006A4E]" />
          ) : (
            <>
              <div className="text-3xl mb-2" aria-hidden>🔒</div>
              <h1 className="text-sm font-bold mb-1">অ্যাডমিন অনুমতি প্রয়োজন</h1>
              <p className="text-xs text-[#65676B] mb-4">
                এই প্যানেল ব্যবহার করতে অ্যাডমিন অ্যাকাউন্টে থাকতে হবে।
                {adminCandidates.length > 0 && ' নিচের অ্যাকাউন্টে সুইচ করুন (ডেমো):'}
              </p>
              {adminCandidates.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={async () => {
                    const res = await fetch('/api/session', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: u.id }),
                    })
                    if (res.ok) loadData()
                  }}
                  className="w-full px-3 py-2 mb-1.5 bg-[#006A4E] hover:bg-[#00523C] text-white rounded-[8px] text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {u.avatarUrl ? (
                     
                    <img src={u.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                      {u.name.slice(0, 1)}
                    </span>
                  )}
                  {u.name} হিসেবে সুইচ করুন
                </button>
              ))}
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-[#006A4E] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> ফিডে ফিরে যান
              </Link>
            </>
          )}
        </div>
      </div>
    )
  }

  const founding = slots.filter((s) => s.section === 'FOUNDING')
  const currentSec = slots.filter((s) => s.section === 'CURRENT')
  const filledCount = slots.filter((s) => s.name).length

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-hind text-[#050505] select-none">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">

        {/* হেডার */}
        <div className="bg-white border border-[#CED0D4] rounded-[10px] p-4 sm:p-5 shadow-2xs mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#050505] flex items-center gap-2">
              <span aria-hidden>👥</span>
              <span>হোম নেতৃত্ব ব্যবস্থাপনা</span>
            </h1>
            <p className="text-xs text-[#65676B] mt-0.5">
              এখানে যা সংরক্ষণ করবেন, মূল হোমপেজের নেতৃত্ব-সেকশনে সাথে-সাথে হুবহু তা-ই দেখাবে
              {filledCount > 0 && <> — এখন {filledCount}টি স্লট পূর্ণ</>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/?leadership=1"
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006A4E] border border-emerald-200 rounded-[8px] text-xs font-bold transition cursor-pointer"
            >
              হোমপেজ-ভিউ দেখুন
            </Link>
            <Link
              href="/"
              className="px-3 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded-[8px] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ফিডে ফিরুন</span>
            </Link>
          </div>
        </div>

        {/* লোডিং / এরর */}
        {isLoading ? (
          <div className="bg-white border border-[#CED0D4] rounded-[10px] p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#006A4E]" />
            <p className="text-xs text-[#65676B] mt-2">স্লট-ডাটা লোড হচ্ছে...</p>
          </div>
        ) : loadError ? (
          <div className="bg-white border border-[#CED0D4] rounded-[10px] p-8 text-center">
            <p className="text-sm text-[#050505] font-bold mb-2">ডাটা লোড করা যায়নি</p>
            <button
              type="button"
              onClick={loadData}
              className="px-4 py-2 bg-[#006A4E] hover:bg-[#00523C] text-white rounded-[8px] text-xs font-bold transition cursor-pointer"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : (
          <>
            {/* ১. নেতৃত্বের ধারা */}
            <div className="mb-6">
              <h2 className="text-sm font-bold text-[#050505] mb-3 flex items-center gap-2">
                <span aria-hidden>🏛️</span>
                <span>নেতৃত্বের ধারা (প্রতিষ্ঠাতা ও প্রতিষ্ঠাকালীন উপদেষ্টা)</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {founding.map(renderSlotCard)}
              </div>
            </div>

            {/* ২. বর্তমান নেতৃত্ব */}
            <div>
              <h2 className="text-sm font-bold text-[#050505] mb-3 flex items-center gap-2">
                <span aria-hidden>👥</span>
                <span>বর্তমান নেতৃত্ব (কার্যনির্বাহী ও উপদেষ্টা)</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {currentSec.map(renderSlotCard)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
