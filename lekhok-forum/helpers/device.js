/**
 * helpers/device.js — সেশন ৮০: ইউজার-এজেন্ট → মানব-পাঠযোগ্য ডিভাইস-নাম।
 *
 * "অ্যাক্টিভ সেশন ট্র্যাকার"-এর জন্য: লগইনের সময় UA + IP সেশনে জমা হয়
 * (server.js-এর device-stamp মিডলওয়্যার), সেটিংস-পেজে তা দেখানো হয়।
 * হালকা নিজস্ব পার্সার — নতুন কোনো ডিপেন্ডেন্সি না নিয়ে প্রধান
 * ব্রাউজার/OS-জোড়াই যথেষ্ট নির্ভুলভাবে ধরা যায়।
 */

function parseDeviceUA(uaRaw) {
  const ua = String(uaRaw || '');

  // ── ব্রাউজার (ক্রম গুরুত্বপূর্ণ — এজ-কেস আগে) ──
  let browser = 'অজানা ব্রাউজার';
  if (/edg\//i.test(ua))            browser = 'Edge';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/samsungbrowser/i.test(ua)) browser = 'Samsung Internet';
  else if (/firefox\//i.test(ua))   browser = 'Firefox';
  else if (/chrome\/|crios\//i.test(ua)) browser = 'Chrome';
  else if (/safari\//i.test(ua))    browser = 'Safari';
  else if (/bot|crawler|spider/i.test(ua)) browser = 'বট';

  // ── অপারেটিং সিস্টেম ──
  let os = 'অজানা OS';
  if (/windows nt 10/i.test(ua))      os = 'Windows';
  else if (/windows/i.test(ua))       os = 'Windows';
  else if (/android ([\d.]+)/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) {
    const m = ua.match(/OS (\d+[_\d]*)/i);
    os = /ipad/i.test(ua) ? 'iPad' : 'iPhone';
    if (m) os += ' (iOS ' + m[1].replace(/_/g, '.') + ')';
  } else if (/mac os x/i.test(ua))    os = 'macOS';
  else if (/linux/i.test(ua))         os = 'Linux';

  // ── ডিভাইস-শ্রেণি ──
  let kind = 'desktop';
  if (/mobile|android(?!.*chrome\/[.\d]+ tablet)/i.test(ua) && !/tablet|ipad/i.test(ua)) kind = 'mobile';
  else if (/tablet|ipad/i.test(ua)) kind = 'tablet';

  const icon = kind === 'mobile' ? 'fa-mobile-screen' : kind === 'tablet' ? 'fa-tablet-screen-button' : 'fa-laptop';
  const label = browser + ' on ' + os;
  return { browser, os, kind, icon, label };
}

module.exports = { parseDeviceUA };
