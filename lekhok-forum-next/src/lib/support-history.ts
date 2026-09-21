/**
 * session210 (Task 61) — রিভিউ-ডেস্ক অপারেশনস-হেল্পার (পিওর-ফাংশন, রিঅ্যাক্ট-মুক্ত)
 *
 * দুটি দায়িত্ব:
 *  1) historySummaryBn() — noteHistory JSON → কমপ্যাক্ট বাংলা অডিট-সারি (CSV-র "ইতিহাস" কলাম)
 *     Task60-বাকি-প্রস্তাব-④: CSV-এক্সপোর্টে অ্যাকশন-ইতিহাস যুক্ত — স্প্রেডশিটেই জবাবদিহিতা-ট্রেইল।
 *  2) agingInfo() — নতুন/চলমান অভিযোগের বয়স-SLA টিয়ার (কার্ড-চিপ + স্টেল-অ্যালার্ট-বার)।
 *
 * পিওর-ফাংশন রাখার কারণ: QA-তে bun-দিয়ে সরাসরি ইউনিট-টেস্ট করা যায় (task61-qa.sh) —
 * UI-ছাড়াই CSV-ম্যাপিং ও SLA-টিয়ার-লজিক যাচাই; একই-ফাংশন UI ও CSV দু-জায়গায় ব্যবহার হয়
 * (এক-উৎস-সত্য — ডেস্ক-চিপ আর CSV-কলাম কখনো ভিন্ন-গণনা দেখাবে-না)।
 */
import { bn } from './format'

export type StatusKey = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'

/** স্টেটাস-লেবেল (page.tsx-এর STATUS_LABEL-এর সাথে সমস্বর — lib-এ ডুপ্লিকেট দরকার CSV-ব্রাউজার-বহির্ভূত টেস্টের জন্য) */
export const STATUS_LABEL_BN: Record<StatusKey, string> = {
  PENDING: 'নতুন',
  IN_PROGRESS: 'চলমান',
  RESOLVED: 'সমাধান',
}

/** ইতিহাস-এন্ট্রি (noteHistory JSON-এর আকৃতি — session205/208/209 চুক্তি) */
interface HistoryEntryLike {
  t?: string
  note?: string
  from?: string
  to?: string
  at?: string
  by?: string
  editedAt?: string
}

/** তারিখ → সংক্ষিপ্ত বাংলা স্ট্যাম্প (CSV-সেলে পাঠযোগ্য); পার্স-ব্যর্থে খালি */
function shortStamp(iso: string | undefined): string {
  if (!iso) return ''
  const t = new Date(iso)
  if (Number.isNaN(t.getTime())) return ''
  return t.toLocaleString('bn-BD', { dateStyle: 'short', timeStyle: 'short' })
}

/**
 * noteHistory JSON → এক-লাইন অডিট-সারি।
 * ফরম্যাট: স্টেটাস: নতুন→চলমান (১৬/৯/২৬, ১৪:৩০ — নুসরাত); জবাব: "..." (…); [সম্পাদিত]-মার্কার
 * করাপ্ট/অনুপস্থিত JSON → '' (CSV-সেল খালি থাকবে — এক্সপোর্ট কখনো ব্যর্থ-হবে-না)।
 * নোট-টেক্সট সীমা ১২০-অক্ষর (কমপ্যাক্ট-অডিট; পূর্ণ-নোট "অ্যাডমিন-নোট" কলামেই আছে)।
 */
export function historySummaryBn(raw: string | null | undefined): string {
  if (!raw) return ''
  let arr: HistoryEntryLike[] = []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) arr = parsed as HistoryEntryLike[]
  } catch {
    return ''
  }
  const parts: string[] = []
  for (const e of arr) {
    if (!e || typeof e !== 'object') continue
    const at = shortStamp(e.at)
    const by = e.by ? ` — ${String(e.by).slice(0, 60)}` : ''
    if (e.t === 'status') {
      const from = STATUS_LABEL_BN[(e.from as StatusKey) ?? 'PENDING'] ?? e.from ?? '?'
      const to = STATUS_LABEL_BN[(e.to as StatusKey) ?? 'PENDING'] ?? e.to ?? '?'
      parts.push(`স্টেটাস: ${from}→${to} (${at}${by})`)
    } else if (e.t === 'note') {
      const note = (typeof e.note === 'string' ? e.note : '').replace(/\s+/g, ' ').trim()
      const clipped = note.length > 120 ? `${note.slice(0, 120)}…` : note
      const edited = e.editedAt ? ' [সম্পাদিত]' : ''
      parts.push(`জবাব: "${clipped}" (${at}${by})${edited}`)
    }
  }
  return parts.join('; ')
}

/** SLA-টিয়ার-রঙ (টেইলউইন্ড-ক্লাস — ডেস্ক-চিপে ব্যবহৃত) */
export interface Aging {
  days: number
  label: string
  cls: string
  tier: 'fresh' | 'aging' | 'stale'
}

/**
 * বয়স-SLA: নতুন/চলমান অভিযোগ কতক্ষণ-ধরে ঝুলে-আছে।
 *   fresh  (<২৪ ঘণ্টা)  → সবুজ  "আজকের"
 *   aging  (১-২ দিন)    → অ্যাম্বার "X দিন ধরে"
 *   stale  (৩+ দিন)     → লাল    "X দিন ধরে"
 * RESOLVED → null (সমাধান-হলে বয়স-চিপ অপ্রাসঙ্গিক)।
 */
export function agingInfo(iso: string, status: StatusKey): Aging | null {
  if (status === 'RESOLVED') return null
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return null
  const hours = Math.floor((Date.now() - t) / 3600e3)
  if (hours < 0) return { days: 0, label: 'আজকের', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200', tier: 'fresh' }
  if (hours < 24) return { days: 0, label: 'আজকের', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200', tier: 'fresh' }
  const days = Math.floor(hours / 24)
  if (days < 3)
    return { days, label: `${bn(days)} দিন ধরে`, cls: 'text-amber-700 bg-amber-50 border-amber-200', tier: 'aging' }
  return { days, label: `${bn(days)} দিন ধরে`, cls: 'text-red-700 bg-red-50 border-red-200', tier: 'stale' }
}

/** স্টেল-সংখ্যা: ৩+ দিন-পুরাতন অমীমাংসিত (নতুন+চলমান) অভিযোগ — অ্যালার্ট-বারের কাউন্ট */
export function staleCount(reports: { createdAt: string; status: StatusKey }[]): number {
  const cutoff = Date.now() - 3 * 864e5
  return reports.filter((r) => r.status !== 'RESOLVED' && new Date(r.createdAt).getTime() < cutoff).length
}
