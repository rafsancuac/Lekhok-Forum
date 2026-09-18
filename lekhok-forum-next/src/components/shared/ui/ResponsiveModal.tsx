'use client'

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * session160 — রেসপন্সিভ হাইব্রিড বটম-শিট ইঞ্জিন (ইউজার-স্পেক: ResponsiveModal.tsx)
 *
 * ─ ডেস্কটপ (md+) : ৮px-ধাঁচ সেন্টারড মডাল (rounded-2xl, lf-modal-pop)
 * ─ মোবাইল (<md)  : নিচ থেকে উঠে-আসা স্মুথ বটম-শিট (rounded-t-2xl, drag-handle,
 *                    slide-up অ্যানিমেশন, safe-area-inset-bottom সম্মান)
 *
 * সব পোর্টাল-মডালের সাধারণ কাজ এখানে কেন্দ্রীভূত: body-স্ক্রল-লক, Esc-ক্লোজ,
 * ব্যাকড্রপ-ক্লিক-ক্লোজ, aria-modal, মাউন্ট-গার্ড (SSR-নিরাপদ)।
 */

export interface ResponsiveModalProps {
  isOpen: boolean
  onClose: () => void
  /** হেডার-টাইটেল — বাংলা */
  title: React.ReactNode
  children: React.ReactNode
  /** ডেস্কটপে প্যানেল-প্রস্থ (ডিফল্ট max-w-md) */
  maxWidthClass?: string
  /** হেডারের নিচে অতিরিক্ত কনটেন্ট (ট্যাব-স্ট্রিপ ইত্যাদি) — FollowListModal-প্যাটার্ন */
  headerExtra?: React.ReactNode
  /** জেড-ইনডেক্স (ডিফল্ট z-[90]; NotificationBell z-50, পুরনো-মডাল 80/85-এর উপরে) */
  zIndexClass?: string
}

export default function ResponsiveModal({
  isOpen,
  onClose,
  title,
  children,
  maxWidthClass = 'max-w-md',
  headerExtra,
  zIndexClass = 'z-[90]',
}: ResponsiveModalProps) {
  /* মাউন্ট-গার্ড (SSR-নিরাপদ) — setState-in-effect-মুক্ত (react-hooks/set-state-in-effect) */
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  /* body-স্ক্রল-লক + Esc-ক্লোজ */
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className={`fixed inset-0 ${zIndexClass} bg-black/70 backdrop-blur-[2px] flex items-end md:items-center justify-center md:p-4 lf-anim-fade select-none`}
      role="dialog"
      aria-modal="true"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={`bg-[#242526] text-[#e4e6eb] border border-[#3e4042] w-full ${maxWidthClass} shadow-2xl overflow-hidden flex flex-col max-h-[92vh] md:max-h-[85vh] rounded-t-2xl md:rounded-2xl lf-sheet-anim md:lf-modal-pop`}
      >
        {/* মোবাইল drag-handle বার (ডেস্কটপে লুকানো) */}
        <div className="md:hidden pt-2.5 pb-1 flex justify-center shrink-0" aria-hidden="true">
          <span className="w-10 h-1 rounded-full bg-[#4e4f50]" />
        </div>

        {/* হেডার */}
        <div className="px-4 py-3 border-b border-[#3e4042] flex items-center justify-between shrink-0">
          <h2 className="font-extrabold text-white text-[15px] truncate">{title}</h2>
          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="w-8 h-8 rounded-full bg-[#3a3b3c] hover:bg-[#4a4c4e] flex items-center justify-center text-[#b0b3b8] hover:text-white transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#00a86b] shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* হেডার-অতিরিক্ত (ট্যাব ইত্যাদি) */}
        {headerExtra}

        {/* বডি — একমাত্র স্ক্রল-জোন */}
        <div className="flex-1 overflow-y-auto lf-scroll overscroll-contain pb-[max(env(safe-area-inset-bottom),8px)]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
