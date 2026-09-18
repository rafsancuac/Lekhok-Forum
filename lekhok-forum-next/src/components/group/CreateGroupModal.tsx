'use client'

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Globe2, Lock, Loader2, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

/** নতুন গ্রুপ তৈরির মডাল (Session K) */
export default function CreateGroupModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean
  onClose: () => void
  onCreated: (groupId: string) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [privacy, setPrivacy] = useState<'OPEN' | 'CLOSED'>('OPEN')
  const [creating, setCreating] = useState(false)
  const { toast } = useToast()

  if (!isOpen) return null

  const submit = async () => {
    if (name.trim().length < 2) {
      toast({ title: 'গ্রুপের নাম দিন (কমপক্ষে ২ অক্ষর)' })
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), privacy }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'গ্রুপ তৈরি ব্যর্থ')
      toast({ title: '🎉 গ্রুপ তৈরি হয়েছে!', description: data.group?.name })
      setName('')
      setDescription('')
      setPrivacy('OPEN')
      onCreated(data.group.id)
      onClose()
    } catch (err) {
      toast({
        title: 'গ্রুপ তৈরি ব্যর্থ',
        description: err instanceof Error ? err.message : 'অজানা সমস্যা',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="নতুন গ্রুপ তৈরি করুন"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md bg-[#242526] border border-[#3e4042] rounded-2xl shadow-2xl lf-modal-pop overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3e4042]">
          <h2 className="font-extrabold text-white text-base">নতুন গ্রুপ তৈরি করুন</h2>
          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="w-8 h-8 rounded-full bg-[#3a3b3c] hover:bg-[#4a4c4e] flex items-center justify-center text-[#b0b3b8] hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="group-name" className="block text-xs font-bold text-[#b0b3b8] mb-1.5">
              গ্রুপের নাম
            </label>
            <input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 80))}
              placeholder="যেমন: শনিবারের কবিতা আসর"
              maxLength={80}
              className="w-full bg-[#3a3b3c] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#8a8d91] outline-none focus:ring-2 focus:ring-[#00a86b] transition"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit()
                }
              }}
            />
            <span className="block text-[11px] text-[#8a8d91] mt-1 text-right">{name.length}/৮০</span>
          </div>

          <div>
            <label htmlFor="group-desc" className="block text-xs font-bold text-[#b0b3b8] mb-1.5">
              বিবরণ <span className="font-normal text-[#8a8d91]">(ঐচ্ছিক)</span>
            </label>
            <textarea
              id="group-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 300))}
              rows={3}
              placeholder="এই গ্রুপে কী আলোচনা হবে?"
              className="w-full resize-none bg-[#3a3b3c] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#8a8d91] outline-none focus:ring-2 focus:ring-[#00a86b] transition"
            />
            <span className="block text-[11px] text-[#8a8d91] mt-1 text-right">
              {description.length}/৩০০
            </span>
          </div>

          <div>
            <p className="text-xs font-bold text-[#b0b3b8] mb-1.5">গোপনীয়তা</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPrivacy('OPEN')}
                aria-pressed={privacy === 'OPEN'}
                className={`flex items-start gap-2 p-3 rounded-xl border text-left transition ${
                  privacy === 'OPEN'
                    ? 'border-[#00a86b] bg-[#006a4e]/20 ring-1 ring-[#00a86b]/40'
                    : 'border-[#3e4042] bg-[#3a3b3c] hover:bg-[#4a4c4e]'
                }`}
              >
                <Globe2 className={`w-5 h-5 shrink-0 mt-0.5 ${privacy === 'OPEN' ? 'text-[#00a86b]' : 'text-[#b0b3b8]'}`} />
                <span>
                  <span className="block text-[13px] font-bold text-white">প্রকাশ্য</span>
                  <span className="block text-[11px] text-[#b0b3b8] leading-snug">সবাই দেখতে পাবে, যে কেউ যোগ দিতে পারবে</span>
                </span>
              </button>
              <button
                onClick={() => setPrivacy('CLOSED')}
                aria-pressed={privacy === 'CLOSED'}
                className={`flex items-start gap-2 p-3 rounded-xl border text-left transition ${
                  privacy === 'CLOSED'
                    ? 'border-[#00a86b] bg-[#006a4e]/20 ring-1 ring-[#00a86b]/40'
                    : 'border-[#3e4042] bg-[#3a3b3c] hover:bg-[#4a4c4e]'
                }`}
              >
                <Lock className={`w-5 h-5 shrink-0 mt-0.5 ${privacy === 'CLOSED' ? 'text-[#00a86b]' : 'text-[#b0b3b8]'}`} />
                <span>
                  <span className="block text-[13px] font-bold text-white">বন্ধ</span>
                  <span className="block text-[11px] text-[#b0b3b8] leading-snug">শুধু সদস্যরা পোস্ট দেখবে</span>
                </span>
              </button>
            </div>
          </div>

          <button
            onClick={submit}
            disabled={creating || name.trim().length < 2}
            className="w-full py-2.5 rounded-xl bg-[#006a4e] hover:bg-[#00523c] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm transition flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#00a86b] active:scale-[0.98]"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> তৈরি হচ্ছে...
              </>
            ) : (
              <>
                <Users className="w-4 h-4" /> গ্রুপ তৈরি করুন
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
