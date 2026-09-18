'use client';

/**
 * Session L — ভয়েস মেসেজ প্লেয়ার বাবল (মেসেঞ্জার)
 *
 * তিন-বাগের স্থায়ী সমাধান এই কম্পোনেন্টে:
 * ১. ০:০০ উধাও — রেকর্ডার-সাইড থেকে আসা duration প্রপ-ইনিশিয়াল মান;
 *    মেটাডেটা Infinity/0 হলেও স্ক্রিনে সঠিক সময় দেখায়
 * ২. নিজের ভয়েস নিজে শোনা যায় — প্লে/পজ বাটন রিয়েল HTMLAudioElement-এর
 *    .play()/.pause() ব্যবহার করে (ব্লব-রিভোক/কাস্টম-বাইন্ডিং-সমস্যা নেই)
 * ৩. সঠিক বাংলাদেশ সময় — পাশের টাইমস্ট্যাম্প formatBdTime (Asia/Dhaka) দিয়ে
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Check, CheckCheck } from 'lucide-react';
import { toBnNumber } from '@/lib/formatBdTime';
import { formatBdTime } from '@/lib/formatBdTime';

interface VoiceMessageProps {
  audioUrl: string;
  duration?: number; // রেকর্ডার থেকে পাঠানো সেকেন্ড (Duration bug স্থায়ীভাবে দূর করে)
  createdAt: string | Date;
  isSender: boolean;
  status?: 'SENT' | 'DELIVERED' | 'SEEN';
}

export default function VoiceMessageBubble({
  audioUrl,
  duration = 0,
  createdAt,
  isSender,
  status = 'DELIVERED',
}: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // অডিও মাউন্ট ও মেটাডেটা হ্যান্ডলিং
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      // যদি মেটাডেটা ইনফিনিটি না হয় এবং ধনাত্মক হয় — তবেই মেটাডেটা-মান নেব
      if (isFinite(audio.duration) && audio.duration > 0) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(Math.round(audio.currentTime));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
      // আনমাউন্টে অডিও থামাই (সাইলেন্ট-লিক শূন্য)
      try {
        audio.pause();
      } catch {
        /* ignore */
      }
    };
  }, [audioUrl]);

  // প্লে ও পজ টগল (নিজের ভয়েস নিজে ১০০% শোনা যাবে)
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error('Audio playback error:', err);
          setIsPlaying(false);
        });
    }
  };

  // মিনিট ও সেকেন্ড ফরম্যাটার (বাংলায়) — ০:০০-বাগ-সুরক্ষিত: duration-প্রপ ফলব্যাক
  const formatSeconds = (sec: number) => {
    const safeSec = Number.isFinite(sec) && sec > 0 ? Math.round(sec) : 0;
    const m = Math.floor(safeSec / 60);
    const s = safeSec % 60;
    return `${toBnNumber(m)}:${toBnNumber(String(s).padStart(2, '0'))}`;
  };

  // প্রগ্রেস পারসেন্টেজ
  const progressPercent =
    totalDuration > 0 ? Math.min(100, (currentTime / totalDuration) * 100) : 0;

  return (
    <div
      className={`flex items-end gap-1.5 my-1 select-none max-w-full ${
        isSender ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* ভয়েস মেসেজ মূল বাবল (স্ক্রিনশটের হুবহু সবুজ ডিজাইন) */}
      <div
        className={`rounded-[18px] p-2.5 flex items-center gap-3 shadow-sm max-w-[260px] sm:max-w-[300px] transition-colors ${
          isSender
            ? 'bg-[#2EB865] text-white rounded-br-md'
            : 'bg-[#3A3B3C] text-white rounded-bl-md'
        }`}
      >
        {/* গোপন HTML5 অডিও এলিমেন্ট — রিয়েল প্লেব্যাক-বাইন্ডিং */}
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        {/* প্লে/পজ বাটন */}
        <button
          onClick={togglePlay}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md shrink-0 transition-transform active:scale-90 focus-visible:ring-2 focus-visible:ring-white/60 ${
            isSender ? 'bg-white text-[#2EB865]' : 'bg-[#00a86b] text-white'
          }`}
          aria-label={isPlaying ? 'ভয়েস থামান' : 'ভয়েস চালান'}
          type="button"
        >
          {isPlaying ? (
            <Pause className="w-4.5 h-4.5 fill-current" />
          ) : (
            <Play className="w-4.5 h-4.5 fill-current ml-0.5" />
          )}
        </button>

        {/* ডায়নামিক ওয়েভফর্ম ও টাইমার */}
        <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
          <div className="flex items-center gap-0.5 h-6" aria-hidden="true">
            {/* ওয়েভ বারস প্রগ্রেস অনুযায়ী কালার বদলায় */}
            {[40, 70, 90, 60, 45, 80, 100, 75, 50, 85, 95, 60, 40, 70, 50, 30].map((h, i) => {
              const barPercent = (i / 16) * 100;
              const isPassed = barPercent <= progressPercent;

              return (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`w-1 rounded-full transition-colors ${
                    isPassed
                      ? isSender
                        ? 'bg-white'
                        : 'bg-[#00a86b]'
                      : isSender
                        ? 'bg-white/40'
                        : 'bg-white/25'
                  }`}
                />
              );
            })}
          </div>

          {/* ভয়েস টাইমার (বাংলা ডিজিট) — ০:০০-বাগ-সুরক্ষিত */}
          <div className="flex justify-end">
            <span className="text-[11px] font-mono font-bold text-white/90 tabular-nums">
              {isPlaying ? formatSeconds(currentTime) : formatSeconds(totalDuration)}
            </span>
          </div>
        </div>
      </div>

      {/* বাংলাদেশ টাইমস্ট্যাম্প ও ডেলিভারি টিক (পাশে) */}
      <div
        className={`flex items-center gap-1 text-[11px] text-[#65676B] font-semibold shrink-0 mb-1 ${
          isSender ? 'flex-row-reverse' : ''
        }`}
      >
        <span className="whitespace-nowrap">{formatBdTime(createdAt)}</span>
        {isSender && (
          <span
            className={status === 'SEEN' ? 'text-[#00a86b]' : 'text-[#65676B]'}
            aria-label={status === 'SEEN' ? 'দেখা হয়েছে' : 'পৌঁছেছে'}
          >
            {status === 'SEEN' ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
          </span>
        )}
      </div>
    </div>
  );
}
