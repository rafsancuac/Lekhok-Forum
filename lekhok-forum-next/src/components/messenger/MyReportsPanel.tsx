'use client';

/**
 * session203 (Task 54) — "আমার অভিযোগ" প্যানেল (ইউজার-দিকের স্টেটাস-ভিউ)
 *
 * অফিসিয়াল সাপোর্ট-থ্রেডের হিন্ট-বার থেকে খোলে। ইউজার নিজের পাঠানো অভিযোগগুলোর
 * স্টেটাস (অপেক্ষমাণ/চলছে/সমাধান) + ম্যানেজমেন্টের অফিসিয়াল জবাব (adminNote) দেখতে পায়।
 * ডেটা: GET /api/support/my-reports (শুধু নিজের অভিযোগ — সার্ভার-গার্ডকৃত)।
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, ShieldCheck, X, MessageSquare, Image as ImageIcon, Mic, Video, RefreshCw, BellRing } from 'lucide-react';
import { bn } from '@/lib/format';
import { getSeenMs, markSeen, hasNewReply, MY_REPORTS_SEEN_EVENT } from '@/lib/my-reports-seen';

interface MyReport {
  id: string;
  messageText: string;
  mediaType: string; // TEXT | IMAGE | AUDIO | VIDEO
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_META: Record<string, { label: string; dot: string; chip: string }> = {
  PENDING: { label: 'অপেক্ষমাণ', dot: 'bg-amber-400', chip: 'bg-amber-400/15 text-amber-300 border-amber-400/30' },
  IN_PROGRESS: { label: 'চলছে', dot: 'bg-sky-400', chip: 'bg-sky-400/15 text-sky-300 border-sky-400/30' },
  RESOLVED: { label: 'সমাধান', dot: 'bg-[#00a86b]', chip: 'bg-[#00a86b]/15 text-[#33d79f] border-[#00a86b]/30' },
};

const MEDIA_ICON: Record<string, React.ReactNode> = {
  TEXT: <MessageSquare className="w-3.5 h-3.5" aria-hidden />,
  IMAGE: <ImageIcon className="w-3.5 h-3.5" aria-hidden />,
  AUDIO: <Mic className="w-3.5 h-3.5" aria-hidden />,
  VIDEO: <Video className="w-3.5 h-3.5" aria-hidden />,
};
const MEDIA_LABEL: Record<string, string> = {
  TEXT: 'লেখা',
  IMAGE: 'ছবি',
  AUDIO: 'অডিও',
  VIDEO: 'ভিডিও',
};

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'এইমাত্র';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${bn(mins)} মিনিট আগে`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${bn(hours)} ঘণ্টা আগে`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${bn(days)} দিন আগে`;
  return new Date(iso).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long' });
}

type FilterKey = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

export default function MyReportsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [reports, setReports] = useState<MyReport[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({ PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const panelRef = useRef<HTMLDivElement>(null);
  // session204 (Task 55) — "নতুন জবাব" অপঠিত-ট্র্যাকিং (localStorage last-seen)
  const [seenMs, setSeenMs] = useState(0);
  const loadedRef = useRef(false); // এই-ওপেনে সফল-লোড হয়েছে? (error-অবস্থায় markSeen নয়)

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/support/my-reports');
      if (!res.ok) throw new Error('অভিযোগ লোড ব্যর্থ');
      const data = await res.json();
      setReports(data.reports || []);
      setCounts(data.counts || { PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0 });
      loadedRef.current = true;
      setSeenMs(getSeenMs());
    } catch (err) {
      console.error('[আমার অভিযোগ]', err);
      setError(err instanceof Error ? err.message : 'অভিযোগ লোড ব্যর্থ');
    } finally {
      setLoading(false);
    }
  }, []);

  // খোলা হলে ফ্রেশ-লোড (অভিযোগ পাঠানোর পরেও লাইভ-স্টেট)
  useEffect(() => {
    if (open) load();
  }, [open, load]);

  // session204 — প্যানেল বন্ধ হলে সফল-লোড-হলে "দেখা হলো" চিহ্নিত (পড়ার-সময় ব্যাজ থাকে,
  // পরের-ওপেনে নতুন-আপডেট ছাড়া ব্যাজ নেই — স্ট্যান্ডার্ড unread-প্যাটার্ন)
  useEffect(() => {
    if (!open && loadedRef.current) {
      markSeen();
      setSeenMs(getSeenMs());
    }
  }, [open]);

  // session204 — অন্য-কোথাও markSeen হলে (ইভেন্ট) seenMs লাইভ-সিঙ্ক
  useEffect(() => {
    const sync = () => setSeenMs(getSeenMs());
    window.addEventListener(MY_REPORTS_SEEN_EVENT, sync);
    return () => window.removeEventListener(MY_REPORTS_SEEN_EVENT, sync);
  }, []);

  // Esc-এ বন্ধ
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = filter === 'ALL' ? reports : reports.filter((r) => r.status === filter);

  // session204 — অপঠিত-জবাব সেট (আপডেট > max(lastSeen, createdAt))
  const unreadIds = new Set(
    reports.filter((r) => hasNewReply(r.updatedAt, r.createdAt, seenMs)).map((r) => r.id)
  );
  const unreadCount = unreadIds.size;

  const FILTERS: { key: FilterKey; label: string; count: number }[] = [
    { key: 'ALL', label: 'সব', count: reports.length },
    { key: 'PENDING', label: 'অপেক্ষমাণ', count: counts.PENDING || 0 },
    { key: 'IN_PROGRESS', label: 'চলছে', count: counts.IN_PROGRESS || 0 },
    { key: 'RESOLVED', label: 'সমাধান', count: counts.RESOLVED || 0 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 lf-anim-fade"
      role="dialog"
      aria-modal="true"
      aria-label="আমার অভিযোগ"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="w-full sm:max-w-md max-h-[85vh] sm:max-h-[70vh] flex flex-col bg-[#242526] border border-[#3e4042] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden lf-anim-pop origin-bottom sm:origin-center"
      >
        {/* হেডার */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3e4042] bg-[#242526] shrink-0">
          <h2 className="flex items-center gap-2 font-extrabold text-white text-[15px]">
            <span className="w-7 h-7 rounded-full bg-[#00a86b]/15 border border-[#00a86b]/35 flex items-center justify-center text-[#33d79f]">
              <ShieldCheck className="w-4 h-4" aria-hidden />
            </span>
            আমার অভিযোগ
            {unreadCount > 0 && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 lf-anim-fade"
                aria-label={`${bn(unreadCount)}টি নতুন জবাব`}
              >
                <BellRing className="w-3 h-3 animate-pulse" aria-hidden />
                {bn(unreadCount)} নতুন
              </span>
            )}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={load}
              disabled={loading}
              aria-label="রিফ্রেশ"
              title="রিফ্রেশ"
              className="w-8 h-8 rounded-full text-[#b0b3b8] hover:bg-[#3a3b3c] hover:text-white flex items-center justify-center transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              aria-label="বন্ধ করুন"
              title="বন্ধ করুন"
              className="w-8 h-8 rounded-full text-[#b0b3b8] hover:bg-[#3a3b3c] hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* স্টেটাস-ফিল্টার চিপ */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#3e4042] bg-[#1c1d1e] overflow-x-auto lf-scroll shrink-0" role="tablist" aria-label="স্টেটাস ফিল্টার">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 inline-flex items-center gap-1.5 text-[11.5px] font-bold px-2.5 py-1 rounded-full border transition ${
                  active
                    ? 'bg-[#00a86b]/20 text-[#33d79f] border-[#00a86b]/45'
                    : 'bg-transparent text-[#b0b3b8] border-[#3e4042] hover:bg-[#3a3b3c] hover:text-white'
                }`}
              >
                {f.label}
                <span className={`text-[10px] font-extrabold px-1.5 rounded-full ${active ? 'bg-[#00a86b]/25' : 'bg-[#3a3b3c]'}`}>
                  {bn(f.count)}
                </span>
              </button>
            );
          })}
        </div>

        {/* লিস্ট */}
        <div className="flex-1 min-h-0 overflow-y-auto lf-scroll p-3 space-y-2">
          {loading && reports.length === 0 ? (
            <div className="space-y-2" aria-label="লোড হচ্ছে">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-xl border border-[#3e4042] bg-[#2c2d2e] p-3 space-y-2">
                  <div className="h-3.5 w-2/3 rounded lf-shimmer" />
                  <div className="h-3 w-1/3 rounded lf-shimmer" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <ShieldCheck className="w-8 h-8 text-[#65676b]" aria-hidden />
              <p className="text-[13px] text-rose-300">{error}</p>
              <button
                onClick={load}
                className="text-[12px] font-bold text-[#00a86b] hover:text-[#00c471] transition"
              >
                আবার চেষ্টা করুন
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <span className="w-14 h-14 rounded-full bg-[#00a86b]/10 border border-[#00a86b]/25 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-[#33d79f]" aria-hidden />
              </span>
              {reports.length === 0 ? (
                <>
                  <p className="text-[13.5px] font-bold text-white">এখনো কোনো অভিযোগ নেই</p>
                  <p className="text-[11.5px] text-[#8a8d91] max-w-[260px] leading-relaxed">
                    সাপোর্ট কেন্দ্রে অভিযোগ পাঠালে সেটি এখানে দেখা যাবে — স্টেটাস ও ম্যানেজমেন্টের জবাবসহ।
                  </p>
                </>
              ) : (
                <p className="text-[12.5px] text-[#8a8d91]">এই স্টেটাসে কোনো অভিযোগ নেই</p>
              )}
            </div>
          ) : (
            filtered.map((r) => {
              const meta = STATUS_META[r.status] || STATUS_META.PENDING;
              const isNew = unreadIds.has(r.id);
              return (
                <article
                  key={r.id}
                  aria-label={isNew ? 'এই অভিযোগে নতুন জবাব এসেছে' : undefined}
                  className={`relative rounded-xl border border-[#3e4042] bg-[#2c2d2e] p-3 space-y-2 lf-anim-fade transition-all hover:border-[#00a86b]/30 hover:-translate-y-px hover:shadow-lg hover:shadow-black/20 ${
                    isNew ? 'ring-1 ring-amber-400/35' : ''
                  }`}
                  style={{ borderLeftWidth: '3px', borderLeftColor: isNew ? '#fbbf24' : 'rgba(62,64,66,1)' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#b0b3b8]">
                      <span className="w-5 h-5 rounded-full bg-[#3a3b3c] flex items-center justify-center text-[#8a8d91]">
                        {MEDIA_ICON[r.mediaType] || MEDIA_ICON.TEXT}
                      </span>
                      {MEDIA_LABEL[r.mediaType] || 'লেখা'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      {isNew && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/45 text-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden />
                          নতুন জবাব
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10.5px] font-extrabold px-2 py-0.5 rounded-full border ${meta.chip}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} aria-hidden />
                        {meta.label}
                      </span>
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#e4e6eb] leading-relaxed break-words whitespace-pre-wrap line-clamp-4">
                    {r.messageText}
                  </p>
                  {r.adminNote && (
                    <div className="rounded-lg rounded-l-none bg-[#006a4e]/15 border border-l-2 border-[#00a86b]/25 border-l-[#00a86b]/60 px-2.5 py-2" role="note" aria-label="অ্যাডমিনের জবাব">
                      <p className="text-[10px] font-extrabold text-[#33d79f] uppercase tracking-wide mb-0.5">
                        ম্যানেজমেন্টের জবাব
                      </p>
                      <p className="text-[12px] text-[#cdeee1] leading-relaxed break-words whitespace-pre-wrap">
                        {r.adminNote}
                      </p>
                    </div>
                  )}
                  <p className="text-[10px] text-[#65676b] text-right">
                    পাঠানো: {timeAgo(r.createdAt)}
                    {r.updatedAt !== r.createdAt ? ` · হালনাগাদ: ${timeAgo(r.updatedAt)}` : ''}
                  </p>
                </article>
              );
            })
          )}
        </div>

        {/* ফুটার-হিন্ট */}
        <div className="px-4 py-2 border-t border-[#3e4042] bg-[#1c1d1e] shrink-0">
          <p className="text-[10px] text-[#65676b] text-center leading-relaxed">
            নতুন অভিযোগ পাঠাতে এই সাপোর্ট-চ্যাটেই লিখুন বা ভয়েস পাঠান — প্রতিটি অভিযোগ রিভিউ-ডেস্কে রেকর্ড হয়
          </p>
        </div>
      </div>
    </div>
  );
}
