import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

/** GET /api/users/[username] — প্রোফাইল ইনফো + স্ট্যাটস + ফলো-অবস্থা (Session H) */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'সেশন নেই' }, { status: 401 })

  const { username } = await params

  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      coverUrl: true,
      bio: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  })

  if (!user) return NextResponse.json({ error: 'লেখক পাওয়া যায়নি' }, { status: 404 })

  const [reactions, isFollowing] = await Promise.all([
    db.postReaction.count({ where: { post: { authorId: user.id } } }),
    db.follow.findUnique({
      where: { followerId_followingId: { followerId: me.id, followingId: user.id } },
      select: { id: true },
    }),
  ])

  return NextResponse.json({
    profile: {
      id: user.id,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      coverUrl: user.coverUrl,
      bio: user.bio,
      createdAt: user.createdAt.toISOString(),
      stats: {
        posts: user._count.posts,
        followers: user._count.followers,
        following: user._count.following,
        reactions,
      },
      isFollowing: Boolean(isFollowing),
      isSelf: user.id === me.id,
    },
  })
}
