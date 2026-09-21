'use client'

/**
 * সাইট-অ্যাডমিন কিট (শেয়ার্ড) — মডুলার অ্যাডমিন-প্যানেলগুলোর সম-রীতির উপাদান (Task62-c)
 *
 * • MiniToggle   — কার্ডের কোণার ইনস্ট্যান্ট অন/অফ সুইচ (নো-পপআপ, একদম সুইচের মত)
 * • PageHeader   — ব্রেডক্রাম্ব + শিরোনাম + বিবরণ (পেইজ-বাই-পেইজ শনাক্তকরণ)
 * • StatusText   — ইনলাইন "✓ সংরক্ষিত হয়েছে" / ত্রুটি-লেখা (সবুজ/লাল, কোনো টোস্ট নেই)
 */

import React from 'react'
import Link from 'next/link'

/* ─── ইনস্ট্যান্ট অন/অফ সুইচ ─── */
export function MiniToggle({
  on,
  onToggle,
  labelOn = 'দৃশ্যমান',
  labelOff = 'লুকানো',
  ariaLabel,
  disabled = false,
}: {
  on: boolean
  onToggle: (next: boolean) => void
  labelOn?: string
  labelOff?: string
  ariaLabel?: string
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-[10px] font-bold ${on ? 'text-emerald-600' : 'text-[#8A8D91]'}`}>
        {on ? labelOn : labelOff}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => onToggle(!on)}
        className={`relative w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[#006A4E] focus-visible:ring-offset-1 outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
          on ? 'bg-[#006A4E]' : 'bg-[#CED0D4]'
        }`}
        title={on ? `বন্ধ করতে ক্লিক করুন` : `চালু করতে ক্লিক করুন`}
      >
        <span
          className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform duration-200 ${
            on ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

/* ─── পেজ-হেডার (ব্রেডক্রাম্ব সহ) ─── */
export function PageHeader({
  breadcrumb,
  icon,
  title,
  description,
  children,
}: {
  breadcrumb: string
  icon: string
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div className="bg-white border border-[#CED0D4] rounded-[10px] p-4 sm:p-5 shadow-2xs mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="text-[10.5px] font-bold text-[#8A8D91] uppercase tracking-wider mb-0.5">{breadcrumb}</p>
        <h1 className="text-xl font-bold text-[#050505] flex items-center gap-2">
          <span aria-hidden>{icon}</span>
          <span>{title}</span>
        </h1>
        <p className="text-xs text-[#65676B] mt-0.5">{description}</p>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

/* ─── ইনলাইন-স্টেটাস ─── */
export function StatusText({ status }: { status: '' | 'saving' | 'success' | 'error' }) {
  if (status === 'success') {
    return (
      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
        <span aria-hidden>✓</span> সংরক্ষিত হয়েছে
      </span>
    )
  }
  if (status === 'error') {
    return <span className="text-[11px] text-rose-600 font-bold">সংরক্ষণ ব্যর্থ — আবার চেষ্টা করুন</span>
  }
  if (status === 'saving') {
    return <span className="text-[11px] text-[#65676B] font-bold">সংরক্ষণ হচ্ছে...</span>
  }
  return null
}

/* ─── সাধারণ ইনপুট-ফিল্ড র‍্যাপার ─── */
export function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-[11px] font-bold text-[#65676B] block mb-0.5">{label}</label>
      {children}
    </div>
  )
}

export const inputCls =
  'w-full bg-[#F0F2F5] focus:bg-white border border-[#CED0D4] focus:border-[#006A4E] rounded-[6px] px-2 py-1.5 text-xs outline-none'

/* ─── "ফিডে ফিরুন" লিঙ্ক-বাটন ─── */
export function BackToFeedLink() {
  return (
    <Link
      href="/"
      className="px-3 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded-[8px] text-xs font-bold transition cursor-pointer"
    >
      ফিডে ফিরুন
    </Link>
  )
}
