import { db } from '@/lib/db'
import { Post, Comment, User, MediaAttachment, Prisma } from '@prisma/client'

export type SerializedComment = {
  id: string
  content: string
  createdAt: string
  updatedAt?: string
  parentId: string | null
  author: { id: string; name: string; username: string; avatarUrl: string | null }
  reactionCounts: Record<string, number>
  reactionTotal: number
  myReaction: string | null
  replies: SerializedComment[]
}

export type SerializedPost = {
  id: string
  content: string
  audience: string
  type: string
  backgroundColor: string | null
  feeling: string | null
  location: string | null
  taggedUsers: string | null
  shares: number
  createdAt: string
  author: { id: string; name: string; username: string; avatarUrl: string | null }
  group: { id: string; name: string; privacy: string } | null
  media: { id: string; url: string; type: string; order: number; posterUrl: string | null }[]
  reactionCounts: Record<string, number>
  reactionTotal: number
  myReaction: string | null
  myBookmark: boolean
  reactionUsers: { name: string; type: string }[]
  commentCount: number
  comments: SerializedComment[]
}

export const REACTION_TYPES = ['LIKE', 'LOVE', 'CARE', 'HAHA', 'WOW', 'SAD', 'ANGRY'] as const

type PostReactionRow = {
  type: string
  user: { name: string }
  userId: string
}

type CommentRow = Comment & {
  author: User
  reactions: { userId: string; type: string }[]
}

type PostWithRelations = Post & {
  author: User
  group: { id: string; name: string; privacy: string } | null
  media: MediaAttachment[]
  reactions: PostReactionRow[]
  comments: CommentRow[]
  bookmarks: { userId: string }[]
}

export function serializePost(post: PostWithRelations, currentUserId: string): SerializedPost {
  const reactionCounts: Record<string, number> = {}
  let myReaction: string | null = null
  for (const r of post.reactions) {
    reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1
    if (r.userId === currentUserId) myReaction = r.type
  }
  const reactionTotal = post.reactions.length

  // শুধু টপ-লেভেল কমেন্ট, রিপ্লাই নেস্ট করা
  const topLevel = post.comments.filter((c) => !c.parentId)
  const repliesByParent = new Map<string, typeof post.comments>()
  for (const c of post.comments) {
    if (c.parentId) {
      const arr = repliesByParent.get(c.parentId) || []
      arr.push(c)
      repliesByParent.set(c.parentId, arr)
    }
  }

  const toComment = (c: CommentRow): SerializedComment => {
    const cCounts: Record<string, number> = {}
    let cMine: string | null = null
    for (const r of c.reactions) {
      cCounts[r.type] = (cCounts[r.type] || 0) + 1
      if (r.userId === currentUserId) cMine = r.type
    }
    return {
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      parentId: c.parentId,
      author: {
        id: c.author.id,
        name: c.author.name,
        username: c.author.username,
        avatarUrl: c.author.avatarUrl,
      },
      reactionCounts: cCounts,
      reactionTotal: c.reactions.length,
      myReaction: cMine,
      replies: (repliesByParent.get(c.id) || []).map(toComment),
    }
  }

  return {
    id: post.id,
    content: post.content,
    audience: post.audience,
    type: post.type,
    backgroundColor: post.backgroundColor,
    feeling: post.feeling,
    location: post.location,
    taggedUsers: post.taggedUsers,
    shares: post.shares,
    createdAt: post.createdAt.toISOString(),
    author: {
      id: post.author.id,
      name: post.author.name,
      username: post.author.username,
      avatarUrl: post.author.avatarUrl,
    },
    group: post.group
      ? { id: post.group.id, name: post.group.name, privacy: post.group.privacy }
      : null,
    media: post.media
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((m) => ({ id: m.id, url: m.url, type: m.type, order: m.order, posterUrl: m.posterUrl })),
    reactionCounts,
    reactionTotal,
    myReaction,
    myBookmark: post.bookmarks.some((b) => b.userId === currentUserId),
    reactionUsers: post.reactions
      .slice(0, 3)
      .map((r) => ({ name: r.user.name, type: r.type })),
    commentCount: post.comments.length,
    comments: topLevel
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(-5)
      .map(toComment),
  }
}

