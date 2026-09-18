'use client'

import React, { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { MediaItem } from './PostMediaCollage'
import { bn } from '@/lib/format'

export default function Lightbox({
  media,
  index,
  onClose,
  onNavigate,
}: {
  media: MediaItem[]
  index: number
  onClose: () => void
  onNavigate: (newIndex: number) => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && index > 0) onNavigate(index - 1)
      if (e.key === 'ArrowRight' && index < media.length - 1) onNavigate(index + 1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onNavigate, index, media.length])

  if (index < 0 || index >= media.length) return null
  const item = media[index]
  const hasPrev = index > 0
  const hasNext = index < media.length - 1

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center lf-anim-fade"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="মিডিয়া ভিউয়ার"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] flex items-center justify-center text-white z-10 transition"
        aria-label="বন্ধ করুন"
      >
        <X className="w-5 h-5" />
      </button>

      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(index - 1)
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#3a3b3c]/80 hover:bg-[#4e4f50] flex items-center justify-center text-white z-10 transition"
          aria-label="আগের মিডিয়া"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(index + 1)
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#3a3b3c]/80 hover:bg-[#4e4f50] flex items-center justify-center text-white z-10 transition"
          aria-label="পরের মিডিয়া"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div
        className="max-w-[92vw] max-h-[88vh] flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === 'VIDEO' ? (
          <video
            key={item.id}
            src={item.url}
            controls
            autoPlay
            className="max-w-[92vw] max-h-[82vh] object-contain"
          />
        ) : item.type === 'AUDIO' ? (
          <audio key={item.id} src={item.url} controls autoPlay className="w-[320px]" />
        ) : (
          <img
            key={item.id}
            src={item.url}
            alt={`ছবি ${index + 1}`}
            className="max-w-[92vw] max-h-[82vh] object-contain rounded-lg"
          />
        )}
        <p className="text-[#b0b3b8] text-sm">
          {bn(index + 1)} / {bn(media.length)}
        </p>
      </div>
    </div>
  )
}
