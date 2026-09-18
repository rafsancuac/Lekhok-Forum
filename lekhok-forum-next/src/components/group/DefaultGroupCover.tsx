'use client'

import React, { useMemo } from 'react'

/**
 * DefaultGroupCover — গ্রুপের কভার না থাকলে নাম-ভিত্তিক নির্ধারিত প্যাটার্ন (Session K)।
 * DefaultCover-এর ভাইবোন: গ্রেডিয়েন্ট + ব্লব + বড় আদ্যক্ষর + ডট-গ্রিড, সাথে Users-চিহ্ন জলছাপ।
 */

const PALETTES = [
  'linear-gradient(135deg, #065f46 0%, #0f766e 60%, #115e59 100%)', // চা-বাগান
  'linear-gradient(135deg, #b45309 0%, #f59e0b 55%, #d97706 100%)', // সোনালী ধান
  'linear-gradient(135deg, #7c2d12 0%, #c2410c 60%, #9a3412 100%)', // পোড়ামাটি
  'linear-gradient(135deg, #1e3a5f 0%, #0e7490 60%, #155e75 100%)', // নদী
  'linear-gradient(135deg, #4c1d95 0%, #7e22ce 55%, #6b21a8 100%)', // জমিন-পার্পল
  'linear-gradient(135deg, #164e63 0%, #0f766e 60%, #065f46 100%)', // সাগর-সবুজ
  'linear-gradient(135deg, #831843 0%, #be185d 60%, #9d174d 100%)', // পলাশ
  'linear-gradient(135deg, #1f2937 0%, #374151 55%, #111827 100%)', // কালি
]

function nameHash(name: string): number {
  let h = 5381
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) + h + name.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function firstGrapheme(name: string): string {
  try {
    const seg = new Intl.Segmenter('bn', { granularity: 'grapheme' })
    const first = seg.segment(name.trim())[Symbol.iterator]().next().value
    if (first?.segment) return first.segment
  } catch {
    /* fallback */
  }
  return Array.from(name.trim())[0] || 'গ্রু'
}

export default function DefaultGroupCover({ name }: { name: string }) {
  const { palette, g1, g2, g3, rotate, initial } = useMemo(() => {
    const h = nameHash(name || 'গ্রুপ')
    return {
      palette: PALETTES[h % PALETTES.length],
      g1: 5 + (h % 25),
      g2: 50 + ((h >> 3) % 35),
      g3: 35 + ((h >> 6) % 40),
      rotate: -14 + ((h >> 9) % 28),
      initial: firstGrapheme(name),
    }
  }, [name])

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: palette }}
      role="img"
      aria-label={`${name} গ্রুপের ডিফল্ট কভার`}
    >
      <div
        className="absolute inset-0 opacity-[0.13] lf-cover-dots"
        style={{ transform: `rotate(${rotate}deg) scale(1.35)` }}
        aria-hidden
      />
      <div
        className="absolute rounded-full blur-2xl bg-white/12"
        style={{ width: '58%', aspectRatio: '1', left: `${g1}%`, top: '-50%' }}
        aria-hidden
      />
      <div
        className="absolute rounded-full blur-2xl bg-black/20"
        style={{ width: '50%', aspectRatio: '1', left: `${g2}%`, bottom: '-58%' }}
        aria-hidden
      />
      <div
        className="absolute rounded-full blur-xl bg-white/[0.08]"
        style={{ width: '32%', aspectRatio: '1', left: `${g3 - 16}%`, top: '26%' }}
        aria-hidden
      />
      {/* আদ্যক্ষর — ডানে অর্ধেক-কাটা */}
      <span
        className="absolute -right-2 -bottom-10 select-none pointer-events-none font-extrabold text-white/[0.15] leading-none"
        style={{ fontSize: '8.5rem' }}
        aria-hidden
      >
        {initial}
      </span>
      {/* নাম-চিপ */}
      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full ring-1 ring-white/25">
        <span className="w-1.5 h-1.5 rounded-full bg-white/80" aria-hidden />
        {name}
      </span>
    </div>
  )
}
