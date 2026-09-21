/**
 * session215 (Task 66) — সাপোর্ট-ইভেন্ট-বাস (ইন-প্রসেস)
 *
 * উদ্দেশ্য: নতুন-অভিযোগ (মিরর-POST) বা রিভিউ-ডেস্ক আপডেট (PUT/PATCH) হলে
 * সংযুক্ত SSE-ক্লায়েন্ট (support-stream) তাৎক্ষণিক-সিগন্যাল পায় → ডেস্ক load() ট্রিগার।
 * ১৫-সেকেন্ড পোল অপরিবর্তিত থাকে (ফলব্যাক + অন্য-ট্যাব-কভারেজ)।
 *
 * চুক্তি:
 * - emitSupportChange() = ফায়ার-অ্যান্ড-ফরগেট — কোনো-পেলোড-নেই (ক্লায়েন্ট নিজেই load()-এ ফ্রেশ-ডেটা আনে)
 * - লিসেনার-ব্যতিক্রম নীরব-সোফা (এক-ব্যর্থ লিসেনার অন্যদের আটকাবে-না)
 * - globalThis-এ সংরক্ষণ — dev-এ HMR/route-module-রিলোডে লিসেনার-সেট-হারায়-না
 */

type Listener = () => void

const g = globalThis as unknown as { __lfSupportListeners?: Set<Listener> }
if (!g.__lfSupportListeners) g.__lfSupportListeners = new Set<Listener>()

/** SSE-স্ট্রিম নিবন্ধন; আনসাবস্ক্রাইব-ফাংশন ফেরত */
export function onSupportChange(listener: Listener): () => void {
  g.__lfSupportListeners!.add(listener)
  return () => {
    g.__lfSupportListeners!.delete(listener)
  }
}

/** যে-কোনো-সাপোর্ট-পরিবর্তনে (নতুন-অভিযোগ/স্টেটাস/নোট) সব-সংযুক্ত-স্ট্রিমকে সিগন্যাল */
export function emitSupportChange(): void {
  for (const l of g.__lfSupportListeners!) {
    try {
      l()
    } catch {
      /* নীরব — এক-লিসেনার-ব্যর্থতা বাকিদের-আটকাবে-না */
    }
  }
}
