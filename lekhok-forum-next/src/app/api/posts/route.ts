import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { sanitizePostHtml, isEmptyRichText } from '@/lib/sanitize'
import {
  fetchBookmarkedPostsPage,
  fetchPostsByAuthorPage,
  fetchPostsForFeedPage,
  fetchPostsForFollowingPage,
  fetchPostsForProfilePage,
  fetchPostsForGroupPage,
  fetchUserMedia,
  searchPostsPage,
  fetchFilteredPostsPage,
  type SerializedPost,
} from '@/lib/post-serializer'
import { canViewGroup } from '@/lib/group-data'
import { revalidatePath } from 'next/cache'
import { notify } from '@/lib/notify'

/* ─── পেজিনেশন ফেচার (একই সিগনেচার — feed/timeline/saved) ─── */
type PageFetcher = (currentUserId: string, cursor: string | null, take: number) => Promise<SerializedPost[]>

const fetcherByTab: Record<string, PageFetcher> = {
  timeline: (meId, cursor, take) => fetchPostsByAuthorPage(meId, meId, cursor, take),
  saved: (meId, cursor, take) => fetchBookmarkedPostsPage(meId, cursor, take),
  feed: (meId, cursor, take) => fetchPostsForFeedPage(meId, cursor, take),
  following: (meId, cursor, take) => fetchPostsForFollowingPage(meId, cursor, take),
}

/** GET /api/posts?tab=feed|timeline|saved&q=&cursor=&limit= — ফিড / টাইমলাইন / সেভ / সার্চ (কার্সর-পেজিনেশন) */
export async function GET(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'সেশন নেই' }, { status: 401 })

  /* সেভ-ব্যাজের জন্য হালকা কাউন্ট */
  if (req.nextUrl.searchParams.get('count') === 'saved') {
    const count = await db.bookmark.count({ where: { userId: me.id } })
    return NextResponse.json({ count })
  }

  /* Session J: "নতুন পোস্ট" পোলিং-এর হালকা কাউন্ট — after-এর পরে আমার কাছে দৃশ্যমান কতগুলো */
  if (req.nextUrl.searchParams.get('count') === 'new') {
    const afterRaw = req.nextUrl.searchParams.get('after') || ''
    const after = new Date(afterRaw)
    const pollTab = req.nextUrl.searchParams.get('tab') === 'following' ? 'following' : 'feed'
    if (Number.isNaN(after.getTime())) return NextResponse.json({ newCount: 0 })
    const base =
      pollTab === 'following'
        ? {
            authorId: { not: me.id },
            audience: { not: 'ONLY_ME' },
            author: { followers: { some: { followerId: me.id } } },
          }
        : { OR: [{ audience: { not: 'ONLY_ME' } }, { authorId: me.id }] }
    const newCount = await db.post.count({ where: { ...base, createdAt: { gt: after } } })
    return NextResponse.json({ newCount })
  }

  const tab = req.nextUrl.searchParams.get('tab') || 'feed'
  const q = req.nextUrl.searchParams.get('q') || ''
  const cursor = req.nextUrl.searchParams.get('cursor')
  const limitRaw = parseInt(req.nextUrl.searchParams.get('limit') || '', 10)
  const limit = Math.min(Math.max(Number.isNaN(limitRaw) ? 6 : limitRaw, 1), 30)

  /* session165: FeedFilterBar — type=ARTICLE|QA|EVENT · sort=LATEST|POPULAR (POPULAR-এ cursor=অফসেট-সংখ্যা) */
  const typeParam = req.nextUrl.searchParams.get('type') || ''
  const typeFilter = ['ARTICLE', 'QA', 'EVENT'].includes(typeParam) ? typeParam : null
  const sortParam = req.nextUrl.searchParams.get('sort') === 'POPULAR' ? 'POPULAR' : 'LATEST'

  /* সার্চ — কার্সর-পেজিনেশন সহ (Session F) */
  if (q.trim()) {
    const rows = await searchPostsPage(q, me.id, cursor, limit + 1)
    const hasMore = rows.length > limit
    const posts = hasMore ? rows.slice(0, limit) : rows
    return NextResponse.json({
      posts,
      hasMore,
      nextCursor: hasMore ? posts[posts.length - 1].id : null,
      me: { id: me.id, name: me.name },
    })
  }

  /* session165: FeedFilterBar-চালিত ফিল্টার্ড-ফিচ (feed/following-বেস · type · LATEST/POPULAR) */
  if (typeFilter || sortParam === 'POPULAR') {
    const offset =
      sortParam === 'POPULAR' && cursor && !Number.isNaN(parseInt(cursor, 10))
        ? Math.max(parseInt(cursor, 10), 0)
        : 0
    const rows = await fetchFilteredPostsPage(me.id, {
      base: tab === 'following' ? 'following' : 'feed',
      type: typeFilter,
      sort: sortParam,
      cursor: sortParam === 'POPULAR' ? null : cursor,
      offset,
      take: limit + 1,
    })
    const hasMore = rows.length > limit
    const posts = hasMore ? rows.slice(0, limit) : rows
    return NextResponse.json({
      posts,
      hasMore,
      nextCursor: hasMore
        ? sortParam === 'POPULAR'
          ? String(offset + posts.length)
          : posts[posts.length - 1].id
        : null,
      me: { id: me.id, name: me.name },
    })
  }

  const fetcherBase = fetcherByTab[tab] || fetcherByTab.feed

  /* Session K: tab=group&groupId= — গ্রুপ-ফিড (CLOSED হলে শুধু সদস্য) */
  if (tab === 'group') {
    const groupId = req.nextUrl.searchParams.get('groupId') || ''
    if (!groupId.trim() || !(await canViewGroup(groupId, me.id))) {
      return NextResponse.json({ posts: [], hasMore: false, nextCursor: null, locked: true })
    }
    const rows = await fetchPostsForGroupPage(groupId, me.id, cursor, limit + 1)
    const hasMore = rows.length > limit
    const posts = hasMore ? rows.slice(0, limit) : rows
    return NextResponse.json({
      posts,
      hasMore,
      nextCursor: hasMore ? posts[posts.length - 1].id : null,
      me: { id: me.id, name: me.name },
    })
  }

  /* Session I: tab=media&username= — প্রোফাইলের ছবি-গ্যালারি */
  if (tab === 'media') {
    const username = req.nextUrl.searchParams.get('username') || ''
    if (!username.trim()) return NextResponse.json({ media: [] })
    const user = await db.user.findUnique({
      where: { username: username.trim() },
      select: { id: true },
    })
    if (!user) return NextResponse.json({ media: [] })
    const media = await fetchUserMedia(user.id, me.id)
    return NextResponse.json({ media })
  }

  /* Session H: tab=profile&username= — নির্দিষ্ট লেখকের প্রোফাইল-টাইমলাইন */
  const rows =
    tab === 'profile'
      ? await (async () => {
          const username = req.nextUrl.searchParams.get('username') || ''
          if (!username.trim()) return []
          const user = await db.user.findUnique({
            where: { username: username.trim() },
            select: { id: true },
          })
          if (!user) return []
          return fetchPostsForProfilePage(user.id, me.id, cursor, limit + 1)
        })()
      : await fetcherBase(me.id, cursor, limit + 1)
  const hasMore = rows.length > limit
  const posts = hasMore ? rows.slice(0, limit) : rows

  return NextResponse.json({
    posts,
    hasMore,
    nextCursor: hasMore ? posts[posts.length - 1].id : null,
    me: { id: me.id, name: me.name },
  })
}

