# ব্যাকআপ — টাস্ক ১২ (পর্ব ৩, অংশ খ) — মো. রাফছান এন্ট্রি স্থানান্তর

তারিখ: ২০২৬-০৯-০৮

## স্থানান্তরিত এন্ট্রির পূর্ণ ডেটা (কেন্দ্রীয় → উপদেষ্টা)

```json
{
  "name": "মো. রাফছান",
  "role": "উপদেষ্টা",
  "designation": "চট্টগ্রাম বিশ্ববিদ্যালয় শাখা কমিটি",
  "bio": null,
  "image_url": null,
  "social_fb": null,
  "social_email": null,
  "social_linkedin": null,
  "message": null,
  "term_year": "২০২২-২৩",
  "user_id": 1,        // লোকাল sql.js
  "user_id_turso": 9,  // প্রোডাকশন Turso
  "sort_order": 0
}
```

## উৎস সারি

- লোকাল sql.js: `members.id = 144` (member_type='central', term_year='২০২২-২৩')
- Turso:        `members.id = 329` (member_type='central', term_year='২০২২-২৩')

## ক্রিয়া

- কেন্দ্রীয় থেকে মুছে ফেলা হয়েছে; একই ডেটায় `member_type='advisory'` হিসেবে
  পুনরায় তৈরি করা হয়েছে (term_year='২০২২-২৩' সংরক্ষিত)।
- কোনো ফিল্ড (ছবি, বাণী, সোশ্যাল লিংক) হারায়নি — সব null ছিল, user_id লিংক সংরক্ষিত।
