// src/components/shared/OfflineScreen.tsx
// session174: প্রিমিয়াম অফলাইন-স্ক্রিন — WiFi-Slash ভেক্টর-আইকন + রিট্রাই-স্পিনার +
// অটো-রিকভারি (সংযোগ-ফিরলে অটো-রিলোড) + অফলাইন-ক্যাশ-ইনফো-বক্স +
// FB-স্ট্যান্ডার্ড ৮px-রেডিয়াস + কালপুরুষ-ফন্ট-ইউটিলিটি (globals.css @utility)
// কানেকশন-স্টেট: useSyncExternalStore (react-hooks/set-state-in-effect-লিন্ট-সেফ,
// SSR-এ সবসময় online-স্ন্যাপশট → হাইড্রেশন-মিসম্যাচ-শূন্য)
'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';

function subscribeConnection(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

export default function OfflineScreen() {
  // ব্রাউজারের আসল কানেকশন স্ট্যাটাস (সার্ভার-স্ন্যাপশট = online)
  const isOnline = useSyncExternalStore(
    subscribeConnection,
    () => navigator.onLine,
    () => true,
  );
  const [isRetrying, setIsRetrying] = useState(false);
  // মাউন্টের-সময় অফলাইন ছিল কিনা — শুধু অফলাইন→অনলাইন-ট্রানজিশনেই রিলোড
  // (অনলাইন-অবস্থায় সরাসরি মাউন্ট হলে রিলোড-লুপ-প্রতিরোধ)
  const mountedOfflineRef = useRef<boolean | null>(null);

  // সংযোগ ফিরে এলেই স্বয়ংক্রিয়ভাবে অ্যাপ পুনরায় চালু (স্পেক-টেক্সটের প্রতিশ্রুতি)।
  // রিলোড কেবল তখনই, যখন মাউন্টের-সময় সত্যিই অফলাইন ছিল — অনলাইন-মাউন্টে
  // রিলোড-লুপ-প্রতিরোধ (স্ট্যান্ডঅ্যালোন-ব্যবহারের নিরাপত্তা)।
  useEffect(() => {
    if (mountedOfflineRef.current === null) {
      mountedOfflineRef.current = !navigator.onLine;
      return;
    }
    if (isOnline && mountedOfflineRef.current) window.location.reload();
  }, [isOnline]);

  const handleRetry = () => {
    setIsRetrying(true);
    // সংযোগ পুনঃপরীক্ষা
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setIsRetrying(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-4 font-kalpurush text-[#050505] antialiased select-none">

      {/* মূল অফলাইন কার্ড (৮px বর্ডার রেডিয়াস ও স্লিক শ্যাডো) */}
      <div className="w-full max-w-[420px] bg-white border border-[#CED0D4] rounded-[10px] shadow-sm p-6 sm:p-7 flex flex-col items-center text-center space-y-4 relative overflow-hidden">

        {/* টপ অ্যাকসেন্ট স্ট্রাইপ */}
        <div className="absolute top-0 inset-x-0 h-1 bg-[#006A4E]" />

        {/* প্রিমিয়াম অফলাইন ওয়াইফাই আইকন (পালসিং আভা সহ) */}
        <div className="relative mt-2">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#006A4E] shadow-2xs">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3l18 18M12 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM8.5 12.5a5 5 0 017 0m-9.5-3.5a9 9 0 0112 0m-14.5-3.5a13 13 0 0117 0"
              />
            </svg>
          </div>
          {/* অফলাইন ছোট স্ট্যাটাস ব্যাজ */}
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] text-white font-mono font-bold">
            !
          </span>
        </div>

        {/* হেডিং ও বিবরণ */}
        <div className="space-y-1.5 pt-1">
          <h1 className="text-lg sm:text-xl font-bold text-[#050505] tracking-tight">
            ইন্টারনেট-সংযোগ বিচ্ছিন্ন রয়েছে
          </h1>
          <p className="text-xs sm:text-[13px] text-[#65676B] leading-relaxed font-normal px-2">
            আপনার ডিভাইসটি বর্তমানে অফলাইনে আছে। সংযোগ সক্রিয় হলে লেখক ফোরামের লেখা, লাইভ আলোচনা ও ই-পেপার সেবা স্বয়ংক্রিয়ভাবে পুনরায় চালু হবে।
          </p>
        </div>

        {/* অফলাইন ক্যাশ সুবিধা সম্পর্কিত তথ্য বক্স */}
        <div className="w-full bg-[#FAFBFB] border border-[#E4E6EB] rounded-[8px] p-2.5 flex items-start gap-2.5 text-left">
          <span className="text-base shrink-0 mt-0.5">💾</span>
          <div className="text-[11.5px] leading-snug">
            <span className="font-bold text-[#050505] block">অফলাইন ক্যাশ রিডিং সুবিধা</span>
            <span className="text-[#65676B]">
              আগে ভিজিট করা লেখা ও ই-পেপার পাতাগুলো এখনও মেমোরি থেকে পড়া যাবে।
            </span>
          </div>
        </div>

        {/* অ্যাকশন বাটনসমূহ */}
        <div className="w-full space-y-2 pt-2">
          {/* আবার চেষ্টা করুন বাটন */}
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full py-2.5 px-4 bg-[#006A4E] hover:bg-[#00523C] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-[8px] shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isRetrying ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>সংযোগ যাচাই করা হচ্ছে...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>আবার চেষ্টা করুন</span>
              </>
            )}
          </button>

          {/* বিকল্প সংরক্ষিত লেখা দেখার বাটন */}
          <Link
            href="/saved"
            className="w-full py-2 px-4 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#4B4C4F] hover:text-[#050505] font-bold text-xs rounded-[8px] transition flex items-center justify-center gap-1.5"
          >
            <span>🔖</span>
            <span>সংরক্ষিত লেখাগুলো পড়ুন</span>
          </Link>
        </div>

      </div>

      {/* ফুটার ব্যান্ডিং */}
      <div className="mt-4 text-center">
        <p className="text-[11px] font-bold text-[#8A8D91] tracking-wide">
          চট্টগ্রাম বিশ্ববিদ্যালয় লেখক ফোরাম
        </p>
      </div>

    </div>
  );
}
