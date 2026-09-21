'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * session202 — useSupportPending (সাপোর্ট-কেন্দ্র লাইভ পেন্ডিং-ব্যাজ হুক)
 *
 * ─ ৩০-সেকেন্ড ক্লায়েন্ট-পোলিং → GET /api/admin/support-reports?counts=1 (লাইট-মোড)
 * ─ hidden-ট্যাবে স্কিপ (বৃথা-নেটওয়ার্ক-শূন্য)
 * ─ ইভেন্ট-চালিত তাৎক্ষণিক রিফ্রেশ: 'lf:support-changed'
 *   (রিভিউ-ডেস্কে স্টেটাস/নোট-আপডেট হলে ডিসপ্যাচ করা হয়)
 * ─ 401/403 (মেম্বার) → pending=null (কলার ব্যাজ-রেন্ডার স্কিপ করবে)
 * ─ নেটওয়ার্ক-ফেইলে আগের স্টেট অক্ষুণ্ণ
 */

export interface SupportPending {
  /** PENDING অভিযোগ-সংখ্যা — null = অ্যাক্সেস-নেই/এখনো-লোড-হয়নি */
  pending: number | null
}

export function useSupportPending(enabled = true): SupportPending {
  const [pending, setPending] = useState<number | null>(null)
  const inFlight = useRef(false)

  const fetchCounts = useCallback(async () => {
    if (document.hidden || inFlight.current) return
    inFlight.current = true
    try {
      const res = await fetch('/api/admin/support-reports?counts=1')
      if (res.ok) {
        const data = await res.json()
        if (data && typeof data.counts?.PENDING === 'number') {
          setPending(data.counts.PENDING as number)
        }
      }
    } catch {
      /* নেটওয়ার্ক-ফেইল → আগের স্টেট অক্ষুণ্ণ */
    } finally {
      inFlight.current = false
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    fetchCounts()
    const iv = setInterval(fetchCounts, 30000)
    const onCh = () => fetchCounts()
    window.addEventListener('lf:support-changed', onCh)
    const onVis = () => {
      if (!document.hidden) fetchCounts()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(iv)
      window.removeEventListener('lf:support-changed', onCh)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [enabled, fetchCounts])

  return { pending }
}
