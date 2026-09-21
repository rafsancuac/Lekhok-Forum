'use client'

/**
 * জরুরি নোটিশ-বার প্যানেল — /admin/home/notice
 * ফিডের একদম উপরের সরু ঘোষণা-পট্টি। টগল অন = হোমপেজে দেখা যাবে।
 * সেভ → POST /api/admin/site-settings {kind:'notice'} — ইনলাইন-স্টেটাস, কোনো পপ-আপ নেই।
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import AdminGate, { useAdminGate } from '@/components/admin/AdminGate'
import { PageHeader, SectionCard, Field, inputCls, PrimaryBtn, GhostBtn, ToggleWithLabel, StatusPill } from '@/components/admin/ui'

interface NoticeData {
  text: string
  linkUrl: string
  isOn: boolean
}

type SaveStatus = '' | 'saving' | 'success' | 'error'

export default function AdminHomeNoticePage() {
  const { state, adminCandidates } = useAdminGate()
  const [data, setData] = useState<NoticeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [status, setStatus] = useState<SaveStatus>('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const load = useCallback(async () => {
    setIsLoading(true)
    setLoadError(false)
    try {
      const res = await fetch('/api/admin/site-settings')
      if (res.ok) {
        const all = await res.json()
        setData({ text: all.notice.text, linkUrl: all.notice.linkUrl, isOn: all.notice.isOn })
      } else setLoadError(true)
    } catch {
      setLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async (override?: Partial<NoticeData>) => {
    if (!data) return
    const payload = { ...data, ...override }
    setData(payload)
    setStatus('saving')
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'notice', ...payload }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setStatus(''), 2500)
  }

  return (
    <div className="font-hind text-[#050505]">
      <AdminGate state={state} adminCandidates={adminCandidates}>
        <PageHeader
          icon="📢"
          title="জরুরি নোটিশ বার"
          description="হোমপেজ ফিডের একদম উপরে সরু ঘোষণা-পট্টি — সাহিত্য উৎসব, ম্যাগাজিন-আহ্বান, সেশন-ফি জরুরি বার্তা।"
          actions={
            <>
              <Link
                href="/"
                className="px-3 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded-[8px] text-xs font-bold transition"
              >
                ← ড্যাশবোর্ড
              </Link>
            </>
          }
        />

        {isLoading ? (
          <div className="bg-white border border-[#CED0D4] rounded-[10px] p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#006A4E]" />
            <p className="text-xs text-[#65676B] mt-2">লোড হচ্ছে...</p>
          </div>
        ) : loadError || !data ? (
          <div className="bg-white border border-[#CED0D4] rounded-[10px] p-8 text-center">
            <p className="text-sm font-bold mb-2">ডাটা লোড করা যায়নি</p>
            <PrimaryBtn onClick={load}>আবার চেষ্টা করুন</PrimaryBtn>
          </div>
        ) : (
          <SectionCard
            title="নোটিশ-বার কনফিগারেশন"
            subtitle="টগল বন্ধ থাকলে হোমপেজে পট্টিটি দেখাবেই না — লেখা মুছতে হবে না।"
            status={status}
            toggle={
              <ToggleWithLabel
                on={data.isOn}
                onClick={() => handleSave({ isOn: !data.isOn })}
                disabled={status === 'saving'}
              />
            }
          >
            <div className="space-y-3 max-w-2xl">
              {/* লাইভ-প্রিভিউ */}
              <div
                className={`rounded-[8px] border px-3 py-2 text-xs font-bold transition-opacity ${
                  data.isOn
                    ? 'bg-emerald-50 border-emerald-200 text-[#006A4E]'
                    : 'bg-[#F0F2F5] border-[#CED0D4] text-[#8A8D91] opacity-60'
                }`}
              >
                📢 {data.text || 'নোটিশ-লেখা এখানে দেখাবে...'}
                {data.linkUrl && <span className="ml-2 underline">লিঙ্ক →</span>}
              </div>

              <Field label="নোটিশ-লেখা">
                <input
                  type="text"
                  value={data.text}
                  onChange={(e) => setData({ ...data, text: e.target.value })}
                  placeholder="যেমন: 📚 'সাহিত্য আসর ২০২৬' স্মরণিকার জন্য লেখা আহ্বান চলছে!"
                  className={inputCls}
                />
              </Field>
              <Field label="লিঙ্ক (ঐচ্ছিক)" hint="নোটিশে চাপ দিলে এই ঠিকানায় যাবে — যেমন: /notices বা ফেসবুক-পোস্ট">
                <input
                  type="text"
                  value={data.linkUrl}
                  onChange={(e) => setData({ ...data, linkUrl: e.target.value })}
                  placeholder="https://..."
                  className={inputCls}
                />
              </Field>

              <div className="flex items-center gap-2 pt-2 border-t border-[#E4E6EB]">
                <GhostBtn onClick={load}>রিসেট</GhostBtn>
                <PrimaryBtn onClick={() => handleSave()} disabled={status === 'saving'}>
                  {status === 'saving' ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ'}
                </PrimaryBtn>
                <span className="ml-1">
                  <StatusPill status={status} />
                </span>
              </div>
            </div>
          </SectionCard>
        )}
      </AdminGate>
    </div>
  )
}
