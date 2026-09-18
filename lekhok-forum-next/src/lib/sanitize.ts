/**
 * পোস্ট কন্টেন্টের বেসিক HTML স্যানিটাইজার (ডেমো লেভেল)।
 * script/style/iframe পুরোপুরি সরায়, event handler অ্যাট্রিবিউট ও javascript: href ব্লক করে।
 */
export function sanitizePostHtml(html: string): string {
  if (!html) return ''
  let clean = html
    // বিপজ্জনক ট্যাগ সম্পূর্ণ সরাও
    .replace(/<script[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<style[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe\s*>/gi, '')
    .replace(/<object[\s\S]*?<\/object\s*>/gi, '')
    .replace(/<embed[\s\S]*?<\/embed\s*>/gi, '')
    // ইনলাইন ইভেন্ট হ্যান্ডলার সরাও (on*="...")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    // javascript: URL নিষিদ্ধ
    .replace(/href\s*=\s*"\s*javascript:[^"]*"/gi, 'href="#"')
    .replace(/href\s*=\s*'\s*javascript:[^']*'/gi, "href='#'")
  return clean
}

/** এমপ্টি রিচ-টেক্সট চেক (br, &nbsp; ইত্যাদি বাদ) */
export function isEmptyRichText(html: string): boolean {
  if (!html) return true
  const text = html
    .replace(/<br\s*\/?>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .trim()
  return text.length === 0
}

/** প্লেইন-টেক্সট পরিষ্কার (স্টোরি টেক্সট ইত্যাদি) — সব HTML ট্যাগ সরায় */
export function sanitizePlainText(input: string): string {
  if (!input) return ''
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .trim()
}
