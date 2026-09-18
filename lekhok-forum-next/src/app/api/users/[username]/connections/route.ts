import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

/**
 * GET /api/users/[username]/connections?type=followers|following (Session I)
 * ফলোয়ার/ফলোয়িং লিস্ট — প্রতি রোতে আমার ফলো-অবস্থা + follower-কাউন্ট।
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'সেশন নেই' }, { status: 401 })

  const { username } = await params
  const type = req.nextUrl.searchParams.get('type') === 'following' ? 'following' : 'followers'

  const user = await db.user.findUnique({
    where: { username },
    select: { id: true, name: true },
  })
  if (!user) return NextResponse.json({ error: 'লেখক পাওয়া যায়নি' }, { status: 404 })

  // লিস্ট: followers → যারা user-কে ফলো করে; following → যাদের user ফলো করে
  const rows =
    type === 'followers'
      ? await db.follow.findMany({
          where: { followingId: user.id },
          include: {
            follower: {
              select: {
                id: true,
                name: true,
                username: true,
                avatarUrl: true,
                bio: true,
                _count: { select: { followers: true, posts: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 200,
        })
      : await db.follow.findMany({
          where: { followerId: user.id },
          include: {
            following: {
              select: {
                id: true,
                name: true,
                username: true,
                avatarUrl: true,
                bio: true,
                _count: { select: { followers: true, posts: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 200,
        })

  // আমি কাদের ফলো করছি (এক কুয়েরিতে)
  const myFollowing = await db.follow.findMany({
    where: { followerId: me.id },
    select: { followingId: true },
  })
  const myFollowingSet = new Set(myFollowing.map((f) => f.followingId))

  const users = rows.map((r) => {
    const u = type === 'followers' ? r.follower : r.following
    return {
      id: u.id,
      name: u.name,
      username: u.username,
      avatarUrl: u.avatarUrl,
      bio: u.bio,
      postCount: u._count.posts,
      followerCount: u._count.followers,
      isFollowing: myFollowingSet.has(u.id),
      isSelf: u.id === me.id,
    }
  })

  return NextResponse.json({ type, total: users.length, users })
}
