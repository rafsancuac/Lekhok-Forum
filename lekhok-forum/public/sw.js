/* সেশন ৯০ (রোডম্যাপ-আইটেম ২০): PWA অফলাইন-শেল — লেখক ফোরাম
 * ক্যাশ-স্ট্র্যাটেজি:
 *   /assets/*        → CacheFirst (immutable, AV-হ্যাশ-বাস্টেড)
 *   /uploads/*       → StaleWhileRevalidate (কনটেন্ট-অ্যাড্রেসড)
 *   HTML-নেভিগেশন    → নেটওয়ার্ক-অনলি → অফলাইন-ফলব্যাক (offline.html)
 *   /api/*           → নেটওয়ার্ক-অনলি (কখনো ক্যাশ নয় — লাইভ-ডেটা)
 *
 * সেশন ৯২ প্রাইভেসি-ফিক্স: HTML কখনো ক্যাশ হয় না। আগের ব্ল্যাকলিস্ট-রেজেক্স
 * (admin|dashboard|messages…) /me ও /profile/:username ধরতে পারেনি → ব্যক্তিগত
 * HTML (হেডারে ইউজার-নাম, মালিক-কন্ট্রোল, বুকমার্ক-স্টেট) SW-ক্যাশে জমত → একই
 * ব্রাউজারে ভিন্ন-অ্যাকাউন্ট/লগআউট-অবস্থায় স্টেল-পার্সোনালাইজড পেজ দেখাত।
 * সব HTML-পেজ এখন নেটওয়ার্ক-অনলি; অফলাইনে styled offline.html ফলব্যাক।
 *
 * স্যান্ডবক্স-নোট: গেটওয়ে-কুয়েরি (?XTransformPort=…) URL-এর অংশ — কী হিসেবে
 * সংরক্ষিত হয়, তাই ভিন্ন-পোর্ট-কী আলাদা ক্যাশ-এন্ট্রি (এলাকার-বাইরে কোনো নষ্ট নেই)।
 */
'use strict';

var CACHE_VERSION = 'lekhok-shell-v4'; /* v4: session174-প্রিমিয়াম offline.html-রিপ্রিক্যাশ */

/* স্যান্ডবক্স-সচেতনতা: SW-স্ক্রিপ্ট URL-এ XTransformPort থাকলে (গেটওয়ে-প্রিভিউ)
 * প্রি-ক্যাশ-ও অফলাইন-ফলব্যাক-URL-এ সেই-কী যোগ করতে হয় — নাহলে গেটওয়ে
 * কুয়েরি-হীন রিকোয়েস্ট Next.js-অ্যাপে ফরওয়ার্ড করে 404 দেয়। প্রোডাকশনে
 * (এক-অরিজিন) SB-খালি → URL অপরিবর্তিত। */
var SB = '';
try {
  var sbm = /(?:[?&])XTransformPort=(\d+)/.exec(self.location.search);
  if (sbm) SB = 'XTransformPort=' + sbm[1];
} catch (e) {}
function sbUrl(u) {
  if (!SB) return u;
  return u + (u.indexOf('?') > -1 ? '&' : '?') + SB;
}

