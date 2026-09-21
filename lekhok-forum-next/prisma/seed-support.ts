/**
 * Task 43 — সাপোর্ট-কেন্দ্র ডেমো-সিড (idempotent)
 *
 * রান: bun prisma/seed-support.ts (seed.ts-এর পরে)
 * - SystemSetting(SUPPORT_ADMIN_ID) → nusrat (username-ভিত্তিক লুকআপ — position-ভিত্তিক নয়,
 *   seed-messenger-এর মিলি-সেকেন্ড-অর্ডার RCA প্যাচ)
 * - ডেমো সাপোর্ট-কথোপকথন (মোনেম → নুসরাত) — থাকলে স্কিপ
 * - ২টি ডেমো অভিযোগ (UserReport) — থাকলে স্কিপ (TEXT + IMAGE-প্রিভিউ)
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const nusrat = await db.user.findUnique({ where: { username: 'nusrat' } })
  if (!nusrat) {
    console.log('⚠️ nusrat নেই — আগে bun prisma/seed.ts চালান')
    return
  }

  /* ── সাপোর্ট-অ্যাডমিন নির্ধারণ (আপসার্ট — idempotent) ── */
  await db.systemSetting.upsert({
    where: { key: 'SUPPORT_ADMIN_ID' },
    create: { key: 'SUPPORT_ADMIN_ID', value: nusrat.id },
    update: { value: nusrat.id },
  })
  console.log(`🛡️ সাপোর্ট-অ্যাডমিন: ${nusrat.name} (@${nusrat.username})`)

  /* ── ডেমো সাপোর্ট-কথোপকথন: মোনেম → নুসরাত ── */
  const monem = await db.user.findUnique({ where: { username: 'monem' } })
  if (monem) {
    let conv = await db.conversation.findFirst({
      where: { participantAId: monem.id, participantBId: nusrat.id },
    })
    if (!conv)
      conv = await db.conversation.findFirst({
        where: { participantAId: nusrat.id, participantBId: monem.id },
      })
    if (!conv) conv = await db.conversation.create({ data: { participantAId: monem.id, participantBId: nusrat.id } })

    const msgCount = await db.message.count({ where: { conversationId: conv.id } })
    if (msgCount === 0) {
      const minsAgo = (m: number) => new Date(Date.now() - m * 60_000)
      await db.message.create({
        data: {
          conversationId: conv.id,
          senderId: monem.id,
          type: 'TEXT',
          content: 'নুসরাত আপা, আমার প্রোফাইল-ছবি আপলোড করার পর পেজটা লোড হচ্ছে না — দেখবেন কি?',
          createdAt: minsAgo(50),
        },
      })
      await db.message.create({
        data: {
          conversationId: conv.id,
          senderId: nusrat.id,
          type: 'TEXT',
          content: 'দেখছি মোনেম ভাই — খুব দ্রুত সমাধান জানাচ্ছি। সমস্যাটি রেকর্ড করা হলো।',
          createdAt: minsAgo(44),
        },
      })
      await db.conversation.update({ where: { id: conv.id }, data: { updatedAt: minsAgo(44) } })
      console.log('✓ ডেমো সাপোর্ট-কথোপকথন (মোনেম ↔ নুসরাত)')
    } else {
      console.log('· সাপোর্ট-কথোপকথন আগেই-আছে — স্কিপ')
    }
  }

  /* ── ২টি ডেমো অভিযোগ (শূন্য হলেই) ── */
  const reportCount = await db.userReport.count()
  if (reportCount === 0) {
    const karishma = await db.user.findUnique({ where: { username: 'karishma' } })
    const minsAgo = (m: number) => new Date(Date.now() - m * 60_000)

    if (karishma) {
      await db.userReport.create({
        data: {
          senderId: karishma.id,
          senderName: karishma.name,
          senderEmail: karishma.email,
          messageText:
            'আমার প্রকাশিত লেখা "গ্রামবাংলার নারী" অন্য একটি অ্যাকাউন্টে চুরি করে পোস্ট করা হয়েছে। দ্রুত ব্যবস্থা চাই।',
          mediaType: 'TEXT',
          status: 'PENDING',
          createdAt: minsAgo(120),
        },
      })
    }
    await db.userReport.create({
      data: {
        senderId: monem?.id ?? 'demo',
        senderName: monem?.name ?? 'নুরুল মোনেম',
        senderEmail: monem?.email,
        messageText: 'এই স্ক্রিনশটের অ্যাকাউন্টটি আমার নামে ভুয়া প্রোফাইল চালাচ্ছে — স্ক্রিনশট দেখুন।',
        mediaType: 'IMAGE',
        mediaUrl: '/demo/demo-2.png',
        status: 'PENDING',
        createdAt: minsAgo(35),
      },
    })
    console.log('✓ ২টি ডেমো অভিযোগ (TEXT + IMAGE, PENDING)')
  } else {
    console.log(`· অভিযোগ ${reportCount}টি আগেই-আছে — স্কিপ`)
  }

  console.log('🎉 সাপোর্ট-সিড সম্পন্ন')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
