'use client'

/**
 * ফুটার, হেল্পলাইন ও সোশ্যাল লিঙ্ক প্যানেল — /admin/settings/footer-social
 * গ্লোবাল ফুটার: পরিচিতি-লেখা, ইমেইল, হেল্পলাইন, ফেসবুক/ইউটিউব/টেলিগ্রাম, কপিরাইট।
 * টগল অন = ডাইনামিক ফুটার দেখা যাবে; বন্ধ = ডিফল্ট-সরল ফুটার।
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import AdminGate, { useAdminGate } from '@/components/admin/AdminGate'
import { PageHeader, SectionCard, Field, inputCls, PrimaryBtn, GhostBtn, ToggleWithLabel } from '@/components/admin/ui'

interface FooterData {
  aboutText: string
  contactEmail: string
  helpline: string
  facebookUrl: string
  youtubeUrl: string
  telegramUrl: string
  copyrightText: string
  isOn: boolean
}

type SaveStatus = '' | 'saving' | 'success' | 'error'

const EMPTY: FooterData = {
  aboutText: '',
  contactEmail: '',
  helpline: '',
  facebookUrl: '',
  youtubeUrl: '',
  telegramUrl: '',
  copyrightText: '',
  isOn: true,
}

export default function AdminFooterSocialPage() {
  const { state, adminCandidates } = useAdminGate()
  const [data, setData] = useState<FooterData | null>(null)
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
        setData({ ...EMPTY, ...all.footer })
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

  const handleSave = async (override?: Partial<FooterData>) => {
    if (!data) return
    const payload = { ...data, ...override }
    setData(payload)
    setStatus('saving')
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'footer', ...payload }),
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
          icon="⚙️"
          title="ফুটার, হেল্পলাইন ও সোশ্যাল লিঙ্ক"
          description="সাইটের নিচের গ্লোবাল ফুটার — যোগাযোগ, সোশ্যাল-লিঙ্ক ও কপিরাইট।"
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
            title="ফুটার কনফিগারেশন"
            subtitle="টগল বন্ধ থাকলে সাইটে ডিফল্ট-সরল ফুটার দেখাবে।"
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
              <Field label="ফুটার-পরিচিতি (ছোট লেখা)">
                <textarea
                  rows={2}
                  value={data.aboutText}
                  onChange={(e) => setData({ ...data, aboutText: e.target.value })}
                  placeholder="লেখক ফোরাম — বাংলা লেখকদের নিজের ঠিকানা; লেখা, পাঠ ও সৃজনশীলতার সাধার-মঞ্চ।"
                  className={inputCls + ' font-kalpurush resize-none'}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Field label="অফিসিয়াল ইমেইল">
                  <input
                    type="text"
                    value={data.contactEmail}
                    onChange={(e) => setData({ ...data, contactEmail: e.target.value })}
                    placeholder="lekhokforum@gmail.com"
                    className={inputCls}
                  />
                </Field>
                <Field label="হেল্পলাইন নম্বর">
                  <input
                    type="text"
                    value={data.helpline}
                    onChange={(e) => setData({ ...data, helpline: e.target.value })}
                    placeholder="+৮৮০ ১XXX-XXXXXX"
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Field label="ফেসবুক গ্রুপ/পেজ">
                  <input
                    type="text"
                    value={data.facebookUrl}
                    onChange={(e) => setData({ ...data, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/..."
                    className={inputCls}
                  />
                </Field>
                <Field label="ইউটিউব চ্যানেল">
                  <input
                    type="text"
                    value={data.youtubeUrl}
                    onChange={(e) => setData({ ...data, youtubeUrl: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className={inputCls}
                  />
                </Field>
                <Field label="টেলিগ্রাম">
                  <input
                    type="text"
                    value={data.telegramUrl}
                    onChange={(e) => setData({ ...data, telegramUrl: e.target.value })}
                    placeholder="https://t.me/..."
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="কপিরাইট-লেখা">
                <input
                  type="text"
                  value={data.copyrightText}
                  onChange={(e) => setData({ ...data, copyrightText: e.target.value })}
                  placeholder="© ২০২৬ লেখক ফোরাম — সর্বস্বত্ব সংরক্ষিত"
                  className={inputCls}
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