var OFFLINE_URL = sbUrl('/offline.html');
var PRECACHE = [
  OFFLINE_URL,
  sbUrl('/manifest.json'),
  sbUrl('/assets/img/icon-192.png'),
  sbUrl('/assets/img/og-default.png')
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(function (cache) {
        // প্রি-ক্যাশ সর্বোচ্চ-গুরুত্বপূর্ণ শেল; ব্যর্থ হলেও ইনস্টল ব্লক না হোক
        return Promise.all(PRECACHE.map(function (u) {
          return cache.add(u).catch(function () { /* ঐচ্ছিক-অ্যাসেট */ });
        }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys
          .filter(function (k) { return k.indexOf('lekhok-shell-') === 0 && k !== CACHE_VERSION; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return; // ক্রস-অরিজিন (CDN/অ্যাভাটার) স্কিপ

  var path = url.pathname;

  /* সেশন ১১৬: স্যান্ডবক্স-গেটওয়ে সাবরিসোর্স-পোর্ট-সংরক্ষণ — SW যদি পোর্ট-প্যারাম-সহ
     রেজিস্টার হয় (SB সেট) অথচ সাবরিসোর্স-রিকোয়েস্টে প্যারাম না থাকে (পুরনো HTML
     ক্যাশ/প্যারাম-বিহীন ডাইনামিক <img> ইনসার্ট), তাহলে fetch-এর আগেই প্যারাম জুড়ে নিই —
     নাহলে গেটওয়ে রিকোয়েস্টটা ডিফল্ট-অ্যাপে (Next.js) ফেলে 404-HTML ফেরত দেয় এবং
     nosniff-এর কারণে ব্রাউজার CSS/JS পুরো বাতিল করে। প্রোডাকশনে SB='' → no-op।
     নেভিগেশন-রিকোয়েস্ট বাদ (পেজ-URL নিজেই প্যারাম বহন করে — ইউজার-দেখা URL
     পরিষ্কার রাখতে, এবং অফলাইন-শেল-কী অপরিবর্তিত রাখতে)। */
  var fixed = null;
  if (SB && req.mode !== 'navigate' && url.search.indexOf('XTransformPort=') === -1) {
    fixed = sbUrl(req.url);
  }

  // /api/* → নেটওয়ার্ক-অনলি (লাইভ-ডেটা; অফলাইনে নিঃশব্দে ব্যর্থ)
  if (path.indexOf('/api/') === 0) return;

  // ফন্ট/CSS/JS/ছবি-অ্যাসেট → CacheFirst (AV-হ্যাশে ?v= প্রতিবার ভিন্ন)
  if (path.indexOf('/assets/') === 0) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(fixed || req).then(function (resp) {
          if (resp && resp.ok) {
            var clone = resp.clone();
            caches.open(CACHE_VERSION).then(function (c) { c.put(resp.url || req, clone); });
          }
          return resp;
        }).catch(function () { return new Response('', { status: 504 }); });
      })
    );
    return;
  }

  // আপলোড → StaleWhileRevalidate
  if (path.indexOf('/uploads/') === 0) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        var net = fetch(fixed || req).then(function (resp) {
          if (resp && resp.ok) {
            var clone = resp.clone();
            caches.open(CACHE_VERSION).then(function (c) { c.put(resp.url || req, clone); });
          }
          return resp;
        }).catch(function () { return hit || new Response('', { status: 504 }); });
        return hit || net;
      })
    );
    return;
  }

  // সেশন ১১৬: /avatar/* ও অন্য প্যারাম-বিহীন same-origin ইমেজ-সাবরিসোর্স →
  // নেটওয়ার্ক-পাসথ্রু (রিরাইট-সহ, ক্যাশ নয় — পার্সোনাল-এন্ডপয়েন্ট)। SB-বিহীন
  // প্রোডাকশনে fixed=null → এই শাখাতেই ঢুকে না-ও পারে; ঢুকলেও req নিজেই ফেরত।
  if (fixed && (path.indexOf('/avatar/') === 0 ||
                /\.(png|jpe?g|gif|webp|svg|ico|woff2?)$/i.test(path))) {
    e.respondWith(
      fetch(fixed).then(function (resp) { return resp; })
        .catch(function () { return new Response('', { status: 504 }); })
    );
    return;
  }

  // HTML-নেভিগেশন → NetworkFirst + অফলাইন-ফলব্যাক
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') > -1) {
    e.respondWith(
      fetch(req).then(function (resp) {
        // ব্যাকএন্ড-মৃত/অস্বাভাবিক-গেটওয়ে-অবস্থা (৫০২-৫০৪) → অফলাইন-শেল দেখাও
        if (resp && (resp.status === 502 || resp.status === 503 || resp.status === 504)) {
          return caches.match(OFFLINE_URL).then(function (off) {
            return off || resp;
          });
        }
        // HTML কখনো ক্যাশ হয় না (সেশন ৯২ প্রাইভেসি-ফিক্স — ব্যক্তিগত-পেজ-লিক বন্ধ)
        return resp;
      }).catch(function () {
        return caches.match(OFFLINE_URL).then(function (off) {
          return off || new Response('<h1>অফলাইন</h1><p>ইন্টারনেট-সংযোগ নেই।</p>',
            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        });
      })
    );
  }
});
