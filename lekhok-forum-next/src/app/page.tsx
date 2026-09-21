'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Feather,
  Loader2,
  RefreshCw,
  FileText,
  Heart,
  SearchX,
  Bookmark,
  Camera,
  ArrowUp,
  Landmark,
  Pencil,
  UserCheck,
  Users,
  UsersRound,
  Sparkles,
} from 'lucide-react'
import TopNavbar from '@/components/feed/TopNavbar'
import LeftSidebar, { type MainTab } from '@/components/feed/LeftSidebar'
import RightRail from '@/components/feed/RightRail'
import FollowListModal from '@/components/user/FollowListModal'
import DefaultCover from '@/components/feed/DefaultCover'
import StoriesSection from '@/components/story/StoriesSection'
import ComposerCard from '@/components/feed/ComposerCard'
import FeedPostCard from '@/components/feed/FeedPostCard'
import FeedFilterBar, { type FeedCategory, type FeedSort } from '@/components/feed/FeedFilterBar'
import CreatePostModal from '@/components/post/CreatePostModal'
import ProfileView from '@/components/profile/ProfileView'
import GroupsView from '@/components/group/GroupsView'
import GroupDetailView from '@/components/group/GroupDetailView'
import CreateGroupModal from '@/components/group/CreateGroupModal'
import LeadershipView from '@/components/leadership/LeadershipView'
import MessengerView from '@/components/messenger/MessengerView'
import type { FrontendPost, FrontendUser } from '@/lib/types'
import { bn } from '@/lib/format'
import { compressImage } from '@/lib/image-compress'
import { useToast } from '@/hooks/use-toast'
import { useUnreadCounts } from '@/hooks/useUnreadCounts'

type ViewMode = MainTab | 'search' | 'profile' | 'groups' | 'group' | 'messenger' | 'leadership'

