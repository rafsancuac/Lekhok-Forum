/**
 * Session L — মেসেঞ্জার ডেমো-সিড (idempotent)
 *
 * রান: bun prisma/seed-messenger.ts
 * - কথোপকথন থাকলে স্কিপ (messageCount > 0)
 * - টেক্সট + ভয়েস (public/demo/voice-demo.wav, ৩ সেকেন্ড) ডেমো-মেসেজ
 * - createdAt ম্যানুয়ালি সেট — টাইমস্ট্যাম্পগুলো বাস্তবসম্মত
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const users = await db.user.findMany({ orderBy: { createdAt: 'asc' } })
  if (users.length < 5) {
    console.log('⚠️ ডেমো-ইউজার নেই — আগে bun prisma/seed.ts চালান')
    return
  }
  const [ismail, monem, karishma, mahfuz, nusrat] = users as [
    (typeof users)[0],
    (typeof users)[0],
    (typeof users)[0],
    (typeof users)[0],
    (typeof users)[0],
  ]

  const findOrCreateConv = async (aId: string, bId: string) => {
    let conv = await db.conversation.findFirst({
      where: { participantAId: aId, participantBId: bId },
    })
    if (!conv) conv = await db.conversation.findFirst({ where: { participantAId: bId, participantBId: aId } })
    if (!conv) conv = await db.conversation.create({ data: { participantAId: aId, participantBId: bId } })
    return conv
  }

  const minsAgo = (m: number) => new Date(Date.now() - m * 60_000)

  /* ── কথোপকথন ১: ইসমাইল ↔ মোনেম (টেক্সট) ── */
  {
    const conv = await findOrCreateConv(ismail.id, monem.id)
    const count = await db.message.count({ where: { conversationId: conv.id } })
    if (count === 0) {
      await db.message.createMany({
        data: [
          { conversationId: conv.id, senderId: monem.id, type: 'TEXT', content: 'আসসালামু আলাইকুম! আপনার নতুন কবিতাটা পড়লাম — অসাধারণ হয়েছে! 🌿', createdAt: minsAgo(58) },
          { conversationId: conv.id, senderId: ismail.id, type: 'TEXT', content: 'ওয়ালাইকুম সালাম। ধন্যবাদ ভাই! এখনো শেষ-চরণটা নিয়ে দ্বিধায় আছি।', createdAt: minsAgo(55) },
          { conversationId: conv.id, senderId: monem.id, type: 'TEXT', content: 'শেষ-চরণে "নদীর নাম ধরে ডাকা" লাইনটা রাখতে পারেন — মনে হয়ো না?', createdAt: minsAgo(53) },
          { conversationId: conv.id, senderId: ismail.id, type: 'TEXT', content: 'বাহ্! ঠিক এটাই দরকার ছিল। কাল গোটা লেখাটা আবার সাজিয়ে পোস্ট করছি।', createdAt: minsAgo(50) },
        ],
      })
      // ইসমাইলের দিক থেকে ১টি অপঠিত রেখে দিই (ব্যাজ-ডেমো)
      await db.message.create({
        data: { conversationId: conv.id, senderId: ismail.id, type: 'TEXT', content: 'আর ভয়েস-ফিচারটাও ট্রাই করে দেখেন — মাইক চেপে বলুন! 🎙️', createdAt: minsAgo(6) },
      })
      await db.conversation.update({ where: { id: conv.id }, data: { updatedAt: minsAgo(6) } })
      console.log('✓ ইসমাইল ↔ মোনেম (৪ টেক্সট + ১ অপঠিত)')
    } else {
      console.log('… ইসমাইল ↔ মোনেম আছে, স্কিপ')
    }
  }

  /* ── কথোপকথন ২: করিশমা → ইসমাইল (ভয়েস-ডেমো) ── */
  {
    const conv = await findOrCreateConv(karishma.id, ismail.id)
    const count = await db.message.count({ where: { conversationId: conv.id } })
    if (count === 0) {
      await db.message.createMany({
        data: [
          { conversationId: conv.id, senderId: karishma.id, type: 'TEXT', content: 'ইসমাইল ভাই, গল্পের শেষ অনুচ্ছেদটা একটু শুনবেন?', createdAt: minsAgo(120) },
          {
            conversationId: conv.id,
            senderId: karishma.id,
            type: 'VOICE',
            audioUrl: '/demo/voice-demo.wav',
            duration: 3, // রেকর্ডার-সাইড সেকেন্ধ — ০:০০-বাগ-স্থায়ী-সমাধানের ডেমো
            createdAt: minsAgo(118),
          },
          { conversationId: conv.id, senderId: ismail.id, type: 'TEXT', content: 'শুনলাম! ছন্দটা বেশ ভালো বসেছে। প্রকাশ করে দিন।', createdAt: minsAgo(115) },
        ],
      })
      await db.conversation.update({ where: { id: conv.id }, data: { updatedAt: minsAgo(115) } })
      console.log('✓ করিশমা → ইসমাইল (২ টেক্সট + ১ ভয়েস)')
    } else {
      console.log('… করিশমা → ইসমাইল আছে, স্কিপ')
    }
  }

  /* ── কথোপকথন ৩: মাহফুজ ↔ নুসরাত (টেক্সট, অনুবাদ-আলোচনা) ── */
  {
    const conv = await findOrCreateConv(mahfuz.id, nusrat.id)
    const count = await db.message.count({ where: { conversationId: conv.id } })
    if (count === 0) {
      await db.message.createMany({
        data: [
          { conversationId: conv.id, senderId: nusrat.id, type: 'TEXT', content: 'মাহফুজ সাহেব, "অনুবাদ-বৃত্ত" গ্রুপের পরের সেশন কবে? 📚', createdAt: minsAgo(1440) },
          { conversationId: conv.id, senderId: mahfuz.id, type: 'TEXT', content: 'শুক্রবার রাত ৯টায়। এবার জীবনানন্দের "রূপসী বাংলা" নেব।', createdAt: minsAgo(1430) },
          { conversationId: conv.id, senderId: nusrat.id, type: 'TEXT', content: 'দারুণ! আমি দুটো কবিতার ইংরেজি অনুবাদ নিয়ে যাচ্ছি।', createdAt: minsAgo(1425) },
        ],
      })
      await db.conversation.update({ where: { id: conv.id }, data: { updatedAt: minsAgo(1425) } })
      console.log('✓ মাহফুজ ↔ নুসরাত (৩ টেক্সট)')
    } else {
      console.log('… মাহফুজ ↔ নুসরাত আছে, স্কিপ')
    }
  }

  console.log('🎉 মেসেঞ্জার সিড সম্পন্ন')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
