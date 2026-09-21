'use client'

/**
 * অ্যাডমিন-শেয়ার্ড UI প্রিমিটিভস (Task62-c — মডুলার অ্যাডমিন ড্যাশবোর্ড)
 *
 * সব সেকশন-প্যানেল একই ভিজ্যুয়াল-ভাষায় থাকে:
 *   • ToggleSwitch  — কার্ডের কোণায় অন/অফ সুইচ (হোমপেজে দেখাও/লুকাও)
 *   • PageHeader    — প্যানেল-হেডার (আইকন + শিরোনাম + বর্ণনা + ডান-পাশে অ্যাকশন)
 *   • Field         — লেবেল + ইনপুট-মোড়ক (অ্যাডমিন-ফর্মের একরূপ ঘনত্ব)
 *   • StatusPill    — "✓ সংরক্ষিত হয়েছে" / "ব্যর্থ" — কার্ডের ভেতরেই, কোনো পপ-আপ নেই
 *   • PrimaryBtn / GhostBtn — একরূপ বোতাম
 *
 * ইউজার-স্পেক: সেভ/টগলে ব্রাউজার alert/confirm/টোস্ট কিছুই নয় — ইনলাইন-চিহ্নই সব।
 */

import React from 'react'

/* ─── অন/অফ টগল-সুইচ (কার্ডের কোণায়) ─── */
export function ToggleSwitch({
  on,
  onClick,
  disabled,
  title,
}: {
  on: boolean
  onClick: () => void
  disabled?: boolean
  title?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      title={title ?? (on ? 'চালু — ক্লিক করে লুকান' : 'বন্ধ — ক্লিক করে দেখান')}
      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-wait ${
        on ? 'bg-[#006A4E]' : 'bg-[#CED0D4]'
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
          on ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

/* ─── টগলের পাশের স্টেট-লেবেল ─── */
export function ToggleWithLabel({
  on,
  onClick,
  disabled,
}: {
  on: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`text-[10px] font-bold ${on ? 'text-emerald-600' : 'text-[#8A8D91]'}`}
      >
        {on ? 'দৃশ্যমান' : 'লুকানো'}
      </span>
      <ToggleSwitch on={on} onClick={onClick} disabled={disabled} />
    </div>
  )
}

/* ─── প্যানেল-হেডার ─── */
export function PageHeader({
  icon,
  title,
  description,
  actions,
}: {
  icon: string
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="bg-white border border-[#CED0D4] rounded-[10px] p-4 sm:p-5 shadow-2xs mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-[#050505] flex items-center gap-2">
          <span aria-hidden>{icon}</span>
          <span>{title}</span>
        </h1>
        {description && <p className="text-xs text-[#65676B] mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}

/* ─── লেবেল + ইনপুট ─── */
export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-[11px] font-bold text-[#65676B] block mb-0.5">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-[#8A8D91] mt-0.5">{hint}</p>}
    </div>
  )
}

export const inputCls =
  'w-full bg-[#F0F2F5] focus:bg-white border border-[#CED0D4] focus:border-[#006A4E] rounded-[6px] px-2 py-1.5 text-xs outline-none'

/* ─── ইনলাইন-স্টেটাস (পপ-আপ নেই) ─── */
export function StatusPill({ status }: { status: '' | 'saving' | 'success' | 'error' }) {
  if (status === 'success')
    return (
      <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
        <span aria-hidden>✓</span> সংরক্ষিত হয়েছে
      </span>
    )
  if (status === 'error')
    return <span className="text-[11px] text-rose-600 font-bold">সংরক্ষণ ব্যর্থ — আবার চেষ্টা করুন</span>
  if (status === 'saving')
    return <span className="text-[11px] text-[#65676B] font-bold">সংরক্ষণ হচ্ছে...</span>
  return null
}

/* ─── বোতাম ─── */
export function PrimaryBtn({
  children,
  onClick,
  disabled,
  type = 'button',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 bg-[#006A4E] hover:bg-[#00523C] text-white rounded-[6px] text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  )
}

export function GhostBtn({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded-[6px] text-xs font-bold transition cursor-pointer"
    >
      {children}
    </button>
  )
}

/* ─── সেকশন-কার্ড (ফর্মের মোড়ক) ─── */
export function SectionCard({
  title,
  subtitle,
  status,
  toggle,
  children,
}: {
  title: string
  subtitle?: string
  status?: '' | 'saving' | 'success' | 'error'
  toggle?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-[#CED0D4] rounded-[10px] p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-[#050505]">{title}</h2>
          {subtitle && <p className="text-[11px] text-[#65676B] mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusPill status={status ?? ''} />
          {toggle}
        </div>
      </div>
      {children}
    </div>
  )
}
