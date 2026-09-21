import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { isManager } from '@/lib/roles'
import { getSupportAdminId } from '@/lib/support'
import { onSupportChange } from '@/lib/support-events'

/**
 * session215 (Task 66) — সার্ভার-পুশ (SSE): GET /api/admin/support-stream
 *
 * রিভিউ-ডেস্কের জন্য তাৎক্ষণিক-সিগন্যাল-চ্যানেল:
 * - `data: hello`   → সংযোগ-স্থাপিত (ক্লায়েন্ট "লাইভ"-চিপ দেখায়)
 * - `data: changed` → সাপোর্ট-ডেটা বদলেছে (নতুন-অভিযোগ/স্টেটাস/নোট) — ক্লায়েন্ট load() চালায়
 * - `data: hb`      → ২৫-সে হার্টবিট (প্রক্সি-টাইমআউট-প্রতিরোধ)
 *
 * অ্যাক্সেস: রিভিউ-ডেস্কের requireReviewer-এর-সমান (manager বা নির্বাচিত-সাপোর্ট-অ্যাডমিন)।
 * পেলোড-শূন্য-ডিজাইন: ক্লায়েন্ট সিগন্যাল-পেলে load() দিয়ে ফ্রেশ-ডেটা-আনে — এ-রুটে DB-কোয়েরি-নেই।
 * পোলিং (১৫-সে) অপরিবর্তিত-ফলব্যাক — SSE-ব্যর্থ হলেও ডেস্ক-কার্যক্ষম।
 */

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const me = await getCurrentUser()
  if (!me) return NextResponse.json({ error: 'লগইন প্রয়োজন' }, { status: 401 })
  const supportId = await getSupportAdminId()
  const allowed = isManager(me.role) || (!!supportId && supportId === me.id)
  if (!allowed) return NextResponse.json({ error: 'অনুমতি নেই' }, { status: 403 })

  const encoder = new TextEncoder()
  let unsubscribe: (() => void) | null = null
  let heartbeat: ReturnType<typeof setInterval> | null = null
  let cleaned = false

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const cleanup = () => {
        if (cleaned) return
        cleaned = true
        unsubscribe?.()
        if (heartbeat) clearInterval(heartbeat)
        try {
          controller.close()
        } catch {
          /* ইতিমধ্যে-বন্ধ */
        }
      }
      const send = (msg: string) => {
        try {
          controller.enqueue(encoder.encode(`data: ${msg}\n\n`))
        } catch {
          cleanup()
        }
      }
      send('hello')
      unsubscribe = onSupportChange(() => send('changed'))
      heartbeat = setInterval(() => send('hb'), 25000)
      req.signal.addEventListener('abort', cleanup)
    },
    cancel() {
      cleaned = true
      unsubscribe?.()
      if (heartbeat) clearInterval(heartbeat)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
