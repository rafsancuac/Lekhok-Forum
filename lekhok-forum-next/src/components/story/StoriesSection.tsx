'use client'

import React, { useCallback, useEffect, useState } from 'react'
import type { FrontendUser } from '@/lib/types'
import type { StoryRing } from '@/lib/story-data'
import StoriesBar from './StoriesBar'
import StoryViewer from './StoryViewer'
import CreateStoryModal from './CreateStoryModal'

/**
 * স্টোরি-সেকশন: বার + ভিউয়ার + ক্রিয়েটর — নিজের ডেটা নিজে ফেচ করে।
 * page.tsx শুধু <StoriesSection current={current} /> রেন্ডার করবে।
 * Session G: openStoryId দিলে নির্দিষ্ট স্টোরি নিয়ে ভিউয়ার সরাসরি খোলে (?story= ডিপ-লিংক/নোটিফিকেশন)।
 */
export default function StoriesSection({
  current,
  openStoryId,
  onStoryConsumed,
}: {
  current: FrontendUser | null
  openStoryId?: string | null
  onStoryConsumed?: () => void
}) {
  const [rings, setRings] = useState<StoryRing[]>([])
  const [loading, setLoading] = useState(true)
  const [viewerRing, setViewerRing] = useState<number | null>(null)
  const [viewerStoryIdx, setViewerStoryIdx] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/stories')
      if (!res.ok) return
      const data = await res.json()
      setRings(data.rings || [])
    } catch {
      /* silent — বার খালি থাকবে */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (current) load()
  }, [current, load])

  /* ─── Session G: ডিপ-লিংক/নোটিফিকেশন → নির্দিষ্ট স্টোরি ওপেন ─── */
  useEffect(() => {
    if (!openStoryId) return
    if (loading) return // লোড শেষ হলে এই এফেক্ট আবার চলবে
    if (rings.length === 0) {
      // কোনো সক্রিয় স্টোরিই নেই — pending ক্লিয়ার
      onStoryConsumed?.()
      return
    }
    let ringI = -1
    let storyI = 0
    rings.forEach((r, ri) => {
      const si = r.stories.findIndex((s) => s.id === openStoryId)
      if (si >= 0) {
        ringI = ri
        storyI = si
      }
    })
    if (ringI >= 0) {
      setViewerStoryIdx(storyI)
      setViewerRing(ringI)
    }
    // পাওয়া না গেলেও (মেয়াদ শেষ/ডিলিট) pending ক্লিয়ার করি — অনন্ত অপেক্ষা এড়াতে
    onStoryConsumed?.()
  }, [openStoryId, rings, loading, onStoryConsumed])

  /* মাঝে মাঝে রিফ্রেশ (নতুন স্টোরি/মেয়াদ শেষ হ্যান্ডল করতে) */
  useEffect(() => {
    const t = setInterval(() => {
      if (!viewerRing && !createOpen) load()
    }, 60_000)
    return () => clearInterval(t)
  }, [load, viewerRing, createOpen])

  const markViewed = useCallback((storyId: string) => {
    setRings((prev) =>
      prev.map((r) => ({
        ...r,
        allSeen: r.stories.every((s) => s.id === storyId || s.viewed),
        stories: r.stories.map((s) => (s.id === storyId ? { ...s, viewed: true } : s)),
      }))
    )
  }, [])

  const removeStory = useCallback((storyId: string) => {
    setRings((prev) =>
      prev
        .map((r) => ({ ...r, stories: r.stories.filter((s) => s.id !== storyId) }))
        .filter((r) => r.stories.length > 0)
    )
  }, [])

  return (
    <>
      <StoriesBar
        current={current}
        rings={rings}
        loading={loading}
        onOpenRing={(idx) => setViewerRing(idx)}
        onCreate={() => setCreateOpen(true)}
      />

      {viewerRing !== null && rings[viewerRing] && (
        <StoryViewer
          rings={rings}
          startRing={viewerRing}
          startStoryIdx={viewerStoryIdx}
          onClose={() => {
            setViewerRing(null)
            setViewerStoryIdx(0)
            load()
          }}
          onViewed={markViewed}
          onDeleted={removeStory}
        />
      )}

      {current && (
        <CreateStoryModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={load}
          authorName={current.name}
        />
      )}
    </>
  )
}
