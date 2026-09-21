'use client'

/**
 * Session 189 — হোমপেজের নেতৃত্ব-ভিউ
 *
 * তিন সেকশন: 🏛️ নেতৃত্বের ধারা (প্রতিষ্ঠাতা পরিষদ) + 🌟 বর্তমান নেতৃত্ব + 🎓 উপদেষ্টা পরিষদ (Task61)।
 * ডেটা আসে /api/leadership থেকে (অ্যাডমিন প্যানেল /admin/leadership-এ সম্পাদনাযোগ্য)।
 * অ্যাপের ডার্ক-থিম টোকেন (bg-[#242526]/border-[#3e4042]/accent #00a86b) ব্যবহার।
 * Task61: username-যুক্ত সদস্যের নাম ক্লিকেবল — অ্যাপের প্রোফাইল-ভিউ (?user= ডিপ-লিঙ্ক) খোলে।
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Crown, GraduationCap, Landmark, Loader2, PencilLine, RefreshCw, ShieldCheck } from 'lucide-react'
import { bn } from '@/lib/format'
import type { FrontendUser } from '@/lib/types'

interface LeaderCard {
  id: string
  category: 'FOUNDING' | 'CURRENT' | 'ADVISOR'
  name: string
  role: string
  term: string
  quote: string
  imageUrl: string | null
  username?: string | null
  order: number
}

const SECTION_META = {
  FOUNDING: {
    title: 'নেতৃত্বের ধারা',
    subtitle: 'প্রতিষ্ঠাকালীন পরিষদ — যাঁদের হাত ধরে যাত্রা শুরু',
    icon: <Landmark className="w-4 h-4" />,
  },
  CURRENT: {
    title: 'বর্তমান নেতৃত্ব',
    subtitle: 'চলমান কার্যবর্ষের কার্যনির্বাহী পরিষদ',
    icon: <Crown className="w-4 h-4" />,
  },
  ADVISOR: {
    title: 'উপদেষ্টা পরিষদ',
    subtitle: 'সংগঠনের পরামর্শদাতামণ্ডলী — অভিজ্ঞতার আলো',
    icon: <GraduationCap className="w-4 h-4" />,
  },
} as const

function LeaderAvatar({ name, url, size = 'w-14 h-14' }: { name: string; url: string | null; size?: string }) {
  return (
    <div
      className={`${size} rounded-full overflow-hidden ring-2 ring-[#00a86b]/40 ring-offset-2 ring-offset-[#242526] bg-[#0d4a3a] shrink-0 flex items-center justify-center`}
    >
      {url ? (
        <img src={url} alt={name} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <span className="text-base font-bold text-[#33d79f]">{name.trim().slice(0, 2)}</span>
      )}
    </div>
  )
}

function LeaderCardView({ item, onOpenProfile }: { item: LeaderCard; onOpenProfile?: (username: string) => void }) {
  const openable = Boolean(item.username && onOpenProfile)
  return (
    <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-4 flex flex-col gap-3 hover:border-[#00a86b]/40 transition-colors group">
      <div className="flex items-center gap-3">
        <LeaderAvatar name={item.name} url={item.imageUrl} />
        <div className="min-w-0 flex-1">
          {openable ? (
            <button
              type="button"
              onClick={() => onOpenProfile!(item.username as string)}
              title={`প্রোফাইল দেখুন: @${item.username}`}
              className="block max-w-full text-left text-[14px] font-bold text-[#e4e6eb] truncate leading-snug hover:text-[#33d79f] hover:underline cursor-pointer transition-colors"
            >
              {item.name}
            </button>
          ) : (
            <h3 className="text-[14px] font-bold text-[#e4e6eb] truncate leading-snug">{item.name}</h3>
          )}
          <span className="inline-flex items-center max-w-full mt-1 px-2 py-0.5 rounded-full bg-[#0d4a3a] text-[#33d79f] text-[11px] font-bold truncate">
            {item.role}
          </span>
          {item.term && (
            <span className="block mt-1 text-[11px] text-[#8a8d91]">{item.term}</span>
          )}
        </div>
      </div>

      {item.quote && (
        <div className="relative bg-[#1c1d1f] border border-[#3e4042] rounded-lg px-3 py-2.5">
          <span
            aria-hidden
            className="absolute -top-2 left-2.5 text-2xl leading-none font-serif text-[#00a86b]/70 select-none"
          >
            “
          </span>
          <p className="font-kalpurush text-[12.5px] leading-relaxed text-[#bcc0c4]">
            {item.quote}
          </p>
        </div>
      )}
    </div>
  )
}

export default function LeadershipView({
  current,
  onOpenProfile,
}: {
  current: FrontendUser | null
  onOpenProfile?: (username: string) => void
}) {
  const [members, setMembers] = useState<LeaderCard[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch('/api/leadership')
      if (!res.ok) throw new Error('fail')
      const data = await res.json()
      setMembers(data.members || [])
    } catch {
      setError('নেতৃত্ব-তালিকা লোড করা যায়নি')
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

  if (members === null) {
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

  const byCategory = (cat: 'FOUNDING' | 'CURRENT' | 'ADVISOR') =>
    members.filter((m) => m.category === cat).sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-3">
      {/* হেডার */}
      <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold text-[#e4e6eb] flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-[#00a86b]" /> সংগঠনের নেতৃত্ব
          </h2>
          <p className="text-xs text-[#8a8d91] mt-0.5">
            প্রতিষ্ঠাতা, উপদেষ্টা ও বর্তমান কার্যনির্বাহী পরিষদ — {bn(members.length)} জন
          </p>
        </div>
        {current?.role === 'admin' && (
          <Link
            href="/admin/leadership"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006a4e] hover:bg-[#00523c] text-white rounded-lg text-[11px] font-bold transition"
          >
            <PencilLine className="w-3.5 h-3.5" /> প্যানেল খুলুন
          </Link>
        )}
      </div>

      {(['FOUNDING', 'CURRENT', 'ADVISOR'] as const).map((cat) => {
        const list = byCategory(cat)
        const meta = SECTION_META[cat]
        return (
          <section key={cat} className="bg-[#242526] border border-[#3e4042] rounded-xl p-4">
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

            {list.length === 0 ? (
              <p className="text-xs text-[#8a8d91] bg-[#1c1d1f] border border-[#3e4042] rounded-lg p-3 text-center">
                এই সেকশনে এখনো কেউ যুক্ত হয়নি
                {current?.role === 'admin' && (
                  <> — <Link href="/admin/leadership" className="text-[#33d79f] font-bold hover:underline">অ্যাডমিন প্যানেল</Link> থেকে যোগ করুন</>
                )}
                ।
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {list.map((item) => (
                  <LeaderCardView key={item.id} item={item} onOpenProfile={onOpenProfile} />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
