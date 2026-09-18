/** শুধু ডেমো স্টোরি রিসিড (idempotent — ইউজার/পোস্ট অটুট রাখে) */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const users = await db.user.findMany()
  const by = (username: string) => users.find((u) => u.username === username)

  await db.storyView.deleteMany()
  await db.story.deleteMany()

  const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000)
  const expires = (createdAt: Date) => new Date(createdAt.getTime() + 24 * 3600_000)

  const monem = by('monem')
  const nusrat = by('nusrat')
  const mahfuz = by('mahfuz')
  const ismail = by('ismail')

  const rows: { authorId: string; text?: string; background?: string; mediaUrl?: string; createdAt: Date }[] = []
  if (monem) {
    rows.push(
      { authorId: monem.id, text: 'আজ ভোরে লেখা হলো নতুন একটি কবিতার প্রথম সারি…✍️', background: 'story-gradient-1', createdAt: hoursAgo(2) },
      { authorId: monem.id, text: '"জলছবি" — নতুন কাব্যগ্রন্থের প্রচ্ছদ আজ উন্মোচিত হবে।', background: 'story-gradient-2', createdAt: hoursAgo(1) }
    )
  }
  if (nusrat) rows.push({ authorId: nusrat.id, mediaUrl: '/demo/demo-3.png', text: 'লেখক ফোরামের বিকেল — চায়ের কাপ আর কলম ✨', createdAt: hoursAgo(4) })
  if (mahfuz) rows.push({ authorId: mahfuz.id, text: 'নতুন অনুবাদ শুরু করলাম — এবার জাপানি উপন্যাস!', background: 'story-gradient-3', createdAt: hoursAgo(8) })
  if (ismail) rows.push({ authorId: ismail.id, mediaUrl: '/demo/demo-1.png', text: 'সাহিত্য সম্পাদকীয় নিয়ে কাজ চলছে 📝', createdAt: hoursAgo(3) })

  for (const r of rows) {
    await db.story.create({
      data: {
        authorId: r.authorId,
        mediaUrl: r.mediaUrl ?? null,
        text: r.text ?? null,
        background: r.background ?? null,
        createdAt: r.createdAt,
        expiresAt: expires(r.createdAt),
      },
    })
  }
  console.log(`✅ Seeded ${rows.length} demo stories`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
