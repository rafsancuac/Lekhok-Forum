/** ক্লায়েন্ট-সাইড শেয়ারড টাইপ */

export interface FrontendUser {
  id: string
  name: string
  username: string
  avatarUrl: string | null
  coverUrl?: string | null
  bio?: string | null
  role?: string
}

/** প্রোফাইল-ভিউ ডেটা (Session H) — স্ট্যাটস + ফলো-অবস্থাসহ */
export interface FrontendProfile {
  id: string
  name: string
  username: string
  avatarUrl: string | null
  coverUrl: string | null
  bio: string | null
  createdAt: string
  stats: { posts: number; followers: number; following: number; reactions: number }
  isFollowing: boolean
  isSelf: boolean
}

export interface MediaItem {
  id: string
  url: string
  type: string // IMAGE | VIDEO | AUDIO
  posterUrl?: string | null // ভিডিও-পোস্টার (Session K)
  order?: number
}

/** গ্রুপ (Session K) — লিস্ট/কার্ডে ব্যবহৃত */
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
  myRole: string | null
  isCreator: boolean
  creator: { id: string; name: string; username: string; avatarUrl: string | null }
  coverMembers: { id: string; name: string; avatarUrl: string | null }[]
}

/** গ্রুপ বিস্তারিত (GroupDetail) */
export interface FrontendGroupDetail extends FrontendGroup {
  locked?: boolean
  members: {
    id: string
    name: string
    username: string
    avatarUrl: string | null
    bio: string | null
    role: string
    joinedAt: string
  }[]
}

export interface FrontendComment {
  id: string
  content: string
  createdAt: string
  updatedAt?: string
  parentId: string | null
  author: { id: string; name: string; username: string; avatarUrl: string | null }
  reactionCounts: Record<string, number>
  reactionTotal: number
  myReaction: string | null
  replies: FrontendComment[]
}

export interface FrontendNotification {
  id: string
  type: string // REACTION | COMMENT | REPLY | TAG | SHARE | STORY_REPLY
  read: boolean
  createdAt: string
  postId: string | null
  commentId: string | null
  storyId?: string | null
  actor: { id: string; name: string; username: string; avatarUrl: string | null }
  postExcerpt: string | null
  storyExcerpt?: string | null
}

export interface FrontendPost {
  id: string
  content: string
  audience: string
  backgroundColor: string | null
  feeling: string | null
  location: string | null
  taggedUsers: string | null
  createdAt: string
  shares?: number
  author: { id: string; name: string; username: string; avatarUrl: string | null }
  group?: { id: string; name: string; privacy: string } | null
  media: MediaItem[]
  reactionCounts: Record<string, number>
  reactionTotal: number
  myReaction: string | null
  myBookmark?: boolean
  reactionUsers?: { name: string; type: string }[]
  commentCount: number
  comments: FrontendComment[]
}

export const REACTIONS: { type: string; emoji: string; label: string; color: string }[] = [
  { type: 'LIKE', emoji: '👍', label: 'লাইক', color: 'text-[#45bd62]' },
  { type: 'LOVE', emoji: '❤️', label: 'ভালোবাসা', color: 'text-[#f3425f]' },
  { type: 'CARE', emoji: '🤗', label: 'যত্ন', color: 'text-[#f7b125]' },
  { type: 'HAHA', emoji: '😆', label: 'হাহা', color: 'text-[#f7b125]' },
  { type: 'WOW', emoji: '😮', label: 'ওয়াও', color: 'text-[#f7b125]' },
  { type: 'SAD', emoji: '😢', label: 'দুঃখ', color: 'text-[#f7b125]' },
  { type: 'ANGRY', emoji: '😡', label: 'রাগ', color: 'text-[#e9710f]' },
]

export const AUDIENCE_META: Record<string, { label: string; icon: string }> = {
  PUBLIC: { label: 'পাবলিক', icon: '🌍' },
  FRIENDS: { label: 'বন্ধুরা', icon: '👥' },
  ONLY_ME: { label: 'শুধু আমি', icon: '🔒' },
}

/** কমেন্টে অনুমোদিত রিঅ্যাকশন (ফেসবুক স্টাইল ছোট বার) */
export const COMMENT_REACTIONS = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD'] as const

export const NOTIFICATION_META: Record<string, { emoji: string; color: string }> = {
  REACTION: { emoji: '👍', color: 'text-[#45bd62]' },
  COMMENT: { emoji: '💬', color: 'text-[#00a86b]' },
  REPLY: { emoji: '↩️', color: 'text-[#00a86b]' },
  TAG: { emoji: '👤', color: 'text-sky-400' },
  SHARE: { emoji: '🔗', color: 'text-[#f7b125]' },
  STORY_REPLY: { emoji: '📸', color: 'text-[#e9710f]' },
  FOLLOW: { emoji: '🤝', color: 'text-[#00a86b]' },
}

/** নোটিফিকেশন মিউট-প্রেফারেন্সের অপশন (Session F + H: ফলো) */
export const NOTIF_PREF_OPTIONS: { type: string; emoji: string; label: string }[] = [
  { type: 'REACTION', emoji: '👍', label: 'রিঅ্যাকশন' },
  { type: 'COMMENT', emoji: '💬', label: 'কমেন্ট' },
  { type: 'REPLY', emoji: '↩️', label: 'কমেন্টে উত্তর' },
  { type: 'TAG', emoji: '👤', label: 'ট্যাগ' },
  { type: 'SHARE', emoji: '🔗', label: 'শেয়ার' },
  { type: 'STORY_REPLY', emoji: '📸', label: 'স্টোরি রিপ্লাই' },
  { type: 'FOLLOW', emoji: '🤝', label: 'নতুন ফলোয়ার' },
]
