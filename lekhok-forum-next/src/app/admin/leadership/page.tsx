'use client'

/**
 * Session 189 — নেতৃত্ব ও উপদেষ্টা পরিষদ ব্যবস্থাপনা (অ্যাডমিন প্যানেল)
 *
 * ইউজার-স্পেক অনুযায়ী: প্রতিষ্ঠাতা পরিষদ (FOUNDING) ও বর্তমান নেতৃত্ব (CURRENT) —
 * দুই ট্যাবে নাম / পদবী / কার্যবর্ষ / ছবি / বাণী সরাসরি যোগ-সম্পাদনা-মুছে ফেলা যায়।
 * ছবি: লোকাল ফাইল → ক্লায়েন্ট-কমপ্রেস (EXIF-ঠিক, ৬৪০px, JPEG/PNG) → data-URI,
 * অথবা সরাসরি ইমেজ URL — দুটোই সমর্থিত (স্পেক-অনুযায়ী)।
 * স্পেক-বাইরে সংযোজন: role-গার্ড (অ্যাডমিন-না-হলে সুইচ-গেট), টোস্ট-ফিডব্যাক,
 * কার্ডে উপরে/নিচে দ্রুত-ক্রম-বিনিময়, লাইভ-কাউন্ট ব্যাজ।
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { bn } from '@/lib/format'
import type { FrontendUser } from '@/lib/types'

export interface LeaderItem {
  id: string
  category: 'FOUNDING' | 'CURRENT'
  name: string
  role: string
  term: string
  quote: string
  imageUrl?: string | null
  order: number
}

/* ─── অ্যাভাটার-কমপ্রেশন: EXIF-রোটেশন ঠিক + দীর্ঘ-বাহু ৬৪০px + JPEG q0.85 (স্বচ্ছ PNG রক্ষা) ─── */
const AVATAR_MAX_DIM = 640
const AVATAR_QUALITY = 0.85

async function compressAvatar(file: File): Promise<string> {
  // ছোট ফাইল ও কমপ্রেস-অযোগ্য ধরন — সরাসরি data-URI
  const passThrough = file.size <= 60 * 1024 || !['image/jpeg', 'image/png', 'image/webp', 'image/bmp'].includes(file.type)
  if (passThrough || typeof createImageBitmap !== 'function') {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, AVATAR_MAX_DIM / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas পাওয়া যায়নি')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()

  // স্বচ্ছতা থাকলে PNG (JPEG-এ কালো হয়ে যায়), নাহলে JPEG
  let hasAlpha = false
  if (file.type === 'image/png' || file.type === 'image/webp') {
    const d = ctx.getImageData(0, 0, Math.min(w, 64), Math.min(h, 64)).data
    for (let i = 3; i < d.length; i += 4) {
      if (d[i] < 250) { hasAlpha = true; break }
    }
  }
  const mime = hasAlpha ? 'image/png' : 'image/jpeg'
  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error('কমপ্রেশন ব্যর্থ'))
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      },
      mime,
      AVATAR_QUALITY
    )
  })
}

type Category = 'FOUNDING' | 'CURRENT'

const CATEGORY_META: Record<Category, { label: string; emptyHint: string }> = {
  FOUNDING: {
    label: '🏛️ নেতৃত্বের ধারা (প্রতিষ্ঠাতা পরিষদ)',
    emptyHint: 'প্রতিষ্ঠাতা পরিষদের সদস্য যুক্ত নেই।',
  },
  CURRENT: {
    label: '🌟 বর্তমান নেতৃত্ব',
    emptyHint: 'বর্তমান নেতৃত্বের সদস্য যুক্ত নেই।',
  },
}

