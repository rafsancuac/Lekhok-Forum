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

/**
 * session219 — শিফট-হস্তান্তর সারসংক্ষেপ (পিওর-ফাংশন; ডেস্ক-ডায়ালগ + প্যালেট-কমান্ড + E2E এক-উৎস)।
 *
 * অপারেটর-সিরিজের ধারাবাহিকতা: ট্রায়াজ(s217) → স্মৃতি(s216) → গতি(s215) → প্যালেট(s218) → হস্তান্তর(s219)।
 * শিফট-বদলের-সময় এক-ক্লিকে বাংলা-সারসংক্ষেপ তৈরি — চ্যাট/ইমেইলে পেস্ট-উপযোগী প্লেইন-টেক্সট।
 *
 * গণনা-উৎস (সব ক্লায়েন্ট-সাইড, API-অস্পৃশ্য):
 *   • গণনা/মিডিয়া/শীর্ষ-প্রেরক — সরাসরি রিপোর্ট-ফিল্ড
 *   • গত-২৪ঘ-সমাধান ও গড়-সমাধান-সময় — noteHistory-তে সর্বশেষ status→RESOLVED টাইমস্ট্যাম্প
 *     (history-করাপ্ট/অনুপস্থিত → ওই-মেট্রিক বাদ — কখনো ব্যর্থ-হবে-না)
 *   • `now`-ইনজেকশন = ডিটারমিনিস্টিক ইউনিট-টেস্ট (task61-unit-চুক্তি)
 */
export interface DigestReport {
  id: string
  senderName: string
  mediaType: string
  status: StatusKey
  createdAt: string
  noteHistory?: string | null
}

export interface DigestStats {
  total: number
  pending: number
  progress: number
  resolved: number
  stale: number
  oldestOpenDays: number | null
  fresh24: number
  resolvedToday: number
  avgResolveHours: number | null
  media: { TEXT: number; IMAGE: number; AUDIO: number; VIDEO: number }
  topSenders: { name: string; count: number }[]
}

/** noteHistory JSON → সর্বশেষ status→RESOLVED-টাইমস্ট্যাম্প (মিলি-সেকেন্ড) বা null */
function resolvedAtOf(raw: string | null | undefined): number | null {
  if (!raw) return null
  let arr: HistoryEntryLike[] = []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) arr = parsed as HistoryEntryLike[]
  } catch {
    return null
  }
  let last: number | null = null
  for (const e of arr) {
    if (e && e.t === 'status' && e.to === 'RESOLVED' && e.at) {
      const t = new Date(e.at).getTime()
      if (!Number.isNaN(t)) last = last === null ? t : Math.max(last, t)
    }
  }
  return last
}

export function handoverDigest(reports: DigestReport[], now: number = Date.now()): { lines: string[]; stats: DigestStats } {
  const media = { TEXT: 0, IMAGE: 0, AUDIO: 0, VIDEO: 0 }
  const senders = new Map<string, number>()
  let pending = 0
  let progress = 0
  let resolved = 0
  let stale = 0
  let oldestOpenDays: number | null = null
  let fresh24 = 0
  let resolvedToday = 0
  const resolveDurations: number[] = []

  for (const r of reports) {
    const m = (r.mediaType ?? 'TEXT') as keyof typeof media
    if (m in media) media[m]++
    if (r.status === 'PENDING') pending++
    else if (r.status === 'IN_PROGRESS') progress++
    else resolved++
    const sender = (r.senderName || '').trim() || 'অজানা'
    senders.set(sender, (senders.get(sender) ?? 0) + 1)

    const created = new Date(r.createdAt).getTime()
    if (!Number.isNaN(created)) {
      const ageH = (now - created) / 3600e3
      if (r.status === 'RESOLVED') {
        const rat = resolvedAtOf(r.noteHistory)
        if (rat !== null) {
          if (now - rat < 864e5) resolvedToday++
          const durH = (rat - created) / 3600e3
          if (durH >= 0) resolveDurations.push(durH)
        }
      } else {
        if (ageH < 24) fresh24++
        if (ageH >= 72) {
          stale++
          const days = Math.floor(ageH / 24)
          if (oldestOpenDays === null || days > oldestOpenDays) oldestOpenDays = days
        }
      }
    }
  }

  const avgResolveHours =
    resolveDurations.length > 0
      ? Math.round((resolveDurations.reduce((a, b) => a + b, 0) / resolveDurations.length) * 10) / 10
      : null
  const topSenders = [...senders.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'bn'))
    .slice(0, 3)
  const total = reports.length
  const resolvePct = total > 0 ? Math.round((resolved / total) * 100) : 0

  const stamp = new Date(now).toLocaleString('bn-BD', { dateStyle: 'short', timeStyle: 'short' })
  const lines: string[] = []
  lines.push(`শিফট-হস্তান্তর সারসংক্ষেপ — ${stamp}`)
  lines.push(`অভিযোগ: মোট ${bn(total)} · নতুন ${bn(pending)} · চলমান ${bn(progress)} · সমাধান ${bn(resolved)}`)
  if (stale > 0)
    lines.push(
      `স্টেল (৩+ দিন অমীমাংসিত): ${bn(stale)} টি${oldestOpenDays !== null ? ` · পুরোনোতম ${bn(oldestOpenDays)} দিন ধরে` : ''}`,
    )
  else lines.push('স্টেল (৩+ দিন অমীমাংসিত): নেই ✓')
  lines.push(`গত ২৪ ঘণ্টায়: নতুন ${bn(fresh24)} টি · সমাধান ${bn(resolvedToday)} টি`)
  if (avgResolveHours !== null)
    lines.push(`গড় সমাধান-সময়: ${bn(avgResolveHours)} ঘণ্টা (${bn(resolveDurations.length)} টির-উপর-গড়)`)
  lines.push(`মিডিয়া: লেখা ${bn(media.TEXT)} · ছবি ${bn(media.IMAGE)} · অডিও ${bn(media.AUDIO)} · ভিডিও ${bn(media.VIDEO)}`)
  lines.push(
    topSenders.length > 0
      ? `শীর্ষ প্রেরক: ${topSenders.map((s) => `${s.name} (${bn(s.count)})`).join(', ')}`
      : 'শীর্ষ প্রেরক: —',
  )
  lines.push(`সমাধান-হার: ${bn(resolvePct)}%`)

  return {
    lines,
    stats: {
      total,
      pending,
      progress,
      resolved,
      stale,
      oldestOpenDays,
      fresh24,
      resolvedToday,
      avgResolveHours,
      media,
      topSenders,
    },
  }
}
