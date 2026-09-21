'use client'

/**
 * স্বাগত বক্তব্য প্যানেল — /admin/home/welcome
 * ফোরামের পক্ষ থেকে এক-নজরে মূল বক্তব্য-ব্লক। টগল অন = হোমপেজে দেখা যাবে।
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import AdminGate, { useAdminGate } from '@/components/admin/AdminGate'
import { PageHeader, SectionCard, Field, inputCls, PrimaryBtn, GhostBtn, ToggleWithLabel } from '@/components/admin/ui'

interface ContentData {
  title: string
  body: string
  isOn: boolean
}

type SaveStatus = '' | 'saving' | 'success' | 'error'

export default function AdminHomeWelcomePage() {
  const { state, adminCandidates } = useAdminGate()
  const [data, setData] = useState<ContentData | null>(null)
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
        setData({ title: all.welcome.title, body: all.welcome.body, isOn: all.welcome.isOn })
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

  const handleSave = async (override?: Partial<ContentData>) => {
    if (!data) return
    const payload = { ...data, ...override }
    setData(payload)
    setStatus('saving')
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'welcome', ...payload }),
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
          icon="📜"
          title="স্বাগত বক্তব্য"
          description="হোমপেজে ফোরামের পক্ষ থেকে এক নজরে মূল বক্তব্য — শিরোনামসহ ব্লক।"
          actions={
            <Link
              href="/admin"
              className="px-3 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded-[8px] text-xs font-bold transition"
            >
              ← ড্যাশবোর্ড
            </Link>
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
            title="স্বাগত-ব্লক কনফিগারেশন"
            subtitle="টগল বন্ধ থাকলে হোমপেজে ব্লকটি লুকানো থাকবে।"
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
              <Field label="শিরোনাম">
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  placeholder="যেমন: লেখার আন্দোলনে যোগ দিন"
                  className={inputCls + ' font-bold'}
                />
              </Field>
              <Field label="বক্তব্য" hint="২-৪ বাক্যে ফোরামের উদ্দেশ্য ও আহ্বান">
                <textarea
                  rows={5}
                  value={data.body}
                  onChange={(e) => setData({ ...data, body: e.target.value })}
                  placeholder="লেখক ফোরাম — বাংলা লেখকদের নিজের ঠিকানা..."
                  className={inputCls + ' font-kalpurush resize-none leading-relaxed'}
                />
              </Field>

              <div className="flex items-center gap-2 pt-2 border-t border-[#E4E6EB]">
                <GhostBtn onClick={load}>রিসেট</GhostBtn>
                <PrimaryBtn onClick={() => handleSave()} disabled={status === 'saving'}>
                  {status === 'saving' ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ'}
                </PrimaryBtn>
              </div>
            </div>
          </SectionCard>
        )}
      </AdminGate>
    </div>
  )
}
