/**
 * Session L — বাংলাদেশ টাইমজোন ফরম্যাটার (Asia/Dhaka, GMT+6)
 *
 * সমস্যা-সমাধান: সার্ভার/ডেটাবেজ UTC টাইমস্ট্যাম্প পাঠায়; ক্লায়েন্টে
 * সরাসরি স্ট্রিং দেখালে বাংলাদেশের সময় (GMT+6) থেকে ৬ ঘণ্টা পিছিয়ে
 * দেখায়। Intl.DateTimeFormat-এ timeZone: 'Asia/Dhaka' নির্ধারণ করায়
 * সার্ভার যেখানেই থাকুক, টাইমস্ট্যাম্প সর্বদা সঠিক বাংলাদেশ সময়ে রেন্ডার হবে।
 */
import { bn } from './format'

/** ইংরেজি সংখ্যা → বাংলা সংখ্যা (এই ফাইলের স্পেক-নাম — format.ts-এর bn-এর ডেলিগেট) */
export function toBnNumber(value: number | string): string {
  return bn(value)
}

/** বাংলা দিনভাগ: ভোর/সকাল/দুপুর/বিকাল/সন্ধ্যা/রাত (ঘণ্টা ২৪-ঘড়ায়) */
function bdDayPeriod(hour24: number): string {
  if (hour24 >= 4 && hour24 < 6) return 'ভোর'
  if (hour24 >= 6 && hour24 < 12) return 'সকাল'
  if (hour24 >= 12 && hour24 < 16) return 'দুপুর'
  if (hour24 >= 16 && hour24 < 18) return 'বিকাল'
  if (hour24 >= 18 && hour24 < 20) return 'সন্ধ্যা'
  return 'রাত'
}

/**
 * যেকোনো UTC তারিখকে বাংলাদেশ সময় (GMT+6) অনুযায়ী দিনভাগ-সহ বাংলা ডিজিটে
 * রূপান্তর করে। উদাহরণ: "2026-09-18T03:59:00.000Z" → "সকাল ০৯:৫৯"
 */
export function formatBdTime(dateInput: string | Date | number | undefined): string {
  if (!dateInput) return 'এইমাত্র'

  const date = new Date(dateInput)
  // ব্রাউজার যদি অবৈধ ডেট পায়
  if (isNaN(date.getTime())) return 'এইমাত্র'

  // বাংলাদেশ টাইমজোনে রূপান্তর
  const timeString = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)

  // timeString আসবে "9:59 AM" বা "11:48 PM" ফরম্যাটে
  const [rawTime, period] = timeString.split(' ')
  const [hours, minutes] = rawTime.split(':')
  const paddedHours = hours.padStart(2, '0')

  const bnHours = toBnNumber(paddedHours)
  const bnMinutes = toBnNumber(minutes)

  // হুবহু ঘণ্টা বের করতে বাংলাদেশ টাইমজোনে ২৪-ঘড়া ফরম্যাট নিই (দিনভাগের জন্য)
  const hour24 = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dhaka',
      hour: 'numeric',
      hour12: false,
    }).format(date),
    10
  )

  return `${bdDayPeriod(hour24)} ${bnHours}:${bnMinutes}`
}

/** বাংলা মাসের নাম (বাংলাদেশ টাইমজোনে) */
const BN_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
]

/**
 * বাংলাদেশ টাইমজোনে তারিখ + সময় (মেসেজ ডেট-সেপারেটর/পুরোনো মেসেজের জন্য)।
 * উদাহরণ: "১৮ সেপ্টেম্বর, সকাল ০৯:৫৯"
 */
export function formatBdDateTime(dateInput: string | Date | number | undefined): string {
  if (!dateInput) return 'এইমাত্র'
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return 'এইমাত্র'

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(date)

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const day = get('day')
  const month = parseInt(get('month'), 10)
  const year = toBnNumber(get('year'))

  return `${toBnNumber(day)} ${BN_MONTHS[month - 1]} ${year}, ${formatBdTime(date)}`
}

/** কাল/গতকাল/আজ-সচেতন ডেট-লেবেল (মেসেজ-থ্রেড সেপারেটরের জন্য) */
export function formatBdDayLabel(dateInput: string | Date | number | undefined): string {
  if (!dateInput) return ''
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return ''

  // বাংলাদেশ টাইমজোনের "আজ"-এর সাথে তুলনা (দুটোকেই Dhaka-র ক্যালেন্ডার-দিনে নামাই)
  const key = (d: Date) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d)

  const today = new Date()
  const yesterday = new Date(today.getTime() - 86_400_000)
  const dayKey = key(date)
  if (dayKey === key(today)) return 'আজ'
  if (dayKey === key(yesterday)) return 'গতকাল'

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).formatToParts(date)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const month = parseInt(get('month'), 10)
  return `${toBnNumber(get('day'))} ${BN_MONTHS[month - 1]} ${toBnNumber(get('year'))}`
}
