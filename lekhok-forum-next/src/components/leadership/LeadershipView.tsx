'use client'

/**
 * হোমপেজের নেতৃত্ব-ভিউ — হোম-নেতৃত্ব-স্লট-ভিত্তিক হুবহু-সিঙ্ক (রি-রাইট)
 *
 * ডেটা-সোর্স: /api/home-leadership (HomeLeadershipSlot-টেবিল) — অ্যাডমিন প্যানেল
 * /admin/home-leadership-এ যা সংরক্ষিত হয়, হোমপেজে সাথে-সাথে হুবহু তা-ই দেখায়।
 *   • দুই সেকশন: 🏛️ নেতৃত্বের ধারা (FOUNDING) + 👥 বর্তমান নেতৃত্ব (CURRENT)
 *   • খালি-স্লট (name="") পাবলিক-ভিউতে রেন্ডার-ই হয় না — কোনো "সদস্য বসেনি"
 *     সতর্কবার্তা নেই; পুরো-সেকশন খালি হলে সেকশন-ই লুকায়।
 * অ্যাপের ডার্ক-থিম টোকেন (bg-[#242526]/border-[#3e4042]/accent #00a86b)।
 * নোট: পুরনো কমিটি-ভিউ (/api/leadership, LeadershipMember) প্যানেল /admin/leadership-সহ
 * অক্ষত আছে — এই ভিউ এখন হোম-নেতৃত্ব-স্লট চালিত।
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Crown, Landmark, Loader2, PencilLine, RefreshCw, ShieldCheck } from 'lucide-react'
import { bn } from '@/lib/format'
import type { FrontendUser } from '@/lib/types'

interface HomeSlot {
  slotKey: string
  section: string
  name: string
  role: string
  term: string
  quote: string
  imageUrl: string
}

const SECTION_META = {
  FOUNDING: {
    title: 'নেতৃত্বের ধারা',
    subtitle: 'প্রতিষ্ঠাতা ও প্রতিষ্ঠাকালীন উপদেষ্টা — যাঁদের হাত ধরে যাত্রা শুরু',
    icon: <Landmark className="w-4 h-4" />,
  },
  CURRENT: {
    title: 'বর্তমান নেতৃত্ব',
    subtitle: 'চলমান কার্যবর্ষের কার্যনির্বাহী ও উপদেষ্টা',
    icon: <Crown className="w-4 h-4" />,
  },
} as const

function SlotAvatar({ name, url }: { name: string; url: string }) {
  return (
    <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-[#00a86b]/40 ring-offset-2 ring-offset-[#242526] bg-[#0d4a3a] shrink-0 flex items-center justify-center">
      {url ? (
         
        <img src={url} alt={name} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <span className="text-base font-bold text-[#33d79f]">{name.trim().slice(0, 2)}</span>
      )}
    </div>
  )
}

function SlotCard({ slot }: { slot: HomeSlot }) {
  return (
    <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-4 flex flex-col gap-3 hover:border-[#00a86b]/40 transition-colors">
      <div className="flex items-center gap-3">
        <SlotAvatar name={slot.name} url={slot.imageUrl} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-bold text-[#e4e6eb] truncate leading-snug">{slot.name}</h3>
          {slot.role && (
            <span className="inline-flex items-center max-w-full mt-1 px-2 py-0.5 rounded-full bg-[#0d4a3a] text-[#33d79f] text-[11px] font-bold truncate">
              {slot.role}
            </span>
          )}
          {slot.term && <span className="block mt-1 text-[11px] text-[#8a8d91]">{slot.term}</span>}
        </div>
      </div>

      {slot.quote && (
        <div className="relative bg-[#1c1d1f] border border-[#3e4042] rounded-lg px-3 py-2.5">
          <span
            aria-hidden
            className="absolute -top-2 left-2.5 text-2xl leading-none font-serif text-[#00a86b]/70 select-none"
          >
            “
          </span>
          <p className="font-kalpurush text-[12.5px] leading-relaxed text-[#bcc0c4]">{slot.quote}</p>
        </div>
      )}
    </div>
  )
}

export default function LeadershipView({
  current,
  onOpenProfile: _onOpenProfile,
}: {
  current: FrontendUser | null
  onOpenProfile?: (username: string) => void
}) {
  const [slots, setSlots] = useState<HomeSlot[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch('/api/home-leadership')
      if (!res.ok) throw new Error('fail')
      const data = await res.json()
      setSlots(Array.isArray(data.slots) ? data.slots : [])
    } catch {
      setError('নেতৃত্ব-তথ্য লোড করা যায়নি')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (error) {
    return (
      <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-8 text-center">
        <p className="text-sm text-[#b0b3b8] mb-3">{error}</p>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#006a4e] hover:bg-[#00523c] text-white rounded-lg text-xs font-bold transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> আবার চেষ্টা করুন
        </button>
      </div>
    )
  }

  if (slots === null) {
    return (
      <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-6 space-y-4">
        <div className="h-5 w-44 bg-[#3a3b3c] rounded animate-pulse" />
        <div className="grid sm:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-[#3e4042] rounded-xl p-4 flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#3a3b3c] animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/3 bg-[#3a3b3c] rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-[#3a3b3c] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-[#8a8d91] flex items-center justify-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> নেতৃত্ব লোড হচ্ছে...
        </p>
      </div>
    )
  }

  const filled = slots.filter((s) => s.name.trim())
  const bySection = (sec: 'FOUNDING' | 'CURRENT') => filled.filter((s) => s.section === sec)

  return (
    <div className="space-y-3">
      {/* হেডার */}
      <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold text-[#e4e6eb] flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-[#00a86b]" /> সংগঠনের নেতৃত্ব
          </h2>
          <p className="text-xs text-[#8a8d91] mt-0.5">
            {filled.length > 0
              ? `প্রতিষ্ঠাতা ও বর্তমান নেতৃত্ব — ${bn(filled.length)} জন`
              : 'প্রতিষ্ঠাতা ও বর্তমান নেতৃত্বের তথ্য শীঘ্রই এখানে যুক্ত হবে'}
          </p>
        </div>
        {current?.role === 'admin' && (
          <Link
            href="/admin/home-leadership"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006a4e] hover:bg-[#00523c] text-white rounded-lg text-[11px] font-bold transition"
          >
            <PencilLine className="w-3.5 h-3.5" /> হোম-নেতৃত্ব প্যানেল
          </Link>
        )}
      </div>

      {filled.length === 0 ? (
        <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-8 text-center">
          <span className="text-2xl block mb-2" aria-hidden>🏛️</span>
          <p className="text-sm text-[#e4e6eb] font-bold">নেতৃত্বের তথ্য এখনো যুক্ত হয়নি</p>
          <p className="text-xs text-[#8a8d91] mt-1">
            {current?.role === 'admin' ? (
              <>
                <Link href="/admin/home-leadership" className="text-[#33d79f] font-bold hover:underline">
                  হোম-নেতৃত্ব প্যানেল
                </Link>{' '}
                থেকে সরাসরি তথ্য যোগ করুন — সেভ করলেই এখানে দেখা যাবে
              </>
            ) : (
              'সংগঠনের নেতৃত্ব-পরিষদের তথ্য শীঘ্রই এখানে প্রকাশিত হবে'
            )}
          </p>
        </div>
      ) : (
        (['FOUNDING', 'CURRENT'] as const).map((sec) => {
          const list = bySection(sec)
          if (list.length === 0) return null /* খালি-সেকশন পাবলিক-ভিউতে লুকানো */
          const meta = SECTION_META[sec]
          return (
            <section key={sec} className="bg-[#242526] border border-[#3e4042] rounded-xl p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-[13.5px] font-bold text-[#e4e6eb] flex items-center gap-1.5">
                    <span className="text-[#00a86b]">{meta.icon}</span> {meta.title}
                  </h3>
                  <p className="text-[11px] text-[#8a8d91] mt-0.5">{meta.subtitle}</p>
                </div>
                <span className="text-[11px] font-bold text-[#8a8d91] bg-[#3a3b3c] px-2 py-0.5 rounded-full shrink-0">
                  {bn(list.length)} জন
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {list.map((slot) => (
                  <SlotCard key={slot.slotKey} slot={slot} />
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
