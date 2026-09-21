'use client'

/**
 * অ্যাডমিন-গেট (শেয়ার্ড) — মডুলার অ্যাডমিন ড্যাশবোর্ডের সব-প্যানেলের সেশন-গার্ড (Task62-c)
 *
 * • /api/session থেকে রোল-যাচাই — অ্যাডমিন না হলে গেট-স্ক্রিন (কোনো পপ-আপ নেই)
 * • ডেমো-অ্যাকাউন্ট-সুইচার: অ্যাডমিন-ক্যান্ডিডেটদের এক-ক্লিকে সুইচ → অটো-রিলোড
 * • অনুমোদিত হলে children রেন্ডার — প্রতিটি প্যানেল নিজের কনটেন্ট নিজে লোড করে
 */

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import type { FrontendUser } from '@/lib/types'

export type GateState = 'loading' | 'ok' | 'denied'

export function useAdminGate() {
  const [state, setState] = useState<GateState>('loading')
  const [adminCandidates, setAdminCandidates] = useState<FrontendUser[]>([])

  const check = useCallback(async () => {
    try {
      const res = await fetch('/api/session')
      const sess = await res.json().catch(() => ({}))
      setAdminCandidates((sess.users || []).filter((u: FrontendUser) => u.role === 'admin'))
      setState(sess.current?.role === 'admin' ? 'ok' : 'denied')
    } catch {
      setState('denied')
    }
  }, [])

  useEffect(() => {
    let alive = true
    /* অ্যাসিঙ্ক-কলব্যাকে সেশন-যাচাই — setState সব fetch-এর পরে (নো-ক্যাসকেড) */
    ;(async () => {
      try {
        const res = await fetch('/api/session')
        const sess = await res.json().catch(() => ({}))
        if (!alive) return
        setAdminCandidates((sess.users || []).filter((u: FrontendUser) => u.role === 'admin'))
        setState(sess.current?.role === 'admin' ? 'ok' : 'denied')
      } catch {
        if (alive) setState('denied')
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  return { state, adminCandidates, recheck: check }
}

export default function AdminGate({
  state,
  adminCandidates,
  children,
}: {
  state: GateState
  adminCandidates: FrontendUser[]
  children: React.ReactNode
}) {
  if (state === 'ok') return <>{children}</>

  return (
    <div className="flex items-center justify-center p-4 py-16">
      <div className="bg-white border border-[#CED0D4] rounded-[10px] p-6 max-w-sm w-full text-center shadow-2xs">
        {state === 'loading' ? (
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#006A4E]" />
        ) : (
          <>
            <div className="text-3xl mb-2" aria-hidden>🔒</div>
            <h1 className="text-sm font-bold mb-1">অ্যাডমিন অনুমতি প্রয়োজন</h1>
            <p className="text-xs text-[#65676B] mb-4">
              এই প্যানেল ব্যবহার করতে অ্যাডমিন অ্যাকাউন্টে থাকতে হবে।
              {adminCandidates.length > 0 && ' নিচের অ্যাকাউন্টে সুইচ করুন (ডেমো):'}
            </p>
            {adminCandidates.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={async () => {
                  await fetch('/api/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: u.id }),
                  })
                  window.location.reload()
                }}
                className="w-full px-3 py-2 mb-1.5 bg-[#006A4E] hover:bg-[#00523C] text-white rounded-[8px] text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
              >
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                    {u.name.slice(0, 1)}
                  </span>
                )}
                {u.name} হিসেবে সুইচ করুন
              </button>
            ))}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-[#006A4E] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> ফিডে ফিরে যান
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