export default function AdminLeadershipPage() {
  const { toast } = useToast()
  const [activeCategory, setActiveCategory] = useState<Category>('FOUNDING')
  const [leaders, setLeaders] = useState<LeaderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sessionState, setSessionState] = useState<'loading' | 'ok' | 'denied'>('loading')
  const [adminCandidates, setAdminCandidates] = useState<FrontendUser[]>([])

  // মোডাল ও ফর্ম স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    term: '',
    quote: '',
    imageUrl: '',
    order: 1,
  })
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ─── সেশন-গার্ড: অ্যাডমিন না হলে ডেমো-সুইচ-গেট ─── */
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/session')
        const data = await res.json()
        const admins = (data.users || []).filter((u: FrontendUser) => u.role === 'admin')
        setAdminCandidates(admins)
        setSessionState(data.current?.role === 'admin' ? 'ok' : 'denied')
      } catch {
        setSessionState('denied')
      }
    })()
  }, [])

  /* ─── ডেমো-সুইচ: অ্যাডমিন-অ্যাকাউন্টে গিয়ে প্যানেল আনলক ─── */
  const switchToAdmin = async (userId: string) => {
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        setSessionState('ok')
        toast({ title: 'অ্যাডমিন অ্যাকাউন্টে সুইচ হয়েছে ✅' })
      } else {
        toast({ title: 'সুইচ ব্যর্থ হয়েছে', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'সার্ভার এরর', variant: 'destructive' })
    }
  }

  // ডাটা লোড
  const fetchLeaders = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/leadership')
      if (res.ok) {
        const data = await res.json()
        setLeaders(data)
      } else if (res.status === 403) {
        setSessionState('denied')
      } else {
        toast({ title: 'ডাটা লোড ব্যর্থ হয়েছে', variant: 'destructive' })
      }
    } catch (err) {
      console.error('ডাটা লোড ব্যর্থ:', err)
      toast({ title: 'সার্ভারের সাথে যোগাযোগ ব্যর্থ', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (sessionState === 'ok') fetchLeaders()
  }, [sessionState, fetchLeaders])

  // ক্যাটাগরি অনুযায়ী ফিল্টার
  const currentList = leaders
    .filter((item) => item.category === activeCategory)
    .sort((a, b) => a.order - b.order)

  // নতুন যোগ করার মোডাল খোলা
  const handleAddNew = () => {
    setEditingId(null)
    setFormData({
      name: '',
      role: '',
      term: activeCategory === 'FOUNDING' ? '(২০২০-২১ কার্যবর্ষ)' : '(২০২৫-২৬ কার্যবর্ষ)',
      quote: '',
      imageUrl: '',
      order: currentList.length + 1,
    })
    setImagePreview('')
    setIsModalOpen(true)
  }

  // সম্পাদনা (Edit) মোডাল খোলা
  const handleEdit = (item: LeaderItem) => {
    setEditingId(item.id)
    setFormData({
      name: item.name,
      role: item.role,
      term: item.term,
      quote: item.quote,
      imageUrl: item.imageUrl || '',
      order: item.order || 1,
    })
    setImagePreview(item.imageUrl || '')
    setIsModalOpen(true)
  }

  // ক্রম-বিনিময় (উপরে/নিচে) — প্রতিবেশীর সাথে order অদলবদল
  const handleMove = async (item: LeaderItem, dir: -1 | 1) => {
    const idx = currentList.findIndex((x) => x.id === item.id)
    const neighbor = currentList[idx + dir]
    if (!neighbor) return
    setBusyId(item.id)
    try {
      await Promise.all([
        fetch('/api/admin/leadership', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...item, order: neighbor.order }),
        }),
        fetch('/api/admin/leadership', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...neighbor, order: item.order }),
        }),
      ])
      await fetchLeaders()
    } catch {
      toast({ title: 'ক্রম পরিবর্তন ব্যর্থ', variant: 'destructive' })
    } finally {
      setBusyId(null)
    }
  }

  // লোকাল ফাইল থেকে ছবি আপলোড হ্যান্ডলার (কমপ্রেস-সহ)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUri = await compressAvatar(file)
      setImagePreview(dataUri)
      setFormData((prev) => ({ ...prev, imageUrl: dataUri }))
    } catch {
      toast({ title: 'ছবি প্রসেস করা যায়নি — অন্য ছবি দিন', variant: 'destructive' })
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ফর্ম সাবমিট (Create বা Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const payload = {
      ...formData,
      category: activeCategory,
      id: editingId,
    }

    try {
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/leadership', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setIsModalOpen(false)
        toast({
          title: editingId
            ? `“${payload.name}”-এর তথ্য হালনাগাদ হয়েছে ✅`
            : `“${payload.name}” যুক্ত হয়েছে ✅`,
        })
        await fetchLeaders()
      } else {
        const data = await res.json().catch(() => null)
        toast({ title: data?.error || 'তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে', variant: 'destructive' })
      }
    } catch (err) {
      console.error(err)
      toast({ title: 'সার্ভার এরর', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  // মুছে ফেলা (Delete)
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে “${name}”-এর তথ্য মুছে ফেলতে চান?`)) return

    try {
      const res = await fetch(`/api/admin/leadership?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: `“${name}” মুছে ফেলা হয়েছে 🗑️` })
        fetchLeaders()
      } else {
        toast({ title: 'মুছতে ব্যর্থ হয়েছে', variant: 'destructive' })
      }
    } catch (err) {
      console.error(err)
      toast({ title: 'সার্ভার এরর', variant: 'destructive' })
    }
  }

  /* ─── সেশন-গেট স্ক্রিন ─── */
  if (sessionState !== 'ok') {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4 font-hind text-[#050505]">
        <div className="bg-white border border-[#CED0D4] rounded-[10px] p-6 max-w-sm w-full text-center shadow-2xs">
          {sessionState === 'loading' ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#006A4E]" />
          ) : (
            <>
              <div className="text-3xl mb-2">🔒</div>
              <h1 className="text-sm font-bold mb-1">অ্যাডমিন অনুমতি প্রয়োজন</h1>
              <p className="text-xs text-[#65676B] mb-4">
                এই প্যানেল ব্যবহার করতে অ্যাডমিন অ্যাকাউন্টে থাকতে হবে।
                {adminCandidates.length > 0 && ' নিচের অ্যাকাউন্টে সুইচ করুন (ডেমো):'}
              </p>
              {adminCandidates.length > 0 && (
                <div className="space-y-1.5">
                  {adminCandidates.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => switchToAdmin(u.id)}
                      className="w-full px-3 py-2 bg-[#006A4E] hover:bg-[#00523C] text-white rounded-[8px] text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
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
                </div>
              )}
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-[#006A4E] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> ফিডে ফিরে যান
              </Link>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-hind text-[#050505] select-none">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">

        {/* হেডার ও অ্যাকশন বার */}
        <div className="bg-white border border-[#CED0D4] rounded-[10px] p-4 sm:p-5 shadow-2xs mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#050505] flex items-center gap-2">
              <span>👥</span>
              <span>নেতৃত্ব ও উপদেষ্টা পরিষদ ব্যবস্থাপনা</span>
            </h1>
            <p className="text-xs text-[#65676B] mt-0.5">
              হোমপেজের প্রতিষ্ঠাতা ও বর্তমান কমিটির নাম, পদবী, ছবি ও বাণী পরিবর্তন করুন
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded-[8px] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ফিডে ফিরুন</span>
            </Link>
            <button
              type="button"
              onClick={handleAddNew}
              className="px-4 py-2 bg-[#006A4E] hover:bg-[#00523C] text-white rounded-[8px] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>＋</span>
              <span>নতুন সদস্য যুক্ত করুন</span>
            </button>
          </div>
        </div>

        {/* ক্যাটাগরি সুইচ ট্যাব */}
        <div className="flex items-center flex-wrap gap-2 mb-4">
          {(Object.keys(CATEGORY_META) as Category[]).map((cat) => {
            const count = leaders.filter((l) => l.category === cat).length
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-[8px] text-xs font-bold border transition cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#006A4E] text-white border-[#006A4E] shadow-2xs'
                    : 'bg-white text-[#65676B] border-[#CED0D4] hover:bg-[#F0F2F5]'
                }`}
              >
                {CATEGORY_META[cat].label}
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeCategory === cat ? 'bg-white/20 text-white' : 'bg-[#E4E6EB] text-[#65676B]'
                  }`}
                >
                  {bn(count)}
                </span>
              </button>
            )
          })}
        </div>

        {/* সদস্যদের তালিকা কার্ড ভিউ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full bg-white p-8 text-center text-xs text-[#65676B] rounded-[10px] border border-[#CED0D4]">
              ডাটা লোড হচ্ছে...
            </div>
          ) : currentList.length === 0 ? (
            <div className="col-span-full bg-white p-8 text-center text-xs text-[#65676B] rounded-[10px] border border-[#CED0D4]">
              {CATEGORY_META[activeCategory].emptyHint} উপরে &quot;নতুন সদস্য যুক্ত করুন&quot; বাটনে ক্লিক করুন।
            </div>
          ) : (
            currentList.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white border border-[#CED0D4] rounded-[10px] p-4 shadow-2xs flex flex-col justify-between relative group hover:border-[#006A4E]/50 transition"
              >
                <div>
                  {/* ছবি ও মেটাডাটা */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-emerald-200 bg-emerald-50 shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg text-[#006A4E] font-bold">{item.name.slice(0, 2)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-[#050505] truncate">{item.name}</h3>
                      <p className="text-xs font-semibold text-[#006A4E] truncate">{item.role}</p>
                      <span className="text-[11px] text-[#65676B] block">{item.term}</span>
                    </div>
                  </div>

                  {/* বাণী প্রিভিউ */}
                  <div className="bg-[#FAFBFB] border border-[#E4E6EB] rounded-[6px] p-2 mb-3 min-h-[52px]">
                    <p className="text-[11.5px] text-[#4B4C4F] font-kalpurush line-clamp-3 leading-relaxed">
                      {item.quote ? `“${item.quote}”` : <span className="italic text-[#8a8d91]">বাণী যোগ করা হয়নি</span>}
                    </p>
                  </div>
                </div>

                {/* অ্যাকশন বাটনসমূহ (ক্রম + সম্পাদনা + মুছুন) */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-[#E4E6EB]">
                  <div className="flex items-center rounded-[6px] overflow-hidden border border-[#E4E6EB]">
                    <button
                      type="button"
                      disabled={idx === 0 || busyId === item.id}
                      onClick={() => handleMove(item, -1)}
                      className="px-2 py-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] disabled:opacity-40 disabled:cursor-not-allowed text-[#050505] text-xs font-bold transition cursor-pointer"
                      title="এক ধাপ উপরে"
                    >
                      ↑
                    </button>
                    <span className="px-1.5 py-1.5 bg-white text-[10px] text-[#65676B] border-x border-[#E4E6EB] tabular-nums">
                      #{bn(item.order)}
                    </span>
                    <button
                      type="button"
                      disabled={idx === currentList.length - 1 || busyId === item.id}
                      onClick={() => handleMove(item, 1)}
                      className="px-2 py-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] disabled:opacity-40 disabled:cursor-not-allowed text-[#050505] text-xs font-bold transition cursor-pointer"
                      title="এক ধাপ নিচে"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="flex-1 py-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded-[6px] text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>✏️</span>
                    <span>সম্পাদনা</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.name)}
                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-[6px] text-xs font-bold transition cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ================= পপ-আপ মডাল: নতুন যোগ / সম্পাদনা ================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-3"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false)
          }}
        >
          <div className="bg-white border border-[#CED0D4] rounded-[10px] w-full max-w-[520px] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">

            {/* মোডাল হেডার */}
            <div className="p-3.5 px-4 bg-[#FAFBFB] border-b border-[#E4E6EB] flex items-center justify-between sticky top-0">
              <h2 className="text-sm font-bold text-[#050505]">
                {editingId ? 'সদস্যের তথ্য সম্পাদনা করুন' : 'নতুন সদস্য যোগ করুন'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-base text-[#65676B] hover:text-[#050505] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* ফর্ম বডি */}
            <form onSubmit={handleSubmit} className="p-4 space-y-3">

              {/* ছবি নির্বাচন ও লাইভ প্রিভিউ */}
              <div className="flex items-center gap-3 bg-[#FAFBFB] p-2.5 rounded-[8px] border border-[#E4E6EB]">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-emerald-300 bg-white shrink-0 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="প্রিভিউ" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-[#65676B]">ছবি নেই</span>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <label className="text-xs font-bold text-[#050505] block">
                    প্রোফাইল ছবি <span className="font-normal text-[#65676B]">(স্বয়ংক্রিয় কমপ্রেস)</span>:
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="block w-full text-[11px] text-[#65676B] file:mr-2 file:py-1 file:px-2 file:rounded-[4px] file:border-0 file:text-[11px] file:font-bold file:bg-[#006A4E] file:text-white cursor-pointer"
                  />
                  <input
                    type="url"
                    placeholder="অথবা সরাসরি ইমেজ লিংক (URL) দিন"
                    value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, imageUrl: e.target.value })
                      setImagePreview(e.target.value)
                    }}
                    className="w-full bg-white border border-[#CED0D4] rounded-[6px] px-2 py-1 text-xs outline-none focus:border-[#006A4E]"
                  />
                </div>
              </div>

              {/* নাম ও পদবী */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-[#050505] block mb-1">পূর্ণ নাম:</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="যেমন: মো. জহিরুল ইসলাম"
                    className="w-full bg-[#F0F2F5] focus:bg-white border border-[#CED0D4] focus:border-[#006A4E] rounded-[6px] px-2.5 py-1.5 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#050505] block mb-1">পদবী:</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="যেমন: প্রতিষ্ঠাতা সভাপতি"
                    className="w-full bg-[#F0F2F5] focus:bg-white border border-[#CED0D4] focus:border-[#006A4E] rounded-[6px] px-2.5 py-1.5 text-xs outline-none"
                  />
                </div>
              </div>

              {/* কার্যবর্ষ ও ডিসপ্লে ক্রম */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-[#050505] block mb-1">কার্যবর্ষ / সেশন:</label>
                  <input
                    type="text"
                    required
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    placeholder="(২০২০-২১ কার্যবর্ষ)"
                    className="w-full bg-[#F0F2F5] focus:bg-white border border-[#CED0D4] focus:border-[#006A4E] rounded-[6px] px-2.5 py-1.5 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#050505] block mb-1">ক্রম নম্বর (Order):</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full bg-[#F0F2F5] focus:bg-white border border-[#CED0D4] focus:border-[#006A4E] rounded-[6px] px-2.5 py-1.5 text-xs outline-none tabular-nums"
                  />
                </div>
              </div>

              {/* উক্তি / বাণী */}
              <div>
                <label className="text-xs font-bold text-[#050505] block mb-1">
                  বক্তব্য / বাণী <span className="font-normal text-[#65676B]">(ঐচ্ছিক)</span>:
                </label>
                <textarea
                  rows={4}
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="সংগঠন নিয়ে বক্তব্য লিখুন..."
                  className="w-full bg-[#F0F2F5] focus:bg-white border border-[#CED0D4] focus:border-[#006A4E] rounded-[6px] p-2.5 text-xs outline-none font-kalpurush resize-y"
                />
              </div>

              {/* সাবমিট বাটন */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded-[6px] text-xs font-bold cursor-pointer transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#006A4E] hover:bg-[#00523C] text-white rounded-[6px] text-xs font-bold cursor-pointer transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}
