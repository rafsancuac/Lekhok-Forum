'use client'

/**
 * পরিসংখ্যান কাউন্টার প্যানেল — /admin/home/stats
 * "সদস্য সংখ্যা (৫০০+)", "প্রকাশিত গ্রন্থ (১২+)" জাতীয় কাউন্টার-কার্ডের তালিকা।
 * প্রতিটি কার্ডে: আইকন + লেবেল + মান + অন/অফ টগল + মুছুন; নতুন যোগ ইনলাইন-ফর্মে।
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import AdminGate, { useAdminGate } from '@/components/admin/AdminGate'
import { PageHeader, Field, inputCls, PrimaryBtn, GhostBtn, ToggleWithLabel, StatusPill } from '@/components/admin/ui'

interface StatItem {
  id: string
  label: string
  value: string
  icon: string
  sortOrder: number
  isActive: boolean
}

type Status = '' | 'saving' | 'success' | 'error'

const EMPTY_NEW = { icon: '📊', label: '', value: '' }

export default function AdminHomeStatsPage() {
  const { state, adminCandidates } = useAdminGate()
  const [stats, setStats] = useState<StatItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [rowStatus, setRowStatus] = useState<Record<string, Status>>({})
  const [newRow, setNewRow] = useState({ ...EMPTY_NEW })
  const [addError, setAddError] = useState('')
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    const timers = timersRef.current
    return () => Object.values(timers).forEach(clearTimeout)
  }, [])

  const flash = (key: string, st: Status) => {
    setRowStatus((prev) => ({ ...prev, [key]: st }))
    clearTimeout(timersRef.current[key])
    timersRef.current[key] = setTimeout(
      () => setRowStatus((prev) => ({ ...prev, [key]: '' })),
      2500
    )
  }

  const load = useCallback(async () => {
    setIsLoading(true)
    setLoadError(false)
    try {
      const res = await fetch('/api/admin/site-settings')
      if (res.ok) {
        const all = await res.json()
        setStats(Array.isArray(all.stats) ? all.stats : [])
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

  /* ─── সেভ (নতুন বা সম্পাদনা) — ইনলাইন, পপ-আপ নেই ─── */
  const saveStat = async (item: Partial<StatItem> & { id?: string }, rowKey: string) => {
    flash(rowKey, 'saving')
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'stat', ...item }),
      })
      if (res.ok) {
        const saved: StatItem = await res.json()
        setStats((prev) => {
          const exists = prev.some((s) => s.id === saved.id)
          return exists ? prev.map((s) => (s.id === saved.id ? saved : s)) : [...prev, saved]
        })
        flash(rowKey, 'success')
      } else flash(rowKey, 'error')
    } catch {
      flash(rowKey, 'error')
    }
  }

  const removeStat = async (id: string) => {
    flash(id, 'saving')
    try {
      const res = await fetch(`/api/admin/site-settings?kind=stat&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      if (res.ok) setStats((prev) => prev.filter((s) => s.id !== id))
      else flash(id, 'error')
    } catch {
      flash(id, 'error')
    }
  }

  const handleAdd = async () => {
    if (!newRow.label.trim() || !newRow.value.trim()) {
      setAddError('লেবেল ও মান — দুটোই দিন')
      return
    }
    setAddError('')
    await saveStat({ ...newRow, sortOrder: stats.length }, 'new')
    setNewRow({ ...EMPTY_NEW })
  }

  return (
    <div className="font-hind text-[#050505]">
      <AdminGate state={state} adminCandidates={adminCandidates}>
        <PageHeader
          icon="📊"
          title="পরিসংখ্যান কাউন্টার"
          description="হোমপেজের কাউন্টার-কার্ড — সদস্য সংখ্যা, প্রকাশিত গ্রন্থ, সাহিত্য আসর ইত্যাদি।"
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
        ) : loadError ? (
          <div className="bg-white border border-[#CED0D4] rounded-[10px] p-8 text-center">
            <p className="text-sm font-bold mb-2">ডাটা লোড করা যায়নি</p>
            <PrimaryBtn onClick={load}>আবার চেষ্টা করুন</PrimaryBtn>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* বর্তমান কাউন্টারগুলো */}
            {stats.length === 0 && (
              <div className="bg-white border border-dashed border-[#CED0D4] rounded-[10px] p-6 text-center">
                <span className="text-lg block mb-1" aria-hidden>📊</span>
                <p className="text-xs font-bold text-[#050505]">এখনো কোনো কাউন্টার নেই</p>
                <p className="text-[11px] text-[#65676B] mt-0.5">নিচের ফর্ম থেকে প্রথমটি যোগ করুন</p>
              </div>
            )}

            {stats.map((s) => (
              <div
                key={s.id}
                className={`bg-white border border-[#CED0D4] rounded-[10px] p-4 shadow-2xs ${
                  !s.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-lg" aria-hidden>{s.icon}</span>
                  <div className="flex items-center gap-2">
                    <StatusPill status={rowStatus[s.id] ?? ''} />
                    <ToggleWithLabel
                      on={s.isActive}
                      onClick={() => saveStat({ id: s.id, isActive: !s.isActive }, s.id)}
                      disabled={rowStatus[s.id] === 'saving'}
                    />
                    <button
                      type="button"
                      onClick={() => removeStat(s.id)}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      মুছুন
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <Field label="আইকন (ইমোজি)">
                    <input
                      type="text"
                      value={s.icon}
                      onChange={(e) =>
                        setStats((prev) => prev.map((x) => (x.id === s.id ? { ...x, icon: e.target.value } : x)))
                      }
                      className={inputCls + ' text-center'}
                      maxLength={4}
                    />
                  </Field>
                  <Field label="লেবেল">
                    <input
                      type="text"
                      value={s.label}
                      onChange={(e) =>
                        setStats((prev) => prev.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)))
                      }
                      placeholder="যেমন: প্রকাশিত গ্রন্থ"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="মান">
                    <input
                      type="text"
                      value={s.value}
                      onChange={(e) =>
                        setStats((prev) => prev.map((x) => (x.id === s.id ? { ...x, value: e.target.value } : x)))
                      }
                      placeholder="যেমন: ১২+"
                      className={inputCls + ' font-bold'}
                    />
                  </Field>
                </div>
                <div className="mt-2.5">
                  <PrimaryBtn onClick={() => saveStat({ id: s.id, label: s.label, value: s.value, icon: s.icon }, s.id)} disabled={rowStatus[s.id] === 'saving'}>
                    সংরক্ষণ
                  </PrimaryBtn>
                </div>
              </div>
            ))}

            {/* নতুন যোগ */}
            <div className="bg-white border border-[#006A4E]/40 rounded-[10px] p-4">
              <h3 className="text-sm font-bold mb-2.5 flex items-center gap-1.5">
                <span aria-hidden>➕</span> নতুন কাউন্টার যোগ করুন
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Field label="আইকন (ইমোজি)">
                  <input
                    type="text"
                    value={newRow.icon}
                    onChange={(e) => setNewRow({ ...newRow, icon: e.target.value })}
                    className={inputCls + ' text-center'}
                    maxLength={4}
                  />
                </Field>
                <Field label="লেবেল">
                  <input
                    type="text"
                    value={newRow.label}
                    onChange={(e) => setNewRow({ ...newRow, label: e.target.value })}
                    placeholder="যেমন: সদস্য সংখ্যা"
                    className={inputCls}
                  />
                </Field>
                <Field label="মান">
                  <input
                    type="text"
                    value={newRow.value}
                    onChange={(e) => setNewRow({ ...newRow, value: e.target.value })}
                    placeholder="যেমন: ৫০০+"
                    className={inputCls + ' font-bold'}
                  />
                </Field>
              </div>
              {addError && <p className="text-[11px] text-rose-600 font-bold mt-1.5">{addError}</p>}
              <div className="mt-2.5 flex items-center gap-2">
                <PrimaryBtn onClick={handleAdd} disabled={rowStatus['new'] === 'saving'}>
                  {rowStatus['new'] === 'saving' ? 'যোগ হচ্ছে...' : 'যোগ করুন'}
                </PrimaryBtn>
                <StatusPill status={rowStatus['new'] ?? ''} />
              </div>
            </div>
          </div>
        )}
      </AdminGate>
    </div>
  )
}
