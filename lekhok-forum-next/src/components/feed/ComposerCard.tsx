'use client'

import React from 'react'
import { ImagePlus, Smile, Mic, Video } from 'lucide-react'
import type { FrontendUser } from '@/lib/types'

/** ফিডের টপ কম্পোজার ট্রিগার কার্ড — ফেসবুকের মতো (Session J: হোভার/ফোকাস পলিশ) */
export default function ComposerCard({
  current,
  onOpen,
  onQuickMedia,
  contextLabel,
}: {
  current: FrontendUser | null
  onOpen: () => void
  onQuickMedia: () => void
  /** গ্রুপ/কনটেক্সট-লেবেল থাকলে প্লেসহোল্ডার বদলায় (Session K) */
  contextLabel?: string
}) {
  if (!current) return null
  return (
    <div className="group/composer bg-[#242526] rounded-xl border border-[#3e4042] hover:border-[#00a86b]/25 shadow-md hover:shadow-lg p-3.5 transition-all duration-200">
      <div className="flex items-center gap-2.5">
        {current.avatarUrl ? (
          <img
            src={current.avatarUrl}
            alt=""
            className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover/composer:ring-[#00a86b]/40 transition-all duration-200"
          />
        ) : null}
        <button
          onClick={onOpen}
          className="flex-1 text-left bg-[#3a3b3c] hover:bg-[#4e4f50] rounded-full px-4 py-2.5 text-[14.5px] text-[#b0b3b8] hover:text-[#e4e6eb] transition-all active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#00a86b] focus-visible:outline-none"
        >
          {contextLabel
            ? `${contextLabel}-এ কিছু লিখুন...`
            : `মনের কথা লিখুন, ${current.name.split(' ')[0]}...`}
        </button>
      </div>
      <hr className="border-[#3e4042] my-2.5" />
      <div className="flex items-center justify-around gap-1">
        <QuickBtn icon={<Video className="w-5 h-5 text-rose-400" />} label="লাইভ" onClick={onOpen} />
        <QuickBtn icon={<ImagePlus className="w-5 h-5 text-emerald-400" />} label="ছবি/ভিডিও" onClick={onQuickMedia} />
        <QuickBtn icon={<Smile className="w-5 h-5 text-amber-400" />} label="অনুভূতি" onClick={onOpen} />
        <QuickBtn icon={<Mic className="w-5 h-5 text-purple-400" />} label="অডিও" onClick={onOpen} />
      </div>
    </div>
  )
}

function QuickBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#3a3b3c] transition-all text-[13.5px] font-semibold text-[#b0b3b8] hover:text-[#e4e6eb] hover:-translate-y-px active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-[#00a86b] focus-visible:outline-none"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
