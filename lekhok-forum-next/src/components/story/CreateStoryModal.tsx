'use client'

import React, { useRef, useState } from 'react'
import { X, Type, ImageIcon, Loader2, Upload, Trash2 } from 'lucide-react'
import { STORY_GRADIENTS } from '@/lib/story-data'
import { compressImage } from '@/lib/image-compress'
import { useToast } from '@/hooks/use-toast'

type Tab = 'TEXT' | 'PHOTO'

export default function CreateStoryModal({
  open,
  onClose,
  onCreated,
  authorName,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
  authorName: string
}) {
  const [tab, setTab] = useState<Tab>('TEXT')
  const [text, setText] = useState('')
  const [gradient, setGradient] = useState(STORY_GRADIENTS[0].key)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  if (!open) return null

  const MAX_TEXT = 500

  const reset = () => {
    setText('')
    setGradient(STORY_GRADIENTS[0].key)
    setMediaUrl(null)
    setTab('TEXT')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleUpload = async (rawFile: File) => {
    setUploading(true)
    try {
      const file = await compressImage(rawFile) // Session J: আপলোডের আগে অপটিমাইজ
      const fd = new FormData()
      fd.append('files', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.media?.[0]) throw new Error(data.error || 'আপলোড ব্যর্থ')
      setMediaUrl(data.media[0].url)
      setTab('PHOTO')
      toast({ title: 'ছবি প্রস্তুত ✨' })
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : 'আপলোড ব্যর্থ',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    const payload =
      tab === 'TEXT'
        ? { text: text.trim(), background: gradient }
        : { mediaUrl, text: text.trim() || null }
    if (tab === 'TEXT' && !text.trim()) return
    if (tab === 'PHOTO' && !mediaUrl) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'স্টোরি পোস্ট ব্যর্থ')
      }
      onCreated()
      handleClose()
      toast({ title: 'স্টোরি পোস্ট হয়েছে 🎉 ২৪ ঘণ্টা দেখা যাবে' })
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : 'স্টোরি পোস্ট ব্যর্থ',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit =
    !submitting && !uploading && (tab === 'TEXT' ? Boolean(text.trim()) : Boolean(mediaUrl))

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px] flex items-end sm:items-center justify-center sm:p-4 lf-anim-fade"
      role="dialog"
      aria-modal="true"
      aria-label="স্টোরি তৈরি করুন"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div className="w-full sm:max-w-[520px] bg-[#242526] sm:rounded-xl rounded-t-2xl border border-[#3e4042] shadow-2xl overflow-hidden lf-anim-rise">
        {/* হেডার */}
        <div className="relative px-4 py-3 border-b border-[#3e4042]">
          <h2 className="text-center text-[17px] font-extrabold text-white">স্টোরি তৈরি করুন</h2>
          <button
            onClick={handleClose}
            aria-label="বন্ধ করুন"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#3a3b3c] hover:bg-[#4a4c4e] flex items-center justify-center text-[#e4e6eb] transition focus-visible:ring-2 focus-visible:ring-[#00a86b]"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* ট্যাব */}
        <div className="flex gap-1 px-4 pt-3">
          <button
            onClick={() => setTab('TEXT')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-[#00a86b] ${
              tab === 'TEXT' ? 'bg-[#006a4e] text-white' : 'bg-[#3a3b3c] text-[#b0b3b8] hover:bg-[#4a4c4e]'
            }`}
          >
            <Type className="w-4 h-4" /> লেখা
          </button>
          <button
            onClick={() => setTab('PHOTO')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-[#00a86b] ${
              tab === 'PHOTO' ? 'bg-[#006a4e] text-white' : 'bg-[#3a3b3c] text-[#b0b3b8] hover:bg-[#4a4c4e]'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> ছবি
          </button>
        </div>

        <div className="p-4 flex gap-4">
          {/* লাইভ প্রিভিউ */}
          <div
            className={`relative w-[128px] h-[216px] rounded-xl overflow-hidden shrink-0 shadow-lg ${
              tab === 'TEXT' ? gradient : ''
            }`}
          >
            {tab === 'PHOTO' && mediaUrl ? (
              <img src={mediaUrl} alt="স্টোরি প্রিভিউ" className="absolute inset-0 w-full h-full object-cover" />
            ) : null}
            {tab === 'PHOTO' && !mediaUrl ? (
              <div className="absolute inset-0 story-gradient-2 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-white/50" />
              </div>
            ) : null}
            {text.trim() ? (
              <div
                className={`absolute inset-0 flex items-center justify-center p-3 ${
                  tab === 'PHOTO' ? 'bg-black/25' : ''
                }`}
              >
                <p className="text-white text-[13px] font-extrabold leading-relaxed text-center whitespace-pre-wrap drop-shadow-md line-clamp-6">
                  {text.trim()}
                </p>
              </div>
            ) : (
              tab === 'TEXT' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/60 text-xs font-semibold">প্রিভিউ</p>
                </div>
              )
            )}
            <span className="absolute bottom-1.5 left-1.5 text-[10px] text-white/75 font-bold bg-black/40 rounded px-1.5 py-0.5">
              {authorName}
            </span>
          </div>

          {/* ইনপুট এলাকা */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
              placeholder="স্টোরিতে যা বলতে চান লিখুন… (ঐচ্ছিক)"
              rows={4}
              className="w-full resize-none bg-[#3a3b3c] rounded-lg px-3 py-2.5 text-sm text-[#e4e6eb] placeholder-[#8a8d91] outline-none focus:ring-2 focus:ring-[#00a86b] transition"
            />
            <div className="text-[11px] text-[#b0b3b8] -mt-2">
              {text.length}/{MAX_TEXT} অক্ষর
            </div>

            {/* গ্রেডিয়েন্ট প্যালেট (শুধু লেখা-ট্যাবে) */}
            {tab === 'TEXT' && (
              <div>
                <p className="text-xs font-bold text-[#b0b3b8] mb-1.5">পটভূমি</p>
                <div className="flex gap-2 flex-wrap">
                  {STORY_GRADIENTS.map((g) => (
                    <button
                      key={g.key}
                      onClick={() => setGradient(g.key)}
                      title={g.label}
                      aria-label={`${g.label} পটভূমি`}
                      className={`w-9 h-9 rounded-lg ${g.key} transition ${
                        gradient === g.key
                          ? 'ring-2 ring-[#00a86b] ring-offset-2 ring-offset-[#242526] scale-105'
                          : 'opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ছবি-ট্যাব কন্ট্রোল */}
            {tab === 'PHOTO' && (
              <div className="flex items-center gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-label="স্টোরির ছবি আপলোড"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleUpload(f)
                    e.target.value = ''
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#3a3b3c] hover:bg-[#4a4c4e] text-sm font-bold text-[#e4e6eb] transition disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[#00a86b]"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {mediaUrl ? 'ছবি বদলান' : 'ছবি বাছুন'}
                </button>
                {mediaUrl && (
                  <button
                    onClick={() => setMediaUrl(null)}
                    aria-label="ছবি সরান"
                    className="w-10 py-2.5 rounded-lg bg-[#3a3b3c] hover:bg-rose-600/70 text-[#e4e6eb] flex items-center justify-center transition focus-visible:ring-2 focus-visible:ring-[#00a86b]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ফুটার */}
        <div className="px-4 pb-4">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-2.5 rounded-lg bg-[#006a4e] hover:bg-[#00523c] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-extrabold transition focus-visible:ring-2 focus-visible:ring-[#00a86b] active:scale-[0.99]"
          >
            {submitting ? 'পোস্ট হচ্ছে…' : 'স্টোরি শেয়ার করুন'}
          </button>
        </div>
      </div>
    </div>
  )
}
