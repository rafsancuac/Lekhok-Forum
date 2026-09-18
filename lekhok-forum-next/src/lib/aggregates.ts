import { db } from '@/lib/db'
import { excerpt } from '@/lib/notify'

/**
 * session160 — সাইট-এনালিটিক্স এগ্রিগেট (ইউজার-স্পেক: ১৫-মিনিটের ব্যাকগ্রাউন্ড-ক্রন)
 *
 * ভারী হিসাব (৭-দিনের এনগেজমেন্ট-স্কোর, আলোচিত-পোস্ট র‍্যাঙ্কিং, লেডারবোর্ড) এখানে
 * একবার হিসেবে ইন-মেমরি ক্যাশে থাকে; ক্রন-জব নিয়মিত রিফ্রেশ করে, সাধারণ-রিকোয়েস্ট
 * শুধু ক্যাশ পড়ে → ফিড/রেলে ভারী-কুয়েরি লেগ শূন্য।
 */

export const TRENDING_WINDOW_DAYS = 7
export const TRENDING_POST_LIMIT = 10
export const LEADERBOARD_LIMIT = 5

export interface TrendingPost {
  id: string
  excerpt: string
  score: number
  reactions: number
  comments: number
  bookmarks: number
  author: { name: string; username: string; avatarUrl: string | null }
}

export interface TrendingAuthor {
  id: string
  name: string
  username: string
  avatarUrl: string | null
  score: number
  postCount: number
}

export interface Aggregates {
  computedAt: string
  windowDays: number
  posts: TrendingPost[]
  authors: TrendingAuthor[]
}

/* ইন-মেমরি ক্যাশ (একক-ইনস্ট্যান্স ডেপ্লয়) */
let cache: { at: number; data: Aggregates } | null = null

/** ৭-দিনের এনগেজমেন্ট-স্কোর হিসাব — রিঅ্যাকশন×১ + কমেন্ট×২ + বুকমার্ক×৩ */
export async function computeAggregates(): Promise<Aggregates> {
  const since = new Date(Date.now() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000)

  const posts = await db.post.findMany({
    where: { createdAt: { gte: since }, audience: 'PUBLIC' },
    select: {
      id: true,
      content: true,
      author: { select: { name: true, username: true, avatarUrl: true } },
      _count: { select: { reactions: true, comments: true, bookmarks: true } },
    },
  })

  const scored = posts.map((p) => {
    const reactions = p._count.reactions
    const comments = p._count.comments
    const bookmarks = p._count.bookmarks
    const score = reactions + comments * 2 + bookmarks * 3
    const trending: TrendingPost = {
      id: p.id,
      excerpt: excerpt(p.content, 72) || '(মিডিয়া-পোস্ট)',
      score,
      reactions,
      comments,
      bookmarks,
      author: p.author,
    }
    return trending
  })

  scored.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))

  // লেডারবোর্ড — লেখক-ভিত্তিক স্কোর-সমষ্টি
  const byAuthor = new Map<string, TrendingAuthor>()
  for (const p of scored) {
    const cur = byAuthor.get(p.author.username)
    if (cur) {
      cur.score += p.score
      cur.postCount += 1
    } else {
      byAuthor.set(p.author.username, {
        id: p.id, // প্রথম-আলোচিত-পোস্টের আইডি (নেভিগেশনে কাজে লাগবে)
        name: p.author.name,
        username: p.author.username,
        avatarUrl: p.author.avatarUrl,
        score: p.score,
        postCount: 1,
      })
    }
  }
  const authors = Array.from(byAuthor.values())
    .sort((a, b) => b.score - a.score || a.username.localeCompare(b.username))
    .slice(0, LEADERBOARD_LIMIT)

  return {
    computedAt: new Date().toISOString(),
    windowDays: TRENDING_WINDOW_DAYS,
    posts: scored.slice(0, TRENDING_POST_LIMIT),
    authors,
  }
}

/** ক্যাশড এগ্রিগেট — ঠান্ডা হলে (বা maxAge পেরোলে) চাহিদামতো হিসাব */
export async function getAggregates(maxAgeMs = 15 * 60 * 1000): Promise<Aggregates> {
  if (!cache || Date.now() - cache.at > maxAgeMs) {
    const data = await computeAggregates()
    cache = { at: Date.now(), data }
    return data
  }
  return cache.data
}

/** ক্রন-জবের জন্য জোর-করে রিফ্রেশ + সামারি-রিটার্ন */
export async function refreshAggregates(): Promise<Aggregates> {
  const data = await computeAggregates()
  cache = { at: Date.now(), data }
  return data
}
