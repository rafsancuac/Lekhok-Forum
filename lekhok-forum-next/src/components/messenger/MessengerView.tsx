'use client';

/**
 * Session L — মেসেঞ্জার ভিউ (ফেসবুক-স্টাইল দুই-প্যান চ্যাট)
 *
 * - বাম: কথোপকথনের তালিকা (অংশীদার + শেষ মেসেজ-প্রিভিউ + অপঠিত ব্যাজ + বাংলাদেশ-সময়)
 * - ডান: থ্রেড (ডেট-সেপারেটর, টেক্সট-বাবল, ভয়েস-বাবল, কম্পোজার + ভয়েস-রেকর্ডার)
 * - মোবাইল: তালিকা ↔ থ্রেড সোয়াপ (ব্যাক-বাটনসহ)
 * - পোলিং: থ্রেড ৮ সেকেন্ড, তালিকা ২০ সেকেন্ড (document.hidden হলে স্কিপ)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  CircleAlert,
  Loader2,
  MessageCircleDashed,
  MessagesSquare,
  Mic,
  Pin,
  Send,
  Search,
  ShieldCheck,
  Phone,
  Video,
  X,
} from 'lucide-react';
import type { FrontendUser } from '@/lib/types';
import { bn } from '@/lib/format';
import { formatBdTime, formatBdDayLabel } from '@/lib/formatBdTime';
import VoiceRecorder from './VoiceRecorder';
import VoiceMessageBubble from './VoiceMessageBubble';
import MyReportsPanel from './MyReportsPanel';

interface Me {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
}

interface ConvItem {
  id: string;
  updatedAt: string;
  other: { id: string; name: string; username: string; avatarUrl?: string | null };
  lastMessage: {
    id: string;
    type: string;
    content: string | null;
    senderName: string;
    createdAt: string;
    isMine: boolean;
  } | null;
  unreadCount: number;
  // Task 43 — অফিসিয়াল সাপোর্ট-পিন (সার্ভার-ইনজেক্টেড, আনপিন/ডিলিট-অযোগ্য)
  isSupportOfficial?: boolean;
  isPinned?: boolean;
  supportUserId?: string; // প্লেসহোল্ডার-রো ক্লিকে find-or-create রেজলভ
}

interface MsgItem {
  id: string;
  type: string;
  content: string | null;
  audioUrl: string | null;
  duration: number | null;
  createdAt: string;
  isMine: boolean;
  readAt: string | null;
}

export default function MessengerView({ me, users }: { me: Me; users: FrontendUser[] }) {
  const [conversations, setConversations] = useState<ConvItem[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [convError, setConvError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MsgItem[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [search, setSearch] = useState('');
  const [mobileThread, setMobileThread] = useState(false);
  // ইনলাইন এরর-টোস্ট (ব্রাউজারের alert() পপ-আপ-মুক্ত — FB-প্যারিটি)
  const [actionError, setActionError] = useState<string | null>(null);
  // session203 (Task 54) — ইউজার-দিকের "আমার অভিযোগ" স্টেটাস-প্যানেল
  const [myReportsOpen, setMyReportsOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;
  const errTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // এরর লগিং কনসোলে + ব্যবহারকারীর কাছে ইনলাইন টোস্টে (৫ সেকেন্ডে নিজেই মুছে যায়)
  const reportError = useCallback((err: unknown, fallback: string) => {
    console.error('[মেসেঞ্জার]', err);
    setActionError(err instanceof Error && err.message ? err.message : fallback);
    if (errTimerRef.current) clearTimeout(errTimerRef.current);
    errTimerRef.current = setTimeout(() => setActionError(null), 5000);
  }, []);
  const dismissError = useCallback(() => {
    if (errTimerRef.current) clearTimeout(errTimerRef.current);
    setActionError(null);
  }, []);
  useEffect(
    () => () => {
      if (errTimerRef.current) clearTimeout(errTimerRef.current);
    },
    []
  );

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  /* ─── স্ক্রল-বটম হেল্পার ─── */
  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  /* ─── কথোপকথনের তালিকা লোড ─── */
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages/conversations');
      if (!res.ok) throw new Error('fail');
      const data = await res.json();
      setConversations(data.conversations || []);
      setConvError(null);
    } catch {
      setConvError('কথোপকথন লোড করা যায়নি');
    } finally {
      setConvLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /* ─── থ্রেড লোড (খুললেই অপঠিত 'পড়া' হয় — তালিকাও রিফ্রেশ) ─── */
  const loadThread = useCallback(
    async (id: string, initial = false) => {
      if (initial) setThreadLoading(true);
      try {
        const res = await fetch(`/api/messages/conversations/${id}`);
        if (!res.ok) throw new Error('fail');
        const data = await res.json();
        // ইউজার মাঝপথে অন্য থ্রেড খুললে পুরোনো রেসপন্স বাদ
        if (activeIdRef.current !== id) return;
        setMessages((prev) => {
          // পোলে নতুন মেসেজ এলে স্বয়ংক্রিয়-স্ক্রল; না এলে স্ক্রল অক্ষত
          if (prev.length !== data.messages.length) {
            setTimeout(() => scrollToBottom(prev.length === 0), 60);
          }
          return data.messages;
        });
        if (initial) setThreadLoading(false);
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
        );
      } catch {
        if (initial) setThreadLoading(false);
      }
    },
    [scrollToBottom]
  );

  const openConversation = useCallback(
    (id: string) => {
      setActiveId(id);
      setMessages([]);
      setMobileThread(true);
      loadThread(id, true);
    },
    [loadThread]
  );

  /* ─── পোলিং: থ্রেড ৮ সে / তালিকা ২০ সে (hidden-ট্যাবে স্কিপ) ─── */
  useEffect(() => {
    const threadTimer = setInterval(() => {
      if (document.hidden) return;
      const id = activeIdRef.current;
      if (id) loadThread(id);
    }, 8000);
    const convTimer = setInterval(() => {
      if (document.hidden) return;
      loadConversations();
    }, 20000);
    return () => {
      clearInterval(threadTimer);
      clearInterval(convTimer);
    };
  }, [loadThread, loadConversations]);

  /* ─── টেক্সট পাঠানো (Enter) ─── */
  const sendText = useCallback(async () => {
    const content = draft.trim();
    const id = activeIdRef.current;
    if (!content || !id || sending) return;
    setSending(true);
    setDraft('');
    try {
      const res = await fetch(`/api/messages/conversations/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'পাঠানো ব্যর্থ');
      }
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setTimeout(() => scrollToBottom(), 60);
      window.dispatchEvent(new CustomEvent('lf:messages-changed'));
      loadConversations();
    } catch (err) {
      setDraft(content); // ড্রাফট ফেরত
      reportError(err, 'মেসেজ পাঠানো ব্যর্থ'); // ইনলাইন টোস্ট — কোনো alert() নেই
    } finally {
      setSending(false);
    }
  }, [draft, sending, loadConversations, scrollToBottom, reportError]);

  /* ─── ভয়েস পাঠানো: আপলোড → duration-সহ মেসেজ (০:০০-বাগ-স্থায়ী-সমাধান) ─── */
  const sendVoice = useCallback(
    async (blob: Blob, duration: number) => {
      const id = activeIdRef.current;
      if (!id) return;
      setUploadingVoice(true);
      try {
        // ১) ব্লব সার্ভারে আপলোড (/api/upload — audio/webm → weba)
        const form = new FormData();
        form.append('files', blob, `voice-${Date.now()}.webm`);
        const upRes = await fetch('/api/upload', { method: 'POST', body: form });
        if (!upRes.ok) throw new Error('ভয়েস আপলোড ব্যর্থ');
        const upData = await upRes.json();
        const audioUrl: string | undefined = upData.media?.[0]?.url;
        if (!audioUrl) throw new Error('ভয়েস আপলোড ব্যর্থ');

        // ২) রেকর্ডার-গোনা রিয়েল সেকেন্ধসহ মেসেজ পাঠানো
        const res = await fetch(`/api/messages/conversations/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'VOICE', audioUrl, duration }),
        });
        if (!res.ok) throw new Error('ভয়েস মেসেজ পাঠানো ব্যর্থ');
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setTimeout(() => scrollToBottom(), 60);
        window.dispatchEvent(new CustomEvent('lf:messages-changed'));
        loadConversations();
      } catch (err) {
        // ইনলাইন টোস্ট — কুৎসিত alert() পপ-আপ চিরতরে বন্ধ
        reportError(err, 'ভয়েস পাঠানো ব্যর্থ — আবার চেষ্টা করুন');
      } finally {
        setUploadingVoice(false);
      }
    },
    [loadConversations, scrollToBottom, reportError]
  );

  /* ─── নতুন কথোপকথন (লেখকবৃন্দ থেকে) ─── */
  const startWith = useCallback(
    async (userId: string) => {
      try {
        const res = await fetch('/api/messages/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        if (!res.ok) throw new Error('fail');
        const data = await res.json();
        await loadConversations();
        openConversation(data.conversationId);
      } catch (err) {
        reportError(err, 'কথোপকথন শুরু করা যায়নি — আবার চেষ্টা করুন');
      }
    },
    [loadConversations, openConversation, reportError]
  );

  /* ─── তালিকা-রো ক্লিক: প্লেসহোল্ডার-সাপোর্ট হলে find-or-create রেজলভ, না-হলে সরাসরি খোলা ───
     RCA (Task 43): threadIdRef(API-আইডি) বনাম activeIdRef(তালিকা-আইডি) আলাদা —
     প্লেসহোল্ডার-আইডি 'system-support-chat' কখনো থ্রেড-ফেচে যায় না; আগে বাস্তব-আইডি নিয়ে আসি। */
  const openConvRow = useCallback(
    async (c: ConvItem) => {
      if (c.id === 'system-support-chat' && c.supportUserId) {
        await startWith(c.supportUserId);
        return;
      }
      openConversation(c.id);
    },
    [openConversation, startWith]
  );

  /* ─── session203 (Task 54): SUPPORT_UPDATE-নোটিফিকেশন ক্লিকে সাপোর্ট-থ্রেড খোলা
     + "আমার অভিযোগ" স্টেটাস-প্যানেল ওপেন (হোম-পেজ মেসেঞ্জার-ভিউ ইতোমধ্যে খুলে দেয়) ─── */
  useEffect(() => {
    const onOpenSupport = () => {
      const supportRow = conversations.find((c) => c.isSupportOfficial);
      if (supportRow) {
        void openConvRow(supportRow);
        setMobileThread(true);
      }
      setMyReportsOpen(true);
    };
    window.addEventListener('lf:open-support-chat', onOpenSupport as EventListener);
    return () => window.removeEventListener('lf:open-support-chat', onOpenSupport as EventListener);
  }, [conversations, openConvRow]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => u.id !== me.id && (!q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)));
  }, [users, me.id, search]);

  const filteredConvs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) => c.other.name.toLowerCase().includes(q) || c.other.username.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  const previewText = (m: ConvItem['lastMessage']) => {
    if (!m) return 'নতুন কথোপকথন';
    if (m.type === 'VOICE') return '🎙️ ভয়েস মেসেজ';
    return m.content || '';
  };

  const isSupportRow = (c: ConvItem) => !!c.isSupportOfficial;

  /* ═══ থ্রেড-প্যান ═══ */
  const threadPane = (
    <div className="flex flex-col h-full min-h-0">
      {activeConv ? (
        <>
          {/* থ্রেড হেডার */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[#3e4042] bg-[#242526] shrink-0">
            <button
              onClick={() => setMobileThread(false)}
              className="lg:hidden w-9 h-9 rounded-full hover:bg-[#3a3b3c] flex items-center justify-center text-[#b0b3b8]"
              aria-label="তালিকায় ফিরে যান"
              type="button"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {activeConv.other.avatarUrl ? (
              <img
                src={activeConv.other.avatarUrl}
                alt=""
                className="w-10 h-10 rounded-full ring-1 ring-white/10"
              />
            ) : (
              <span className="w-10 h-10 rounded-full bg-[#4e4f50]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white text-[15px] leading-tight truncate flex items-center gap-1.5">
                <span className="truncate">{activeConv.other.name}</span>
                {activeConv.isSupportOfficial && (
                  <span
                    className="shrink-0 inline-flex items-center gap-1 text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#00a86b]/20 text-[#33d79f] border border-[#00a86b]/40"
                    title="অফিসিয়াল সাপোর্ট — পিন-লক"
                  >
                    <ShieldCheck className="w-3 h-3" aria-hidden />
                    অফিসিয়াল সাপোর্ট
                  </span>
                )}
              </p>
              <p className="text-[11px] text-[#8a8d91] truncate">@{activeConv.other.username}</p>
            </div>
            <button
              className="w-9 h-9 rounded-full hover:bg-[#3a3b3c] flex items-center justify-center text-[#00a86b]"
              aria-label="ভয়েস কল (ডেমোতে নেই)"
              title="ভয়েস কল — শীঘ্রই আসছে"
              type="button"
            >
              <Phone className="w-4.5 h-4.5" />
            </button>
            <button
              className="w-9 h-9 rounded-full hover:bg-[#3a3b3c] flex items-center justify-center text-[#00a86b]"
              aria-label="ভিডিও কল (ডেমোতে নেই)"
              title="ভিডিও কল — শীঘ্রই আসছে"
              type="button"
            >
              <Video className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Task 43: সাপোর্ট-কেন্দ্র স্ট্যাটিক-হিন্ট (শুধু অফিসিয়াল সাপোর্ট-থ্রেডে) + session203: আমার-অভিযোগ বাটন */}
          {activeConv.isSupportOfficial && (
            <div
              role="note"
              aria-label="সাপোর্ট কেন্দ্র বিজ্ঞপ্তি"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#006a4e]/20 border-b border-[#00a86b]/25 text-[11px] text-[#33d79f] shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1 truncate">
                সাপোর্ট কেন্দ্র — এখানে পাঠানো প্রতিটি অভিযোগ ম্যানেজমেন্টের রিভিউ-ডেস্কে রেকর্ড হয়
              </span>
              <button
                type="button"
                onClick={() => setMyReportsOpen(true)}
                className="shrink-0 inline-flex items-center gap-1 text-[10.5px] font-extrabold px-2 py-0.5 rounded-full bg-[#00a86b]/20 border border-[#00a86b]/40 text-[#33d79f] hover:bg-[#00a86b]/30 hover:text-white transition focus-visible:ring-2 focus-visible:ring-[#00a86b]"
                aria-haspopup="dialog"
                aria-expanded={myReportsOpen}
                title="আমার পাঠানো অভিযোগের স্টেটাস ও ম্যানেজমেন্টের জবাব"
              >
                <ShieldCheck className="w-3 h-3" aria-hidden />
                আমার অভিযোগ
              </button>
            </div>
          )}

          {/* মেসেজ-লিস্ট */}
          <div
            ref={scrollRef}
            className="flex-1 min-h-0 overflow-y-auto lf-scroll px-3 py-3 flex flex-col"
          >
            {threadLoading && messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#00a86b]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-10">
                {activeConv.other.avatarUrl ? (
                  <img
                    src={activeConv.other.avatarUrl}
                    alt=""
                    className="w-16 h-16 rounded-full ring-2 ring-[#00a86b]/30"
                  />
                ) : (
                  <span className="w-16 h-16 rounded-full bg-[#4e4f50]" />
                )}
                <p className="font-bold text-white">{activeConv.other.name}</p>
                <p className="text-xs text-[#8a8d91]">
                  {activeConv.isSupportOfficial
                    ? 'সাপোর্ট কেন্দ্রে স্বাগতম — অভিযোগ লিখুন বা ভয়েস পাঠান 🛡️'
                    : 'কথোপকথন শুরু করুন — টেক্সট লিখুন বা ভয়েস পাঠান 🎙️'}
                </p>
              </div>
            ) : (
              messages.map((m, i) => {
                const prev = messages[i - 1];
                const dayLabel = formatBdDayLabel(m.createdAt);
                const prevDay = prev ? formatBdDayLabel(prev.createdAt) : null;
                const showDay = dayLabel !== prevDay;
                const grouped = !showDay && prev && prev.isMine === m.isMine && new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60_000;

                return (
                  <React.Fragment key={m.id}>
                    {showDay && (
                      <div className="flex justify-center my-3" aria-hidden="false">
                        <span className="text-[11px] font-bold text-[#8a8d91] bg-[#3a3b3c]/70 px-3 py-1 rounded-full">
                          {dayLabel}
                        </span>
                      </div>
                    )}
                    {m.type === 'VOICE' && m.audioUrl ? (
                      <div className={grouped ? '-mt-1' : 'mt-1.5'}>
                        <VoiceMessageBubble
                          audioUrl={m.audioUrl}
                          duration={m.duration ?? 0}
                          createdAt={m.createdAt}
                          isSender={m.isMine}
                          status={m.readAt ? 'SEEN' : 'DELIVERED'}
                        />
                      </div>
                    ) : (
                      <div
                        className={`flex my-0.5 ${m.isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[78%] sm:max-w-[65%] px-3.5 py-2 text-[14.5px] leading-relaxed rounded-[18px] shadow-sm ${
                            m.isMine
                              ? 'bg-[#006a4e] text-white rounded-br-md'
                              : 'bg-[#3A3B3C] text-[#e4e6eb] rounded-bl-md'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.content}</p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-0.5 text-[10px] font-semibold ${
                              m.isMine ? 'text-white/70' : 'text-[#8a8d91]'
                            }`}
                          >
                            <span>{formatBdTime(m.createdAt)}</span>
                            {m.isMine &&
                              (m.readAt ? (
                                <CheckCheck className="w-3 h-3 text-[#33d79f]" aria-label="দেখা হয়েছে" />
                              ) : (
                                <Check className="w-3 h-3" aria-label="পৌঁছেছে" />
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </div>

          {/* কম্পোজার */}
          <div className="border-t border-[#3e4042] bg-[#242526] px-3 py-2.5 shrink-0">
            {/* ইনলাইন এরর-টোস্ট (alert-বিহীন) */}
            {actionError && (
              <div
                role="alert"
                className="mb-2 flex items-center gap-2 rounded-lg bg-red-950/50 border border-red-500/30 px-3 py-2 text-[12.5px] text-red-300 lf-anim-fade"
              >
                <CircleAlert className="w-4 h-4 shrink-0" />
                <span className="flex-1 min-w-0">{actionError}</span>
                <button
                  onClick={dismissError}
                  className="w-6 h-6 rounded-full hover:bg-red-500/20 flex items-center justify-center shrink-0"
                  aria-label="সতর্ববার্তা বন্ধ করুন"
                  type="button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendText();
                  }
                }}
                placeholder="একটি মেসেজ লিখুন..."
                maxLength={2000}
                aria-label="মেসেজ লিখুন"
                className="flex-1 min-w-0 bg-[#3a3b3c] focus-within:ring-1 focus-within:ring-[#00a86b] rounded-full px-4 py-2.5 text-sm text-[#e4e6eb] placeholder:text-[#8a8d91] outline-none transition"
              />
              <VoiceRecorder onSendVoice={sendVoice} disabled={uploadingVoice} />
              <button
                onClick={sendText}
                disabled={!draft.trim() || sending}
                className="w-9 h-9 rounded-full bg-[#006a4e] hover:bg-[#00805d] text-white flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[#00a86b] shrink-0"
                aria-label="মেসেজ পাঠান"
                type="button"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            {uploadingVoice && (
              <p className="mt-1.5 text-[11px] text-[#00a86b] font-semibold flex items-center gap-1.5" role="status">
                <Loader2 className="w-3 h-3 animate-spin" /> ভয়েস আপলোড হচ্ছে...
              </p>
            )}
          </div>
        </>
      ) : (
        /* ডেস্কটপ খালি-অবস্থা */
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center gap-3 text-center px-6">
          <span className="w-20 h-20 rounded-full bg-[#3a3b3c] flex items-center justify-center">
            <MessagesSquare className="w-9 h-9 text-[#00a86b]" />
          </span>
          <p className="font-bold text-white text-lg">আপনার মেসেজ</p>
          <p className="text-sm text-[#8a8d91] max-w-[280px]">
            বাম দিক থেকে একজন লেখকের সাথে কথোপকথন বেছে নিন — টেক্সট ও ভয়েস দুটোই পাঠানো যাবে।
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-[#242526] rounded-xl border border-[#3e4042] shadow-md overflow-hidden lf-anim-fade">
      {/* মোবাইল: এক-প্যান; ডেস্কটপ: দুই-প্যান */}
      <div className="grid lg:grid-cols-[320px_1fr] h-[calc(100vh-190px)] min-h-[420px]">
        {/* বাম: তালিকা */}
        <div
          className={`flex flex-col min-h-0 border-r border-[#3e4042] ${
            mobileThread ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="px-4 pt-4 pb-2 shrink-0">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <MessagesSquare className="w-5 h-5 text-[#00a86b]" /> চ্যাট
            </h2>
            <div className="mt-2.5 flex items-center gap-2 bg-[#3a3b3c] rounded-full px-3 py-2">
              <Search className="w-3.5 h-3.5 text-[#8a8d91] shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="লেখক বা কথোপকথন খুঁজুন..."
                aria-label="চ্যাট খুঁজুন"
                className="bg-transparent outline-none text-[13px] text-[#e4e6eb] placeholder:text-[#8a8d91] w-full min-w-0"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto lf-scroll px-2 pb-3">
            {convLoading ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 className="w-6 h-6 animate-spin text-[#00a86b]" />
              </div>
            ) : convError ? (
              <div className="text-center py-10 px-4">
                <p className="text-sm text-[#b0b3b8] mb-3">{convError}</p>
                <button
                  onClick={() => {
                    setConvLoading(true);
                    loadConversations();
                  }}
                  className="text-sm font-bold text-[#00a86b] hover:text-[#33d79f]"
                  type="button"
                >
                  আবার চেষ্টা করুন
                </button>
              </div>
            ) : (
              <>
                {filteredConvs.length === 0 && filteredUsers.length === 0 && (
                  <div className="text-center py-14 px-4">
                    <MessageCircleDashed className="w-10 h-10 text-[#65676b] mx-auto mb-3" />
                    <p className="text-sm text-[#8a8d91]">
                      {search ? 'কিছু পাওয়া যায়নি' : 'কোনো কথোপকথন নেই — নিচের লেখকদের সাথে শুরু করুন'}
                    </p>
                  </div>
                )}

                {/* কথোপকথনের রো */}
                {filteredConvs.map((c) => {
                  const support = isSupportRow(c);
                  return (
                    <button
                      key={c.id}
                      onClick={() => void openConvRow(c)}
                      className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-left transition group/conv ${
                        activeId === c.id ? 'bg-[#3a3b3c]' : 'hover:bg-[#3a3b3c]/70'
                      } ${support ? 'bg-[#006a4e]/10 border-l-[3px] border-[#00a86b]' : ''}`}
                      type="button"
                      aria-label={
                        support
                          ? `${c.other.name} — অফিসিয়াল সাপোর্ট, পিন-লক করা, আনপিন করা যাবে না`
                          : `${c.other.name} — কথোপকথন খুলুন`
                      }
                    >
                      <span className="relative shrink-0">
                        {c.other.avatarUrl ? (
                          <img
                            src={c.other.avatarUrl}
                            alt=""
                            className={`w-12 h-12 rounded-full ring-1 ring-white/10 ${support ? 'ring-2 ring-[#00a86b]/50' : ''}`}
                          />
                        ) : (
                          <span className="w-12 h-12 rounded-full bg-[#4e4f50] block" />
                        )}
                        {support && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#00a86b] flex items-center justify-center ring-2 ring-[#242526]"
                            title="অফিসিয়াল সাপোর্ট"
                            aria-hidden
                          >
                            <ShieldCheck className="w-3 h-3 text-white" />
                          </span>
                        )}
                        {c.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-[#00a86b] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#242526] lf-unread-chip">
                            {bn(c.unreadCount)}
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-[14.5px] font-bold text-white truncate flex items-center gap-1.5 min-w-0">
                            <span className="truncate">{c.other.name}</span>
                            {support && (
                              <span
                                className="shrink-0 inline-flex items-center gap-0.5 text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#00a86b]/20 text-[#33d79f] border border-[#00a86b]/40"
                                title="অফিসিয়াল সাপোর্ট — পিন-লক (আনপিন/ডিলিট করা যাবে না)"
                              >
                                <Pin className="w-2.5 h-2.5" aria-hidden />
                                সাপোর্ট
                              </span>
                            )}
                          </span>
                          <span className="text-[10.5px] text-[#8a8d91] shrink-0 font-semibold">
                            {c.lastMessage ? formatBdTime(c.lastMessage.createdAt) : ''}
                          </span>
                        </span>
                        <span className="flex items-center gap-1 mt-0.5">
                          <span
                            className={`text-[12.5px] truncate ${
                              c.unreadCount > 0 ? 'text-white font-semibold' : 'text-[#b0b3b8]'
                            }`}
                          >
                            {c.lastMessage?.isMine && <span className="text-[#8a8d91]">আপনি: </span>}
                            {support && !c.lastMessage
                              ? 'অভিযোগ বা সহায়তা-চাহিদা জানাতে মেসেজ লিখুন'
                              : previewText(c.lastMessage).slice(0, 46)}
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}

                {/* নতুন-কথোপকথন সেকশন */}
                {filteredUsers.length > 0 && (
                  <>
                    <p className="px-3 pt-3 pb-1 text-[11px] font-bold text-[#8a8d91] uppercase tracking-wide flex items-center gap-1.5">
                      <Mic className="w-3 h-3" /> নতুন কথোপকথন
                    </p>
                    {filteredUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => startWith(u.id)}
                        className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition hover:bg-[#3a3b3c]/70"
                        type="button"
                      >
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt=""
                            className="w-9 h-9 rounded-full ring-1 ring-white/10"
                          />
                        ) : (
                          <span className="w-9 h-9 rounded-full bg-[#4e4f50] block" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13.5px] font-semibold text-[#e4e6eb] truncate">
                            {u.name}
                          </span>
                          <span className="block text-[11px] text-[#8a8d91] truncate">
                            @{u.username}
                          </span>
                        </span>
                        <span className="text-[11px] font-bold text-[#00a86b] opacity-0 group-hover/conv:opacity-100">
                          মেসেজ
                        </span>
                      </button>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* ডান: থ্রেড */}
        <div className={`min-h-0 ${mobileThread ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex-1 min-h-0">{threadPane}</div>
        </div>
      </div>

      {/* session203 (Task 54) — "আমার অভিযোগ" স্টেটাস-প্যানেল */}
      <MyReportsPanel open={myReportsOpen} onClose={() => setMyReportsOpen(false)} />
    </div>
  );
}
