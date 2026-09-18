'use client';

/**
 * Session L — ভয়েস রেকর্ডার (মেসেঞ্জার)
 *
 * ০:০০-বাগের স্থায়ী সমাধান: রেকর্ড চলাকালীনই setInterval-এ মোট সেকেন্ধ গুনে
 * রাখা হয় এবং পাঠানোর সময় blob-এর সাথে সেই সেকেন্ধও প্যারেন্টে যায় —
 * MediaRecorder-এর webm ফাইলে EBML হেডারে duration না থাকলেও
 * (Chrome/Firefox-এ Infinity/0 আসে) UI সর্বদা সঠিক সময় দেখাবে।
 */

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, X } from 'lucide-react';
import { bn } from '@/lib/format';

export default function VoiceRecorder({
  onSendVoice,
  disabled,
}: {
  onSendVoice: (blob: Blob, duration: number) => void;
  disabled?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [starting, setStarting] = useState(false);
  // মাইক-এরর ইনলাইনে (alert() পপ-আপ-মুক্ত) — ৫ সেকেন্ডে নিজেই মুছে যায়
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  // অ্যাসিঙ্ক onstop-এর ভেতরে তাজা সেকেন্ধ পড়তে রেফ (স্টেট-ক্লোজার-স্টেল গোটচা)
  const secondsRef = useRef(0);

  // আনমাউন্টে মাইক-স্ট্রিম/টাইমার পরিষ্কার (লিক-শূন্য)
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ইনলাইন মাইক-এরর টোস্ট (৫ সেকেন্ড অটো-ডিসমিস)
  const micTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showMicError = (msg: string) => {
    console.error('[ভয়েস রেকর্ডার]', msg);
    setMicError(msg);
    if (micTimerRef.current) clearTimeout(micTimerRef.current);
    micTimerRef.current = setTimeout(() => setMicError(null), 5000);
  };
  useEffect(
    () => () => {
      if (micTimerRef.current) clearTimeout(micTimerRef.current);
    },
    []
  );

  // সবচেয়ে সাপোর্টেড মাইম-টাইপ বাছাই (Safari-তে audio/webm নেই — audio/mp4)
  const pickMime = (): string | undefined => {
    if (typeof MediaRecorder === 'undefined') return undefined;
    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
    return candidates.find((m) => MediaRecorder.isTypeSupported(m));
  };

  // রেকর্ড শুরু
  const startRecording = async () => {
    if (starting || recording) return;
    try {
      setStarting(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, pickMime() ? { mimeType: pickMime() } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(100);
      setRecording(true);
      setRecordSeconds(0);
      secondsRef.current = 0;

      // সেকেন্ধ গণনা — এটাই ০:০০-বাগের স্থায়ী সমাধান
      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setRecordSeconds(secondsRef.current);
      }, 1000);
    } catch {
      // ইনলাইন পিল — কোনো alert() পপ-আপ নেই
      showMicError('মাইক্রোফোন চালু করা যায়নি — ব্রাউজারের মাইক-অনুমতি দিন');
    } finally {
      setStarting(false);
    }
  };

  // রেকর্ড সমাপ্ত ও পাঠানো
  const stopRecordingAndSend = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    recorder.onstop = () => {
      const audioBlob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });

      // অডিও ব্লব এবং রিয়েল সেকেন্ধ দুটোই প্যারেন্টে যায়
      onSendVoice(audioBlob, secondsRef.current);

      // ট্র্যাক বন্ধ (মাইক-লাইট বন্ধ)
      recorder.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
      setRecording(false);
      setRecordSeconds(0);
      secondsRef.current = 0;
    };

    recorder.stop();
  };

  // বাতিল — কিছুই পাঠানো হয় না, মাইক বন্ধ
  const cancelRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = () => {
        recorder.stream.getTracks().forEach((track) => track.stop());
      };
      recorder.stop();
    }
    mediaRecorderRef.current = null;
    setRecording(false);
    setRecordSeconds(0);
    secondsRef.current = 0;
  };

  if (micError && !recording) {
    return (
      <div
        role="alert"
        className="flex items-center gap-1.5 bg-red-950/40 text-red-400 pl-3 pr-1.5 py-1.5 rounded-full border border-red-500/30 shrink-0 max-w-[220px] lf-anim-fade"
      >
        <Mic className="w-3.5 h-3.5 shrink-0" />
        <span className="text-[11px] font-semibold leading-tight flex-1 min-w-0">{micError}</span>
        <button
          onClick={() => setMicError(null)}
          className="w-6 h-6 rounded-full hover:bg-red-500/20 flex items-center justify-center shrink-0"
          title="বন্ধ করুন"
          aria-label="সতর্ববার্তা বন্ধ করুন"
          type="button"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (recording) {
    return (
      <div
        className="flex items-center gap-2 bg-red-950/40 text-red-400 pl-3 pr-1.5 py-1.5 rounded-full border border-red-500/30 animate-pulse shrink-0"
        role="status"
        aria-label="ভয়েস রেকর্ড হচ্ছে"
      >
        <span className="w-2 h-2 rounded-full bg-red-500 lf-dot-pulse" />
        <span className="text-xs font-mono font-bold tabular-nums min-w-[2.2rem] text-center">
          {bn(recordSeconds)} সে
        </span>
        <button
          onClick={cancelRecording}
          className="w-8 h-8 rounded-full hover:bg-red-500/20 flex items-center justify-center transition"
          title="বাতিল করুন"
          aria-label="রেকর্ডিং বাতিল"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          onClick={stopRecordingAndSend}
          className="w-8 h-8 rounded-full bg-[#00a86b] hover:bg-[#00c07a] text-white flex items-center justify-center shadow-md transition-transform active:scale-90"
          title="ভয়েস পাঠান"
          aria-label="ভয়েস পাঠান"
          type="button"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={startRecording}
      disabled={disabled || starting}
      className="w-9 h-9 rounded-full hover:bg-[#4a4c4e] flex items-center justify-center text-[#b0b3b8] hover:text-[#00a86b] transition shrink-0 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#00a86b]"
      title="ভয়েস রেকর্ড করুন"
      aria-label="ভয়েস রেকর্ড করুন"
      type="button"
    >
      <Mic className="w-[18px] h-[18px]" />
    </button>
  );
}
