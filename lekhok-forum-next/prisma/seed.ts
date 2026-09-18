import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const GRADIENTS: Record<string, string> = {
  sunset: 'lf-gradient-sunset',
  ocean: 'lf-gradient-ocean',
  forest: 'lf-gradient-forest',
  night: 'lf-gradient-night',
  rose: 'lf-gradient-rose',
}

async function main() {
  console.log('🌱 Seeding Lekhok Forum demo data...')

  // পুরনো ডেটা পরিষ্কার (ডেমো রিসেট)
  await db.comment.deleteMany()
  await db.postReaction.deleteMany()
  await db.mediaAttachment.deleteMany()
  await db.post.deleteMany()
  await db.user.deleteMany()

  const users = await Promise.all(
    [
      {
        username: 'ismail',
        name: 'মোহাম্মদ ইসমাইল',
        email: 'ismail@lekhokforum.bd',
        bio: 'সাহিত্য সম্পাদক, লেখক ফোরাম। ছোটগল্প ও প্রবন্ধ লেখি।',
        avatarColor: '#006A4E',
      },
      {
        username: 'monem',
        name: 'নুরুল মোনেম',
        email: 'monem@lekhokforum.bd',
        bio: 'কবি ও গীতিকার। "জলছবি" কাব্যগ্রন্থের রচয়িতা।',
        avatarColor: '#8B5CF6',
      },
      {
        username: 'karishma',
        name: 'করিশমা আক্তার',
        email: 'karishma@lekhokforum.bd',
        bio: 'উপন্যাসিক। গ্রামবাংলার নারীজীবন নিয়ে লেখি।',
        avatarColor: '#D97706',
      },
      {
        username: 'mahfuz',
        name: 'মাহফুজুর রহমান',
        email: 'mahfuz@lekhokforum.bd',
        bio: 'অনুবাদক ও ভ্রমণকাহিনি লেখক।',
        avatarColor: '#0891B2',
      },
      {
        username: 'nusrat',
        name: 'নুসরাত জাহান',
        email: 'nusrat@lekhokforum.bd',
        bio: 'ফ্ল্যাশ ফিকশন ও ছড়া লেখি। লেখক ফোরাম মডারেটর।',
        avatarColor: '#E11D48',
      },
    ].map(async (u) => {
      const initials = u.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" rx="64" fill="${u.avatarColor}"/><text x="64" y="78" font-size="44" font-family="sans-serif" fill="white" text-anchor="middle">${initials}</text></svg>`
      const avatarUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
      return db.user.create({
        data: {
          username: u.username,
          name: u.name,
          email: u.email,
          bio: u.bio,
          avatarUrl,
        },
      })
    })
  )

  const [ismail, monem, karishma, mahfuz, nusrat] = users

  const now = Date.now()
  const ago = (minutes: number) => new Date(now - minutes * 60 * 1000)

  // ─── ডেমো পোস্ট ১: গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড টেক্সট পোস্ট ───
  await db.post.create({
    data: {
      content:
        '<h1>শব্দের দায়িত্ব</h1><p>লেখালেখি শুধু আবেগ নয় — প্রতিটি শব্দ একটি প্রতিশ্রুতি। যে ভাষায় আমরা ভাবি, সেই ভাষায়ই আমাদের গল্প বলতে হবে।</p><blockquote>পাঠক আয়না নয়, সঙ্গী — তাকে বিচার নয়, বরং আমন্ত্রণ জানাও।</blockquote>',
      backgroundColor: GRADIENTS.sunset,
      feeling: 'অনুপ্রাণিত বোধ করছি 🌟',
      audience: 'PUBLIC',
      authorId: ismail.id,
      createdAt: ago(95),
    },
  })

  // ─── ডেমো পোস্ট ২: ৫ ছবির কোলাজ (+N ওভারলে ডেমো) ───
  await db.post.create({
    data: {
      content:
        '<h2>বার্ষিক সাহিত্য উৎসব ২০২৫ — কিছু মুহূর্ত</h2><p>এবারের আয়োজনে ছিল ৪২ জন লেখক, ১২টি আলোচনা অধিবেশন আর হাজারো পাঠকের ভালোবাসা। ছবির পাতা গড়ে দেখুন।</p>',
      audience: 'PUBLIC',
      location: 'বাংলা একাডেমি, ঢাকা',
      authorId: karishma.id,
      createdAt: ago(240),
      media: {
        create: [1, 2, 3, 4, 5].map((n, idx) => ({
          url: `/demo/demo-${n}.png`,
          type: 'IMAGE',
          order: idx,
        })),
      },
    },
  })

  // ─── ডেমো পোস্ট ৩: কবিতা (৩ ছবির কোলাজ) ───
  await db.post.create({
    data: {
      content:
        '<h2>চায়ের কাপে জমা গদ্য</h2><p>রোদ উঠলে দোকান বসে,<br/>রাত নামলে জমে আড্ডা —<br/>পুরনো পত্রিকার ভাঁজে<br/>লুকানো থাকে একটা যুগ।</p><p><b>— জলছবি, পৃষ্ঠা ৩৭</b></p>',
      audience: 'PUBLIC',
      feeling: 'কাব্যিক মুডে 😌',
      authorId: monem.id,
      createdAt: ago(420),
      media: {
        create: [3, 5, 6].map((n, idx) => ({
          url: `/demo/demo-${n}.png`,
          type: 'IMAGE',
          order: idx,
        })),
      },
    },
  })

  // ─── ডেমো পোস্ট ৪: শুধু টেক্সট (ফরম্যাটিং ডেমো: তালিকা, বোল্ড, অ্যালাইন) ───
  await db.post.create({
    data: {
      content:
        '<h2>নতুন লেখকদের জন্য ৫টি পরামর্শ</h2><ol><li><b>প্রতিদিন লিখুন</b> — ৩০০ শব্দই যথেষ্ট</li><li>নিজের কথার সাথে সৎ থাকুন</li><li>পড়তে থাকুন, বিস্তৃতভাবে</li><li>সম্পাদনাকে ভয় পাবেন না — প্রথম খসড়া কেবল শুরু</li><li>পাঠক সম্প্রদায়ে যুক্ত হোন</li></ol><p>শুভকামনা রইল সবার জন্য! 🖋️</p>',
      audience: 'PUBLIC',
      authorId: mahfuz.id,
      createdAt: ago(720),
    },
  })

  // ─── ডেমো পোস্ট ৫: বন্ধুদের জন্য (FRIENDS audience) ───
  await db.post.create({
    data: {
      content:
        '<p>সোমবারের সাহিত্য-সভার খসড়া একেবারে শেষ ধাপে। শুক্রবার সবাই মিলে ফাইনাল রিভিউ করব নিশ্চয়ই? 📝</p>',
      audience: 'FRIENDS',
      authorId: nusrat.id,
      createdAt: ago(105),
    },
  })

  // ─── ডেমো পোস্ট ৬: পুরানো ঘোষণা ───
  await db.post.create({
    data: {
      content:
        '<h2>লেখক ফোরাম ই-ম্যাগাজিন "আলোর পিপাসা" — থিম ঘোষণা</h2><p>এবারের থিম: <b>"নদী আর মানুষ"</b>। জমা দেওয়ার শেষ সময় ৩০ নভেম্বর। সর্বোচ্চ ১,৫০০ শব্দ।</p><ul><li>গল্প: সর্বোচ্চ ২টি</li><li>কবিতা: সর্বোচ্চ ৩টি</li><li>প্রবন্ধ: ১টি</li></ul>',
      audience: 'PUBLIC',
      authorId: ismail.id,
      createdAt: ago(1500),
      media: {
        create: [{ url: '/demo/demo-6.png', type: 'IMAGE', order: 0 }],
      },
    },
  })

  // ─── কিছু রিঅ্যাকশন ও কমেন্ট ───
  const posts = await db.post.findMany({ orderBy: { createdAt: 'desc' } })
  const reactionPlan: [number, number, string][] = [
    // [postIndex, userIdx, type]
    [0, 1, 'LOVE'],
    [0, 2, 'LIKE'],
    [0, 3, 'CARE'],
    [0, 4, 'LIKE'],
    [1, 0, 'WOW'],
    [1, 1, 'LOVE'],
    [1, 4, 'HAHA'],
    [2, 0, 'LOVE'],
    [2, 3, 'LIKE'],
    [3, 1, 'LIKE'],
    [3, 2, 'LOVE'],
    [5, 2, 'WOW'],
  ]
  for (const [pIdx, uIdx, type] of reactionPlan) {
    if (posts[pIdx] && users[uIdx]) {
      await db.postReaction.create({
        data: { postId: posts[pIdx].id, userId: users[uIdx].id, type },
      })
    }
  }

  const commentPlan: { p: number; u: number; text: string; replyTo?: string }[] = []
  const c1 = await db.comment.create({
    data: {
      postId: posts[1].id,
      authorId: monem.id,
      content: 'দুর্দান্ত আয়োজন! পরেরবার অবশ্যই যোগ দেব।',
      createdAt: ago(200),
    },
  })
  await db.comment.create({
    data: {
      postId: posts[1].id,
      authorId: karishma.id,
      content: 'অবশ্যই মোনেম ভাই, আপনার জন্য অপেক্ষা থাকবে। 🙌',
      parentId: c1.id,
      createdAt: ago(180),
    },
  })
  await db.comment.create({
    data: {
      postId: posts[0].id,
      authorId: nusrat.id,
      content: '"পাঠক সঙ্গী" — এই লাইনটা রীতিমতো ভাঙন ধরালো মনে।',
      createdAt: ago(80),
    },
  })
  await db.comment.create({
    data: {
      postId: posts[3].id,
      authorId: ismail.id,
      content: '৪ নম্বর পয়েন্টটা নতুনদের জন্য সবচেয়ে জরুরি।',
      createdAt: ago(600),
    },
  })

  // ─── ডেমো স্টোরি (২৪-ঘণ্টা) ───
  const storyRows: {
    authorId: string
    text?: string
    background?: string
    mediaUrl?: string
    createdAgoH: number
  }[] = []
  if (monem) {
    storyRows.push(
      { authorId: monem.id, text: 'আজ ভোরে লেখা হলো নতুন একটি কবিতার প্রথম সারি…✍️', background: 'story-gradient-1', createdAgoH: 2 },
      { authorId: monem.id, text: '"জলছবি" — নতুন কাব্যগ্রন্থের প্রচ্ছদ আজ উন্মোচিত হবে।', background: 'story-gradient-2', createdAgoH: 1 }
    )
  }
  if (nusrat) storyRows.push({ authorId: nusrat.id, mediaUrl: '/demo/demo-3.png', text: 'লেখক ফোরামের বিকেল — চায়ের কাপ আর কলম ✨', createdAgoH: 4 })
  if (mahfuz) storyRows.push({ authorId: mahfuz.id, text: 'নতুন অনুবাদ শুরু করলাম — এবার জাপানি উপন্যাস!', background: 'story-gradient-3', createdAgoH: 8 })
  if (ismail) storyRows.push({ authorId: ismail.id, mediaUrl: '/demo/demo-1.png', text: 'সাহিত্য সম্পাদকীয় নিয়ে কাজ চলছে 📝', createdAgoH: 3 })

  const storyCount = storyRows.length
  for (const r of storyRows) {
    const createdAt = ago(r.createdAgoH * 60)
    await db.story.create({
      data: {
        authorId: r.authorId,
        mediaUrl: r.mediaUrl ?? null,
        text: r.text ?? null,
        background: r.background ?? null,
        createdAt,
        expiresAt: new Date(createdAt.getTime() + 24 * 3600_000),
      },
    })
  }

  console.log(`✅ Seeded ${users.length} users, ${posts.length} posts, ${storyCount} stories, reactions & comments`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
