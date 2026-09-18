'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  X,
  ArrowLeft,
  Globe2,
  Users,
  Lock,
  MapPin,
  ChevronDown,
  ImagePlus,
  UserPlus,
  Smile,
  Mic,
  Clapperboard,
  MoreHorizontal,
  Loader2,
  Trash2,
  ArrowLeftCircle,
  ArrowRightCircle,
  Eraser,
  Quote,
  Link2,
  Music2,
} from 'lucide-react'
import type { FrontendUser, MediaItem, FrontendPost } from '@/lib/types'
import { compressImageFiles } from '@/lib/image-compress'
import { generateVideoPoster } from '@/lib/video-poster'
import { useToast } from '@/hooks/use-toast'

const GRADIENTS = [
  { cls: 'lf-gradient-sunset', ring: 'from-orange-400 to-pink-600' },
  { cls: 'lf-gradient-ocean', ring: 'from-teal-500 to-teal-800' },
  { cls: 'lf-gradient-forest', ring: 'from-green-500 to-emerald-900' },
  { cls: 'lf-gradient-night', ring: 'from-slate-600 to-slate-900' },
  { cls: 'lf-gradient-rose', ring: 'from-rose-500 to-purple-700' },
]

const FEELINGS = [
  'খুশি অনুভব করছি 😊',
  'অনুপ্রাণিত বোধ করছি 🌟',
  'কাব্যিক মুডে 😌',
  'চিন্তিত অনুভব করছি 😟',
  'কৃতজ্ঞ অনুভব করছি 🙏',
  'নতুন মাইলফলক অর্জন 🏆',
  'ভালোবাসায় মগ্ন 💚',
  'ক্লান্ত অনুভব করছি 😪',
]

interface UploadMedia {
  url: string
  type: string
  name: string
  posterUrl?: string | null
}

