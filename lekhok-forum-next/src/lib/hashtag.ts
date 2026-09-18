/**
 * রিচ-টেক্সট HTML-এর শুধু টেক্সট-অংশে #হ্যাশট্যাগ খুঁজে ক্লিকযোগ্য চিপে রূপ দেয়।
 * ট্যাগ সেগমেন্ট (<span>, <b>...) অক্ষত রাখে — split(/(<[^>]+>)/) দিয়ে।
 * বাংলা স্বরচিহ্ন/ব্যঞ্জনচিহ্ন হলো \p{M} (combining mark) — তাই \p{L}\p{M}\p{N} সব কাভার করি।
 */
const HASHTAG_RE = /#([\p{L}\p{M}\p{N}_]{2,40})/gu

export function linkifyHashtags(html: string): string {
  if (!html || !html.includes('#')) return html
  return html
    .split(/(<[^>]+>)/g)
    .map((seg) => {
      if (seg.startsWith('<')) return seg // HTML ট্যাগ — অক্ষত
      return seg.replace(
        HASHTAG_RE,
        '<span class="lf-hashtag" data-tag="$1" role="link" tabindex="0">#$1</span>'
      )
    })
    .join('')
}

/** টেক্সট থেকে ইউনিক হ্যাশট্যাগ তালিকা (ভবিষ্যৎ ব্যবহারের জন্য) */
export function extractHashtags(html: string): string[] {
  const found = new Set<string>()
  for (const m of (html || '').matchAll(HASHTAG_RE)) found.add(m[1])
  return [...found]
}
