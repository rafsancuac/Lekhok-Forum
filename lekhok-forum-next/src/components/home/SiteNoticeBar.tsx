'use client'

/**
 * সাইট-নোটিশ বার — হোমপেজের উপরের জরুরি ঘোষণা-পট্টি (Task62-c)
 *
 * ডাটা-সোর্স: /api/site-content (SiteNotice) — অ্যাডমিন প্যানেল /admin/home/notice থেকে
 * সুইচ অন করলেই এখানে প্রকাশ পায়; অফ করলে বারটি নিখোঁজ। বন্ধ-বাটন (✕) চাপলে
 * এই-সেশনে লুকায় (sessionStorage)।
 */

import React, { useEffect, useState } from 'react'

interface NoticeData {
  text: string
  linkUrl: string
  isOn: boolean
}

const DISMISS_KEY = 'lf-notice-dismissed'

export default function SiteNoticeBar() {
  const [notice, setNotice] = useState<NoticeData | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let alive = true
    /* অ্যাসিঙ্ক-কলব্যাক: sessionStorage-পরীক্ষা + fetch — setState সব await-এর পরে */
    ;(async () => {
      let wasDismissed = false
      try {
        wasDismissed = sessionStorage.getItem(DISMISS_KEY) === '1'
      } catch {
        /* private-mode — উপেক্ষা */
      }
      let next: NoticeData | null = null
      try {
        const r = await fetch('/api/site-content')
        if (r.ok) {
          const d = await r.json()
          next = { text: d.notice?.text ?? '', linkUrl: d.notice?.linkUrl ?? '', isOn: d.notice?.isOn ?? false }
        }
      } catch {
        /* লোড-ব্যর্থ = বার নেই */
      }
      if (!alive) return
      setNotice(next)
      setDismissed(wasDismissed)
    })()
    return () => {
      alive = false
    }
  }, [])

  const dismiss = () => {
    setDismissed(true)
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* উপেক্ষা */
    }
  }

  if (!notice || !notice.isOn || !notice.text.trim() || dismissed) return null

  return (
    <div
      role="status"
      className="lf-anim-fade flex items-center gap-2 bg-gradient-to-r from-[#0d4a3a] via-[#0a5c42] to-[#0d4a3a] border border-[#00a86b]/40 rounded-xl px-3.5 py-2.5 shadow-sm"
    >
      <span className="shrink-0 text-base leading-none" aria-hidden>
        📢
      </span>
      {notice.linkUrl ? (
        <a
          href={notice.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-0 text-[12.5px] font-bold text-[#d9fbe9] hover:text-white underline decoration-[#00d67e]/60 underline-offset-2 truncate font-kalpurush"
        >
          {notice.text}
        </a>
      ) : (
        <p className="flex-1 min-w-0 text-[12.5px] font-bold text-[#d9fbe9] truncate font-kalpurush">
          {notice.text}
        </p>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="নোটিশ বন্ধ করুন"
        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[#a7e8c9] hover:bg-white/10 hover:text-white transition cursor-pointer"
      >
        <span aria-hidden>✕</span>
      </button>
    </div>
  )
}