export default function Home() {
  const [current, setCurrent] = useState<FrontendUser | null>(null)
  const [users, setUsers] = useState<FrontendUser[]>([])
  const [tab, setTab] = useState<MainTab>('feed')
  const [searchQuery, setSearchQuery] = useState('')
  const [posts, setPosts] = useState<FrontendPost[]>([])
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [composerOpen, setComposerOpen] = useState(false)
  const [editPost, setEditPost] = useState<FrontendPost | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedCount, setSavedCount] = useState(0)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [profileUploading, setProfileUploading] = useState<'cover' | 'avatar' | null>(null)
  const [showTop, setShowTop] = useState(false)
  const [bioEditing, setBioEditing] = useState(false)
  const [bioDraft, setBioDraft] = useState('')
  const [bioSaving, setBioSaving] = useState(false)
  const [openStoryId, setOpenStoryId] = useState<string | null>(null)
  const [profileUsername, setProfileUsername] = useState<string | null>(null)
  /* Session K: গ্রুপ-ভিউ */
  const [groupsView, setGroupsView] = useState(false)
  const [groupId, setGroupId] = useState<string | null>(null)
  const [createGroupOpen, setCreateGroupOpen] = useState(false)
  /* Session L: মেসেঞ্জার-ভিউ (?chat=1 ডিপ-লিংক সহ) */
  const [messengerOpen, setMessengerOpen] = useState(false)
  /* Session 189: নেতৃত্ব-ভিউ (?leadership=1 ডিপ-লিংক সহ) */
  const [leadershipOpen, setLeadershipOpen] = useState(false)
  const [groupsList, setGroupsList] = useState<{ id: string; name: string; memberCount: number }[]>([])
  const [groupsRefreshKey, setGroupsRefreshKey] = useState(0)
  /* Session I: ফলো-অবস্থা বদলালে সাজেশন-রেইল রিফ্রেশ (window-ইভেন্ট ডিকাপলড) */
  const [followRefreshKey, setFollowRefreshKey] = useState(0)
  /* Session I: নিজের টাইমলাইন-হেডারে রিয়েল ফলো-স্ট্যাট + নিজের ফলো-লিস্ট মডাল */
  const [myStats, setMyStats] = useState<{ followers: number; following: number } | null>(null)
  const [followModal, setFollowModal] = useState<{ username: string; name: string; tab: 'followers' | 'following' } | null>(null)
  /* Session J: "নতুন পোস্ট" পোলিং-ব্যাজ */
  const [newPostCount, setNewPostCount] = useState(0)
  /* session165: FeedFilterBar — ক্যাটাগরি+সর্ট এক লাইনে */
  const [feedCategory, setFeedCategory] = useState<FeedCategory>('ALL')
  const [feedSort, setFeedSort] = useState<FeedSort>('LATEST')

  /* session160 — লাইভ অপঠিত-কাউন্ট (সাইডবার-ব্যাজ; ৪৫-সে-পোলিং + ইভেন্ট-চালিত) */
  const unreadCounts = useUnreadCounts(!!current)
  const baselineRef = useRef<{ iso: string | null; topId: string | null }>({ iso: null, topId: null })
  const deepLinkRef = useRef<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const view: ViewMode = searchQuery.trim()
    ? 'search'
    : profileUsername && !loading
      ? 'profile'
      : groupId && !loading
        ? 'group'
        : groupsView && !loading
          ? 'groups'
          : messengerOpen && !loading
            ? 'messenger'
            : leadershipOpen && !loading
              ? 'leadership'
              : tab

  /* ─── Session K: URL-প্যারাম হেল্পার — ?post=/?story=/?user=/?group=/?groups= একসাথে সামলানো ─── */
  const setUrlParams = useCallback((changes: Record<string, string | null>) => {
    try {
      const u = new URL(window.location.href)
      for (const [k, v] of Object.entries(changes)) {
        if (v === null || v === undefined) u.searchParams.delete(k)
        else u.searchParams.set(k, v)
      }
      window.history.replaceState(null, '', u.toString())
    } catch {
      /* ignore */
    }
  }, [])

  /* ─── ?post= / ?story= / ?user= / ?group= / ?groups= deep-link পড়া (প্রথম লোডে) ─── */
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      const p = sp.get('post')
      if (p) deepLinkRef.current = p
      const s = sp.get('story')
      if (s) setOpenStoryId(s)
      const u = sp.get('user')
      if (u) setProfileUsername(u)
      const g = sp.get('group')
      if (g) setGroupId(g)
      if (sp.get('groups') === '1') setGroupsView(true)
      if (sp.get('chat') === '1') setMessengerOpen(true)
      if (sp.get('leadership') === '1') setLeadershipOpen(true)
    } catch {
      /* ignore */
    }
  }, [])

  /* ─── নোটিফিকেশন/deep-link → পোস্টে স্ক্রল + হাইলাইট (Session K: প্রোফাইল/গ্রুপ-ভিউ বন্ধ + ?post= URL-সিঙ্ক) ─── */
  const scrollToPost = useCallback(
    (postId: string) => {
      setTab('feed')
      setSearchQuery('')
      setProfileUsername(null)
      setGroupsView(false)
      setGroupId(null)
      setLeadershipOpen(false)
      setUrlParams({ post: postId, story: null, user: null, group: null, groups: null, leadership: null })
      // পোস্ট-লিস্ট রিলোড (tab switch) হলে এলিমেন্ট আনমাউন্ট/রিমাউন্ট হয় —
      // তাই ~৩ সেকেন্ড পর্যন্ত বারবার খুঁজে স্ক্রল করি, শেষে হাইলাইট সরাই।
      let attempts = 0
      const attempt = () => {
        attempts += 1
        const el = document.querySelector(`[data-post-id="${postId}"]`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.classList.add('lf-post-highlight')
        }
        if (attempts < 12) {
          setTimeout(attempt, 250)
        } else {
          document
            .querySelector(`[data-post-id="${postId}"]`)
            ?.classList.remove('lf-post-highlight')
        }
      }
      attempt()
    },
    [setUrlParams]
  )

  /* প্রথম পোস্ট-লোডের পরে deep-link পোস্টে স্ক্রল (প্রোফাইল/গ্রুপ-ভিউ খোলা থাকলে স্কিপ) */
  useEffect(() => {
    if (
      !postsLoading &&
      deepLinkRef.current &&
      posts.length > 0 &&
      (view === 'feed' || view === 'timeline')
    ) {
      const target = deepLinkRef.current
      deepLinkRef.current = null
      setTimeout(() => scrollToPost(target), 300)
    }
  }, [postsLoading, posts.length, view, scrollToPost])

  /* ─── Session G: স্টোরি-নোটিফিকেশন/ডিপ-লিংক → ফিডে গিয়ে ভিউয়ার ওপেন (Session K: setUrlParams) ─── */
  const openStory = useCallback(
    (storyId: string) => {
      setTab('feed')
      setSearchQuery('')
      setOpenStoryId(storyId)
      setUrlParams({ story: storyId, post: null })
    },
    [setUrlParams]
  )

  const clearStoryLink = useCallback(() => {
    setOpenStoryId(null)
    setUrlParams({ story: null })
  }, [setUrlParams])

  /* ─── session160: লঞ্চার → সর্বশেষ স্টোরি (প্রথম সক্রিয় রিং-এর প্রথম স্টোরি) ─── */
  const openLatestStory = useCallback(() => {
    fetch('/api/stories')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const first = d?.rings?.[0]?.stories?.[0]?.id
        if (first) openStory(first)
      })
      .catch(() => {})
  }, [openStory])

  /* ─── Session H: ইউজার-প্রোফাইল ওপেন/ক্লোজ (?user= ডিপ-লিংক সহ) — Session K: প্যারাম-সচেতন ─── */
  const openProfile = useCallback(
    (username: string) => {
      setSearchQuery('')
      // নিজের প্রোফাইল → এডিট-কন্ট্রোলসহ টাইমলাইন-ট্যাব
      if (current && username === current.username) {
        setProfileUsername(null)
        setTab('timeline')
        setUrlParams({ user: null, post: null, story: null, group: null, groups: null, leadership: null })
        setGroupsView(false)
        setGroupId(null)
        setLeadershipOpen(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      setProfileUsername(username)
      setGroupsView(false)
      setGroupId(null)
      setLeadershipOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setUrlParams({ user: username, post: null, story: null, group: null, groups: null, leadership: null })
    },
    [current, setUrlParams]
  )

  const closeProfile = useCallback(() => {
    setProfileUsername(null)
    setUrlParams({ user: null })
  }, [setUrlParams])

  /* ─── Session K: গ্রুপ-নেভিগেশন (লিস্ট/ডিটেইল + ?group=/?groups= ডিপ-লিংক) ─── */
  const openGroups = useCallback(() => {
    setSearchQuery('')
    setProfileUsername(null)
    setGroupId(null)
    setGroupsView(true)
    setLeadershipOpen(false)
    setUrlParams({ groups: '1', group: null, user: null, post: null, story: null, leadership: null })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [setUrlParams])

  const openGroup = useCallback(
    (id: string) => {
      setSearchQuery('')
      setProfileUsername(null)
      setGroupsView(false)
      setGroupId(id)
      setLeadershipOpen(false)
      setUrlParams({ group: id, groups: null, user: null, post: null, story: null, leadership: null })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [setUrlParams]
  )

  const closeGroupNav = useCallback(() => {
    setGroupId(null)
    setGroupsView(false)
    setUrlParams({ group: null, groups: null })
  }, [setUrlParams])

  /* ─── Session L: মেসেঞ্জার-নেভিগেশন (?chat=1 ডিপ-লিংক) ─── */
  const openMessenger = useCallback(() => {
    setSearchQuery('')
    setProfileUsername(null)
    setGroupId(null)
    setGroupsView(false)
    setMessengerOpen(true)
    setLeadershipOpen(false)
    setUrlParams({ chat: '1', group: null, groups: null, user: null, post: null, story: null, leadership: null })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [setUrlParams])

  const closeMessenger = useCallback(() => {
    setMessengerOpen(false)
    setUrlParams({ chat: null })
  }, [setUrlParams])

  /* ─── Session 189: নেতৃত্ব-ভিউ (?leadership=1 ডিপ-লিংক সহ) ─── */
  const openLeadership = useCallback(() => {
    setSearchQuery('')
    setProfileUsername(null)
    setGroupId(null)
    setGroupsView(false)
    setMessengerOpen(false)
    setLeadershipOpen(true)
    setUrlParams({ leadership: '1', chat: null, group: null, groups: null, user: null, post: null, story: null })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [setUrlParams])

  const closeLeadership = useCallback(() => {
    setLeadershipOpen(false)
    setUrlParams({ leadership: null })
  }, [setUrlParams])

  /* Session K: সাইডবার/মোবাইল-স্ট্রিপের জন্য আমার গ্রুপ-তালিকা */
  useEffect(() => {
    if (!current) return
    let alive = true
    fetch('/api/groups')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('fail'))))
      .then((d) => {
        if (alive) setGroupsList(d.myGroups || [])
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [current, groupsRefreshKey])

  /* ─── সেশন লোড ─── */
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/session')
        const data = await res.json()
        setCurrent(data.current)
        setUsers(data.users || [])
      } catch {
        setError('সেশন লোড করা যায়নি')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  /* ─── session165: ফিল্টার-বার-সচেতন ফিচ-প্যারাম — feed/following-এ type+sort যুক্ত ─── */
  const feedParams = useCallback(
    (mode: ViewMode) => {
      const params = new URLSearchParams()
      if (mode === 'feed' || mode === 'following') {
        const base = mode === 'following' || feedCategory === 'FOLLOWING' ? 'following' : 'feed'
        params.set('tab', base)
        if (feedCategory !== 'ALL' && feedCategory !== 'FOLLOWING') params.set('type', feedCategory)
        params.set('sort', feedSort)
      } else {
        params.set('tab', mode)
      }
      return params
    },
    [feedCategory, feedSort]
  )

  /* ─── পোস্ট লোড (ফিড/টাইমলাইন/সেভড/সার্চ) — প্রথম পেজ (প্রোফাইল-ভিউ নিজেই লোড করে) ─── */
  const loadPosts = useCallback(async (mode: ViewMode, q?: string) => {
    if (mode === 'profile' || mode === 'group' || mode === 'groups' || mode === 'leadership') return
    setPostsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (mode === 'search' && q?.trim()) {
        params.set('q', q.trim())
        params.set('limit', '12')
      } else if (mode !== 'search') {
        params.set('tab', mode)
        /* session165: ফিল্টার-বার সচেতন — feed/following-এ type+sort ওভাররাইড */
        if (mode === 'feed' || mode === 'following') {
          const filtered = feedParams(mode)
          for (const [k, v] of filtered.entries()) params.set(k, v)
        }
      }
      const res = await fetch(`/api/posts?${params.toString()}`)
      if (!res.ok) throw new Error('পোস্ট লোড ব্যর্থ')
      const data = await res.json()
      setPosts(data.posts || [])
      setNextCursor(data.nextCursor ?? null)
      setHasMore(Boolean(data.hasMore))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'অজানা সমস্যা')
    } finally {
      setPostsLoading(false)
    }
  }, [feedParams])

  /* ─── পরের পেজ (ইনফিনিট স্ক্রল) ─── */
  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore || postsLoading) return
    setLoadingMore(true)
    try {
      const params = new URLSearchParams()
      if (view === 'search' && searchQuery.trim()) {
        params.set('q', searchQuery.trim())
      } else if (view !== 'search') {
        params.set('tab', view)
        /* session165: ফিল্টার-বার সচেতন — feed/following-এ type+sort ওভাররাইড */
        if (view === 'feed' || view === 'following') {
          const filtered = feedParams(view)
          for (const [k, v] of filtered.entries()) params.set(k, v)
        }
      }
      params.set('cursor', nextCursor)
      const res = await fetch(`/api/posts?${params.toString()}`)
      if (!res.ok) throw new Error('আরও পোস্ট লোড ব্যর্থ')
      const data = await res.json()
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id))
        return [...prev, ...(data.posts || []).filter((p: FrontendPost) => !seen.has(p.id))]
      })
      setNextCursor(data.nextCursor ?? null)
      setHasMore(Boolean(data.hasMore))
    } catch {
      toast({ title: 'আরও পোস্ট লোড ব্যর্থ, আবার চেষ্টা করুন', variant: 'destructive' })
    } finally {
      setLoadingMore(false)
    }
  }, [nextCursor, loadingMore, postsLoading, view, searchQuery, feedParams, toast])

  /* সেন্টিনেল ভিউপোর্টে এলেই পরের পেজ */
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore || postsLoading) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '700px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, postsLoading, loadMore])

  /* ─── Session J: বেসলাইন-ট্র্যাকিং — ফ্রেশ লোডে টপ-পোস্ট বদলালে ব্যাজ পরিষ্কার ─── */
  useEffect(() => {
    if (postsLoading || posts.length === 0) return
    const top = posts[0]
    const prevTopId = baselineRef.current.topId
    baselineRef.current = { iso: top.createdAt, topId: top.id }
    if (prevTopId && prevTopId !== top.id) setNewPostCount(0)
  }, [posts, postsLoading])

  /* ─── Session J: নতুন-পোস্ট পোলিং (৪৫ সেকেন্ড, ট্যাব-ভিজিবল হলেই) ─── */
  useEffect(() => {
    if (!current || (view !== 'feed' && view !== 'following')) return
    let alive = true
    const POLL_MS = 45000
    const poll = async () => {
      if (document.hidden) return
      const iso = baselineRef.current.iso
      if (!iso) return
      try {
        const params = new URLSearchParams({ count: 'new', after: iso, tab: view })
        const res = await fetch(`/api/posts?${params.toString()}`)
        if (!res.ok) return
        const d = await res.json()
        if (alive) setNewPostCount(d.newCount ?? 0)
      } catch {
        /* ignore */
      }
    }
    const interval = setInterval(poll, POLL_MS)
    const onVisible = () => {
      if (!document.hidden) poll()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      alive = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [view, current])

  const loadNewPosts = useCallback(() => {
    setNewPostCount(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    loadPosts(view, searchQuery)
  }, [view, searchQuery, loadPosts])

  /* ─── back-to-top বাটন ─── */
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ─── Session I: ফলো-পরিবর্তনে সাজেশন-রেইল রিফ্রেশ ─── */
  useEffect(() => {
    const onFollowChanged = () => {
      setFollowRefreshKey((k) => k + 1)
      /* নিজের স্ট্যাটও রিফ্রেশ */
      setMyStats(null)
      /* ফলোয়িং-ফিড দেখার মাঝেই নতুন কাউকে ফলো করলে ফিডও রিফ্রেশ */
      if (view === 'following') loadPosts('following')
    }
    window.addEventListener('lf:follow-changed', onFollowChanged)
    return () => window.removeEventListener('lf:follow-changed', onFollowChanged)
  }, [view, loadPosts])

  /* ─── Session I: নিজের ফলো-স্ট্যাট (টাইমলাইন-হেডার) ─── */
  useEffect(() => {
    if (!current) return
    let alive = true
    ;(async () => {
      try {
        const res = await fetch(`/api/users/${encodeURIComponent(current.username)}`)
        if (!res.ok) return
        const data = await res.json()
        if (alive) setMyStats({ followers: data.profile.stats.followers, following: data.profile.stats.following })
      } catch {
        /* ignore */
      }
    })()
    return () => {
      alive = false
    }
  }, [current, followRefreshKey])

  useEffect(() => {
    if (current) {
      loadPosts(view, searchQuery)
      // সেভ-কাউন্ট (ব্যাজের জন্য) — হালকা count API
      fetch('/api/posts?count=saved')
        .then((r) => r.json())
        .then((d) => setSavedCount(d.count ?? 0))
        .catch(() => {})
    }
  }, [current, view, searchQuery, loadPosts])

  /* ─── ইউজার সুইচ (ডেমো) — প্রোফাইল/গ্রুপ-ভিউ ক্লিয়ার ─── */
  const switchUser = async (userId: string) => {
    await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    const res = await fetch('/api/session')
    const data = await res.json()
    setCurrent(data.current)
    setSearchQuery('')
    setProfileUsername(null)
    setGroupsView(false)
    setGroupId(null)
    setUrlParams({ user: null, group: null, groups: null })
    setTab('timeline')
  }

  const updatePost = (updated: FrontendPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }
  const handleBookmarkDelta = (delta: number) => {
    setSavedCount((c) => Math.max(0, c + delta))
  }
  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }
  const openEdit = (p: FrontendPost) => {
    setEditPost(p)
    setComposerOpen(true)
  }
  const openComposer = () => {
    setEditPost(null)
    setComposerOpen(true)
  }

  /* ─── হ্যাশট্যাগ/ট্রেন্ডিং ক্লিক → সার্চ ─── */
  const searchTag = useCallback((tag: string) => {
    setSearchQuery(tag)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  /* ─── session165: FeedFilterBar কলব্যাক — স্টেট-বদলে loadPosts-আইডেন্টিটি বদলায় → ইফেক্টে রিলোড ─── */
  const handleFilterChange = useCallback((category: FeedCategory, sort: FeedSort) => {
    setFeedCategory(category)
    setFeedSort(sort)
  }, [])

  /* ─── কভার/অ্যাভাটার আপলোড → কমপ্রেস → /api/upload → /api/profile → সেশন রিফ্রেশ ─── */
  const handleProfileUpload = async (kind: 'cover' | 'avatar', rawFile: File) => {
    setProfileUploading(kind)
    try {
      const file = await compressImage(rawFile) // Session J: বড় ছবি ছোট করে আপলোড
      const fd = new FormData()
      fd.append('files', file)
      const up = await fetch('/api/upload', { method: 'POST', body: fd })
      const upData = await up.json()
      if (!up.ok || !upData.media?.[0]) throw new Error('আপলোড ব্যর্থ')
      const url = upData.media[0].url
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kind === 'cover' ? { coverUrl: url } : { avatarUrl: url }),
      })
      if (!res.ok) throw new Error('প্রোফাইল আপডেট ব্যর্থ')
      const s = await fetch('/api/session')
      const sData = await s.json()
      setCurrent(sData.current)
      setUsers(sData.users || [])
      toast({ title: kind === 'cover' ? 'কভার ছবি আপডেট হয়েছে 🖼️' : 'প্রোফাইল ছবি আপডেট হয়েছে ✨' })
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : 'আপলোড ব্যর্থ',
        variant: 'destructive',
      })
    } finally {
      setProfileUploading(null)
    }
  }

  /* ─── বায়ো ইনলাইন-সেভ ─── */
  const saveBio = async () => {
    setBioSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: bioDraft.trim() }),
      })
      if (!res.ok) throw new Error('বায়ো সেভ ব্যর্থ')
      const data = await res.json()
      if (current && data.user) {
        setCurrent((prev) => (prev ? { ...prev, bio: data.user.bio } : prev))
      }
      setBioEditing(false)
      toast({ title: 'পরিচিতি আপডেট হয়েছে ✍️' })
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : 'বায়ো সেভ ব্যর্থ',
        variant: 'destructive',
      })
    } finally {
      setBioSaving(false)
    }
  }

  const ownPostCount = posts.length
  const totalReactions = posts.reduce((acc, p) => acc + p.reactionTotal, 0)

  return (
    <div className="lf-app lf-bg-page min-h-screen flex flex-col text-[#e4e6eb]">
      <TopNavbar
        current={current}
        users={users}
        onSwitchUser={switchUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigateToPost={scrollToPost}
        onOpenStory={openStory}
        onOpenProfile={openProfile}
        onOpenGroups={openGroups}
        onOpenMessenger={openMessenger}
        onOpenComposer={openComposer}
        onCreateGroup={() => {
          closeProfile()
          closeGroupNav()
          closeMessenger()
          setCreateGroupOpen(true)
        }}
        onTabChange={(t) => {
          setTab(t)
          setSearchQuery('')
          closeProfile()
          closeGroupNav()
          closeMessenger()
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onOpenLatestStory={openLatestStory}
      />

      <main className="flex-1 w-full">
        {/* ═══ ৩-কলাম কন্টেইনার — ইউজার-স্পেক: max-w 1360px + justify-center + gap-3 (১২px) + px-2: অপ্রয়োজনীয় সাইড-গ্যাপ দূরীকরণ ═══ */}
        <div className="max-w-[1360px] mx-auto flex justify-center gap-3 px-2 pt-3 pb-8">
          <LeftSidebar
            current={current}
            users={users}
            activeTab={tab}
            profileUsername={profileUsername}
            onTabChange={(t) => {
              setTab(t)
              setSearchQuery('')
              closeProfile()
              closeGroupNav()
              closeMessenger()
              closeLeadership()
            }}
            onSwitchUser={switchUser}
            onOpenProfile={openProfile}
            savedCount={savedCount}
            groups={groupsList}
            onOpenGroups={openGroups}
            onOpenGroup={openGroup}
            groupsActive={view === 'groups' || view === 'group'}
            messengerActive={view === 'messenger'}
            onOpenMessenger={openMessenger}
            leadershipActive={view === 'leadership'}
            onOpenLeadership={openLeadership}
            unreadNotifications={unreadCounts.notifications}
            unreadMessages={unreadCounts.messages}
            onOpenNotifications={() => window.dispatchEvent(new CustomEvent('lf:open-notifications'))}
          />

          {/* ═══ সেন্টার কলাম — ইউজার-স্পেক: max-w ৭০০px + gap-2.5; mx-auto বাদ (justify-center-ই সেন্টার করে — auto-margin গ্যাপ-৩ নিষ্ক্রিয় করত) ═══ */}
          <div className={`flex-1 min-w-0 flex flex-col gap-2.5 ${view === 'messenger' ? 'max-w-[980px]' : 'max-w-[700px]'}`}>
            {/* মোবাইল ট্যাব সুইচার */}
            <div className="flex gap-1 bg-[#242526] rounded-xl border border-[#3e4042] p-1 lg:hidden">
              <button
                onClick={() => {
                  setTab('feed')
                  setSearchQuery('')
                  closeProfile()
                  closeGroupNav()
                  closeLeadership()
                }}
                className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition ${
                  view === 'feed' ? 'bg-[#006a4e] text-white' : 'text-[#b0b3b8] hover:bg-[#3a3b3c]'
                }`}
              >
                ফিড
              </button>
              <button
                onClick={() => {
                  setTab('following')
                  setSearchQuery('')
                  closeProfile()
                  closeGroupNav()
                  closeLeadership()
                }}
                className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition flex items-center justify-center gap-1 ${
                  view === 'following' ? 'bg-[#006a4e] text-white' : 'text-[#b0b3b8] hover:bg-[#3a3b3c]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                ফলোয়িং
              </button>
              <button
                onClick={() => {
                  setTab('timeline')
                  setSearchQuery('')
                  closeProfile()
                  closeGroupNav()
                  closeLeadership()
                }}
                className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition ${
                  view === 'timeline' ? 'bg-[#006a4e] text-white' : 'text-[#b0b3b8] hover:bg-[#3a3b3c]'
                }`}
              >
                টাইমলাইন
              </button>
              <button
                onClick={() => {
                  setTab('saved')
                  setSearchQuery('')
                  closeProfile()
                  closeGroupNav()
                  closeLeadership()
                }}
                className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition ${
                  view === 'saved' ? 'bg-[#006a4e] text-white' : 'text-[#b0b3b8] hover:bg-[#3a3b3c]'
                }`}
              >
                সেভ
              </button>
              <button
                onClick={openLeadership}
                className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition flex items-center justify-center gap-1 ${
                  view === 'leadership' ? 'bg-[#006a4e] text-white' : 'text-[#b0b3b8] hover:bg-[#3a3b3c]'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                কমিটি
              </button>
            </div>

            {/* ═══ Session L: মেসেঞ্জার ভিউ ═══ */}
            {view === 'messenger' && current && (
              <MessengerView
                me={{
                  id: current.id,
                  name: current.name,
                  username: current.username,
                  avatarUrl: current.avatarUrl,
                }}
                users={users}
              />
            )}

            {/* ═══ Session 189: নেতৃত্ব-ভিউ (প্রতিষ্ঠাতা + বর্তমান পরিষদ) ═══ */}
            {view === 'leadership' && <LeadershipView current={current} />}

            {/* ═══ Session K: গ্রুপ-লিস্ট ভিউ ═══ */}
            {view === 'groups' && (
              <GroupsView
                refreshKey={groupsRefreshKey}
                onOpenGroup={openGroup}
                onCreateGroup={() => setCreateGroupOpen(true)}
              />
            )}

            {/* ═══ Session K: গ্রুপ-ডিটেইল ভিউ ═══ */}
            {view === 'group' && groupId && current && (
              <GroupDetailView
                groupId={groupId}
                me={{
                  id: current.id,
                  name: current.name,
                  username: current.username,
                  avatarUrl: current.avatarUrl,
                }}
                users={users}
                onBack={openGroups}
                onOpenProfile={openProfile}
                onEdit={openEdit}
                onBookmarkDelta={handleBookmarkDelta}
                onSearchTag={searchTag}
                refreshKey={groupsRefreshKey}
                onGroupChanged={() => setGroupsRefreshKey((k) => k + 1)}
              />
            )}

            {/* ═══ Session H: অন্য লেখকের প্রোফাইল-ভিউ ═══ */}
            {view === 'profile' && profileUsername && current && (
              <ProfileView
                username={profileUsername}
                me={{
                  id: current.id,
                  name: current.name,
                  username: current.username,
                  avatarUrl: current.avatarUrl,
                }}
                users={users}
                onEdit={openEdit}
                onBookmarkDelta={handleBookmarkDelta}
                onSearchTag={searchTag}
                onOpenProfile={openProfile}
              />
            )}

            {/* টাইমলাইন প্রোফাইল হেডার — কভার/অ্যাভাটার আপলোডসহ */}
            {view === 'timeline' && current && (
              <section className="bg-[#242526] rounded-xl border border-[#3e4042] overflow-hidden shadow-md lf-anim-fade">
                <div className="h-36 sm:h-44 relative group/cover overflow-hidden">
                  {current.coverUrl ? (
                    <img
                      src={current.coverUrl}
                      alt={`${current.name} কভার ছবি`}
                      className="w-full h-full object-cover lf-img-reveal"
                      onLoad={(e) => e.currentTarget.classList.add('lf-img-loaded')}
                      ref={(el) => {
                        if (el && el.complete && el.naturalWidth > 0) el.classList.add('lf-img-loaded')
                      }}
                    />
                  ) : (
                    <DefaultCover name={current.name} />
                  )}
                  <Feather className="absolute bottom-3 right-4 w-16 h-16 text-white/10 pointer-events-none" />
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    disabled={profileUploading === 'cover'}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/55 hover:bg-black/75 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm transition disabled:opacity-60 shadow-lg"
                  >
                    {profileUploading === 'cover' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                    কভার বদলান
                  </button>
                  {profileUploading === 'cover' && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="text-xs font-bold text-white bg-black/60 px-3 py-1.5 rounded-full">
                        কভার আপলোড হচ্ছে...
                      </span>
                    </div>
                  )}
                </div>
                <div className="px-4 pb-4 -mt-10 flex items-end gap-3">
                  <div className="relative shrink-0">
                    {current.avatarUrl ? (
                      <img
                        src={current.avatarUrl}
                        alt={current.name}
                        className="w-20 h-20 rounded-full border-4 border-[#242526] object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-[#4e4f50] border-4 border-[#242526]" />
                    )}
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={profileUploading === 'avatar'}
                      aria-label="প্রোফাইল ছবি বদলান"
                      title="প্রোফাইল ছবি বদলান"
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#3a3b3c] border border-[#4e4f50] hover:bg-[#4a4c4e] flex items-center justify-center text-[#e4e6eb] shadow-lg transition disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[#00a86b]"
                    >
                      {profileUploading === 'avatar' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <h1 className="text-lg font-extrabold text-white truncate">{current.name}</h1>
                    <p className="text-xs text-[#b0b3b8]">@{current.username}</p>
                  </div>
                </div>
                {/* বায়ো — ইনলাইন এডিটেবল */}
                {bioEditing ? (
                  <div className="px-4 pb-3 -mt-1 space-y-2">
                    <textarea
                      autoFocus
                      value={bioDraft}
                      onChange={(e) => setBioDraft(e.target.value.slice(0, 300))}
                      rows={3}
                      aria-label="পরিচিতি সম্পাদনা"
                      className="w-full resize-none bg-[#3a3b3c] rounded-lg px-3 py-2 text-[13.5px] text-[#e4e6eb] placeholder-[#8a8d91] outline-none focus:ring-2 focus:ring-[#00a86b] transition"
                      placeholder="নিজের সম্পর্কে দু-এক কথা লিখুন…"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#8a8d91]">{bn(bioDraft.length)}/৩০০</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setBioEditing(false)}
                          className="px-3 py-1.5 rounded-lg bg-[#3a3b3c] hover:bg-[#4a4c4e] text-xs font-bold text-[#e4e6eb] transition focus-visible:ring-2 focus-visible:ring-[#00a86b]"
                        >
                          বাতিল
                        </button>
                        <button
                          onClick={saveBio}
                          disabled={bioSaving}
                          className="px-3 py-1.5 rounded-lg bg-[#006a4e] hover:bg-[#00523c] text-xs font-extrabold text-white transition disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[#00a86b]"
                        >
                          {bioSaving ? 'সেভ হচ্ছে…' : 'সেভ করুন'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : current.bio ? (
                  <div className="group/bio px-4 pb-3 -mt-1 flex items-start gap-2">
                    <p className="flex-1 text-[13.5px] text-[#b0b3b8]">{current.bio}</p>
                    <button
                      onClick={() => {
                        setBioDraft(current.bio ?? '')
                        setBioEditing(true)
                      }}
                      aria-label="পরিচিতি সম্পাদনা করুন"
                      title="পরিচিতি সম্পাদনা করুন"
                      className="shrink-0 w-7 h-7 rounded-full bg-[#3a3b3c] text-[#b0b3b8] hover:text-white hover:bg-[#4a4c4e] flex items-center justify-center opacity-0 group-hover/bio:opacity-100 transition focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#00a86b]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="px-4 pb-3 -mt-1">
                    <button
                      onClick={() => {
                        setBioDraft('')
                        setBioEditing(true)
                      }}
                      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#00a86b] hover:text-[#33d79f] transition focus-visible:ring-2 focus-visible:ring-[#00a86b] rounded px-1 py-0.5"
                    >
                      <Pencil className="w-3.5 h-3.5" /> পরিচিতি যোগ করুন
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-4 border-t border-[#3e4042] divide-x divide-[#3e4042]">
                  <Stat icon={<FileText className="w-4 h-4" />} value={bn(ownPostCount)} label="পোস্ট" />
                  <button
                    onClick={() => current && setFollowModal({ username: current.username, name: current.name, tab: 'followers' })}
                    aria-haspopup="dialog"
                    title="অনুসারী-লিস্ট দেখুন"
                    className="flex flex-col items-center py-3 gap-0.5 lf-stat-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00a86b]"
                  >
                    <span className="flex items-center gap-1.5 text-white font-extrabold text-base">
                      <span className="text-[#00a86b]"><Users className="w-4 h-4" /></span>
                      {myStats ? bn(myStats.followers) : '—'}
                    </span>
                    <span className="text-[11px] text-[#8a8d91]">অনুসারী</span>
                  </button>
                  <button
                    onClick={() => current && setFollowModal({ username: current.username, name: current.name, tab: 'following' })}
                    aria-haspopup="dialog"
                    title="অনুসরণ-লিস্ট দেখুন"
                    className="flex flex-col items-center py-3 gap-0.5 lf-stat-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#00a86b]"
                  >
                    <span className="flex items-center gap-1.5 text-white font-extrabold text-base">
                      <span className="text-[#00a86b]"><UserCheck className="w-4 h-4" /></span>
                      {myStats ? bn(myStats.following) : '—'}
                    </span>
                    <span className="text-[11px] text-[#8a8d91]">অনুসরণ</span>
                  </button>
                  <Stat icon={<Heart className="w-4 h-4" />} value={bn(totalReactions)} label="রিঅ্যাকশন" />
                </div>
                {/* লুকানো ফাইল-ইনপুট */}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-label="কভার ছবি আপলোড"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleProfileUpload('cover', f)
                    e.target.value = ''
                  }}
                />
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-label="প্রোফাইল ছবি আপলোড"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleProfileUpload('avatar', f)
                    e.target.value = ''
                  }}
                />
              </section>
            )}

            {/* সার্চ / সেভ / ফলোয়িং হেডার ব্যাজ */}
            {(view === 'search' || view === 'saved' || view === 'following') && (
              <div className="flex items-center gap-2.5 bg-[#242526] rounded-xl border border-[#3e4042] px-4 py-3 lf-anim-fade">
                {view === 'search' ? (
                  <>
                    <span className="w-9 h-9 rounded-full bg-[#3a3b3c] flex items-center justify-center shrink-0">
                      <SearchX className="w-4.5 h-4.5 text-[#00a86b]" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">সার্চ ফলাফল</p>
                      <p className="text-xs text-[#b0b3b8] truncate">
                        &quot;{searchQuery}&quot; —{' '}
                        {postsLoading
                          ? 'খোঁজা হচ্ছে...'
                          : `${bn(posts.length)}টি দেখানো হচ্ছে${hasMore ? ' · নিচে স্ক্রল করে আরও' : ''}`}
                      </p>
                    </div>
                  </>
                ) : view === 'following' ? (
                  <>
                    <span className="w-9 h-9 rounded-full bg-[#3a3b3c] flex items-center justify-center shrink-0">
                      <UserCheck className="w-4.5 h-4.5 text-[#00a86b]" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">অনুসরণ করা ফিড</p>
                      <p className="text-xs text-[#b0b3b8]">
                        {postsLoading
                          ? 'লোড হচ্ছে...'
                          : `${bn(posts.length)}টি লেখা দেখানো হচ্ছে — আপনার অনুসরণ করা লেখকদের`}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="w-9 h-9 rounded-full bg-[#3a3b3c] flex items-center justify-center shrink-0">
                      <Bookmark className="w-4.5 h-4.5 text-[#00a86b]" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">সেভ করা পোস্ট</p>
                      <p className="text-xs text-[#b0b3b8]">
                        {postsLoading ? 'লোড হচ্ছে...' : `${bn(posts.length)}টি পোস্ট সেভ করা আছে`}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* স্টোরি বার (শুধু ফিডে) — Session G: ডিপ-লিংক ওয়্যারিংসহ */}
            {view === 'feed' && current && (
              <StoriesSection
                current={current}
                openStoryId={openStoryId}
                onStoryConsumed={clearStoryLink}
              />
            )}

            {/* Session K: মোবাইলে আমার গ্রুপ-চিপ স্ট্রিপ (সাইডবার নেই বলে) */}
            {view === 'feed' && groupsList.length > 0 && (
              <div className="lg:hidden -mt-1">
                <div className="flex items-center gap-2 overflow-x-auto lf-scroll pb-1">
                  <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8a8d91] uppercase tracking-wide">
                    <UsersRound className="w-3.5 h-3.5 text-[#00a86b]" /> আমার গ্রুপ
                  </span>
                  {groupsList.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => openGroup(g.id)}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#242526] border border-[#3e4042] hover:border-[#00a86b]/50 text-[12.5px] font-bold text-[#e4e6eb] transition active:scale-[0.97]"
                    >
                      <UsersRound className="w-3.5 h-3.5 text-[#00a86b]" />
                      <span className="max-w-[130px] truncate">{g.name}</span>
                      <span className="text-[10px] font-semibold text-[#8a8d91]">{bn(g.memberCount)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* কম্পোজার ট্রিগার (শুধু ফিড/টাইমলাইনে — অন্যের প্রোফাইলে নয়) */}
            {(view === 'feed' || view === 'timeline') && (
              <ComposerCard
                current={current}
                onOpen={openComposer}
                onQuickMedia={openComposer}
              />
            )}

            {/* session165: FeedFilterBar — ক্যাটাগরি+সর্ট এক লাইনে (ফিড/অনুসরণ-ভিউতে) */}
            {(view === 'feed' || view === 'following') && (
              <FeedFilterBar onFilterChange={handleFilterChange} />
            )}

            {/* মূল পোস্ট-লিস্ট (প্রোফাইল/গ্রুপ-ভিউতে লুকানো — ওরা নিজেরাই দেখায়) */}
            {(view === 'feed' || view === 'following' || view === 'timeline' || view === 'saved' || view === 'search') && (
            <>
            {/* ─── Session J: নতুন-পোস্ট পিল (পোলিং) ─── */}
            {newPostCount > 0 && !postsLoading && (view === 'feed' || view === 'following') && (
              <div className="sticky top-[72px] z-30 flex justify-center pointer-events-none -mt-1 mb-1">
                <button
                  onClick={loadNewPosts}
                  role="status"
                  className="pointer-events-auto lf-new-post-pill flex items-center gap-2 px-4 py-2 rounded-full bg-[#242526] border border-[#00a86b]/50 shadow-xl text-[13px] font-extrabold text-[#00d67e] transition hover:border-[#00a86b] hover:text-white hover:bg-[#006a4e] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#00a86b]"
                >
                  <Sparkles className="w-4 h-4" />
                  {bn(newPostCount)}টি নতুন পোস্ট
                </button>
              </div>
            )}

            {/* লোডিং স্কেলেটন */}
            {postsLoading && (
              <div className="space-y-2.5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-[#242526] rounded-xl border border-[#3e4042] p-3 space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full lf-shimmer" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 w-32 lf-shimmer rounded" />
                        <div className="h-2.5 w-20 lf-shimmer rounded" />
                      </div>
                    </div>
                    <div className="h-3 w-full lf-shimmer rounded" />
                    <div className="h-3 w-4/5 lf-shimmer rounded" />
                    <div className="h-44 w-full lf-shimmer rounded-lg" />
                  </div>
                ))}
              </div>
            )}

            {/* এরর স্টেট */}
            {!postsLoading && error && (
              <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-6 text-center space-y-3">
                <p className="text-rose-400 font-semibold">{error}</p>
                <button
                  onClick={() => loadPosts(view, searchQuery)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#006a4e] hover:bg-[#00523c] rounded-lg text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-[#00a86b]"
                >
                  <RefreshCw className="w-4 h-4" /> আবার চেষ্টা করুন
                </button>
              </div>
            )}

            {/* খালি অবস্থা */}
            {!postsLoading && !error && posts.length === 0 && (
              <div className="bg-[#242526] border border-[#3e4042] rounded-xl p-8 text-center space-y-3">
                <span className="inline-flex w-14 h-14 rounded-full bg-[#3a3b3c] items-center justify-center">
                  {view === 'search' ? (
                    <SearchX className="w-7 h-7 text-[#00a86b]" />
                  ) : view === 'saved' ? (
                    <Bookmark className="w-7 h-7 text-[#00a86b]" />
                  ) : (
                    <Feather className="w-7 h-7 text-[#00a86b]" />
                  )}
                </span>
                <p className="font-bold text-white">
                  {view === 'search'
                    ? 'কিছু পাওয়া যায়নি'
                    : view === 'saved'
                      ? 'কোনো সেভ করা পোস্ট নেই'
                      : view === 'following'
                        ? 'অনুসরণ করা লেখকের লেখা নেই'
                        : tab === 'timeline'
                          ? 'এখনো কোনো পোস্ট নেই'
                          : 'ফিড খালি'}
                </p>
                <p className="text-sm text-[#b0b3b8] leading-relaxed max-w-sm mx-auto">
                  {view === 'search'
                    ? 'অন্য কীওয়ার্ড দিয়ে খুঁজে দেখুন — লেখা, লেখকের নাম বা জায়গা।'
                    : view === 'saved'
                      ? 'পোস্টের ৩-ডট মেনু থেকে "পোস্ট সেভ করুন" চাপলে এখানে জমা হবে।'
                      : view === 'following'
                        ? 'লেখকের প্রোফাইলে গিয়ে অনুসরণ করুন — তাঁদের নতুন লেখা এই ফিডে আসবে।'
                        : tab === 'timeline'
                          ? 'প্রথম লেখা শেয়ার করে শুরু করুন!'
                          : 'কমিউনিটিতে নতুন লেখাগুলো দেখতে কম্পোজার ব্যবহার করুন।'}
                </p>
              </div>
            )}

            {/* পোস্ট তালিকা */}
            {!postsLoading &&
              !error &&
              posts.map((post) => (
                <FeedPostCard
                  key={post.id}
                  post={post}
                  me={
                    current
                      ? {
                          id: current.id,
                          name: current.name,
                          username: current.username,
                          avatarUrl: current.avatarUrl,
                        }
                      : { id: '', name: '', username: '', avatarUrl: null }
                  }
                  users={users}
                  onUpdate={updatePost}
                  onDelete={deletePost}
                  onEdit={openEdit}
                  onBookmarkDelta={handleBookmarkDelta}
                  onSearchTag={searchTag}
                  onOpenProfile={openProfile}
                  onOpenGroup={openGroup}
                />
              ))}

            {/* ইনফিনিট-স্ক্রল সেন্টিনেল + ফলব্যাক বাটন */}
            {!postsLoading && !error && hasMore && (
              <div ref={sentinelRef} className="flex flex-col items-center gap-2 py-4">
                {loadingMore ? (
                  <div className="flex items-center gap-2 text-sm text-[#b0b3b8]" role="status">
                    <Loader2 className="w-4 h-4 animate-spin text-[#00a86b]" /> আরও পোস্ট লোড হচ্ছে...
                  </div>
                ) : (
                  <button
                    onClick={loadMore}
                    className="px-5 py-2 bg-[#242526] border border-[#3e4042] rounded-lg text-sm font-bold text-[#e4e6eb] hover:bg-[#3a3b3c] transition focus-visible:ring-2 focus-visible:ring-[#00a86b] active:scale-[0.97]"
                  >
                    আরও দেখুন
                  </button>
                )}
              </div>
            )}

            {/* শেষ — সব পোস্ট দেখা হয়েছে */}
            {!postsLoading && !error && !hasMore && posts.length > 0 && (
              <p className="text-center text-xs text-[#65676b] py-3 flex items-center justify-center gap-1.5">
                <span className="h-px w-8 bg-[#3e4042]" aria-hidden />
                সব পোস্ট দেখা হয়ে গেছে 🌿
                <span className="h-px w-8 bg-[#3e4042]" aria-hidden />
              </p>
            )}
            </>
            )}
          </div>

          <RightRail
            key={current?.id ?? 'anon'}
            onSearchTag={searchTag}
            onOpenProfile={openProfile}
            onNavigateToPost={scrollToPost}
            refreshKey={followRefreshKey}
          />
        </div>
      </main>

      {/* ═══ স্টিকি ফুটার ═══ */}
      <footer className="mt-auto bg-[#242526] border-t border-[#3e4042] py-4 px-4">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-[#8a8d91]">
          <p className="flex items-center gap-1.5">
            <Feather className="w-3.5 h-3.5 text-[#00a86b]" />
            লেখক ফোরাম — বাংলা লেখকদের নিজের ঠিকানা © ২০২৫
          </p>
          <div className="flex items-center gap-3">
            <span className="hover:text-[#e4e6eb] cursor-pointer transition">গোপনীয়তা</span>
            <span className="hover:text-[#e4e6eb] cursor-pointer transition">শর্তাবলী</span>
            <span className="hover:text-[#e4e6eb] cursor-pointer transition">সহায়তা</span>
          </div>
        </div>
      </footer>

      {/* ═══ back-to-top ═══ */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="উপরে যান"
          className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full bg-[#242526] border border-[#3e4042] shadow-xl flex items-center justify-center text-[#e4e6eb] hover:bg-[#3a3b3c] hover:-translate-y-0.5 transition focus-visible:ring-2 focus-visible:ring-[#00a86b] lf-anim-pop"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* ═══ Session I: নিজের ফলো-লিস্ট মডাল (টাইমলাইন-হেডার স্ট্যাট থেকে) ═══ */}
      {followModal && current && (
        <FollowListModal
          username={followModal.username}
          displayName={followModal.name}
          initialTab={followModal.tab}
          onClose={() => setFollowModal(null)}
          onOpenProfile={openProfile}
        />
      )}

      {/* ═══ Session K: নতুন গ্রুপ-তৈরির মডাল ═══ */}
      <CreateGroupModal
        isOpen={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        onCreated={(gid) => {
          setGroupsRefreshKey((k) => k + 1)
          openGroup(gid)
        }}
      />

      {/* ═══ কম্পোজার মডাল (নতুন + এডিট) ═══ */}
      <CreatePostModal
        isOpen={composerOpen}
        onClose={() => {
          setComposerOpen(false)
          setEditPost(null)
        }}
        currentUser={current}
        users={users}
        onPostSuccess={() => loadPosts(view, searchQuery)}
        editPost={editPost}
      />

      {/* লোডিং ওভারলে (প্রাথমিক) */}
      {loading && (
        <div className="fixed inset-0 z-[90] bg-[#18191a] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="w-14 h-14 rounded-full bg-[#006a4e] flex items-center justify-center">
              <Feather className="w-7 h-7 text-white" />
            </span>
            <Loader2 className="w-5 h-5 animate-spin text-[#00a86b]" />
            <p className="text-sm text-[#b0b3b8]">লেখক ফোরাম লোড হচ্ছে...</p>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number | string
  label: string
}) {
  return (
    <div className="flex flex-col items-center py-3 gap-0.5">
      <span className="flex items-center gap-1.5 text-white font-extrabold text-base">
        <span className="text-[#00a86b]">{icon}</span>
        {value}
      </span>
      <span className="text-[11px] text-[#8a8d91]">{label}</span>
    </div>
  )
}
