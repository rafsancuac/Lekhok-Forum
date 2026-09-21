/**
 * অ্যাডমিন ড্যাশবোর্ড — ওভারভিউ (/admin)
 *
 * পেজ-বাই-পেজ, সেকশন-বাই-সেকশন কার্ড-ম্যাপ: এক নজরে সব সম্পাদনাযোগ্য সেকশন,
 * এক-ক্লিকে সংশ্লিষ্ট প্যানেলে প্রবেশ। প্রতিটি প্যানেল নিজের গেট নিজেই চালায়।
 */

import Link from 'next/link'

interface OverviewCard {
  label: string
  desc: string
  href: string
  icon: string
}

interface OverviewGroup {
  title: string
  note: string
  cards: OverviewCard[]
}

const GROUPS: OverviewGroup[] = [
  {
    title: '🏠 হোমপেজ কনটেন্ট',
    note: 'মূল ফিডের উপরে যা দেখাবে — সব এখান থেকে নিয়ন্ত্রিত',
    cards: [
      {
        label: 'নেতৃত্ব ও উপদেষ্টা পরিষদ',
        desc: '৮-স্লট কার্ড, ছবি-বাণী, কার্যবর্ষ + প্রতিটি কার্ডে অন/অফ টগল',
        href: '/admin/home/leadership',
        icon: '👥',
      },
      {
        label: 'জরুরি নোটিশ বার',
        desc: 'ফিডের একদম উপরের সরু ঘোষণা-পট্টি (উৎসব/সেশন-ফি/আহ্বান)',
        href: '/admin/home/notice',
        icon: '📢',
      },
      {
        label: 'পরিসংখ্যান কাউন্টার',
        desc: 'সদস্য-সংখ্যা, প্রকাশিত গ্রন্থ, সাহিত্য আসর — কাউন্টার-কার্ড',
        href: '/admin/home/stats',
        icon: '📊',
      },
      {
        label: 'স্বাগত বক্তব্য',
        desc: 'ফোরামের পক্ষ থেকে এক-নজরে মূল বক্তব্য-ব্লক',
        href: '/admin/home/welcome',
        icon: '📜',
      },
    ],
  },
  {
    title: '🏛️ পরিচিতি ও ইতিহাস',
    note: 'সংগঠনের নেতৃত্ব-পাতার নিচে পরিচিতি-ব্লক',
    cards: [
      {
        label: 'লক্ষ্য, উদ্দেশ্য ও নীতিমালা',
        desc: 'মিশন-ভিশন ব্লক — শিরোনাম + বর্ণনা',
        href: '/admin/about/mission-vision',
        icon: '🎯',
      },
      {
        label: 'ঐতিহাসিক মাইলফলক',
        desc: 'জন্মলগ্ন থেকে আজ — সাল-ভিত্তিক টাইমলাইন',
        href: '/admin/about/timeline',
        icon: '⏳',
      },
    ],
  },
  {
    title: '🗂️ সংগঠন ও সদস্য',
    note: 'সদস্য-ডাটাবেজ ও কমিটি',
    cards: [
      {
        label: 'কমিটি ব্যবস্থাপনা',
        desc: 'পূর্ণ কমিটি-তালিকা, ক্যাটাগরি, ড্র্যাগ-ড্রপ সাজাই',
        href: '/admin/leadership',
        icon: '🗂️',
      },
    ],
  },
  {
    title: '🛡️ সাপোর্ট কেন্দ্র',
    note: 'অফিসিয়াল সাপোর্ট-অ্যাডমিন ও অভিযোগ-ব্যবস্থাপনা',
    cards: [
      {
        label: 'অভিযোগ রিভিউ ডেস্ক',
        desc: 'সাপোর্ট-চ্যাটের সব অভিযোগ — লেখা/ছবি/অডিও/ভিডিও, স্টেটাস ও নোট',
        href: '/admin/support/reports',
        icon: '🛡️',
      },
      {
        label: 'সাপোর্ট-অ্যাডমিন নির্ধারণ',
        desc: 'কে সবার মেসেঞ্জার-তালিকায় পিন-লক অফিসিয়াল সাপোর্ট থাকবে (শুধু সুপার-অ্যাডমিন)',
        href: '/admin/support/settings',
        icon: '📌',
      },
    ],
  },
  {
    title: '⚙️ সাইট কনফিগারেশন',
    note: 'গ্লোবাল অংশ',
    cards: [
      {
        label: 'ফুটার, হেল্পলাইন ও সোশ্যাল লিঙ্ক',
        desc: 'পরিচিতি-লেখা, ইমেইল, হেল্পলাইন, ফেসবুক/ইউটিউব/টেলিগ্রাম, কপিরাইট',
        href: '/admin/settings/footer-social',
        icon: '⚙️',
      },
    ],
  },
]

export default function AdminOverviewPage() {
  return (
    <div className="font-hind text-[#050505] space-y-5">
      {/* হেডার */}
      <div className="bg-white border border-[#CED0D4] rounded-[10px] p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span aria-hidden>🧭</span>
            <span>অ্যাডমিন ড্যাশবোর্ড</span>
          </h1>
          <p className="text-xs text-[#65676B] mt-0.5">
            পেজ-বাই-পেজ, সেকশন-বাই-সেকশন — যেটা বদলাতে চান বেছে নিন; সেভ করলেই সাইটে সাথে-সাথে
            দেখা যাবে
          </p>
        </div>
        <Link
          href="/"
          className="px-3 py-2 bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] rounded-[8px] text-xs font-bold transition"
        >
          ← সাইটে ফিরে যান
        </Link>
      </div>

      {/* গ্রুপ-ভিত্তিক কার্ড-ম্যাপ */}
      {GROUPS.map((group) => (
        <section key={group.title}>
          <div className="mb-2 px-1">
            <h2 className="text-sm font-bold">{group.title}</h2>
            <p className="text-[11px] text-[#65676B]">{group.note}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {group.cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="bg-white border border-[#CED0D4] hover:border-[#006A4E]/60 hover:shadow-md rounded-[10px] p-4 transition-all group"
              >
                <span className="text-xl block mb-2" aria-hidden>
                  {card.icon}
                </span>
                <h3 className="text-[13px] font-bold text-[#050505] group-hover:text-[#006A4E] transition-colors">
                  {card.label}
                </h3>
                <p className="text-[11px] text-[#65676B] mt-1 leading-relaxed">{card.desc}</p>
                <span className="inline-flex items-center gap-1 mt-2.5 text-[11px] font-bold text-[#006A4E]">
                  সম্পাদনা করুন <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
