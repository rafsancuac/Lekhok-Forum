/** ডেমো গ্রুপ রিসিড (idempotent — ইউজার/পোস্ট অটুট রাখে; গ্রুপ থাকলে স্কিপ) */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const users = await db.user.findMany()
  const by = (username: string) => users.find((u) => u.username === username)

  const ismail = by('ismail')
  const monem = by('monem')
  const karishma = by('karishma')
  const mahfuz = by('mahfuz')
  const nusrat = by('nusrat')
  if (!ismail || !monem || !karishma || !mahfuz || !nusrat) {
    console.log('ডেমো ইউজার নেই — আগে seed.ts চালান')
    return
  }

  const groupCount = await db.group.count()
  if (groupCount > 0) {
    console.log(`গ্রুপ আগেই আছে (${groupCount}) — স্কিপ`)
    return
  }

  const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000)

  /* ─── গ্রুপ-১: প্রকাশ্য কবিতা-আসর (নির্মাতা: মোনেম) ─── */
  const kavita = await db.group.create({
    data: {
      name: 'বাংলা কবিতা আড্ডা',
      description:
        'নিজের লেখা কবিতা শেয়ার করুন, অন্যের কবিতায় মন দিন। প্রতি শুক্রবার রাতে থিম-ভিত্তিক আসর!',
      privacy: 'OPEN',
      creatorId: monem.id,
      createdAt: hoursAgo(72),
      members: {
        create: [
          { userId: monem.id, role: 'ADMIN', joinedAt: hoursAgo(72) },
          { userId: ismail.id, role: 'MEMBER', joinedAt: hoursAgo(70) },
          { userId: karishma.id, role: 'MEMBER', joinedAt: hoursAgo(65) },
          { userId: nusrat.id, role: 'MEMBER', joinedAt: hoursAgo(40) },
        ],
      },
    },
  })

  /* ─── গ্রুপ-২: বন্ধ অনুবাদ-বৃত্ত (নির্মাতা: মাহফুজ) ─── */
  const translate = await db.group.create({
    data: {
      name: 'অনুবাদ-বৃত্ত (বন্ধ)',
      description:
        'বিশ্বসাহিত্য বাংলায় — অনুবাদকদের নিবিড় আলোচনাচক্র। খসড়া-সমালোচনা শুধু সদস্যদের মধ্যে।',
      privacy: 'CLOSED',
      creatorId: mahfuz.id,
      createdAt: hoursAgo(48),
      members: {
        create: [
          { userId: mahfuz.id, role: 'ADMIN', joinedAt: hoursAgo(48) },
          { userId: ismail.id, role: 'MEMBER', joinedAt: hoursAgo(47) },
          { userId: karishma.id, role: 'MEMBER', joinedAt: hoursAgo(30) },
        ],
      },
    },
  })

  /* ─── গ্রুপ-৩: প্রকাশ্য নতুন-লেখক উঠান (নির্মাতা: নুসরাত) ─── */
  const courtyard = await db.group.create({
    data: {
      name: 'নতুন লেখকের উঠান',
      description: 'প্রথম লেখা প্রকাশের সাহস জোগাড়ের উঠান — প্রশংসা, আলোচনা ও পরামর্শ।',
      privacy: 'OPEN',
      creatorId: nusrat.id,
      createdAt: hoursAgo(24),
      members: {
        create: [
          { userId: nusrat.id, role: 'ADMIN', joinedAt: hoursAgo(24) },
          { userId: monem.id, role: 'MEMBER', joinedAt: hoursAgo(22) },
          { userId: karishma.id, role: 'MEMBER', joinedAt: hoursAgo(20) },
        ],
      },
    },
  })

  /* ─── গ্রুপ-পোস্ট ─── */
  await db.post.create({
    data: {
      content:
        '<p>এই সপ্তাহের থিম: <strong>নদী</strong>। নদীকে ঘিরে লেখা আপনার সেরা কবিতাটি পোস্ট করুন — রবিবার রাত পর্যন্ত সময়!</p>',
      audience: 'PUBLIC',
      authorId: monem.id,
      groupId: kavita.id,
      createdAt: hoursAgo(5),
    },
  })
  await db.post.create({
    data: {
      content:
        '<p>গত সভায় আলোচিত গাব্রিয়েল গার্সিয়া মার্কেজের <em>এককালীন</em> অনুবাদ-খসড়ার ৩ নম্বর অধ্যায় আপডেট করেছি — সদস্যরা পড়ে মতামত দিন।</p>',
      audience: 'PUBLIC',
      authorId: mahfuz.id,
      groupId: translate.id,
      createdAt: hoursAgo(9),
    },
  })
  await db.post.create({
    data: {
      content:
        '<p>উঠানে স্বাগতম! প্রথম পোস্টে নিজের সম্পর্কে দু-কথা আর লেখার প্রতি ভালোবাসার গল্প বলুন 🌱</p>',
      audience: 'PUBLIC',
      authorId: nusrat.id,
      groupId: courtyard.id,
      createdAt: hoursAgo(3),
    },
  })

  console.log('গ্রুপ-সিড সম্পন্ন:', kavita.name, '|', translate.name, '|', courtyard.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
