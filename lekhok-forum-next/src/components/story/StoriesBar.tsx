'use client'

import React, { useRef } from 'react'
import { Plus, MessageCircle } from 'lucide-react'
import type { FrontendUser } from '@/lib/types'
import type { StoryRing, FrontendStory } from '@/lib/story-data'

/** একটি রিং-কার্ডের প্রিভিউ (প্রথম অদেখা স্টোরি, নাহলে প্রথম স্টোরি) */
function pickPreview(stories: FrontendStory[]): FrontendStory {
  return stories.find((s) => !s.viewed) ?? stories[0]
}

function StoryCard({
  ring,
  onOpen,
  isMe,
}: {
  ring: StoryRing | null
  onOpen: () => void
  isMe: boolean
}) {
  const preview = ring ? pickPreview(ring.stories) : null
  const hasImage = preview?.mediaUrl
  const gradient = preview?.background ?? 'story-gradient-1'
  const unseen = ring ? !ring.allSeen : true

  return (
    <button
      onClick={onOpen}
      aria-label={
        isMe
          ? ring?.stories.length
            ? 'আপনার স্টোরি দেখুন'
            : 'আপনার স্টোরি তৈরি করুন'
          : `${ring?.author.name}-এর স্টোরি দেখুন`
      }
      className="lf-story-card relative w-[104px] sm:w-[112px] h-[168px] sm:h-[180px] rounded-xl overflow-hidden shrink-0 text-left focus-visible:ring-2 focus-visible:ring-[#00a86b] outline-none"
    >
      {/* প্রিভিউ ব্যাকগ্রাউন্ড */}
      {hasImage ? (
        <img
          src={preview!.mediaUrl!}
          alt={isMe ? 'আপনার স্টোরি' : `${ring?.author.name}-এর স্টোরি`}
          className="absolute inset-0 w-full h-full object-cover lf-story-card-img"
        />
      ) : (
        <div className={`absolute inset-0 ${gradient} lf-story-card-img`} />
      )}
      {/* নিচে গাঢ় গ্রেডিয়েন্ট + নাম */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 px-2 pb-2">
        <p className="text-[11.5px] font-bold text-white leading-tight line-clamp-1 drop-shadow">
          {isMe ? 'আপনার স্টোরি' : ring?.author.name}
        </p>
      </div>

      {/* অ্যাভাটার + রিং */}
      <div
        className={`absolute top-2 left-2 w-10 h-10 rounded-full p-[2.5px] ${
          unseen ? 'lf-story-ring-unseen' : 'lf-story-ring-seen'
        } ${isMe && !ring?.stories.length ? 'hidden' : ''}`}
      >
        <span className="block w-full h-full rounded-full border-2 border-[#18191a] overflow-hidden bg-[#3a3b3c]">
          {ring && ring.author.avatarUrl ? (
            <img src={ring.author.avatarUrl} alt={ring.author.name} className="w-full h-full object-cover" />
          ) : null}
        </span>
      </div>

      {/* নিজের কার্ডে প্লাস ব্যাজ */}
      {isMe && (
        <span
          className={`absolute ${ring?.stories.length ? 'top-8 left-8' : 'top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2'} w-6 h-6 rounded-full bg-[#006a4e] border-[2.5px] border-[#18191a] flex items-center justify-center shadow-lg`}
        >
          <Plus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </span>
      )}

      {/* Session J: নিজের স্টোরিতে অপঠিত রিপ্লাই-ব্যাজ */}
      {isMe && ring && ring.stories.some((s) => (s.unreadReplies ?? 0) > 0) && (
        <span
          title="অপঠিত রিপ্লাই আছে"
          className="absolute top-2 right-2 flex items-center gap-1 bg-[#006a4e] text-white text-[10px] font-extrabold rounded-full pl-1.5 pr-2 py-0.5 shadow-lg ring-2 ring-[#18191a] lf-unread-chip"
        >
          <MessageCircle className="w-3 h-3" strokeWidth={2.5} />
          {ring.stories.reduce((acc, s) => acc + (s.unreadReplies ?? 0), 0)}
        </span>
      )}

      {/* নিজের কার্ডে স্টোরি না থাকলে অ্যাভাটার দেখাই */}
      {isMe && !ring?.stories.length && (
        <span className="absolute top-1/2 -translate-y-[38px] left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-[#3a3b3c] border border-[#4e4f50] overflow-hidden">
          {ring && ring.author.avatarUrl ? (
            <img src={ring.author.avatarUrl} alt={ring.author.name} className="w-full h-full object-cover" />
          ) : (
            <span className="flex w-full h-full items-center justify-center text-lg font-bold text-[#b0b3b8]">
              {ring?.author.name.charAt(0) ?? ''}
            </span>
          )}
        </span>
      )}
    </button>
  )
}

export default function StoriesBar({
  current,
  rings,
  loading,
  onOpenRing,
  onCreate,
}: {
  current: FrontendUser | null
  rings: StoryRing[]
  loading: boolean
  onOpenRing: (ringIndex: number) => void
  onCreate: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const myRing = rings.find((r) => r.isMe) ?? null
  const others = rings.filter((r) => !r.isMe)

  const scrollByCards = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' })
  }

  return (
    <section
      aria-label="স্টোরি"
      className="relative bg-[#242526] rounded-xl border border-[#3e4042] p-2.5 shadow-md lf-anim-fade"
    >
      <div
        ref={scrollRef}
        className="lf-story-scroll flex gap-2.5 overflow-x-auto scroll-smooth pb-0.5"
      >
        {/* আমার স্টোরি কার্ড */}
        {current && (
          <StoryCard
            ring={myRing}
            isMe
            onOpen={() => {
              if (myRing) {
                onOpenRing(rings.indexOf(myRing))
              } else {
                onCreate()
              }
            }}
          />
        )}

        {/* লোডিং স্কেলেটন */}
        {loading &&
          !rings.length &&
          [1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="w-[104px] sm:w-[112px] h-[168px] sm:h-[180px] rounded-xl shrink-0 lf-shimmer"
            />
          ))}

        {/* অন্যদের রিং */}
        {others.map((ring) => (
          <StoryCard
            key={ring.author.id}
            ring={ring}
            isMe={false}
            onOpen={() => onOpenRing(rings.indexOf(ring))}
          />
        ))}

        {/* খালি অবস্থা (লোডিং শেষ, কেউ স্টোরি দেয়নি — শুধু আমার কার্ড) */}
        {!loading && !others.length && (
          <div className="flex items-center px-3 min-w-[200px]">
            <p className="text-xs text-[#b0b3b8] leading-relaxed">
              এখনো কেউ স্টোরি দেয়নি — <span className="text-[#00a86b] font-bold">আপনিই প্রথম হন ✨</span>
            </p>
          </div>
        )}
      </div>

      {/* ডেস্কটপ স্ক্রল অ্যারো */}
      <button
        onClick={() => scrollByCards(-1)}
        aria-label="আগের স্টোরি"
        className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-1.5 -translate-x-1/2 w-9 h-9 rounded-full bg-[#242526] border border-[#3e4042] shadow-lg items-center justify-center text-[#e4e6eb] hover:bg-[#3a3b3c] transition lf-story-arrow"
      >
        ‹
      </button>
      <button
        onClick={() => scrollByCards(1)}
        aria-label="পরের স্টোরি"
        className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-1.5 translate-x-1/2 w-9 h-9 rounded-full bg-[#242526] border border-[#3e4042] shadow-lg items-center justify-center text-[#e4e6eb] hover:bg-[#3a3b3c] transition lf-story-arrow"
      >
        ›
      </button>
    </section>
  )
}
