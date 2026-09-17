/* ═══ সেশন ১১০: হোম-কিউরেশন শৈল্পিক প্রচ্ছদ — একক-উৎস রেজিস্ট্রি ═══
   ইউজার-স্পেসিফিকেশন (AdminCoverSelector): হোমপেজের 'লেখকদের কালি' কিউরেশনে
   প্রতিটি লেখার জন্য শৈল্পিক প্রচ্ছদ — ৩ মাধ্যম:
     • preset  — সাহিত্যিক কালার-প্যালেট (নিচের ৬টি)
     • typo    — ক্যাম্পাস টাইপোগ্রাফিক প্রচ্ছদ (একই প্যালেট + শিরোনামের আদ্যক্ষর)
     • custom  — কাস্টম ইমেজ URL (http/https — session-67 heal-নিয়মের সাথে সামঞ্জস্য)
   সংরক্ষণ: posts.home_cover (TEXT, JSON string — LATER_COLUMNS)।
   ব্যবহার: routes/moderator.js (সেট/যাচাই), routes/pages.js (হোম-রেন্ডার),
            views/user/moderator-curation.ejs (মোডাল — JSON.stringify(COVER_PRESETS)-ইনজেক্ট)। */

var COVER_PRESETS = [
  { id: 'rokto',   name: 'রক্তকরবী লাল',   cat: 'কবিতা',        from: '#7F1D1D', to: '#2A0A0A' },
  { id: 'shobuj',  name: 'পাহাড় ও সবুজ',  cat: 'প্রবন্ধ',       from: '#064E3B', to: '#012B21' },
  { id: 'dhushor', name: 'ধূসর পাণ্ডুলিপি', cat: 'গল্প',         from: '#37474F', to: '#1A1D21' },
  { id: 'nil',     name: 'নীল অপরাজিতা',   cat: 'উপন্যাস',      from: '#0D47A1', to: '#0A1A4A' },
  { id: 'sonali',  name: 'সোনালি ধান',     cat: 'কিশোর-সাহিত্য', from: '#B45309', to: '#6B2E0E' },
  { id: 'beguni',  name: 'বেগুনি রাত',     cat: 'রম্য/ভ্রমণ',   from: '#5B21B6', to: '#241243' }
];

function presetById(id) {
  for (var i = 0; i < COVER_PRESETS.length; i++) {
    if (COVER_PRESETS[i].id === id) return COVER_PRESETS[i];
  }
  return null;
}

function gradCss(p) {
  return 'linear-gradient(135deg, ' + p.from + ', ' + p.to + ')';
}

/* কাস্টম-ইমেজ URL-যাচাই — session-67 cover_image heal-নিয়মের যমল
   (শুধু http(s)-অ্যাবসলিউট; অন্যথায় স্টেল/ব্রোকেন-ডেটা হোমে বসে যায়) */
function isValidCoverUrl(u) {
  return typeof u === 'string' && /^https?:\/\/\S+$/i.test(u.trim());
}

/* home_cover কলাম-ভ্যালু যাচাই+নরমালাইজ → {ok, value|error}
   value ফাঁকা/null → clear (NULL) */
function validateCoverInput(type, value) {
  var t = String(type || '').trim();
  var v = String(value == null ? '' : value).trim();
  if (!t || !v) return { ok: true, value: null }; // সরান
  if (t === 'preset' || t === 'typo') {
    var p = presetById(v);
    if (!p) return { ok: false, error: 'অজানা প্রচ্ছদ-প্যালেট' };
    return { ok: true, value: JSON.stringify({ type: t, value: v }) };
  }
  if (t === 'custom') {
    if (!isValidCoverUrl(v)) return { ok: false, error: 'প্রচ্ছদ-লিংকটি http(s) দিয়ে শুরু হওয়া সম্পূর্ণ URL হতে হবে' };
    return { ok: true, value: JSON.stringify({ type: 'custom', value: v }) };
  }
  return { ok: false, error: 'অজানা প্রচ্ছদ-ধরন' };
}

/* home_cover JSON → রেন্ডার-মডেল (নিরাপদ-পার্স; করাপ্ট হলে null) */
function parseCover(raw) {
  if (!raw) return null;
  try {
    var j = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!j || !j.type) return null;
    if (j.type === 'custom' && isValidCoverUrl(j.value)) return { type: 'custom', url: j.value };
    if (j.type === 'preset' || j.type === 'typo') {
      var p = presetById(j.value);
      if (!p) return null;
      return { type: j.type, preset: p, grad: gradCss(p) };
    }
    return null;
  } catch (e) { return null; }
}

/* বাংলা শিরোনামের আদ্যক্ষর (টাইপোগ্রাফিক প্রচ্ছদ) — প্রথম-গ্রাফিম যথেষ্ট */
function initialOf(title) {
  var t = String(title || '').trim();
  return t ? t[0] : 'ল';
}

module.exports = { COVER_PRESETS: COVER_PRESETS, presetById: presetById, gradCss: gradCss, validateCoverInput: validateCoverInput, parseCover: parseCover, initialOf: initialOf };
