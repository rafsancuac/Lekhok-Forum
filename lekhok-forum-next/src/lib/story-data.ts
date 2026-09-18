/** স্টোরি-সংক্রান্ত শেয়ারড টাইপ ও মেটা */

export interface FrontendStory {
  id: string
  mediaUrl: string | null
  text: string | null
  background: string | null
  createdAt: string
  expiresAt: string
  /** এই স্টোরি আমি (বর্তমান সেশন ইউজার) দেখেছি কি না */
  viewed: boolean
  /** শুধু নিজের স্টোরিতে থাকে */
  viewCount?: number
  /** Session J: শুধু নিজের স্টোরিতে — অপঠিত রিপ্লাই সংখ্যা */
  unreadReplies?: number
}

export interface StoryRing {
  author: { id: string; name: string; username: string; avatarUrl: string | null }
  stories: FrontendStory[]
  /** রিং-এর সব স্টোরি দেখা হয়ে গেছে কি না (ধূসর রিং) */
  allSeen: boolean
  isMe: boolean
}

/** টেক্সট-স্টোরির গ্রেডিয়েন্ট প্যালেট (globals.css-এ story-gradient-N ক্লাস) */
export const STORY_GRADIENTS: { key: string; label: string }[] = [
  { key: 'story-gradient-1', label: 'গোধূলি' },
  { key: 'story-gradient-2', label: 'গভীর রাত' },
  { key: 'story-gradient-3', label: 'কচুরিপানা' },
  { key: 'story-gradient-4', label: 'সূর্যাস্ত' },
  { key: 'story-gradient-5', label: 'নবান্ন' },
  { key: 'story-gradient-6', label: 'মেঘলা' },
]

const BN_DIGITS = '০১২৩৪৫৬৭৮৯'
function bnNum(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)])
}

/** স্টোরি কতক্ষণ আগে পোস্ট হয়েছে (বাংলা) */
export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'এইমাত্র'
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${bnNum(mins)} মিনিট`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${bnNum(hours)} ঘণ্টা`
  return `${bnNum(Math.floor(hours / 24))} দিন`
}

/** স্টোরির মেয়াদ আর কত বাকি (বাংলা) */
export function timeLeftBn(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now()
  if (ms <= 0) return 'মেয়াদ শেষ'
  const hours = Math.floor(ms / 3600_000)
  if (hours >= 1) return `${bnNum(hours)} ঘণ্টা বাকি`
  const mins = Math.max(1, Math.floor(ms / 60000))
  return `${bnNum(mins)} মিনিট বাকি`
}

/** বাংলা সংখ্যা ফরম্যাট (ভিউ-কাউন্ট ইত্যাদি) */
export function bnCount(n: number): string {
  return bnNum(n)
}
