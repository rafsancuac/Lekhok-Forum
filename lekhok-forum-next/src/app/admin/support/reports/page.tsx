'use client'

/**
 * Task 43 — অভিযোগ-রিভিউ ডেস্ক (/admin/support/reports)
 *
 * ম্যানেজার (admin/super_admin) বা নির্বাচিত সাপোর্ট-অ্যাডমিন:
 *   • স্টেটাস-ট্যাব: PENDING / IN_PROGRESS / RESOLVED (লাইভ-কাউন্টসহ)
 *   • অভিযোগ-কার্ড: প্রেরক + সময় + লেখা + মিডিয়া-প্রিভিউ (ছবি/অডিও/ভিডিও)
 *   • অ্যাকশন: স্টেটাস-পরিবর্তন + অ্যাডমিন-নোট (সেভ)
 * session202 — অ্যাওয়্যারনেস-প্যাক:
 *   • CSV-এক্সপোর্ট (UTF-8 BOM, বাংলা-হেডার, RFC-4180-escape)
 *   • স্টেটাস-রঙা বাম-অ্যাকসেন্ট বর্ডার + প্রেরক-অ্যাভাটার (ডিটারমিনিস্টিক রঙ)
 *   • বাংলা আপেক্ষিক-সময় (টাইটেলে পূর্ণ-স্ট্যাম্প) + লেখা-কপি বাটন
 *   • ছবি-লাইটবক্স (Esc/ব্যাকড্রপ-বন্ধ) + শীল্ড ইম্পটি-স্টেট
 *   • আপডেটে 'lf:support-changed' ডিসপ্যাচ → সাইডবার/ড্যাশবোর্ড ব্যাজ তাৎক্ষণিক
 * session207 — অ্যানালিটিক্স + ফিল্টার-ডেপথ প্যাক:
 *   • পরিসংখ্যান মিনি-কার্ড ×৪ (মোট/নতুন/চলমান/সমাধান — ক্লিকে ট্যাব-সুইচ, শেয়ার-বার)
 *   • তারিখ-সীমা চিপ (আজ/৭ দিন/৩০ দিন) + ক্রম-টগল (সাম্প্রতক↔পুরাতন)
 *   • CSV এখন বর্তমান-ফিল্টার-অনুযায়ী রপ্তানি (Task57-প্রস্তাব-④)
 *   • "/" কীবোর্ড-শর্টকাটে অনুসন্ধান-ফোকাস
 * session210 — অপারেশনস-ডেপথ প্যাক:
 *   • CSV-এ "ইতিহাস" কলাম (Task60-প্রস্তাব-④) — noteHistory → কমপ্যাক্ট বাংলা অডিট-সারি (lib/support-history)
 *   • বয়স-SLA চিপ (আজকের সবুজ / X দিন ধরে অ্যাম্বার / ৩+ দিন লাল) + ৩+-দিন-স্টেল অ্যালার্ট-বার (ক্লিকে পুরাতন-আগে)
 *   • স্টাইল: মোট-কার্ড hover-লিফট (অন্য-স্ট্যাট-কার্ডের সাথে সামঞ্জস্য) + অ্যাকশন-বাটনে focus-ring
 * session212 — কীবোর্ড-দক্ষতা প্যাক:
 *   • j/k: কার্ড-কার্সর নেভিগেশন (smooth-scroll-center + সবুজ-রিং) · x: কার্সর-কার্ড বাল্ক-নির্বাচন টগল
 *   • ১/২/৩ (ও 1/2/3): ট্যাব-সুইচ · ?: শর্টকাট-সহায়িকা-ওভারলে (Esc/ব্যাকড্রপ-বন্ধ) · Esc: কার্সর/সহায়িকা বন্ধ
 *   • টুলবারে "শর্টকাট ?" হিন্ট-বাটন + lf-kbd কী-ক্যাপ স্টাইল (globals.css)
 *   • হাউজকিপিং-চুক্তি: QA-সুইট নিজের-জঞ্জাল নিজেই-মোছে (task52/54-সুইটে স্বয়ংক্রিয়-ক্লিনআপ)
 * session213 — লাইভ-সচেতনতা প্যাক:
 *   • পোল-ডিফ নতুন-অভিযোগ-টোস্ট (প্রথম-লোডে নয়) + ট্যাব-টাইটেলে PENDING-ব্যাজ "(৩) …" (আনমাউন্টে মূল-ফেরত)
 *   • স্টিকি ফিল্টার-বার (top-2, backdrop-blur) — দীর্ঘ-তালিকায় ফিল্টার-সবসময়-হাতের-নাগালে
 *   • CSV-ফাইলনামে ফিল্টার-প্রসঙ্গ (ট্যাব + মিডিয়া) — স্প্রেডশিট-সংগঠন-সহজ
 * session214 — অপারেটর-দক্ষতা প্যাক:
 *   • প্রেরক-ঝলক পপওভার: অ্যাভাটার/নাম-ক্লিকে ওই প্রেরকের সব-অভিযোগের পরিসংখ্যান (মোট/স্টেটাস/মিডিয়া/সর্বশেষ),
 *     "এ-প্রেরকের সব অভিযোগ দেখুন" বাটনে অনুসন্ধান-ফিল্টার — ক্লায়েন্ট-সাইড, API/schema-বদল-শূন্য
 *   • নতুন-অভিযোগ শব্দ-সংকেত (Web Audio two-tone চাইম, অ্যাসেট-শূন্য) — পোল-ডিফ fresh>0-তে টোস্টের-সাথে;
 *     টুলবার-টগল (aria-pressed) + localStorage (lf-desk-sound) স্থায়িত্ব; চালু-মুহূর্তে জেসচারে AudioContext-তৈরি
 *   • a11y: prefers-reduced-motion সম্মান — lf-anim-* এন্ট্রি-অ্যানিমেশন বন্ধ (globals.css)
 * session215 — রেসপন্স-গতি প্যাক:
 *   • সার্ভার-পুশ (SSE /api/admin/support-stream): নতুন-অভিযোগ/স্টেটাস/নোট-বদলে তাৎক্ষণিক load() —
 *     ১৫-সে-পোল ফলব্যাক-হিসেবে অটুট; ২৫০ms-ডিবাউন্স (বার্স্ট-সিগন্যালে স্প্যাম-শূন্য)
 *   • লাইভ-ইন্ডিকেটর চিপ (লাইভ=সবুজ-পালস / পোলিং=ধূসর) — সংযোগ-অবস্থা এক-নজরে
 *   • অ্যাডমিন-নোট দ্রুত-টেমপ্লেট (৫-বাংলা-স্নিপেট; ক্লিকে নোট-ইনপুটে যোগ — পুরনো-লেখা সংরক্ষিত)
 * session216 — অপারেটর-স্মৃতি প্যাক:
 *   • সংরক্ষিত-ফিল্টার-ভিউ (lf-desk-presets; সর্বোচ্চ ৬) + টোস্ট-জীবনকাল-বার + স্টিকি-স্ক্রোল-ছায়া
 * session217 — অপারেটর-ট্রায়াজ প্যাক:
 *   • "পরে দেখুন" তারা-বুকমার্ক (localStorage lf-desk-later; কার্ডে স্টার-টগল + ফিল্টার-চিপ + s-শর্টকাট)
 *   • ৭-দিনের প্রবণতা-স্ট্রিপ (ক্লায়েন্ট-সাইড দৈনিক-আগমন-বার; আজ-সবুজ; টুলটিপে গণনা)
 *   • কার্ড-ঘনত্ব টগল (ঘন/স্বাভাবিক; localStorage lf-desk-density)
 *
 * session218 — অপারেটর কমান্ড-প্যালেট:
 *   • Ctrl/Cmd+K ওভারলে (help-টায়ার z-[70]/z-[71]) — ট্যাব/মিডিয়া/তারিখ/ফিল্টার/প্রিসেট/টগল/অ্যাকশন
 *     এক-ইন্টারফেসে; ↑↓ নেভিগেট + Enter চালান + Esc/ব্যাকড্রপ বন্ধ; ইনপুটে-সার্চ (লেবেল+গ্রুপ)
 *   • a11y: role=dialog/combobox/listbox/option + aria-activedescendant + ফোকাস-ফেরত;
 *     সারি-স্টেজার lf-anim-up (prefers-reduced-motion-সম্মানী); টুলবারে "কমান্ড Ctrl K" হিন্ট-বাটন
 * session219 — শিফট-হস্তান্তর প্যাক:
 *   • "হস্তান্তর" ডায়ালগ (Ctrl+Shift+H / টুলবার-বাটন / প্যালেট-কমান্ড): এক-ক্লিকে বাংলা শিফট-হস্তান্তর
 *     সারসংক্ষেপ (গণনা/স্টেল/২৪ঘ/গড়-সমাধান-সময়/মিডিয়া/শীর্ষ-প্রেরক/সমাধান-হার) — পেস্ট-উপযোগী প্লেইন-টেক্সট
 *   • কপি = clipboard-race-প্যাটার্ন (s218-গোটচা); a11y: dialog/aria-modal + ফোকাস-ফেরত; help-টায়ার z-[70]/z-[71]
 *   • lib/support-history handoverDigest() = এক-উৎস-সত্য (now-ইনজেকশন → ডিটারমিনিস্টিক ইউনিট-টেস্টযোগ্য)
 * session220 — অপারেটর-ইনসাইট প্যাক:
 *   • লাইভ অ্যাক্টিভিটি-ফিড (bell + অদেখা-ব্যাজ + f-শর্টকাট + প্যালেট-কমান্ড): load()-ডিফ-উৎস — নতুন-অভিযোগ /
 *     স্টেটাস-বদল / নোট-হালনাগাদ এন্ট্রি জমা হয় (localStorage lf-desk-feed, সর্বোচ্চ ৩০, ৪৮ঘ-বয়স-প্রুন);
 *     এন্ট্রি-ক্লিকে রিপোর্টে জাম্প (ট্যাব-অটু-মিল + স্ক্রল + হাইলাইট); Esc-চেইনে feed = help-পরে, cursor-আগে
 *   • দীর্ঘ-অভিযোগ-লেখা ফোল্ড (৪-লাইন clamp + "আরও দেখুন" টগল; lf-clamp-4)
 *   • স্টাইল: গ্রেডিয়েন্ট-হেডার ফিড-প্যানেল (sticky-বারে এনকোর), এন্ট্রি-স্টেজার lf-anim-up,
 *     অদেখা-ব্যাজ lf-badge-pulse (prefers-reduced-motion-সম্মানী)
 * session223 — অপারেটর-KPI প্যাক:
 *   • KPI glance সারি (trend-strip-পরে ৪-কার্ড): ২৪ঘ-নতুন / ২৪ঘ-সমাধান / স্টেল / গড়-সমাধান-সময় —
 *     গণনা = handoverDigest-stats এক-উৎস (lib-স্পর্শ-শূন্য); কার্ড-ক্লিকে প্রচলিত-ফিল্টার-ভিউ-জাম্প
 *     (presetActive-লিঙ্ক-স্বয়ংক্রিয়; স্টেল-কার্ড = stale-banner-সমস্বর জাম্প + dateRange-ALL)
 *   • ট্যাব-ফোকাস-ফেরতে তাৎক্ষণিক সিঙ্ক (visibilitychange → load(): hidden-স্কিপ-টিকের সাথে-সাথে পাল্টানো)
 *   • স্টাইল: টোন-কোঅর্ডিনেটেড border-t রঙ-ব্যান্ড + রঙিন icon-চিপ + tabular-nums + স্টেজার lf-anim-up
 *     (reduced-motion-সম্মানী) + hover:-translate-y-0.5/shadow-md
*/

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowDownWideNarrow,
  Bell,
  Bookmark,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  Command as CommandIcon,
  Copy,
  Download,
  History,
  Hourglass,
  Inbox,
  Keyboard,
  Image as ImageIcon,
  Link2,
  Loader2,
  Mic,
  Pencil,
  Rows3,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Undo2,
  Video,
  Volume2,
  VolumeX,
  X,
  XCircle,
} from 'lucide-react'

/** session212 — শর্টকাট-সহায়িকা (?-ওভারলে) */
const SHORTCUTS: { keys: string[]; desc: string }[] = [
  { keys: ['j'], desc: 'পরের অভিযোগে যান' },
  { keys: ['k'], desc: 'আগের অভিযোগে যান' },
  { keys: ['x'], desc: 'কার্সর-কার্ড নির্বাচন টগল (বাল্ক-টুলবার)' },
  { keys: ['s'], desc: 'কার্সর-কার্ড "পরে দেখুন" টগল' },
  { keys: ['f'], desc: 'লাইভ অ্যাক্টিভিটি ফিড খোলা/বন্ধ' },
  { keys: ['১', '২', '৩'], desc: 'ট্যাব: নতুন / চলমান / সমাধান' },
  { keys: ['/'], desc: 'অনুসন্ধান-বক্সে ফোকাস' },
  { keys: ['?'], desc: 'এই সহায়িকা খোলা/বন্ধ' },
  { keys: ['Ctrl', 'K'], desc: 'কমান্ড প্যালেট খোলা/বন্ধ' },
  { keys: ['Ctrl', 'Shift', 'H'], desc: 'শিফট-হস্তান্তর সারসংক্ষেপ (কপি-প্রস্তুত)' },
  { keys: ['Shift', '১/২/৩'], desc: 'কার্সর-কার্ড স্টেটাস দ্রুত-সেট (নতুন/চলমান/সমাধান)' },
  { keys: ['Ctrl', 'Z'], desc: 'শেষ স্টেটাস-পরিবর্তন আন্ডু' },
  { keys: ['Esc'], desc: 'কার্সর বা সহায়িকা বন্ধ' },
]

/** session217 — সপ্তাহের-দিন-লেবেল (প্রবণতা-স্ট্রিপ) */
const WEEKDAY_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি']
import AdminGate, { useAdminGate } from '@/components/admin/AdminGate'
import { bn } from '@/lib/format'
import { agingInfo, handoverDigest, heatAuraClass, historySummaryBn, staleCount } from '@/lib/support-history'

type Status = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'

interface Report {
  id: string
  senderId: string
  senderName: string
  senderEmail: string | null
  messageText: string
  mediaType: string // TEXT | IMAGE | AUDIO | VIDEO
  mediaUrl: string | null
  status: Status
  adminNote: string | null
  noteHistory?: string | null
  createdAt: string
}

/** session205 (Task 56) — অ্যাকশন-ইতিহাস-এন্ট্রি (noteHistory JSON থেকে);
 *  session208 — নোট-এন্ট্রিতে সম্পাদনা-মেটাডেটা (editedAt/editedBy/editedByRole) ঐচ্ছিক */
interface HistoryEntry {
  t: 'note' | 'status'
  note?: string
  from?: string
  to?: string
  at: string
  by?: string
  byRole?: string
  editedAt?: string
  editedBy?: string
  editedByRole?: string
}

/** noteHistory JSON-পার্স — করাপ্ট/অবৈধ হলে খালি-অ্যারে (নিরাপদ) */
function parseHistory(raw: string | null | undefined): HistoryEntry[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.filter((e) => e && (e.t === 'note' || e.t === 'status')) as HistoryEntry[]
  } catch {
    return []
  }
}

/** session220 — লাইভ অ্যাক্টিভিটি-ফিড এন্ট্রি (load()-ডিফ-উৎস; localStorage lf-desk-feed স্থায়িত্ব);
 *  at = epoch-ms; rid = সংশ্লিষ্ট-রিপোর্ট (ক্লিকে-জাম্প); from/to = স্টেটাস-বদলের-প্রান্ত */
interface FeedEntry {
  id: string
  at: number
  kind: 'new' | 'status' | 'note'
  sender: string
  rid: string
  from?: Status
  to?: Status
}

/** ফিড-ক্যাপ (নতুন-আগে রাখা হয়) + পুরাতন-এন্ট্রি-বয়সসীমা (৪৮ ঘণ্টা অতবাহী প্রুন) */
const FEED_CAP = 30
const FEED_MAX_AGE_MS = 48 * 3600 * 1000

function feedLoad(): FeedEntry[] {
  try {
    const raw = localStorage.getItem('lf-desk-feed')
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    const cutoff = Date.now() - FEED_MAX_AGE_MS
    return arr
      .filter((e) => e && typeof e.id === 'string' && typeof e.at === 'number' && e.at >= cutoff)
      .slice(0, FEED_CAP) as FeedEntry[]
  } catch {
    return []
  }
}

function feedSave(list: FeedEntry[]) {
  try {
    localStorage.setItem('lf-desk-feed', JSON.stringify(list.slice(0, FEED_CAP)))
  } catch {
    /* নীরব */
  }
}

/** ফিড-এন্ট্রির মানব-পঠন লেখা (STATUS_LABEL ঘুরিয়ে); ডট-রঙ আলাদা-ম্যাপে */
function feedEntryText(ev: FeedEntry): string {
  if (ev.kind === 'new') return 'নতুন অভিযোগ পাঠিয়েছেন'
  if (ev.kind === 'note') return 'অ্যাডমিন-নোট হালনাগাদ হয়েছে'
  return `স্টেটাস: ${STATUS_LABEL[ev.from ?? 'PENDING']} → ${STATUS_LABEL[ev.to ?? 'PENDING']}`
}

function feedDotCls(ev: FeedEntry): string {
  if (ev.kind === 'new') return 'bg-amber-500'
  if (ev.kind === 'note') return 'bg-[#006A4E]'
  if (ev.to === 'RESOLVED') return 'bg-emerald-500'
  if (ev.to === 'IN_PROGRESS') return 'bg-sky-500'
  return 'bg-amber-500'
}

/** session221 — ফিড-কাইন্ড-ফিল্টার চিপ-ক্যাটালগ (এক-উৎস: চিপ-লেবেল + aria) */
const FEED_KINDS: { key: 'ALL' | FeedEntry['kind']; label: string }[] = [
  { key: 'ALL', label: 'সব' },
  { key: 'new', label: 'নতুন' },
  { key: 'status', label: 'স্টেটাস' },
  { key: 'note', label: 'নোট' },
]

/** session221 — এন্ট্রি-দিন-লেবেল (প্যানেল ডে-গ্রুপ-বিভাজক): আজ / গতকাল / বাংলা-তারিখ (local-midnight) */
function feedDayLabelBn(ts: number): string {
  const now = new Date()
  const d = new Date(ts)
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  if (startThat === startToday) return 'আজ'
  if (startToday - startThat === 86400000) return 'গতকাল'
  return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long' })
}

const TABS: { key: Status; label: string; cls: string }[] = [
  { key: 'PENDING', label: 'নতুন অভিযোগ', cls: 'bg-amber-500' },
  { key: 'IN_PROGRESS', label: 'চলমান', cls: 'bg-sky-600' },
  { key: 'RESOLVED', label: 'সমাধান', cls: 'bg-emerald-600' },
]

const STATUS_LABEL: Record<Status, string> = {
  PENDING: 'নতুন',
  IN_PROGRESS: 'চলমান',
  RESOLVED: 'সমাধান',
}

