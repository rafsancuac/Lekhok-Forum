'use client'

/**
 * হোমপেজের নেতৃত্ব-ভিউ — হোম-নেতৃত্ব কার্ড-ভিত্তিক হুবহু-সিঙ্ক + সাইট-কনটেন্ট (রি-রাইট Task63)
 *
 * ডাটা-সোর্স:
 *   • /api/home-leadership (HomeLeaderCard — ডাইনামিক কার্ড) — অ্যাডমিন প্যানেল
 *     /admin/home/leadership-এর হুবহু প্রতিবিম্ব; isActive=false (অন/অফ সুইচ-অফ)
 *     বা খালি-নামের কার্ড এখানে রেন্ডার-ই হয় না (উপদেষ্টা-ঘোষণার আগে লুকানো থাকে)।
 *   • /api/site-content — স্বাগত-বক্তব্য, পরিসংখ্যান-কাউন্টার, লক্ষ্য-উদ্দেশ্য, টাইমলাইন
 *     (সবই /admin/home/welcome, /admin/home/stats, /admin/about/*-প্যানেল থেকে নিয়ন্ত্রিত)।
 *
 * সেন্টার-অ্যালাইনমেন্ট (ইউজার-স্পেক): flex flex-wrap justify-center —
 *   ২টি সক্রিয় কার্ড = ঠিক মাঝের জোড়া (ওভারল্যাপ-ছাড়া পাশাপাশি); ৪টি = পূর্ণ-সারিতে
 *   ব্যালান্সড; কার্ড-প্রস্থ সংখ্যা-অনুযায়ী।
 * অ্যাপের ডার্ক-থিম টোকেন (bg-[#242526]/border-[#3e4042]/accent #00a86b)।
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Crown, Landmark, Loader2, PencilLine, RefreshCw, ShieldCheck } from 'lucide-react'
import { bn } from '@/lib/format'
import type { FrontendUser } from '@/lib/types'

interface HomeCard {
  id: string
  category: string
  name: string
  role: string
  term: string
  quote: string
  imageUrl: string
  order: number
}

interface SiteContentData {
  welcome: { title: string; body: string; isOn: boolean }
  stats: { id: string; label: string; value: string; icon: string }[]
  mission: { title: string; body: string; isOn: boolean }
  timeline: { id: string; year: string; title: string; description: string }[]
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

function SlotCard({ card }: { card: HomeCard }) {
  return (
    <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-4 flex flex-col gap-3 hover:border-[#00a86b]/40 transition-colors w-full text-left">
      <div className="flex items-center gap-3">
        <SlotAvatar name={card.name} url={card.imageUrl} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-bold text-[#e4e6eb] truncate leading-snug">{card.name}</h3>
          {card.role && (
            <span className="inline-flex items-center max-w-full mt-1 px-2 py-0.5 rounded-full bg-[#0d4a3a] text-[#33d79f] text-[11px] font-bold truncate">
              {card.role}
            </span>
          )}
          {card.term && <span className="block mt-1 text-[11px] text-[#8a8d91]">{card.term}</span>}
        </div>
      </div>

      {card.quote && (
        <div className="relative bg-[#1c1d1f] border border-[#3e4042] rounded-lg px-3 py-2.5">
          <span
            aria-hidden
            className="absolute -top-2 left-2.5 text-2xl leading-none font-serif text-[#00a86b]/70 select-none"
          >
            “
          </span>
          <p className="font-kalpurush text-[12.5px] leading-relaxed text-[#bcc0c4]">{card.quote}</p>
        </div>
      )}
    </div>
  )
}

/** কার্ড-প্রস্থ: সক্রিয়-সংখ্যা-অনুযায়ী (২টা=মাঝের-জোড়া, ৩টা=ত্রয়ী, ৪টা+=পূর্ণ-সারি) */
function cardWidthClass(count: number): string {
  if (count >= 4) return 'w-full sm:w-[calc(50%-6px)] lg:w-[calc(25%-9px)] max-w-[290px]'
  if (count === 3) return 'w-full sm:w-[calc(50%-6px)] lg:w-[calc(33.333%-8px)] max-w-[300px]'
  return 'w-full sm:w-[calc(50%-6px)] max-w-[290px]'
}

