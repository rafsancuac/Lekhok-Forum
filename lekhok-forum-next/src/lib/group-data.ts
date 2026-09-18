import { db } from '@/lib/db'

/** ক্লায়েন্ট-সাইড গ্রুপ টাইপ (Session K) */
export interface FrontendGroup {
  id: string
  name: string
  description: string | null
  coverUrl: string | null
  privacy: string // OPEN | CLOSED
  createdAt: string
  memberCount: number
  postCount: number
  isMember: boolean
  myRole: string | null // ADMIN | MEMBER | null
  isCreator: boolean
  creator: { id: string; name: string; username: string; avatarUrl: string | null }
  /** কভারে দেখানোর জন্য সদস্যদের অ্যাভাটার-স্ট্যাক (সর্বোচ্চ ৩) */
  coverMembers: { id: string; name: string; avatarUrl: string | null }[]
}

const GROUP_SELECT_BASE = {
  id: true,
  name: true,
  description: true,
  coverUrl: true,
  privacy: true,
  createdAt: true,
  creatorId: true,
  creator: { select: { id: true, name: true, username: true, avatarUrl: true } },
  _count: { select: { members: true, posts: true } },
} as const

type GroupRow = {
  id: string
  name: string
  description: string | null
  coverUrl: string | null
  privacy: string
  createdAt: Date
  creatorId: string
  creator: { id: string; name: string; username: string; avatarUrl: string | null }
  _count: { members: number; posts: number }
}

type MembershipRow = { role: string; user: { id: string; name: string; avatarUrl: string | null } }

function serializeGroup(
  g: GroupRow,
  myMembership: MembershipRow | null,
  coverMembers: MembershipRow[]
): FrontendGroup {
  return {
    id: g.id,
    name: g.name,
    description: g.description,
    coverUrl: g.coverUrl,
    privacy: g.privacy,
    createdAt: g.createdAt.toISOString(),
    memberCount: g._count.members,
    postCount: g._count.posts,
    isMember: !!myMembership,
    myRole: myMembership?.role ?? null,
    isCreator: g.creatorId === myMembership?.user.id,
    creator: g.creator,
    coverMembers: coverMembers.slice(0, 3).map((m) => ({
      id: m.user.id,
      name: m.user.name,
      avatarUrl: m.user.avatarUrl,
    })),
  }
}

/**
 * আমার গ্রুপ + আবিষ্কার (Session K):
 * - myGroups: সদস্য হিসেবে আছি, নতুন অনুযায়ী
 * - discover: সদস্য নই — সবচেয়ে বড় গ্রুপগুলো
 */
export async function fetchGroupsForUser(meId: string) {
  const [memberships, discoverRows] = await Promise.all([
    db.groupMember.findMany({
      where: { userId: meId },
      select: {
        groupId: true,
        role: true,
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { joinedAt: 'desc' as const },
      take: 50,
    }),
    db.group.findMany({
      where: { members: { none: { userId: meId } } },
      include: {
        creator: { select: { id: true, name: true, username: true, avatarUrl: true } },
        _count: { select: { members: true, posts: true } },
        members: {
          select: { role: true, user: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { joinedAt: 'asc' as const },
          take: 3,
        },
      },
      orderBy: [{ members: { _count: 'desc' } }, { createdAt: 'desc' }],
      take: 8,
    }),
  ])

  const myGroupIds = memberships.map((m) => m.groupId)
  const myRows = myGroupIds.length
    ? await db.group.findMany({
        where: { id: { in: myGroupIds } },
        include: {
          creator: { select: { id: true, name: true, username: true, avatarUrl: true } },
          _count: { select: { members: true, posts: true } },
          members: {
            select: { role: true, user: { select: { id: true, name: true, avatarUrl: true } } },
            orderBy: { joinedAt: 'asc' as const },
            take: 3,
          },
        },
        orderBy: { createdAt: 'desc' as const },
      })
    : []

  const myGroupRows = myGroupIds
    .map((gid) => myRows.find((g) => g.id === gid))
    .filter((g): g is NonNullable<typeof g> => !!g)

  const membershipByGroup = new Map(memberships.map((m) => [m.groupId, m]))

  const myGroups = myGroupRows.map((g) =>
    serializeGroup(g, membershipByGroup.get(g.id) ?? null, g.members)
  )
  const discover = discoverRows.map((g) => serializeGroup(g, null, g.members))

  return { myGroups, discover }
}

/** একক গ্রুপের বিস্তারিত (সদস্য-লিস্টসহ) */
export async function fetchGroupDetail(groupId: string, meId: string) {
  const group = await db.group.findUnique({
    where: { id: groupId },
    include: {
      creator: { select: { id: true, name: true, username: true, avatarUrl: true } },
      _count: { select: { members: true, posts: true } },
      members: {
        select: {
          role: true,
          joinedAt: true,
          user: { select: { id: true, name: true, username: true, avatarUrl: true, bio: true } },
        },
        orderBy: [{ role: 'asc' as const }, { joinedAt: 'asc' as const }],
        take: 24,
      },
    },
  })
  if (!group) return null

  const myMembership = await db.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: meId } },
    select: { role: true },
  })

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    coverUrl: group.coverUrl,
    privacy: group.privacy,
    createdAt: group.createdAt.toISOString(),
    memberCount: group._count.members,
    postCount: group._count.posts,
    isMember: !!myMembership,
    myRole: myMembership?.role ?? null,
    isCreator: group.creatorId === meId,
    creator: group.creator,
    members: group.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      username: m.user.username,
      avatarUrl: m.user.avatarUrl,
      bio: m.user.bio,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
    })),
  }
}

/** গ্রুপ-ফিড দৃশ্যমানতা: OPEN হলে সবাই, CLOSED হলে শুধু সদস্য */
export async function canViewGroup(groupId: string, meId: string): Promise<boolean> {
  const g = await db.group.findUnique({
    where: { id: groupId },
    select: { privacy: true, members: { where: { userId: meId }, select: { id: true } } },
  })
  if (!g) return false
  if (g.privacy === 'OPEN') return true
  return g.members.length > 0
}
