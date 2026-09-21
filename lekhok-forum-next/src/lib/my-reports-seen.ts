/**
 * session204 (Task 55) — "আমার অভিযোগ"-এ "নতুন জবাব" last-seen ট্র্যাকিং
 *
 * মেকানিজম: localStorage-এ শেষ-দেখার টাইমস্ট্যাম্প (ms) রাখা হয় — কোনো
 * স্কিমা-পরিবর্তন লাগে না। রিপোর্টের `updatedAt` শুধু ম্যানেজমেন্ট-দিকের
 * পরিবর্তে (স্টেটাস/অ্যাডমিননোট) বাড়ে, তাই:
 *   নতুন-জবাব = updatedAt > max(lastSeen, createdAt)
 * (createdAt-সীমা = প্রথম-পাঠানোর-মুহূর্তের আগের lastSeen-এ মিথ্যা-ব্যাজ আটকায়)
 *
 * markSeen() ব্রাউজার-ইভেন্ট ছড়ায় — MessengerView-র হিন্ট-বার-কাউন্ট লাইভ
 * রিফ্রেশ হয়। সব ফাংশন SSR-সেফ (typeof window গার্ড)।
 */

export const MY_REPORTS_SEEN_KEY = 'lf_myreports_lastseen';
export const MY_REPORTS_SEEN_EVENT = 'lf:my-reports-seen-changed';

/** শেষ-দেখার ms-epoch (কখনো-না-দেখা = 0) */
export function getSeenMs(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(MY_REPORTS_SEEN_KEY);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** এখনই "দেখা হলো" চিহ্নিত করো + ইভেন্ট ছড়াও */
export function markSeen(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MY_REPORTS_SEEN_KEY, String(Date.now()));
  } catch {
    /* প্রাইভেসি-মোড/কোটা — নীরব-ব্যর্থতা */
  }
  try {
    window.dispatchEvent(new CustomEvent(MY_REPORTS_SEEN_EVENT));
  } catch {
    /* নীরব-ব্যর্থতা */
  }
}

/** এই রিপোর্টে ম্যানেজমেন্টের নতুন (অপঠিত) জবাব/আপডেট আছে কি? */
export function hasNewReply(updatedAt: string, createdAt: string, seenMs?: number): boolean {
  const t = new Date(updatedAt).getTime();
  if (!Number.isFinite(t)) return false;
  const c = new Date(createdAt).getTime();
  const seen = seenMs ?? getSeenMs();
  return t > Math.max(seen, Number.isFinite(c) ? c : 0);
}