/** session206 (Task 57) — মিডিয়া-টাইপ ফিল্টার-চিপ */
const MEDIA_FILTERS: { key: string; label: string }[] = [
  { key: 'ALL', label: 'সব মিডিয়া' },
  { key: 'TEXT', label: 'লেখা' },
  { key: 'IMAGE', label: 'ছবি' },
  { key: 'AUDIO', label: 'অডিও' },
  { key: 'VIDEO', label: 'ভিডিও' },
]
const MEDIA_FILTER_ICON: Record<string, React.ReactNode> = {
  TEXT: null,
  IMAGE: <ImageIcon className="w-3 h-3" aria-hidden />,
  AUDIO: <Mic className="w-3 h-3" aria-hidden />,
  VIDEO: <Video className="w-3 h-3" aria-hidden />,
}

/** session215 — অ্যাডমিন-নোট দ্রুত-টেমপ্লেট (বাংলা; ক্লিকে নোট-ইনপুটে যোগ — পুরনো-লেখা সংরক্ষিত) */
const NOTE_TEMPLATES = [
  'সমস্যাটি সমাধান করা হয়েছে — ধন্যবাদ জানাই।',
  'বিষয়টি পরীক্ষা করে দ্রুত জানানো হবে।',
  'অতিরিক্ত তথ্য বা স্ক্রিনশট প্রয়োজন — অনুগ্রহ করে পাঠান।',
  'প্রযুক্তিগত টিমকে বিষয়টি জানানো হয়েছে।',
  'আপনার পরামর্শটি গ্রহণ করা হয়েছে — ধন্যবাদ।',
]

/** session207 — তারিখ-সীমা ফিল্টার (ক্লায়েন্ট-সাইড, API-বদল-শূন্য) */
const DATE_RANGES: { key: string; label: string }[] = [
  { key: 'ALL', label: 'সব-সময়' },
  { key: 'TODAY', label: 'আজ' },
  { key: '7D', label: '৭ দিন' },
  { key: '30D', label: '৩০ দিন' },
]
function dateCutoff(key: string): number | null {
  if (key === 'TODAY') {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }
  if (key === '7D') return Date.now() - 7 * 864e5
  if (key === '30D') return Date.now() - 30 * 864e5
  return null
}

/** session207 — পরিসংখ্যান-কার্ডের রঙ (ট্যাব-রঙের সাথে সমস্বর) */
const STAT_TONE: Record<Status, { tBorder: string; bar: string; text: string }> = {
  PENDING: { tBorder: 'border-t-amber-500', bar: 'bg-amber-500', text: 'text-amber-700' },
  IN_PROGRESS: { tBorder: 'border-t-sky-600', bar: 'bg-sky-600', text: 'text-sky-700' },
  RESOLVED: { tBorder: 'border-t-emerald-600', bar: 'bg-emerald-600', text: 'text-emerald-700' },
}

/** session202 — স্টেটাস-ভিত্তিক বাম-অ্যাকসেন্ট বর্ডার (কার্ডে এক-নজরে স্টেটাস) */
const ACCENT: Record<Status, string> = {
  PENDING: 'border-l-amber-500',
  IN_PROGRESS: 'border-l-sky-600',
  RESOLVED: 'border-l-emerald-600',
}

/** session202 — প্রেরক-অ্যাভাটারের ডিটারমিনিস্টিক রঙ (নাম-হ্যাশ → ফিক্সড প্যালেট) */
const AVATAR_COLORS = ['#006A4E', '#7C3AED', '#B45309', '#0E7490', '#BE185D', '#4D7C0F', '#DC2626', '#0369A1']
function avatarColorFor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

/** session214 — নতুন-অভিযোগ শব্দ-সংকেত: Web Audio two-tone চাইম (অ্যাসেট-শূন্য; অডিও-ব্লক = নীরব-সেফ) */
type DeskWindow = Window & { __lfAudioCtx?: AudioContext; __lfDeskBeeps?: number }
function playDeskChime(): void {
  try {
    const w = window as DeskWindow
    const AC = (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext
    if (!AC) return
    let ctx = w.__lfAudioCtx
    if (!ctx) {
      ctx = new AC()
      w.__lfAudioCtx = ctx
    }
    if (ctx.state === 'suspended') void ctx.resume()
    const t0 = ctx.currentTime
    ;[880, 1318.51].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const ts = t0 + i * 0.16
      gain.gain.setValueAtTime(0.0001, ts)
      gain.gain.exponentialRampToValueAtTime(0.12, ts + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ts + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ts)
      osc.stop(ts + 0.16)
    })
    // E2E-পর্যবেক্ষণ-চুক্তি: বিপ-প্রচেষ্টা-কাউন্টার (হেডলেসে শব্দ-শোনা-যায়-না)
    w.__lfDeskBeeps = (w.__lfDeskBeeps || 0) + 1
  } catch {
    /* নীরব — অডিও-পলিসি/ব্লক হলেও UI-বাগ নয় */
  }
}

/** বাংলা আপেক্ষিক-সময় — এখনই / X মিনিট আগে / X ঘণ্টা আগে / X দিন আগে / তারিখ */
function relTimeBn(iso: string): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const m = Math.floor((Date.now() - t) / 60000)
  if (m < 1) return 'এখনই'
  if (m < 60) return `${bn(m)} মিনিট আগে`
  const h = Math.floor(m / 60)
  if (h < 24) return `${bn(h)} ঘণ্টা আগে`
  const d = Math.floor(h / 24)
  if (d < 30) return `${bn(d)} দিন আগে`
  return new Date(iso).toLocaleDateString('bn-BD', { dateStyle: 'medium' })
}

/** RFC-4180 CSV-সেল-escape */
function csvCell(v: string): string {
  return `"${String(v ?? '').replace(/"/g, '""')}"`
}

