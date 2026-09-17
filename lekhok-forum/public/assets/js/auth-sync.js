/**
 * auth-sync.js — সেশন ৭২ (GSC ইনডেক্সিং-ফিক্সের সহযোগী)
 *
 * প্রেক্ষাপট: পাবলিক পেজগুলো বেনামী দর্শকদের জন্য Vercel Edge-এ ক্যাশ হয়
 * (s-maxage=300) — এতে Googlebot/প্রথমবার্তা-ভিজিটর TTFB ৩-৭s → ~৪০ms পায়।
 * কিন্তু Vercel-এর ক্যাশ-কী কুকি দেখে না, তাই লগ-ইন করা ব্যবহারকারীও মাঝে
 * মাঝে ক্যাশ করা "লগ-আউট" HTML (data-auth="0") পেতে পারেন — টপবারে অ্যাভাটার/
 * নোটিফিকেশন/বুকমার্ক-স্টেট নেই।
 *
 * সমাধান: পেজ যদি অ্যানোনিমাস-রেন্ডারড হয়, টিনি /api/whoami (no-store) দিয়ে
 * আসল সেশন-স্টেট যাচাই করি; লগ-ইন পাওয়া গেলে ?_u=<ts> কুয়েরি-সহ রিফ্রেশ —
 * কুয়েরি-স্ট্রিং সার্ভারের ক্যাশ-অনুমোদন বাতিল করে → origin থেকে ব্যক্তিগত
 * রেন্ডার আসে। ব্যক্তিগত রেন্ডারে এসে ?_u= URL থেকে সরে যায় (replaceState)।
 *
 * রিফ্রেশ-লুপ নিরাপত্তা: sessionStorage-ফ্ল্যাগে শেষ-চেক-করা পথ রাখা হয় —
 * একই পথে পুনরায় প্রোব হয় না; নতুন পথে নেভিগেট করলে ফ্ল্যাগ রিসেট।
 */
(function () {
  try {
    var bodyAuthed = document.body && document.body.dataset
      ? document.body.dataset.auth === '1'
      : false;

    if (bodyAuthed) {
      // ব্যক্তিগত রেন্ডার — রিসিঙ্ক-ফ্ল্যাগ মুছি + ?_u= প্যারাম পরিষ্কার করি
      try { sessionStorage.removeItem('_lekhokAuthSync'); } catch (e) {}
      if (/[?&]_u=\d+/.test(location.search)) {
        var cleaned = location.search
          .replace(/[?&]_u=\d+/, '')
          .replace(/^[?&]/, '?')
          .replace(/[?&]$/, '');
        history.replaceState(null, '', location.pathname + (cleaned ? '?' + cleaned : '') + location.hash);
      }
      return;
    }

    // অ্যানোনিমাস-রেন্ডারড পেজ — এই পথে ইতিমধ্যে প্রোব করা হয়েছে কি?
    var lastPath = null;
    try { lastPath = sessionStorage.getItem('_lekhokAuthSync'); } catch (e) {}
    if (lastPath === location.pathname) return; // একই URL-এ লুপ-রোধ
    try { sessionStorage.setItem('_lekhokAuthSync', location.pathname); } catch (e) {}

    fetch('/api/whoami', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && d.authed) {
          // ক্যাশ-বাইপাস রিফ্রেশ (?_u= কুয়েরি সার্ভার-ক্যাশ অনুমোদন বাতিল করে)
          var q = location.search || '';
          if (q.charAt(0) === '?') q = q.slice(1);
          var extra = (q ? q + '&' : '') + '_u=' + Date.now();
          location.replace(location.pathname + '?' + extra + location.hash);
        } else {
          try { sessionStorage.removeItem('_lekhokAuthSync'); } catch (e) {}
        }
      })
      .catch(function () {
        try { sessionStorage.removeItem('_lekhokAuthSync'); } catch (e) {}
      });
  } catch (e) { /* কখনো পেজ-ব্রেক নয় */ }
})();
