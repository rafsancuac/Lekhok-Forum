'use client'

/**
 * ঐতিহাসিক মাইলফলক (টাইমলাইন) প্যানেল — /admin/about/timeline
 * ফোরামের জন্মলগ্ন থেকে বর্তমান — সাল-ভিত্তিক ঘটনার তালিকা।
 * প্রতিটি আইটেমে: সাল + শিরোনাম + বর্ণনা + অন/অফ টগল + মুছুন; নতুন যোগ ইনলাইন-ফর্মে।
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import AdminGate, { useAdminGate } from '@/components/admin/AdminGate'
import { PageHeader, Field, inputCls, PrimaryBtn, ToggleWithLabel, StatusPill } from '@/components/admin/ui'

interface TimelineRow {
  id: string
  year: string
  title: string
  description: string
  sortOrder: number
  isActive: boolean
}

type Status = '' | 'saving' | 'success' | 'error'

const EMPTY_NEW = { year: '', title: '', description: '' }

export default function AdminTimelinePage() {
  const { state, adminCandidates } = useAdminGate()
  const [items, setItems] = useState<TimelineRow[]>([])
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
        setItems(Array.isArray(all.timeline) ? all.timeline : [])
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

  const saveRow = async (data: Partial<TimelineRow> & { id?: string }, rowKey: string) => {
    flash(rowKey, 'saving')
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'timeline', ...data }),
      })
      if (res.ok) {
        const saved: TimelineRow = await res.json()
        setItems((prev) => {
          const exists = prev.some((t) => t.id === saved.id)
          return exists ? prev.map((t) => (t.id === saved.id ? saved : t)) : [...prev, saved]
        })
        flash(rowKey, 'success')
      } else flash(rowKey, 'error')
    } catch {
      flash(rowKey, 'error')
    }
  }

  const removeRow = async (id: string) => {
    flash(id, 'saving')
    try {
      const res = await fetch(
        `/api/admin/site-settings?kind=timeline&id=${encodeURIComponent(id)}`,
        { method: 'DELETE' }
      )
      if (res.ok) setItems((prev) => prev.filter((t) => t.id !== id))
      else flash(id, 'error')
    } catch {
      flash(id, 'error')
    }
  }

  const handleAdd = async () => {
    if (!newRow.year.trim() || !newRow.title.trim()) {
      setAddError('সাল ও শিরোনাম — দুটোই দিন')
      return
    }
    setAddError('')
    await saveRow({ ...newRow, sortOrder: items.length }, 'new')
    setNewRow({ ...EMPTY_NEW })
  }

  return (
    <div className="font-hind text-[#050505]">
      <AdminGate state={state} adminCandidates={adminCandidates}>
        <PageHeader
          icon="⏳"
          title="ঐতিহাসিক মাইলফলক (টাইমলাইন)"
          description="ফোরামের জন্মলগ্ন থেকে বর্তমান — গুরুত্বপূর্ণ সাল ও ঘটনার তালিকা।"
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
            {items.length === 0 && (
              <div className="bg-white border border-dashed border-[#CED0D4] rounded-[10px] p-6 text-center">
                <span className="text-lg block mb-1" aria-hidden>⏳</span>
                <p className="text-xs font-bold text-[#050505]">এখনো কোনো মাইলফলক নেই</p>
                <p className="text-[11px] text-[#65676B] mt-0.5">
                  যেমন: ২০২০ — &quot;লেখক ফোরামের যাত্রা শুরু&quot;
                </p>
              </div>
            )}

            {items.map((t) => (
              <div
                key={t.id}
                className={`bg-white border border-[#CED0D4] rounded-[10px] p-4 shadow-2xs ${
                  !t.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-bold text-[#006A4E] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-[4px]">
                    {t.year || '—'}
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusPill status={rowStatus[t.id] ?? ''} />
                    <ToggleWithLabel
                      on={t.isActive}
                      onClick={() => saveRow({ id: t.id, isActive: !t.isActive }, t.id)}
                      disabled={rowStatus[t.id] === 'saving'}
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(t.id)}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      মুছুন
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <Field label="সাল">
                    <input
                      type="text"
                      value={t.year}
                      onChange={(e) =>
                        setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, year: e.target.value } : x)))
                      }
                      placeholder="যেমন: ২০২০"
                      className={inputCls}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="শিরোনাম">
                      <input
                        type="text"
                        value={t.title}
                        onChange={(e) =>
                          setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, title: e.target.value } : x)))
                        }
                        placeholder="যেমন: লেখক ফোরামের যাত্রা শুরু"
                        className={inputCls + ' font-bold'}
                      />
                    </Field>
                  </div>
                </div>
                <div className="mt-2.5">
                  <Field label="বর্ণনা (ঐচ্ছিক)">
                    <textarea
                      rows={2}
                      value={t.description}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((x) => (x.id === t.id ? { ...x, description: e.target.value } : x))
                        )
                      }
                      className={inputCls + ' font-kalpurush resize-none'}
                    />
                  </Field>
                </div>
                <div className="mt-2.5">
                  <PrimaryBtn
                    onClick={() =>
                      saveRow({ id: t.id, year: t.year, title: t.title, description: t.description }, t.id)
                    }
                    disabled={rowStatus[t.id] === 'saving'}
                  >
                    সংরক্ষণ
                  </PrimaryBtn>
                </div>
              </div>
            ))}

            {/* নতুন যোগ */}
            <div className="bg-white border border-[#006A4E]/40 rounded-[10px] p-4">
              <h3 className="text-sm font-bold mb-2.5 flex items-center gap-1.5">
                <span aria-hidden>➕</span> নতুন মাইলফলক যোগ করুন
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Field label="সাল">
                  <input
                    type="text"
                    value={newRow.year}
                    onChange={(e) => setNewRow({ ...newRow, year: e.target.value })}
                    placeholder="যেমন: ২০২৪"
                    className={inputCls}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="শিরোনাম">
                    <input
                      type="text"
                      value={newRow.title}
                      onChange={(e) => setNewRow({ ...newRow, title: e.target.value })}
                      placeholder="যেমন: প্রথম স্মরণিকা প্রকাশ"
                      className={inputCls + ' font-bold'}
                    />
                  </Field>
                </div>
              </div>
              <div className="mt-2.5">
                <Field label="বর্ণনা (ঐচ্ছিক)">
                  <input
                    type="text"
                    value={newRow.description}
                    onChange={(e) => setNewRow({ ...newRow, description: e.target.value })}
                    className={inputCls}
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
