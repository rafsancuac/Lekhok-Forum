import { db } from '@/lib/db'

export type NotificationType =
  | 'REACTION'
  | 'COMMENT'
  | 'REPLY'
  | 'TAG'
  | 'SHARE'
  | 'STORY_REPLY'
  | 'FOLLOW'

export const VALID_NOTIF_TYPES: NotificationType[] = [
  'REACTION',
  'COMMENT',
  'REPLY',
  'TAG',
  'SHARE',
  'STORY_REPLY',
  'FOLLOW',
]

/**
 * নোটিফিকেশন তৈরি (নিজের কাজে নিজেকে নয়, মিউট-প্রেফারেন্স সম্মান + ডুপ্লিকেট থ্রটল সহ)
 * ব্যর্থ হলে সাইলেন্টলি পাস — মূল অ্যাকশন ব্লক করবে না।
 */
export async function notify(params: {
  actorId: string
  recipientId: string
  type: NotificationType
  postId?: string | null
  commentId?: string | null
  storyId?: string | null
}) {
  const { actorId, recipientId, type, postId, commentId, storyId } = params
  try {
    if (actorId === recipientId) return // নিজের কাজে নিজেকে নোটিফাই নয়

    // প্রাপক এই টাইপ মিউট করেছে কি না (Session F: প্রেফারেন্স)
    const recipient = await db.user.findUnique({
      where: { id: recipientId },
      select: { mutedNotifTypes: true },
    })
    const muted = (recipient?.mutedNotifTypes || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (muted.includes(type)) return

    // REACTION/SHARE/FOLLOW-এর ক্ষেত্রে ৫ মিনিটের মধ্যে একই অ্যাক্টর+পোস্ট+টাইপ থ্রটল
    if (type === 'REACTION' || type === 'SHARE' || type === 'FOLLOW') {
      const since = new Date(Date.now() - 5 * 60 * 1000)
      const dup = await db.notification.findFirst({
        where: { userId: recipientId, actorId, type, postId: postId ?? null, createdAt: { gte: since } },
      })
      if (dup) return
    }

    await db.notification.create({
      data: {
        userId: recipientId,
        actorId,
        type,
        postId: postId ?? null,
        commentId: commentId ?? null,
        storyId: storyId ?? null,
      },
    })
  } catch (err) {
    console.error('notify error:', err)
  }
}

/** পোস্ট কনটেন্ট থেকে ছোট এক্সসার্প্ট (নোটিফিকেশন প্রিভিউয়ের জন্য) */
export function excerpt(html: string, len = 80): string {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length > len ? text.slice(0, len) + '…' : text
}
