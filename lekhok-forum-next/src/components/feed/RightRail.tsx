'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  Cake,
  TrendingUp,
  Flame,
  Sparkles,
  UserPlus,
  Loader2,
  ThumbsUp,
  MessageCircle,
  Bookmark,
} from 'lucide-react'
import { bn } from '@/lib/format'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import type { TrendingPost } from '@/lib/aggregates'

interface SuggestionUser {
  id: string
  name: string
  username: string
  avatarUrl: string | null
  bio: string | null
  followerCount: number
  postCount: number
  mutuals: { name: string; username: string; avatarUrl: string | null }[]
}

/** ডান পাশের রেইল — জন্মদিন, ট্রেন্ডিং (ক্লিকযোগ্য → সার্চ), রিয়েল ফলো-সাজেশন (Session I) */
export default function RightRail({
  onSearchTag,
  onOpenProfile,
  onNavigateToPost,
  refreshKey = 0,
}: {
  onSearchTag?: (tag: string) => void
  onOpenProfile?: (username: string) => void
  /** session160 — আলোচিত-কার্ড ক্লিকে পোস্টে নেভিগেশন */
  onNavigateToPost?: (postId: string) => void
  /** ফলো-অবস্থা বদলালে প্যারেন্ট বাড়ায় → সাজেশন রিফ্রেশ */
  refreshKey?: number
}) {
  const trending = [
    { tag: '#নবান্ন_গল্প', posts: '১২৪ লেখা' },
    { tag: '#নদীর_কবিতা', posts: '৮৯ লেখা' },
    { tag: '#শীতের_প্রবন্ধ', posts: '৫৬ লেখা' },
    { tag: '#লেখক_ফোরাম_উৎসব', posts: '২১৩ লেখা' },
  ]

  const [suggestions, setSuggestions] = useState<SuggestionUser[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  /* session160 — আলোচিত লেখা (ক্রন-ক্যাশড এগ্রিগেট) */
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[] | null>(null)
  const { toast } = useToast()

  const loadTrending = useCallback(async () => {
    try {
      const res = await fetch('/api/aggregates/trending')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTrendingPosts(data.posts || [])
    } catch {
      setTrendingPosts([])
    }
  }, [])

  useEffect(() => {
    loadTrending()
  }, [loadTrending, refreshKey])

  const loadSuggestions = useCallback(async () => {
    try {
      const res = await fetch('/api/users/suggestions')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSuggestions(data.users || [])
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSuggestions()
  }, [loadSuggestions, refreshKey])

  /* ফলো-টগল (অপটিমিস্টিক) — Session J: undo-টোস্ট + lf:follow-changed ডিসপ্যাচ */
  const toggleFollow = async (u: SuggestionUser) => {
    if (busyId) return
    setBusyId(u.id)
    const prev = suggestions
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(u.username)}/follow`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.following) {
        const removedIdx = (suggestions || []).findIndex((x) => x.id === u.id)
        setSuggestions((list) => (list || []).filter((x) => x.id !== u.id))
        window.dispatchEvent(new CustomEvent('lf:follow-changed'))
        toast({
          title: `${u.name}-কে অনুসরণ করছেন 🤝`,
          action: (
            <ToastAction
              altText="অনুসরণ বাতিল করুন"
              onClick={async () => {
                try {
                  const undoRes = await fetch(`/api/users/${encodeURIComponent(u.username)}/follow`, {
                    method: 'POST',
                  })
                  if (!undoRes.ok) throw new Error()
                  const undoData = await undoRes.json()
                  if (!undoData.following) {
                    /* রোটি আগের জায়গায় ফেরত */
                    setSuggestions((list) => {
                      const next = [...(list || [])]
                      next.splice(Math.max(0, removedIdx), 0, u)
                      return next
                    })
                    window.dispatchEvent(new CustomEvent('lf:follow-changed'))
                  }
                } catch {
                  toast({ title: 'বাতিল করা যায়নি', variant: 'destructive' })
                }
              }}
            >
              বাতিল
            </ToastAction>
          ),
        })
      } else {
        loadSuggestions()
      }
    } catch {
      setSuggestions(prev)
      toast({ title: 'ফলো ব্যর্থ', variant: 'destructive' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <aside className="hidden xl:flex flex-col gap-3 w-[290px] shrink-0 sticky top-[72px] self-start max-h-[calc(100vh-90px)] overflow-y-auto lf-scroll pb-6">
      {/* জন্মদিন */}
      <section className="bg-[#242526] rounded-xl border border-[#3e4042] p-3.5">
        <h3 className="text-[15px] font-bold text-white mb-2 flex items-center gap-2">
          <Cake className="w-4.5 h-4.5 text-rose-400" /> জন্মদিন
        </h3>
        <p className="text-[13px] text-[#b0b3b8] leading-relaxed">
          আজ <b className="text-[#e4e6eb]">নুসরাত জাহান</b> ও <b className="text-[#e4e6eb]">আরও ২ জন</b>-এর
          জন্মদিন। শুভেচ্ছা জানান!
        </p>
      </section>

      {/* আলোচিত এই সপ্তাহে (session160 — ক্রন-ক্যাশড র‍্যাঙ্কিং) */}
      <section className="bg-[#242526] rounded-xl border border-[#3e4042] p-3.5">
        <h3 className="text-[15px] font-bold text-white mb-2.5 flex items-center gap-2">
          <Flame className="w-4.5 h-4.5 text-orange-400 lf-trending-rank" /> আলোচিত এই সপ্তাহে
        </h3>
        {trendingPosts === null ? (
          <div className="space-y-3" role="status">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg lf-shimmer" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-full lf-shimmer rounded" />
                  <div className="h-2 w-20 lf-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : trendingPosts.length === 0 ? (
          <p className="text-[12px] text-[#8a8d91] leading-relaxed px-1 py-1">
            এই সপ্তাহে এনগেজমেন্ট জমা হচ্ছে — শীঘ্রই আলোচিত লেখা এখানে দেখা যাবে।
          </p>
        ) : (
          <div className="space-y-1">
            {trendingPosts.map((p, i) => (
              <button
                key={p.id}
                onClick={() => onNavigateToPost?.(p.id)}
                title={`স্কোর ${bn(p.score)} — পোস্টটি দেখুন`}
                style={{ animationDelay: `${i * 40}ms` }}
                className="lf-pop-row w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#3a3b3c] focus-visible:ring-2 focus-visible:ring-[#00a86b] transition"
              >
                <span className="flex items-start gap-2">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-extrabold shrink-0 mt-0.5 ${
                      i === 0
                        ? 'bg-orange-500/20 text-orange-400'
                        : i === 1
                          ? 'bg-amber-500/15 text-amber-400'
                          : i === 2
                            ? 'bg-[#3a3b3c] text-[#b0b3b8]'
                            : 'bg-[#3a3b3c] text-[#65676b]'
                    }`}
                  >
                    {bn(i + 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] leading-snug text-[#e4e6eb] line-clamp-2">
                      {p.excerpt}
                    </span>
                    <span className="flex items-center gap-2 mt-1 text-[10.5px] text-[#8a8d91]">
                      <span className="truncate max-w-[110px]">{p.author.name}</span>
                      <span className="flex items-center gap-0.5 shrink-0">
                        <ThumbsUp className="w-3 h-3" /> {bn(p.reactions)}
                      </span>
                      <span className="flex items-center gap-0.5 shrink-0">
                        <MessageCircle className="w-3 h-3" /> {bn(p.comments)}
                      </span>
                      {p.bookmarks > 0 && (
                        <span className="flex items-center gap-0.5 shrink-0">
                          <Bookmark className="w-3 h-3" /> {bn(p.bookmarks)}
                        </span>
                      )}
                    </span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ট্রেন্ডিং */}
      <section className="bg-[#242526] rounded-xl border border-[#3e4042] p-3.5 group">
        <h3 className="text-[15px] font-bold text-white mb-2.5 flex items-center gap-2">
          <TrendingUp className="w-4.5 h-4.5 text-emerald-400" /> ট্রেন্ডিং হ্যাশট্যাগ
        </h3>
        <div className="space-y-2">
          {trending.map((t, i) => (
            <button
              key={t.tag}
              onClick={() => onSearchTag?.(t.tag)}
              title={`"${t.tag}" খুঁজুন`}
              style={{ animationDelay: `${i * 40}ms` }}
              className="lf-pop-row w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#3a3b3c] focus-visible:ring-2 focus-visible:ring-[#00a86b] hover:translate-x-0.5 transition"
            >
              <span className="block text-[13.5px] font-bold text-[#e4e6eb] group-hover:text-[#45bd62]">{t.tag}</span>
              <span className="block text-[11px] text-[#8a8d91]">{t.posts}</span>
            </button>
          ))}
          {onSearchTag && (
            <p className="text-[10.5px] text-[#65676b] px-2 pt-1">ট্যাগে ক্লিক করে লেখা খুঁজুন ↑</p>
          )}
        </div>
      </section>

      {/* ফলো-সাজেশন (Session I — রিয়েল ডেটা) */}
      <section className="bg-[#242526] rounded-xl border border-[#3e4042] p-3.5">
        <h3 className="text-[15px] font-bold text-white mb-2.5 flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-amber-400" /> পরিচিত হোন
        </h3>
        {loading && (
          <div className="space-y-3" role="status">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full lf-shimmer" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-24 lf-shimmer rounded" />
                  <div className="h-2 w-16 lf-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && (suggestions || []).length === 0 && (
          <p className="text-[12px] text-[#8a8d91] leading-relaxed px-1 py-1">
            🎉 দুর্দান্ত! এই মুহূর্তে নতুন লেখক-সাজেশন নেই — সবাই আপনার নেটওয়ার্কে আছেন।
          </p>
        )}
        <div className="space-y-0.5">
          {(suggestions || []).map((s, i) => (
            <div
              key={s.id}
              style={{ animationDelay: `${i * 50}ms` }}
              className="lf-pop-row lf-suggest-row flex items-center gap-2.5 px-1 py-1.5 rounded-lg"
            >
              <button
                onClick={() => onOpenProfile?.(s.username)}
                title={`${s.name}-এর প্রোফাইল দেখুন`}
                className="flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-lg focus-visible:ring-2 focus-visible:ring-[#00a86b]"
              >
                {s.avatarUrl ? (
                  <img
                    src={s.avatarUrl}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10 hover:ring-[#00a86b]/50 transition-all shrink-0"
                  />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0b6e4f] to-[#1f8a70] flex items-center justify-center text-white font-bold text-[13px] shrink-0">
                    {s.name.slice(0, 1)}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-[#e4e6eb] truncate">
                    {s.name}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10.5px] text-[#8a8d91]">
                    {s.mutuals.length > 0 ? (
                      <>
                        {/* mutual অ্যাভাটার-স্ট্যাক */}
                        <span className="flex -space-x-1.5 shrink-0" aria-hidden>
                          {s.mutuals.slice(0, 2).map((m, i) => (
                            <span
                              key={m.username + i}
                              className="w-4 h-4 rounded-full ring-2 ring-[#242526] overflow-hidden bg-[#3a3b3c]"
                            >
                              {m.avatarUrl ? (
                                <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="w-full h-full flex items-center justify-center text-[7px] font-bold text-white">
                                  {m.name.slice(0, 1)}
                                </span>
                              )}
                            </span>
                          ))}
                        </span>
                        <span className="truncate">
                          <span className="text-[#00a86b] font-semibold">
                            {s.mutuals[0].name.split(' ')[0]}
                          </span>{' '}
                          এঁরাও অনুসরণ করেন · {bn(s.followerCount)}
                        </span>
                      </>
                    ) : (
                      <span className="truncate">
                        {s.bio ? s.bio.slice(0, 26) : 'লেখক'} · {bn(s.postCount)} লেখা
                      </span>
                    )}
                  </span>
                </span>
              </button>
              <button
                onClick={() => toggleFollow(s)}
                disabled={busyId === s.id}
                aria-label={`${s.name}-কে অনুসরণ করুন`}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11.5px] font-extrabold text-[#00a86b] hover:text-white bg-[#006a4e]/15 hover:bg-[#006a4e] transition active:scale-[0.96] disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[#00a86b]"
              >
                {busyId === s.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UserPlus className="w-3.5 h-3.5" />
                )}
                অনুসরণ
              </button>
            </div>
          ))}
        </div>
      </section>

      <p className="text-[11px] text-[#65676b] px-2 leading-relaxed">
        গোপনীয়তা · শর্তাবলী · বিজ্ঞাপন · কুকি নীতি · লেখক ফোরাম © ২০২৫
      </p>
    </aside>
  )
}
