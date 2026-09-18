/** ইংরেজি সংখ্যা → বাংলা সংখ্যা */
export function bn(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)])
}