export default function CreatePostModal({
  isOpen,
  onClose,
  currentUser,
  users,
  onPostSuccess,
  editPost = null,
  groupId = null,
  groupTitle = null,
}: {
  isOpen: boolean
  onClose: () => void
  currentUser: FrontendUser | null
  users: FrontendUser[]
  onPostSuccess: () => void
  editPost?: FrontendPost | null
  /** গ্রুপে কম্পোজ করলে প্রিসেট (Session K) */
  groupId?: string | null
  groupTitle?: string | null
}) {
  const [activeView, setActiveView] = useState<'MAIN' | 'MORE'>('MAIN')
  const [selectedBg, setSelectedBg] = useState<string | null>(null)
  const [bgPickerOpen, setBgPickerOpen] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<UploadMedia[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [feeling, setFeeling] = useState<string | null>(null)
  const [location, setLocation] = useState<string | null>(null)
  const [tagged, setTagged] = useState<string[]>([])
  const [audience, setAudience] = useState<'PUBLIC' | 'FRIENDS' | 'ONLY_ME'>('PUBLIC')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [subPanel, setSubPanel] = useState<'FEELING' | 'LOCATION' | 'TAG' | null>(null)
  const [locationInput, setLocationInput] = useState('')
  const [editorHasText, setEditorHasText] = useState(false)
  const isEditing = !!editPost

  const editorRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Escape → ক্লোজ
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // এডিট-মোড প্রিফিল (মডাল খোলা অবস্থায় একবার)
  useEffect(() => {
    if (!isOpen) return
    if (editPost) {
      if (editorRef.current) editorRef.current.innerHTML = editPost.content
      setSelectedBg(editPost.backgroundColor || null)
      setFeeling(editPost.feeling)
      setLocation(editPost.location)
      setTagged(editPost.taggedUsers ? editPost.taggedUsers.split(',').filter(Boolean) : [])
      setAudience((editPost.audience as typeof audience) || 'PUBLIC')
      setMediaFiles(
        editPost.media.map((m) => ({ url: m.url, type: m.type, name: m.url.split('/').pop() || 'media' }))
      )
      setEditorHasText(editPost.content.trim().length > 0)
    } else {
      setEditorHasText(false)
    }
  }, [isOpen, editPost])

  if (!currentUser) return null

  /* ───────────── রিচ-টেক্সট এক্সিকিউশন ───────────── */
  const exec = (command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
  }

  const toggleBlock = (tag: string) => {
    const current = document.queryCommandValue('formatBlock')
    exec('formatBlock', current.toLowerCase() === tag.toLowerCase() ? '<p>' : `<${tag}>`)
  }

  const handleEditorInput = () => {
    const el = editorRef.current
    if (!el) return
    if (el.innerHTML === '<br>' || el.innerHTML === '<div><br></div>') {
      el.innerHTML = ''
    }
    setEditorHasText(el.textContent!.trim().length > 0)
  }

  /* ───────────── ফাইল আপলোড (রিয়েল) — ইমেজ আগে কমপ্রেস (Session J), ভিডিও পোস্টার (Session K) ───────────── */
  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setIsUploading(true)
    try {
      const raw = Array.from(files)
      const hasImages = raw.some((f) => f.type.startsWith('image/'))
      if (hasImages) setCompressing(true)
      const prepared = await compressImageFiles(raw)
      setCompressing(false)

      /* Session K: ভিডিওর প্রথম-ফ্রেম পোস্টার জেনারেট */
      const posterFiles: (File | null)[] = []
      for (const f of prepared) {
        posterFiles.push(f.type.startsWith('video/') ? await generateVideoPoster(f) : null)
      }

      const fd = new FormData()
      prepared.forEach((f) => fd.append('files', f))
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'আপলোড ব্যর্থ')

      /* পোস্টারগুলো আলাদা রিকুয়েস্টে আপলোড করে অর্ডার মিলিয়ে যুক্ত করা */
      const posterIdx = posterFiles.map((p, i) => (p ? i : -1)).filter((i) => i >= 0)
      const posterUrls: Record<number, string> = {}
      if (posterIdx.length > 0) {
        try {
          const fd2 = new FormData()
          posterIdx.forEach((i) => fd2.append('files', posterFiles[i]!))
          const res2 = await fetch('/api/upload', { method: 'POST', body: fd2 })
          const data2 = await res2.json()
          if (res2.ok && Array.isArray(data2.media)) {
            posterIdx.forEach((origIdx, j) => {
              if (data2.media[j]?.url) posterUrls[origIdx] = data2.media[j].url
            })
          }
        } catch {
          /* পোস্টার ব্যর্থ হলেও ভিডিও যাবে */
        }
      }

      const newMedia = ((data.media || []) as { url: string; type: string; name: string }[]).map(
        (m, i) => ({
          url: m.url,
          type: m.type,
          name: m.name,
          posterUrl: posterUrls[i] || null,
        })
      )
      setMediaFiles((prev) => [...prev, ...newMedia])
      setSelectedBg(null)
      setSubPanel(null)
      toast({ title: 'মিডিয়া যুক্ত হয়েছে', description: `${newMedia.length}টি ফাইল প্রস্তুত` })
    } catch (err) {
      toast({ title: 'আপলোড ব্যর্থ', description: String(err instanceof Error ? err.message : err), variant: 'destructive' })
    } finally {
      setIsUploading(false)
      setCompressing(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
      if (audioInputRef.current) audioInputRef.current.value = ''
    }
  }

  /* ───────────── মিডিয়া অপারেশন ───────────── */
  const removeMedia = (idx: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== idx))
  }
  const moveMedia = (idx: number, dir: -1 | 1) => {
    setMediaFiles((prev) => {
      const next = [...prev]
      const target = idx + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  /* ───────────── পোস্ট সাবমিট (নতুন/এডিট) ───────────── */
  const handleSubmitPost = async () => {
    const rawContent = editorRef.current?.innerHTML || ''
    if (!rawContent.trim() && mediaFiles.length === 0) {
      toast({ title: 'কিছু লিখুন বা মিডিয়া যুক্ত করুন' })
      return
    }
    setIsSubmitting(true)
    try {
      const payload = {
        content: rawContent,
        audience,
        backgroundColor: selectedBg,
        feeling,
        location,
        taggedUsers: tagged.length ? tagged.join(',') : null,
        media: mediaFiles.map((m, idx) => ({
          url: m.url,
          type: m.type,
          order: idx,
          ...(m.posterUrl ? { posterUrl: m.posterUrl } : {}),
        })),
        /* Session K: গ্রুপ-কম্পোজ হলে গ্রুপ সংযুক্ত */
        ...(groupId ? { groupId } : {}),
      }
      const res = await fetch(editPost ? `/api/posts/${editPost.id}` : '/api/posts', {
        method: editPost ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'পোস্ট ব্যর্থ')

      // রিসেট
      if (editorRef.current) editorRef.current.innerHTML = ''
      setMediaFiles([])
      setSelectedBg(null)
      setFeeling(null)
      setLocation(null)
      setTagged([])
      setAudience('PUBLIC')
      setEditorHasText(false)
      setActiveView('MAIN')

      toast({ title: editPost ? '✅ পোস্ট আপডেট হয়েছে!' : '🎉 পোস্ট প্রকাশিত হয়েছে!' })
      onPostSuccess()
      onClose()
    } catch (err) {
      toast({
        title: editPost ? 'আপডেট ব্যর্থ' : 'পোস্ট প্রকাশ ব্যর্থ',
        description: err instanceof Error ? err.message : 'অজানা সমস্যা',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasContent = editorHasText || mediaFiles.length > 0

  const audienceOptions = [
    { value: 'PUBLIC', label: '🌍 পাবলিক' },
    { value: 'FRIENDS', label: '👥 বন্ধুরা' },
    { value: 'ONLY_ME', label: '🔒 শুধু আমি' },
  ] as const

  const moreItems = [
    {
      id: 'media',
      title: 'ছবি / ভিডিও',
      desc: 'ফিডে শেয়ার করুন',
      icon: <ImagePlus className="w-6 h-6 text-emerald-500" />,
      action: () => imageInputRef.current?.click(),
    },
    {
      id: 'tag',
      title: 'বন্ধুদের ট্যাগ করুন',
      desc: tagged.length ? `${tagged.length} জন ট্যাগড` : 'লেখক সঙ্গীদের যুক্ত করুন',
      icon: <UserPlus className="w-6 h-6 text-sky-500" />,
      action: () => setSubPanel('TAG'),
    },
    {
      id: 'feeling',
      title: 'অনুভূতি / কার্যকলাপ',
      desc: feeling || 'আপনার মুড জানান',
      icon: <Smile className="w-6 h-6 text-amber-500" />,
      action: () => setSubPanel('FEELING'),
    },
    {
      id: 'location',
      title: 'চেক-ইন',
      desc: location || 'কোথায় আছেন?',
      icon: <MapPin className="w-6 h-6 text-rose-500" />,
      action: () => setSubPanel('LOCATION'),
    },
    {
      id: 'audio',
      title: 'ভয়েস / অডিও নোট',
      desc: 'কবিতা আবৃত্তি বা ভয়েস',
      icon: <Mic className="w-6 h-6 text-purple-500" />,
      action: () => audioInputRef.current?.click(),
    },
    {
      id: 'video',
      title: 'লাইভ ভিডিও',
      desc: 'শীঘ্রই আসছে',
      icon: <Clapperboard className="w-6 h-6 text-red-400" />,
      action: () => toast({ title: 'লাইভ ভিডিও শীঘ্রই আসছে' }),
    },
  ]

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px] flex items-end sm:items-center justify-center sm:p-4 lf-anim-fade ${
        isOpen ? '' : 'hidden'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="পোস্ট তৈরি করুন"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-[#242526] text-[#e4e6eb] w-full sm:max-w-[520px] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[#3e4042] overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh] lf-anim-pop">
        {/* ═════════ হেডার ═════════ */}
        <div className="relative px-4 py-3 border-b border-[#3e4042] flex items-center justify-center shrink-0">
          {(activeView === 'MORE' || subPanel) && (
            <button
              onClick={() => (subPanel ? setSubPanel(null) : setActiveView('MAIN'))}
              className="absolute left-3 w-9 h-9 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] flex items-center justify-center text-white transition"
              aria-label="ফিরে যান"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h3 className="font-bold text-base text-white">
            {subPanel === 'FEELING'
              ? 'অনুভূতি নির্বাচন করুন'
              : subPanel === 'LOCATION'
                ? 'চেক-ইন'
                : subPanel === 'TAG'
                  ? 'বন্ধুদের ট্যাগ করুন'
                  : activeView === 'MAIN'
                    ? isEditing
                      ? 'পোস্ট সম্পাদনা করুন'
                      : 'পোস্ট তৈরি করুন'
                    : 'পোস্টে যুক্ত করুন'}
          </h3>
          <button
            onClick={onClose}
            className="absolute right-3 w-9 h-9 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] flex items-center justify-center text-[#b0b3b8] hover:text-white transition"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Session K: গ্রুপ-কম্পোজ ব্যানার */}
        {groupId && groupTitle && activeView === 'MAIN' && !subPanel && (
          <div className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#006a4e]/20 ring-1 ring-[#00a86b]/40 text-[12.5px] text-[#8ecfcc]">
            <Users className="w-4 h-4 shrink-0 text-[#00a86b]" />
            <span className="truncate">
              <strong className="font-extrabold text-[#33d79f]">{groupTitle}</strong> গ্রুপে প্রকাশিত হবে
            </span>
          </div>
        )}

        {/* ═════════ ভিউ: সাব-প্যানেল (অনুভূতি / লোকেশন / ট্যাগ) ═════════ */}
        {subPanel === 'FEELING' && (
          <div className="p-3 overflow-y-auto lf-scroll lf-anim-right space-y-1">
            {FEELINGS.map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFeeling(f)
                  setSubPanel(null)
                  setActiveView('MAIN')
                }}
                className={`w-full p-3 hover:bg-[#3a3b3c] rounded-xl flex items-center justify-between text-left transition ${
                  feeling === f ? 'bg-[#3a3b3c]' : ''
                }`}
              >
                <span className="text-sm font-medium text-white">{f}</span>
                {feeling === f && <span className="text-emerald-500 text-xs font-bold">নির্বাচিত</span>}
              </button>
            ))}
            {feeling && (
              <button
                onClick={() => {
                  setFeeling(null)
                  setSubPanel(null)
                }}
                className="w-full p-2.5 text-rose-400 hover:bg-[#3a3b3c] rounded-xl text-sm font-semibold transition"
              >
                অনুভূতি সরান
              </button>
            )}
          </div>
        )}

        {subPanel === 'LOCATION' && (
          <div className="p-4 overflow-y-auto lf-scroll lf-anim-right space-y-3">
            <div className="flex items-center gap-2 bg-[#3a3b3c] rounded-xl px-3 py-2.5">
              <MapPin className="w-5 h-5 text-rose-500" />
              <input
                autoFocus
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && locationInput.trim()) {
                    setLocation(locationInput.trim())
                    setSubPanel(null)
                  }
                }}
                placeholder="স্থানের নাম লিখুন..."
                className="bg-transparent outline-none w-full text-sm text-white placeholder:text-[#65676b]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (locationInput.trim()) {
                    setLocation(locationInput.trim())
                    setSubPanel(null)
                  }
                }}
                className="flex-1 py-2.5 bg-[#006a4e] hover:bg-[#00523c] rounded-xl text-sm font-bold text-white transition"
              >
                যুক্ত করুন
              </button>
              <button
                onClick={() => {
                  setLocation(null)
                  setLocationInput('')
                  setSubPanel(null)
                }}
                className="flex-1 py-2.5 bg-[#3a3b3c] hover:bg-[#4e4f50] rounded-xl text-sm font-semibold text-white transition"
              >
                সরান
              </button>
            </div>
          </div>
        )}

        {subPanel === 'TAG' && (
          <div className="p-3 overflow-y-auto lf-scroll lf-anim-right space-y-1 max-h-[50vh]">
            {users
              .filter((u) => u.id !== currentUser.id)
              .map((u) => {
                const checked = tagged.includes(u.id)
                return (
                  <button
                    key={u.id}
                    onClick={() =>
                      setTagged((prev) =>
                        checked ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                      )
                    }
                    className="w-full p-2 hover:bg-[#3a3b3c] rounded-xl flex items-center gap-3 text-left transition"
                  >
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#4e4f50]" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{u.name}</p>
                      <p className="text-xs text-[#b0b3b8]">@{u.username}</p>
                    </div>
                    <span
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs ${
                        checked
                          ? 'bg-[#006a4e] border-[#006a4e] text-white'
                          : 'border-[#65676b]'
                      }`}
                    >
                      {checked && '✓'}
                    </span>
                  </button>
                )
              })}
            <button
              onClick={() => {
                setSubPanel(null)
                setActiveView('MAIN')
              }}
              className="w-full mt-2 py-2.5 bg-[#006a4e] hover:bg-[#00523c] rounded-xl text-sm font-bold text-white transition"
            >
              সম্পন্ন ({tagged.length} জন ট্যাগড)
            </button>
          </div>
        )}

        {/* ═════════ ভিউ: MAIN (ড্রাফট রক্ষায় সবসময় mounted, CSS দিয়ে hide) ═════════ */}
        <div className={`${!subPanel && activeView === 'MAIN' ? 'contents' : 'hidden'}`}>
          <div className="p-4 flex-1 overflow-y-auto lf-scroll space-y-3">
            {/* ইউজার + অডিয়েন্স */}
            <div className="flex items-center gap-3">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#4e4f50]" />
              )}
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-white truncate">{currentUser.name}</h4>
                <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                  <div className="relative">
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value as typeof audience)}
                      className="appearance-none bg-[#3a3b3c] text-[11px] font-semibold text-[#b0b3b8] rounded-md pl-2 pr-6 py-0.5 outline-none cursor-pointer border border-transparent hover:border-[#65676b]"
                      aria-label="দর্শক নির্বাচন"
                    >
                      {audienceOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-[#b0b3b8] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  {feeling && (
                    <span className="text-[11px] bg-[#3a3b3c] px-2 py-0.5 rounded-md text-amber-400">
                      {feeling}
                    </span>
                  )}
                  {location && (
                    <span className="text-[11px] bg-[#3a3b3c] px-2 py-0.5 rounded-md text-emerald-400 truncate max-w-[130px]">
                      📍 {location}
                    </span>
                  )}
                  {tagged.length > 0 && (
                    <span className="text-[11px] bg-[#3a3b3c] px-2 py-0.5 rounded-md text-sky-400">
                      👥 {tagged.length} জন
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ═══ এমএস অফিস বেসিক ফরম্যাটিং টুলবার ═══ */}
            <div className="flex items-center gap-0.5 bg-[#18191a] p-1.5 rounded-xl border border-[#3e4042] text-[#b0b3b8] overflow-x-auto no-scrollbar">
              <ToolBtn onMouseDown label="বড় হেডিং" bold onClick={() => toggleBlock('h1')}>
                <span className="text-xs font-extrabold">H১</span>
              </ToolBtn>
              <ToolBtn onMouseDown label="সাব-হেডিং" onClick={() => toggleBlock('h2')}>
                <span className="text-xs font-extrabold">H২</span>
              </ToolBtn>
              <ToolBtn onMouseDown label="বোল্ড" onClick={() => exec('bold')}>
                <span className="text-xs font-black">B</span>
              </ToolBtn>
              <ToolBtn onMouseDown label="ইটালিক" onClick={() => exec('italic')}>
                <span className="text-xs italic font-serif font-bold">I</span>
              </ToolBtn>
              <ToolBtn onMouseDown label="আন্ডারলাইন" onClick={() => exec('underline')}>
                <span className="text-xs underline font-bold">U</span>
              </ToolBtn>
              <ToolBtn onMouseDown label="স্ট্রাইক" onClick={() => exec('strikeThrough')}>
                <span className="text-xs line-through font-bold">S</span>
              </ToolBtn>
              <Divider />
              <ToolBtn onMouseDown label="বুলেট তালিকা" onClick={() => exec('insertUnorderedList')}>
                <ListBullets />
              </ToolBtn>
              <ToolBtn onMouseDown label="নাম্বারিং তালিকা" onClick={() => exec('insertOrderedList')}>
                <ListNumbers />
              </ToolBtn>
              <Divider />
              <ToolBtn onMouseDown label="বাম প্রান্তিক" onClick={() => exec('justifyLeft')}>
                <AlignIcon lines="left" />
              </ToolBtn>
              <ToolBtn onMouseDown label="মাঝখানে" onClick={() => exec('justifyCenter')}>
                <AlignIcon lines="center" />
              </ToolBtn>
              <ToolBtn onMouseDown label="ডান প্রান্তিক" onClick={() => exec('justifyRight')}>
                <AlignIcon lines="right" />
              </ToolBtn>
              <Divider />
              <ToolBtn onMouseDown label="উদ্ধৃতি" onClick={() => toggleBlock('blockquote')}>
                <Quote className="w-4 h-4" />
              </ToolBtn>
              <ToolBtn
                onMouseDown
                label="লিংক"
                onClick={() => {
                  const url = window.prompt('লিংক URL দিন:')
                  if (url) exec('createLink', url)
                }}
              >
                <Link2 className="w-4 h-4" />
              </ToolBtn>
              <ToolBtn
                onMouseDown
                label="ফরম্যাট মুছুন"
                onClick={() => {
                  exec('removeFormat')
                  exec('formatBlock', '<p>')
                }}
              >
                <Eraser className="w-4 h-4" />
              </ToolBtn>
            </div>

            {/* ═══ ডায়নামিক এডিটর ক্যানভাস (বর্ডারহীন) ═══ */}
            <div
              className={`relative rounded-xl transition-all duration-200 ${
                selectedBg ? `${selectedBg} min-h-[180px] flex items-center justify-center p-5` : 'min-h-[120px]'
              }`}
            >
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                role="textbox"
                aria-multiline="true"
                aria-label="পোস্ট লেখার এডিটর"
                data-placeholder={`${currentUser.name.split(' ')[0]}, আপনার মনের কথা লিখুন...`}
                onInput={handleEditorInput}
                className={`lf-editor outline-none w-full text-[15px] leading-relaxed break-words ${
                  selectedBg ? 'on-gradient text-white font-semibold text-lg' : 'text-[#e4e6eb]'
                }`}
              />
            </div>

            {/* ═══ কালার প্যালেট ('Aa') ═══ */}
            {mediaFiles.length === 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setBgPickerOpen(!bgPickerOpen)}
                  className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${GRADIENTS[0].ring} text-white font-bold text-xs flex items-center justify-center shadow hover:scale-105 transition`}
                  title="ব্যাকগ্রাউন্ড রঙ"
                >
                  Aa
                </button>
                {bgPickerOpen && (
                  <div className="flex items-center gap-1.5 lf-anim-fade">
                    {GRADIENTS.map((g) => (
                      <button
                        key={g.cls}
                        type="button"
                        onClick={() => setSelectedBg(selectedBg === g.cls ? null : g.cls)}
                        className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${g.ring} cursor-pointer hover:scale-110 transition ${
                          selectedBg === g.cls ? 'ring-2 ring-white scale-110' : ''
                        }`}
                        aria-label="রঙ নির্বাচন"
                      />
                    ))}
                    {selectedBg && (
                      <button
                        onClick={() => setSelectedBg(null)}
                        className="text-[10px] text-[#b0b3b8] hover:text-white ml-1"
                      >
                        রিসেট
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ═══ মিডিয়া প্রিভিউ (ক্রম-পরিবর্তনযোগ্য) ═══ */}
            {mediaFiles.length > 0 && (
              <div className="relative border border-[#3e4042] rounded-xl p-2 bg-[#18191a] space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-[#b0b3b8]">
                    মিডিয়া ({mediaFiles.length}) — কোলাজে সাজানো হবে
                  </span>
                  <button
                    onClick={() => setMediaFiles([])}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    সব সরান
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5 max-h-[240px] overflow-y-auto lf-scroll">
                  {mediaFiles.map((m, i) => (
                    <div
                      key={`${m.url}-${i}`}
                      className="relative group h-20 rounded-lg overflow-hidden bg-black/40 border border-[#3e4042]"
                    >
                      {m.type === 'VIDEO' ? (
                        <video src={m.url} className="w-full h-full object-cover" preload="metadata" />
                      ) : m.type === 'AUDIO' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-[#0d4a3a] to-[#0f172a]">
                          <Music2 className="w-4 h-4 text-white/80" />
                          <span className="text-[9px] text-white/70 truncate max-w-full px-1">
                            {m.name}
                          </span>
                        </div>
                      ) : (
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                      )}
                      {/* ক্রম পরিবর্তন */}
                      <div className="absolute inset-x-0 bottom-0 flex justify-between opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => moveMedia(i, -1)}
                          disabled={i === 0}
                          className="bg-black/70 text-white rounded-tl-lg p-0.5 disabled:opacity-0"
                          aria-label="আগে নিন"
                        >
                          <ArrowLeftCircle className="w-4 h-4" />
                        </button>
                        <span className="absolute left-1 top-0.5 bg-black/70 text-white text-[9px] rounded px-1">
                          #{i + 1}
                        </span>
                        <button
                          onClick={() => moveMedia(i, 1)}
                          disabled={i === mediaFiles.length - 1}
                          className="bg-black/70 text-white rounded-tr-lg p-0.5 disabled:opacity-0"
                          aria-label="পরে নিন"
                        >
                          <ArrowRightCircle className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeMedia(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition"
                        aria-label="সরান"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isUploading && (
              <div className="flex items-center gap-2 text-xs text-[#b0b3b8] justify-center py-2" role="status">
                <Loader2 className="w-4 h-4 animate-spin" />{' '}
                {compressing ? 'ছবি অপটিমাইজ হচ্ছে...' : 'মিডিয়া আপলোড হচ্ছে...'}
              </div>
            )}

            {/* হিডেন ইনপুট */}
            <input
              type="file"
              ref={imageInputRef}
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => uploadFiles(e.target.files)}
            />
            <input
              type="file"
              ref={audioInputRef}
              multiple
              accept="audio/*"
              className="hidden"
              onChange={(e) => uploadFiles(e.target.files)}
            />

            {/* ═══ ডক বার: 'পোস্টে যুক্ত করুন' ═══ */}
            <div className="border border-[#3e4042] rounded-xl p-2 flex items-center justify-between bg-[#18191a]">
              <span className="text-xs font-semibold text-[#b0b3b8] pl-1">পোস্টে যুক্ত করুন</span>
              <div className="flex items-center gap-0.5">
                <IconBtn
                  label="ছবি/ভিডিও"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImagePlus className="w-5 h-5 text-emerald-500" />
                </IconBtn>
                <IconBtn label="বন্ধু ট্যাগ" onClick={() => setSubPanel('TAG')}>
                  <UserPlus className="w-5 h-5 text-sky-400" />
                </IconBtn>
                <IconBtn label="অনুভূতি" onClick={() => setSubPanel('FEELING')}>
                  <Smile className="w-5 h-5 text-amber-500" />
                </IconBtn>
                <IconBtn label="চেক-ইন" onClick={() => setSubPanel('LOCATION')}>
                  <MapPin className="w-5 h-5 text-rose-500" />
                </IconBtn>
                <IconBtn
                  label="আরও অপশন"
                  onClick={() => setActiveView('MORE')}
                >
                  <MoreHorizontal className="w-5 h-5 text-[#b0b3b8]" />
                </IconBtn>
              </div>
            </div>

            {/* ═══ পোস্ট বাটন ═══ */}
            <button
              onClick={handleSubmitPost}
              disabled={isSubmitting || isUploading || !hasContent}
              className="w-full py-2.5 bg-[#006a4e] hover:bg-[#00523c] text-white font-bold text-sm rounded-xl transition shadow-md disabled:bg-[#3a3b3c] disabled:text-[#65676b] disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />{' '}
                  {isEditing ? 'সংরক্ষণ হচ্ছে...' : 'প্রকাশ হচ্ছে...'}
                </>
              ) : isEditing ? (
                'সংরক্ষণ করুন'
              ) : (
                'পোস্ট করুন'
              )}
            </button>
          </div>
        </div>

        {/* ═════════ ভিউ: MORE (৩-ডট স্লাইড সাব-মেনু) ═════════ */}
        <div className={`${!subPanel && activeView === 'MORE' ? 'contents' : 'hidden'}`}>
          <div className="p-3 flex-1 overflow-y-auto lf-scroll space-y-1 lf-anim-right">
            {moreItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full p-2.5 hover:bg-[#3a3b3c] rounded-xl flex items-center gap-3 transition text-left"
              >
                <span className="w-11 h-11 rounded-full bg-[#3a3b3c] flex items-center justify-center shrink-0">
                  {item.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white">{item.title}</span>
                  <span className="block text-xs text-[#b0b3b8] truncate">{item.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── ছোট হেল্পার কম্পোনেন্ট ─── */
function ToolBtn({
  children,
  onClick,
  label,
  onMouseDown,
  bold,
}: {
  children: React.ReactNode
  onClick: () => void
  label: string
  onMouseDown?: boolean
  bold?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={onMouseDown ? (e) => e.preventDefault() : undefined}
      onClick={onClick}
      className={`px-2 h-8 min-w-[32px] hover:bg-[#3a3b3c] rounded-lg flex items-center justify-center shrink-0 transition ${
        bold ? 'text-[#00c471]' : ''
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="w-px h-5 bg-[#3e4042] mx-1 shrink-0" />
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="w-9 h-9 rounded-full hover:bg-[#3a3b3c] flex items-center justify-center transition"
    >
      {children}
    </button>
  )
}

function ListBullets() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="2.5" cy="4" r="1.3" />
      <circle cx="2.5" cy="8" r="1.3" />
      <circle cx="2.5" cy="12" r="1.3" />
      <rect x="5.5" y="3.2" width="9" height="1.6" rx="0.8" />
      <rect x="5.5" y="7.2" width="9" height="1.6" rx="0.8" />
      <rect x="5.5" y="11.2" width="9" height="1.6" rx="0.8" />
    </svg>
  )
}

function ListNumbers() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <text x="0" y="5" fontSize="5.2" fontFamily="sans-serif">
        1
      </text>
      <text x="0" y="10.5" fontSize="5.2" fontFamily="sans-serif">
        2
      </text>
      <text x="0" y="16" fontSize="5.2" fontFamily="sans-serif">
        3
      </text>
      <rect x="5.5" y="3.2" width="9" height="1.6" rx="0.8" />
      <rect x="5.5" y="7.7" width="9" height="1.6" rx="0.8" />
      <rect x="5.5" y="12.2" width="9" height="1.6" rx="0.8" />
    </svg>
  )
}

function AlignIcon({ lines }: { lines: 'left' | 'center' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x={lines === 'right' ? 6 : 1} y="2.5" width={lines === 'center' ? 10 : 9} height="1.6" rx="0.8" />
      <rect x={lines === 'right' ? 4 : 1} y="6" width={lines === 'center' ? 8 : 11} height="1.6" rx="0.8" />
      <rect x={lines === 'right' ? 8 : 1} y="9.5" width={lines === 'center' ? 10 : 7} height="1.6" rx="0.8" />
      <rect x={lines === 'right' ? 5 : 1} y="13" width={lines === 'center' ? 8 : 10} height="1.6" rx="0.8" />
    </svg>
  )
}
