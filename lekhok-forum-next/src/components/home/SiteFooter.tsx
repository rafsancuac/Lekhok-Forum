'use client'

/**
 * সাইট-ফুটার (DB-চালিত) — অ্যাডমিন প্যানেল /admin/settings/footer-social থেকে নিয়ন্ত্রিত (Task62-c)
 *
 * • /api/site-content (FooterSetting) — পরিচিতি, ইমেইল, হেল্পলাইন, সোশ্যাল-লিঙ্ক, কপিরাইট
 * • isOn=false বা সব-খালি হলে কেবল ডিফল্ট কপিরাইট-লাইন (আগের মতো)
 * • মূল-পেজের flex-col-এ mt-auto — কনটেন্ট-কম হলেও ফুটার নিচেই থাকে
 */

import React, { useEffect, useState } from 'react'
import { Feather, Facebook, Youtube, Send, Mail, Phone } from 'lucide-react'

interface FooterData {
  aboutText: string
  contactEmail: string
  helpline: string
  facebookUrl: string
  youtubeUrl: string
  telegramUrl: string
  copyrightText: string
  isOn: boolean
}

export default function SiteFooter() {
  const [footer, setFooter] = useState<FooterData | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/api/site-content')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d) setFooter(d.footer)
      })
      .catch(() => null)
    return () => {
      alive = false
    }
  }, [])

  const custom = footer?.isOn && footer && (footer.aboutText || footer.contactEmail || footer.helpline || footer.facebookUrl || footer.youtubeUrl || footer.telegramUrl)
  const copyright = footer?.isOn && footer.copyrightText ? footer.copyrightText : 'লেখক ফোরাম — বাংলা লেখকদের নিজের ঠিকানা © ২০২৫'

  const socials = [
    footer?.facebookUrl ? { href: footer.facebookUrl, label: 'ফেসবুক', Icon: Facebook } : null,
    footer?.youtubeUrl ? { href: footer.youtubeUrl, label: 'ইউটিউব', Icon: Youtube } : null,
    footer?.telegramUrl ? { href: footer.telegramUrl, label: 'টেলিগ্রাম', Icon: Send } : null,
  ].filter(Boolean) as { href: string; label: string; Icon: typeof Facebook }[]

  return (
    <footer className="mt-auto bg-[#242526] border-t border-[#3e4042] px-4 pt-5 pb-4">
      <div className="max-w-[1360px] mx-auto">
        {custom && (
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 mb-4 pb-4 border-b border-[#3e4042]/70">
            {/* পরিচিতি + যোগাযোগ */}
            <div className="min-w-0 max-w-md">
              <p className="flex items-center gap-1.5 text-[13px] font-bold text-[#e4e6eb]">
                <Feather className="w-4 h-4 text-[#00a86b]" />
                লেখক ফোরাম
              </p>
              {footer.aboutText && (
                <p className="mt-1.5 text-[12px] leading-relaxed text-[#8a8d91] font-kalpurush">
                  {footer.aboutText}
                </p>
              )}
              <div className="mt-2 flex flex-col gap-1">
                {footer.contactEmail && (
                  <a
                    href={`mailto:${footer.contactEmail}`}
                    className="inline-flex items-center gap-1.5 text-[11.5px] text-[#8a8d91] hover:text-[#00d67e] transition w-fit"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#00a86b]" /> {footer.contactEmail}
                  </a>
                )}
                {footer.helpline && (
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] text-[#8a8d91]">
                    <Phone className="w-3.5 h-3.5 text-[#00a86b]" /> {footer.helpline}
                  </span>
                )}
              </div>
            </div>

            {/* সোশ্যাল */}
            {socials.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="w-9 h-9 rounded-full bg-[#3a3b3c] flex items-center justify-center text-[#b0b3b8] hover:text-white hover:bg-[#006a4e] transition"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* কপিরাইট-লাইন */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-[#8a8d91]">
          <p className="flex items-center gap-1.5">
            {!custom && <Feather className="w-3.5 h-3.5 text-[#00a86b]" />}
            {copyright}
          </p>
          <div className="flex items-center gap-3">
            <span className="hover:text-[#e4e6eb] cursor-pointer transition">গোপনীয়তা</span>
            <span className="hover:text-[#e4e6eb] cursor-pointer transition">শর্তাবলী</span>
            <span className="hover:text-[#e4e6eb] cursor-pointer transition">সহায়তা</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
