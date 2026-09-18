/**
 * ভিডিও-পোস্টার জেনারেটর (Session K) — ক্লায়েন্ট-সাইড
 * ভিডিওর প্রথম ফ্রেম ক্যানভাসে ক্যাপচার করে JPEG ব্লব ফাইল দেয়।
 * ব্যর্থ হলে null — আপলোড কখনো ব্লক হয় না (কমপ্রেশন-হেল্পারের মতোই)।
 */
export async function generateVideoPoster(file: File): Promise<File | null> {
  try {
    if (typeof document === 'undefined') return null
    const url = URL.createObjectURL(file)
    try {
      const video = document.createElement('video')
      video.muted = true
      video.playsInline = true
      video.preload = 'metadata'
      video.src = url

      // মেটাডেটা + প্রথম ফ্রেম লোডের অপেক্ষা (সর্বোচ্চ ৪ সেকেন্ড)
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('timeout')), 4000)
        const done = () => {
          clearTimeout(timer)
          resolve()
        }
        video.onloadeddata = done
        video.onerror = () => {
          clearTimeout(timer)
          reject(new Error('video-load-failed'))
        }
      })

      // প্রথম ফ্রেমে সিক করে আঁকা
      await new Promise<void>((resolve) => {
        if (video.currentTime > 0.05) return resolve()
        video.onseeked = () => resolve()
        try {
          video.currentTime = Math.min(0.1, (video.duration || 1) / 10)
        } catch {
          resolve()
        }
        setTimeout(resolve, 1200) // সেফটি টাইমআউট
      })

      const w = video.videoWidth
      const h = video.videoHeight
      if (!w || !h) return null

      // দীর্ঘ বাহু ১২৮০px ক্যাপ
      const scale = Math.min(1, 1280 / Math.max(w, h))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(w * scale)
      canvas.height = Math.round(h * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.82)
      )
      if (!blob || blob.size < 1000) return null

      const baseName = file.name.replace(/\.[^.]+$/, '') || 'video'
      return new File([blob], `${baseName}-poster.jpg`, { type: 'image/jpeg' })
    } finally {
      URL.revokeObjectURL(url)
    }
  } catch {
    return null
  }
}
