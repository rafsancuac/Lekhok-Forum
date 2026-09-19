// session174: অনলাইন/অফলাইন-গেট — অফলাইনে পুরো অ্যাপের বদলে প্রিমিয়াম
// OfflineScreen টেকওভার দেখায়; সংযোগ ফিরলে OfflineScreen নিজেই অটো-রিলোড
// করে অ্যাপ ফিরিয়ে আনে।
// কানেকশন-স্টেট: useSyncExternalStore — সার্ভার/হাইড্রেশন-স্ন্যাপশট = online
// (SSR-মার্কআপ সবসময় children), মাউন্ট-পরবর্তী আসল navigator.onLine-এ
// স্বয়ংক্রিয় রি-রেন্ডার → ইউজার অফলাইনে পেজ খুললেও টেকওভার ধরা পড়ে।
'use client';

import React, { useSyncExternalStore } from 'react';
import OfflineScreen from './OfflineScreen';

function subscribeConnection(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

export default function OfflineGate({ children }: { children: React.ReactNode }) {
  const offline = useSyncExternalStore(
    subscribeConnection,
    () => !navigator.onLine,
    // সার্ভার-স্ন্যাপশট: সবসময় online (হাইড্রেশন-মিসম্যাচ-শূন্য)
    () => false,
  );

  if (offline) return <OfflineScreen />;
  return <>{children}</>;
}
