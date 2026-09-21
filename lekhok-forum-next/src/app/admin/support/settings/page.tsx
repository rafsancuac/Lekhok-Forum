'use client'

/**
 * Task 43 — সাপোর্ট-অ্যাডমিন নির্ধারণ প্যানেল (/admin/support/settings)
 *
 * শুধু সুপার-অ্যাডমিন (useAdminGate(true)):
 *   • বর্তমান সাপোর্ট-অ্যাডমিন কার্ড (রোল-ব্যাজ + সরান-বাটন)
 *   • পিকার: ক্যান্ডিডেট = রোল ∈ [ADMIN, SUPER_ADMIN] — সার্চ + এক-ক্লিকে নির্ধারণ
 *   • টোস্ট-নিশ্চিতি (alert-বিহীন)
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Loader2, Search, ShieldCheck, X } from 'lucide-react'
import AdminGate, { useAdminGate } from '@/components/admin/AdminGate'
import type { FrontendUser } from '@/lib/types'
import { roleLabel } from '@/lib/roles'

interface SupportAdminInfo {
  id: string
  name: string
  username: string
  avatarUrl?: string | null
  role: string
}

export default function SupportSettingsPage() {
  const { state, adminCandidates } = useAdminGate(true)

  return (
    <AdminGate state={state} adminCandidates={adminCandidates}>
      <SupportSettingsPanel />
    </AdminGate>
  )
}

function SupportSettingsPanel() {
  const [support, setSupport] = useState<SupportAdminInfo | null>(null)
  const [users, setUsers] = useState<FrontendUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const flash = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [a, s] = await Promise.all([
        fetch('/api/session').then((r) => r.json()),
        fetch('/api/admin/support-admin').then((r) => r.json()),
      ])
      setUsers(a.users || [])
      setSupport(s.supportAdmin ?? null)
    } catch {
      flash('তথ্য লোড ব্যর্থ — আবার চেষ্টা করুন')
    } finally {
      setLoading(false)
    }
  }, [flash])

  useEffect(() => {
    load()
  }, [load])

  /** ক্যান্ডিডেট = রোল ∈ [ADMIN, SUPER_ADMIN] (সাপোর্ট-অ্যাডমিন-চুক্তি) */
  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter(
      (u) =>
        (u.role === 'admin' || u.role === 'super_admin') &&
        (!q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))
    )
  }, [users, search])

  const assign = useCallback(
    async (userId: string) => {
      setSaving(userId)
      try {
        const res = await fetch('/api/admin/support-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || 'নির্ধারণ ব্যর্থ')
        setSupport(data.supportAdmin)
        flash(`✅ ${data.supportAdmin?.name ?? 'ইউজার'} এখন অফিসিয়াল সাপোর্ট-অ্যাডমিন`)
      } catch (err) {
        flash(err instanceof Error ? err.message : 'নির্ধারণ ব্যর্থ')
      } finally {
        setSaving(null)
      }
    },
    [flash]
  )

  const remove = useCallback(async () => {
    setSaving('remove')
    try {
      const res = await fetch('/api/admin/support-admin', { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'সরানো ব্যর্থ')
      setSupport(null)
      flash('সাপোর্ট-অ্যাডমিন সরানো হয়েছে — পিন-ইনজেকশন এখন বন্ধ')
    } catch (err) {
      flash(err instanceof Error ? err.message : 'সরানো ব্যর্থ')
    } finally {
      setSaving(null)
    }
  }, [flash])

  return (
    <div className="font-hind text-[#050505] space-y-4 max-w-3xl">
      {/* টোস্ট */}
      {toast && (
        <div
          role="status"
          className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-[#006A4E] px-4 py-2.5 text-[12.5px] font-bold text-white shadow-lg lf-anim-fade"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-1 w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center"
            aria-label="বন্ধ করুন"
            type="button"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* হেডার */}
      <div className="bg-white border border-[#CED0D4] rounded-[10px] p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#006A4E]" />
            <span>সাপোর্ট-অ্যাডমিন নির্ধারণ</span>
          </h1>
          <p className="text-xs text-[#65676B] mt-0.5">
            নির্বাচিত অ্যাডমিন সব সদস্যের মেসেঞ্জার-তালিকার শীর্ষে <b>অফিসিয়াল সাপোর্ট</b> হিসেবে
            পিন-লক থাকবেন — কেউ আনপিন করতে পারবে না; তাঁকে পাঠানো অভিযোগ রিভিউ-ডেস্কে জমা হবে।
          </p>
        </div>
        <Link
          href="/admin"
          className="px-3 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded-[8px] text-xs font-bold transition shrink-0"
        >
          ← ড্যাশবোর্ড
        </Link>
      </div>

      {loading ? (
        <div className="bg-white border border-[#CED0D4] rounded-[10px] p-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#006A4E]" />
        </div>
      ) : (
        <>
          {/* বর্তমান সাপোর্ট-অ্যাডমিন */}
          <div className="bg-white border border-[#CED0D4] rounded-[10px] p-4 shadow-2xs">
            <h2 className="text-[13px] font-bold mb-3">বর্তমান সাপোর্ট-অ্যাডমিন</h2>
            {support ? (
              <div className="flex items-center gap-3 rounded-[8px] border border-emerald-200 bg-emerald-50/60 p-3">
                {support.avatarUrl ? (
                  <img
                    src={support.avatarUrl}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-[#006A4E]/30"
                  />
                ) : (
                  <span className="w-11 h-11 rounded-full bg-[#006A4E]/20 flex items-center justify-center text-sm font-bold text-[#006A4E]">
                    {support.name.slice(0, 1)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold flex items-center gap-2 flex-wrap">
                    {support.name}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#006A4E] text-white">
                      {roleLabel(support.role)}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      পিন-লক · আনপিন-অযোগ্য
                    </span>
                  </p>
                  <p className="text-[11px] text-[#65676B]">@{support.username}</p>
                </div>
                <button
                  onClick={remove}
                  disabled={saving === 'remove'}
                  className="px-3 py-2 rounded-[8px] bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold transition disabled:opacity-50 shrink-0 cursor-pointer"
                  type="button"
                >
                  {saving === 'remove' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'সরান'}
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#65676B] py-3">
                এখনও কোনো সাপোর্ট-অ্যাডমিন নির্ধারিত নেই — নিচের তালিকা থেকে বেছে নিন।
              </p>
            )}
          </div>

          {/* পিকার */}
          <div className="bg-white border border-[#CED0D4] rounded-[10px] p-4 shadow-2xs">
            <h2 className="text-[13px] font-bold mb-3">
              ক্যান্ডিডেট (অ্যাডমিন / সুপার-অ্যাডমিন)
            </h2>
            <div className="flex items-center gap-2 bg-[#F0F2F5] rounded-[8px] px-3 py-2 mb-3">
              <Search className="w-3.5 h-3.5 text-[#65676B] shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="নাম বা ইউজারনেম খুঁজুন..."
                aria-label="ক্যান্ডিডেট খুঁজুন"
                className="bg-transparent outline-none text-[12.5px] w-full min-w-0"
              />
            </div>
            <div className="max-h-96 overflow-y-auto lf-scroll space-y-1.5 pr-1">
              {candidates.length === 0 ? (
                <p className="text-xs text-[#65676B] py-6 text-center">কোনো ক্যান্ডিডেট পাওয়া যায়নি</p>
              ) : (
                candidates.map((u) => {
                  const isCurrent = support?.id === u.id
                  return (
                    <div
                      key={u.id}
                      className={`flex items-center gap-3 rounded-[8px] border p-2.5 transition ${
                        isCurrent
                          ? 'border-emerald-300 bg-emerald-50/70'
                          : 'border-[#E4E6EB] hover:border-[#006A4E]/50 hover:bg-[#F0F7F5]'
                      }`}
                    >
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <span className="w-9 h-9 rounded-full bg-[#006A4E]/15 flex items-center justify-center text-xs font-bold text-[#006A4E]">
                          {u.name.slice(0, 1)}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-bold truncate flex items-center gap-1.5">
                          {u.name}
                          <span
                            className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full ${
                              u.role === 'super_admin'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-[#006A4E] border border-emerald-200'
                            }`}
                          >
                            {roleLabel(u.role)}
                          </span>
                        </p>
                        <p className="text-[10.5px] text-[#65676B] truncate">@{u.username}</p>
                      </div>
                      {isCurrent ? (
                        <span className="text-[11px] font-bold text-[#006A4E] flex items-center gap-1 shrink-0">
                          <ShieldCheck className="w-3.5 h-3.5" /> নির্বাচিত
                        </span>
                      ) : (
                        <button
                          onClick={() => assign(u.id)}
                          disabled={saving !== null}
                          className="px-3 py-1.5 rounded-[6px] bg-[#006A4E] hover:bg-[#00523C] text-white text-[11px] font-bold transition disabled:opacity-50 shrink-0 cursor-pointer"
                          type="button"
                        >
                          {saving === u.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            'নির্ধারণ করুন'
                          )}
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <p className="text-[11px] text-[#65676B] px-1 flex items-start gap-1.5">
            <ArrowLeft className="w-3 h-3 mt-0.5 shrink-0 rotate-180" aria-hidden />
            পিন-ইনজেকশন সার্ভার-সাইডে হয় — পরিবর্তনের সাথে-সাথে সব ইউজারের তালিকায় প্রযোজ্য হবে।
          </p>
        </>
      )}
    </div>
  )
}
