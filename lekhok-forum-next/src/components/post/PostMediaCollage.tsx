'use client'

import React from 'react'
import { Music2, Play } from 'lucide-react'

export interface MediaItem {
  id: string
  url: string
  type: string // IMAGE | VIDEO | AUDIO
  posterUrl?: string | null // ভিডিও-পোস্টার (Session K)
  order?: number
}

/** লোড হলে মসৃণ fade-in ইমেজ (ক্যাশড হলেও কাজ করে) */
function FadeImg({
  src,
  alt,
  className,
  onClick,
}: {
  src: string
  alt: string
  className?: string
  onClick?: () => void
}) {
  return (
    <img
      src={src}
      alt={alt}
      onClick={onClick}
      loading="lazy"
      draggable={false}
      className={`${className || ''} lf-img-reveal`}
      onLoad={(e) => e.currentTarget.classList.add('lf-img-loaded')}
      ref={(el) => {
        if (el && el.complete && el.naturalWidth > 0) el.classList.add('lf-img-loaded')
      }}
    />
  )
}

/**
 * ফেসবুক-স্টাইল ইন্টেলিজেন্ট মিডিয়া কোলাজ:
 * 1টি → ফুল সাইজ | 2টি → ৫০/৫০ | 3টি → বামে ১ বড় + ডানে ২
 * 4টি → বামে ১ বড় + ডানে ৩ | 5+ → বামে ১ + ডানে ৩, শেষে +N ওভারলে
 */
