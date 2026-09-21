'use client'

/**
 * হোম নেতৃত্ব ব্যবস্থাপনা প্যানেল (শেয়ার্ড কম্পোনেন্ট) — /admin/home/leadership
 *
 * Task63 (ইউজার-স্পেক): স্থির ৮-স্লট → ডাইনামিক কার্ড (HomeLeaderCard)
 *   ① "＋ নতুন উপদেষ্টা / সদস্য যোগ করুন" — যত-খুশি কার্ড তৈরি (উপদেষ্টা বেশি হলেও জায়গা আছে)
 *   ② প্রতিটি কার্ডের কোণায় অন/অফ টগল-সুইচ — ক্লিকেই হোমপেজে দেখা/লুকান (রিলোড-পপআপ-শূন্য);
 *      নতুন-কার্ড ডিফল্ট লুকানো — তথ্য-পূর্ণ করে টগল-অন করলেই লাইভ (উপদেষ্টা-ঘোষণা-প্রস্তুতি)
 *   ③ ↑ ↓ বোতামে কার্ডের ক্রম বদল (সেকশনের ভেতরে)
 *   ④ মুছে ফেলুন — দুই-ধাপে ইনলাইন-নিশ্চিতি (কোনো confirm() পপ-আপ নেই)
 *   ⑤ সেভ/সম্পাদনা সব কার্ডের ভেতরেই ইনলাইন; সফল হলে কার্ডেই "✓ সংরক্ষিত হয়েছে"
 *      সবুজ-চিহ্ন (২.৫ সেকেন্ডে নিজে-ই মিলিয়ে যায়; ব্রাউজার alert/মোডাল/টোস্ট কিছুই নেই)
 *   ⑥ কার্যবর্ষ ড্রপডাউন (বানান-ভুল-প্রবণ টাইপিং বন্ধ) + "নিজে লিখি" বিকল্প
 *   ⑦ ছবি: ক্লায়েন্ট-কমপ্রেস (EXIF-ঠিক) → data-URI
 * ডাটা: /api/admin/home-leadership (GET/POST/PATCH/DELETE) — হোমপেজ /api/home-leadership
 * থেকে হুবহু এটাই দেখায় (isActive + নাম-ফিল্টারসহ হুবহু-সিঙ্ক)।
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { compressImage } from '@/lib/image-compress'
import AdminGate, { useAdminGate } from '@/components/admin/AdminGate'
import { ToggleWithLabel, StatusPill } from '@/components/admin/ui'

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

interface CardData {
  id: string
  category: 'FOUNDING' | 'CURRENT'
  name: string
  role: string
  term: string
  quote: string
  imageUrl: string
  isActive: boolean
  order: number
  createdAt?: string
}

type SaveStatus = '' | 'saving' | 'success' | 'error'

const SECTION_META = {
  FOUNDING: {
    title: 'নেতৃত্বের ধারা (প্রতিষ্ঠাতা ও প্রতিষ্ঠাকালীন উপদেষ্টা)',
    icon: '🏛️',
    addLabel: 'নতুন প্রতিষ্ঠাতা / উপদেষ্টা যোগ করুন',
    defaultRole: 'উপদেষ্টা',
    defaultTerm: '(২০২০-২১ কার্যবর্ষ)',
  },
  CURRENT: {
    title: 'বর্তমান নেতৃত্ব (কার্যনির্বাহী ও উপদেষ্টা)',
    icon: '👥',
    addLabel: 'নতুন উপদেষ্টা / সদস্য যোগ করুন',
    defaultRole: 'উপদেষ্টা',
    defaultTerm: '(২০২৬-২৭ কার্যবর্ষ)',
  },
} as const

export default function HomeLeadershipPanel() {
  const { state: gateState, adminCandidates, recheck } = useAdminGate()
  const [cards, setCards] = useState<CardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<CardData | null>(null)
  const [customTermMode, setCustomTermMode] = useState(false)
  const [saveStatus, setSaveStatus] = useState<Record<string, SaveStatus>>({})
  const [toggleBusy, setToggleBusy] = useState<string | null>(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [deleteArmed, setDeleteArmed] = useState<string | null>(null)
  const [reorderBusy, setReorderBusy] = useState<string | null>(null)
  const statusTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const deleteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setLoadError(false)
    try {
      const res = await fetch('/api/admin/home-leadership')
      if (res.ok) {
        const data: CardData[] = await res.json()
        if (Array.isArray(data)) setCards(data)
        else setLoadError(true)
      } else {
        setLoadError(true)
      }
    } catch {
      setLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const timers = statusTimers.current
    const dTimers = deleteTimers.current
    return () => {
      Object.values(timers).forEach(clearTimeout)
      Object.values(dTimers).forEach(clearTimeout)
    }
  }, [loadData])

  const flashStatus = (key: string, status: SaveStatus, ms = 2500) => {
    setSaveStatus((prev) => ({ ...prev, [key]: status }))
    clearTimeout(statusTimers.current[key])
    statusTimers.current[key] = setTimeout(
      () => setSaveStatus((prev) => ({ ...prev, [key]: '' })),
      ms
    )
  }

  /* ─── ★ তাৎক্ষণিক অন/অফ টগল — অপটিমিস্টিক + PATCH; কোনো পপ-আপ/রিলোড নেই ─── */
  const handleToggleVisibility = async (card: CardData, nextState: boolean) => {
    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, isActive: nextState } : c))
    )
    setToggleBusy(card.id)
    try {
      const res = await fetch('/api/admin/home-leadership', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: card.id, isActive: nextState }),
      })
      if (res.ok) {
        const saved: CardData = await res.json()
        /* সার্ভার-নিশ্চিত মানে চূড়ান্ত-করা (রেস-কন্ডিশন-নিরাপদ) */
        setCards((prev) =>
          prev.map((c) =>
            c.id === card.id ? { ...c, isActive: Boolean(saved.isActive) } : c
          )
        )
      } else {
        /* ব্যর্থ হলে আগের-অবস্থায় ফিরে যাওয়া */
        setCards((prev) =>
          prev.map((c) => (c.id === card.id ? { ...c, isActive: !nextState } : c))
        )
        flashStatus(card.id, 'error')
      }
    } catch {
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, isActive: !nextState } : c))
      )
    } finally {
      setToggleBusy(null)
    }
  }

  /* ─── নতুন কার্ড তৈরি — ডিফল্ট লুকানো (isActive=false); তৈরি-হলেই ইনলাইন-এডিটর খোলা ─── */
  const handleAddNew = async (category: 'FOUNDING' | 'CURRENT') => {
    const meta = SECTION_META[category]
    try {
      const res = await fetch('/api/admin/home-leadership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          name: '',
          role: meta.defaultRole,
          term: meta.defaultTerm,
          quote: '',
          imageUrl: '',
          isActive: false, /* তৈরির-সময় লুকানো — তথ্য-পূর্ণ করে সুইচ-অন করুন */
        }),
      })
      if (res.ok) {
        const created: CardData = await res.json()
        setCards((prev) => [...prev, created])
        setEditingId(created.id)
        setFormData(created)
        setCustomTermMode(false)
      } else {
        const j = await res.json().catch(() => null)
        console.error('create failed:', j)
      }
    } catch {
      /* নেটওয়ার্ক-ব্যর্থ — প্যানেল চালু থাকবে */
    }
  }

  /* ─── ইনলাইন-সম্পাদনা নিয়ন্ত্রণ ─── */
  const handleStartEdit = (card: CardData) => {
    setEditingId(card.id)
    setFormData({ ...card })
    setCustomTermMode(Boolean(card.term) && !ACADEMIC_SESSIONS.includes(card.term))
  }

  const handleCancelEdit = () => {
    setEditingId(null)
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
  const handleSave = async (cardId: string) => {
    if (!formData) return
    setSaveStatus((prev) => ({ ...prev, [cardId]: 'saving' }))
    try {
      const res = await fetch('/api/admin/home-leadership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        const saved: CardData = await res.json()
        setCards((prev) => prev.map((c) => (c.id === cardId ? saved : c)))
        setSaveStatus((prev) => ({ ...prev, [cardId]: 'success' }))
        setEditingId(null)
        setFormData(null)
        setCustomTermMode(false)
        clearTimeout(statusTimers.current[cardId])
        statusTimers.current[cardId] = setTimeout(() => {
          setSaveStatus((prev) => ({ ...prev, [cardId]: '' }))
        }, 2500)
      } else {
        setSaveStatus((prev) => ({ ...prev, [cardId]: 'error' }))
      }
    } catch {
      setSaveStatus((prev) => ({ ...prev, [cardId]: 'error' }))
    }
  }

  /* ─── দুই-ধাপ ডিলিট — কোনো confirm() পপ-আপ নেই; ৩ সেকেন্ডে নিজে-ই disarm ─── */
  const handleDelete = async (cardId: string) => {
    if (deleteArmed !== cardId) {
      setDeleteArmed(cardId)
      clearTimeout(deleteTimers.current[cardId])
      deleteTimers.current[cardId] = setTimeout(() => {
        setDeleteArmed((prev) => (prev === cardId ? null : prev))
      }, 3000)
      return
    }
    setDeleteArmed(null)
    clearTimeout(deleteTimers.current[cardId])
    try {
      const res = await fetch(`/api/admin/home-leadership?id=${encodeURIComponent(cardId)}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setCards((prev) => prev.filter((c) => c.id !== cardId))
        if (editingId === cardId) handleCancelEdit()
      } else {
        flashStatus(cardId, 'error')
      }
    } catch {
      flashStatus(cardId, 'error')
    }
  }

  /* ─── ↑ ↓ ক্রম-বদল — একই-সেকশনের প্রতিবেশীর সাথে order-আদান-প্রদান ─── */
  const handleReorder = async (card: CardData, dir: -1 | 1) => {
    const siblings = cards
      .filter((c) => c.category === card.category)
      .sort((a, b) => a.order - b.order || (a.createdAt || "").localeCompare(b.createdAt || ""))
    const idx = siblings.findIndex((c) => c.id === card.id)
    const neighbor = siblings[idx + dir]
    if (!neighbor) return
    const myOrder = card.order
    const theirOrder = neighbor.order
    /* অপটিমিস্টিক লোকাল-সোয়াপ */
    setCards((prev) =>
      prev.map((c) =>
        c.id === card.id
          ? { ...c, order: theirOrder }
          : c.id === neighbor.id
            ? { ...c, order: myOrder }
            : c
      )
    )
    setReorderBusy(card.id)
    try {
      const post = (payload: Record<string, unknown>) =>
        fetch('/api/admin/home-leadership', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      const [r1, r2] = await Promise.all([
        post({ id: card.id, order: theirOrder, name: card.name, role: card.role, term: card.term, quote: card.quote, imageUrl: card.imageUrl, isActive: card.isActive }),
        post({ id: neighbor.id, order: myOrder, name: neighbor.name, role: neighbor.role, term: neighbor.term, quote: neighbor.quote, imageUrl: neighbor.imageUrl, isActive: neighbor.isActive }),
      ])
      if (!r1.ok || !r2.ok) {
        /* রোলব্যাক */
        setCards((prev) =>
          prev.map((c) =>
            c.id === card.id
              ? { ...c, order: myOrder }
              : c.id === neighbor.id
                ? { ...c, order: theirOrder }
                : c
          )
        )
        flashStatus(card.id, 'error')
      }
    } catch {
      setCards((prev) =>
        prev.map((c) =>
          c.id === card.id
            ? { ...c, order: myOrder }
            : c.id === neighbor.id
              ? { ...c, order: theirOrder }
              : c
        )
      )
      flashStatus(card.id, 'error')
    } finally {
      setReorderBusy(null)
    }
  }

  /* ─── কার্ড-রেন্ডারার ─── */
  const renderCard = (card: CardData, siblingsCount: number) => {
    const isEditing = editingId === card.id
    const current = isEditing && formData ? formData : card
    const status = saveStatus[card.id]
    const isEmpty = !card.name

    return (
      <div
        key={card.id}
        className={`bg-white border rounded-[10px] p-4 shadow-2xs flex flex-col justify-between transition-all duration-150 relative ${
          isEditing
            ? 'border-[#006A4E] ring-1 ring-[#006A4E]'
            : 'border-[#CED0D4] hover:border-[#006A4E]/50'
        } ${!card.isActive && !isEditing ? 'opacity-60' : ''}`}
      >
        {/* স্লট-ট্যাগ + ★ অন/অফ টগল-সুইচ + ইনলাইন-স্টেটাস */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-[4px] border truncate ${
              card.isActive
                ? 'bg-emerald-50 text-[#006A4E] border-emerald-200'
                : 'bg-[#F0F2F5] text-[#8A8D91] border-[#CED0D4]'
            }`}
          >
            {card.role || 'সদস্য'}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <StatusPill status={status} />
            {/* ★ একদম অন-অফ সুইচের মতো — ক্লিকেই হোমপেজে দেখাও/লুকাও */}
            <ToggleWithLabel
              on={card.isActive}
              disabled={toggleBusy === card.id}
              onClick={() => handleToggleVisibility(card, !card.isActive)}
            />
          </div>
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
              <label className="text-[11px] font-bold text-[#65676B] block mb-0.5">
                সদস্যের নাম
              </label>
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
                placeholder="যেমন: সভাপতি, উপদেষ্টা"
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
              <label className="text-[11px] font-bold text-[#65676B] block mb-0.5">
                বক্তব্য / বাণী
              </label>
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
                onClick={() => handleSave(card.id)}
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
                /* নতুন-কার্ড: কোনো সতর্কবার্তা নয় — সরাসরি ইনপুটের আমন্ত্রণ */
                <div className="border border-dashed border-emerald-300 bg-emerald-50/40 rounded-[8px] p-4 text-center my-2">
                  <span className="text-lg block mb-1" aria-hidden>
                    ✍️
                  </span>
                  <p className="text-xs font-bold text-[#006A4E]">সদস্য যুক্ত নেই</p>
                  <p className="text-[10.5px] text-[#65676B] mt-0.5">
                    &quot;তথ্য দিন&quot; চেপে সরাসরি নাম, ছবি ও বাণী লিখে সেভ করুন — তারপর
                    উপরের সুইচ-অন করলেই হোমপেজে দেখা যাবে
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-emerald-200 bg-emerald-50 shrink-0 flex items-center justify-center">
                      {card.imageUrl ? (
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-[#006A4E]">
                          {card.name.slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-bold text-[#050505] truncate">
                        {card.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-[#006A4E] truncate">
                        {card.role}
                      </p>
                      <span className="text-[10px] text-[#65676B] block">{card.term}</span>
                    </div>
                  </div>
                  <div className="bg-[#FAFBFB] border border-[#E4E6EB] rounded-[6px] p-2 mb-3">
                    <p className="text-[11px] text-[#4B4C4F] font-kalpurush line-clamp-3 leading-relaxed">
                      {card.quote ? `“${card.quote}”` : 'কোনো বক্তব্য যুক্ত করা হয়নি'}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E4E6EB]">
              <div className="flex items-center gap-1">
                {/* ↑ ↓ ক্রম-বদল */}
                <span
                  className="inline-flex flex-col mr-0.5"
                  role="group"
                  aria-label="কার্ডের ক্রম বদলান"
                >
                  <button
                    type="button"
                    onClick={() => handleReorder(card, -1)}
                    disabled={reorderBusy === card.id}
                    title="এক-ঘর উপরে"
                    aria-label="এক-ঘর উপরে"
                    className="text-[#8A8D91] hover:text-[#006A4E] disabled:opacity-40 cursor-pointer leading-none"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(card, 1)}
                    disabled={reorderBusy === card.id}
                    title="এক-ঘর নিচে"
                    aria-label="এক-ঘর নিচে"
                    className="text-[#8A8D91] hover:text-[#006A4E] disabled:opacity-40 cursor-pointer leading-none"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </span>
                {/* দুই-ধাপ ডিলিট (কোনো confirm() পপ-আপ নেই) */}
                <button
                  type="button"
                  onClick={() => handleDelete(card.id)}
                  className={`text-[11px] font-bold cursor-pointer transition ${
                    deleteArmed === card.id
                      ? 'text-white bg-rose-600 hover:bg-rose-700 px-2 py-0.5 rounded-[5px]'
                      : 'text-rose-600 hover:underline'
                  }`}
                >
                  {deleteArmed === card.id ? 'নিশ্চিতভাবে মুছুন?' : 'মুছে ফেলুন'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleStartEdit(card)}
                className="shrink-0 px-3 py-1 bg-[#006A4E] hover:bg-[#00523C] text-white rounded-[6px] text-xs font-bold transition cursor-pointer"
              >
                {isEmpty ? 'তথ্য দিন' : 'সম্পাদনা'}
              </button>
            </div>
          </div>
        )}
        {siblingsCount > 0 && null /* order-সচেতনতা: সেকশনে আরও কার্ড থাকলে ↑↓ অর্থবহ */}
      </div>
    )
  }

  const founding = cards
    .filter((c) => c.category === 'FOUNDING')
    .sort((a, b) => a.order - b.order)
  const currentSec = cards
    .filter((c) => c.category === 'CURRENT')
    .sort((a, b) => a.order - b.order)
  const filledCount = cards.filter((c) => c.name).length
  const visibleCount = cards.filter((c) => c.name && c.isActive).length

  return (
    <div className="font-hind text-[#050505]">
      <AdminGate state={gateState} adminCandidates={adminCandidates}>
        {/* হেডার */}
        <div className="bg-white border border-[#CED0D4] rounded-[10px] p-4 sm:p-5 shadow-2xs mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#050505] flex items-center gap-2">
              <span aria-hidden>👥</span>
              <span>হোম নেতৃত্ব ব্যবস্থাপনা</span>
            </h1>
            <p className="text-xs text-[#65676B] mt-0.5">
              এখানে যা সংরক্ষণ করবেন, মূল হোমপেজের নেতৃত্ব-সেকশনে সাথে-সাথে হুবহু তা-ই দেখাবে
              {filledCount > 0 && (
                <>
                  {' '}
                  — {visibleCount}/{filledCount}টি কার্ড হোমপেজে দৃশ্যমান
                </>
              )}
              {visibleCount === 0 && (
                <> — নতুন উপদেষ্টা নিয়োগ না-দেওয়া পর্যন্ত সুইচ-অফ রাখুন, কার্ড হাইড থাকবে</>
              )}
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
              href="/admin"
              className="px-3 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded-[8px] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ড্যাশবোর্ড</span>
            </Link>
          </div>
        </div>

        {/* লোডিং / এরর */}
        {isLoading ? (
          <div className="bg-white border border-[#CED0D4] rounded-[10px] p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#006A4E]" />
            <p className="text-xs text-[#65676B] mt-2">কার্ড-ডাটা লোড হচ্ছে...</p>
          </div>
        ) : loadError ? (
          <div className="bg-white border border-[#CED0D4] rounded-[10px] p-8 text-center">
            <p className="text-sm text-[#050505] font-bold mb-2">ডাটা লোড করা যায়নি</p>
            <button
              type="button"
              onClick={() => {
                recheck()
                loadData()
              }}
              className="px-4 py-2 bg-[#006A4E] hover:bg-[#00523C] text-white rounded-[8px] text-xs font-bold transition cursor-pointer"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : (
          (['FOUNDING', 'CURRENT'] as const).map((cat) => {
            const list = cat === 'FOUNDING' ? founding : currentSec
            const meta = SECTION_META[cat]
            return (
              <div key={cat} className={cat === 'FOUNDING' ? 'mb-6' : ''}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h2 className="text-sm font-bold text-[#050505] flex items-center gap-2">
                    <span aria-hidden>{meta.icon}</span>
                    <span>{meta.title}</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => handleAddNew(cat)}
                    className="self-start px-3.5 py-1.5 bg-[#006A4E] hover:bg-[#00523C] text-white rounded-[8px] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <span aria-hidden>＋</span>
                    <span>{meta.addLabel}</span>
                  </button>
                </div>
                {list.length === 0 ? (
                  <div className="border border-dashed border-[#CED0D4] bg-white/60 rounded-[10px] p-6 text-center">
                    <p className="text-xs font-bold text-[#050505]">এখনো কোনো কার্ড নেই</p>
                    <p className="text-[11px] text-[#65676B] mt-1">
                      উপরের &quot;＋ {meta.addLabel}&quot; বাটনে ক্লিক করে প্রথম কার্ডটি
                      তৈরি করুন — তৈরি-হলেও সুইচ-অফ থাকলে হোমপেজে দেখাবে না
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {list.map((c) => renderCard(c, list.length))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </AdminGate>
    </div>
  )
}