export default function LeadershipView({
  current,
  onOpenProfile: _onOpenProfile,
}: {
  current: FrontendUser | null
  onOpenProfile?: (username: string) => void
}) {
  const [cards, setCards] = useState<HomeCard[] | null>(null)
  const [content, setContent] = useState<SiteContentData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const [cardsRes, contentRes] = await Promise.all([
        fetch('/api/home-leadership'),
        fetch('/api/site-content').catch(() => null),
      ])
      if (!cardsRes.ok) throw new Error('fail')
      const data = await cardsRes.json()
      setCards(Array.isArray(data.cards) ? data.cards : [])
      if (contentRes && contentRes.ok) {
        const c = await contentRes.json()
        setContent({
          welcome: c.welcome ?? { title: '', body: '', isOn: false },
          stats: Array.isArray(c.stats) ? c.stats : [],
          mission: c.mission ?? { title: '', body: '', isOn: false },
          timeline: Array.isArray(c.timeline) ? c.timeline : [],
        })
      }
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

  if (cards === null) {
    return (
      <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-6 space-y-4">
        <div className="h-5 w-44 bg-[#3a3b3c] rounded animate-pulse" />
        <div className="flex flex-wrap justify-center gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-[calc(25%-9px)] min-w-[150px] border border-[#3e4042] rounded-xl p-4 flex items-center gap-3">
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

  /* টগল-অন + নাম-আছে — সার্ভার-সাইডেও ফিল্টার-করা থাকে; ক্লায়েন্টে দ্বিতীয়-রক্ষাকবচ + order-ক্রম */
  const filled = cards
    .filter((c) => c.name.trim() !== '')
    .sort((a, b) => a.order - b.order)
  const bySection = (sec: 'FOUNDING' | 'CURRENT') => filled.filter((c) => c.category === sec)

  const welcome = content?.welcome
  const stats = content?.stats ?? []
  const mission = content?.mission
  const timeline = content?.timeline ?? []
  const hasWelcome = Boolean(welcome?.isOn && (welcome.title.trim() || welcome.body.trim()))
  const hasMission = Boolean(mission?.isOn && (mission.title.trim() || mission.body.trim()))
  const hasTimeline = timeline.length > 0

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
            href="/admin/home/leadership"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006a4e] hover:bg-[#00523c] text-white rounded-lg text-[11px] font-bold transition"
          >
            <PencilLine className="w-3.5 h-3.5" /> হোম-নেতৃত্ব প্যানেল
          </Link>
        )}
      </div>

      {/* স্বাগত বক্তব্য (অ্যাডমিন-নিয়ন্ত্রিত) */}
      {hasWelcome && welcome && (
        <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-5 text-center lf-anim-fade">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#33d79f] uppercase tracking-wider">
            <span aria-hidden>📜</span> স্বাগত বক্তব্য
          </p>
          {welcome.title.trim() && (
            <h3 className="text-[15px] font-bold text-[#e4e6eb] mt-1.5 font-hind">{welcome.title}</h3>
          )}
          {welcome.body.trim() && (
            <p className="text-[13px] leading-relaxed text-[#bcc0c4] mt-2 font-kalpurush whitespace-pre-line max-w-2xl mx-auto">
              {welcome.body}
            </p>
          )}
        </div>
      )}

      {/* পরিসংখ্যান-কাউন্টার (সেন্টার-স্ট্রিপ) */}
      {stats.length > 0 && (
        <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-4 lf-anim-fade">
          <div className="flex flex-wrap justify-center gap-2.5">
            {stats.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2.5 bg-[#1c1d1f] border border-[#3e4042] rounded-full pl-2 pr-4 py-1.5"
              >
                <span className="w-8 h-8 rounded-full bg-[#0d4a3a] flex items-center justify-center text-sm shrink-0" aria-hidden>
                  {s.icon || '📊'}
                </span>
                <span className="text-sm font-extrabold text-[#e4e6eb]">{s.value}</span>
                <span className="text-[11px] font-bold text-[#8a8d91]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {filled.length === 0 && !hasWelcome && stats.length === 0 && !hasMission && !hasTimeline ? (
        <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-8 text-center">
          <span className="text-2xl block mb-2" aria-hidden>🏛️</span>
          <p className="text-sm text-[#e4e6eb] font-bold">নেতৃত্বের তথ্য এখনো যুক্ত হয়নি</p>
          <p className="text-xs text-[#8a8d91] mt-1">
            {current?.role === 'admin' ? (
              <>
                <Link href="/admin/home/leadership" className="text-[#33d79f] font-bold hover:underline">
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

              {/* সেন্টার-অ্যালাইনমেন্ট: ২টা থাকলে ঠিক মাঝে পাশাপাশি, ৪টা থাকলে পূর্ণ-সারি */}
              <div className="flex flex-wrap justify-center gap-3 items-stretch">
                {list.map((card) => (
                  <div key={card.id} className={`${cardWidthClass(list.length)} flex`}>
                    <SlotCard card={card} />
                  </div>
                ))}
              </div>
            </section>
          )
        })
      )}

      {/* লক্ষ্য ও উদ্দেশ্য (অ্যাডমিন-নিয়ন্ত্রিত) */}
      {hasMission && mission && (
        <section className="bg-[#242526] border border-[#3e4042] rounded-xl p-5 lf-anim-fade">
          <h3 className="text-[13.5px] font-bold text-[#e4e6eb] flex items-center gap-1.5 justify-center text-center">
            <span aria-hidden>🎯</span> {mission.title || 'আমাদের লক্ষ্য ও উদ্দেশ্য'}
          </h3>
          <ul className="mt-3 space-y-2 max-w-2xl mx-auto">
            {mission.body
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
              .map((line, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#bcc0c4] font-kalpurush">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00a86b] shrink-0" aria-hidden />
                  <span className="leading-relaxed">{line}</span>
                </li>
              ))}
          </ul>
        </section>
      )}

      {/* ঐতিহাসিক মাইলফলক (অ্যাডমিন-নিয়ন্ত্রিত) */}
      {hasTimeline && (
        <section className="bg-[#242526] border border-[#3e4042] rounded-xl p-5 lf-anim-fade">
          <h3 className="text-[13.5px] font-bold text-[#e4e6eb] flex items-center gap-1.5 justify-center text-center">
            <span aria-hidden>⏳</span> ঐতিহাসিক মাইলফলক
          </h3>
          <ol className="mt-4 max-w-2xl mx-auto relative">
            <span className="absolute left-[7px] top-2 bottom-2 w-px bg-[#3e4042]" aria-hidden />
            {timeline.map((t) => (
              <li key={t.id} className="relative pl-8 pb-4 last:pb-0">
                <span
                  className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-[#0d4a3a] border-2 border-[#00a86b] shrink-0"
                  aria-hidden
                />
                <div className="flex flex-wrap items-center gap-2">
                  {t.year && (
                    <span className="text-[11px] font-extrabold text-[#33d79f] bg-[#0d4a3a] px-2 py-0.5 rounded-full">
                      {t.year}
                    </span>
                  )}
                  <span className="text-[13px] font-bold text-[#e4e6eb]">{t.title}</span>
                </div>
                {t.description && (
                  <p className="text-[12.5px] leading-relaxed text-[#8a8d91] mt-1 font-kalpurush">
                    {t.description}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