/** POST /api/posts — নতুন পোস্ট তৈরি (রিচ-টেক্সট + মিডিয়া + কোলাজ ক্রম) */
export async function POST(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'অননুমোদিত' }, { status: 401 })

  try {
    const body = await req.json()
    const {
      content,
      audience = 'PUBLIC',
      backgroundColor,
      feeling,
      location,
      taggedUsers,
      media = [],
      groupId,
      type,
    } = body

    const cleanContent = sanitizePostHtml(typeof content === 'string' ? content : '')
    const hasMedia = Array.isArray(media) && media.length > 0

    if (isEmptyRichText(cleanContent) && !hasMedia) {
      return NextResponse.json({ error: 'খালি পোস্ট প্রকাশ করা যায় না' }, { status: 400 })
    }

    const validAudience = ['PUBLIC', 'FRIENDS', 'ONLY_ME'].includes(audience)
      ? audience
      : 'PUBLIC'

    /* session165: পোস্ট-টাইপ (FeedFilterBar ক্যাটাগরি-পরিবার) */
    const validType = ['SOCIAL', 'ARTICLE', 'QA', 'EVENT'].includes(type) ? type : 'SOCIAL'

    /* Session K: গ্রুপ-পোস্ট — শুধু সদস্যরা গ্রুপে লিখতে পারবেন */
    let validGroupId: string | null = null
    if (groupId && typeof groupId === 'string') {
      const membership = await db.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId: me.id } },
        select: { id: true },
      })
      if (!membership) {
        return NextResponse.json(
          { error: 'এই গ্রুপে লেখার অনুমতি আপনার নেই' },
          { status: 403 }
        )
      }
      validGroupId = groupId
    }

    const newPost = await db.post.create({
      data: {
        content: cleanContent,
        audience: validAudience,
        type: validType,
        backgroundColor: backgroundColor || null,
        feeling: feeling || null,
        location: location || null,
        taggedUsers: taggedUsers || null,
        authorId: me.id,
        groupId: validGroupId,
        media: {
          create:
            hasMedia
              ? media.slice(0, 20).map((m: { url: string; type?: string; posterUrl?: string }, idx: number) => ({
                  url: String(m.url),
                  type: ['IMAGE', 'VIDEO', 'AUDIO'].includes(m.type || '') ? m.type : 'IMAGE',
                  posterUrl: m.posterUrl ? String(m.posterUrl) : null,
                  order: idx,
                }))
              : [],
        },
      },
      include: {
        author: true,
        media: true,
        reactions: { include: { user: { select: { name: true } } } },
        comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
      },
    })

    revalidatePath('/')

    // ট্যাগ করা ইউজারদের নোটিফিকেশন
    const tagIds = String(taggedUsers || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    for (const tagId of tagIds) {
      await notify({ actorId: me.id, recipientId: tagId, type: 'TAG', postId: newPost.id })
    }

    return NextResponse.json({ post: { id: newPost.id } }, { status: 201 })
  } catch (err) {
    console.error('Post create error:', err)
    return NextResponse.json({ error: 'পোস্ট তৈরি ব্যর্থ হয়েছে' }, { status: 500 })
  }
}