const POST_INCLUDE = {
  author: true,
  group: { select: { id: true, name: true, privacy: true } },
  media: true,
  reactions: { include: { user: { select: { name: true } } } },
  comments: {
    include: { author: true, reactions: { select: { userId: true, type: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
  bookmarks: { select: { userId: true } },
}

export async function fetchPostsForFeed(currentUserId: string, take = 30) {
  const posts = await db.post.findMany({
    where: {
      OR: [{ audience: { not: 'ONLY_ME' } }, { authorId: currentUserId }],
    },
    include: POST_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take,
  })
  return posts.map((p) => serializePost(p, currentUserId))
}

/* ─── কার্সর-পেজিনেশন (ইনফিনিট স্ক্রল) — Session D ─── */

async function fetchPage(
  where: Prisma.PostWhereInput,
  currentUserId: string,
  cursor: string | null,
  take: number
) {
  const posts = await db.post.findMany({
    where,
    include: POST_INCLUDE,
    orderBy: { createdAt: 'desc' as const },
    take,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })
  return posts.map((p) => serializePost(p, currentUserId))
}

export function fetchPostsForFeedPage(currentUserId: string, cursor: string | null, take = 6) {
  return fetchPage(
    { OR: [{ audience: { not: 'ONLY_ME' } }, { authorId: currentUserId }] },
    currentUserId,
    cursor,
    take
  )
}

/* ─── session165: FeedFilterBar — জনপ্রিয়-সর্ট (অফসেট-পেজিনেশন; রিয়্যাকশন+কমেন্ট+শেয়ার স্কোর) ─── */
async function fetchPagePopular(
  where: Prisma.PostWhereInput,
  currentUserId: string,
  take: number,
  offset: number
) {
  const posts = await db.post.findMany({
    where,
    include: POST_INCLUDE,
    orderBy: [
      { reactions: { _count: 'desc' } },
      { comments: { _count: 'desc' } },
      { shares: 'desc' },
      { createdAt: 'desc' },
    ],
    take,
    skip: offset,
  })
  return posts.map((p) => serializePost(p, currentUserId))
}

/**
 * session165: FeedFilterBar-চালিত ফিল্টার্ড-ফিচ —
 * base: feed|following · type: ARTICLE|QA|EVENT|null · sort: LATEST(কার্সর)|POPULAR(অফসেট)
 */
export function fetchFilteredPostsPage(
  currentUserId: string,
  opts: {
    base: 'feed' | 'following'
    type: string | null
    sort: 'LATEST' | 'POPULAR'
    cursor: string | null
    offset: number
    take: number
  }
) {
  const baseWhere: Prisma.PostWhereInput =
    opts.base === 'following'
      ? {
          authorId: { not: currentUserId },
          author: { is: { followers: { some: { followerId: currentUserId } } } },
          audience: { not: 'ONLY_ME' },
        }
      : { OR: [{ audience: { not: 'ONLY_ME' } }, { authorId: currentUserId }] }
  const where: Prisma.PostWhereInput = {
    AND: [baseWhere, ...(opts.type ? [{ type: opts.type }] : [])],
  }
  if (opts.sort === 'POPULAR') {
    return fetchPagePopular(where, currentUserId, opts.take, Math.max(opts.offset, 0))
  }
  return fetchPage(where, currentUserId, opts.cursor, opts.take)
}

export function fetchPostsByAuthorPage(authorId: string, currentUserId: string, cursor: string | null, take = 6) {
  return fetchPage({ authorId }, currentUserId, cursor, take)
}

/** প্রোফাইল-ভিউ (Session H) — অন্যের প্রোফাইলে ONLY_ME পোস্ট লিক হবে না */
export function fetchPostsForProfilePage(
  profileUserId: string,
  currentUserId: string,
  cursor: string | null,
  take = 6
) {
  return fetchPage(
    {
      authorId: profileUserId,
      OR: [{ audience: { not: 'ONLY_ME' } }, { authorId: currentUserId }],
    },
    currentUserId,
    cursor,
    take
  )
}

export function fetchBookmarkedPostsPage(currentUserId: string, cursor: string | null, take = 6) {
  return fetchPage({ bookmarks: { some: { userId: currentUserId } } }, currentUserId, cursor, take)
}

/** ফলোয়িং-ফিড (Session I) — যাদের অনুসরণ করছেন শুধু তাদের পোস্ট (ONLY_ME বাদ, নিজেরটাও বাদ) */
export function fetchPostsForFollowingPage(
  currentUserId: string,
  cursor: string | null,
  take = 6
) {
  return fetchPage(
    {
      authorId: { not: currentUserId },
      author: { is: { followers: { some: { followerId: currentUserId } } } },
      audience: { not: 'ONLY_ME' },
    },
    currentUserId,
    cursor,
    take
  )
}

/** গ্রুপ-ফিড (Session K) — নির্দিষ্ট গ্রুপের পোস্ট */
export function fetchPostsForGroupPage(
  groupId: string,
  currentUserId: string,
  cursor: string | null,
  take = 6
) {
  return fetchPage({ groupId }, currentUserId, cursor, take)
}

/** প্রোফাইল মিডিয়া-গ্যালারি (Session I) — লেখকের পোস্টের ছবিগুলো (এক্সক্লুসিভ ONLY_ME) */
export async function fetchUserMedia(
  profileUserId: string,
  currentUserId: string,
  take = 60
) {
  const posts = await db.post.findMany({
    where: {
      authorId: profileUserId,
      OR: [{ audience: { not: 'ONLY_ME' } }, { authorId: currentUserId }],
    },
    include: { media: true },
    orderBy: { createdAt: 'desc' as const },
    take: 100,
  })
  return posts.flatMap((p) =>
    p.media
      .filter((m) => m.type === 'IMAGE')
      .sort((a, b) => a.order - b.order)
      .map((m) => ({
        id: m.id,
        url: m.url,
        type: m.type,
        order: m.order,
        postId: p.id,
        postExcerpt: p.content.replace(/<[^>]+>/g, '').slice(0, 80),
      }))
  )
}

export async function fetchPostsByAuthor(authorId: string, currentUserId: string, take = 50) {
  const posts = await db.post.findMany({
    where: { authorId },
    include: POST_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take,
  })
  return posts.map((p) => serializePost(p, currentUserId))
}

/** সেভ করা পোস্ট (বুকমার্ক) */
export async function fetchBookmarkedPosts(currentUserId: string, take = 50) {
  const posts = await db.post.findMany({
    where: { bookmarks: { some: { userId: currentUserId } } },
    include: POST_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take,
  })
  return posts.map((p) => serializePost(p, currentUserId))
}

/** সার্চ (কার্সর-পেজিনেশন, Session F) — কনটেন্ট, অনুভূতি, লোকেশন বা লেখকের নামে */
export async function searchPostsPage(
  query: string,
  currentUserId: string,
  cursor: string | null,
  take = 12
) {
  const q = query.trim()
  if (!q) return []
  const posts = await db.post.findMany({
    where: {
      AND: [
        { OR: [{ audience: { not: 'ONLY_ME' } }, { authorId: currentUserId }] },
        {
          OR: [
            { content: { contains: q } },
            { feeling: { contains: q } },
            { location: { contains: q } },
            { author: { is: { name: { contains: q } } } },
          ],
        },
      ],
    },
    include: POST_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })
  return posts.map((p) => serializePost(p, currentUserId))
}