export default function PostMediaCollage({
  media,
  onImageClick,
}: {
  media: MediaItem[]
  onImageClick?: (index: number) => void
}) {
  if (!media || media.length === 0) return null
  const count = media.length

  const imgCls =
    'w-full h-full object-cover cursor-pointer hover:opacity-90 transition duration-200 select-none'

  const renderSingle = (m: MediaItem, big = true) => {
    if (m.type === 'AUDIO') return <AudioCard url={m.url} />
    if (m.type === 'VIDEO')
      return (
        <video
          src={m.url}
          poster={m.posterUrl || undefined}
          controls
          preload="metadata"
          className="w-full max-h-[420px] bg-black object-contain mx-auto"
        />
      )
    return (
      <FadeImg
        src={m.url}
        alt="পোস্ট মিডিয়া"
        onClick={() => big && onImageClick?.(0)}
        className={`w-full lf-zoom-hover ${big ? 'max-h-[420px] object-cover hover:opacity-95 cursor-pointer' : ''}`}
      />
    )
  }

  // ─── ১টি মিডিয়া ───
  if (count === 1) {
    return <div className="w-full overflow-hidden bg-black">{renderSingle(media[0])}</div>
  }

  // ─── ২টি (পাশাপাশি ৫০/৫০) ───
  if (count === 2) {
    return (
      <div className="grid grid-cols-2 grid-rows-1 gap-0.5 w-full h-[220px] sm:h-[400px] overflow-hidden bg-black/40">
        {media.map((m, idx) => (
          <div key={m.id} className="relative h-full overflow-hidden">
            {m.type === 'AUDIO' ? (
              <AudioCard url={m.url} compact />
            ) : m.type === 'VIDEO' ? (
              <video src={m.url} poster={m.posterUrl || undefined} controls preload="metadata" className={imgCls} />
            ) : (
              <FadeImg
                src={m.url}
                alt={`মিডিয়া ${idx + 1}`}
                onClick={() => onImageClick?.(idx)}
                className={imgCls}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  // ─── ৩টি (বামে ১ বড় + ডানে ২ সমান) ───
  if (count === 3) {
    return (
      <div className="grid grid-cols-2 grid-rows-1 gap-0.5 w-full h-[260px] sm:h-[440px] overflow-hidden bg-black/40">
        <Slot m={media[0]} idx={0} onImageClick={onImageClick} imgCls={imgCls} />
        <div className="grid grid-rows-2 gap-0.5 h-full">
          <Slot m={media[1]} idx={1} onImageClick={onImageClick} imgCls={imgCls} />
          <Slot m={media[2]} idx={2} onImageClick={onImageClick} imgCls={imgCls} />
        </div>
      </div>
    )
  }

  // ─── ৪টি (বামে ১ প্রধান + ডানে ৩ সারি) ───
  if (count === 4) {
    return (
      <div className="grid grid-cols-2 grid-rows-1 gap-0.5 w-full h-[280px] sm:h-[450px] overflow-hidden bg-black/40">
        <Slot m={media[0]} idx={0} onImageClick={onImageClick} imgCls={imgCls} />
        <div className="grid grid-rows-3 gap-0.5 h-full">
          <Slot m={media[1]} idx={1} onImageClick={onImageClick} imgCls={imgCls} />
          <Slot m={media[2]} idx={2} onImageClick={onImageClick} imgCls={imgCls} />
          <Slot m={media[3]} idx={3} onImageClick={onImageClick} imgCls={imgCls} />
        </div>
      </div>
    )
  }

  // ─── ৫+ টি (বামে ১ + ডানে ৩, শেষ ঘরে +N ওভারলে) ───
  const remaining = count - 4
  return (
    <div className="grid grid-cols-2 grid-rows-1 gap-0.5 w-full h-[280px] sm:h-[450px] overflow-hidden bg-black/40">
      <Slot m={media[0]} idx={0} onImageClick={onImageClick} imgCls={imgCls} />
      <div className="grid grid-rows-3 gap-0.5 h-full">
        <Slot m={media[1]} idx={1} onImageClick={onImageClick} imgCls={imgCls} />
        <Slot m={media[2]} idx={2} onImageClick={onImageClick} imgCls={imgCls} />
        <div className="relative h-full overflow-hidden group">
          {media[3].type === 'VIDEO' ? (
            <>
              <video src={media[3].url} poster={media[3].posterUrl || undefined} preload="metadata" className={imgCls} />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                <Play className="w-8 h-8 text-white/90" />
              </div>
            </>
          ) : (
            <FadeImg
              src={media[3].url}
              alt="আরও মিডিয়া"
              className={`${imgCls} group-hover:scale-105`}
            />
          )}
          {remaining > 0 && (
            <div
              onClick={() => onImageClick?.(3)}
              className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white font-bold text-2xl cursor-pointer backdrop-blur-[2px] hover:bg-black/70 transition"
            >
              +{remaining}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Slot({
  m,
  idx,
  onImageClick,
  imgCls,
}: {
  m: MediaItem
  idx: number
  onImageClick?: (index: number) => void
  imgCls: string
}) {
  if (m.type === 'AUDIO') return <AudioCard url={m.url} compact />
  if (m.type === 'VIDEO')
    return <video src={m.url} poster={m.posterUrl || undefined} controls preload="metadata" className={imgCls} />
  return (
    <div className="relative h-full overflow-hidden">
      <FadeImg
        src={m.url}
        alt={`মিডিয়া ${idx + 1}`}
        onClick={() => onImageClick?.(idx)}
        className={imgCls}
      />
    </div>
  )
}

export function AudioCard({ url, compact = false }: { url: string; compact?: boolean }) {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0d4a3a] to-[#0f172a] ${
        compact ? 'px-2' : 'px-6 py-8 min-h-[140px]'
      }`}
    >
      <div className="flex items-center gap-2 text-white/90">
        <Music2 className={compact ? 'w-4 h-4' : 'w-6 h-6'} />
        <span className={compact ? 'text-[10px] font-semibold' : 'text-sm font-semibold'}>
          অডিও ক্লিপ
        </span>
      </div>
      <audio
        src={url}
        controls
        preload="metadata"
        className={`w-full ${compact ? 'h-7 scale-90' : 'max-w-sm'}`}
      />
    </div>
  )
}
