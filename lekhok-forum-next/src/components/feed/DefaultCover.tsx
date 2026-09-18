'use client'

import React, { useMemo } from 'react'

/**
 * DefaultCover — প্রোফাইল কভার না থাকলে নাম-ভিত্তিক নির্ধারিত (deterministic) প্যাটার্ন।
 * একই নামে সবসময় একই ডিজাইন: গ্রেডিয়েন্ট + নরম বৃত্ত-ব্লব + বড় বাংলা আদ্যক্ষর + সূক্ষ্ম ডট-গ্রিড।
 */

const PALETTES = [
  'linear-gradient(120deg, #065f46 0%, #006a4e 45%, #0f766e 100%)', // বন
  'linear-gradient(120deg, #f97316 0%, #db2777 100%)', // গোধূলি
  'linear-gradient(120deg, #0d9488 0%, #134e4a 100%)', // মহাসাগর
  'linear-gradient(120deg, #f43f5e 0%, #a21caf 100%)', // গোলাপ
  'linear-gradient(120deg, #92400e 0%, #b45309 50%, #d97706 100%)', // অ্যাম্বার
  'linear-gradient(120deg, #1e293b 0%, #0f172a 100%)', // রাত
  'linear-gradient(120deg, #be123c 0%, #9f1239 55%, #881337 100%)', // রুবি
  'linear-gradient(120deg, #166534 0%, #14532d 100%)', // গাঢ় সবুজ
]

/** নাম থেকে স্থির সংখ্যা (djb2 হ্যাশ) */
function nameHash(name: string): number {
  let h = 5381
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) + h + name.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/** প্রথম গ্রাফিম (স্বরচিহ্নসহ প্রথম অক্ষর) — "মোঃ রহিম" → "মো" */
function firstGrapheme(name: string): string {
  try {
    const seg = new Intl.Segmenter('bn', { granularity: 'grapheme' })
    const first = seg.segment(name.trim())[Symbol.iterator]().next().value
    if (first?.segment) return first.segment
  } catch {
    /* Intl.Segmenter না থাকলে fallback */
  }
  return Array.from(name.trim())[0] || 'লে'
}

export default function DefaultCover({ name }: { name: string }) {
  const { palette, g1, g2, g3, rotate, initial } = useMemo(() => {
    const h = nameHash(name || 'লেখক')
    return {
      palette: PALETTES[h % PALETTES.length],
      g1: 8 + (h % 22), // ব্লব-১ অবস্থান (%)
      g2: 55 + ((h >> 3) % 30), // ব্লব-২ অবস্থান
      g3: 40 + ((h >> 6) % 35), // ব্লব-৩ অবস্থান
      rotate: -12 + ((h >> 9) % 24), // ডট-গ্রিড ঘূর্ণন
      initial: firstGrapheme(name),
    }
  }, [name])

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: palette }}
      role="img"
      aria-label={`${name}-এর ডিফল্ট কভার প্যাটার্ন`}
    >
      {/* সূক্ষ্ম ডট-গ্রিড টেক্সচার */}
      <div
        className="absolute inset-0 opacity-[0.14] lf-cover-dots"
        style={{ transform: `rotate(${rotate}deg) scale(1.35)` }}
        aria-hidden
      />

      {/* নরম বৃত্ত-ব্লব */}
      <div
        className="absolute rounded-full blur-2xl bg-white/10"
        style={{ width: '55%', aspectRatio: '1', left: `${g1}%`, top: '-45%' }}
        aria-hidden
      />
      <div
        className="absolute rounded-full blur-2xl bg-black/15"
        style={{ width: '48%', aspectRatio: '1', left: `${g2}%`, bottom: '-55%' }}
        aria-hidden
      />
      <div
        className="absolute rounded-full blur-xl bg-white/[0.07]"
        style={{ width: '30%', aspectRatio: '1', left: `${g3 - 15}%`, top: '30%' }}
        aria-hidden
      />

      {/* বড় আদ্যক্ষর — ডানদিকে অর্ধেক-কাটা */}
      <span
        className="absolute -right-2 -bottom-9 select-none pointer-events-none font-extrabold text-white/[0.16] leading-none"
        style={{ fontSize: '9rem' }}
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