/** session205 — রোল-ব্যাজ (ইতিহাসে কে-কাজ-টা-করেছে) */
const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  super_admin: { label: 'সুপার অ্যাডমিন', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  admin: { label: 'অ্যাডমিন', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  member: { label: 'সাপোর্ট-এজেন্ট', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
}

/** session205 (Task 56) — অ্যাকশন-ইতিহাস টাইমলাইন: নোট + স্টেটাস-বদল এক-সুতোয় (নতুন-নিচে);
 *  ৪-এর-বেশি হলে পুরোনোগুলো কোলাপ্সড — "আরও Nটি" টগল;
 *  session208 — নোট-এন্ট্রি hover-রিভিল সম্পাদনা/মুছে-ফেলা (স্টেটাস-এন্ট্রি অডিট — লক),
 *  ইনলাইন-এডিট (Esc-বাতিল) + নিশ্চিত-মুছে-ফেলা + "সম্পাদিত"-ব্যাজ। */
function ActionHistory({
  entries,
  reportId,
  busy,
  onEdit,
  onDelete,
}: {
  entries: HistoryEntry[]
  reportId: string
  busy: boolean
  onEdit: (index: number, note: string) => void
  onDelete: (index: number, entry: HistoryEntry) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [confirmDel, setConfirmDel] = useState<number | null>(null)
  if (entries.length === 0) return null
  const visible = expanded ? entries : entries.slice(-4)
  const hiddenCount = entries.length - visible.length

  const startEdit = (i: number, note: string) => {
    setConfirmDel(null)
    setEditing(i)
    setDraft(note ?? '')
  }
  const cancelEdit = () => {
    setEditing(null)
    setDraft('')
  }
  const saveEdit = (i: number) => {
    const note = draft.trim()
    if (!note) return
    onEdit(i, note)
    cancelEdit()
  }

  return (
    <div className="rounded-[8px] bg-[#FAFBFC] border border-[#E4E6EB] p-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        type="button"
        className="flex items-center gap-1.5 text-[10.5px] font-extrabold text-[#65676B] hover:text-[#006A4E] transition cursor-pointer bg-transparent border-0 p-0"
        aria-expanded={expanded}
      >
        <History className="w-3.5 h-3.5" aria-hidden />
        <span>অ্যাকশন-ইতিহাস ({bn(entries.length)})</span>
        {entries.length > 4 && (
          <span className="text-[10px] font-bold text-[#006A4E]">
            {expanded ? '— সংক্ষিপ্ত' : `— আরও ${bn(hiddenCount)}টি`}
          </span>
        )}
      </button>
      <div className="mt-2.5 ml-1.5 border-l-2 border-[#E4E6EB] space-y-3 lf-anim-fade">
        {visible.map((e, i) => {
          const badge = ROLE_BADGE[e.byRole ?? ''] ?? null
          const isEditing = editing === i
          const isConfirming = confirmDel === i
          return (
            <div key={i} className="relative pl-4 group/entry">
              <span
                aria-hidden
                className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                  e.t === 'note' ? 'bg-[#006A4E]' : 'bg-sky-500'
                }`}
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-[#050505]">{e.by || 'অ্যাডমিন'}</span>
                {badge && (
                  <span
                    className={`text-[9.5px] font-extrabold px-1.5 py-px rounded-full border ${badge.cls}`}
                  >
                    {badge.label}
                  </span>
                )}
                <span
                  className="text-[9.5px] text-[#8A8D91]"
                  title={new Date(e.at).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                >
                  {relTimeBn(e.at)}
                </span>
                {e.t === 'note' && e.editedAt && (
                  <span
                    className="text-[9px] font-extrabold px-1.5 py-px rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5"
                    title={`সম্পাদিত ${relTimeBn(e.editedAt)} — ${e.editedBy || 'অ্যাডমিন'}`}
                  >
                    <Pencil className="w-2.5 h-2.5" aria-hidden />
                    সম্পাদিত
                  </span>
                )}
                {/* session208 — hover-রিভিল অ্যাকশন (শুধু নোট-এন্ট্রি; স্টেটাস = অডিট-লক) */}
                {e.t === 'note' && !isEditing && !isConfirming && (
                  <span className="ml-auto flex items-center gap-0.5 opacity-0 group-hover/entry:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => startEdit(i, e.note ?? '')}
                      disabled={busy}
                      aria-label="নোট সম্পাদনা"
                      title="নোট সম্পাদনা"
                      className="p-1 rounded-md text-[#8A8D91] hover:text-[#006A4E] hover:bg-[#006A4E]/10 disabled:opacity-40 transition cursor-pointer bg-transparent border-0"
                    >
                      <Pencil className="w-3 h-3" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDel(i)}
                      disabled={busy}
                      aria-label="নোট মুছে ফেলুন"
                      title="নোট মুছে ফেলুন"
                      className="p-1 rounded-md text-[#8A8D91] hover:text-red-600 hover:bg-red-50 disabled:opacity-40 transition cursor-pointer bg-transparent border-0"
                    >
                      <Trash2 className="w-3 h-3" aria-hidden />
                    </button>
                  </span>
                )}
              </div>
              {e.t === 'note' ? (
                isEditing ? (
                  <div className="mt-1.5 space-y-1.5">
                    <textarea
                      value={draft}
                      onChange={(ev) => setDraft(ev.target.value)}
                      onKeyDown={(ev) => {
                        if (ev.key === 'Escape') {
                          ev.preventDefault()
                          cancelEdit()
                        } else if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) {
                          ev.preventDefault()
                          saveEdit(i)
                        }
                      }}
                      rows={3}
                      maxLength={2000}
                      autoFocus
                      aria-label="নোট সম্পাদনা"
                      className="w-full text-[11.5px] text-[#050505] bg-white border border-[#006A4E]/40 focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/15 rounded-[8px] px-2.5 py-2 leading-relaxed resize-y outline-none transition"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => saveEdit(i)}
                        disabled={busy || !draft.trim()}
                        className="px-2.5 py-1 rounded-[6px] bg-[#006A4E] hover:bg-[#00523C] text-white text-[10px] font-bold transition disabled:opacity-50 cursor-pointer"
                      >
                        সংরক্ষণ
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-2.5 py-1 rounded-[6px] bg-white border border-[#CED0D4] hover:bg-[#F0F2F5] text-[#4B4C4F] text-[10px] font-bold transition cursor-pointer"
                      >
                        বাতিল
                      </button>
                      <span className="text-[9px] text-[#8A8D91] ml-auto">Esc = বাতিল · Ctrl+Enter = সংরক্ষণ</span>
                    </div>
                  </div>
                ) : isConfirming ? (
                  <div
                    className="mt-1.5 flex items-center gap-2 flex-wrap bg-red-50 border border-red-200 rounded-[8px] px-2.5 py-2"
                    role="alertdialog"
                    aria-label="নোট-মুছে-ফেলা নিশ্চিতকরণ"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600 shrink-0" aria-hidden />
                    <span className="text-[10.5px] font-bold text-red-700">এই জবাবটি মুছে ফেলবেন?</span>
                    <span className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(i, e)
                          setConfirmDel(null)
                        }}
                        disabled={busy}
                        className="px-2.5 py-1 rounded-[6px] bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold transition disabled:opacity-50 cursor-pointer"
                      >
                        মুছুন
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDel(null)}
                        className="px-2.5 py-1 rounded-[6px] bg-white border border-[#CED0D4] hover:bg-[#F0F2F5] text-[#4B4C4F] text-[10px] font-bold transition cursor-pointer"
                      >
                        বাতিল
                      </button>
                    </span>
                  </div>
                ) : (
                  <p className="text-[11.5px] text-[#4B4C4F] leading-relaxed whitespace-pre-wrap break-words mt-0.5">
                    {e.note}
                  </p>
                )
              ) : (
                <p className="text-[11px] text-[#4B4C4F] mt-0.5 flex items-center gap-1.5">
                  <span>স্টেটাস:</span>
                  <span className="font-bold">{STATUS_LABEL[(e.from as Status) ?? 'PENDING']}</span>
                  <span className="text-[#8A8D91]">→</span>
                  <span
                    className={`font-bold px-1.5 rounded ${
                      e.to === 'RESOLVED' ? 'text-emerald-700 bg-emerald-50' : e.to === 'IN_PROGRESS' ? 'text-sky-700 bg-sky-50' : 'text-amber-700 bg-amber-50'
                    }`}
                  >
                    {STATUS_LABEL[(e.to as Status) ?? 'PENDING']}
                  </span>
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function SupportReportsPage() {
  const { state, adminCandidates } = useAdminGate(false)

  return (
    <AdminGate state={state} adminCandidates={adminCandidates}>
      <SupportReportsPanel />
    </AdminGate>
  )
}

/** session216 — সংরক্ষিত-ফিল্টার-ভিউ-প্রিসেট (localStorage: lf-desk-presets; সর্বোচ্চ ৬; একই-নাম = ওভাররাইট) */
type DeskPreset = { name: string; tab: Status; media: string; date: string; q: string; sortAsc: boolean; at: number }

function SupportReportsPanel() {
  const [reports, setReports] = useState<Report[]>([])
  const [counts, setCounts] = useState<Record<Status, number>>({
    PENDING: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
  })
  const [tab, setTab] = useState<Status>('PENDING')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<string | null>(null)
  // session209 — আন্ডু-উইন্ডো: মুছে-ফেলা নোট-এন্ট্রি ৮-সেকেন্ড পর্যন্ত পুনরুদ্ধারযোগ্য
  const [undoData, setUndoData] = useState<{ id: string; index: number; entry: HistoryEntry } | null>(null)
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  // session222 — স্টেটাস-আন্ডু-স্ট্যাক: সেশন-স্কোপড (ls-স্থায়িত্ব-নেই — ইচ্ছাকৃত), নতুন-আগে, ক্যাপ ১০
  const [statusUndo, setStatusUndo] = useState<{ id: string; from: Status; to: Status; at: number; label: string }[]>([])
  // session202 — লেখা-কপি + ছবি-লাইটবক্স + CSV-ব্যাস্ট
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  // session206 (Task 57) — অনুসন্ধান + মিডিয়া-ফিল্টার + বাল্ক-অ্যাকশন
  const [query, setQuery] = useState('')
  const [mediaFilter, setMediaFilter] = useState('ALL')
  const [selected, setSelected] = useState<string[]>([])
  const [bulkBusy, setBulkBusy] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 })
  // session207 — তারিখ-সীমা + ক্রম + অনুসন্ধান-ফোকাস-রেফ
  const [dateRange, setDateRange] = useState('ALL')
  const [sortAsc, setSortAsc] = useState(false)
  const searchRef = React.useRef<HTMLInputElement>(null)
  // session211 — URL-স্টেট-সিঙ্ক + রিপোর্ট-ডিপ-লিংক (?report=<id> শেয়ারযোগ্য)
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null)
  const [hlId, setHlId] = useState<string | null>(null)
  /** session212 — কীবোর্ড-কার্সর (shown-ইনডেক্স; -1 = নিষ্ক্রিয়) + শর্টকাট-সহায়িকা-ওভারলে */
  const [cursor, setCursor] = useState(-1)
  const [helpOpen, setHelpOpen] = useState(false)
  /** session219 — শিফট-হস্তান্তর ডায়ালগ (help-টায়ার; Esc-চেইনে cmd-পরে help-আগে) + ফোকাস-ফেরত-চুক্তি (s218-অনুরূপ) */
  const [digestOpen, setDigestOpen] = useState(false)
  const digestPanelRef = React.useRef<HTMLDivElement>(null)
  const digestReturnFocusRef = React.useRef<HTMLElement | null>(null)
  const hydratedRef = React.useRef(false)
  const linkIdRef = React.useRef<string | null>(null)
  /** session213 — পোল-ডিফ স্টেট: পরিচিত PENDING-আইডি-সেট (null = প্রথম-লোড, টোস্ট-নয়) */
  const knownPendingRef = React.useRef<Set<string> | null>(null)
  /** session213 — ট্যাব-টাইটেল-ব্যাজের ভিত্তি (মাউন্টে ধরা; আনমাউন্টে ফেরত) */
  const baseTitleRef = React.useRef('')
  /** session214 — নতুন-অভিযোগ শব্দ-সংকেত (localStorage: lf-desk-sound); ref-মিরর = পোল-কলব্যাক-নির্ভরতা-শূন্য */
  const [soundOn, setSoundOn] = useState(false)
  const soundOnRef = React.useRef(false)
  /** session214 — প্রেরক-ঝলক পপওভার (fixed-এনকর; senderStats = লোডেড-রিপোর্ট থেকে ক্লায়েন্ট-সাইড) */
  const [glance, setGlance] = useState<{ name: string; email: string | null; x: number; y: number } | null>(null)
  const glanceRef = React.useRef<HTMLDivElement>(null)
  /** session215 — SSE-সংযোগ-অবস্থা (live = তাৎক্ষণিক-পুশ; polling = ১৫-সে-ফলব্যাক) */
  const [live, setLive] = useState<'connecting' | 'live' | 'polling'>('connecting')
  /** session216 — সংরক্ষিত-ভিউ স্টেট + স্টিকি-বার স্ক্রোল-ছায়া */
  const [presets, setPresets] = useState<DeskPreset[]>([])
  const [presetNameOpen, setPresetNameOpen] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('lf-desk-presets')
      if (raw) {
        const arr: unknown = JSON.parse(raw)
        if (Array.isArray(arr)) setPresets(arr.slice(-6).filter((p) => p && typeof p.name === 'string'))
      }
    } catch {
      /* নীরব */
    }
  }, [])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 6)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  /** session215 — নোট-টেমপ্লেট খোলা-কার্ড (id; null = বন্ধ) */
  const [tplOpenFor, setTplOpenFor] = useState<string | null>(null)
  /** session217 — পরে-দেখুন-বুকমার্ক (localStorage: lf-desk-later; {id: ts} ম্যাপ, সর্বোচ্চ ৫০০, FIFO-প্রুন) */
  const [later, setLater] = useState<Record<string, number>>({})
  const [laterOnly, setLaterOnly] = useState(false)
  /** session217 — কার্ড-ঘনত্ব (localStorage: lf-desk-density; compact = লম্বা-তালিকায় বেশি-দেখা) */
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

  /** session220 — লাইভ অ্যাক্টিভিটি-ফিড: এন্ট্রি-তালিকা (নতুন-আগে) + প্যানেল-ওপেন + অদেখা-গণক;
   *  refs = load()-ক্লোজার-নির্ভরতা-শূন্য (soundOnRef-প্যাটার্ন) + বাইরে-ক্লিক/ফোকাস-হাতল */
  const [feed, setFeed] = useState<FeedEntry[]>([])
  const [feedOpen, setFeedOpen] = useState(false)
  const [feedUnseen, setFeedUnseen] = useState(0)
  const prevStatusRef = React.useRef<Map<string, Status> | null>(null)
  const prevNoteRef = React.useRef<Map<string, string | null> | null>(null)
  const feedOpenRef = React.useRef(false)
  const feedUnseenRef = React.useRef(0)
  const feedPanelRef = React.useRef<HTMLDivElement>(null)
  const feedBtnRef = React.useRef<HTMLButtonElement>(null)

  /** session220 — দীর্ঘ-অভিযোগ-লেখা ফোল্ড-স্টেট ({rid: বিস্তৃত}) — সেশন-স্কোপড (স্থায়িত্ব-নেই) */
  const [msgOpen, setMsgOpen] = useState<Record<string, boolean>>({})

  /** session221 — ফিড-কাইন্ড-ফিল্টার (সেশন-স্কোপড; ALL = চিপ-শূন্য-ডিফল্ট) */
  const [feedKind, setFeedKind] = useState<'ALL' | FeedEntry['kind']>('ALL')

  /** session218 — কমান্ড-প্যালেট (Ctrl+K): অপারেটর-অ্যাকশন-লঞ্চার (সব-ক্লায়েন্ট-সাইড) */
  const [cmdOpen, setCmdOpen] = useState(false)
  const [cmdQuery, setCmdQuery] = useState('')
  const [cmdIdx, setCmdIdx] = useState(0)
  const cmdInputRef = React.useRef<HTMLInputElement>(null)
  const cmdReturnFocusRef = React.useRef<HTMLElement | null>(null)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('lf-desk-later')
      if (raw) {
        const obj: unknown = JSON.parse(raw)
        if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
          const clean: Record<string, number> = {}
          for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
            if (typeof v === 'number') clean[k] = v
          }
          setLater(clean)
        }
      }
      if (localStorage.getItem('lf-desk-density') === 'compact') setDensity('compact')
    } catch {
      /* নীরব */
    }
  }, [])

  const flash = useCallback(
    (msg: string, undo?: { id: string; index: number; entry: HistoryEntry }, timeoutMs = 3000) => {
      setToast(msg)
      setUndoData(undo ?? null)
      if (toastTimer.current) clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => {
        setToast(null)
        setUndoData(null)
      }, timeoutMs)
    },
    [],
  )

  /** session216 — সংরক্ষিত-ভিউ: সংরক্ষণ/প্রয়োগ/মুছা (সব-ক্লায়েন্ট-সাইড; API-চুক্তি-অস্পৃশ্য) */
  const persistPresets = (next: DeskPreset[]) => {
    setPresets(next)
    try {
      localStorage.setItem('lf-desk-presets', JSON.stringify(next))
    } catch {
      /* নীরব */
    }
  }
  const savePreset = () => {
    const name = presetName.trim().slice(0, 40)
    if (!name) return
    const existed = presets.some((p) => p.name === name)
    const p: DeskPreset = { name, tab, media: mediaFilter, date: dateRange, q: query.slice(0, 200), sortAsc, at: Date.now() }
    persistPresets([...presets.filter((x) => x.name !== name), p].slice(-6))
    setPresetNameOpen(false)
    setPresetName('')
    flash(existed ? `"${name}" ভিউ হালনাগাদ হয়েছে` : `"${name}" ভিউ সংরক্ষিত হয়েছে`)
  }
  const applyPreset = (p: DeskPreset) => {
    setTab(p.tab)
    setMediaFilter(p.media)
    setDateRange(p.date)
    setQuery(p.q)
    setSortAsc(p.sortAsc)
    flash(`"${p.name}" ভিউ প্রয়োগ হয়েছে`)
  }
  const deletePreset = (p: DeskPreset) => {
    persistPresets(presets.filter((x) => x.name !== p.name))
    flash(`"${p.name}" ভিউ মুছে ফেলা হয়েছে`)
  }
  const presetActive = (p: DeskPreset) =>
    tab === p.tab && mediaFilter === p.media && dateRange === p.date && query === p.q && sortAsc === p.sortAsc

  /** session220 — ফিড-এন্ট্রি-যোগ (নতুন-আগে, ক্যাপ+স্থায়িত্ব); প্যানেল-বন্ধ-অবস্থায় অদেখা-গণক-বৃদ্ধি */
  const appendFeed = useCallback((events: FeedEntry[]) => {
    if (events.length === 0) return
    setFeed((prev) => {
      const next = [...[...events].reverse(), ...prev].slice(0, FEED_CAP)
      feedSave(next)
      return next
    })
    if (!feedOpenRef.current) {
      feedUnseenRef.current += events.length
      setFeedUnseen(feedUnseenRef.current)
    }
  }, [])

  /** session220 — মাউন্টে স্থায়ী-ফিড-হাইড্রেশন (৪৮ঘ-প্রুন feedLoad-এই) + ref-সিঙ্ক */
  useEffect(() => {
    setFeed(feedLoad())
  }, [])
  useEffect(() => {
    feedOpenRef.current = feedOpen
  }, [feedOpen])

  const toggleFeed = useCallback(() => {
    const next = !feedOpenRef.current
    feedOpenRef.current = next
    setFeedOpen(next)
    if (next) {
      feedUnseenRef.current = 0
      setFeedUnseen(0)
    }
  }, [])
  const closeFeed = useCallback(() => {
    feedOpenRef.current = false
    setFeedOpen(false)
  }, [])

  /** session220 — বাইরে-ক্লিকে ফিড-বন্ধ (নন-মোডাল popover চুক্তি — glance-জাতীয়) */
  useEffect(() => {
    if (!feedOpen) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (feedPanelRef.current?.contains(t) || feedBtnRef.current?.contains(t)) return
      closeFeed()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [feedOpen, closeFeed])

  /** session220 — ফিড-এন্ট্রি-ক্লিকে রিপোর্টে জাম্প: ট্যাব-অটু-মিল (চলতি-স্টেটাস) → স্ক্রল-সেন্টার →
   *  অ্যাম্বার-হাইলাইট (lf-anim-hl ৩.২সে — ডিপ-লিংক-চুক্তি-অনুরূপ); ফিল্টার-অস্পৃষ্ট (শুধু-ট্যাব) */
  const jumpToReport = useCallback(
    (rid: string) => {
      const r = reports.find((x) => x.id === rid)
      if (!r) return
      setTab(r.status)
      closeFeed()
      const tryScroll = (attempt: number) => {
        setTimeout(() => {
          try {
            const el = document.querySelector(`[data-report="${rid}"]`)
            if (!el && attempt === 0) {
              setQuery('')
              setMediaFilter('ALL')
              setDateRange('ALL')
              setLaterOnly(false)
              tryScroll(1)
              return
            }
            el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
            setHlId(rid)
            setTimeout(() => setHlId((cur) => (cur === rid ? null : cur)), 3400)
          } catch {
            /* নীরব */
          }
        }, attempt === 0 ? 300 : 400)
      }
      tryScroll(0)
    },
    [reports, closeFeed],
  )

  const clearFeed = useCallback(() => {
    setFeed([])
    try {
      localStorage.removeItem('lf-desk-feed')
    } catch {
      /* নীরব */
    }
    feedUnseenRef.current = 0
    setFeedUnseen(0)
  }, [])

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/support-reports')
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setReports(data.reports || [])
        setCounts(data.counts || counts)
        // session213 — লাইভ-সচেতনতা: পোলে PENDING-আইডি-ডিফ → নতুন-অভিযোগ-টোস্ট (প্রথম-লোডে নয়)
        const known = knownPendingRef.current
        const list: Report[] = data.reports || []
        const pendingIds = list
          .filter((r: Report) => r.status === 'PENDING')
          .map((r: Report) => r.id)
        let fresh: string[] = []
        if (known) {
          fresh = pendingIds.filter((id: string) => !known.has(id))
          if (fresh.length > 0) {
            flash(`${bn(fresh.length)}টি নতুন অভিযোগ এসেছে`)
            // session214 — শব্দ-সংকেত একই fresh>0-শর্তে (session213 টোস্ট-চুক্তি অটুট)
            if (soundOnRef.current) playDeskChime()
          }
        }
        knownPendingRef.current = new Set(pendingIds)
        // session220 — ফিড-ডিফ: নতুন-অভিযোগ / স্টেটাস-বদল / নোট-হালনাগাদ → অ্যাক্টিভিটি-ফিডে
        // (সব-লোড-পাথ এখান-দিয়েই-যায় — session213 পোল-চুক্তি অটুট; প্রথম-লোডে ডিফ-নেই)
        const prevS = prevStatusRef.current
        const prevN = prevNoteRef.current
        if (prevS && prevN) {
          const now = Date.now()
          const events: FeedEntry[] = []
          for (const r of list) {
            const ps = prevS.get(r.id)
            const pn = prevN.get(r.id)
            if (ps && ps !== r.status) {
              events.push({ id: `${r.id}-${now}-s`, at: now, kind: 'status', sender: r.senderName, rid: r.id, from: ps, to: r.status })
            }
            if (pn !== undefined && pn !== null && (r.adminNote ?? '') !== pn) {
              events.push({ id: `${r.id}-${now}-n`, at: now, kind: 'note', sender: r.senderName, rid: r.id })
            }
          }
          for (const id of fresh) {
            const r = list.find((x) => x.id === id)
            if (r) events.push({ id: `${id}-${now}-w`, at: now, kind: 'new', sender: r.senderName, rid: id })
          }
          appendFeed(events)
        }
        prevStatusRef.current = new Map(list.map((r: Report) => [r.id, r.status]))
        prevNoteRef.current = new Map(list.map((r: Report) => [r.id, r.adminNote ?? null]))
      }
    } catch {
      /* পোল-নীরব */
    } finally {
      setLoading(false)
    }
  }, [flash, appendFeed])

  useEffect(() => {
    load()
    const t = setInterval(() => {
      if (!document.hidden) load()
    }, 15000)
    /** session223 — ট্যাব-ফোকাস-ফেরতে তাৎক্ষণিক সিঙ্ক: hidden-স্কিপ-করা-টিকে-পাল্টানো
     *  (অন্য-ট্যাবে-থাকাকালীন ১৫-সে-টিক-স্কিপ-হয়; ফেরতে পরবর্তী-টিক-অপেক্ষা-না-করে সাথে-সাথে লোড) */
    const onVis = () => {
      if (!document.hidden) load()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [load])

  /** session213 — ট্যাব-টাইটেলে নতুন-অভিযোগ-ব্যাজ (মাল্টিটাস্ক-সিগনাল); আনমাউন্টে মূল-টাইটেল-ফেরত */
  useEffect(() => {
    if (!baseTitleRef.current) baseTitleRef.current = document.title || 'লেখক ফোরাম'
    const base = baseTitleRef.current
    const p = counts.PENDING || 0
    document.title = p > 0 ? `(${bn(p)}) ${base}` : base
    return () => {
      document.title = baseTitleRef.current || base
    }
  }, [counts.PENDING])

  /** session207 — "/" চাপলে অনুসন্ধান-ফোকাস (ইনপুট/টেক্সট-এরিয়ায় না-থাকলে) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing =
        el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)
      if (e.key === '/' && !typing) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /** session212 — ফিল্টার-বদলে কীবোর্ড-কার্সর রিসেট (১৫-সেকেন্ড-পোল-রিফ্রেশে অটুট-থাকে) */
  useEffect(() => {
    setCursor(-1)
  }, [tab, mediaFilter, dateRange, query, sortAsc])

  /** session214 — শব্দ-পছন্দ লোড (hydration-নিরাপদ: মাউন্টে একবার localStorage-থেকে) */
  useEffect(() => {
    try {
      if (localStorage.getItem('lf-desk-sound') === '1') {
        setSoundOn(true)
        soundOnRef.current = true
      }
    } catch {
      /* প্রাইভেসি-মোড — নীরব */
    }
  }, [])

  /** session214 — শব্দ-টগল: চালু-মুহূর্তেই চাইম (ইউজার-জেসচার = autoplay-পলিসি-সুরক্ষিত) */
  const toggleSound = useCallback(() => {
    const next = !soundOnRef.current
    soundOnRef.current = next
    setSoundOn(next)
    try {
      localStorage.setItem('lf-desk-sound', next ? '1' : '0')
    } catch {
      /* প্রাইভেসি-মোড */
    }
    if (next) playDeskChime()
  }, [])

  /** session214 — প্রেরক-ভিত্তিক পরিসংখ্যান (লোডেড-রিপোর্ট থেকে; API/schema-বদল-শূন্য) */
  const senderStats = React.useMemo(() => {
    const m = new Map<
      string,
      { total: number; PENDING: number; IN_PROGRESS: number; RESOLVED: number; lastAt: string; media: Record<string, number> }
    >()
    for (const r of reports) {
      const e =
        m.get(r.senderName) ||
        { total: 0, PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0, lastAt: r.createdAt, media: {} as Record<string, number> }
      e.total += 1
      e[r.status] += 1
      e.media[r.mediaType] = (e.media[r.mediaType] || 0) + 1
      if (new Date(r.createdAt).getTime() > new Date(e.lastAt).getTime()) e.lastAt = r.createdAt
      m.set(r.senderName, e)
    }
    return m
  }, [reports])

  const openGlance = useCallback((name: string, email: string | null, anchor: HTMLElement) => {
    const rect = anchor.getBoundingClientRect()
    setGlance({ name, email, x: rect.left, y: rect.bottom + 6 })
  }, [])

  /** session214 — ঝলক-খোলা অবস্থায় Esc-বন্ধ + ফোকাস */
  useEffect(() => {
    if (!glance) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGlance(null)
    }
    window.addEventListener('keydown', onKey)
    glanceRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [glance])

  /** session215 — সার্ভার-পুশ (SSE): changed-সিগন্যালে তাৎক্ষণিক load() (২৫০ms-ডিবাউন্স);
   *  EventSource নিজেই পুনঃসংযোগ-চেষ্টা করে; ১৫-সে-পোল ফলব্যাক-হিসেবে অপরিবর্তিত;
   *  watchdog: ৪০s+ নীরবতা (hb=২৫s-মার্জিন) → জোর-করে-রিসেট — stalled/zombie-স্ট্রিম-স্বয়ংক্রিয়-হিল */
  useEffect(() => {
    let es: EventSource | null = null
    let deb: ReturnType<typeof setTimeout> | null = null
    let watchdog: ReturnType<typeof setInterval> | null = null
    let lastMsgAt = Date.now()
    let closed = false

    const openES = () => {
      if (closed) return
      try {
        es = new EventSource('/api/admin/support-stream')
        es.onopen = () => setLive('live')
        es.onmessage = () => {
          lastMsgAt = Date.now()
          if (document.hidden) return
          if (deb) clearTimeout(deb)
          deb = setTimeout(() => void load(), 250)
        }
        es.onerror = () => setLive('polling')
      } catch {
        setLive('polling')
      }
    }
    openES()
    watchdog = setInterval(() => {
      if (closed || !es) return
      if (Date.now() - lastMsgAt > 40000) {
        lastMsgAt = Date.now()
        try {
          es.close()
        } catch {
          /* নীরব */
        }
        setLive('connecting')
        openES()
      }
    }, 10000)
    return () => {
      closed = true
      if (watchdog) clearInterval(watchdog)
      if (deb) clearTimeout(deb)
      es?.close()
    }
  }, [load])

  /** session211 — মাউন্টে URL-প্যারাম হাইড্রেট (?tab/&media/&date/&q/&sort/&report) — এক-বার */
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      const tabP = sp.get('tab')
      if (tabP === 'PENDING' || tabP === 'IN_PROGRESS' || tabP === 'RESOLVED') setTab(tabP)
      const mediaP = sp.get('media')
      if (mediaP && ['ALL', 'TEXT', 'IMAGE', 'AUDIO', 'VIDEO'].includes(mediaP)) setMediaFilter(mediaP)
      const dateP = sp.get('date')
      if (dateP && DATE_RANGES.some((d) => d.key === dateP)) setDateRange(dateP)
      const qP = sp.get('q')
      if (qP) setQuery(qP.slice(0, 200))
      if (sp.get('sort') === 'asc') setSortAsc(true)
      const rP = sp.get('report')
      if (rP) linkIdRef.current = rP
    } catch {
      /* ignore */
    }
    hydratedRef.current = true
  }, [])

  /** session211 — ফিল্টার-স্টেট → URL replaceState (শেয়ারযোগ্য ডেস্ক-লিঙ্ক; ডিফল্ট-মান বাদ; ২৫০ms-ডিবাউন্স) */
  useEffect(() => {
    if (!hydratedRef.current) return
    const t = setTimeout(() => {
      try {
        const sp = new URLSearchParams()
        if (tab !== 'PENDING') sp.set('tab', tab)
        if (mediaFilter !== 'ALL') sp.set('media', mediaFilter)
        if (dateRange !== 'ALL') sp.set('date', dateRange)
        if (query.trim()) sp.set('q', query.trim().slice(0, 200))
        if (sortAsc) sp.set('sort', 'asc')
        if (linkIdRef.current) sp.set('report', linkIdRef.current)
        const qs = sp.toString()
        history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
      } catch {
        /* ignore */
      }
    }, 250)
    return () => clearTimeout(t)
  }, [tab, mediaFilter, dateRange, query, sortAsc])

  /** session211 — ?report=<id> ডিপ-লিংক: লোড-শেষে ট্যাব-মিলাই + স্ক্রল + অ্যাম্বার-পালস-হাইলাইট (এক-বার) */
  useEffect(() => {
    const target = linkIdRef.current
    if (!target || loading || reports.length === 0) return
    linkIdRef.current = null
    const r = reports.find((x) => x.id === target)
    if (!r) {
      flash('লিঙ্ক-করা অভিযোগটি আর পাওয়া যায়নি')
      return
    }
    setTab(r.status)
    setHlId(r.id)
    const t = setTimeout(() => {
      document
        .querySelector(`article[data-report="${r.id}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 80)
    const clear = setTimeout(() => setHlId(null), 3200)
    return () => {
      clearTimeout(t)
      clearTimeout(clear)
    }
  }, [loading, reports, flash])

  /** ছবি-লাইটবক্স Esc-বন্ধ (session202) */
  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  /** অভিযোগের লেখা কপি — clipboard API + legacy-fallback (session202) */
  const copyMsg = useCallback(async (r: Report) => {
    try {
      await navigator.clipboard.writeText(r.messageText)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = r.messageText
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
      } catch {
        /* নীরব */
      }
      ta.remove()
    }
    setCopiedId(r.id)
    setTimeout(() => setCopiedId((c) => (c === r.id ? null : c)), 1600)
  }, [])

  /** session211 — রিপোর্ট-ডিপ-লিঙ্ক কপি (?report=<id>) — clipboard API + legacy-fallback */
  const copyLink = useCallback(async (r: Report) => {
    const url = `${window.location.origin}${window.location.pathname}?report=${r.id}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
      } catch {
        /* নীরব */
      }
      ta.remove()
    }
    setCopiedLinkId(r.id)
    setTimeout(() => setCopiedLinkId((c) => (c === r.id ? null : c)), 1600)
  }, [])

  /** session207 — দৃশ্যমান-তালিকা: ট্যাব + মিডিয়া + তারিখ-সীমা + অনুসন্ধান + ক্রম (সব-ক্লায়েন্ট-সাইড) */
  const shown = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const cutoff = dateCutoff(dateRange)
    const list = reports.filter(
      (r) =>
        r.status === tab &&
        (mediaFilter === 'ALL' || r.mediaType === mediaFilter) &&
        (!cutoff || new Date(r.createdAt).getTime() >= cutoff) &&
        (!laterOnly || !!later[r.id]) &&
        (!q ||
          r.senderName.toLowerCase().includes(q) ||
          (r.senderEmail ?? '').toLowerCase().includes(q) ||
          r.messageText.toLowerCase().includes(q)),
    )
    // session207 — ক্রম-টগল: সাম্প্রতক-আগে (ডিফল্ট) ↔ পুরাতন-আগে
    return list.sort((a, b) => {
      const da = new Date(a.createdAt).getTime()
      const db = new Date(b.createdAt).getTime()
      return sortAsc ? da - db : db - da
    })
  }, [reports, tab, mediaFilter, query, dateRange, sortAsc, laterOnly, later])

  /** session212 — ক্ল্যাম্পড-কার্সর (পোলে রেকর্ড-কমলে ইনডেক্স-অসফল-এড়াই) */
  const cursorIdx = cursor >= 0 && cursor < shown.length ? cursor : -1

  /** CSV-এক্সপোর্ট — session207: বর্তমান-ফিল্টার-অনুযায়ী (ট্যাব+অনুসন্ধান+মিডিয়া+তারিখ+ক্রম), UTF-8 BOM, RFC-4180 */
  const exportCsv = useCallback(async () => {
    setExporting(true)
    try {
      // session210 — "ইতিহাস" কলাম: অ্যাকশন-টাইমলাইন CSV-তেই (জবাবদিহিতা-ট্রেইল)
      const header = ['তারিখ', 'প্রেরক', 'ইমেইল', 'স্টেটাস', 'মিডিয়া', 'অভিযোগ', 'অ্যাডমিন-নোট', 'ইতিহাস']
      const rows = shown.map((r) => [
        new Date(r.createdAt).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }),
        r.senderName,
        r.senderEmail ?? '',
        STATUS_LABEL[r.status],
        r.mediaType,
        r.messageText,
        r.adminNote ?? '',
        historySummaryBn(r.noteHistory),
      ])
      const csv =
        '\uFEFF' + [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // session213 — ফাইলনামে ফিল্টার-প্রসঙ্গ (ট্যাব + মিডিয়া) — স্প্রেডশিট-সংগঠন-সহজ
      const nameParts = ['lekhok-support', tab.toLowerCase()]
      if (mediaFilter !== 'ALL') nameParts.push(mediaFilter.toLowerCase())
      a.download = `${nameParts.join('-')}-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      flash(`CSV ডাউনলোড শুরু — বর্তমান-ফিল্টারে ${bn(shown.length)}টি রেকর্ড`)
    } finally {
      setExporting(false)
    }
  }, [shown, flash])

  const update = useCallback(
    async (id: string, payload: { status?: Status; adminNote?: string }, undoable = true) => {
      setBusy(id)
      const prev = reports.find((r) => r.id === id)
      try {
        const res = await fetch('/api/admin/support-reports', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...payload }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || 'আপডেট ব্যর্থ')
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...data.report } : r)))
        await load() // কাউন্ট-রিফ্রেশ
        // session202 — সাইডবার/ড্যাশবোর্ড ব্যাজ তাৎক্ষণিক-রিফ্রেশ
        window.dispatchEvent(new Event('lf:support-changed'))
        // session203 — অভিযোগকারীকে SUPPORT_UPDATE নোটিফিকেশন গেছে-জানানো (স্টেটাস/নোট বদলেই)
        const statusChanged = payload.status && payload.status !== prev?.status
        const noteChanged = payload.adminNote !== undefined && payload.adminNote.trim() !== (prev?.adminNote ?? '')
        const notified = (statusChanged || noteChanged) ? ' · অভিযোগকারীকে নোটিফিকেশন পাঠানো হয়েছে' : ''
        // session222 — আন্ডুযোগ্য স্টেটাস-পরিবর্তন স্ট্যাকে-ঠেলে (আন্ডু-পুনঃস্থাপন নিজে স্ট্যাকে-যায়-না)
        if (statusChanged && undoable && prev) {
          setStatusUndo((s) =>
            [{ id, from: prev.status, to: payload.status as Status, at: Date.now(), label: prev.senderName }, ...s].slice(0, 10),
          )
        }
        flash(
          payload.status
            ? `${undoable ? 'স্টেটাস' : 'স্টেটাস আন্ডু'} → ${STATUS_LABEL[payload.status]}${notified}`
            : `নোট সংরক্ষিত${notified}`,
        )
      } catch (err) {
        flash(err instanceof Error ? err.message : 'আপডেট ব্যর্থ')
      } finally {
        setBusy(null)
      }
    },
    [flash, load, reports]
  )

  /** session206/207 — ট্যাব/ফিল্টার/তারিখ-বদলে নির্বাচন-পরিষ্কার (অদৃশ্য-কার্ডে বাল্ক-অ্যাকশন আটকায়) */
  useEffect(() => {
    setSelected([])
  }, [tab, mediaFilter, query, dateRange])

  /** session208 (Task 59) — ইতিহাস-এন্ট্রি সম্পাদনা/মুছে-ফেলা (PATCH); কাউন্ট-অপরিবর্তিত → load()-ছাড়াই
   *  লোকাল-স্টেট-আপডেট; ইউজার-দিকের my-reports-ও লাইভ-ইভেন্টে সিঙ্ক হয় */
  const patchHistory = useCallback(
    async (
      id: string,
      payload: {
        historyIndex?: number
        action: 'edit-note' | 'delete-note' | 'restore-note'
        note?: string
        entry?: HistoryEntry
      },
      okMsg: string,
      undo?: { id: string; index: number; entry: HistoryEntry },
    ) => {
      setBusy(id)
      try {
        const res = await fetch('/api/admin/support-reports', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...payload }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || 'ইতিহাস-আপডেট ব্যর্থ')
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...data.report } : r)))
        window.dispatchEvent(new Event('lf:support-changed'))
        flash(okMsg, undo, undo ? 8000 : 3000) // session209 — আন্ডু-উইন্ডো ৮-সে
      } catch (err) {
        flash(err instanceof Error ? err.message : 'ইতিহাস-আপডেট ব্যর্থ')
      } finally {
        setBusy(null)
      }
    },
    [flash],
  )

  /** session209 — আন্ডু-উইন্ডোতে মুছে-ফেলা নোট-এন্ট্রি পুনরুদ্ধার */
  const undoDelete = useCallback(() => {
    if (!undoData) return
    const { id, index, entry } = undoData
    setUndoData(null)
    void patchHistory(
      id,
      { historyIndex: index, action: 'restore-note', entry },
      'ইতিহাস-এন্ট্রি পুনরুদ্ধার হয়েছে · অভিযোগকারীকে নোটিফিকেশন পাঠানো হয়েছে',
    )
  }, [undoData, patchHistory])

  /** session222 — Ctrl+Z স্টেটাস-আন্ডু: স্ট্যাক-শীর্ষ (নতুনতম) পরিবর্তন পুনঃস্থাপন; আন্ডু-পুনঃস্থাপন নিজে স্ট্যাকে-যায়-না (undoable=false) */
  const undoLastStatus = useCallback(() => {
    const last = statusUndo[0]
    if (!last) {
      flash('আন্ডুযোগ্য স্টেটাস-পরিবর্তন নেই')
      return
    }
    setStatusUndo((s) => s.slice(1))
    void update(last.id, { status: last.from }, false)
  }, [statusUndo, update, flash])

  const total = counts.PENDING + counts.IN_PROGRESS + counts.RESOLVED
  /** session210 — ৩+ দিন-পুরাতন অমীমাংসিত (অ্যালার্ট-বারের কাউন্ট) */
  const staleN = staleCount(reports)
  const filtersActive = query.trim() !== '' || mediaFilter !== 'ALL' || dateRange !== 'ALL' || laterOnly
  const statPct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0)
  /** session217 — ৭-দিনের আগমন-প্রবণতা (সব-স্টেটাস; ক্লায়েন্ট-সাইড) */
  const trend = React.useMemo(() => {
    const now = new Date()
    const days: { key: string; label: string; count: number; isToday: boolean }[] = []
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1)
      const count = reports.filter((r) => {
        const t = new Date(r.createdAt).getTime()
        return t >= start.getTime() && t < end.getTime()
      }).length
      days.push({
        key: start.toISOString().slice(0, 10),
        label: WEEKDAY_BN[start.getDay()],
        count,
        isToday: i === 0,
      })
    }
    return days
  }, [reports])
  const trendMax = Math.max(1, ...trend.map((t) => t.count))
  const trendTotal = trend.reduce((s, t) => s + t.count, 0)
  const trendToday = trend.find((t) => t.isToday)?.count ?? 0
  /** session217 — তারাচিহ্নিত-সংখ্যা (চিপ-ব্যাজ) */
  const starN = Object.keys(later).length
  /** session221 — ফিড-কাইন্ড-গণনা + কাইন্ড-ফিল্টার + ডে-গ্রুপিং (প্যানেল-রেন্ডার-ভিত্তিক; ক্যাপ-৩০-ছোট) */
  const feedKindCounts: Record<'ALL' | FeedEntry['kind'], number> = {
    ALL: feed.length,
    new: 0,
    status: 0,
    note: 0,
  }
  for (const ev of feed) feedKindCounts[ev.kind]++
  const feedFiltered = feedKind === 'ALL' ? feed : feed.filter((ev) => ev.kind === feedKind)
  const feedVisible = feedFiltered.slice(0, 12)
  const feedGroups: { label: string; items: { ev: FeedEntry; idx: number }[] }[] = []
  feedVisible.forEach((ev, idx) => {
    const label = feedDayLabelBn(ev.at)
    const lastGrp = feedGroups[feedGroups.length - 1]
    if (lastGrp && lastGrp.label === label) lastGrp.items.push({ ev, idx })
    else feedGroups.push({ label, items: [{ ev, idx }] })
  })

  /** session206 — বাল্ক-স্টেটাস: নির্বাচিত-কার্ডে ক্রমিক PUT + প্রগ্রেস; শেষে একবার reload+ব্যাজ-সিঙ্ক */
  const bulkUpdate = useCallback(
    async (status: Status) => {
      if (selected.length === 0 || bulkBusy) return
      setBulkBusy(true)
      setBulkProgress({ done: 0, total: selected.length })
      let ok = 0
      for (const id of selected) {
        try {
          const res = await fetch('/api/admin/support-reports', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status }),
          })
          if (res.ok) ok++
        } catch {
          /* একটা-ব্যর্থ হলেও বাকিগুলো চলবে */
        }
        setBulkProgress((p) => ({ ...p, done: p.done + 1 }))
      }
      setBulkBusy(false)
      setSelected([])
      setBulkProgress({ done: 0, total: 0 })
      await load()
      window.dispatchEvent(new Event('lf:support-changed'))
      flash(
        `${bn(ok)}টি অভিযোগ → ${STATUS_LABEL[status]}${ok < selected.length ? ` (${bn(selected.length - ok)}টি ব্যর্থ)` : ''} · অভিযোগকারীরা নোটিফিকেশন পেয়েছেন`,
      )
    },
    [selected, bulkBusy, load, flash],
  )

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  /** session217 — পরে-দেখুন টগল (localStorage-স্থায়ী; ৫০০-ক্যাপে প্রাচীনতম-প্রুন) */
  const toggleLater = useCallback((id: string) => {
    setLater((prev) => {
      const next = { ...prev }
      if (next[id]) delete next[id]
      else {
        next[id] = Date.now()
        const ids = Object.keys(next)
        if (ids.length > 500) {
          ids.sort((a, b) => next[a] - next[b])
          for (const k of ids.slice(0, ids.length - 500)) delete next[k]
        }
      }
      try {
        localStorage.setItem('lf-desk-later', JSON.stringify(next))
      } catch {
        /* নীরব */
      }
      return next
    })
  }, [])
  /** session217 — ঘনত্ব-টগল (localStorage-স্থায়ী) */
  const toggleDensity = useCallback(() => {
    setDensity((d) => {
      const next = d === 'compact' ? 'comfortable' : 'compact'
      try {
        localStorage.setItem('lf-desk-density', next)
      } catch {
        /* নীরব */
      }
      return next
    })
  }, [])

  /** session218 — কমান্ড-প্যালেট: ফিল্টার-রিসেট (টুলবার-রিসেটের-সাথে-এক-আচরণ) */
  const resetFilters = useCallback(() => {
    setQuery('')
    setMediaFilter('ALL')
    setDateRange('ALL')
    setSortAsc(false)
    setLaterOnly(false)
  }, [])
  /** session218 — বর্তমান-ভিউ-লিঙ্ক কপি (session211-URL-চুক্তি অনুযায়ী replaceState-সিঙ্ক-করা-URL);
   *  clipboard-API ৮০০ms-রেস-টাইমআউট (headless/অনুমতি-শূন্য-কনটেক্সটে writeText হ্যাং-করতে-পারে →
   *  ফলব্যাক-ও-টোস্ট-নিশ্চিত) */
  const copyViewLink = useCallback(async () => {
    const url = window.location.href
    try {
      await Promise.race([
        navigator.clipboard.writeText(url),
        new Promise((_, rej) => setTimeout(() => rej(new Error('clipboard-timeout')), 800)),
      ])
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
      } catch {
        /* নীরব */
      }
      ta.remove()
    }
    flash('বর্তমান ভিউ-লিঙ্ক কপি হয়েছে')
  }, [flash])

  /** session219 — শিফট-হস্তান্তর সারসংক্ষেপ: তৈরি (এক-উৎস lib; reports-বদলে স্বয়ংক্রিয়-হালনাগাদ) +
   *  কপি = clipboard-race-প্যাটার্ন (s218-গোটচা: headless-হ্যাং → ৮০০ms-ফলব্যাক) + টোস্ট */
  const digest = React.useMemo(() => handoverDigest(reports), [reports])
  const digestText = digest.lines.join('\n')

  /** session223 — KPI glance কার্ড-কনফিগ (handoverDigest-stats এক-উৎস — গণনা-কখনো-ডুপ্লিকেট-নয়);
   *  ক্লিক = প্রচলিত-সেটারে-ফিল্টার-ভিউ-জাম্প (presetActive-লিঙ্ক-স্বয়ংক্রিয়;
   *  স্টেল-কার্ড = stale-banner-সমস্বর জাম্প + dateRange-ALL-নিশ্চিত — জাম্প-পরে-কার্ড-দৃশ্যমানতা-গ্যারান্টি) */
  const kpiCards = React.useMemo(() => {
    const s = digest.stats
    const oldest = s.oldestOpenDays !== null ? `পুরোনোতম ${bn(s.oldestOpenDays)} দিন ধরে` : '৩+ দিন ধরে অমীমাংসিত'
    return [
      {
        key: 'fresh',
        Icon: Inbox,
        label: '২৪ ঘণ্টায় নতুন',
        value: bn(s.fresh24),
        sub: '২৪ঘ-এর-কম-পুরোনো অমীমাংসিত',
        aria: `২৪ ঘণ্টায় ${bn(s.fresh24)}টি অমীমাংসিত নতুন অভিযোগ — আজকের নতুন-ভিউতে যান`,
        tBorder: 'border-t-amber-500',
        iconBg: 'bg-amber-50',
        iconText: 'text-amber-600',
        valText: 'text-amber-700',
        jump: () => {
          setTab('PENDING')
          setDateRange('TODAY')
        },
      },
      {
        key: 'resolved',
        Icon: CheckCircle2,
        label: '২৪ ঘণ্টায় সমাধান',
        value: bn(s.resolvedToday),
        sub: 'গত-২৪ঘ-বে-সমাধান-হওয়া',
        aria: `গত ২৪ ঘণ্টায় ${bn(s.resolvedToday)}টি সমাধান — আজকের সমাধান-ভিউতে যান`,
        tBorder: 'border-t-emerald-600',
        iconBg: 'bg-emerald-50',
        iconText: 'text-emerald-600',
        valText: 'text-emerald-700',
        jump: () => {
          setTab('RESOLVED')
          setDateRange('TODAY')
        },
      },
      {
        key: 'stale',
        Icon: AlertTriangle,
        label: 'স্টেল (৩+ দিন)',
        value: bn(s.stale),
        sub: oldest,
        aria: `${bn(s.stale)}টি স্টেল অভিযোগ (৩+ দিন অমীমাংসিত) — পুরাতন-আগে ক্রমে দেখুন`,
        tBorder: 'border-t-red-500',
        iconBg: 'bg-red-50',
        iconText: 'text-red-600',
        valText: 'text-red-700',
        jump: () => {
          setTab('PENDING')
          setSortAsc(true)
          setDateRange('ALL')
        },
      },
      {
        key: 'avg',
        Icon: Clock,
        label: 'গড় সমাধান-সময়',
        value: s.avgResolveHours !== null ? `${bn(s.avgResolveHours)} ঘ` : '—',
        sub: s.avgResolveHours !== null ? 'সমাধান-সময়ের-গড়' : 'সমাধান-ইতিহাস-নেই',
        aria:
          s.avgResolveHours !== null
            ? `গড় সমাধান-সময় ${bn(s.avgResolveHours)} ঘণ্টা — সমাধান-তালিকায় যান`
            : 'গড় সমাধান-সময় এখনো-গণনাযোগ্য নয় — সমাধান-তালিকায় যান',
        tBorder: 'border-t-sky-600',
        iconBg: 'bg-sky-50',
        iconText: 'text-sky-600',
        valText: 'text-sky-700',
        jump: () => {
          setTab('RESOLVED')
          setDateRange('ALL')
        },
      },
    ]
  }, [digest])
  const openDigest = useCallback((e?: React.MouseEvent) => {
    digestReturnFocusRef.current = (e ? e.currentTarget : document.activeElement) as HTMLElement | null
    setCmdOpen(false)
    setHelpOpen(false)
    setDigestOpen(true)
  }, [])
  const closeDigest = useCallback(() => {
    setDigestOpen(false)
    const t = digestReturnFocusRef.current
    if (t && document.contains(t)) t.focus()
    digestReturnFocusRef.current = null
  }, [])
  useEffect(() => {
    if (!digestOpen) return
    const t = setTimeout(() => digestPanelRef.current?.focus(), 30)
    return () => clearTimeout(t)
  }, [digestOpen])
  const copyDigest = useCallback(async () => {
    try {
      await Promise.race([
        navigator.clipboard.writeText(digestText),
        new Promise((_, rej) => setTimeout(() => rej(new Error('clipboard-timeout')), 800)),
      ])
    } catch {
      const ta = document.createElement('textarea')
      ta.value = digestText
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
      } catch {
        /* নীরব */
      }
      ta.remove()
    }
    flash('সারসংক্ষেপ কপি হয়েছে — চ্যাট/ইমেইলে পেস্ট করুন')
  }, [digestText, flash])

  /** session218 — কমান্ড-ক্যাটালগ: গ্রুপ-সংরক্ষিত-অর্ডার; লেবেল/গ্রুপ-উপর-সার্চ; setter-ই-এক-উৎস */
  type CmdItem = {
    id: string
    group: string
    label: string
    keys?: string[]
    icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
    run: () => void
  }
  const cmdItems = React.useMemo<CmdItem[]>(() => {
    const items: CmdItem[] = []
    const push = (
      group: string,
      id: string,
      label: string,
      icon: CmdItem['icon'],
      run: () => void,
      keys?: string[],
    ) => {
      items.push({ group, id, label, icon, run, keys })
    }
    push('ট্যাব', 'tab-pending', `ট্যাব: নতুন (${bn(counts.PENDING)})`, Inbox, () => setTab('PENDING'), ['১'])
    push('ট্যাব', 'tab-progress', `ট্যাব: চলমান (${bn(counts.IN_PROGRESS)})`, Hourglass, () => setTab('IN_PROGRESS'), ['২'])
    push('ট্যাব', 'tab-resolved', `ট্যাব: সমাধান (${bn(counts.RESOLVED)})`, CheckCircle2, () => setTab('RESOLVED'), ['৩'])
    for (const m of MEDIA_FILTERS) {
      push(
        'মিডিয়া',
        `media-${m.key}`,
        `মিডিয়া: ${m.label}`,
        m.key === 'IMAGE' ? ImageIcon : m.key === 'AUDIO' ? Mic : m.key === 'VIDEO' ? Video : Search,
        () => setMediaFilter(m.key),
      )
    }
    for (const d of DATE_RANGES) {
      push('তারিখ', `date-${d.key}`, `তারিখ: ${d.label}`, CalendarDays, () => setDateRange(d.key))
    }
    push(
      'ফিল্টার',
      'later-toggle',
      laterOnly ? 'পরে-দেখুন ফিল্টার বন্ধ করুন' : 'শুধু তারাচিহ্নিত অভিযোগ দেখুন',
      Star,
      () => setLaterOnly((v) => !v),
    )
    push(
      'ফিল্টার',
      'sort-toggle',
      sortAsc ? 'ক্রম: পুরাতন-আগে → সাম্প্রতক-আগে' : 'ক্রম: সাম্প্রতক-আগে → পুরাতন-আগে',
      ArrowDownWideNarrow,
      () => setSortAsc((v) => !v),
    )
    push('ফিল্টার', 'reset-filters', 'সব-ফিল্টার রিসেট', Undo2, resetFilters)
    for (const p of presets) {
      push('সংরক্ষিত ভিউ', `preset-${p.name}`, `প্রয়োগ: ${p.name}`, Bookmark, () => applyPreset(p))
    }
    push(
      'টগল',
      'sound-toggle',
      soundOn ? 'শব্দ-সংকেত বন্ধ করুন' : 'শব্দ-সংকেত চালু করুন',
      soundOn ? VolumeX : Volume2,
      toggleSound,
    )
    push(
      'টগল',
      'density-toggle',
      density === 'compact' ? 'স্বাভাবিক কার্ড-ঘনত্বে ফেরুন' : 'ঘন কার্ড-ঘনত্ব চালু করুন',
      Rows3,
      toggleDensity,
    )
    push('অ্যাকশন', 'copy-view-link', 'বর্তমান ভিউ-লিঙ্ক কপি করুন', Link2, () => {
      void copyViewLink()
    })
    push('অ্যাকশন', 'handover-digest', 'শিফট-হস্তান্তর সারসংক্ষেপ দেখুন/কপি করুন', ClipboardList, () => openDigest(), ['Ctrl', 'Shift', 'H'])
    push(
      'অ্যাকশন',
      'activity-feed',
      feedOpen ? 'লাইভ অ্যাক্টিভিটি ফিড বন্ধ করুন' : 'লাইভ অ্যাক্টিভিটি ফিড খুলুন',
      Bell,
      () => toggleFeed(),
      ['f'],
    )
    push('অ্যাকশন', 'export-csv', 'CSV এক্সপোর্ট (বর্তমান-ফিল্টার)', Download, () => {
      void exportCsv()
    })
    push(
      'অ্যাকশন',
      'undo-status',
      `শেষ স্টেটাস-পরিবর্তন আন্ডু${statusUndo.length ? ` (${bn(statusUndo.length)})` : ''}`,
      Undo2,
      () => undoLastStatus(),
      ['Ctrl', 'Z'],
    )
    push('অ্যাকশন', 'open-help', 'কীবোর্ড সহায়িকা দেখুন', Keyboard, () => setHelpOpen(true), ['?'])
    const q = cmdQuery.trim().toLowerCase()
    return q ? items.filter((c) => `${c.label} ${c.group}`.toLowerCase().includes(q)) : items
  }, [cmdQuery, counts, presets, laterOnly, sortAsc, soundOn, density, feedOpen, resetFilters, copyViewLink, toggleSound, toggleDensity, openDigest, toggleFeed, exportCsv, undoLastStatus, statusUndo])
  const runCmd = useCallback((c: CmdItem) => {
    setCmdOpen(false)
    c.run()
  }, [])
  /** session218 — প্যালেট-ফোকাস-চুক্তি: খোলায় ইনপুট-ফোকাস, বন্ধে আগের-উপাদানে-ফেরত (a11y) */
  useEffect(() => {
    if (!cmdOpen) return
    cmdReturnFocusRef.current = document.activeElement as HTMLElement | null
    const t = setTimeout(() => cmdInputRef.current?.focus(), 30)
    return () => clearTimeout(t)
  }, [cmdOpen])
  useEffect(() => {
    if (cmdOpen) return
    const el = cmdReturnFocusRef.current
    cmdReturnFocusRef.current = null
    el?.focus?.()
  }, [cmdOpen])
  /** সংকুচিত-তালিকায় সূচি-ক্ল্যাম্প + সক্রিয়-সারি-ভিউপোর্টে-স্ক্রল */
  useEffect(() => {
    setCmdIdx((i) => Math.min(i, Math.max(0, cmdItems.length - 1)))
  }, [cmdItems.length])
  useEffect(() => {
    const id = cmdItems[cmdIdx]?.id
    if (id) document.getElementById(`lf-cmd-${id}`)?.scrollIntoView({ block: 'nearest' })
  }, [cmdIdx, cmdItems])

  /** session212 — ডেস্ক কীবোর্ড-দক্ষতা: j/k নেভিগেট · x নির্বাচন-টগল · ১/২/৩ ট্যাব · ? সহায়িকা · Esc বন্ধ */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing = el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)
      if (e.key === 'Escape') {
        if (lightbox) return
        if (cmdOpen) {
          e.preventDefault()
          setCmdOpen(false)
          return
        }
        if (digestOpen) {
          e.preventDefault()
          closeDigest()
          return
        }
        if (helpOpen) {
          e.preventDefault()
          setHelpOpen(false)
          return
        }
        // session220 — ফিড = নন-মোডাল popover → Esc-চেইনে help-পরে, cursor-আগে
        if (feedOpen) {
          e.preventDefault()
          closeFeed()
          return
        }
        if (!typing) setCursor(-1)
        return
      }
      // session218 — Ctrl/Cmd+K কমান্ড-প্যালেট (typing-গার্ড-বাইপাস: ইনপুটের-ভিতর-থেকেও-ডাকা-যায়;
      // e.preventDefault = ব্রাউজারের-অ্যাড্রেস-বার-ফোকাস-আটকায়)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        setCmdOpen((o) => !o)
        return
      }
      // session219 — Ctrl/Cmd+Shift+H শিফট-হস্তান্তর সারসংক্ষেপ (typing-গার্ড-বাইপাস; Ctrl+K-চুক্তি-অনুরূপ)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault()
        if (digestOpen) closeDigest()
        else openDigest()
        return
      }
      // session222 — Ctrl/Cmd+Z স্টেটাস-আন্ডু (typing-অবস্থায় নেটিভ-টেক্সট-আন্ডু ছেড়ে-দেয় — নীরব-return)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        if (typing) return
        e.preventDefault()
        undoLastStatus()
        return
      }
      if (helpOpen || cmdOpen || typing || bulkBusy || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setHelpOpen((h) => !h)
        return
      }
      if (shown.length === 0) return
      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault()
        const base = cursor >= 0 && cursor < shown.length ? cursor : -1
        const next = Math.min(base + 1, shown.length - 1)
        setCursor(next)
        try {
          document
            .querySelector(`[data-report="${shown[next].id}"]`)
            ?.scrollIntoView({ block: 'center', behavior: 'smooth' })
        } catch {
          /* ignore */
        }
        return
      }
      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault()
        const base = cursor >= 0 && cursor < shown.length ? cursor : shown.length
        const next = Math.max(base - 1, 0)
        setCursor(next)
        try {
          document
            .querySelector(`[data-report="${shown[next].id}"]`)
            ?.scrollIntoView({ block: 'center', behavior: 'smooth' })
        } catch {
          /* ignore */
        }
        return
      }
      if ((e.key === 'x' || e.key === 'X') && cursor >= 0 && cursor < shown.length) {
        toggleSelect(shown[cursor].id)
        return
      }
      if ((e.key === 's' || e.key === 'S') && cursor >= 0 && cursor < shown.length) {
        toggleLater(shown[cursor].id)
        return
      }
      // session220 — f = লাইভ অ্যাক্টিভিটি-ফিড টগল (typing-গার্ড-পরবর্তী — স্ট্যান্ডার্ড-পথ)
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFeed()
        return
      }
      // session222 — Shift+১/২/৩ কার্সর-কার্ড কুইক-স্টেটাস (e.code = কিবোর্ড-লেআউট-স্বাধীন;
      // সম-স্টেটাসে নীরব-স্কিপ — অপ্রয়োজনীয় PUT/নোটিফিকেশন-বর্জন)
      if (e.shiftKey && (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3')) {
        if (cursor >= 0 && cursor < shown.length) {
          e.preventDefault()
          const target: Status = e.code === 'Digit1' ? 'PENDING' : e.code === 'Digit2' ? 'IN_PROGRESS' : 'RESOLVED'
          const cur = shown[cursor]
          if (cur.status !== target) void update(cur.id, { status: target })
        }
        return
      }
      if (e.key === '1' || e.key === '১') setTab('PENDING')
      else if (e.key === '2' || e.key === '২') setTab('IN_PROGRESS')
      else if (e.key === '3' || e.key === '৩') setTab('RESOLVED')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shown, cursor, helpOpen, cmdOpen, digestOpen, feedOpen, closeDigest, openDigest, closeFeed, toggleFeed, lightbox, bulkBusy, toggleSelect, toggleLater, undoLastStatus, update])

  const allShownSelected = shown.length > 0 && shown.every((r) => selected.includes(r.id))

  return (
    <div className="font-hind text-[#050505] space-y-4">
      {/* টোস্ট */}
      {toast && (
        <div
          role="status"
          className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-[#006A4E] px-4 py-2.5 text-[12.5px] font-bold text-white shadow-lg lf-anim-fade relative overflow-hidden"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
          {undoData && (
            <button
              type="button"
              onClick={undoDelete}
              title="মুছে-ফেলা এন্ট্রি ফিরিয়ে আনুন (৮ সেকেন্ড)"
              className="ml-1 flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-extrabold text-white hover:bg-white/25 transition cursor-pointer"
            >
              <Undo2 className="w-3.5 h-3.5" aria-hidden />
              পুনরুদ্ধার
            </button>
          )}
          {/* session216 — টোস্ট-জীবনকাল-বার (৩সে/আন্ডু-৮সে প্রত্যাশা-সংকেত; prefers-reduced-motion-সম্মান) */}
          <span aria-hidden className="lf-anim-toastbar" style={{ animationDuration: undoData ? '8000ms' : '3000ms' }} />
        </div>
      )}

      {/* হেডার */}
      <div className="bg-white border border-[#CED0D4] rounded-[10px] p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#006A4E]" />
            <span>অভিযোগ রিভিউ ডেস্ক</span>
          </h1>
          <p className="text-xs text-[#65676B] mt-0.5">
            সাপোর্ট-চ্যাটে পাঠানো সব অভিযোগ — লেখা, ছবি, অডিও ও ভিডিও; মোট{' '}
            <b>{total}টি</b> রেকর্ড
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportCsv}
            disabled={shown.length === 0 || exporting}
            type="button"
            title="বর্তমান ফিল্টার-অনুযায়ী CSV রপ্তানি — ইতিহাস-কলামসহ (session210)"
            className="px-3 py-2 bg-white border border-[#CED0D4] hover:border-[#006A4E] hover:text-[#006A4E] text-[#4B4C4F] rounded-[8px] text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>CSV</span>
            <span className="text-[10px] font-extrabold text-[#006A4E] bg-[#006A4E]/10 rounded-full px-1.5 py-px min-w-4 text-center">
              {bn(shown.length)}
            </span>
          </button>
          <Link
            href="/admin"
            className="px-3 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded-[8px] text-xs font-bold transition"
          >
            ← ড্যাশবোর্ড
          </Link>
        </div>
      </div>

      {/* session207 — পরিসংখ্যান মিনি-কার্ড ×৪ (স্টেটাস-কার্ড ক্লিকে ট্যাব-সুইচ; শেয়ার-বার = মোটের অনুপাত) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5" role="group" aria-label="অভিযোগ-পরিসংখ্যান">
        <div
          className="bg-white border border-[#CED0D4] border-t-[3px] border-t-[#006A4E] rounded-[10px] p-3 shadow-2xs transition-all hover:shadow-md hover:-translate-y-0.5"
          aria-label={`মোট ${bn(total)}টি অভিযোগ`}
        >
          <p className="text-[10.5px] font-bold text-[#65676B] flex items-center gap-1">
            <Inbox className="w-3.5 h-3.5 text-[#006A4E]" aria-hidden />
            মোট অভিযোগ
          </p>
          <p className="text-xl font-extrabold mt-1 leading-none">{bn(total)}</p>
          <div className="mt-2 h-1 rounded-full bg-[#F0F2F5] overflow-hidden">
            <div className="h-full w-full bg-[#006A4E] rounded-full" />
          </div>
          <p className="mt-1 text-[9.5px] text-[#8A8D91]">সব স্টেটাস মিলিয়ে</p>
        </div>
        {TABS.map((t) => {
          const tone = STAT_TONE[t.key]
          const n = counts[t.key]
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              aria-label={`${t.label}: ${bn(n)}টি — ক্লিকে ট্যাব-বদল`}
              className={`bg-white border border-[#CED0D4] border-t-[3px] ${tone.tBorder} rounded-[10px] p-3 shadow-2xs text-left transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 ${
                tab === t.key ? 'ring-2 ring-[#006A4E]/25 border-[#006A4E]' : ''
              }`}
            >
              <p className="text-[10.5px] font-bold text-[#65676B] flex items-center gap-1">
                {t.key === 'PENDING' && <ShieldAlert className={`w-3.5 h-3.5 ${tone.text}`} aria-hidden />}
                {t.key === 'IN_PROGRESS' && <Hourglass className={`w-3.5 h-3.5 ${tone.text}`} aria-hidden />}
                {t.key === 'RESOLVED' && <CheckCircle2 className={`w-3.5 h-3.5 ${tone.text}`} aria-hidden />}
                {t.label}
              </p>
              <p className={`text-xl font-extrabold mt-1 leading-none ${tone.text}`}>{bn(n)}</p>
              <div className="mt-2 h-1 rounded-full bg-[#F0F2F5] overflow-hidden">
                <div
                  className={`h-full ${tone.bar} rounded-full transition-all`}
                  style={{ width: `${statPct(n)}%` }}
                />
              </div>
              <p className="mt-1 text-[9.5px] text-[#8A8D91]">মোটের {bn(statPct(n))}%</p>
            </button>
          )
        })}
      </div>

      {/* session217 — ৭-দিনের প্রবণতা-স্ট্রিপ (দৈনিক-আগমন-বার; আজ-সবুজ; টুলটিপে তারিখ+গণনা) */}
      <div
        role="img"
        aria-label={`৭-দিনের প্রবণতা: সাত-দিনে মোট ${bn(trendTotal)}টি অভিযোগ এসেছে; আজ ${bn(trendToday)}টি`}
        className="bg-white border border-[#CED0D4] border-t-[3px] border-t-[#006A4E] rounded-[10px] p-3 shadow-2xs"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10.5px] font-bold text-[#65676B] flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#006A4E]" aria-hidden />
            ৭-দিনের প্রবণতা
          </p>
          <span className="text-[9.5px] text-[#8A8D91] font-bold">
            সাত-দিনে মোট {bn(trendTotal)}টি · আজ {bn(trendToday)}টি
          </span>
        </div>
        <div className="mt-2 flex items-stretch gap-1.5 h-16" aria-hidden>
          {trend.map((d) => (
            <div
              key={d.key}
              title={`${bn(d.count)}টি — ${d.key}`}
              className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0"
            >
              <span
                className={`text-[9.5px] font-extrabold leading-none ${d.count > 0 ? (d.isToday ? 'text-[#006A4E]' : 'text-[#4B4C4F]') : 'text-[#CED0D4]'}`}
              >
                {bn(d.count)}
              </span>
              <div className="w-full max-w-8 h-9 flex items-end">
                <div
                  className={`w-full rounded-t-[3px] transition-all ${d.isToday ? 'bg-[#006A4E]' : 'bg-[#CED0D4]'}`}
                  style={{ height: d.count > 0 ? `${Math.max(14, Math.round((d.count / trendMax) * 100))}%` : '2px' }}
                />
              </div>
              <span className={`text-[9px] font-bold leading-none ${d.isToday ? 'text-[#006A4E]' : 'text-[#8A8D91]'}`}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* session223 — KPI glance সারি (handoverDigest-stats এক-উৎস; ৪-কার্ড ক্লিকে ফিল্টার-ভিউ-জাম্প;
           স্টেজার lf-anim-up + hover-লিফট + tabular-nums — reduced-motion-সম্মানী) */}
      <div role="group" aria-label="KPI সারসংক্ষেপ" className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {kpiCards.map((k, i) => (
          <button
            key={k.key}
            type="button"
            onClick={k.jump}
            aria-label={k.aria}
            className={`bg-white border border-[#CED0D4] border-t-[3px] ${k.tBorder} rounded-[10px] p-3 shadow-2xs text-left transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 lf-anim-up`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${k.iconBg}`} aria-hidden>
                <k.Icon className={`w-4 h-4 ${k.iconText}`} />
              </span>
              <p className="text-[10.5px] font-bold text-[#65676B] leading-tight">{k.label}</p>
            </div>
            <p className={`text-xl font-extrabold mt-1.5 leading-none tabular-nums ${k.valText}`}>{k.value}</p>
            <p className="mt-1 text-[9.5px] text-[#8A8D91] leading-tight">{k.sub}</p>
          </button>
        ))}
      </div>

      {/* স্টেটাস-ট্যাব (লাইভ-কাউন্ট) */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            type="button"
            className={`px-3.5 py-2 rounded-[8px] text-xs font-bold border transition cursor-pointer flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 ${
              tab === t.key
                ? 'bg-[#006A4E] text-white border-[#006A4E] shadow-sm'
                : 'bg-white text-[#4B4C4F] border-[#CED0D4] hover:border-[#006A4E]/50'
            }`}
          >
            <span
              className={`inline-block w-2 h-2 rounded-full ${t.cls} ${tab === t.key ? 'ring-2 ring-white/50' : ''}`}
              aria-hidden
            />
            {t.label}
            <span
              className={`min-w-5 h-5 px-1.5 rounded-full text-[10px] flex items-center justify-center font-extrabold ${
                tab === t.key ? 'bg-white/20 text-white' : 'bg-[#F0F2F5] text-[#65676B]'
              }`}
            >
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* session206 — অনুসন্ধান + মিডিয়া-ফিল্টার + ফলাফল-গণনা (session213: স্টিকি — দীর্ঘ-তালিকায় ফিল্টার-হাতের-নাগালে) */}
      <div
        className={`sticky top-2 z-20 bg-white/95 backdrop-blur-sm border rounded-[10px] p-3 space-y-2.5 transition-shadow duration-200 ${
          scrolled ? 'shadow-md border-[#B4B8BE]' : 'shadow-sm border-[#CED0D4]'
        }`}
      >
        <div className="relative">
          <Search
            className="w-4 h-4 text-[#8A8D91] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="নাম, ইমেইল বা অভিযোগের লেখা দিয়ে খুঁজুন..."
            aria-label="অভিযোগ অনুসন্ধান"
            title="দ্রুত-অনুসন্ধান: / চেপে ফোকাস করুন"
            className="w-full text-[12.5px] bg-[#F7F8FA] border border-[#CED0D4] focus:bg-white focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/15 rounded-[8px] pl-9 pr-9 py-2.5 outline-none transition placeholder:text-[#8A8D91]"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              type="button"
              aria-label="অনুসন্ধান মুছুন"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#8A8D91] hover:text-[#050505] hover:bg-[#E4E6EB] transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" aria-hidden />
            </button>
          ) : (
            <kbd
              aria-hidden
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9.5px] font-bold text-[#8A8D91] bg-white border border-[#E4E6EB] rounded px-1.5 py-px shadow-2xs pointer-events-none"
            >
              /
            </kbd>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="মিডিয়া-ফিল্টার">
            {MEDIA_FILTERS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMediaFilter(m.key)}
                type="button"
                aria-pressed={mediaFilter === m.key}
                className={`px-2.5 py-1.5 rounded-full text-[10.5px] font-bold border transition cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 ${
                  mediaFilter === m.key
                    ? 'bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/40'
                    : 'bg-white text-[#65676B] border-[#CED0D4] hover:border-[#006A4E]/40 hover:text-[#006A4E]'
                }`}
              >
                {MEDIA_FILTER_ICON[m.key]}
                {m.label}
              </button>
            ))}
          </div>
          {filtersActive && (
            <p className="text-[10.5px] text-[#65676B] font-bold whitespace-nowrap" role="status">
              {bn(shown.length)}/{bn(total)}টি দেখানো হচ্ছে
              {shown.length < total && (
                <button
                  onClick={() => {
                    setQuery('')
                    setMediaFilter('ALL')
                    setDateRange('ALL')
                    setSortAsc(false)
                    setLaterOnly(false)
                  }}
                  type="button"
                  className="ml-1.5 text-[#006A4E] hover:underline cursor-pointer"
                >
                  রিসেট
                </button>
              )}
            </p>
          )}
          {/* session215 — লাইভ-ইন্ডিকেটর: SSE-সংযোগ-অবস্থা (লাইভ=তাৎক্ষণিক-পুশ / পোলিং=১৫-সে-ফলব্যাক) */}
          <span
            data-live={live}
            title={live === 'live' ? 'লাইভ-পুশ সক্রিয় — নতুন অভিযোগ/আপডেট সাথে-সাথে দেখা যাবে' : 'পোলিং-মোড — ১৫ সেকেন্ড অন্তর আপডেট'}
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold border transition shrink-0 ${
              live === 'live'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-[#F0F2F5] text-[#65676B] border-[#E4E6EB]'
            }`}
          >
            <span aria-hidden className={`w-1.5 h-1.5 rounded-full ${live === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-[#8A8D91]'}`} />
            {live === 'live' ? 'লাইভ' : 'পোলিং'}
          </span>
          {/* session214 — নতুন-অভিযোগ শব্দ-সংকেত টগল (localStorage দ্বারা স্থায়ী; ডিফল্ট বন্ধ) */}
          <button
            onClick={toggleSound}
            type="button"
            aria-pressed={soundOn}
            aria-label={soundOn ? 'নতুন-অভিযোগ শব্দ-সংকেত বন্ধ করুন' : 'নতুন-অভিযোগ শব্দ-সংকেত চালু করুন'}
            title="নতুন অভিযোগ এলে শব্দ-সংকেত (চালু/বন্ধ)"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10.5px] font-bold border transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 shrink-0 ${
              soundOn
                ? 'bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/40'
                : 'bg-white text-[#65676B] border-[#CED0D4] hover:border-[#006A4E]/40 hover:text-[#006A4E]'
            }`}
          >
            {soundOn ? <Volume2 className="w-3 h-3" aria-hidden /> : <VolumeX className="w-3 h-3" aria-hidden />}
            শব্দ
          </button>
          {/* session217 — কার্ড-ঘনত্ব টগল (ঘন = লম্বা-তালিকায় বেশি-কার্ড-দেখা; localStorage-স্থায়ী) */}
          <button
            onClick={toggleDensity}
            type="button"
            aria-pressed={density === 'compact'}
            aria-label={density === 'compact' ? 'স্বাভাবিক কার্ড-ঘনত্বে ফেরুন' : 'ঘন কার্ড-ঘনত্ব চালু করুন'}
            title="কার্ড-ঘনত্ব: ঘন ↔ স্বাভাবিক"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10.5px] font-bold border transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 shrink-0 ${
              density === 'compact'
                ? 'bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/40'
                : 'bg-white text-[#65676B] border-[#CED0D4] hover:border-[#006A4E]/40 hover:text-[#006A4E]'
            }`}
          >
            <Rows3 className="w-3 h-3" aria-hidden />
            ঘন
          </button>
          {/* session218 — কমান্ড-প্যালেট বাটন (Ctrl+K) */}
          <button
            onClick={() => setCmdOpen(true)}
            type="button"
            title="কমান্ড প্যালেট (Ctrl+K চাপুন)"
            aria-label="কমান্ড প্যালেট খুলুন"
            aria-keyshortcuts="Control+K Meta+K"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10.5px] font-bold border bg-white text-[#65676B] border-[#CED0D4] hover:border-[#006A4E]/40 hover:text-[#006A4E] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 shrink-0"
          >
            <CommandIcon className="w-3 h-3" aria-hidden />
            কমান্ড
            <kbd className="lf-kbd" aria-hidden>
              Ctrl K
            </kbd>
          </button>
          {/* session212 — শর্টকাট-সহায়িকা হিন্ট (সবসময়-দৃশ্যমান) */}
          <button
            onClick={() => setHelpOpen(true)}
            type="button"
            title="কীবোর্ড শর্টকাট দেখুন (? চাপুন)"
            aria-label="কীবোর্ড শর্টকাট সহায়িকা খুলুন"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10.5px] font-bold border bg-white text-[#65676B] border-[#CED0D4] hover:border-[#006A4E]/40 hover:text-[#006A4E] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 shrink-0"
          >
            <Keyboard className="w-3 h-3" aria-hidden />
            শর্টকাট
            <kbd className="lf-kbd" aria-hidden>
              ?
            </kbd>
          </button>
          {/* session219 — হস্তান্তর-হিন্ট বাটন (Ctrl+Shift+H / প্যালেটেও-আছে) */}
          <button
            onClick={(e) => openDigest(e)}
            type="button"
            title="শিফট-হস্তান্তর সারসংক্ষেপ (Ctrl+Shift+H চাপুন)"
            aria-label="শিফট-হস্তান্তর সারসংক্ষেপ খুলুন"
            aria-keyshortcuts="Control+Shift+H Meta+Shift+H"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10.5px] font-bold border bg-white text-[#65676B] border-[#CED0D4] hover:border-[#006A4E]/40 hover:text-[#006A4E] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 shrink-0"
          >
            <ClipboardList className="w-3 h-3" aria-hidden />
            হস্তান্তর
            <kbd className="lf-kbd" aria-hidden>
              Ctrl ⇧ H
            </kbd>
          </button>
          {/* session220 — লাইভ অ্যাক্টিভিটি-ফিড বেল (অদেখা-ব্যাজ; f-শর্টকাট) */}
          <button
            ref={feedBtnRef}
            onClick={toggleFeed}
            type="button"
            aria-expanded={feedOpen}
            aria-label={
              feedUnseen > 0
                ? `লাইভ অ্যাক্টিভিটি ফিড — ${bn(feedUnseen)}টি নতুন কার্যক্রম অদেখা`
                : 'লাইভ অ্যাক্টিভিটি ফিড খুলুন'
            }
            aria-keyshortcuts="f"
            title="লাইভ অ্যাক্টিভিটি ফিড (f চাপুন) — নতুন অভিযোগ/স্টেটাস/নোট-বদল এখানে জমা হয়"
            className={`relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10.5px] font-bold border transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 shrink-0 ${
              feedOpen
                ? 'bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/40'
                : 'bg-white text-[#65676B] border-[#CED0D4] hover:border-[#006A4E]/40 hover:text-[#006A4E]'
            }`}
          >
            <Bell className="w-3 h-3" aria-hidden />
            ফিড
            {feedUnseen > 0 && (
              <span
                aria-hidden
                className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow lf-badge-pulse"
              >
                {bn(feedUnseen)}
              </span>
            )}
          </button>
        </div>
        {/* session207 — তারিখ-সীমা চিপ + ক্রম-টগল (সব-ক্লায়েন্ট-সাইড) */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="তারিখ-সীমা ফিল্টার">
            <CalendarDays className="w-3.5 h-3.5 text-[#8A8D91] shrink-0" aria-hidden />
            {DATE_RANGES.map((d) => (
              <button
                key={d.key}
                onClick={() => setDateRange(d.key)}
                type="button"
                aria-pressed={dateRange === d.key}
                className={`px-2.5 py-1.5 rounded-full text-[10.5px] font-bold border transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 ${
                  dateRange === d.key
                    ? 'bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/40'
                    : 'bg-white text-[#65676B] border-[#CED0D4] hover:border-[#006A4E]/40 hover:text-[#006A4E]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          {/* session217 — পরে-দেখুন ফিল্টার-চিপ (শুধু-তারাচিহ্নিত; চলতি-ট্যাব+অন্যান্য-ফিল্টারের-সাথে-মিলে) */}
          <button
            onClick={() => setLaterOnly((v) => !v)}
            type="button"
            aria-pressed={laterOnly}
            aria-label={laterOnly ? 'পরে-দেখুন ফিল্টার বন্ধ করুন' : 'শুধু তারাচিহ্নিত অভিযোগ দেখুন'}
            title="শুধু তারাচিহ্নিত অভিযোগ দেখান"
            className={`px-2.5 py-1.5 rounded-full text-[10.5px] font-bold border transition cursor-pointer flex items-center gap-1.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 ${
              laterOnly
                ? 'bg-amber-50 text-amber-600 border-amber-300'
                : 'bg-white text-[#65676B] border-[#CED0D4] hover:border-amber-300 hover:text-amber-500'
            }`}
          >
            <Star className={`w-3 h-3 ${laterOnly ? 'fill-current' : ''}`} aria-hidden />
            পরে দেখুন{starN > 0 ? ` (${bn(starN)})` : ''}
          </button>
          <button
            onClick={() => setSortAsc((v) => !v)}
            type="button"
            aria-label={sortAsc ? 'এখন পুরাতন-আগে — বদলে সাম্প্রতক-আগে করুন' : 'এখন সাম্প্রতক-আগে — বদলে পুরাতন-আগে করুন'}
            title="তালিকার ক্রম বদলান"
            className={`px-2.5 py-1.5 rounded-full text-[10.5px] font-bold border transition cursor-pointer flex items-center gap-1.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 ${
              sortAsc
                ? 'bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/40'
                : 'bg-white text-[#65676B] border-[#CED0D4] hover:border-[#006A4E]/40 hover:text-[#006A4E]'
            }`}
          >
            <ArrowDownWideNarrow className={`w-3.5 h-3.5 transition-transform ${sortAsc ? 'rotate-180' : ''}`} aria-hidden />
            {sortAsc ? 'পুরাতন আগে' : 'সাম্প্রতক আগে'}
          </button>
        </div>
        {/* session216 — সংরক্ষিত-ভিউ (প্রিসেট) চিপ-সারি: বর্তমান tab+media+date+q+sort এক-ক্লিকে পুনরুদ্ধার */}
        <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="সংরক্ষিত ফিল্টার ভিউ">
          <Bookmark className="w-3.5 h-3.5 text-[#8A8D91] shrink-0" aria-hidden />
          {presets.length === 0 && !presetNameOpen && (
            <span className="text-[10.5px] text-[#8A8D91]">বর্তমান ফিল্টার-সেট নাম দিয়ে জমান — পরে এক-ক্লিকে ফেরান</span>
          )}
          {presets.map((p) => (
            <span key={p.name} className="relative inline-flex items-center">
              <button
                onClick={() => applyPreset(p)}
                type="button"
                aria-pressed={presetActive(p)}
                title={`${p.tab === 'PENDING' ? 'নতুন' : p.tab === 'IN_PROGRESS' ? 'চলমান' : 'সমাধান'} · ${p.media} · ${p.date}${p.q ? ` · "${p.q}"` : ''} — ক্লিকে প্রয়োগ`}
                className={`pl-2.5 pr-6 py-1.5 rounded-full text-[10.5px] font-bold border transition cursor-pointer inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 ${
                  presetActive(p)
                    ? 'bg-[#006A4E] text-white border-[#006A4E]'
                    : 'bg-white text-[#65676B] border-[#CED0D4] hover:border-[#006A4E]/40 hover:text-[#006A4E]'
                }`}
              >
                <Bookmark className={`w-3 h-3 ${presetActive(p) ? 'text-white' : 'text-[#8A8D91]'}`} aria-hidden />
                {p.name}
              </button>
              <button
                onClick={() => deletePreset(p)}
                type="button"
                aria-label={`"${p.name}" ভিউ মুছুন`}
                title="ভিউ মুছুন"
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white border border-[#CED0D4] text-[#65676B] hover:text-white hover:bg-red-500 hover:border-red-500 flex items-center justify-center transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <X className="w-2.5 h-2.5" aria-hidden />
              </button>
            </span>
          ))}
          {presetNameOpen ? (
            <span className="inline-flex items-center gap-1">
              <input
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    savePreset()
                  } else if (e.key === 'Escape') {
                    e.preventDefault()
                    setPresetNameOpen(false)
                    setPresetName('')
                  }
                }}
                autoFocus
                maxLength={40}
                placeholder="ভিউ-এর নাম..."
                aria-label="ভিউ-এর নাম"
                className="text-[11px] font-bold border border-[#006A4E]/50 rounded-full px-3 py-1.5 w-36 bg-white focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 placeholder:text-[#8A8D91] placeholder:font-normal"
              />
              <button
                onClick={savePreset}
                type="button"
                title="সংরক্ষণ (Enter)"
                aria-label="ভিউ সংরক্ষণ নিশ্চিত করুন"
                className="p-1.5 rounded-full bg-[#006A4E] text-white hover:bg-[#00523D] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40"
              >
                <Check className="w-3.5 h-3.5" aria-hidden />
              </button>
              <button
                onClick={() => {
                  setPresetNameOpen(false)
                  setPresetName('')
                }}
                type="button"
                title="বাতিল (Esc)"
                aria-label="ভিউ-সংরক্ষণ বাতিল করুন"
                className="p-1.5 rounded-full bg-white border border-[#CED0D4] text-[#65676B] hover:text-[#050505] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40"
              >
                <X className="w-3.5 h-3.5" aria-hidden />
              </button>
            </span>
          ) : (
            <button
              onClick={() => setPresetNameOpen(true)}
              type="button"
              title="বর্তমান ফিল্টার-সেট সংরক্ষিত ভিউ হিসেবে জমান"
              className="px-2.5 py-1.5 rounded-full text-[10.5px] font-bold border border-dashed bg-white text-[#65676B] border-[#CED0D4] hover:border-[#006A4E]/60 hover:text-[#006A4E] transition cursor-pointer inline-flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40"
            >
              + সংরক্ষণ
            </button>
          )}
        </div>
        {/* session220 — লাইভ অ্যাক্টিভিটি-ফিড প্যানেল: sticky-বারে এনকোর (absolute top-full — বার-সহ
            স্ক্রলে-স্থির); গ্রেডিয়েন্ট-হেডার + এন্ট্রি-স্টেজার lf-anim-up; এন্ট্রি-ক্লিকে রিপোর্টে জাম্প */}
        {feedOpen && (
          <div
            ref={feedPanelRef}
            role="region"
            aria-label="লাইভ অ্যাক্টিভিটি ফিড"
            className="absolute right-3 top-full mt-2 z-[60] w-[min(380px,calc(100vw-2rem))] bg-white border border-[#CED0D4] rounded-[12px] shadow-lg overflow-hidden lf-anim-pop"
          >
            <div className="bg-gradient-to-r from-[#006A4E] to-[#00523C] px-3 py-2.5 flex items-center justify-between gap-2">
              <p className="text-[11.5px] font-extrabold text-white flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5" aria-hidden />
                লাইভ অ্যাক্টিভিটি
                {feed.length > 0 && (
                  <span className="text-[9.5px] font-bold bg-white/15 rounded-full px-1.5 py-px">
                    সর্বশেষ {bn(feed.length)}টি
                  </span>
                )}
              </p>
              <div className="flex items-center gap-1">
                {feed.length > 0 && (
                  <button
                    onClick={clearFeed}
                    type="button"
                    aria-label="ফিড পরিষ্কার করুন"
                    title="ফিড পরিষ্কার"
                    className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden />
                  </button>
                )}
                <button
                  onClick={closeFeed}
                  type="button"
                  aria-label="ফিড বন্ধ করুন"
                  title="বন্ধ (Esc)"
                  className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden />
                </button>
              </div>
            </div>
            {feed.length > 0 && (
              <div
                className="flex items-center gap-1 flex-wrap px-2.5 py-2 border-b border-[#E4E6EB] bg-[#FAFBFC]"
                role="group"
                aria-label="ফিড-ফিল্টার"
              >
                {FEED_KINDS.map((k) => (
                  <button
                    key={k.key}
                    onClick={() => setFeedKind(k.key)}
                    type="button"
                    aria-pressed={feedKind === k.key}
                    title={k.key === 'ALL' ? 'সব-ধরনের কার্যক্রম' : `শুধু ${k.label}-ধরনের কার্যক্রম`}
                    className={`px-2 py-1 rounded-full text-[9.5px] font-extrabold border transition cursor-pointer inline-flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 ${
                      feedKind === k.key
                        ? 'bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/40'
                        : 'bg-white text-[#65676B] border-[#E4E6EB] hover:border-[#006A4E]/40 hover:text-[#006A4E]'
                    }`}
                  >
                    {k.label}
                    <span className="text-[8.5px] font-bold bg-[#F0F2F5] text-[#65676B] rounded-full px-1 py-px min-w-3.5 text-center">
                      {bn(feedKindCounts[k.key])}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {feed.length === 0 ? (
              <div className="px-4 py-7 text-center">
                <Bell className="w-6 h-6 text-[#CED0D4] mx-auto mb-2" aria-hidden />
                <p className="text-[11.5px] text-[#65676B] font-bold">কোনো কার্যক্রম নেই</p>
                <p className="text-[10.5px] text-[#8A8D91] mt-1">
                  নতুন অভিযোগ, স্টেটাস-বদল ও নোট-হালনাগাদ এখানে জমা হবে (সর্বশেষ ৪৮ ঘণ্টা)
                </p>
              </div>
            ) : feedVisible.length === 0 ? (
              <div className="px-4 py-7 text-center">
                <Bell className="w-6 h-6 text-[#CED0D4] mx-auto mb-2" aria-hidden />
                <p className="text-[11.5px] text-[#65676B] font-bold">এই ধরনের কোনো কার্যক্রম নেই</p>
                <button
                  onClick={() => setFeedKind('ALL')}
                  type="button"
                  className="mt-1.5 text-[10.5px] font-extrabold text-[#006A4E] hover:underline cursor-pointer bg-transparent border-0"
                >
                  সব-কার্যক্রম দেখুন
                </button>
              </div>
            ) : (
              <ul className="max-h-[55vh] overflow-y-auto">
                {feedGroups.map((g, gi) => (
                  <React.Fragment key={`${g.label}-${gi}`}>
                    <li
                      aria-hidden
                      className="px-3 pt-2 pb-1 bg-[#FAFBFC] border-b border-[#F0F2F5] text-[9px] font-extrabold uppercase tracking-wide text-[#8A8D91] flex items-center gap-1.5"
                    >
                      <CalendarDays className="w-2.5 h-2.5" aria-hidden />
                      {g.label}
                      <span className="ml-auto text-[8.5px] font-bold bg-white border border-[#E4E6EB] rounded-full px-1.5 py-px normal-case">
                        {bn(g.items.length)}টি
                      </span>
                    </li>
                    {g.items.map(({ ev, idx }) => {
                      const gone = !reports.some((r) => r.id === ev.rid)
                      return (
                        <li key={ev.id} className="border-b border-[#F7F8FA] last:border-b-0">
                          <button
                            onClick={() => jumpToReport(ev.rid)}
                            disabled={gone}
                            type="button"
                            title={gone ? 'মূল অভিযোগ-আর-নেই' : 'এই অভিযোগে যান'}
                            className="w-full text-left px-3 py-2.5 hover:bg-[#F7F8FA] transition lf-anim-up flex items-start gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-transparent border-0"
                            style={{ animationDelay: `${Math.min(idx * 30, 240)}ms` }}
                          >
                            <span
                              aria-hidden
                              className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${feedDotCls(ev)}`}
                            />
                            <span className="flex-1 min-w-0">
                              <span className="text-[11.5px] font-bold text-[#050505] block truncate">
                                {ev.sender}
                              </span>
                              <span className="text-[10.5px] text-[#65676B]">{feedEntryText(ev)}</span>
                            </span>
                            <time
                              dateTime={new Date(ev.at).toISOString()}
                              title={new Date(ev.at).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                              className="text-[9.5px] text-[#8A8D91] shrink-0 mt-0.5"
                            >
                              {relTimeBn(new Date(ev.at).toISOString())}
                            </time>
                          </button>
                        </li>
                      )
                    })}
                  </React.Fragment>
                ))}
              </ul>
            )}
            {feedFiltered.length > 12 && (
              <p className="px-3 py-1.5 text-[9.5px] text-[#8A8D91] bg-[#FAFBFC] border-t border-[#E4E6EB]">
                …আরও {bn(feedFiltered.length - 12)}টি পুরোনো কার্যক্রম
              </p>
            )}
          </div>
        )}
      </div>

      {/* session210 — স্টেল-অ্যালার্ট: ৩+ দিন-পুরাতন অমীমাংসিত; ক্লিকে নতুন-ট্যাব + পুরাতন-আগে-ক্রম */}
      {staleN > 0 && (
        <button
          type="button"
          onClick={() => {
            setTab('PENDING')
            setSortAsc(true)
          }}
          aria-label={`${bn(staleN)}টি অভিযোগ ৩ দিনের-বেশি ধরে অমীমাংসিত — পুরাতন-আগে ক্রমে দেখুন`}
          className="w-full flex items-center gap-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-800 rounded-[10px] px-3.5 py-2.5 text-[12px] font-bold text-left transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 lf-anim-fade"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" aria-hidden />
          <span>
            {bn(staleN)}টি অভিযোগ ৩+ দিন ধরে অমীমাংসিত — পুরাতন-আগে দেখতে ক্লিক করুন
          </span>
        </button>
      )}

      {/* তালিকা */}
      {loading ? (
        <div className="bg-white border border-[#CED0D4] rounded-[10px] p-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#006A4E]" />
        </div>
      ) : shown.length === 0 ? (
        <div className="bg-white border border-[#CED0D4] rounded-[10px] p-10 text-center">
          {filtersActive ? (
            <>
              <XCircle className="w-8 h-8 text-[#CED0D4] mx-auto mb-2" aria-hidden />
              <p className="text-sm text-[#65676B]">ফিল্টার-শর্তে কোনো অভিযোগ মেলেনি</p>
              <p className="text-[11px] text-[#8A8D91] mt-1">অনুসন্ধান/মিডিয়া/তারিখ-ফিল্টার বদলে বা রিসেট করে আবার চেষ্টা করুন</p>
            </>
          ) : (
            <>
              <ShieldCheck className="w-8 h-8 text-[#CED0D4] mx-auto mb-2" aria-hidden />
              <p className="text-sm text-[#65676B]">{STATUS_LABEL[tab]} স্টেটাসে কোনো অভিযোগ নেই</p>
              <p className="text-[11px] text-[#8A8D91] mt-1">
                সাপোর্ট-চ্যাটে নতুন অভিযোগ এলে এখানে লাইভ দেখা যাবে
              </p>
            </>
          )}
        </div>
      ) : (
        <div className={density === 'compact' ? 'space-y-2' : 'space-y-3'}>
          {/* session206 — সম্পূর্ণ-নির্বাচন বার (বাল্ক-মোডে) */}
          <div className="flex items-center justify-between gap-2 bg-white border border-[#CED0D4] rounded-[8px] px-3 py-2 shadow-2xs">
            <label className="flex items-center gap-2 text-[11px] font-bold text-[#4B4C4F] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allShownSelected}
                onChange={() =>
                  setSelected(allShownSelected ? [] : shown.map((r) => r.id))
                }
                aria-label={allShownSelected ? 'নির্বাচন সরান' : 'দেখানো সব অভিযোগ নির্বাচন করুন'}
                className="w-4 h-4 accent-[#006A4E] cursor-pointer"
              />
              সব নির্বাচন ({bn(shown.length)})
            </label>
            {selected.length > 0 && (
              <span className="text-[10.5px] text-[#006A4E] font-extrabold" role="status">
                {bn(selected.length)}টি নির্বাচিত
              </span>
            )}
          </div>
          {shown.map((r, i) => (
            <article
              key={r.id}
              data-report={r.id}
              aria-current={cursorIdx === i || undefined}
              className={`bg-white border rounded-[10px] ${density === 'compact' ? 'p-2.5 space-y-2' : 'p-4 space-y-3'} shadow-2xs border-l-4 transition-all hover:shadow-md lf-anim-fade ${
                heatAuraClass(r.createdAt, r.status)
              } ${
                selected.includes(r.id)
                  ? 'border-[#006A4E] ring-2 ring-[#006A4E]/20 ' + ACCENT[r.status]
                  : `border-[#CED0D4] ${ACCENT[r.status]}`
              } ${hlId === r.id ? 'ring-2 ring-[#F59E0B]/70 lf-anim-hl' : ''} ${
                cursorIdx === i && !selected.includes(r.id) && hlId !== r.id
                  ? 'ring-2 ring-[#006A4E]/60 shadow-md'
                  : ''
              }`}
            >
              {/* বাল্ক-নির্বাচন + প্রেরক-বার (session202: অ্যাভাটার + আপেক্ষিক-সময়) */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={selected.includes(r.id)}
                    onChange={() => toggleSelect(r.id)}
                    aria-label={`${r.senderName}-এর অভিযোগ নির্বাচন করুন`}
                    className="w-4 h-4 mt-1 accent-[#006A4E] cursor-pointer transition-transform active:scale-90 shrink-0"
                  />
                  <button
                    type="button"
                    onClick={(e) => openGlance(r.senderName, r.senderEmail, e.currentTarget)}
                    aria-label={`${r.senderName}-এর অভিযোগ-পরিসংখ্যান ঝলক খুলুন`}
                    title={`${r.senderName} — ঝলক দেখুন`}
                    style={{ backgroundColor: avatarColorFor(r.senderName) }}
                    className={`${density === 'compact' ? 'w-7 h-7' : 'w-8 h-8'} rounded-full text-white text-[12px] font-extrabold flex items-center justify-center shrink-0 select-none cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/50`}
                  >
                    {r.senderName.trim().charAt(0) || '?'}
                  </button>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={(e) => openGlance(r.senderName, r.senderEmail, e.currentTarget)}
                        className="hover:text-[#006A4E] hover:underline underline-offset-2 decoration-[#006A4E]/40 rounded cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/50"
                      >
                        {r.senderName}
                      </button>
                      {r.senderEmail && (
                        <span className="text-[10.5px] font-normal text-[#65676B]">
                          ({r.senderEmail})
                        </span>
                      )}
                    </p>
                    <p
                      className="text-[10.5px] text-[#65676B] mt-0.5"
                      title={new Date(r.createdAt).toLocaleString('bn-BD', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    >
                      {relTimeBn(r.createdAt)}
                    </p>
                    {(() => {
                      const ag = agingInfo(r.createdAt, r.status)
                      return ag ? (
                        <span
                          className={`mt-1 inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[9.5px] font-extrabold ${ag.cls}`}
                          title={`অভিযোগ-বয়স (SLA) — ${ag.label}`}
                        >
                          <Clock className="w-2.5 h-2.5" aria-hidden />
                          {ag.label}
                        </span>
                      ) : null
                    })()}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* session217 — পরে-দেখুন স্টার-টগল (কার্ড-প্রতি; localStorage-স্থায়ী) */}
                  <button
                    onClick={() => toggleLater(r.id)}
                    type="button"
                    aria-pressed={!!later[r.id]}
                    aria-label={
                      later[r.id]
                        ? `${r.senderName}-এর অভিযোগ থেকে পরে-দেখুন চিহ্ন সরান`
                        : `${r.senderName}-এর অভিযোগ পরে দেখার জন্য চিহ্নিত করুন`
                    }
                    title="পরে দেখুন (s)"
                    className={`p-1.5 rounded-[6px] border transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 ${
                      later[r.id]
                        ? 'bg-amber-50 border-amber-300 text-amber-500'
                        : 'bg-white border-[#CED0D4] text-[#8A8D91] hover:text-amber-500 hover:border-amber-300'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${later[r.id] ? 'fill-current' : ''}`} aria-hidden />
                  </button>
                  {TABS.filter((t) => t.key !== r.status).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => update(r.id, { status: t.key })}
                      disabled={busy === r.id}
                      className="px-2.5 py-1.5 rounded-[6px] text-[10.5px] font-bold border transition disabled:opacity-50 cursor-pointer bg-white border-[#CED0D4] hover:border-[#006A4E] hover:text-[#006A4E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40"
                      type="button"
                    >
                      → {STATUS_LABEL[t.key]}
                    </button>
                  ))}
                  {busy === r.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#006A4E]" />}
                </div>
              </div>

              {/* অভিযোগ-লেখা (session202: হোভার-কপি বাটন; session220: দীর্ঘ-লেখা ৪-লাইন-ফোল্ড + বিস্তার-টগল) */}
              <div className="relative group/msg">
                {(() => {
                  const isLong = r.messageText.length > 180 || r.messageText.split('\n').length > 4
                  const isOpen = !!msgOpen[r.id]
                  return (
                    <>
                      <p
                        className={`${density === 'compact' ? 'text-[12px] p-2' : 'text-[13px] p-3'} leading-relaxed whitespace-pre-wrap break-words bg-[#F7F8FA] border border-[#E4E6EB] rounded-[8px] pr-9 ${
                          isLong && !isOpen ? 'lf-clamp-4' : ''
                        }`}
                      >
                        {r.messageText}
                      </p>
                      {isLong && (
                        <button
                          onClick={() => setMsgOpen((p) => ({ ...p, [r.id]: !p[r.id] }))}
                          type="button"
                          aria-expanded={isOpen}
                          aria-label={
                            isOpen
                              ? 'অভিযোগের লেখা ছাঁটুন'
                              : 'অভিযোগের সম্পূর্ণ লেখা দেখুন'
                          }
                          title={isOpen ? 'লেখা ছাঁটুন' : 'সম্পূর্ণ লেখা দেখুন'}
                          className="mt-1 inline-flex items-center gap-1 text-[10px] font-extrabold text-[#006A4E] hover:underline underline-offset-2 cursor-pointer bg-transparent border-0 p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 rounded"
                        >
                          {isOpen ? '▲ ছাঁটুন' : '▼ আরও দেখুন'}
                        </button>
                      )}
                    </>
                  )
                })()}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => void copyLink(r)}
                    type="button"
                    aria-label="অভিযোগের শেয়ার-লিঙ্ক কপি করুন"
                    title="লিঙ্ক কপি (?report=…) — লিঙ্ক খুললে এ-কার্ডে স্ক্রল-হাইলাইট"
                    className="p-1.5 rounded-[6px] bg-white border border-[#E4E6EB] text-[#65676B] hover:text-[#006A4E] hover:border-[#006A4E]/50 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40"
                  >
                    {copiedLinkId === r.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden />
                    ) : (
                      <Link2 className="w-3.5 h-3.5" aria-hidden />
                    )}
                  </button>
                  <button
                    onClick={() => void copyMsg(r)}
                    type="button"
                    aria-label="অভিযোগের লেখা কপি করুন"
                    title="লেখা কপি"
                    className="p-1.5 rounded-[6px] bg-white border border-[#E4E6EB] text-[#65676B] hover:text-[#006A4E] hover:border-[#006A4E]/50 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40"
                  >
                    {copiedId === r.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden />
                    ) : (
                      <Copy className="w-3.5 h-3.5" aria-hidden />
                    )}
                  </button>
                </div>
              </div>

              {/* মিডিয়া-প্রিভিউ */}
              {r.mediaType !== 'TEXT' && r.mediaUrl && (
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-[6px] bg-[#F0F2F5] text-[#4B4C4F] border border-[#E4E6EB] flex items-center gap-1.5 shrink-0">
                    {r.mediaType === 'IMAGE' && <ImageIcon className="w-3 h-3" />}
                    {r.mediaType === 'AUDIO' && <Mic className="w-3 h-3" />}
                    {r.mediaType === 'VIDEO' && <Video className="w-3 h-3" />}
                    {r.mediaType}
                  </span>
                  <div className="min-w-0 flex-1">
                    {r.mediaType === 'IMAGE' && (
                      <button
                        type="button"
                        onClick={() => setLightbox(r.mediaUrl)}
                        className="p-0 border-0 bg-transparent cursor-zoom-in rounded-[8px] overflow-hidden block"
                        aria-label="ছবি বড় করে দেখুন"
                      >
                        <img
                          src={r.mediaUrl}
                          alt="অভিযোগের সংযুক্তি"
                          className="max-h-56 rounded-[8px] border border-[#E4E6EB] object-contain hover:opacity-90 transition"
                        />
                      </button>
                    )}
                    {r.mediaType === 'AUDIO' && (
                      <audio controls src={r.mediaUrl} className="w-full max-w-md" preload="none" />
                    )}
                    {r.mediaType === 'VIDEO' && (
                      <video
                        controls
                        src={r.mediaUrl}
                        className="max-h-64 rounded-[8px] border border-[#E4E6EB]"
                        preload="metadata"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* অ্যাডমিন-নোট (session215 — দ্রুত-টেমপ্লেট টগল + চিপ-রো) */}
              <div className="flex items-end gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label
                      htmlFor={`note-${r.id}`}
                      className="text-[10.5px] font-bold text-[#65676B]"
                    >
                      অ্যাডমিন-নোট (অভ্যন্তরীণ)
                    </label>
                    <button
                      type="button"
                      onClick={() => setTplOpenFor((v) => (v === r.id ? null : r.id))}
                      aria-expanded={tplOpenFor === r.id}
                      aria-label="দ্রুত-নোট টেমপ্লেট দেখান/লুকান"
                      title="প্রস্তুত-জবাব টেমপ্লেট — ক্লিকে নোটে যোগ হয়"
                      className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-extrabold border transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40 ${
                        tplOpenFor === r.id
                          ? 'bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/40'
                          : 'bg-white text-[#65676B] border-[#E4E6EB] hover:text-[#006A4E] hover:border-[#006A4E]/40'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" aria-hidden />
                      টেমপ্লেট
                    </button>
                  </div>
                  {tplOpenFor === r.id && (
                    <div className="flex items-center gap-1 flex-wrap mb-1.5 lf-anim-pop" role="group" aria-label="নোট-টেমপ্লেট তালিকা">
                      {NOTE_TEMPLATES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() =>
                            setNotes((p) => {
                              const cur = (p[r.id] ?? r.adminNote ?? '').trimEnd()
                              return { ...p, [r.id]: cur ? `${cur} ${t}` : t }
                            })
                          }
                          className="px-2 py-0.5 rounded-full text-[9.5px] font-bold border bg-[#F0F8F5] text-[#00523C] border-[#006A4E]/25 hover:border-[#006A4E]/60 hover:bg-[#E6F2EE] transition cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                  <textarea
                    id={`note-${r.id}`}
                    value={notes[r.id] ?? r.adminNote ?? ''}
                    onChange={(e) => setNotes((p) => ({ ...p, [r.id]: e.target.value }))}
                    rows={2}
                    maxLength={2000}
                    placeholder="ব্যবস্থা-গ্রহণ-নোট লিখুন..."
                    className="w-full text-[12px] bg-white border border-[#CED0D4] focus:border-[#006A4E] rounded-[8px] p-2.5 outline-none resize-y"
                  />
                </div>
                <button
                  onClick={() =>
                    update(r.id, { adminNote: notes[r.id] ?? r.adminNote ?? '' })
                  }
                  disabled={busy === r.id}
                  className="px-3.5 py-2 rounded-[8px] bg-[#006A4E] hover:bg-[#00523C] text-white text-[11px] font-bold transition disabled:opacity-50 shrink-0 cursor-pointer"
                  type="button"
                >
                  নোট সেভ
                </button>
              </div>

              {/* অ্যাকশন-ইতিহাস টাইমলাইন (session205) — নোট + স্টেটাস-বদল;
                  session208 — নোট-এন্ট্রি hover-সম্পাদনা/মুছে-ফেলা */}
              <ActionHistory
                entries={parseHistory(r.noteHistory)}
                reportId={r.id}
                busy={busy === r.id}
                onEdit={(idx, note) =>
                  patchHistory(
                    r.id,
                    { historyIndex: idx, action: 'edit-note', note },
                    'ইতিহাস-নোট সম্পাদিত · অভিযোগকারীকে নোটিফিকেশন পাঠানো হয়েছে',
                  )
                }
                onDelete={(idx, entry) =>
                  patchHistory(
                    r.id,
                    { historyIndex: idx, action: 'delete-note' },
                    'ইতিহাস-এন্ট্রি মুছে ফেলা হয়েছে · অভিযোগকারীকে নোটিফিকেশন পাঠানো হয়েছে',
                    { id: r.id, index: idx, entry },
                  )
                }
              />
            </article>
          ))}
        </div>
      )}

      {/* session206 — ফ্লোটিং বাল্ক-অ্যাকশন বার (নির্বাচন-সক্রিয় হলে slide-up) */}
      {selected.length > 0 && (
        <div
          role="toolbar"
          aria-label="বাল্ক-স্টেটাস অ্যাকশন"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-xl bg-[#050505] text-white rounded-[12px] shadow-2xl border border-[#3e4042] px-4 py-3 flex items-center justify-between gap-3 flex-wrap lf-anim-pop"
          style={{ animationDuration: '0.18s' }}
        >
          <div className="min-w-0">
            <p className="text-[12px] font-extrabold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#33d79f]" aria-hidden />
              {bn(selected.length)}টি নির্বাচিত
            </p>
            {bulkBusy && bulkProgress.total > 0 && (
              <div className="mt-1.5" aria-live="polite">
                <div className="h-1.5 w-40 bg-white/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#33d79f] rounded-full transition-all"
                    style={{ width: `${Math.round((bulkProgress.done / bulkProgress.total) * 100)}%` }}
                  />
                </div>
                <p className="text-[9.5px] text-[#b0b3b8] mt-0.5">
                  {bn(bulkProgress.done)}/{bn(bulkProgress.total)} সম্পন্ন...
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {TABS.filter((t) => t.key !== 'PENDING').map((t) => (
              <button
                key={t.key}
                onClick={() => bulkUpdate(t.key)}
                disabled={bulkBusy}
                type="button"
                className={`px-3 py-1.5 rounded-[8px] text-[11px] font-bold transition disabled:opacity-50 cursor-pointer flex items-center gap-1 ${
                  t.key === 'RESOLVED'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-sky-600 hover:bg-sky-500 text-white'
                }`}
              >
                {bulkBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '→'} {STATUS_LABEL[t.key]}
              </button>
            ))}
            <button
              onClick={() => setSelected([])}
              disabled={bulkBusy}
              type="button"
              aria-label="নির্বাচন বাতিল"
              title="নির্বাচন বাতিল"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition disabled:opacity-50 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {/* session214 — প্রেরক-ঝলক পপওভার (fixed-এনকর + backdrop/Esc-বন্ধ; z-চুক্তি: help z-[70]-এর নিচে) */}
      {glance &&
        (() => {
          const st = senderStats.get(glance.name)
          const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
          const vh = typeof window !== 'undefined' ? window.innerHeight : 800
          const left = Math.max(Math.min(glance.x, vw - 276), 12)
          const top = Math.max(Math.min(glance.y, vh - 272), 12)
          return (
            <>
              <div className="fixed inset-0 z-[60]" aria-hidden onClick={() => setGlance(null)} />
              <div
                ref={glanceRef}
                role="dialog"
                aria-label={`${glance.name}-এর অভিযোগ ঝলক`}
                tabIndex={-1}
                data-glance-open="1"
                style={{ left, top }}
                className="fixed z-[61] w-[264px] max-w-[calc(100vw-24px)] bg-white border border-[#CED0D4] rounded-[10px] shadow-lg p-3.5 space-y-2.5 lf-anim-pop focus:outline-none"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    style={{ backgroundColor: avatarColorFor(glance.name) }}
                    className="w-9 h-9 rounded-full text-white text-[13px] font-extrabold flex items-center justify-center shrink-0 select-none"
                  >
                    {glance.name.trim().charAt(0) || '?'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-extrabold text-[#050505] truncate">{glance.name}</p>
                    {glance.email && <p className="text-[10.5px] text-[#65676B] truncate">{glance.email}</p>}
                  </div>
                </div>
                {st ? (
                  <>
                    <div className="flex items-center gap-1.5 flex-wrap text-[10.5px] font-bold">
                      <span className="rounded-full bg-[#F0F2F5] px-2 py-0.5 text-[#4B4C4F]">মোট {bn(st.total)}টি</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 px-2 py-0.5">
                        <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        নতুন {bn(st.PENDING)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-800 px-2 py-0.5">
                        <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                        চলমান {bn(st.IN_PROGRESS)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 px-2 py-0.5">
                        <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        সমাধান {bn(st.RESOLVED)}
                      </span>
                    </div>
                    {Object.keys(st.media).length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {Object.entries(st.media).map(([mt, n]) => (
                          <span
                            key={mt}
                            className="inline-flex items-center gap-1 rounded-full bg-[#F0F2F5] px-1.5 py-px text-[9.5px] font-bold text-[#4B4C4F]"
                          >
                            {MEDIA_FILTER_ICON[mt]}
                            {MEDIA_FILTERS.find((m) => m.key === mt)?.label || mt} ×{bn(n)}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[10.5px] text-[#65676B]">
                      সর্বশেষ সক্রিয়তা: <span className="font-bold text-[#4B4C4F]">{relTimeBn(st.lastAt)}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(glance.name)
                        setGlance(null)
                        flash(`অনুসন্ধান-ফিল্টার: ${glance.name}`)
                      }}
                      className="w-full px-2.5 py-1.5 rounded-[6px] text-[11px] font-bold bg-[#006A4E] text-white hover:bg-[#005540] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40"
                    >
                      এ-প্রেরকের সব অভিযোগ দেখুন
                    </button>
                  </>
                ) : (
                  <p className="text-[11px] text-[#65676B]">পরিসংখ্যান পাওয়া যায়নি।</p>
                )}
              </div>
            </>
          )
        })()}

      {/* session212 — কীবোর্ড-শর্টকাট সহায়িকা (? ওভারলে; Esc/ব্যাকড্রপ-বন্ধ) */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 lf-anim-fade"
          onClick={() => setHelpOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="কীবোর্ড শর্টকাট সহায়িকা"
            onClick={(e) => e.stopPropagation()}
            className="lf-anim-pop bg-white border border-[#CED0D4] rounded-[14px] shadow-2xl max-w-sm w-full p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-extrabold text-[#050505] flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-[#006A4E]" aria-hidden />
                কীবোর্ড শর্টকাট
              </h2>
              <button
                onClick={() => setHelpOpen(false)}
                type="button"
                aria-label="সহায়িকা বন্ধ করুন"
                className="p-1.5 rounded-full text-[#65676B] hover:bg-[#F0F2F5] hover:text-[#050505] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40"
              >
                <X className="w-4 h-4" aria-hidden />
              </button>
            </div>
            <ul className="divide-y divide-[#F0F2F5] text-[12px]">
              {SHORTCUTS.map((s) => (
                <li key={s.keys.join('+')} className="flex items-center justify-between gap-3 py-2">
                  <span className="text-[#4B4C4F] font-medium">{s.desc}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    {s.keys.map((k) => (
                      <kbd key={k} className="lf-kbd">
                        {k}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-[10.5px] text-[#65676B]">
              টিপ: ইনপুট বা টেক্সট-এরিয়ায় লেখার-সময় শর্টকাট নিষ্ক্রিয় থাকে।
            </p>
          </div>
        </div>
      )}

      {/* session218 — কমান্ড-প্যালেট (Ctrl+K) — help-টায়ারে-যোগদান: backdrop z-[70] + panel z-[71];
          Esc/ব্যাকড্রপ-বন্ধ; ↑↓/Enter/সার্চ; সারি-স্টেজার = lf-anim-up (reduced-motion-সম্মানী) */}
      {cmdOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-[12vh] lf-anim-fade"
          onClick={() => setCmdOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="কমান্ড প্যালেট"
            onClick={(e) => e.stopPropagation()}
            className="lf-anim-pop bg-white border border-[#CED0D4] rounded-[14px] shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#F0F2F5] bg-gradient-to-r from-[#006A4E]/8 via-transparent to-transparent">
              <CommandIcon className="w-4 h-4 text-[#006A4E] shrink-0" aria-hidden />
              <input
                ref={cmdInputRef}
                value={cmdQuery}
                onChange={(e) => {
                  setCmdQuery(e.target.value)
                  setCmdIdx(0)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setCmdIdx((i) => Math.min(i + 1, Math.max(0, cmdItems.length - 1)))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setCmdIdx((i) => Math.max(i - 1, 0))
                  } else if (e.key === 'Enter') {
                    e.preventDefault()
                    const c = cmdItems[cmdIdx]
                    if (c) runCmd(c)
                  } else if (e.key === 'Escape') {
                    e.preventDefault()
                    setCmdOpen(false)
                  }
                }}
                role="combobox"
                aria-expanded="true"
                aria-controls="lf-cmd-list"
                aria-activedescendant={cmdItems[cmdIdx] ? `lf-cmd-${cmdItems[cmdIdx].id}` : undefined}
                placeholder="কমান্ড খুঁজুন — ট্যাব, ফিল্টার, প্রিসেট…"
                aria-label="কমান্ড অনুসন্ধান"
                className="flex-1 bg-transparent text-[13px] font-medium text-[#050505] placeholder:text-[#8A8D91] placeholder:font-normal focus:outline-none min-w-0"
              />
              <kbd className="lf-kbd" aria-hidden>
                Esc
              </kbd>
            </div>
            <ul
              id="lf-cmd-list"
              role="listbox"
              aria-label="কমান্ড তালিকা"
              className="lf-cmd-scroll max-h-[46vh] overflow-y-auto py-1.5"
            >
              {cmdItems.length === 0 ? (
                <li
                  role="option"
                  aria-selected="false"
                  aria-disabled="true"
                  className="px-4 py-8 text-center text-[12px] text-[#8A8D91]"
                >
                  কোনো কমান্ড মেলেনি — অন্য শব্দ চেষ্টা করুন
                </li>
              ) : (
                cmdItems.map((c, i) => (
                  <React.Fragment key={c.id}>
                    {(i === 0 || cmdItems[i - 1].group !== c.group) && (
                      <li
                        role="presentation"
                        className="px-4 pt-2.5 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-[#8A8D91] select-none"
                      >
                        {c.group}
                      </li>
                    )}
                    <li
                      id={`lf-cmd-${c.id}`}
                      role="option"
                      aria-selected={i === cmdIdx}
                      onMouseEnter={() => setCmdIdx(i)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => runCmd(c)}
                      style={{ animationDelay: `${Math.min(i, 10) * 16}ms` }}
                      className={`lf-anim-up flex items-center gap-2.5 mx-1.5 px-2.5 py-2 rounded-[8px] cursor-pointer transition-colors ${
                        i === cmdIdx ? 'bg-[#006A4E]/10 text-[#006A4E]' : 'text-[#4B4C4F]'
                      }`}
                    >
                      <c.icon
                        className={`w-3.5 h-3.5 shrink-0 ${i === cmdIdx ? 'text-[#006A4E]' : 'text-[#8A8D91]'}`}
                        aria-hidden
                      />
                      <span className="flex-1 text-[12.5px] font-medium truncate">{c.label}</span>
                      {c.keys && (
                        <span className="flex items-center gap-1 shrink-0">
                          {c.keys.map((k) => (
                            <kbd key={k} className="lf-kbd">
                              {k}
                            </kbd>
                          ))}
                        </span>
                      )}
                    </li>
                  </React.Fragment>
                ))
              )}
            </ul>
            <div className="flex items-center gap-3 px-4 py-2 border-t border-[#F0F2F5] bg-[#F7F8FA] text-[10px] font-bold text-[#8A8D91]">
              <span className="inline-flex items-center gap-1">
                <kbd className="lf-kbd" aria-hidden>
                  ↑↓
                </kbd>
                নেভিগেট
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="lf-kbd" aria-hidden>
                  Enter
                </kbd>
                চালান
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="lf-kbd" aria-hidden>
                  Esc
                </kbd>
                বন্ধ
              </span>
              <span className="ml-auto" aria-hidden>
                {bn(cmdItems.length)}টি কমান্ড
              </span>
            </div>
          </div>
        </div>
      )}

      {/* session219 — শিফট-হস্তান্তর সারসংক্ষেপ (Ctrl+Shift+H / টুলবার / প্যালেট) — help-টায়ার:
          backdrop z-[70] + panel z-[71]; Esc/ব্যাকড্রপ-বন্ধ + ফোকাস-ফেরত; কপি = clipboard-race;
          গ্রেডিয়েন্ট-হেডার + রঙ-কোডেড চিপ-সারি + পেস্ট-উপযোগী নির্বাচনযোগ্য প্যানেল; reduced-motion-সম্মানী */}
      {digestOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 lf-anim-fade"
          onClick={closeDigest}
          role="presentation"
        >
          <div
            ref={digestPanelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="শিফট-হস্তান্তর সারসংক্ষেপ"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                closeDigest()
              } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'h' || e.key === 'H')) {
                e.preventDefault()
                closeDigest()
              }
            }}
            className="lf-anim-pop bg-white border border-[#CED0D4] rounded-[14px] shadow-2xl w-full max-w-lg max-h-[86vh] overflow-y-auto focus:outline-none"
          >
            {/* গ্রেডিয়েন্ট-হেডার (প্যালেট-স্টাইল-চুক্তি-সামঞ্জস্য; sticky = লম্বা-সারসংক্ষেপেও-শিরোনাম-দৃশ্যমান) */}
            <div className="bg-gradient-to-r from-[#006A4E] to-[#0A7D5C] px-5 py-4 flex items-center gap-3 sticky top-0 z-10">
              <ClipboardList className="w-5 h-5 text-white shrink-0" aria-hidden />
              <div className="min-w-0">
                <h2 className="text-[14px] font-extrabold text-white leading-tight">শিফট-হস্তান্তর সারসংক্ষেপ</h2>
                <p className="text-[10.5px] text-white/80 font-medium">পরবর্তী দায়িত্বশীলের জন্য কপি-প্রস্তুত সারাংশ</p>
              </div>
              <span className="ml-auto shrink-0 text-[9.5px] font-bold text-white/90 border border-white/30 bg-white/10 rounded-full px-2 py-0.5" aria-hidden>
                স্বয়ংক্রিয়
              </span>
            </div>

            {/* পরিসংখ্যান-চিপ-সারি (স্টেটাস-রঙ-চুক্তি: নতুন=অ্যাম্বার, চলমান=নীল, সমাধান=এমারল্ড, স্টেল=লাল) */}
            <div className="px-5 pt-4" role="group" aria-label="পরিসংখ্যান চিপ">
              <div className="grid grid-cols-4 gap-2">
                <div className="rounded-[10px] border border-amber-200 bg-amber-50 px-2 py-2 text-center min-w-0">
                  <div className="text-[15px] font-extrabold text-amber-800 leading-none">{bn(digest.stats.pending)}</div>
                  <div className="mt-1 text-[9.5px] font-bold text-amber-700/90 truncate">নতুন</div>
                </div>
                <div className="rounded-[10px] border border-blue-200 bg-blue-50 px-2 py-2 text-center min-w-0">
                  <div className="text-[15px] font-extrabold text-blue-800 leading-none">{bn(digest.stats.progress)}</div>
                  <div className="mt-1 text-[9.5px] font-bold text-blue-700/90 truncate">চলমান</div>
                </div>
                <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-2 py-2 text-center min-w-0">
                  <div className="text-[15px] font-extrabold text-emerald-800 leading-none">{bn(digest.stats.resolved)}</div>
                  <div className="mt-1 text-[9.5px] font-bold text-emerald-700/90 truncate">সমাধান</div>
                </div>
                <div
                  className={`rounded-[10px] border px-2 py-2 text-center min-w-0 ${
                    digest.stats.stale > 0 ? 'border-red-200 bg-red-50' : 'border-[#E4E6EB] bg-[#F7F8FA]'
                  }`}
                >
                  <div className={`text-[15px] font-extrabold leading-none ${digest.stats.stale > 0 ? 'text-red-800' : 'text-[#65676B]'}`}>
                    {bn(digest.stats.stale)}
                  </div>
                  <div className={`mt-1 text-[9.5px] font-bold truncate ${digest.stats.stale > 0 ? 'text-red-700/90' : 'text-[#8A8D91]'}`}>স্টেল</div>
                </div>
              </div>
              {digest.stats.stale > 0 && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-[8px] px-2.5 py-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  <span>
                    {bn(digest.stats.stale)} টি অভিযোগ ৩+ দিন ধরে অমীমাংসিত{digest.stats.oldestOpenDays !== null ? ` · পুরোনোতম ${bn(digest.stats.oldestOpenDays)} দিন` : ''} — এ-শিফটে অগ্রাধিকার
                  </span>
                </div>
              )}
            </div>

            {/* পেস্ট-উপযোগী সারসংক্ষেপ-প্যানেল (নির্বাচনযোগ্য; lib handoverDigest = এক-উৎস) */}
            <div className="px-5 pt-3">
              <pre
                aria-label="সারসংক্ষেপ-লেখা (নির্বাচনযোগ্য)"
                className="whitespace-pre-wrap select-text bg-[#F7F8FA] border border-[#E4E6EB] rounded-[10px] px-3.5 py-3 text-[12px] leading-relaxed text-[#050505] font-medium"
              >
                {digestText}
              </pre>
            </div>

            {/* ফুটার-অ্যাকশন (কপি = race-প্যাটার্ন; বন্ধ = ফোকাস-ফেরত) */}
            <div className="px-5 py-4 flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => void copyDigest()}
                aria-label="সারসংক্ষেপ ক্লিপবোর্ডে কপি করুন"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11.5px] font-bold bg-[#006A4E] text-white hover:bg-[#005A42] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/50 shadow-sm"
              >
                <Copy className="w-3.5 h-3.5" aria-hidden />
                কপি করুন
              </button>
              <button
                type="button"
                onClick={closeDigest}
                aria-label="সারসংক্ষেপ বন্ধ করুন"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[11.5px] font-bold border bg-white text-[#65676B] border-[#CED0D4] hover:border-[#006A4E]/40 hover:text-[#006A4E] transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006A4E]/40"
              >
                বন্ধ
                <kbd className="lf-kbd" aria-hidden>
                  Esc
                </kbd>
              </button>
              <span className="ml-auto text-[10px] text-[#8A8D91] font-medium" aria-hidden>
                উৎস: লোডেড {bn(digest.stats.total)} টি অভিযোগ
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ছবি-লাইটবক্স (session202) — Esc/ব্যাকড্রপ-ক্লিকে বন্ধ */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="অভিযোগের ছবি — পূর্ণ-ভিউ"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-6 cursor-zoom-out lf-anim-fade"
        >
          <img
            src={lightbox}
            alt="অভিযোগের সংযুক্তি — পূর্ণ-ভিউ"
            className="max-h-[85vh] max-w-full rounded-[10px] shadow-2xl object-contain"
          />
          <button
            type="button"
            aria-label="বন্ধ করুন"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-[#050505] hover:bg-white transition cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>
      )}
    </div>
  )
}