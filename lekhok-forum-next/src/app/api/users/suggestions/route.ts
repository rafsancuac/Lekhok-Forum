import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'

/**
 * GET /api/users/suggestions (Session I)
 * ফলো-সাজেশন — আমি যাদের ফলো করি না, সবচেয়ে বেশি অনুসারী + পোস্ট আগে।
 * mutualFollowers: সাজেশন-ইউজারকে আমার ফলো করা কেউ ফলো করলে সেই নাম (টপ ২)।
 */
export async function GET(_req: NextRequest) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'সেশন নেই' }, { status: 401 })

  const myFollowing = await db.follow.findMany({
    where: { followerId: me.id },
    select: { followingId: true },
  })
  const excludedIds = [me.id, ...myFollowing.map((f) => f.followingId)]

  const candidates = await db.user.findMany({
    where: { id: { notIn: excludedIds } },
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      _count: { select: { followers: true, posts: true } },
      followers: {
        select: {
          follower: { select: { id: true, name: true, avatarUrl: true, username: true } },
        },
      },
    },
    orderBy: [{ followers: { _count: 'desc' } }, { posts: { _count: 'desc' } }],
    take: 6,
  })

  // আমার ফলোয়িং-সেট (mutual হিসাবে)
  const myFollowingFull = await db.follow.findMany({
    where: { followerId: me.id },
    include: { following: { select: { id: true, name: true, avatarUrl: true, username: true } } },
  })
  const myFollowingById = new Map(myFollowingFull.map((f) => [f.following.id, f.following]))

  const users = candidates.map((u) => {
    // এই সাজেশন-ইউজারকে যারা ফলো করে, তাদের মধ্যে আমার ফলোয়িং কে আছে
    const mutuals = u.followers
      .map((f) => f.follower)
      .filter((f) => myFollowingById.has(f.id))
      .slice(0, 2)
      .map((f) => ({ name: f.name, username: f.username, avatarUrl: f.avatarUrl }))
    return {
      id: u.id,
      name: u.name,
      username: u.username,
      avatarUrl: u.avatarUrl,
      bio: u.bio,
      followerCount: u._count.followers,
      postCount: u._count.posts,
      mutuals,
    }
  })

  return NextResponse.json({ users })
}
