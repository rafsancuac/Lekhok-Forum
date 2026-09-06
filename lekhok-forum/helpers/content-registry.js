/**
 * helpers/content-registry.js — সাইটের সম্পাদনাযোগ্য কনটেন্টের কেন্দ্রীয় রেজিস্ট্রি
 * ═══════════════════════════════════════════════════════════════════════════
 * সেশন ৩৩: "এডমিন প্যানেলে হোম পেইজসহ প্রতিটা পেইজ, সেকশন ঠিকঠাক করার মত"
 *
 * প্রতিটি ফিল্ড = settings টেবিলের একটি key ('content_' প্রিফিক্সসহ)।
 *  - অ্যাডমিন মান লিখলে → সেটাই সাইটে দেখাবে (getSettingsAll ক্যাশে সাথে সাথে ইনভ্যালিড)
 *  - খালি রাখলে → DEFAULTS-এর ডিফল্ট লেখা দেখাবে (সাইট কখনো খালি দেখাবে না)
 *
 * ভিউতে ব্যবহার:  <%= C('home_hero_title') %>          (এস্কেপড, এক-লাইন)
 *                 <%- Cbr('about_identity_text') %>    (এস্কেপড + নতুন লাইন → <br>)
 *
 * টাইপ: text (ইনপুট), textarea (বড় লেখা), number (সংখ্যা), icon (Font Awesome ক্লাস)
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PAGES = [
  {
    key: 'home', label: 'হোম পেইজ', icon: 'fas fa-home', path: '/',
    groups: [
      {
        key: 'hero', label: 'হিরো সেকশন', fields: [
          { key: 'home_hero_eyebrow', label: 'উপরের ছোট লেখা (শাখা পরিচিতি)', type: 'text' },
          { key: 'home_hero_title', label: 'মূল শিরোনাম (সাদা অংশ)', type: 'text' },
          { key: 'home_hero_title_accent', label: 'মূল শিরোনাম (সবুজ অংশ)', type: 'text' },
          { key: 'home_hero_sub', label: 'হিরো বিবরণ', type: 'textarea', rows: 4 },
          { key: 'home_hero_btn1', label: '১ম বাটনের লেখা', type: 'text' },
          { key: 'home_hero_btn2', label: '২য় বাটনের লেখা', type: 'text' },
          { key: 'home_hero_banner', label: 'হিরো ব্যানার ছবি', type: 'image', hint: 'হিরোর পটভূমিতে হালকা ভাবে দেখানো হবে (ওপাসিটি ~১৬%)। খালি রাখলে বর্তমান গ্র্যাডিয়েন্ট ডিজাইনই থাকবে।' }
        ]
      },
      {
        key: 'stats', label: 'হিরো স্ট্যাট কার্ড (৪টি)', fields: [
          { key: 'home_stat1_num', label: 'কার্ড ১ | সংখ্যা', type: 'number', hint: 'ইংরেজি সংখ্যায় (যেমন 1200)' },
          { key: 'home_stat1_label', label: 'কার্ড ১ | লেবেল', type: 'text' },
          { key: 'home_stat2_num', label: 'কার্ড ২ | সংখ্যা', type: 'number' },
          { key: 'home_stat2_label', label: 'কার্ড ২ | লেবেল', type: 'text' },
          { key: 'home_stat3_num', label: 'কার্ড ৩ | সংখ্যা', type: 'number' },
          { key: 'home_stat3_label', label: 'কার্ড ৩ | লেবেল', type: 'text' },
          { key: 'home_stat4_num', label: 'কার্ড ৪ | সংখ্যা', type: 'number' },
          { key: 'home_stat4_label', label: 'কার্ড ৪ | লেবেল', type: 'text' }
        ]
      },
      {
        key: 'today', label: 'আজকের কন্টেন্ট সেকশন', fields: [
          { key: 'home_today_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'home_today_t1', label: 'শিরোনাম (শুরু)', type: 'text' },
          { key: 'home_today_accent', label: 'শিরোনাম (সবুজ মাঝের অংশ)', type: 'text' },
          { key: 'home_today_t2', label: 'শিরোনাম (শেষ)', type: 'text' },
          { key: 'home_today_lead', label: 'সেকশন বিবরণ', type: 'textarea', rows: 2 }
        ]
      },
      {
        key: 'mission', label: 'লক্ষ্য ও উদ্দেশ্য সেকশন', fields: [
          { key: 'home_mission_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'home_mission_t1', label: 'শিরোনাম (শুরু)', type: 'text' },
          { key: 'home_mission_accent', label: 'শিরোনাম (সবুজ অংশ)', type: 'text' },
          { key: 'home_mission_lead', label: 'সেকশন বিবরণ', type: 'textarea', rows: 4 }
        ]
      },
      {
        key: 'features', label: 'লক্ষ্যের ৮টি কার্ড', fields: [
          { key: 'home_feature1_icon', label: 'কার্ড ১ | আইকন', type: 'icon' },
          { key: 'home_feature1_title', label: 'কার্ড ১ | শিরোনাম', type: 'text' },
          { key: 'home_feature1_text', label: 'কার্ড ১ | বিবরণ', type: 'textarea', rows: 2 },
          { key: 'home_feature2_icon', label: 'কার্ড ২ | আইকন', type: 'icon' },
          { key: 'home_feature2_title', label: 'কার্ড ২ | শিরোনাম', type: 'text' },
          { key: 'home_feature2_text', label: 'কার্ড ২ | বিবরণ', type: 'textarea', rows: 2 },
          { key: 'home_feature3_icon', label: 'কার্ড ৩ | আইকন', type: 'icon' },
          { key: 'home_feature3_title', label: 'কার্ড ৩ | শিরোনাম', type: 'text' },
          { key: 'home_feature3_text', label: 'কার্ড ৩ | বিবরণ', type: 'textarea', rows: 2 },
          { key: 'home_feature4_icon', label: 'কার্ড ৪ | আইকন', type: 'icon' },
          { key: 'home_feature4_title', label: 'কার্ড ৪ | শিরোনাম', type: 'text' },
          { key: 'home_feature4_text', label: 'কার্ড ৪ | বিবরণ', type: 'textarea', rows: 2 },
          { key: 'home_feature5_icon', label: 'কার্ড ৫ | আইকন', type: 'icon' },
          { key: 'home_feature5_title', label: 'কার্ড ৫ | শিরোনাম', type: 'text' },
          { key: 'home_feature5_text', label: 'কার্ড ৫ | বিবরণ', type: 'textarea', rows: 2 },
          { key: 'home_feature6_icon', label: 'কার্ড ৬ | আইকন', type: 'icon' },
          { key: 'home_feature6_title', label: 'কার্ড ৬ | শিরোনাম', type: 'text' },
          { key: 'home_feature6_text', label: 'কার্ড ৬ | বিবরণ', type: 'textarea', rows: 2 },
          { key: 'home_feature7_icon', label: 'কার্ড ৭ | আইকন', type: 'icon' },
          { key: 'home_feature7_title', label: 'কার্ড ৭ | শিরোনাম', type: 'text' },
          { key: 'home_feature7_text', label: 'কার্ড ৭ | বিবরণ', type: 'textarea', rows: 2 },
          { key: 'home_feature8_icon', label: 'কার্ড ৮ | আইকন', type: 'icon' },
          { key: 'home_feature8_title', label: 'কার্ড ৮ | শিরোনাম', type: 'text' },
          { key: 'home_feature8_text', label: 'কার্ড ৮ | বিবরণ', type: 'textarea', rows: 2 }
        ]
      },
      {
        key: 'leaders', label: 'নেতৃত্ব সেকশন (শিরোনাম ও পদবি)', fields: [
          { key: 'home_lead1_eyebrow', label: 'সেকশন ১ | ছোট লেখা', type: 'text' },
          { key: 'home_lead1_t1', label: 'সেকশন ১ | শিরোনাম (শুরু)', type: 'text' },
          { key: 'home_lead1_accent', label: 'সেকশন ১ | শিরোনাম (সবুজ অংশ)', type: 'text' },
          { key: 'home_lead2_eyebrow', label: 'সেকশন ২ | ছোট লেখা', type: 'text' },
          { key: 'home_lead2_t1', label: 'সেকশন ২ | শিরোনাম (শুরু)', type: 'text' },
          { key: 'home_lead2_accent', label: 'সেকশন ২ | শিরোনাম (সবুজ অংশ)', type: 'text' },
          { key: 'home_year_founding', label: 'প্রতিষ্ঠাকালীন কার্যবর্ষ লেখা', type: 'text' },
          { key: 'home_year_current', label: 'বর্তমান কার্যবর্ষ লেখা', type: 'text' },
          { key: 'home_role_founder_president', label: 'পদবি | প্রতিষ্ঠাতা সভাপতি', type: 'text' },
          { key: 'home_role_founder_gs', label: 'পদবি | প্রতিষ্ঠাতা সাধারণ সম্পাদক', type: 'text' },
          { key: 'home_role_founding_advisor1', label: 'পদবি | প্রতিষ্ঠাকালীন উপদেষ্টা (১ম)', type: 'text' },
          { key: 'home_role_founding_advisor2', label: 'পদবি | প্রতিষ্ঠাকালীন উপদেষ্টা (২য়)', type: 'text' },
          { key: 'home_role_current_president', label: 'পদবি | বর্তমান সভাপতি', type: 'text' },
          { key: 'home_role_current_gs', label: 'পদবি | বর্তমান সাধারণ সম্পাদক', type: 'text' },
          { key: 'home_role_current_advisor1', label: 'পদবি | বর্তমান উপদেষ্টা (১ম)', type: 'text' },
          { key: 'home_role_current_advisor2', label: 'পদবি | বর্তমান উপদেষ্টা (২য়)', type: 'text' }
        ]
      },
      {
        key: 'qa_feed', label: 'জিজ্ঞাসা ও ইউজার ফিড', fields: [
          { key: 'home_qa_eyebrow', label: 'জিজ্ঞাসা ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'home_qa_title', label: 'জিজ্ঞাসা সেকশন শিরোনাম', type: 'text' },
          { key: 'home_qa_more', label: '"সকল প্রশ্ন" লিংকের লেখা', type: 'text' },
          { key: 'home_feed_eyebrow', label: 'ফিড ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'home_feed_title', label: 'ইউজার ফিড শিরোনাম', type: 'text' },
          { key: 'home_feed_desc', label: 'ইউজার ফিড বিবরণ', type: 'textarea', rows: 2 },
          { key: 'home_feed_point1', label: 'ফিড সুবিধা ১', type: 'text' },
          { key: 'home_feed_point2', label: 'ফিড সুবিধা ২', type: 'text' },
          { key: 'home_feed_point3', label: 'ফিড সুবিধা ৩', type: 'text' },
          { key: 'home_feed_btn', label: 'ফিডে যাওয়ার বাটন', type: 'text' },
          { key: 'home_feed_btn2', label: 'রেজিস্ট্রেশন বাটন', type: 'text' },
          { key: 'home_feed_widget_label', label: 'স্লাইডিং উইজেটের ছোট লেবেল', type: 'text' },
          { key: 'home_feed_banner', label: 'ফিড শোকেস ব্যানার ছবি', type: 'image', hint: 'ফিড প্যানেলের পটভূমিতে হালকা ভাবে দেখানো হবে। খালি রাখলে গ্র্যাডিয়েন্ট ডিজাইনই থাকবে।' }
        ]
      },
      {
        key: 'notices', label: 'সাম্প্রতিক বিজ্ঞপ্তি সেকশন', fields: [
          { key: 'home_notices_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'home_notices_t1', label: 'শিরোনাম (শুরু)', type: 'text' },
          { key: 'home_notices_accent', label: 'শিরোনাম (সবুজ অংশ)', type: 'text' },
          { key: 'home_notices_more', label: '"সকল বিজ্ঞপ্তি" লিংকের লেখা', type: 'text' }
        ]
      }
    ]
  },
  {
    key: 'about', label: 'পরিচিতি পেইজ', icon: 'fas fa-info-circle', path: '/about',
    groups: [
      {
        key: 'header', label: 'পেজ হেডার', fields: [
          { key: 'about_header_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'about_header_title', label: 'পেজ শিরোনাম', type: 'text' },
          { key: 'about_header_sub', label: 'পেজ বিবরণ', type: 'text' }
        ]
      },
      {
        key: 'identity', label: 'আমাদের পরিচয়', fields: [
          { key: 'about_identity_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'about_identity_t1', label: 'শিরোনাম (শুরু)', type: 'text' },
          { key: 'about_identity_accent', label: 'শিরোনাম (সবুজ অংশ)', type: 'text' },
          { key: 'about_identity_text', label: 'পরিচিতি অনুচ্ছেদ', type: 'textarea', rows: 6 },
          { key: 'about_motto_label', label: 'মূলমন্ত্র চিপ | লেবেল', type: 'text' },
          { key: 'about_motto_text', label: 'মূলমন্ত্র চিপ | লেখা', type: 'text' },
          { key: 'about_slogan_label', label: 'স্লোগান চিপ | লেবেল', type: 'text' },
          { key: 'about_slogan_text', label: 'স্লোগান চিপ | লেখা', type: 'text' },
          { key: 'about_committee_btn', label: 'কমিটি বাটনের লেখা', type: 'text' }
        ]
      },
      {
        key: 'goals', label: 'লক্ষ্য ও উদ্দেশ্য (৬টি)', fields: [
          { key: 'about_goals_title', label: 'কার্ড শিরোনাম', type: 'text' },
          { key: 'about_goal1', label: 'লক্ষ্য ১', type: 'textarea', rows: 2 },
          { key: 'about_goal2', label: 'লক্ষ্য ২', type: 'textarea', rows: 2 },
          { key: 'about_goal3', label: 'লক্ষ্য ৩', type: 'textarea', rows: 3 },
          { key: 'about_goal4', label: 'লক্ষ্য ৪', type: 'textarea', rows: 2 },
          { key: 'about_goal5', label: 'লক্ষ্য ৫', type: 'textarea', rows: 2 },
          { key: 'about_goal6', label: 'লক্ষ্য ৬', type: 'textarea', rows: 2 }
        ]
      },
      {
        key: 'magazine', label: 'পত্রিকায় পাতায় লেখক ফোরাম', fields: [
          { key: 'about_magazine_title', label: 'সেকশন শিরোনাম', type: 'text' },
          { key: 'about_magazine_text', label: 'সেকশন বিবরণ', type: 'textarea', rows: 4 }
        ]
      },
      {
        key: 'activities', label: 'কার্যাক্রমসমূহ (৮টি কার্ড)', fields: [
          { key: 'about_act_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'about_act_t1', label: 'শিরোনাম (শুরু)', type: 'text' },
          { key: 'about_act_accent', label: 'শিরোনাম (সবুজ অংশ)', type: 'text' },
          { key: 'about_act1_icon', label: 'কার্ড ১ | আইকন', type: 'icon' },
          { key: 'about_act1_title', label: 'কার্ড ১ | শিরোনাম', type: 'text' },
          { key: 'about_act1_text', label: 'কার্ড ১ | বিবরণ', type: 'textarea', rows: 2 },
          { key: 'about_act2_icon', label: 'কার্ড ২ | আইকন', type: 'icon' },
          { key: 'about_act2_title', label: 'কার্ড ২ | শিরোনাম', type: 'text' },
          { key: 'about_act2_text', label: 'কার্ড ২ | বিবরণ', type: 'textarea', rows: 2 },
          { key: 'about_act3_icon', label: 'কার্ড ৩ | আইকন', type: 'icon' },
          { key: 'about_act3_title', label: 'কার্ড ৩ | শিরোনাম', type: 'text' },
          { key: 'about_act3_text', label: 'কার্ড ৩ | বিবরণ', type: 'textarea', rows: 2 },
          { key: 'about_act4_icon', label: 'কার্ড ৪ | আইকন', type: 'icon' },
          { key: 'about_act4_title', label: 'কার্ড ৪ | শিরোনাম', type: 'text' },
          { key: 'about_act4_text', label: 'কার্ড ৪ | বিবরণ', type: 'textarea', rows: 2 },
          { key: 'about_act5_icon', label: 'কার্ড ৫ | আইকন', type: 'icon' },
          { key: 'about_act5_title', label: 'কার্ড ৫ | শিরোনাম', type: 'text' },
          { key: 'about_act5_text', label: 'কার্ড ৫ | বিবরণ', type: 'textarea', rows: 2 },
          { key: 'about_act6_icon', label: 'কার্ড ৬ | আইকন', type: 'icon' },
          { key: 'about_act6_title', label: 'কার্ড ৬ | শিরোনাম', type: 'text' },
          { key: 'about_act6_text', label: 'কার্ড ৬ | বিবরণ', type: 'textarea', rows: 2 },
          { key: 'about_act7_icon', label: 'কার্ড ৭ | আইকন', type: 'icon' },
          { key: 'about_act7_title', label: 'কার্ড ৭ | শিরোনাম', type: 'text' },
          { key: 'about_act7_text', label: 'কার্ড ৭ | বিবরণ', type: 'textarea', rows: 2 },
          { key: 'about_act8_icon', label: 'কার্ড ৮ | আইকন', type: 'icon' },
          { key: 'about_act8_title', label: 'কার্ড ৮ | শিরোনাম', type: 'text' },
          { key: 'about_act8_text', label: 'কার্ড ৮ | বিবরণ', type: 'textarea', rows: 2 }
        ]
      },
      {
        key: 'cta', label: 'কলম সৈনিক ব্যানার', fields: [
          { key: 'about_cta_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'about_cta_t1', label: 'শিরোনাম (শুরু)', type: 'text' },
          { key: 'about_cta_accent', label: 'শিরোনাম (সবুজ অংশ)', type: 'text' },
          { key: 'about_cta_t2', label: 'শিরোনাম (শেষ)', type: 'text' },
          { key: 'about_cta_text', label: 'ব্যানার বিবরণ', type: 'textarea', rows: 6 },
          { key: 'about_cta_btn1', label: '১ম বাটন', type: 'text' },
          { key: 'about_cta_btn2', label: '২য় বাটন', type: 'text' },
          { key: 'about_cta_bg', label: 'ব্যানার পটভূমি ছবি', type: 'image', hint: 'ব্যানারের পটভূমিতে হালকা ভাবে দেখানো হবে। খালি রাখলে বর্তমান ডিজাইনই থাকবে।' }
        ]
      },
      {
        key: 'conditions', label: 'সদস্য হওয়ার শর্তাবলি', fields: [
          { key: 'about_cond_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'about_cond_t1', label: 'শিরোনাম (শুরু)', type: 'text' },
          { key: 'about_cond_accent', label: 'শিরোনাম (সবুজ অংশ)', type: 'text' },
          { key: 'about_step1_title', label: 'ধাপ ১ | শিরোনাম', type: 'text' },
          { key: 'about_step1_text', label: 'ধাপ ১ | বিবরণ', type: 'textarea', rows: 3 },
          { key: 'about_pay_number', label: 'ধাপ ১ | পেমেন্ট নম্বর লাইন', type: 'text' },
          { key: 'about_step2_title', label: 'ধাপ ২ | শিরোনাম', type: 'text' },
          { key: 'about_step2_text', label: 'ধাপ ২ | বিবরণ', type: 'textarea', rows: 3 },
          { key: 'about_step3_title', label: 'ধাপ ৩ | শিরোনাম', type: 'text' },
          { key: 'about_step3_text', label: 'ধাপ ৩ | বিবরণ', type: 'textarea', rows: 3 },
          { key: 'about_step4_title', label: 'ধাপ ৪ | শিরোনাম', type: 'text' },
          { key: 'about_step4_text', label: 'ধাপ ৪ | বিবরণ', type: 'textarea', rows: 3 },
          { key: 'about_rules_title', label: 'অবশ্যপালনীয় শর্ত কার্ড শিরোনাম', type: 'text' },
          { key: 'about_rule1', label: 'শর্ত ১', type: 'text' },
          { key: 'about_rule2', label: 'শর্ত ২', type: 'text' },
          { key: 'about_rule3', label: 'শর্ত ৩', type: 'text' },
          { key: 'about_rule4', label: 'শর্ত ৪', type: 'text' },
          { key: 'about_rule5', label: 'শর্ত ৫', type: 'text' },
          { key: 'about_rule6', label: 'শর্ত ৬', type: 'text' },
          { key: 'about_rule7', label: 'শর্ত ৭', type: 'text' },
          { key: 'about_rule8', label: 'শর্ত ৮', type: 'text' },
          { key: 'about_rule9', label: 'শর্ত ৯', type: 'text' },
          { key: 'about_rule10', label: 'শর্ত ১০', type: 'text' },
          { key: 'about_warning_title', label: 'বিঃদ্রঃ কার্ড শিরোনাম', type: 'text' },
          { key: 'about_warning_text', label: 'বিঃদ্রঃ কার্ড বিবরণ', type: 'textarea', rows: 4 }
        ]
      }
    ]
  },
  {
    key: 'contact', label: 'যোগাযোগ পেইজ', icon: 'fas fa-envelope', path: '/contact',
    groups: [
      {
        key: 'header', label: 'পেজ হেডার', fields: [
          { key: 'contact_header_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'contact_header_t1', label: 'শিরোনাম (শুরু)', type: 'text' },
          { key: 'contact_header_accent', label: 'শিরোনাম (সবুজ অংশ)', type: 'text' },
          { key: 'contact_header_sub', label: 'পেজ বিবরণ', type: 'text' }
        ]
      },
      {
        key: 'info', label: 'যোগাযোগের তথ্য', fields: [
          { key: 'contact_info_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'contact_info_t1', label: 'শিরোনাম (শুরু)', type: 'text' },
          { key: 'contact_info_accent', label: 'শিরোনাম (সবুজ অংশ)', type: 'text' },
          { key: 'contact_info_text', label: 'সেকশন বিবরণ', type: 'textarea', rows: 2 },
          { key: 'contact_office_label', label: 'কার্যালয় | লেবেল', type: 'text', hint: 'ঠিকানা সেটিংস পেজ থেকে আসে' },
          { key: 'contact_fb_label', label: 'ফেসবুক | লেবেল', type: 'text' },
          { key: 'contact_fb_text', label: 'ফেসবুক | লেখা', type: 'text' },
          { key: 'contact_tg_label', label: 'টেলিগ্রাম | লেবেল', type: 'text' },
          { key: 'contact_tg_text', label: 'টেলিগ্রাম | লেখা', type: 'text' }
        ]
      },
      {
        key: 'form', label: 'বার্তা ফর্ম', fields: [
          { key: 'contact_form_title', label: 'ফর্ম শিরোনাম', type: 'text' },
          { key: 'contact_form_text', label: 'ফর্ম বিবরণ', type: 'text' },
          { key: 'contact_form_btn', label: 'ফর্ম বাটন', type: 'text' }
        ]
      },
      {
        key: 'location', label: 'অবস্থান ও অফিস সময়', fields: [
          { key: 'contact_loc_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'contact_loc_t1', label: 'শিরোনাম (শুরু)', type: 'text' },
          { key: 'contact_loc_accent', label: 'শিরোনাম (সবুজ অংশ)', type: 'text' },
          { key: 'contact_loc_text', label: 'সেকশন বিবরণ', type: 'textarea', rows: 2 },
          { key: 'contact_hours1', label: 'অফিস সময় ১', type: 'text' },
          { key: 'contact_hours2', label: 'অফিস সময় ২', type: 'text' },
          { key: 'contact_hours3', label: 'অফিস সময় ৩', type: 'text' },
          { key: 'contact_hours4', label: 'অফিস সময় ৪', type: 'text' }
        ]
      },
      {
        key: 'campus', label: 'ক্যাম্পাস সেকশন', fields: [
          { key: 'contact_campus_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'contact_campus_t1', label: 'শিরোনাম (শুরু)', type: 'text' },
          { key: 'contact_campus_accent', label: 'শিরোনাম (সবুজ অংশ)', type: 'text' },
          { key: 'contact_campus_lead', label: 'সেকশন বিবরণ', type: 'textarea', rows: 2 },
          { key: 'contact_crs_uni', label: 'বিশ্ববিদ্যালয় তথ্য | সাব-টাইটেল', type: 'text' },
          { key: 'contact_crs_transport', label: 'যাতায়াত তথ্য | সাব-টাইটেল', type: 'text' }
        ]
      }
    ]
  },
  {
    key: 'committee', label: 'কার্যনির্বাহী কমিটি', icon: 'fas fa-users-cog', path: '/committee',
    groups: [
      {
        key: 'header', label: 'পেজ হেডার', fields: [
          { key: 'committee_header_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'committee_header_title', label: 'পেজ শিরোনাম', type: 'text' },
          { key: 'committee_header_sub', label: 'পেজ বিবরণ', type: 'text' },
          { key: 'committee_term_label', label: 'কার্যবর্ষ ড্রপডাউন লেবেল', type: 'text' }
        ]
      }
    ]
  },
  {
    key: 'advisory', label: 'উপদেষ্টা পরিষদ', icon: 'fas fa-user-tie', path: '/committee/advisory',
    groups: [
      {
        key: 'header', label: 'পেজ হেডার', fields: [
          { key: 'advisory_header_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'advisory_header_title', label: 'পেজ শিরোনাম', type: 'text' },
          { key: 'advisory_header_sub', label: 'পেজ বিবরণ', type: 'text' }
        ]
      }
    ]
  },
  {
    key: 'members', label: 'সদস্য পরিচিতি', icon: 'fas fa-users', path: '/members',
    groups: [
      {
        key: 'header', label: 'পেজ হেডার', fields: [
          { key: 'members_header_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'members_header_title', label: 'পেজ শিরোনাম', type: 'text' },
          { key: 'members_header_sub', label: 'পেজ বিবরণ', type: 'text' }
        ]
      }
    ]
  },
  {
    key: 'team', label: 'সম্পূর্ণ টিম', icon: 'fas fa-sitemap', path: '/team',
    groups: [
      {
        key: 'header', label: 'পেজ হেডার', fields: [
          { key: 'team_header_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'team_header_t1', label: 'শিরোনাম (শুরু)', type: 'text' },
          { key: 'team_header_accent', label: 'শিরোনাম (সবুজ অংশ)', type: 'text' },
          { key: 'team_header_sub', label: 'পেজ বিবরণ', type: 'text' }
        ]
      }
    ]
  },
  {
    key: 'notices', label: 'বিজ্ঞপ্তি পেইজ', icon: 'fas fa-bullhorn', path: '/notices',
    groups: [
      {
        key: 'header', label: 'পেজ হেডার', fields: [
          { key: 'notices_header_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'notices_header_t1', label: 'শিরোনাম (শুরু)', type: 'text' },
          { key: 'notices_header_accent', label: 'শিরোনাম (সবুজ অংশ)', type: 'text' },
          { key: 'notices_header_sub', label: 'পেজ বিবরণ', type: 'text' }
        ]
      }
    ]
  },
  {
    key: 'events', label: 'ইভেন্ট পেইজ', icon: 'fas fa-calendar-alt', path: '/events',
    groups: [
      {
        key: 'header', label: 'পেজ হেডার', fields: [
          { key: 'events_header_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'events_header_t1', label: 'শিরোনাম (শুরু)', type: 'text' },
          { key: 'events_header_accent', label: 'শিরোনাম (সবুজ অংশ)', type: 'text' },
          { key: 'events_header_sub', label: 'পেজ বিবরণ', type: 'text' }
        ]
      }
    ]
  },
  {
    key: 'gallery', label: 'গ্যালারি পেইজ', icon: 'fas fa-images', path: '/gallery',
    groups: [
      {
        key: 'header', label: 'পেজ হেডার', fields: [
          { key: 'gallery_header_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'gallery_header_t1', label: 'শিরোনাম (শুরু)', type: 'text' },
          { key: 'gallery_header_accent', label: 'শিরোনাম (সবুজ অংশ)', type: 'text' },
          { key: 'gallery_header_sub', label: 'পেজ বিবরণ', type: 'text' }
        ]
      }
    ]
  },
  {
    key: 'resources', label: 'রিসোর্স পেইজ', icon: 'fas fa-folder-open', path: '/resources',
    groups: [
      {
        key: 'header', label: 'পেজ হেডার', fields: [
          { key: 'resources_header_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'resources_header_t1', label: 'শিরোনাম (শুরু)', type: 'text' },
          { key: 'resources_header_accent', label: 'শিরোনাম (সবুজ অংশ)', type: 'text' },
          { key: 'resources_header_sub', label: 'পেজ বিবরণ', type: 'text' }
        ]
      }
    ]
  },
  {
    key: 'articles', label: 'প্রকাশিত লেখা', icon: 'fas fa-pen-nib', path: '/articles',
    groups: [
      {
        key: 'header', label: 'পেজ হেডার', fields: [
          { key: 'articles_header_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'articles_header_sub', label: 'পেজ বিবরণ', type: 'text', hint: 'শিরোনাম ফিল্টার অনুযায়ী স্বয়ংক্রিয়ভাবে বদলায়' }
        ]
      }
    ]
  },
  {
    key: 'press', label: 'পত্রিকায় আমাদের নিউজ', icon: 'fas fa-newspaper', path: '/press',
    groups: [
      {
        key: 'header', label: 'পেজ হেডার', fields: [
          { key: 'press_header_eyebrow', label: 'ছোট লেখা (eyebrow)', type: 'text' },
          { key: 'press_header_title', label: 'পেজ শিরোনাম', type: 'text' },
          { key: 'press_header_sub', label: 'পেজ বিবরণ', type: 'textarea', rows: 2 }
        ]
      }
    ]
  },
  {
    key: 'layout', label: 'হেডার ও ফুটার', icon: 'fas fa-bars', path: '/',
    groups: [
      {
        key: 'brand', label: 'টপবার ব্র্যান্ড ও বাটন', fields: [
          { key: 'header_brand_line1', label: 'ব্র্যান্ড | লাইন ১', type: 'text' },
          { key: 'header_brand_line2', label: 'ব্র্যান্ড | লাইন ২', type: 'text' },
          { key: 'header_btn_login', label: 'লগইন বাটন', type: 'text' },
          { key: 'header_btn_register', label: 'রেজিস্ট্রেশন বাটন', type: 'text' }
        ]
      },
      {
        key: 'footer', label: 'ফুটার', fields: [
          { key: 'footer_brand_desc', label: 'ফুটার ব্র্যান্ড বিবরণ', type: 'textarea', rows: 3 },
          { key: 'footer_links_title', label: 'লিংক কলাম শিরোনাম', type: 'text' },
          { key: 'footer_contact_title', label: 'যোগাযোগ কলাম শিরোনাম', type: 'text' },
          { key: 'footer_newsletter_title', label: 'নিউজলেটার কলাম শিরোনাম', type: 'text' },
          { key: 'footer_newsletter_desc', label: 'নিউজলেটার বিবরণ', type: 'text' },
          { key: 'footer_newsletter_placeholder', label: 'ইমেইল ইনপুট প্লেসহোল্ডার', type: 'text' },
          { key: 'footer_newsletter_btn', label: 'সাবস্ক্রাইব বাটন', type: 'text' },
          { key: 'footer_copyright', label: 'কপিরাইট লাইন (বছরের পরের অংশ)', type: 'text' },
          { key: 'footer_credit_label', label: 'ক্রেডিট লাইনের শুরু', type: 'text' },
          { key: 'footer_credit_name', label: 'ক্রেডিট | নাম', type: 'text' }
        ]
      }
    ]
  }
];

// ── ডিফল্ট মান — বর্তমান লাইভ লেখা হুবহু ─────────────────────────────────────
const DEFAULTS = {
  // হোম — হিরো
  home_hero_eyebrow: 'লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয়',
  home_hero_title: 'সুপ্ত প্রতিভা বিকশিত হোক',
  home_hero_title_accent: 'লেখনীর ধারায়',
  home_hero_sub: 'লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয়, একটি শিক্ষামূলক, অলাভজনক ও অরাজনৈতিক সংগঠন। তরুণ সমাজকে লিখালিখির জগতে নিয়ে এসে তাদের বুদ্ধিবৃত্তিক বিকাশ ঘটিয়ে দেশ ও জাতির সমৃদ্ধির লক্ষ্যে যোগ্য ও সুনাগরিক হিসেবে গড়ে তোলাই আমাদের প্রত্যয়।',
  home_hero_btn1: 'আরও জানুন',
  home_hero_btn2: 'সদস্য হোন',
  // হোম — স্ট্যাট
  home_stat1_num: '1200', home_stat1_label: 'সক্রিয় সদস্য',
  home_stat2_num: '48',   home_stat2_label: 'বিশ্ববিদ্যালয় শাখা',
  home_stat3_num: '320',  home_stat3_label: 'প্রকাশনা',
  home_stat4_num: '85',   home_stat4_label: 'ইভেন্ট',
  // হোম — আজকের কন্টেন্ট
  home_today_eyebrow: 'আজকের কন্টেন্ট',
  home_today_t1: 'আজ', home_today_accent: 'বিশেষ', home_today_t2: 'কী আছে?',
  home_today_lead: 'প্রতিদিনের জন্য নির্বাচিত কুইজ, এই দিনে ইতিহাস, ই-পেপার ও সেরা লেখক সব এক জায়গায়।',
  // হোম — লক্ষ্য ও উদ্দেশ্য
  home_mission_eyebrow: 'আমাদের পরিচয়',
  home_mission_t1: 'লক্ষ্য ও', home_mission_accent: 'উদ্দেশ্য',
  home_mission_lead: 'লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয় একটি শিক্ষামূলক, অলাভজনক এবং অরাজনৈতিক সংগঠন, যা তরুণ সমাজকে লিখালিখির জগতে নিয়ে এসে তাদের বুদ্ধিবৃত্তিক বিকাশ ঘটিয়ে দেশ ও জাতির সমৃদ্ধির লক্ষ্যে তাদেরকে যোগ্য ও সুনাগরিক হিসেবে গড়ে তোলে।',
  // হোম — ৮টি ফিচার কার্ড
  home_feature1_icon: 'fa-pen-fancy',       home_feature1_title: 'সৃষ্টিশীল লেখক গড়ে তোলা',
  home_feature1_text: 'তরুণ সমাজকে লেখালেখিতে উদ্বুদ্ধ করে সৃষ্টিশীল গড়ে তুলতে সাহায্য করা',
  home_feature2_icon: 'fa-flag',            home_feature2_title: 'দেশপ্রেমিক নাগরিক গঠন',
  home_feature2_text: 'মুক্তিযুদ্ধের আদর্শ লালন করে তরুণ সমাজকে দেশপ্রেমী নাগরিক হিসেবে গড়ে তোলা',
  home_feature3_icon: 'fa-balance-scale',   home_feature3_title: 'গঠনমূলক সমালোচনা',
  home_feature3_text: 'কুসংস্কার, অন্যায়, শোষণ ও দুর্নীতিসহ সামাজিক সমস্যার গঠনমূলক সমালোচনা ও ইতিবাচক সমাধান লেখনীর মাধ্যমে তুলে ধরা',
  home_feature4_icon: 'fa-users',           home_feature4_title: 'প্ল্যাটফর্ম একত্রিতকরণ',
  home_feature4_text: 'তরুণ লেখকদের একটি প্ল্যাটফর্মে একত্রিত করে নিয়মিত কর্মশালা, ওয়েবিনার ও পাঠচক্রের আয়োজন',
  home_feature5_icon: 'fa-book-reader',     home_feature5_title: 'পঠন সংস্কৃতি বিকাশ',
  home_feature5_text: 'তরুণ সমাজে নিয়মিত পড়ার অভ্যাস গড়ে তুলে মেধা ও মানসিক বিকাশ সাধন',
  home_feature6_icon: 'fa-lightbulb',       home_feature6_title: 'বুদ্ধিবৃত্তিক বিকাশ',
  home_feature6_text: 'চিন্তন, গবেষণা ও বিশ্লেষণী ক্ষমতার বিকাশ ঘটিয়ে যুক্তিবাদী সমাজ গঠন',
  home_feature7_icon: 'fa-hands-helping',   home_feature7_title: 'সামাজিক দায়িত্ববোধ',
  home_feature7_text: 'সমাজের প্রতি দায়িত্বশীল ও সংবেদনশীল নাগরিক হিসেবে গড়ে তোলা',
  home_feature8_icon: 'fa-graduation-cap',  home_feature8_title: 'নেতৃত্ব গড়ে তোলা',
  home_feature8_text: 'তরুণদের সাংগঠনিক ও নেতৃত্ব গুণাবলি বিকাশে সহায়তা করা',
  // হোম — নেতৃত্ব
  home_lead1_eyebrow: 'নেতৃত্বের ধারা',
  home_lead1_t1: 'যাঁদের হাতে গড়ে উঠেছে', home_lead1_accent: 'লেখক ফোরাম',
  home_lead2_eyebrow: 'বর্তমান',
  home_lead2_t1: 'বর্তমান', home_lead2_accent: 'নেতৃত্ব',
  home_year_founding: '২০২০-২১ কার্যবর্ষ',
  home_year_current: '২০২৫-২৬ কার্যবর্ষ',
  home_role_founder_president: 'প্রতিষ্ঠাতা সভাপতি (১ম জন)',
  home_role_founder_gs: 'সাধারণ সম্পাদক (২য় জন)',
  home_role_founding_advisor1: 'প্রতিষ্ঠাকালীন উপদেষ্টা (১ম জন)',
  home_role_founding_advisor2: 'প্রতিষ্ঠাকালীন উপদেষ্টা (২য় জন)',
  home_role_current_president: 'বর্তমান সভাপতি (১ম জন)',
  home_role_current_gs: 'বর্তমান সাধারণ সম্পাদক (২য় জন)',
  home_role_current_advisor1: 'বর্তমান উপদেষ্টা (১ম জন)',
  home_role_current_advisor2: 'বর্তমান উপদেষ্টা (২য় জন)',
  // হোম — জিজ্ঞাসা ও ফিড
  home_qa_title: 'সাধারণ জিজ্ঞাসা',
  home_qa_more: 'সকল প্রশ্ন',
  home_qa_eyebrow: 'প্রশ্ন ও উত্তর',
  home_feed_eyebrow: 'সোশ্যাল ফিড',
  home_feed_title: 'ইউজার ফিড',
  home_feed_desc: 'সদস্যদের লেখা, প্রশ্নোত্তর ও আলোচনা দেখুন। লগইন ছাড়াই পড়তে পারবেন। অংশ নিতে রেজিস্ট্রেশন করুন।',
  home_feed_point1: 'সদস্যদের সর্বশেষ লেখা, মতামত ও কলাম এক জায়গায়',
  home_feed_point2: 'লাইভ প্রশ্নোত্তর, জরিপ ও আলোচনায় সরাসরি অংশগ্রহণ',
  home_feed_point3: 'লগইন ছাড়াই পড়ার সুযোগ, অংশ নিতে শুধু রেজিস্ট্রেশন',
  home_feed_btn: 'ইউজার ফিডে যান',
  home_feed_btn2: 'ফ্রি অ্যাকাউন্ট খুলুন',
  home_feed_widget_label: 'এক নজরে',
  // হোম — বিজ্ঞপ্তি
  home_notices_eyebrow: 'সাম্প্রতিক বিজ্ঞপ্তি',
  home_notices_t1: 'সর্বশেষ', home_notices_accent: 'আপডেট',
  home_notices_more: 'সকল বিজ্ঞপ্তি',

  // পরিচিতি
  about_header_eyebrow: 'আমাদের সম্পর্কে',
  about_header_title: 'পরিচিতি',
  about_header_sub: 'লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয়। পরিচিতি, মূলমন্ত্র, লক্ষ্য-উদ্দেশ্য ও কার্যাক্রম',
  about_identity_eyebrow: 'আমাদের পরিচয়',
  about_identity_t1: 'লেখক ফোরাম,',
  about_identity_accent: 'চট্টগ্রাম বিশ্ববিদ্যালয়',
  about_identity_text: 'লেখক ফোরাম একটি শিক্ষামূলক, অলাভজনক এবং অরাজনৈতিক সংগঠন, যা তরুণ সমাজকে লিখালিখির জগতে নিয়ে এসে তাদের বুদ্ধিবৃত্তিক বিকাশ ঘটিয়ে দেশ ও জাতির সমৃদ্ধির লক্ষ্যে তাদেরকে যোগ্য ও সুনাগরিক হিসেবে গড়ে তোলে। চট্টগ্রাম বিশ্ববিদ্যালয়ে যারা পত্রিকায় লিখেন কিংবা লিখতে চান, তাদেরকে সঠিকভাবে লিখার পদ্ধতি, কালাকৌশল এবং সংশ্লিষ্ট বিষয়ে পরামর্শ দিতে লেখক ফোরাম, চবি শাখা দৃঢ়প্রত্যয়ী। সদস্যদের নিয়ে নিয়মিত কর্মশালা আয়োজন এবং লিখালিখির যাবতীয় সমস্যা সমাধানে অভিজ্ঞরা নিজ তত্ত্বাবধানে রেখে সদস্যদের দেখাশোনা করে থাকেন।',
  about_motto_label: 'মূলমন্ত্র',
  about_motto_text: 'তারুণ্যের শাণিত কলমে আলোকিত ধরনী',
  about_slogan_label: 'স্লোগান',
  about_slogan_text: 'সুপ্ত প্রতিভা বিকশিত হোক লেখনীর ধারায়।',
  about_committee_btn: 'কমিটি দেখুন',
  about_goals_title: 'লক্ষ্য ও উদ্দেশ্য',
  about_goal1: 'তরুণ সমাজকে লেখালেখিতে উদ্বুদ্ধ করে সৃষ্টিশীল গড়ে তুলতে সাহায্য করা।',
  about_goal2: 'মুক্তিযুদ্ধের আদর্শ লালন করে তরুণ সমাজকে দেশপ্রেমী নাগরিক হিসেবে গড়ে তোলা।',
  about_goal3: 'সামাজিক, আর্থ-সামাজিক ও বৈশ্বিক সমস্যার গঠনমূলক সমালোচনা ও ইতিবাচক সমাধান লেখনীর মাধ্যমে তুলে ধরা এবং তরুণ লেখকদের একটি প্ল্যাটফর্মে একত্রিত করা।',
  about_goal4: 'নিয়মিত পঠন অভ্যাস গড়ে তুলে তরুণ সমাজের মেধা ও মানসিক বিকাশ সাধন করা।',
  about_goal5: 'তরুণদের সাংগঠনিক ও নেতৃত্ব গুণাবলি বিকাশে সহায়তা করা।',
  about_goal6: 'দেশের স্বনামধন্য লেখকদের সাথে তরুণ লেখকদের সেতুবন্ধন তৈরি করা।',
  about_magazine_title: 'পত্রিকায় পাতায় লেখক ফোরাম',
  about_magazine_text: 'লেখক ফোরামের পত্রিকা একটি নিয়মিত প্রকাশনা। সদস্যদের লেখা এখানে প্রকাশিত হয়। নতুন লেখকদের জন্য এটি একটি দুর্দান্ত সুযোগ, নিজের লেখা প্রকাশের মাধ্যমে পাঠকের সাথে সরাসরি যোগাযোগ গড়ে তোলার। পত্রিকায় লেখা প্রকাশের জন্য সদস্য হিসেবে নিবন্ধন করুন এবং নিয়মিত লেখা জমা দিন।',
  about_act_eyebrow: 'আমাদের কার্যাক্রম',
  about_act_t1: 'আমাদের', about_act_accent: 'কার্যাক্রমসমূহ',
  about_act1_icon: 'fa-compass', about_act1_title: 'পরামর্শ ও দিকনির্দেশনা',
  about_act1_text: 'নবীন লেখকদের পরামর্শ, দিকনির্দেশনা ও অনুপ্রেরণা প্রদান',
  about_act2_icon: 'fa-edit', about_act2_title: 'সম্পাদনা ও প্রকাশ',
  about_act2_text: 'নবীন লেখকদের লেখা সম্পাদনা ও পত্রিকায় প্রকাশের ব্যবস্থা',
  about_act3_icon: 'fa-chalkboard-teacher', about_act3_title: 'ওয়েবিনার ও কর্মশালা',
  about_act3_text: 'সদস্যদের নিয়ে নিয়মিত ওয়েবিনার, বিতর্ক, কুইজ, কর্মশালা ও পাঠচক্রের আয়োজন',
  about_act4_icon: 'fa-coffee', about_act4_title: 'সাপ্তাহিক আড্ডা ও মাসিক সভা',
  about_act4_text: 'নিয়মিত লেখালেখি বিষয়ক সাপ্তাহিক আড্ডা কিংবা মাসিক সভার আয়োজন',
  about_act5_icon: 'fa-trophy', about_act5_title: 'মাসিক সেরা লেখক পুরস্কার',
  about_act5_text: 'মাস শেষে মাসিক সেরা লেখকদের পুরস্কার প্রদান',
  about_act6_icon: 'fa-handshake', about_act6_title: 'সেতুবন্ধন',
  about_act6_text: 'দেশের স্বনামধন্য খ্যাতিমান লেখকদের সাথে তরুণ লেখকদের সেতুবন্ধন তৈরি',
  about_act7_icon: 'fa-lightbulb', about_act7_title: 'জনসচেতনতা',
  about_act7_text: 'লেখালেখির মাধ্যমে জনসচেতনতা বৃদ্ধিকরণ',
  about_act8_icon: 'fa-medal', about_act8_title: 'প্রতিযোগিতা',
  about_act8_text: 'বিশেষ দিবসসমূহে লেখালেখি বিষয়ক বিভিন্ন ধরনের প্রতিযোগিতার আয়োজন',
  about_cta_eyebrow: 'সদস্য সংগ্রহ চলছে',
  about_cta_t1: 'আপনি কি একজন', about_cta_accent: 'কলম সৈনিক', about_cta_t2: 'হতে চান?',
  about_cta_text: 'চট্টগ্রাম বিশ্ববিদ্যালয়ের লেখালেখিতে আগ্রহী তরুণ লেখকদের সুপ্ত প্রতিভা বিকশিত করার লক্ষ্যে লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয় শাখা নতুন বছরে সদস্য সংগ্রহ কার্যক্রম শুরু করেছে। তুলে ধরতে চান সমাজ-রাষ্ট্রের অসংগতি? তাহলে লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয় শাখা আপনাকেই খুঁজছে। আপনার লেখনির ধারাকে আরও শাণিত করতে একঝাঁক তরুণ লেখকের পতাকাতলে আপনাকে স্বাগতম। সংগঠনের পত্রিকায় নিয়মিত লেখার সুযোগ, অভিজ্ঞ লেখকদের পরামর্শ ও দিকনির্দেশনা, এবং লেখালেখির বিভিন্ন কর্মশালা ও সেমিনারে অংশগ্রহণের মাধ্যমে নিজের লেখনীকে আরও পরিণত করতে পারবেন। একইসাথে দেশের বিভিন্ন প্রান্তের তরুণ লেখকদের সাথে পরিচিত হওয়ার ও মতবিনিময়ের এক অনন্য সুযোগ এটি। আপনার চিন্তাকে শব্দের রূপ দিতে, আপনার লেখনীকে শাণিত করতে, এবং একটি সুস্থ সমাজ গঠনে নিজের অবদান রাখতে চাইলে, তাহলে আর দেরি কেন? এক্ষুনি শামিল হোন আমাদের অগ্রযাত্রায়।',
  about_cta_btn1: 'নিবন্ধন করুন',
  about_cta_btn2: 'যোগাযোগ করুন',
  about_cond_eyebrow: 'নিবন্ধন প্রক্রিয়া',
  about_cond_t1: 'সদস্য হওয়ার', about_cond_accent: 'শর্তাবলি',
  about_step1_title: 'রেজিস্ট্রেশন ফি ও ফর্ম পূরণ',
  about_step1_text: 'সদস্য পদের জন্য নিম্নোক্ত নাম্বারে ২০০ টাকা পাঠিয়ে গুগল ফর্মটি পূরণ করে নিবন্ধন সম্পন্ন করবেন। টাকা পাঠানোর ক্ষেত্রে রেফারেন্সে অবশ্যই নিজের নাম লিখবেন।',
  about_pay_number: '০১********* (বিকাশ/নগদ)',
  about_step2_title: 'অনলাইন সাক্ষাৎকার',
  about_step2_text: 'ফর্ম পূরণ করলে আপনাকে শাখার কার্যকরী কমিটি কর্তৃক মেইল এবং ফোন কলের মাধ্যমে অনলাইন সাক্ষাৎকারের জন্য আহ্বান করা হবে।',
  about_step3_title: 'মেসেঞ্জার গ্রুপে যুক্ত হওয়া',
  about_step3_text: 'অনলাইন সাক্ষাৎকার শেষে সদস্য হওয়ার শর্তাবলী পূরণপূর্বক আপনাকে শাখার প্রাথমিক মেসেঞ্জার গ্রুপে যুক্ত করা হবে এবং আপনাদের নিয়ে নিয়মিত লেখালেখি বিষয়ক কর্মশালা ও সেমিনার আয়োজন ও যেকোনো প্রয়োজনে দিকনির্দেশনা প্রদান করা হবে।',
  about_step4_title: 'সদস্যপদ লাভ',
  about_step4_text: 'পরবর্তীতে ৩ মাস পর্যন্ত আপনাদের লেখালেখি এবং সাংগঠনিক কার্যক্রম পর্যালোচনা করে লেখালেখির পাশাপাশি সাংগঠনিক কার্যক্রমে সক্রিয় প্রার্থীদের সদস্য পদ দেওয়া হবে।',
  about_rules_title: 'অবশ্যপালনীয় শর্ত',
  about_rule1: 'সদস্য হওয়ার ক্ষেত্রে অবশ্যই মনে রাখবেন, সংগঠনের গঠনতন্ত্র মেনে চলতে হবে।',
  about_rule2: 'ফোরামের অন্যান্য সাংগঠনিক কর্মকাণ্ডে সক্রিয় অংশগ্রহণ থাকতে হবে।',
  about_rule3: 'রাষ্ট্র ও সংগঠন বিরোধী কোনো কর্মকাণ্ডে জড়িত হওয়া যাবে না।',
  about_rule4: 'প্রতি মাসে কমপক্ষে ১টি লেখা প্রকাশ করতে হবে।',
  about_rule5: 'সাপ্তাহিক আড্ডা ও মাসিক সভায় নিয়মিত উপস্থিত থাকতে হবে।',
  about_rule6: 'সংগঠনের পত্রিকায় নিয়মিত লেখা পাঠাতে হবে।',
  about_rule7: 'অন্য সদস্যদের লেখার প্রতি গঠনমূলক মন্তব্য ও পরামর্শ দিতে হবে।',
  about_rule8: 'সংগঠনের সম্মান ও ভাবমূর্তি রক্ষায় সচেতন থাকতে হবে।',
  about_rule9: 'যেকোনো ধরনের বৈষম্যমূলক আচরণ থেকে বিরত থাকতে হবে।',
  about_rule10: 'সংগঠনের গোপনীয়তা রক্ষা করতে হবে।',
  about_warning_title: 'বিঃদ্রঃ',
  about_warning_text: 'সদস্য হওয়ার পর প্রতি মাসে কমপক্ষে ১টি লেখা প্রকাশ করতে হবে। অন্যথায় সদস্য হওয়ার পরবর্তী প্রতি ৩ মাসে গুরুত্বপূর্ণ কারণ ছাড়াই অন্তত ১টি লেখাও প্রকাশিত না হলে এবং সাংগঠনিক কার্যক্রমে সর্বনিম্ন ৬০ শতাংশ সময় অনুপস্থিত থাকলে সদস্য পদ বাতিল বলে গণ্য হবে।',

  // যোগাযোগ
  contact_header_eyebrow: 'যোগাযোগ',
  contact_header_t1: 'আমাদের সাথে', contact_header_accent: 'যোগাযোগ',
  contact_header_sub: 'যেকোনো প্রশ্ন, পরামর্শ বা সহযোগিতার জন্য আমরা সবসময় আছি আপনার পাশে',
  contact_info_eyebrow: 'যোগাযোগের তথ্য',
  contact_info_t1: 'আমাদের', contact_info_accent: 'ঠিকানা',
  contact_info_text: 'যেকোনো বিষয়ে যোগাযোগ করতে নির্দ্বিধায় নিচের যেকোনো মাধ্যম ব্যবহার করুন। আমরা যত দ্রুত সম্ভব উত্তর দেওয়ার চেষ্টা করব।',
  contact_office_label: 'কার্যালয়',
  contact_fb_label: 'ফেসবুক পেজ',
  contact_fb_text: 'আমাদের ফেসবুক পেজে লাইক দিন',
  contact_tg_label: 'টেলিগ্রাম গ্রুপ',
  contact_tg_text: 'আমাদের টেলিগ্রাম গ্রুপে যোগ দিন',
  contact_form_title: 'বার্তা পাঠান',
  contact_form_text: 'নিচের ফর্মে আপনার বার্তা লিখুন, আমরা শীঘ্রই যোগাযোগ করব।',
  contact_form_btn: 'বার্তা পাঠান',
  contact_loc_eyebrow: 'আমাদের অবস্থান',
  contact_loc_t1: 'কোথায়', contact_loc_accent: 'আমরা',
  contact_loc_text: 'আমাদের কার্যালয়ে সরাসরি এসেও যোগাযোগ করতে পারেন। সাপ্তাহিক ছুটির দিন ব্যতীত সব সময় অফিস খোলা থাকে।',
  contact_hours1: 'সোমবার – বৃহস্পতিবার: সকাল ১০টা – সন্ধ্যা ৬টা',
  contact_hours2: 'শুক্রবার: বন্ধ',
  contact_hours3: 'শনিবার: সকাল ১০টা – বিকাল ৪টা',
  contact_hours4: 'রবিবার: সকাল ১১টা – বিকাল ৫টা',
  contact_campus_eyebrow: 'ক্যাম্পাস তথ্য',
  contact_campus_t1: 'চট্টগ্রাম বিশ্ববিদ্যালয়', contact_campus_accent: 'ক্যাম্পাস',
  contact_campus_lead: 'আমাদের কার্যক্রম চট্টগ্রাম বিশ্ববিদ্যালয় ক্যাম্পাসে পরিচালিত হয়। নিচে ক্যাম্পাসের গুরুত্বপূর্ণ যোগাযোগ ও সেবার তথ্য দেওয়া হলো।',
  contact_crs_uni: 'বিশ্ববিদ্যালয় সম্পর্কিত তথ্য',
  contact_crs_transport: 'যাতায়াত ও গুরুত্বপূর্ণ নম্বর',

  // পেজ হেডারসমূহ
  committee_header_eyebrow: 'নেতৃত্ব',
  committee_header_title: 'কার্যনির্বাহী কমিটি',
  committee_header_sub: 'লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয়। কার্যবর্ষভিত্তিক পূর্ণাঙ্গ কার্যনির্বাহী কমিটি',
  committee_term_label: 'কার্যবর্ষ',
  advisory_header_eyebrow: 'পরামর্শদাতা',
  advisory_header_title: 'উপদেষ্টা পরিষদ',
  advisory_header_sub: 'লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয়। সংগঠনের পরামর্শদাতামণ্ডলী',
  members_header_eyebrow: 'আমাদের সদস্য',
  members_header_title: 'সদস্য পরিচিতি',
  members_header_sub: 'আমাদের প্রতিষ্ঠানের নেতৃত্ব ও সকল সদস্য। প্রত্যেকের কার্যবর্ষ কার্ডেই উল্লেখ করা আছে',
  team_header_eyebrow: 'টিম',
  team_header_t1: 'আমাদের', team_header_accent: 'সম্পূর্ণ টিম',
  team_header_sub: 'কেন্দ্রীয় কমিটি, উপদেষ্টা পর্ষদ, প্রতিষ্ঠাতা ও বিশ্ববিদ্যালয় শাখা',
  notices_header_eyebrow: 'বিজ্ঞপ্তি',
  notices_header_t1: 'সকল', notices_header_accent: 'বিজ্ঞপ্তি',
  notices_header_sub: 'লেখক ফোরামের সর্বশেষ খবর ও আপডেট',
  events_header_eyebrow: 'ইভেন্ট',
  events_header_t1: 'আসন্ন ও অতীত', events_header_accent: 'ইভেন্ট',
  events_header_sub: 'সেমিনার, কর্মশালা, সাংস্কৃতিক সন্ধ্যা ও বিশেষ আয়োজন',
  gallery_header_eyebrow: 'ছবির সংগ্রহ',
  gallery_header_t1: 'ইমেজ', gallery_header_accent: 'গ্যালারি',
  gallery_header_sub: 'ইভেন্ট, সেমিনার, সাংস্কৃতিক কার্যক্রম সব এক জায়গায়',
  resources_header_eyebrow: 'রিসোর্স',
  resources_header_t1: 'গুরুত্বপূর্ণ', resources_header_accent: 'ফাইল ও রিসোর্স',
  resources_header_sub: 'ফেলোশিপ, লেখালেখির টিপস ও বিভিন্ন গুরুত্বপূর্ণ ডকুমেন্ট',
  articles_header_eyebrow: 'প্রকাশিত লেখা',
  articles_header_sub: 'সদস্যদের লেখা কলাম, চিঠি ও প্রবন্ধ। প্রতিটি লেখায় লেখকের প্রোফাইল ও ইন্টারঅ্যাকশন',
  press_header_eyebrow: 'মিডিয়ায় আমরা',
  press_header_title: 'পত্রিকায় আমাদের নিউজ',
  press_header_sub: 'বিভিন্ন জাতীয় ও স্থানীয় পত্রিকায় লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয়কে নিয়ে প্রকাশিত সংবাদসমূহ',

  // হেডার ও ফুটার
  header_brand_line1: 'লেখক ফোরাম',
  header_brand_line2: 'চট্টগ্রাম বিশ্ববিদ্যালয়',
  header_btn_login: 'লগইন',
  header_btn_register: 'রেজিস্ট্রেশন',
  footer_brand_desc: 'লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয় শাখা, একটি শিক্ষামূলক, অলাভজনক ও অরাজনৈতিক সংগঠন। মূলমন্ত্র: তারুণ্যের শাণিত কলমে আলোকিত ধরনী।',
  footer_links_title: 'প্রয়োজনীয় লিংক',
  footer_contact_title: 'যোগাযোগ',
  footer_newsletter_title: 'নিউজলেটার',
  footer_newsletter_desc: 'নতুন লেখা প্রকাশের খবর সরাসরি ইমেইলে পেতে সাবস্ক্রাইব করুন।',
  footer_newsletter_placeholder: 'আপনার ইমেইল',
  footer_newsletter_btn: 'সাবস্ক্রাইব',
  footer_copyright: 'লেখক ফোরাম, চট্টগ্রাম বিশ্ববিদ্যালয়। সর্বস্বত্ব সংরক্ষিত।',
  footer_credit_label: 'ডিজাইন ও উন্নয়নে:',
  footer_credit_name: 'মোঃ রাফছান'
};

// সব ফিল্ড-কি-এর সমতল তালিকা + ভ্যালিডেশনে কাজে লাগার ম্যাপ
const FIELDS = {};
PAGES.forEach(p => p.groups.forEach(g => g.fields.forEach(f => {
  FIELDS[f.key] = { ...f, page: p.key, group: g.key };
})));

module.exports = { PAGES, DEFAULTS, FIELDS };
