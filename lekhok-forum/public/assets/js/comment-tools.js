/* ═══════════════════════════════════════════════════════════════════════════
   সেশন ৯৩ → ১০৪: comment-tools.js — কমেন্ট-অভিজ্ঞতার গ্লোবাল ইঞ্জিন
   ─────────────────────────────────────────────────────────────────────────
   ১. মার্কডাউন-টুলবার (.cc-fmt) — selectionStart/End-ভিত্তিক সিনট্যাক্স-র‍্যাপ
   ২. @ম্যানশন-অটোকমপ্লিট — /api/users/search ডিবাউন্স-ফেচ
   ৩. পোস্ট-৩-ডট-মেনু (.pm-wrap) — খোলা/বন্ধ + আউটসাইড-ক্লিক + কনফার্ম
   ৪. ফিড-ইনলাইন-কমেন্ট ([data-toggle-comments]) — ড্রয়ার-টগল; খোলা অবস্থায়
      .fc-open-ক্লাস → .fc-preview লুকানো (ডুপ্লিকেট-কমেন্ট-ফিক্স, সেশন ১০৪)
   ৫. FB-প্যারিটি কমেন্ট-আইটেম (সেশন ১০৪):
      • রিঅ্যাকশন-প্যালেট (👍❤️🤗😂😮😢) — 'লাইক'-এ hover/ট্যাপে ভাসে
      • বাবলের কোণে রিঅ্যাকশন-ব্যাজ (শীর্ষ-ইমোজি + মোট-সংখ্যা)
      • হোভার ৩-ডট-মেনু — নিজের মন্তব্যে সম্পাদনা/মুছে-ফেলা, অন্যের জন্য রিপোর্ট
      • ইনলাইন-সম্পাদনা (textarea + সংরক্ষণ/বাতিল) + 'সম্পাদিত' মার্কার
   সব হ্যান্ডলার ডেলিগেটেড — /dashboard/more-এর ডায়নামিক-HTML-এও কাজ করে।
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var AUTHED = document.body && document.body.getAttribute('data-auth') === '1';
  var ME_ID = AUTHED && document.body ? (document.body.getAttribute('data-uid') || '') : '';

  /* ── সেশন ১০৪: রিঅ্যাকশন-কনস্ট্যান্ট (server REACTIONS-চুক্তি: ৬ টাইপ) ────── */
  var R_META = { like: '👍', love: '❤️', care: '🤗', haha: '😂', wow: '😮', sad: '😢', angry: '😡' };
  var R_LABEL = { like: 'লাইক', love: 'ভালোবাসা', care: 'কেয়ার', haha: 'হাহা', wow: 'বিস্ময়', sad: 'দুঃখ', angry: 'রাগ' };

  /* ── ১. মার্কডাউন-টুলবার ─────────────────────────────────────────────── */
  var FMT_SYNTAX = {
    bold:   { pre: '**', post: '**', ph: 'বোল্ড লেখা' },
    italic: { pre: '_',  post: '_',  ph: 'ইটালিক লেখা' },
    strike: { pre: '~~', post: '~~', ph: 'কাটা লেখা' },
    link:   { pre: '[',  post: '](https://)', ph: 'লিংক-টেক্সট' },
    list:   { pre: '\n- ', post: '', ph: 'তালিকা-আইটেম', line: true },
    quote:  { pre: '\n> ', post: '', ph: 'উদ্ধৃতি', line: true }
  };

  function applyFormat(ta, type) {
    var f = FMT_SYNTAX[type];
    if (!ta || !f) return;
    var start = ta.selectionStart, end = ta.selectionEnd;
    var val = ta.value;
    var sel = val.substring(start, end) || f.ph;
    // লাইন-টাইপ (list/quote): ব্লক-শুরুতে ইনসার্ট — কার্সর লাইনের শুরুতে থাকলে
    if (f.line) {
      var ls = val.lastIndexOf('\n', start - 1) + 1;
      var ins = (ls === 0 ? '' : '') + f.pre;
      ta.value = val.slice(0, ls) + f.pre + val.slice(ls);
      ta.selectionStart = ta.selectionEnd = ls + f.pre.length;
    } else {
      ta.value = val.slice(0, start) + f.pre + sel + f.post + val.slice(end);
      // সিলেক্টেড-টেক্সট থাকলে সেটাই সিলেক্ট-রাখা; না থাকলে প্লেসহোল্ডার সিলেক্ট
      ta.setSelectionRange(start + f.pre.length, start + f.pre.length + sel.length);
    }
    ta.focus();
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /* ── ২. @ম্যানশন-অটোকম্প্লিট ──────────────────────────────────────────── */
  var MENTION_RE = /@([a-zA-Z0-9_\u0980-\u09FF]*)$/;
  var mentionCache = {}; // q → users[]
  var mentionTimer = null;

  function findMention(ta) {
    var upto = ta.value.slice(0, ta.selectionStart);
    var m = upto.match(MENTION_RE);
    return m ? { q: m[1], at: upto.length - m[0].length } : null;
  }

  function closeMention(bubble) {
    if (!bubble) return;
    var dd = bubble.querySelector('.cc-mention');
    if (dd) { dd.hidden = true; dd.innerHTML = ''; }
    bubble.dataset.mentionActive = '';
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function showMention(bubble, ta, q) {
    var dd = bubble.querySelector('.cc-mention');
    if (!dd) return;
    bubble.dataset.mentionActive = '1';
    dd.innerHTML = '<div class="ccm-loading"><i class="fas fa-spinner fa-spin"></i></div>';
    dd.hidden = false;

    clearTimeout(mentionTimer);
    mentionTimer = setTimeout(function () {
      var key = q.toLowerCase();
      if (mentionCache[key]) { renderMentionList(bubble, ta, q, mentionCache[key]); return; }
      fetch('/api/users/search?q=' + encodeURIComponent(q))
        .then(function (r) { return r.json(); })
        .then(function (j) {
          var users = (j && j.users) || [];
          mentionCache[key] = users;
          renderMentionList(bubble, ta, q, users);
        })
        .catch(function () { closeMention(bubble); });
    }, 180);
  }

  function renderMentionList(bubble, ta, q, users) {
    var dd = bubble.querySelector('.cc-mention');
    if (!dd || bubble.dataset.mentionActive !== '1') return;
    if (!users.length) { dd.hidden = true; dd.innerHTML = ''; return; }
    var me = findMention(ta);
    if (!me || me.q !== q) { dd.hidden = true; return; } // কোয়েরি বদলে গেছে
    dd.innerHTML = users.map(function (u) {
      return '<button type="button" class="ccm-item" data-uid="' + u.id + '" data-uname="' + esc(u.username) + '" data-dname="' + esc(u.full_name) + '">' +
        '<img class="ccm-av" src="' + esc(u.avatar_url || ('/avatar/' + u.id)) + '" alt="" onerror="this.src=\'/assets/img/avatar-placeholder.svg?v=2\'">' +
        '<span class="ccm-txt"><strong>' + esc(u.full_name) + '</strong><small>@' + esc(u.username) + (u.designation ? ' · ' + esc(u.designation) : '') + '</small></span>' +
        '</button>';
    }).join('');
    dd.hidden = false;
  }

  function insertMention(bubble, ta, username) {
    var me = findMention(ta);
    if (!me) return;
    var val = ta.value;
    var start = ta.selectionStart;
    var after = val.slice(start);
    var before = val.slice(0, me.at) + '@' + username + ' ';
    ta.value = before + after;
    ta.selectionStart = ta.selectionEnd = before.length;
    ta.focus();
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    closeMention(bubble);
  }

  // কম্পোজার-ইনপুট-ইভেন্ট (ডেলিগেটেড)
  document.addEventListener('input', function (e) {
    var ta = e.target;
    if (!ta.classList || !ta.classList.contains('cc-input')) return;
    var bubble = ta.closest('.cc-bubble');
    if (!bubble) return;
    // সেন্ড-বাটন স্টেট
    var form = ta.closest('.cc-form');
    var send = form && form.querySelector('.cc-send');
    if (send) send.disabled = !ta.value.trim();
    // অটো-গ্রো
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    // ম্যানশন-ডিটেক্ট
    var me = findMention(ta);
    if (me) showMention(bubble, ta, me.q);
    else closeMention(bubble);
  });

  // ম্যানশন-আইটেম-ক্লিক + টুলবার-ক্লিক + সেন্ড (ডেলিগেটেড)
  document.addEventListener('click', function (e) {
    var ccm = e.target.closest('.ccm-item');
    if (ccm) {
      e.preventDefault();
      var bubble = ccm.closest('.cc-bubble');
      var ta = bubble && bubble.querySelector('.cc-input');
      if (ta) insertMention(bubble, ta, ccm.getAttribute('data-uname'));
      return;
    }
    var fmt = e.target.closest('.cc-fmt');
    if (fmt) {
      e.preventDefault();
      var form = fmt.closest('.cc-form');
      var ta2 = form && form.querySelector('.cc-input');
      if (ta2) applyFormat(ta2, fmt.getAttribute('data-fmt'));
    }
  });

  // ম্যানশন-ড্রপডাউনে কীবোর্ড-নেভিগেশন (↑↓ সিলেক্ট, Enter/Tab ইনসার্ট, Esc বন্ধ)
  document.addEventListener('keydown', function (e) {
    var ta = e.target;
    if (!ta.classList || !ta.classList.contains('cc-input')) return;
    var bubble = ta.closest('.cc-bubble');
    var dd = bubble && bubble.querySelector('.cc-mention');
    if (!dd || dd.hidden || !dd.children.length) {
      /* সেশন ১১৭: Ctrl/⌘+Enter → সাবমিট (ড্রপডাউন-বন্ধ অবস্থায়);
         ডিসেবলড-সেন্ড সম্মান করে — খালি-বডিতে অপাঠানো */
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        var form117 = ta.closest('.cc-form');
        var send117 = form117 && form117.querySelector('.cc-send');
        if (send117 && !send117.disabled) { e.preventDefault(); form117.requestSubmit(); }
      }
      // Esc-এ সাধারণ-কেস: ড্রপডাউন না থাকলে কিছু না
      return;
    }
    var items = Array.prototype.slice.call(dd.querySelectorAll('.ccm-item'));
    var idx = items.indexOf(dd.querySelector('.ccm-item.active'));
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      idx = e.key === 'ArrowDown' ? Math.min(idx + 1, items.length - 1) : Math.max(idx - 1, 0);
      if (idx < 0) idx = 0;
      items.forEach(function (it, i) { it.classList.toggle('active', i === idx); });
      items[idx].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      var pick = items[Math.max(idx, 0)];
      if (pick) insertMention(bubble, ta, pick.getAttribute('data-uname'));
    } else if (e.key === 'Escape') {
      closeMention(bubble);
    }
  });

  /* ── ৩. পোস্ট-৩-ডট-মেনু (.pm-wrap) ───────────────────────────────────── */
  function closeAllMenus(except) {
    document.querySelectorAll('.pm-menu:not([hidden])').forEach(function (m) {
      if (m !== except) {
        m.hidden = true;
        var b = m.closest('.pm-wrap');
        if (b) { b.classList.remove('open'); var btn = b.querySelector('.pm-btn'); if (btn) btn.setAttribute('aria-expanded', 'false'); }
      }
    });
  }

  document.addEventListener('click', function (e) {
    var pmBtn = e.target.closest('.pm-btn');
    if (pmBtn) {
      e.preventDefault();
      e.stopPropagation();
      var wrap = pmBtn.closest('.pm-wrap');
      var menu = wrap && wrap.querySelector('.pm-menu');
      if (!menu) return;
      var opening = menu.hidden;
      closeAllMenus(menu);
      menu.hidden = !opening;
      wrap.classList.toggle('open', opening);
      pmBtn.setAttribute('aria-expanded', opening ? 'true' : 'false');
      return;
    }
    if (!e.target.closest('.pm-menu')) closeAllMenus(null);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllMenus(null);
  });

  // ডিলিট/লুকানো-কনফার্ম (data-confirm92)
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f instanceof HTMLFormElement && f.hasAttribute('data-confirm92')) {
      if (!window.confirm(f.getAttribute('data-confirm92'))) { e.preventDefault(); closeAllMenus(null); }
    }
  }, true);

  /* ── ৪. ফিড-ইনলাইন-কমেন্ট-ড্রয়ার ─────────────────────────────────────── */
  var bnNum = function (n) { return String(n).replace(/[0-9]/g, function (d) { return '০১২৩৪৫৬৭৮৯'[d]; }); };
  function relTime(iso) {
    var diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (isNaN(diff)) return '';
    if (diff < 60) return 'এইমাত্র';
    if (diff < 3600) return bnNum(Math.floor(diff / 60)) + ' মিনিট';
    if (diff < 86400) return bnNum(Math.floor(diff / 3600)) + ' ঘণ্টা';
    if (diff < 86400 * 7) return bnNum(Math.floor(diff / 86400)) + ' দিন';
    return new Date(iso).toLocaleDateString('bn-BD');
  }

  function topEmojiOf(reactions) {
    var best = null, bestC = -1;
    Object.keys(reactions || {}).forEach(function (k) {
      var c = reactions[k] || 0;
      if (c > bestC && R_META[k]) { best = k; bestC = c; }
    });
    return best ? R_META[best] : '👍';
  }

  // ── সেশন ১০৪: FB-প্যারিটি কমেন্ট-আইটেম-রেন্ডারার ─────────────────────────
  // প্রত্যাশা (GET /api/comments চুক্তি): c.{id, author_id, username, author_name,
  // avatar_url, body, bodyHtml, created_at, edited_at, like_count, reactions,
  // my_reaction, replies[]}
  var RAW_CACHE = {}; // cid → raw-markdown (ইনলাইন-এডিটর প্রি-ফিল)
  // ── সেশন ১০৭: ডুয়াল-সারফেস অ্যাডাপ্টার — ফিড-ড্রয়ার (.fc-item) ও আর্টিকেল/প্রশ্ন-পেজ
  // (.comment-item/.reply-item) দুটোতেই একই FB-প্যালেট/ব্যাজ/৩-ডট/ইনলাইন-এডিট ইঞ্জিন চলে।
  var ITEM_SEL = '.fc-item, .comment-item, .reply-item';
  function itemOf(el) {
    return el && el.closest ? el.closest(ITEM_SEL) : null;
  }
  function bubbleOf(item) {
    return item ? (item.querySelector('.fc-bubble') || item.querySelector('.comment-bubble')) : null;
  }
  function bodyOf(item) {
    var b = bubbleOf(item);
    return b ? (b.querySelector('.fc-body') || b.querySelector('.comment-body')) : null;
  }
  function isOwnComment(c) {
    return ME_ID && String(c.author_id) === String(ME_ID);
  }

  // ── সেশন ১২১: মৃত্যু-অ্যানিমেশন — ডিলিটে তাৎক্ষণিক remove-এর বদলে মসৃণ
  // collapse+fade (উচ্চতা→০, opacity→০, পাশে-সরে-যাওয়া) — session12-সুপারিশ।
  // reduced-motion বা লুকানো-আইটেমে সরাসরি remove (শূন্য-জিওমেট্রি-ঝুঁকি)।
  function killItem(item, done) {
    if (!item) { if (done) done(); return; }
    var reduced = false;
    try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) {}
    var h = item.offsetHeight;
    if (reduced || !h) {
      item.remove();
      if (done) done();
      return;
    }
    if (item.dataset.dying) { if (done) done(); return; }
    item.dataset.dying = '1';
    item.style.boxSizing = 'border-box';
    item.style.overflow = 'hidden';
    item.style.height = h + 'px';
    item.style.transition = 'height .3s cubic-bezier(.4,0,.2,1), opacity .24s ease, transform .3s cubic-bezier(.4,0,.2,1), margin .3s ease, padding .3s ease';
    // reflow-কমিট শুরু-মান, তারপর লক্ষ্য-মান → ট্রানজিশন নিশ্চিত
    void item.offsetHeight;
    item.classList.add('cmt-dying');
    item.style.height = '0px';
    item.style.opacity = '0';
    item.style.transform = 'translateX(-14px) scale(.985)';
    item.style.marginTop = '0';
    item.style.marginBottom = '0';
    item.style.paddingTop = '0';
    item.style.paddingBottom = '0';
    setTimeout(function () { item.remove(); if (done) done(); }, 330);
  }

  // ── সেশন ১২১: সম্পাদনা-সেভ-পালস — সফল-সেভে বাবলে হালকা সবুজ-রিং ফ্ল্যাশ
  // (পরিবর্তন-স্বীকৃতি; reduced-motion-এ শূন্য — CSS-এ গার্ড)।
  function pulseSaved(item) {
    var b = bubbleOf(item) || bodyOf(item);
    if (!b) return;
    b.classList.remove('cmt-saved-pulse');
    void b.offsetWidth; // পুনঃ-ট্রিগারে রিস্টার্ট
    b.classList.add('cmt-saved-pulse');
    setTimeout(function () { b.classList.remove('cmt-saved-pulse'); }, 1200);
  }

  function renderCommentItem(c, postId, opts) {
    opts = opts || {};
    var mine = c.my_reaction || null;
    var total = 0;
    Object.keys(c.reactions || {}).forEach(function (k) { total += (c.reactions[k] || 0); });
    var edited = !!c.edited_at;
    var own = isOwnComment(c);
    RAW_CACHE[c.id] = c.body || ''; // ইনলাইন-এডিটরের প্রি-ফিল-সোর্স

    var html = '<div class="fc-item' + (opts.reply ? ' fc-reply' : '') + '" id="fc-c' + c.id + '"' +
      ' data-cid="' + c.id + '" data-author-id="' + esc(c.author_id) + '">' +
      '<img class="fc-av' + (opts.reply ? ' small' : '') + '" src="' + esc(c.avatar_url || ('/avatar/' + c.author_id)) + '" alt="" onerror="this.src=\'/assets/img/avatar-placeholder.svg?v=2\'">' +
      '<div class="fc-main">' +
        '<div class="fc-bubble">' +
          '<a class="fc-author" href="/profile/' + esc(c.username) + '">' + esc(c.author_name) + '</a>' +
          (c.replyTo && c.replyTo.id && c.replyTo.name
            ? '<a class="cmt-chain" href="#fc-c' + esc(c.replyTo.id) + '" data-cmt-chain="' + esc(c.replyTo.id) + '" title="' + esc(c.replyTo.name) + '-কে উত্তর দিচ্ছেন — ক্লিকে ঐ মন্তব্যে যান"><i class="fas fa-reply" aria-hidden="true"></i> ' + esc(c.replyTo.name) + '</a>'
            : '') +
          '<div class="fc-body">' + (c.bodyHtml || esc(c.body)) + '</div>' +
          (edited ? '<span class="fc-edited">সম্পাদিত</span>' : '') +
          (total > 0
            ? '<div class="fc-react-badge" title="প্রতিক্রিয়া"><span class="fcrb-emoji">' + topEmojiOf(c.reactions) + '</span><span class="fcrb-count">' + bnNum(total) + '</span></div>'
            : '') +
        '</div>' +
        '<div class="fc-meta">';

    if (AUTHED) {
      html += '<span class="fc-react-wrap">' +
            '<button type="button" class="fc-react-btn' + (mine ? ' active' : '') + '" data-mine="' + esc(mine || '') + '">' + (mine ? esc(R_LABEL[mine] || 'লাইক') : 'লাইক') + '</button>' +
            '<div class="fcr-palette" role="menu" aria-label="প্রতিক্রিয়া নির্বাচন" hidden>';
      Object.keys(R_META).forEach(function (k) {
        html += '<button type="button" class="fcr-opt' + (mine === k ? ' selected' : '') + '" data-reaction="' + k + '" title="' + R_LABEL[k] + '" aria-label="' + R_LABEL[k] + '">' + R_META[k] + '</button>';
      });
      html += '</div></span>' +
            '<button type="button" class="fc-reply-btn" data-reply-to="' + c.id + '" data-reply-name="' + esc(c.author_name) + '">উত্তর দিন</button>';
    }
    html += '<span class="fc-time" data-cmt-permalink="' + c.id + '" title="সময়ে ক্লিক করলে মন্তব্যের লিংক কপি হবে">' + relTime(c.created_at) + '</span>';

    if (AUTHED) {
      html += '<span class="fc-menu-wrap">' +
            '<button type="button" class="fc-menu-btn" aria-haspopup="menu" aria-expanded="false" aria-label="মন্তব্য অপশন" title="মন্তব্য অপশন"><i class="fas fa-ellipsis-h"></i></button>' +
            '<div class="fc-menu" role="menu" hidden>';
      if (own) {
        html += '<button type="button" class="fc-menu-item" data-cact="edit" role="menuitem"><i class="fas fa-pen"></i> সম্পাদনা করুন</button>' +
                '<button type="button" class="fc-menu-item fc-menu-danger" data-cact="delete" role="menuitem"><i class="fas fa-trash"></i> মুছে ফেলুন</button>';
      } else {
        html += '<button type="button" class="fc-menu-item fc-menu-danger" data-cact="report" role="menuitem"><i class="far fa-flag"></i> রিপোর্ট করুন</button>';
      }
      html += '</div></span>';
    }
    html += '</div>';

    if (AUTHED) {
      html += '<div class="fc-edit-slot" hidden></div>';
      html += '<div class="fc-reply-slot" data-slot-for="' + c.id + '" hidden></div>';
    }
    html += '</div></div>';
    return html;
  }

  function renderCommentList(comments, postId, mount) {
    var list = mount.querySelector('.fc-list');
    if (!list) return;
    if (!comments.length) {
      list.innerHTML = '<div class="fc-none">এখনো কোনো মন্তব্য নেই — প্রথম জায়গাটা আপনার!</div>';
      return;
    }
    list.innerHTML = comments.map(function (c) {
      var out = renderCommentItem(c, postId);
      if (c.replies && c.replies.length) {
        out += c.replies.map(function (r) { return renderCommentItem(r, postId, { reply: true }); }).join('');
      }
      return out;
    }).join('');
  }

  // ── সেশন ১০৪: প্রিভিউ-সিঙ্ক — ফেচ-পরবর্তী সর্বশেষ-২ কমেন্ট থেকে .fc-preview
  // পুনর্নির্মাণ (সার্ভার-রেন্ডারড প্রিভিউ এডিট/ডিলিট/নতুন-কমেন্টে স্টেল হয় না)।
  // ── সেশন ১৩১: parent-chain-চিপ ইঞ্জিন — .cmt-chain ক্লিকে প্যারেন্ট-বাবলে
  // smooth-scroll + ফ্ল্যাশ-রিং (no-JS নেটিভ-অ্যাঙ্কর #fc-c{id}-ফলব্যাক সহ)।
  // টার্গেট-আইডি চুক্তি: #fc-c{id} (ক্যানোনিকাল সার্ভার-রেন্ডার) বা [data-cid] (JS-ফলব্যাক)।
  function flashTarget131(item) {
    if (!item) return;
    var b = bubbleOf(item) || item;
    b.classList.remove('cmt-chain-flash');
    void b.offsetWidth; /* reflow — পুনঃ-ক্লিকে অ্যানিমেশন-রিস্টার্ট */
    b.classList.add('cmt-chain-flash');
    setTimeout(function () { b.classList.remove('cmt-chain-flash'); }, 1400);
  }
  document.addEventListener('click', function (e) {
    var ch = e.target.closest('.cmt-chain');
    if (!ch) return;
    var tid = parseInt(ch.getAttribute('data-cmt-chain'), 10);
    if (!Number.isInteger(tid) || tid <= 0) return;
    var tgt = document.getElementById('fc-c' + tid) || document.querySelector('[data-cid="' + tid + '"]');
    if (!tgt) return; /* নেটিভ-অ্যাঙ্কর যাক */
    e.preventDefault();
    var _rm131 = false;
    try { _rm131 = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) {}
    try { tgt.scrollIntoView({ behavior: _rm131 ? 'auto' : 'smooth', block: 'center' }); } catch (_) { tgt.scrollIntoView(); }
    flashTarget131(tgt);
    try { if (history && history.replaceState) history.replaceState(null, '', '#fc-c' + tid); } catch (_) {}
  });

  // ── সেশন ১৩৫: কমেন্ট-পারমালিঙ্ক (FB-প্যারিটি) — .fc-time[data-cmt-permalink] ক্লিকে
  // ঐ মন্তব্যের ক্যানোনিকাল-URL কপি + বাবল-ফ্ল্যাশ + হ্যাশ-আপডেট। তিন-সারফেস ডেলিগেটেড
  // (ফিড-ড্রয়ার/আর্টিকেল/QA — সব canonical CommentItem চুক্তিতে data-cmt-permalink আসে)।
  // keyboard: Enter/Space (role=link + tabindex=0 — aria-চুক্তি)।
  function permalinkCopy135(url, ok) {
    if (window.showToast) { showToast(ok ? 'লিংক কপি হয়েছে ✓' : 'কপি সম্ভব হয়নি', ok ? 'success' : 'error'); return; }
  }
  function permalinkGo135(t) {
    var cid = parseInt(t.getAttribute('data-cmt-permalink'), 10);
    if (!Number.isInteger(cid) || cid <= 0) return;
    var item = t.closest('[data-cmt-id]') || t.closest('[data-cid]') || t.closest('.fc-item, .cmt-item');
    /* post-link চুক্তি: রুটে data-post-link (canonical) — ফলব্যাকে বর্তমান-পাথ */
    var base = (item && item.getAttribute('data-post-link')) || (t.closest('[data-post-link]') && t.closest('[data-post-link]').getAttribute('data-post-link')) || location.pathname;
    var url;
    try { url = location.origin + base + '#fc-c' + cid; } catch (_) { url = base + '#fc-c' + cid; }
    try { if (history && history.replaceState) history.replaceState(null, '', '#fc-c' + cid); } catch (_) {}
    if (item) flashTarget131(item);
    var done = function (ok) { permalinkCopy135(url, ok); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { done(true); }, function () { permalinkLegacy135(url, done); });
    } else permalinkLegacy135(url, done);
  }
  function permalinkLegacy135(url, done) {
    try {
      var ta = document.createElement('textarea');
      ta.value = url; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = document.execCommand('copy');
      ta.remove(); done(ok);
    } catch (_) { done(false); }
  }
  document.addEventListener('click', function (e) {
    var pt = e.target.closest('.fc-time[data-cmt-permalink]');
    if (!pt) return;
    e.preventDefault();
    permalinkGo135(pt);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var pt = e.target.closest ? e.target.closest('.fc-time[data-cmt-permalink]') : null;
    if (!pt) return;
    e.preventDefault();
    permalinkGo135(pt);
  });

  function syncPreview(drawer, comments, total) {
    var card = drawer.closest('.feed-card') || drawer.closest('article');
    if (!card) return;
    var prev = card.querySelector('.fc-preview');
    if (!prev) {
      // ০-কমেন্ট পোস্টে সার্ভার-সাইডে প্রিভিউ-ব্লক রেন্ডারই হয়নি — পরে কমেন্ট
      // হলে ড্রয়ার-বন্ধ-অবস্থায় FB-প্রিভিউ দেখাতে ব্লকটি তৈরি করে নিতে হয়
      if (!(comments || []).length) return;
      prev = document.createElement('div');
      prev.className = 'fc-preview';
      var drawerEl = card.querySelector('.fc-drawer');
      drawerEl && drawerEl.parentElement.insertBefore(prev, drawerEl);
    }
    var flat = [];
    (comments || []).forEach(function (c) {
      flat.push(c);
      (c.replies || []).forEach(function (r) { flat.push(r); });
    });
    var postId = drawer.getAttribute('data-comments-for');
    var latest = flat.slice(-2); // ASC-ক্রম → শেষ ২টিই সর্বশেষ
    var html = '';
    if (total > latest.length) {
      html += '<button type="button" class="fc-more" data-toggle-comments="' + postId + '">সব ' + bnNum(total) + ' টি মন্তব্য দেখুন</button>';
    }
    latest.forEach(function (cp) {
      html += '<div class="fcp-row">' +
        '<a href="/profile/' + esc(cp.username) + '" class="fcp-av-link" aria-hidden="true" tabindex="-1">' +
          '<img loading="lazy" decoding="async" src="' + esc(cp.avatar_url || ('/avatar/' + cp.author_id)) + '" class="fcp-avatar" alt="" onerror="this.src=\'/assets/img/avatar-placeholder.svg?v=2\'">' +
        '</a>' +
        '<div class="fcp-main">' +
          '<div class="fcp-bubble"><a href="/profile/' + esc(cp.username) + '" class="fcp-author">' + esc(cp.author_name) + '</a>' +
          '<span class="fcp-body">' + esc(String(cp.body || '').replace(/^#{1,6}[ \t]+/gm, '').replace(/\s+/g, ' ').trim().substring(0, 110)) + '</span></div>' +
          '<div class="fcp-actions">' +
            '<button type="button" class="fcp-act" data-toggle-comments="' + postId + '">মন্তব্য করুন</button>' +
            '<span class="fcp-act muted">' + relTime(cp.created_at) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    });
    prev.innerHTML = html;
  }

  function buildComposerHtml(postId, avatar) {
    return '<form class="cc-form" data-post-id="' + postId + '">' +
      '<img class="cc-avatar small" src="' + esc(avatar || '/avatar/0') + '" alt="" onerror="this.src=\'/assets/img/avatar-placeholder.svg?v=2\'">' +
      '<div class="cc-bubble"><textarea class="cc-input" name="body" rows="1" maxlength="2000" placeholder="আপনার মন্তব্য লিখুন… (@ লিখে মেনশন করুন)" required></textarea>' +
      '<div class="cc-mention" role="listbox" aria-label="মেনশন-সাজেশন" hidden></div>' +
      '<div class="cc-tools"><div class="cc-tools-left" role="toolbar" aria-label="ফরম্যাটিং">' +
        '<button type="button" class="cc-fmt" data-fmt="bold" title="বোল্ড" aria-label="বোল্ড"><i class="fas fa-bold"></i></button>' +
        '<button type="button" class="cc-fmt" data-fmt="italic" title="ইটালিক" aria-label="ইটালিক"><i class="fas fa-italic"></i></button>' +
        '<button type="button" class="cc-fmt" data-fmt="strike" title="কাটা" aria-label="কাটা"><i class="fas fa-strikethrough"></i></button>' +
        '<button type="button" class="cc-fmt" data-fmt="link" title="লিংক" aria-label="লিংক"><i class="fas fa-link"></i></button>' +
        '<button type="button" class="cc-fmt" data-fmt="list" title="তালিকা" aria-label="তালিকা"><i class="fas fa-list-ul"></i></button>' +
        '<button type="button" class="cc-fmt" data-fmt="quote" title="উদ্ধৃতি" aria-label="উদ্ধৃতি"><i class="fas fa-quote-right"></i></button>' +
      '</div><button type="submit" class="cc-send" disabled aria-label="মন্তব্য পাঠান"><i class="fas fa-paper-plane"></i></button></div></div></form>';
  }

  function openDrawer(card) {
    var drawer = card.querySelector('.fc-drawer');
    if (!drawer) return false;
    drawer.hidden = false;
    card.classList.add('fc-open'); // → CSS: .fc-open .fc-preview{display:none} (ডুপ্লিকেট-ফিক্স)
    if (!drawer.dataset.loaded) {
      drawer.dataset.loaded = '1';
      var postId = drawer.getAttribute('data-comments-for');
      var list = drawer.querySelector('.fc-list');
      // ── সেশন ১৩১: ইনস্ট্যান্ট-প্রিভিউ — স্পিনার-ফ্ল্যাশ-এর-বদলে কার্ডের fc-preview-রো
      // তাৎক্ষণিক-পেইন্ট (display:none-থেকেও ক্লোনযোগ্য); ফেচ-রেজলভে সার্ভার-সত্যে swap।
      // প্রিভিউ-শূন্য (০-কমেন্ট/আর্টিকেল-পেজ) হলে পুরনো স্পিনার-পথ।
      var _ip131 = null;
      if (list) {
        var _prev131 = card.querySelector('.fc-preview');
        var _rows131 = _prev131 ? _prev131.querySelectorAll('.fcp-row') : [];
        if (_rows131.length) {
          _ip131 = document.createElement('div');
          _ip131.className = 'fc-instaprev';
          for (var _i131 = 0; _i131 < _rows131.length; _i131++) {
            var _row131 = _rows131[_i131].cloneNode(true);
            /* ক্লোনে toggle-বাটন নিষ্ক্রিয় — ড্রয়ার-খোলা-অবস্থায় ক্লিক করলে
               closeDrawer-এ পথ হত (আনিচ্ছুক-বন্ধ-বাগ-প্রতিরোধ); লিঙ্ক জীবন্ত থাকে */
            _row131.querySelectorAll('[data-toggle-comments]').forEach(function (b131) {
              b131.disabled = true;
              b131.removeAttribute('data-toggle-comments');
              b131.setAttribute('aria-hidden', 'true');
            });
            _ip131.appendChild(_row131);
          }
          list.innerHTML = '';
          list.appendChild(_ip131);
          drawer.dataset.hadInstaprev = '1';
        } else {
          list.innerHTML = '<div class="fc-loading"><i class="fas fa-spinner fa-spin"></i> মন্তব্য লোড হচ্ছে…</div>';
        }
      }
      refreshDrawer(drawer, postId);
    }
    return true;
  }

  function closeDrawer(card) {
    var drawer = card.querySelector('.fc-drawer');
    if (drawer) drawer.hidden = true;
    card.classList.remove('fc-open'); // প্রিভিউ ফিরে আসে
  }

  function refreshDrawer(drawer, postId) {
    // সেশন ১০৫: ?format=html — সার্ভারই ক্যানোনিকাল CommentItem.ejs রেন্ডার করে
    // (single-source); html না-আসলে পুরনো JS-রেন্ডারার ফলব্যাক।
    return fetch('/api/comments?post_id=' + postId + '&format=html')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var comments = (j && j.comments) || [];
        var total = typeof (j && j.total) === 'number' ? j.total : comments.length;
        /* সেশন ১০৫: ?format=html — সার্ভারই ক্যানোনিকাল CommentItem.ejs রেন্ডার করে
           (single-source); html না-আসলে adapter-রেন্ডারার ফলব্যাক। */
        var _list105 = drawer.querySelector('.fc-list');
        if (j && j.html && _list105) { _list105.innerHTML = j.html; }
        else { renderCommentList(comments, postId, drawer); }
        // সেশন ১৩১: ইনস্ট্যান্ট-প্রিভিউ → সার্ভার-সত্য বদলের মসৃণ swap-ফেড
        if (drawer.dataset.hadInstaprev) {
          delete drawer.dataset.hadInstaprev;
          if (_list105) {
            _list105.classList.add('fc-swap-in');
            setTimeout(function () { _list105.classList.remove('fc-swap-in'); }, 320);
          }
        }
        syncPreview(drawer, comments, total);
        // কাউন্টার-আপডেট (actions-summary-র as-stat)
        var card = drawer.closest('.feed-card, article');
        if (card) {
          var stat = card.querySelector('.as-stat[title="মন্তব্য"] span:first-child');
          if (stat) stat.textContent = bnNum(total); // সেশন ১২: বাংলা-সংখ্যা (ASCII-লিক-ফিক্স)
        }
      })
      .catch(function () {
        var list = drawer.querySelector('.fc-list');
        if (list) list.innerHTML = '<div class="fc-none">মন্তব্য লোড করা যায়নি — আবার চেষ্টা করুন</div>';
      });
  }

  // টগল-বাটন (ডেলিগেটেড) — ফিডে 'মন্তব্য' বাটন/কাউন্টার/'সব N টি' লিংক
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-toggle-comments]');
    if (!t) return;
    e.preventDefault();
    var postId = t.getAttribute('data-toggle-comments');
    var card = t.closest('.feed-card') || t.closest('article') || document;
    var drawer = card.querySelector('.fc-drawer[data-comments-for="' + postId + '"]');
    if (!drawer) return;
    if (drawer.hidden) {
      openDrawer(card);
      var input = drawer.querySelector('.cc-input');
      if (input) setTimeout(function () { input.focus(); }, 120);
    } else {
      closeDrawer(card);
    }
  });

  /* ── ৫. কমেন্ট-রিঅ্যাকশন (সেশন ১০৪, FB-প্যালেট) ─────────────────────────── */
  function closeAllPalettes(except) {
    document.querySelectorAll('.fcr-palette:not([hidden])').forEach(function (p) {
      if (p !== except) p.hidden = true;
    });
  }
  function closeAllFcMenus(except) {
    document.querySelectorAll('.fc-menu:not([hidden])').forEach(function (m) {
      if (m !== except) {
        m.hidden = true;
        var b = m.closest('.fc-menu-btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function applyBadge(item, reactions, total, mine) {
    var bubble = bubbleOf(item);
    if (!bubble) return;
    var badge = bubble.querySelector('.fc-react-badge');
    if (total > 0) {
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'fc-react-badge';
        badge.title = 'প্রতিক্রিয়া';
        var bEl = bodyOf(item);
        if (bEl) bEl.insertAdjacentElement('afterend', badge);
        else bubble.appendChild(badge);
      }
      badge.innerHTML = '<span class="fcrb-emoji">' + topEmojiOf(reactions) + '</span><span class="fcrb-count">' + bnNum(total) + '</span>';
      badge.hidden = false;
    } else if (badge) {
      badge.remove();
    }
  }

  function applyMine(item, mine) {
    var btn = item.querySelector('.fc-react-btn');
    if (!btn) return;
    btn.dataset.mine = mine || '';
    btn.classList.toggle('active', !!mine);
    btn.textContent = mine ? (R_LABEL[mine] || 'লাইক') : 'লাইক';
    item.querySelectorAll('.fcr-opt').forEach(function (o) {
      o.classList.toggle('selected', o.getAttribute('data-reaction') === mine);
    });
  }

  function reactComment(item, cid, type) {
    if (!AUTHED) return location.href = '/login?next=' + encodeURIComponent(location.pathname);
    var btn = item.querySelector('.fc-react-btn');
    if (btn) btn.disabled = true;
    fetch('/api/react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_id: cid, target_type: 'comment', reaction_type: type })
    }).then(function (r) {
      if (r.status === 401) { location.href = '/login?next=' + encodeURIComponent(location.pathname); throw new Error('login'); }
      return r.json();
    }).then(function (j) {
      if (!j || !j.ok) throw new Error('failed');
      applyMine(item, j.mine);
      applyBadge(item, j.reactions || {}, j.total || 0, j.mine);
      if (window.showToast) showToast(j.mine ? (R_LABEL[j.mine] + ' দেওয়া হয়েছে') : 'প্রতিক্রিয়া সরানো হয়েছে', 'success');
    }).catch(function (err) {
      if (err && err.message === 'login') return;
      if (window.showToast) showToast('প্রতিক্রিয়া জানানো যায়নি', 'error');
    }).finally(function () {
      if (btn) btn.disabled = false;
    });
  }

  // প্যালেট-হোভার (ডেস্কটপ): ৩৫০ms ডিলে → ওপেন; বাইরে গেলে বন্ধ (টাচে ক্লিকে টগল)
  var paletteTimer = null, paletteOpenByHover = false;
  document.addEventListener('mouseover', function (e) {
    var wrap = e.target.closest && e.target.closest('.fc-react-wrap');
    if (!wrap || !window.matchMedia('(hover: hover)').matches) return;
    clearTimeout(paletteTimer);
    paletteTimer = setTimeout(function () {
      var pal = wrap.querySelector('.fcr-palette');
      if (pal) { pal.hidden = false; paletteOpenByHover = true; }
    }, 300);
  });
  document.addEventListener('mouseout', function (e) {
    var wrap = e.target.closest && e.target.closest('.fc-react-wrap');
    if (!wrap) return;
    var to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.fc-react-wrap');
    if (to === wrap) return;
    clearTimeout(paletteTimer);
    paletteTimer = setTimeout(function () {
      var pal = wrap.querySelector('.fcr-palette');
      if (pal && paletteOpenByHover) { pal.hidden = true; paletteOpenByHover = false; }
    }, 220);
  });

  // কমেন্ট-ক্লিক-হাব: রিঅ্যাক্ট-বাটন/প্যালেট-অপশন/৩-ডট-মেনু/এডিট/ডিলিট/রিপোর্ট
  document.addEventListener('click', function (e) {
    // (ক) প্যালেট-ইমোজি
    var opt = e.target.closest('.fcr-opt');
    if (opt) {
      e.preventDefault();
      var item = itemOf(opt);
      var wrap = opt.closest('.fc-react-wrap');
      var pal = wrap && wrap.querySelector('.fcr-palette');
      if (pal) pal.hidden = true;
      if (item) {
        var cidOpt = item.getAttribute('data-cid') || (item.id || '').replace(/^c/, '');
        reactComment(item, cidOpt, opt.getAttribute('data-reaction'));
      }
      return;
    }
    // (খ) 'লাইক'-লেবেল — টগল (mine থাকলে সরাও, নাহলে like); টাচ-ডিভাইসে প্যালেট খোলে
    var rBtn = e.target.closest('.fc-react-btn');
    if (rBtn) {
      e.preventDefault();
      var item2 = itemOf(rBtn);
      var pal2 = rBtn.parentElement.querySelector('.fcr-palette');
      var touch = !window.matchMedia('(hover: hover)').matches;
      if (touch && pal2) { // টাচ: প্রথম ট্যাপে প্যালেট (FB-মোবাইল-আচরণ)
        var wasHidden = pal2.hidden;
        closeAllPalettes(pal2);
        pal2.hidden = !wasHidden;
        return;
      }
      if (item2) {
        var mineNow = rBtn.dataset.mine || '';
        var cid2 = item2.getAttribute('data-cid') || (item2.id || '').replace(/^c/, '');
        reactComment(item2, cid2, mineNow || 'like'); // টগল-অফ সার্ভার-সাইডে
      }
      return;
    }
    // (গ) ৩-ডট-মেনু-টগল
    var mBtn = e.target.closest('.fc-menu-btn');
    if (mBtn) {
      e.preventDefault();
      e.stopPropagation();
      var mMenu = mBtn.parentElement.querySelector('.fc-menu');
      if (mMenu) {
        var opening = mMenu.hidden;
        closeAllFcMenus(mMenu);
        closeAllPalettes(null);
        mMenu.hidden = !opening;
        mBtn.setAttribute('aria-expanded', opening ? 'true' : 'false');
      }
      return;
    }
    // (ঘ) মেনুর বাইরে ক্লিক → সব বন্ধ
    if (!e.target.closest('.fc-menu')) closeAllFcMenus(null);
    if (!e.target.closest('.fc-react-wrap')) closeAllPalettes(null);

    // (ঙ) মেনু-অ্যাকশন: সম্পাদনা/মুছে-ফেলা/রিপোর্ট
    var act = e.target.closest('.fc-menu-item');
    if (act) {
      e.preventDefault();
      var item3 = itemOf(act);
      var cid = item3 && (item3.getAttribute('data-cid') || (item3.id || '').replace(/^c/, ''));
      var kind = act.getAttribute('data-cact');
      var menuWrap = act.closest('.fc-menu');
      if (menuWrap) menuWrap.hidden = true;
      if (!item3 || !cid) return;
      if (kind === 'edit') startEdit(item3, cid);
      else if (kind === 'delete') deleteComment(item3, cid);
      else if (kind === 'report' && window.openReport81) {
        var nameEl = item3.querySelector('.fc-author') || item3.querySelector('.comment-author');
        var name = (nameEl || {}).textContent || '';
        window.openReport81('comment', cid, 'মন্তব্য: ' + String(name).trim());
      }
    }
  });

  // ── সেশন ১০৪+১০৭: ইনলাইন-সম্পাদনা (ফিড + আর্টিকেল-পেজ দুই-সারফেস) ──────
  function startEdit(item, cid) {
    var slot = item.querySelector('.fc-edit-slot');
    var bubble = bubbleOf(item);
    if (!slot || !bubble || !slot.hidden) return;
    var bodyEl = bodyOf(item);
    var raw = RAW_CACHE[cid]
      || (bodyEl ? bodyEl.getAttribute('data-raw') : null)
      || (bodyEl ? bodyEl.textContent : '');
    slot.innerHTML = '<div class="fc-edit-box">' +
      '<textarea class="fc-edit-input" rows="2" maxlength="2000" aria-label="মন্তব্য সম্পাদনা"></textarea>' +
      '<div class="fc-edit-actions">' +
        '<button type="button" class="fc-edit-save"><i class="fas fa-check"></i> সংরক্ষণ</button>' +
        '<button type="button" class="fc-edit-cancel">বাতিল</button>' +
      '</div></div>';
    var ta = slot.querySelector('.fc-edit-input');
    ta.value = raw;
    slot.hidden = false;
    bubble.style.display = 'none';
    ta.addEventListener('input', function () {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
    });
    setTimeout(function () { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }, 50);
    slot.querySelector('.fc-edit-cancel').addEventListener('click', function () {
      slot.hidden = true; slot.innerHTML = ''; bubble.style.display = '';
    });
    slot.querySelector('.fc-edit-save').addEventListener('click', function () {
      var body = ta.value.trim();
      if (!body) return;
      var saveBtn = slot.querySelector('.fc-edit-save');
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> সংরক্ষণ হচ্ছে…';
      fetch('/api/comments/' + cid, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body })
      }).then(function (r) {
        if (r.status === 401) { location.href = '/login?next=' + encodeURIComponent(location.pathname); throw new Error('login'); }
        return r.json();
      }).then(function (j) {
        if (!j || !j.ok) throw new Error('failed');
        if (bodyEl) bodyEl.innerHTML = j.bodyHtml || esc(body);
        bodyEl && bodyEl.setAttribute('data-raw', body);
        bodyEl && bodyEl.removeAttribute('data-lpv'); /* সেশন ১৩৯: সম্পাদনায় নতুন-লিংক হলে og-কার্ড পুনঃ-স্ক্যান (observer-চুক্তি) */
        var ed = bubble.querySelector('.fc-edited');
        if (!ed) {
          ed = document.createElement('span');
          ed.className = 'fc-edited';
          ed.textContent = 'সম্পাদিত';
          (bodyEl || bubble).insertAdjacentElement('afterend', ed);
        }
        RAW_CACHE[cid] = body;
        pulseSaved(item); // সেশন ১২১: সেভ-স্বীকৃতি-পালস
        slot.hidden = true; slot.innerHTML = '';
        bubble.style.display = '';
        if (window.showToast) showToast('মন্তব্য সম্পাদিত হয়েছে ✓', 'success');
      }).catch(function (err) {
        if (err && err.message === 'login') return;
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> সংরক্ষণ';
        if (window.showToast) showToast('সম্পাদনা সংরক্ষণ করা যায়নি', 'error');
      });
    });
    ta.addEventListener('keydown', function (ev) {
      if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') slot.querySelector('.fc-edit-save').click();
      if (ev.key === 'Escape') slot.querySelector('.fc-edit-cancel').click();
    });
  }

  // ── সেশন ১০৪+১০৭: মুছে-ফেলা (ফিড-ড্রয়ারে রিফ্রেশ, আর্টিকেল-পেজে ইন-প্লেস) ─
  // ── সেশন ১২১: মুছে-ফেলার-পরের DOM-সিঙ্ক — দুই-হ্যান্ডলারই (legacy .fc-menu +
  // ক্যানোনিকাল [data-cmt-delete]) একই ফাংশনে: ড্রয়ার → পূর্ণ-রিফ্রেশ;
  // QA-থ্রেড → সার্ভার-সত্য সোয়াপ (empty-slot-অবশেষ/চিপ/কাউন্টার অটো-সিঙ্ক);
  // অন্যথায় ইন-প্লেস + কাউন্টার-সিঙ্ক।
  function afterDeleteSuccess(j, it) {
    var drawer = it && it.closest('.fc-drawer');
    if (drawer) {
      // ফিড-ড্রয়ার: পূর্ণ-রিফ্রেশ — লিস্ট + কাউন্টার + প্রিভিউ-সিঙ্ক
      refreshDrawer(drawer, drawer.getAttribute('data-comments-for'));
      return;
    }
    if (swapQaThread('', null)) return;
    // সেশন ১২৩: তাৎক্ষণিক remove-এর বদলে মৃত্যু-অ্যানিমেশন — কাউন্টার-সিঙ্ক
    // অ্যানিমেশন-শেষে (session12-সুপারিশ; reduced-motion/লুকানো-আইটেমে তাৎক্ষণিক)
    killItem(it, function () {
      try {
        var total = (typeof j.total === 'number') ? j.total : null;
        if (total !== null) {
          // সেশন ১১৪: লেবেল-নিরপেক্ষ কাউন্টার-স্প্যান ([data-cmt-total]) প্রথমে —
          // 'উত্তরসমূহ (N)' হেডিং .comments-h-র হার্ডকোডেড innerHTML-রিরাইট থেকে নিরাপদ
          var cSpan = document.querySelector('[data-cmt-total]') || document.querySelector('.comments-total');
          if (cSpan) cSpan.textContent = bnNum(total);
          else {
            var hCount = document.querySelector('.comments-h');
            if (hCount) hCount.innerHTML = '<i class="far fa-comment"></i> মন্তব্য (' + bnNum(total) + ')';
          }
          var stat = document.querySelector('.as-stat[title="মন্তব্য"] span');
          if (stat) stat.textContent = bnNum(total); // সেশন ১২: বাংলা-সংখ্যা (ASCII-লিক-ফিক্স)
        }
      } catch (_) {}
    });
  }

  function deleteComment(item, cid) {
    if (!window.confirm('নিশ্চিত? এই মন্তব্যটি মুছে ফেলতে চান?')) return;
    item.style.opacity = '0.45';
    fetch('/api/comments/' + cid, { method: 'DELETE' })
      .then(function (r) {
        if (r.status === 401) { location.href = '/login?next=' + encodeURIComponent(location.pathname); throw new Error('login'); }
        return r.json();
      })
      .then(function (j) {
        if (!j || !j.ok) throw new Error('failed');
        // সেশন ১২২-রিফ্যাক্টর: afterDeleteSuccess-এ ড্রয়ার/QA-থ্রেড/ইন-প্লেস তিন-পথ ঐক্যবদ্ধ;
        // সেশন ১২৩: ইন-প্লেস-পথে মৃত্যু-অ্যানিমেশন (নিচের ফাংশনে killItem-ইনজেক্টেড)
        afterDeleteSuccess(j, item);
        if (window.showToast) showToast('মন্তব্য মুছে ফেলা হয়েছে', 'success');
      })
      .catch(function (err) {
        item.style.opacity = '';
        if (err && err.message === 'login') return;
        if (window.showToast) showToast('মন্তব্য মুছে ফেলা যায়নি', 'error');
      });
  }

  // রিপ্লাই-বাটন (ডেলিগেটেড — ফিড-ড্রয়ার + আর্টিকেল-পেজের .reply-btn-চুক্তি পৃথক)

  /* ── সেশন ১০৫ (ডিজাইন-সিস্টেম): ক্যানোনিকাল CommentItem (.cmt-*)-হুক —
     views/shared/comment/CommentItem.ejs-এর সাথে চুক্তিবদ্ধ; উপরের fc-react-*
     ইঞ্জিন (session104/107-adapter) .comment-item/.fc-item-উভয়-মার্কআপে চলে —
     attr-ভিন্ন বলে ডাবল-ফায়ার নেই। */
  // রিপ্লাই-বাটন (ডেলিগেটেড — ড্রয়ার + ক্যানোনিকাল CommentItem-এর .cmt-reply-btn)
  document.addEventListener('click', function (e) {
    var rBtn = e.target.closest('.fc-reply-btn, .cmt-reply-btn');
    if (!rBtn) return;
    e.preventDefault();
    var item = itemOf(rBtn);
    var slot = item && item.querySelector('.fc-reply-slot');
    if (!slot) return;
    // সেশন ১১৩ (বাগ-ফিক্স): আগে postId শুধু ফিড-ড্রয়ার থেকে আসত — ড্রয়ারের
    // বাইরে (আর্টিকেল/QA-সিঙ্গেল) না-পাওয়া গেলে data-post-id="null" হত →
    // POST /api/comment নীরবে অনাথ-কমেন্ট-রো (post_id='null' TEXT) বানাত।
    // এখন: ড্রয়ার → ড্রয়ারের data-comments-for; নইলে পেজের মেইন-কম্পোজার
    // (.cc-form[data-post-id], স্লট/ড্রয়ারের বাইরের প্রথমটি)।
    var drawer113 = rBtn.closest('.fc-drawer');
    var postId = drawer113 ? drawer113.getAttribute('data-comments-for') : null;
    if (!postId) {
      var _forms113 = document.querySelectorAll('.cc-form[data-post-id]');
      for (var _i113 = 0; _i113 < _forms113.length; _i113++) {
        if (!_forms113[_i113].closest('.fc-reply-slot') && !_forms113[_i113].closest('.fc-drawer')) {
          postId = _forms113[_i113].getAttribute('data-post-id');
          break;
        }
      }
    }
    var authorMeta = document.querySelector('meta[name="lf-me-avatar"]');
    if (slot.hidden) {
      slot.innerHTML = buildComposerHtml(postId, authorMeta ? authorMeta.getAttribute('content') : '/avatar/0');
      slot.querySelector('.cc-input').placeholder = rBtn.getAttribute('data-reply-name') + '-কে উত্তর দিন…';
      slot.hidden = false;
      slot.querySelector('.cc-form').setAttribute('data-parent-id', rBtn.getAttribute('data-reply-to'));
      setTimeout(function () { slot.querySelector('.cc-input').focus(); }, 60);
    } else {
      slot.hidden = true;
      slot.innerHTML = '';
    }
  });

  /* ── ৫.ব সেশন ১২: অপটিমিস্টিক-কমেন্ট ইঞ্জিন (session104-সুপারিশ-③ — শেষ-বাকি) ──
     সাবমিট-সফল হলে সার্ভার-রিফেচের অপেক্ষা নয় — ক্যানোনিকাল-চুক্তির বাবল তাৎক্ষণিক
     DOM-এ বসে (POST-রেসপন্সের j.id বাস্তব, তাই data-cmt-id/প্যালেট/৩-ডট সঙ্গে সঙ্গেই
     সক্রিয়)। এরপর background-রিফেচ ক্যানোনিকাল-HTML-এ reconcile করে (markdown/সময়
     পূর্ণরূপে সার্ভার-নির্ভুল)। বিলম্ব-পরিমাপ (E2E): আগে ~২.৬সে শূন্য-অপেক্ষা → এখন ০মিসে। */
  function optMd(raw) {
    // markdown-lite-এর ক্লায়েন্ট-মিরর (ইনলাইন-সাবসেট) — esc-ফার্স্ট (XSS-নিরাপদ);
    // সম্পূর্ণ-নির্ভুলতা দরকার নেই: reconcile-সোয়াপ সঙ্গে সঙ্গেই ক্যানোনিকাল-HTML বসায়।
    // সেশন ১৩৯: দুই-পাস-স্প্লিট (সার্ভার inlineMd-এর হুবহু মিরর) — খালি-URL আগে
    // (নইলে #tag URL-এর ভেতরের #fc-c22 ভাঙে), তারপর @ম্যানশন/#ট্যাগ সব-অ্যাঙ্করের বাইরে।
    var s = esc(raw);
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
         .replace(/_(.+?)_/g, '<em>$1</em>')
         .replace(/~~(.+?)~~/g, '<del>$1</del>')
         .replace(/\[([^\]]+)\]\(\s*((?:https?:\/\/|\/)[^\s)"]+)\s*\)/g,
           '<a href="$2" class="a-link" target="_blank" rel="noopener nofollow">$1</a>');
    s = s.split(/(<a\s[^>]*>[^<]*<\/a>)/g).map(function (seg139) {
      if (seg139.slice(0, 3) === '<a ') return seg139;
      return seg139.replace(/(^|[\s(])(https?:\/\/[^\s<>()\[\]]+)/g, function (_m, pre, url) {
        var trail = url.match(/[.,;:!?…।]+$/);
        var core = trail ? url.slice(0, url.length - trail[0].length) : url;
        return pre + '<a href="' + core + '" class="a-link" target="_blank" rel="noopener nofollow">' + core + '</a>' + (trail ? trail[0] : '');
      });
    }).join('');
    s = s.split(/(<a\s[^>]*>[^<]*<\/a>)/g).map(function (seg139) {
      if (seg139.slice(0, 3) === '<a ') return seg139;
      return seg139
        .replace(/@([a-zA-Z0-9_]+)/g, '<a class="mention" href="/profile/$1">@$1</a>')
        .replace(/#([\u0980-\u09FFa-zA-Z0-9_]+)/g, '<a class="tag" href="/articles?tag=$1">#$1</a>');
    }).join('');
    return s.split(/\r?\n/).map(function (l) { return l; }).join('<br>');
  }

  function optMe() {
    var b = document.body;
    if (!b || b.getAttribute('data-auth') !== '1') return null;
    return {
      id: b.getAttribute('data-uid') || '',
      name: b.getAttribute('data-name') || 'সদস্য',
      uname: b.getAttribute('data-uname') || '',
      avatar: b.getAttribute('data-avatar') || ''
    };
  }

  function optPaletteHtml(cid) {
    var opts = Object.keys(R_META).map(function (k) {
      return '<button type="button" class="cmt-palette-opt" data-cmt-react="' + k + '" data-cmt-id="' + esc(cid) + '" title="' + R_LABEL[k] + '" aria-label="' + R_LABEL[k] + '">' + R_META[k] + '</button>';
    }).join('');
    return '<span class="cmt-palette" role="menu" aria-label="প্রতিক্রিয়া নির্বাচন">' + opts + '</span>';
  }

  function buildOptimisticItem(id, raw, parentId) {
    var me = optMe();
    if (!me) return null;
    var compact = !!parentId;
    var cls = compact ? 'fc-item cmt-item fc-reply cmt-reply' : 'fc-item cmt-item';
    var author = me.uname
      ? '<a class="fc-author" href="/profile/' + esc(me.uname) + '">' + esc(me.name) + '</a>'
      : '<span class="fc-author">' + esc(me.name) + '</span>';
    return '<div class="' + cls + '" id="fc-c' + esc(id) + '" data-cmt-id="' + esc(id) + '" data-opt="1">' +
      '<img class="fc-av' + (compact ? ' small' : '') + '" src="' + esc(me.avatar || ('/avatar/' + me.id)) + '" alt="" onerror="this.src=\'/assets/img/avatar-placeholder.svg?v=2\'">' +
      '<div class="fc-main">' +
        '<div class="fc-bubble">' + author +
          '<div class="fc-body" data-raw="' + esc(raw) + '">' + optMd(raw) + '</div>' +
          '<span class="cmt-badge" hidden title="প্রতিক্রিয়া"></span>' +
        '</div>' +
        '<div class="fc-meta">' +
          '<span class="fc-time" data-ts="' + new Date().toISOString() + '" data-cmt-permalink="' + esc(id) + '" title="সময়ে ক্লিক করলে মন্তব্যের লিংক কপি হবে">এইমাত্র</span>' +
          '<span class="cmt-like-wrap">' +
            '<button type="button" class="fc-act cmt-like" data-cmt-react-toggle="' + esc(id) + '" data-mine="" aria-label="প্রতিক্রিয়া দিন">লাইক</button>' +
            optPaletteHtml(id) +
          '</span>' +
          '<button type="button" class="fc-act cmt-reply-btn" data-reply-to="' + esc(id) + '" data-reply-name="' + esc(me.name) + '">উত্তর</button>' +
        '</div>' +
        '<div class="pm-wrap cmt-more" data-pm-comment="' + esc(id) + '">' +
          '<button type="button" class="pm-btn" aria-haspopup="menu" aria-expanded="false" aria-label="মন্তব্য অপশন" title="মন্তব্য অপশন"><i class="fas fa-ellipsis-h"></i></button>' +
          '<div class="pm-menu" role="menu" hidden>' +
            '<button type="button" class="pm-item" role="menuitem" data-cmt-edit="' + esc(id) + '"><i class="fas fa-pen"></i> সম্পাদনা করুন</button>' +
            '<button type="button" class="pm-item pm-danger" role="menuitem" data-cmt-delete="' + esc(id) + '"><i class="fas fa-trash"></i> মুছে ফেলুন</button>' +
          '</div>' +
        '</div>' +
        '<div class="fc-reply-slot" data-slot-for="' + esc(id) + '" hidden></div>' +
      '</div>' +
    '</div>';
  }

  function optParseBn(txt) {
    // বাংলা-সংখ্যা-সচেতন পার্স (কাউন্টার "৩"-এ থাকলে ASCII-regex-এ NaN হয়)
    var t = String(txt || '').replace(/[^০-৯0-9]/g, '');
    return parseInt(t.replace(/[০-৯]/g, function (d) { return String('০১২৩৪৫৬৭৮৯'.indexOf(d)); }), 10);
  }

  function optBumpCounters(delta) {
    var seen = [];
    document.querySelectorAll('[data-cmt-total], .comments-total').forEach(function (el) {
      if (seen.indexOf(el) !== -1) return;
      seen.push(el);
      var cur = optParseBn(el.textContent);
      if (Number.isNaN(cur)) return;
      el.textContent = bnNum(cur + delta);
    });
  }

  function insertOptimistic(id, raw, parentId, postId) {
    // লিস্ট-সনাক্ত: আর্টিকেল-থ্রেড (data-post-link মিল) → ফিড-ড্রয়ার (data-comments-for মিল)
    // → সেশন ১২৪: QA-উত্তর-থ্রেড (.qa-answers-list — session116-অবশিষ্ট সমাপ্তি;
    //   সাবমিট-মুহূর্তে বাবল বসে, swapQaThread-রিকনসাইল ক্যানোনিকাল-বিন্যাসে সাজায়)
    var list = null;
    var isQaList = false;
    document.querySelectorAll('.comments-list[data-post-link]').forEach(function (el) {
      var p = String(el.getAttribute('data-post-link') || '').replace(/^.*\//, '');
      if (!list && p === String(postId)) list = el;
    });
    if (!list && postId) {
      var drawer = document.querySelector('.fc-drawer[data-comments-for="' + String(postId).replace(/"/g, '') + '"]');
      if (drawer) list = drawer.querySelector('.fc-list');
    }
    /* union-নোট (session124×125): সমান্তরাল session125-এন্ট্রি নিজের .qa-answers-list-
       টার্গেট-কপি প্রত্যাহার করেছিল (canonical-প্রাইমারি-যুক্তি); কিন্তু session124-canonical-
       এজেন্টের swapQaThread-union-নোট নিজেই insertOptimistic-এর qa-টার্গেটকে "সোয়াপ-পূর্ব
       তাৎক্ষণিক-বাবলের" উৎস বলে বর্ণনা করে + "অনন্য-রক্ষিত" তালিকাভুক্ত — তাই ব্রাঞ্চটি বজায়:
       j.html-প্রাইমারি-পাথে অস্পৃশ্য (insertCanonical124 আগেই return), শুধু j.html-অনুপস্থিতি-
       ফলব্যাকে QA-বাবলও তাৎক্ষণিক বসে (আর্টিকেল-প্যাটার্ন প্যারিটি)। */
    if (!list && postId) {
      document.querySelectorAll('.qa-answers-list[data-post-link]').forEach(function (el) {
        var p = String(el.getAttribute('data-post-link') || '').replace(/^.*\//, '');
        if (!list && p === String(postId)) { list = el; isQaList = true; }
      });
    }
    if (!list) return false;
    var html = buildOptimisticItem(id, raw, parentId);
    if (!html) return false;
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    var node = wrap.firstElementChild;
    if (!node) return false;
    // সেশন ১২৪: QA-টপ-লেভেল উত্তর — সার্ভার-সত্যের মতোই .qa-answer-slot#answer-<id>
    // র‍্যাপারে; প্রথম-উত্তরে খালি-স্টেট (.answers-empty) সঙ্গে সঙ্গেই সরে।
    var slotNode = null;
    if (isQaList && !parentId) {
      slotNode = document.createElement('div');
      slotNode.className = 'qa-answer-slot';
      slotNode.id = 'answer-' + String(id).replace(/"/g, '');
      slotNode.appendChild(node);
      /* সেশন ১৩৫: প্রশ্নকর্তার টগল-বাটন তাৎক্ষণিক (session131-নোট ③ — swap-অবধি
         ট্রানজিয়েন্ট-অনুপস্থিতি বন্ধ)। j.id বাস্তব — এই-উইন্ডোতে ক্লিকও সার্ভার-সত্য। */
      var _acc135 = mkAccActions135(list, id);
      if (_acc135) slotNode.appendChild(_acc135);
    }
    if (parentId) {
      var parent = list.querySelector('.cmt-item[data-cmt-id="' + String(parentId).replace(/"/g, '') + '"]');
      if (parent) {
        var nest = parent.querySelector('.cmt-replies');
        if (!nest) {
          nest = document.createElement('div');
          nest.className = 'cmt-replies';
          parent.querySelector('.fc-main').appendChild(nest);
        }
        nest.appendChild(node);
        if (nest.hidden !== undefined) nest.hidden = false;
      } else {
        list.appendChild(slotNode || node); // প্যারেন্ট-না-মেললে টপ-লেভেলে — reconcile ঠিক করবে
      }
    } else {
      list.appendChild(slotNode || node);
    }
    (slotNode || node).classList.add('opt-fresh');
    if (isQaList && !parentId) {
      var empty124 = list.querySelector('.answers-empty');
      if (empty124) empty124.remove();
    }
    optBumpCounters(1);
    // সেশন ১২: ফিড-কার্ডের as-stat-ও তাৎক্ষণিক বাম্প (reconcile-এ refreshDrawer-সিঙ্কও আছে)
    var card12 = node.closest('.feed-card, article');
    if (card12) {
      var stat12 = card12.querySelector('.as-stat[title="মন্তব্য"] span:first-child');
      if (stat12) {
        var cur12 = optParseBn(stat12.textContent);
        if (!Number.isNaN(cur12)) stat12.textContent = bnNum(cur12 + 1);
      }
    }
    return true;
  }

  /* ── সেশন ১৩৫: গৃহীত-উত্তর টগল-বাটন (acc-actions127) fresh-উত্তরে —
     session131-নোট ③ পূর্ণ: প্রশ্নকর্তা/অ্যাডমিনের নতুন-উত্তরেই টগল দৃশ্যমান
     (আগে swapQaThread-reconcile-অবধি অনুপস্থিত)। চুক্তি: qa-single.ejs-এর
     .qa-answers-list[data-can-acc135="1"]-মার্কার = দর্শক প্রশ্নকর্তা/অ্যাডমিন।
     বাটন qa-single-এর list-ডেলিগেটেড-লিসনারেই চলে — রিবাইন্ড-শূন্য;
     setState চিপ/হিন্ট নিজেই তৈরি করে বলে খালি-স্লট-টগলও নিরাপদ। */
  function mkAccActions135(list, cId) {
    try {
      if (!list || list.getAttribute('data-can-acc135') !== '1') return null;
      if (!cId || !/^\d+$/.test(String(cId))) return null;
      var qid = list.getAttribute('data-post-id') || String(list.getAttribute('data-post-link') || '').split('/').pop();
      if (!qid) return null;
      var acts = document.createElement('div');
      acts.className = 'acc-actions127';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'acc-btn127';
      btn.setAttribute('data-acc127', '');
      btn.setAttribute('data-qid', String(qid));
      btn.setAttribute('data-cid', String(cId));
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i><span>গ্রহণ করুন</span>';
      acts.appendChild(btn);
      return acts;
    } catch (_) { return null; }
  }

  /* ── সেশন ১২৪: ক্যানোনিকাল তাৎক্ষণিক-ইনসার্ট ইঞ্জিন — POST /api/comment-এর
     সার্ভার-রেন্ডার্ড CommentItem-HTML সরাসরি DOM-এ বসানো। লিস্ট-সনাক্ত
     insertOptimistic-এর নিয়মেই (data-post-link postId-মিল → ড্রয়ার data-comments-for);
     qa-তালিকায় .qa-answer-slot#answer-N-র‍্যাপ (নোটিফ-অ্যাঙ্কর-চুক্তি session116);
     রিপ্লাই = প্যারেন্টের .cmt-replies (qa-তে স্লটের ভাই-নোড — qa-single-প্যারাডাইম)।
     ফেরত: বসানো-নোড (qa-তে স্লট) — ব্যর্থতায় null (session12-ফলব্যাক-পথে)। */
  function insertCanonical124(form, html, parentId) {
    var tmp = document.createElement('div');
    tmp.innerHTML = String(html || '').trim();
    var node = tmp.firstElementChild;
    if (!node) return null;
    var cId = node.getAttribute('data-cmt-id') || '';
    var postId = form.getAttribute('data-post-id');

    // লিস্ট-সনাক্ত (session12-নিয়ম: পোস্ট-id-মিল জরুরি — ফিডে বহু-কার্ড)
    var list = null;
    document.querySelectorAll('.comments-list[data-post-link], .qa-answers-list[data-post-link]').forEach(function (el) {
      var p = String(el.getAttribute('data-post-link') || '').replace(/^.*\//, '');
      if (!list && p === String(postId)) list = el;
    });
    if (!list && postId) {
      var drawer0 = document.querySelector('.fc-drawer[data-comments-for="' + String(postId).replace(/"/g, '') + '"]');
      if (drawer0) list = drawer0.querySelector('.fc-list');
    }
    if (!list) {
      var drawerF = form.closest('.fc-drawer');
      if (drawerF) list = drawerF.querySelector('.fc-list');
    }
    if (!list) return null;

    // রিপ্লাই — প্যারেন্ট-বাবলের ভেতরে
    if (parentId) {
      var parent = list.querySelector('.cmt-item[data-cmt-id="' + String(parentId).replace(/"/g, '') + '"]') ||
                   document.getElementById('fc-c' + parentId);
      if (parent) {
        var qaSlot = parent.closest('.qa-answer-slot');
        if (qaSlot) { qaSlot.appendChild(node); return node; }
        var nest = parent.querySelector('.cmt-replies');
        if (!nest) {
          nest = document.createElement('div');
          nest.className = 'cmt-replies';
          var main = parent.querySelector('.fc-main');
          (main || parent).appendChild(nest);
        }
        nest.hidden = false;
        nest.appendChild(node);
        return node;
      }
      /* প্যারেন্ট-না-মেললে টপ-লেভেল-এই পড়ুক (session12-চুক্তি — reconcile ঠিক করবে) */
    }

    // qa-তালিকা — স্লট-র‍্যাপ বাধ্যতামূলক
    if (list.classList && list.classList.contains('qa-answers-list')) {
      var slot = document.createElement('div');
      slot.className = 'qa-answer-slot';
      if (cId) slot.id = 'answer-' + cId;
      slot.appendChild(node);
      /* সেশন ১৩৫: প্রশ্নকর্তার টগল-বাটন ক্যানোনিকাল-স্লটেও (data-cmt-id = সার্ভার-সত্য) */
      var _accC135 = mkAccActions135(list, cId);
      if (_accC135) slot.appendChild(_accC135);
      node = slot;
      var emp = document.querySelector('.answers-empty');
      if (emp) emp.remove();
    } else {
      var none = list.querySelector('.fc-none');
      if (none) none.remove();
    }
    list.appendChild(node);
    return node;
  }

  /* ── সেশন ১২৪: কাউন্টার-সিঙ্ক — সার্ভার-সত্য total → সব-সারফেস (SET — বাম্প-নয়;
     optBumpCounters-এর মতোই ডুপ্লিকেট-স্প্যান-গার্ড) ── */
  function syncTotals124(form, total) {
    if (typeof total !== 'number') return;
    var seen124 = [];
    document.querySelectorAll('[data-cmt-total], .comments-total').forEach(function (el) {
      if (seen124.indexOf(el) !== -1) return;
      seen124.push(el);
      el.textContent = bnNum(total);
    });
    var card124 = form.closest('.feed-card, article');
    if (card124) {
      var stat124 = card124.querySelector('.as-stat[title="মন্তব্য"] span:first-child');
      if (stat124) stat124.textContent = bnNum(total);
    }
  }

  /* ── ৬. কম্পোজার-সাবমিট (ডেলিগেটেড — ফিড-ড্রয়ার + আর্টিকেল-পেজ) ─────── */
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!(form instanceof HTMLFormElement) || !form.classList.contains('cc-form')) return;
    e.preventDefault();
    var ta = form.querySelector('.cc-input');
    var body = ta ? ta.value.trim() : '';
    if (!body) return;
    var send = form.querySelector('.cc-send');
    if (send) { send.disabled = true; send.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }

    var payload = { post_id: form.getAttribute('data-post-id'), body: body };
    var parentId = form.getAttribute('data-parent-id');
    if (parentId) payload.parent_id = parentId;

    fetch('/api/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok) {
          if (window.showToast) showToast('মন্তব্য পাঠানো যায়নি', 'error');
          else alert('মন্তব্য পাঠানো যায়নি');
          if (send) { send.disabled = false; send.innerHTML = '<i class="fas fa-paper-plane"></i>'; }
          return;
        }
        ta.value = '';
        ta.style.height = 'auto';
        var bubble = form.querySelector('.cc-bubble');
        if (bubble) closeMention(bubble);
        if (send) { send.innerHTML = '<i class="fas fa-paper-plane"></i>'; }

        /* ── সেশন ১২৪: ক্যানোনিকাল তাৎক্ষণিক-ইনসার্ট-পথ (প্রধান) — POST /api/comment
            এখন সার্ভার-রেন্ডার্ড একক CommentItem-HTML + সত্য-total ফেরত দেয়; এক
            রাউন্ডট্রিপেই পিক্সেল-নির্ভুল ক্যানোনিকাল-বাবল (প্যালেট/৩-ডট/ব্যাজ/ক্যানএডিট)
            DOM-এ বসে — রিফেচ-রিকনসাইল-শূন্য। j.html-না-এলে session12-অপটিমিস্টিক
            ফলব্যাক (নিচে — অপরিবর্তিত চুক্তি)। ── */
        if (j.html) {
          var node124 = insertCanonical124(form, j.html, parentId);
          if (node124) {
            node124.classList.add('is-new124');
            setTimeout(function () { node124.classList.remove('is-new124'); }, 1300);
            syncTotals124(form, j.total);
            if (window.showToast) showToast('মন্তব্য প্রকাশিত হয়েছে ✓', 'success');
            var slot124 = form.closest('.fc-reply-slot');
            if (slot124) { slot124.hidden = true; slot124.innerHTML = ''; }
            /* ফিড-ড্রয়ারে প্রিভিউ/স্ট্যাট-রিকনসাইল (নীরব — কনটেন্ট-অভিন্ন, ফ্ল্যাশ-শূন্য);
               আর্টিকেল/কিউঅ্যান্ডএ-তালিকায় রিফেচ-ই-লাগে না (insert-ই সার্ভার-সত্য) */
            var drawer124 = form.closest('.fc-drawer');
            if (drawer124) refreshDrawer(drawer124, drawer124.getAttribute('data-comments-for'));
            return;
          }
        }

        /* সেশন ১২ (অপটিমিস্টিক-UI): সার্ভার-রিফেচের আগেই বাবল তাৎক্ষণিক বসে —
           j.id বাস্তব তাই প্যালেট/৩-ডট/রিপ্লাই সঙ্গে সঙ্গেই সক্রিয়;
           পরক্ষণে ক্যানোনিকাল-HTML reconcile করে (নিচের refresh*)।
           টোস্ট এখানেই একবার — refresh*-এ ডাবল-টোস্ট হয় না। */
        var shown = insertOptimistic(j.id, body, parentId, form.getAttribute('data-post-id'));
        if (window.showToast) showToast('মন্তব্য প্রকাশিত হয়েছে ✓', 'success');

        var drawer = form.closest('.fc-drawer');
        if (drawer) {
          // ফিড-ড্রয়ার: লিস্ট-রিফ্রেশ (ক্যানোনিকাল CommentItem-HTML) — রিলোড নেই
          refreshDrawer(drawer, drawer.getAttribute('data-comments-for'));
          var slot = form.closest('.fc-reply-slot');
          if (slot) { slot.hidden = true; slot.innerHTML = ''; }
        } else if (refreshArticleThread(form)) {
          // আর্টিকেল-পেজ (সেশন ১০৫): রিলোড-নেই — ক্যানোনিকাল-HTML থ্রেড-সোয়াপ
        } else if (swapQaThread(form.getAttribute('data-post-id'), null)) {
          // QA-উত্তর-পেজ (সেশন ১২৩-ক্যানোনিকাল): রিলোড-নেই — চিপ/স্লট-সহ সার্ভার-সত্য সোয়াপ
          // (union-নোট session124: আমার insertOptimistic qa-টার্গেট তাৎক্ষণিক-বাবল দেয়,
          //  এই সোয়াপ সেটিকে ক্যানোনিকাল-করে — আমার reconcileQa123 ডেড-ব্রাঞ্চ প্রত্যাহৃত)
        } else if (!shown) {
          // লিগ্যাসি থ্রেড-পেজ ফলব্যাক: সার্ভার-রেন্ডার্ড রিলোড
          setTimeout(function () { location.reload(); }, 450);
        }
      })
      .catch(function () {
        if (send) { send.disabled = false; send.innerHTML = '<i class="fas fa-paper-plane"></i>'; }
        if (window.showToast) showToast('নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন', 'error');
      });
  });

  /* ── ৬. সেশন ১০৫: ক্যানোনিকাল CommentItem-আচরণ (রুল-২) + রিঅ্যাক্টরস-মডাল ── */

  // ৬.a-ক (সেশন ১২১): QA-উত্তর-থ্রেড-সোয়াপ — .qa-answers-list[data-post-link] থাকলে
  // ?format=qa-html (qa-single-এর সার্ভার-সত্য: like_count DESC-অর্ডার + top-answer-chip
  // + compact-রিপ্লাই, ক্যানোনিকাল CommentItem-ই রেন্ডারার) — রিলোড-নেই; চিপ
  // AJAX-রিফ্রেশ-পরেও টেকনামী (session113-বকেয়া ③)। qaHtml-না-এলে রিলোড-ফলব্যাক।
  function swapQaThread(postId, toastMsg) {
    var list = document.querySelector('.qa-answers-list[data-post-link]');
    if (!list) return false;
    if (!postId) postId = list.getAttribute('data-post-id') || '';
    if (!postId) return false;
    /* সেশন ১৩৫: সোয়াপ-ফ্ল্যাশ-মসৃণকরণ — ফেচ-চলাকালে মৃদু-ডিম, সোয়াপ-শেষে ফেড-ব্যাক
       (reconcile-ফ্ল্যাশ-মসৃণকরণ — session125/129-রৈখিক-সুপারিশ) */
    list.classList.add('qa-swap-fade135');
    fetch('/api/comments?post_id=' + postId + '&format=qa-html')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        /* session124-union (আমার-অনন্য ডেল্টা — ক্যানোনিকাল 7ad5fb3 swapQaThread-এ হাত দেয়নি):
           typeof-চেক (আগে truthiness ছিল) — শূন্য-উত্তরে qaHtml:'' ফলসি হয়ে অযথা
           reload-ফলব্যাকে পড়ত; খালি-স্ট্রিংও বৈধ সার্ভার-সত্য। */
        if (j && typeof j.qaHtml === 'string') {
          list.innerHTML = j.qaHtml;
          /* সেশন ১৩৫: সোয়াপ-শেষে ফেড-ব্যাক (qa-swap-fade135 অপসারণ — CSS-ট্রানজিশন) */
          requestAnimationFrame(function () { list.classList.remove('qa-swap-fade135'); });
          // session124 বাগ-ফিক্স: .answers-empty লিস্টের বাইরের-সিবলিং — শূন্য-প্রশ্নে
          // প্রথম AJAX-উত্তরের পরেও "এখনো কোনো উত্তর নেই" লেগে থাকত; swap-সফলে অপসারণ।
          // (submit-পাথে insertCanonical124 নিজেই সরায় — এখানে ডিলিট/চিপ-পাথ।)
          var es124 = document.querySelector('.answers-empty');
          if (es124) es124.remove();
          var tot = document.querySelector('.comments-total');
          if (tot && typeof (j && j.total) === 'number') tot.textContent = bnNum(j.total);
          // session124 ফলব্যাক-উল্টো: শেষ-উত্তর-মুছে-গেলে qaHtml খালি → ফাঁকা-তালিকা
          // নয় — সার্ভার-মার্কআপের মিরর হিসেবে empty-state ঢোকানো (qaHtml-এ এটি নেই)
          if (!j.total) {
            var es2124 = document.createElement('div');
            es2124.className = 'empty-state answers-empty';
            es2124.innerHTML = '<i class="fas fa-reply-all" aria-hidden="true"></i><p>এখনো কোনো উত্তর নেই। প্রথম উত্তরদাতা হোন!</p>';
            list.appendChild(es2124);
          }
          if (toastMsg && window.showToast) showToast(toastMsg, 'success');
        } else { location.reload(); }
      })
      .catch(function () { location.reload(); });
    return true;
  }

  // ৬.a আর্টিকেল-থ্রেড-রিফ্রেশ (রিলোড-নেই) — .comments-list[data-post-link] থাকলে
  // (টোস্ট নেই — সেশন ১২: সাবমিট-হ্যান্ডলারে অপটিমিস্টিক-ইনসার্টের সাথেই একবার দেখানো হয়)
  function refreshArticleThread(form) {
    var list = document.querySelector('.comments-list[data-post-link]');
    if (!list) return false;
    var postId = form.getAttribute('data-post-id');
    var slot = form.closest('.fc-reply-slot');
    fetch('/api/comments?post_id=' + postId + '&format=html')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.html) list.innerHTML = j.html;
        // সেশন ১২: সব-কাউন্টার-স্প্যান সিঙ্ক (উভয়-হুক: data-cmt-total + .comments-total)
        if (typeof (j && j.total) === 'number') {
          var seen12 = [];
          document.querySelectorAll('[data-cmt-total], .comments-total').forEach(function (el) {
            if (seen12.indexOf(el) !== -1) return;
            seen12.push(el);
            el.textContent = bnNum(j.total);
          });
        }
      })
      .catch(function () { location.reload(); });
    return true;
  }

  /* ── সেশন ১২৪ union-নোট: আমার সমান্তরাল reconcileQa123 (append-only id-diff)
     প্রত্যাহৃত — session123-ক্যানোনিকালের swapQaThread (format=qa-html সার্ভার-সত্য
     সোয়াপ) একই-গ্রাউন্ড কভার করে এবং সাবমিট-চেইনে আগেই মিলে যায় (ডেড-ব্রাঞ্চ-শূন্য)।
     অনন্য-রক্ষিত (এ-ফাইলে): insertOptimistic-এর .qa-answers-list ৩-তম-টার্গেট +
     .qa-answer-slot#answer-<id> র‍্যাপার + .answers-empty সরানো — সোয়াপ-পূর্ব
     তাৎক্ষণিক-বাবল (আর্টিকেল-প্যাটার্ন প্যারিটি)। ── */

  // ৬.b কমেন্ট-রিঅ্যাকশন (রুল-২②) — টেক্সট-লাইক টগল + হোভার-প্যালেট → /api/react
  function reactComment105(cid, type) {
    return fetch('/api/react', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_type: 'comment', target_id: Number(cid), reaction_type: type })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || j.ok === false) { if (window.showToast) showToast('রিঅ্যাকশন সম্ভব হয়নি', 'error'); return; }
      var meta = { like: '👍', love: '❤️', care: '🤗', haha: '😂', wow: '😮', sad: '😢', angry: '😡' };
      var labels = { like: 'লাইক', love: 'ভালোবাসা', care: 'কেয়ার', haha: 'হাহা', wow: 'বিস্ময়', sad: 'দুঃখ', angry: 'রাগ' };
      var mine = j.mine;
      var item = document.getElementById('fc-c' + cid);
      if (item) {
        var badge = item.querySelector('.cmt-badge');
        if (badge) {
          if ((j.total || 0) > 0) {
            badge.hidden = false;
            badge.innerHTML = '<span class="cmt-badge-emoji">' + (mine ? (meta[mine] || '👍') : '👍') + '</span><span class="cmt-badge-count">' + bnNum(j.total) + '</span>';
          } else { badge.hidden = true; badge.innerHTML = ''; }
        }
        var lb = item.querySelector('.cmt-like');
        if (lb) {
          lb.classList.toggle('is-mine', !!mine);
          lb.setAttribute('data-mine', mine || '');
          lb.textContent = mine ? (labels[mine] || 'রিঅ্যাক্টেড') : 'লাইক';
        }
        item.querySelectorAll('.cmt-palette-opt').forEach(function (o) {
          o.classList.toggle('selected', o.getAttribute('data-cmt-react') === mine);
        });
      }
    }).catch(function () { if (window.showToast) showToast('নেটওয়ার্ক সমস্যা', 'error'); });
  }

  document.addEventListener('click', function (e) {
    var likeBtn = e.target.closest('.cmt-like');
    if (likeBtn) {
      e.preventDefault();
      var _cid = likeBtn.getAttribute('data-cmt-react-toggle');
      var _mine = likeBtn.getAttribute('data-mine');
      // টগল: mine থাকলে সেই-টাইপ-আবার-পাঠানো = API-র টগল-অফ-পাথ (session101 চুক্তি)
      reactComment105(_cid, _mine || 'like');
      return;
    }
    var opt = e.target.closest('.cmt-palette-opt');
    if (opt) {
      e.preventDefault();
      reactComment105(opt.getAttribute('data-cmt-id'), opt.getAttribute('data-cmt-react'));
    }
  });

  // ৬.c কমেন্ট ৩-ডট: সম্পাদনা (ইনলাইন-এডিটবক্স) ও মুছে ফেলা (রুল-২①)
  document.addEventListener('click', function (e) {
    var edBtn = e.target.closest('[data-cmt-edit]');
    if (edBtn) {
      e.preventDefault();
      closeAllMenus(null);
      var item = document.getElementById('fc-c' + edBtn.getAttribute('data-cmt-edit'));
      var bodyEl = item && item.querySelector('.fc-body');
      if (!bodyEl || item.querySelector('.cmt-editbox')) return;
      var rawText = bodyEl.getAttribute('data-raw') || bodyEl.textContent.trim(); /* data-raw-প্রি-ফিল (session107-চুক্তি) */
      var box = document.createElement('div');
      box.className = 'cmt-editbox';
      box.innerHTML = '<textarea maxlength="2000"></textarea>' +
        '<span class="cmt-edit-actions"><button type="button" class="cmt-edit-save">সংরক্ষণ</button>' +
        '<button type="button" class="cmt-edit-cancel">বাতিল</button></span>';
      box.querySelector('textarea').value = rawText;
      bodyEl.hidden = true;
      bodyEl.parentNode.insertBefore(box, bodyEl.nextSibling);
      var ta = box.querySelector('textarea');
      ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
      box.querySelector('.cmt-edit-cancel').addEventListener('click', function () { box.remove(); bodyEl.hidden = false; });
      box.querySelector('.cmt-edit-save').addEventListener('click', function () {
        var val = ta.value.trim();
        if (!val) return;
        fetch('/api/comments/' + edBtn.getAttribute('data-cmt-edit'), {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: val })
        }).then(function (r) { return r.json(); }).then(function (j) {
          if (j && j.ok) {
            bodyEl.innerHTML = j.bodyHtml || esc(val);
            // সেশন ১২১ 🚨ডেটা-লস-ফিক্স: সেভের পর data-raw/RAW_CACHE আপডেট ছিল না —
            // পুনঃ-এডিটে প্রথম-সংস্করণ প্রি-ফিল হয়ে প্রথম-সম্পাদনা নীরবে হারাত।
            // পুরনো-ইঞ্জিন startEdit (লাইন ~৬৯৯/৭০৭) এটা করত — ক্যানোনিকাল-পথেও সমতা।
            bodyEl.setAttribute('data-raw', val);
            bodyEl.removeAttribute('data-lpv'); /* সেশন ১৩৯: সম্পাদনায় নতুন-লিংক হলে og-কার্ড পুনঃ-স্ক্যান (observer-চুক্তি) */
            try { RAW_CACHE[edBtn.getAttribute('data-cmt-edit')] = val; } catch (_) {}
            pulseSaved(item); // সেশন ১২১: সেভ-স্বীকৃতি-পালস (ক্যানোনিকাল-পথেও)
            var ed = item.querySelector('.fc-edited');
            if (!ed) { ed = document.createElement('span'); ed.className = 'fc-edited'; ed.textContent = 'সম্পাদিত'; bodyEl.parentNode.appendChild(ed); }
            box.remove(); bodyEl.hidden = false;
            if (window.showToast) showToast('মন্তব্য সম্পাদিত ✓', 'success');
          } else if (window.showToast) showToast('সম্পাদনা সম্ভব হয়নি', 'error');
        }).catch(function () { if (window.showToast) showToast('নেটওয়ার্ক সমস্যা', 'error'); });
      });
      return;
    }
    var delBtn = e.target.closest('[data-cmt-delete]');
    if (delBtn) {
      e.preventDefault();
      closeAllMenus(null);
      var cidD = delBtn.getAttribute('data-cmt-delete');
      if (!window.confirm('নিশ্চিত? এই মন্তব্যটি মুছে যাবে।')) return;
      fetch('/api/comments/' + cidD, { method: 'DELETE' })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (j && j.ok) {
            var it = document.getElementById('fc-c' + cidD);
            // সেশন ১২৩: cardD/ড্রয়ার অ্যানিমেশন-শুরুর আগেই ক্যাপচার (killItem-এর remove-পরে closest ব্যর্থ)
            var cardD = it ? it.closest('.feed-card, article') : null;
            if (swapQaThread('', null)) {
              // সেশন ১২২: QA-উত্তর-পেজ — সার্ভার-সত্য সোয়াপ; হাতে-সিঙ্ক অপ্রয়োজনীয়
              // (empty-slot-অবশেষ নেই, চিপ/অর্ডার like_count-DESC-এ পুনর্বিন্যস্ত)
            } else {
            var dwD = cardD ? cardD.querySelector('.fc-drawer[data-comments-for]') : null;
            // সেশন ১২৩: তাৎক্ষণিক remove-এর বদলে মৃত্যু-অ্যানিমেশন — কাউন্টার-সিঙ্ক অ্যানিমেশন-শেষে
            killItem(it, function () {
              try {
              // সেশন ১১১: কাউন্টার-সিঙ্ক — পুরনো-ইঞ্জিন deleteComment-এর মতোই
              // ([data-cmt-total]/.comments-total + data-cm-count-রিকাউন্ট) —
              // আগে ক্যানোনিকাল-পথে ডিলিটে হেডার-কাউন্টার স্টেল থাকত।
              // সেশন ১২: উভয়-হুকেই সিঙ্ক + ফিড-কার্ডের as-stat-ও (স্টেল-বাগ)।
              var totD = (typeof j.total === 'number') ? j.total : null;
              if (totD !== null) {
                document.querySelectorAll('[data-cmt-total], .comments-total').forEach(function (el) {
                  el.textContent = bnNum(totD);
                });
                if (cardD) {
                  var statD = cardD.querySelector('.as-stat[title="মন্তব্য"] span:first-child');
                  if (statD) statD.textContent = bnNum(totD);
                }
              }
              document.querySelectorAll('[data-cm-count]').forEach(function (cEl) {
                var sel = cEl.getAttribute('data-cm-count');
                if (sel) cEl.textContent = bnNum(document.querySelectorAll(sel).length);
              });
              // সেশন ১২: খোলা-ড্রয়ারে ডিলিট হলে প্রিভিউ-বাবলও স্টেল থাকত —
              // লোডেড-ড্রয়ার রিফ্রেশ (ক্যানোনিকাল-HTML + syncPreview + as-stat)।
              // সেশন ১২৩: ড্রয়ার-রেফারেন্স অ্যানিমেশন-আগে-ক্যাপচারকৃত (dwD)।
              if (dwD && dwD.dataset.loaded) refreshDrawer(dwD, dwD.getAttribute('data-comments-for'));
              } catch (_) {}
            });
            }
            if (window.showToast) showToast('মন্তব্য মুছে ফেলা হয়েছে', 'success');
          } else if (window.showToast) showToast('মোছা যায়নি', 'error');
        })
        .catch(function () { if (window.showToast) showToast('নেটওয়ার্ক সমস্যা', 'error'); });
    }
  });

  // ৬.d রিঅ্যাক্টরস-মডাল (রুল-১) — কাউন্টার-বারের [data-rx-open] ক্লিকে লেজি-ফেচ
  var RX_META = { like: '👍', love: '❤️', care: '🤗', haha: '😂', wow: '😮', sad: '😢' };
  function renderRxList(list, users, filter) {
    var rows = users.filter(function (u) { return filter === 'all' || u.reaction === filter; });
    if (!rows.length) { list.innerHTML = '<div class="lf-rxm-empty">এই প্রতিক্রিয়া এখনো নেই</div>'; return; }
    list.innerHTML = rows.map(function (u) {
      return '<a class="lf-rxm-row" href="/profile/' + esc(u.username) + '">' +
        '<img class="lf-rxm-av" src="' + esc(u.avatar_url) + '" alt="" onerror="this.src=\'/assets/img/avatar-placeholder.svg?v=2\'">' +
        '<span class="lf-rxm-info"><span class="lf-rxm-name">' + esc(u.name) + '</span>' +
        '<span class="lf-rxm-sub">@' + esc(u.username) + '</span></span>' +
        '<span class="lf-rxm-emoji">' + (RX_META[u.reaction] || '👍') + '</span></a>';
    }).join('');
  }

  /* ═══ সেশন ১১২: Facepile-অ্যাভাটার-মোড (ইউজার-স্পেসিফিকেশন — additive) ═══
     localStorage 'rxm110view' গ্লোবাল reactors-modal.js-এর সাথে শেয়ার্ড;
     গ্রিড-মার্কআপ .rxm-fgrid/.rxm-fcell (style.css session110-ব্লক) রিইউজ। */
  var LF_VIEW_KEY = 'rxm110view';
  function lfStoredMode() {
    try { var v = localStorage.getItem(LF_VIEW_KEY); return v === 'list' ? 'list' : 'facepile'; } catch (e) { return 'facepile'; }
  }
  function lfSaveMode(m) { try { localStorage.setItem(LF_VIEW_KEY, m); } catch (e) { /* নিরীহ */ } }
  var lfRxMode = lfStoredMode();
  var lfRxUsers = [];
  var lfRxFilter = 'all';

  function lfFirstName(u) {
    var d = String(u.pen_name || u.name || '').trim();
    return d ? d.split(' ')[0] : 'ইউজার';
  }
  function lfPaintMode() {
    var modal = document.getElementById('reactorsModal');
    if (!modal) return;
    var fp = modal.querySelector('[data-lffacepile]');
    var list = modal.querySelector('.lf-rxm-list');
    var seg = modal.querySelector('.lf-rxm-modeseg');
    if (seg) seg.querySelectorAll('.rxm-modebtn').forEach(function (b) {
      var on = (b.getAttribute('data-lfmode') || '') === lfRxMode;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (fp && list) {
      fp.hidden = lfRxMode !== 'facepile';
      list.hidden = lfRxMode === 'facepile';
      if (lfRxMode === 'facepile') lfRenderFacepile(fp, lfRxUsers, lfRxFilter);
    }
  }
  function lfRenderFacepile(fp, users, filter) {
    var rows = users.filter(function (u) { return filter === 'all' || u.reaction === filter; });
    if (!rows.length) { fp.innerHTML = '<div class="lf-rxm-empty" style="grid-column:1/-1">এই প্রতিক্রিয়া এখনো নেই</div>'; return; }
    fp.innerHTML = rows.map(function (u) {
      return '<a class="rxm-fcell" href="/profile/' + esc(u.username) + '" tabindex="0">' +
        '<span class="rxm-favwrap">' +
          '<img class="rxm-fav" loading="lazy" decoding="async" src="' + esc(u.avatar_url) + '" alt="" onerror="this.src=\'/assets/img/avatar-placeholder.svg?v=2\'">' +
          '<span class="rxm-fbadge">' + (RX_META[u.reaction] || '👍') + '</span>' +
        '</span>' +
        '<span class="rxm-fname">' + esc(lfFirstName(u)) + '</span>' +
        '<span class="rxm-ftip" role="tooltip"><strong>' + esc(u.name || '') + '</strong></span>' +
      '</a>';
    }).join('');
  }

  function openReactorsModal(type, id) {
    var modal = document.getElementById('reactorsModal');
    if (!modal) return;
    modal.hidden = false;
    var list = modal.querySelector('.lf-rxm-list');
    var tabs = modal.querySelector('.lf-rxm-tabs');
    list.innerHTML = '<div class="lf-rxm-empty"><i class="fas fa-spinner fa-spin"></i></div>';
    tabs.innerHTML = '';
    fetch('/api/reactions/' + type + '/' + id)
      .then(function (r) { return r.json(); })
      .then(function (j) {
        var users = j.users || [];
        var counts = j.counts || {};
        lfRxUsers = users;
        var tabsHtml = '<button type="button" class="lf-rxm-tab active" data-rx-filter="all">সব <span>' + bnNum(j.total || users.length) + '</span></button>';
        Object.keys(counts).forEach(function (k) {
          if (counts[k] > 0) tabsHtml += '<button type="button" class="lf-rxm-tab" data-rx-filter="' + k + '">' + (RX_META[k] || '👍') + ' <span>' + bnNum(counts[k]) + '</span></button>';
        });
        tabs.innerHTML = tabsHtml;
        renderRxList(list, users, 'all');
        lfPaintMode(); // সেশন ১১২: সংরক্ষিত-মোডে ফেসপাইল/তালিকা পেইন্ট
        tabs.onclick = function (ev) {
          var b = ev.target.closest('.lf-rxm-tab');
          if (!b) return;
          tabs.querySelectorAll('.lf-rxm-tab').forEach(function (x) { x.classList.toggle('active', x === b); });
          lfRxFilter = b.getAttribute('data-rx-filter') || 'all';
          renderRxList(list, users, lfRxFilter);
          lfPaintMode();
        };
      })
      .catch(function () { list.innerHTML = '<div class="lf-rxm-empty">লোড করা যায়নি — আবার চেষ্টা করুন</div>'; });
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-rxm-close]')) {
      var m = document.getElementById('reactorsModal');
      if (m) m.hidden = true;
      return;
    }
    var t = e.target.closest('[data-rx-open]');
    if (!t) return;
    e.preventDefault();
    openReactorsModal(t.getAttribute('data-rx-open'), t.getAttribute('data-rx-id'));
  });
  // সেশন ১১২: মোড-সুইচার ডেলিগেশন (এই মডালের ভেতরের বাটন)
  document.addEventListener('click', function (e) {
    var mb = e.target.closest('[data-lfmode]');
    if (!mb) return;
    var seg = mb.closest('.lf-rxm-modeseg');
    if (!seg) return;
    lfRxMode = mb.getAttribute('data-lfmode') === 'list' ? 'list' : 'facepile';
    lfSaveMode(lfRxMode);
    lfPaintMode();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var m = document.getElementById('reactorsModal');
    if (m && !m.hidden) m.hidden = true;
  });
  // কাউন্টার-বার কীবোর্ড-অ্যাক্সেস (role=button span)
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var t = e.target.closest && e.target.closest('.as-rx-trigger');
    if (!t) return;
    e.preventDefault();
    openReactorsModal(t.getAttribute('data-rx-open'), t.getAttribute('data-rx-id'));
  });

  /* ═════════════════════════════════════════════════════════════════════════
     সেশন ১৩৯: og-স্টাইল লিংক-প্রিভিউ কার্ড (session135-ব্যাকলগ — পারমালিঙ্কের
     প্রাকৃতিক-উত্তরণ)। কমেন্ট-বডির অভ্যন্তরীণ-লিংক (articles/qa/resources/
     কমেন্ট-অ্যাঙ্কর #fc-cN) → GET /api/link-preview?u=… → বাবলের ভেতরে কার্ড।
     ইন্টিগ্রেশন-চুক্তি:
       • প্রতি .fc-body একবারই স্ক্যান (data-lpv="1" গার্ড) — সম্পাদনা-সেভ-পাথ
         bodyEl.removeAttribute('data-lpv') ডাকে, MutationObserver পুনঃ-স্ক্যান করে।
       • প্রতি-ইউনিক-হ্রেফ প্রতি-বডিতে ১টি কার্ড (FB-প্যারিটি); LPV_CACHE গ্লোবাল।
       • 🚨 ডুপ্লিকেট-গার্ডে :not(.lf-og-loading) বাধ্যতামূলক — লোডিং-প্লেসহোল্ডারেও
         data-lpv-u আছে; ছাড়া মাউন্ট নিজের-শিমার-দেখে সাইলেন্ট-রিটার্ন করে
         (E2E-আবিষ্কৃত — শিমার-স্থায়ী-আটকে-যাওয়া-বাগ)।
       • এক্সটার্নাল-লিংকে কার্ড নেই (স্যান্ডবক্স-নেটওয়ার্ক-নির্ভরতা — extension point)।
     ═════════════════════════════════════════════════════════════════════════ */
  var LPV_CACHE139 = {};
  var LPV_INTERNAL_RE139 = /^\/(?:articles|qa|questions|resources)\/\d+(?:[?#][^\s]*)?$/;
  var LPV_TIMER139 = null;

  function lpvMarkOf(href) {
    return (typeof CSS !== 'undefined' && CSS.escape) ? CSS.escape(href) : href.replace(/"/g, '');
  }

  function lpvCardHtml139(href, c) {
    var thumb = c.thumb
      ? '<span class="lf-og-thumb"><img src="' + esc(c.thumb) + '" alt="" loading="lazy" onerror="this.parentNode.classList.add(\'lf-og-noimg\');this.remove()"></span>'
      : '<span class="lf-og-thumb lf-og-noimg"><i class="fas ' + esc(c.icon || 'fa-link') + '" aria-hidden="true"></i></span>';
    return '<a class="lf-ogcard" href="' + esc(href) + '" target="_blank" rel="noopener nofollow">' + thumb +
      '<span class="lf-og-main">' +
        '<span class="lf-og-domain"><i class="fas fa-globe" aria-hidden="true"></i> লেখক ফোরাম · ' + esc(c.label || 'লিংক') + '</span>' +
        '<span class="lf-og-title">' + esc(c.title || '') + '</span>' +
        (c.desc ? '<span class="lf-og-desc">' + esc(c.desc) + '</span>' : '') +
        (c.meta ? '<span class="lf-og-meta">' + esc(c.meta) + '</span>' : '') +
        /* সেশন ১৪৩: rx-ব্যাজ — টার্গেট-কনটেন্টের রিঅ্যাকশন-সত্য (likes-টেবিল — getReactionSummary-এক-সোর্স) */
        (c.rx_total ? '<span class="lf-og-rx" title="প্রতিক্রিয়া"><span class="lf-og-rx-faces" aria-hidden="true">' + esc(c.rx_top || '👍') + '</span>' + esc(c.rx_total) + '</span>' : '') +
      '</span></a>';
  }

  /* সেশন ১৪৩: এক্সটার্নাল domain-chip — এক্সটার্নাল-লিংকের ক্লায়েন্ট-সাইড প্রিভিউ
     (session142-ব্যাকলগ ②; নেটওয়ার্ক-ফেচ-শূন্য — hostname শুধু URL থেকে বের —
     SSRF/স্যান্ডবক্স-নেটওয়ার্ক-নির্ভরতা দুটোই প্রযোজ্য নয়)। গার্ড: data-ext-u
     (og-কার্ডের data-lpv-u থেকে আলাদা — দ্বৈত-সিস্টেম-সংঘর্ষ-শূন্য)। */
  function extChip143(bubble, href) {
    if (!bubble || !bubble.isConnected) return;
    if (bubble.querySelector('.lf-extchip[data-ext-u="' + lpvMarkOf(href) + '"]')) return;
    var host = '';
    try { host = new URL(href).hostname.replace(/^www\./, ''); } catch (e143) { return; }
    if (!host) return;
    bubble.insertAdjacentHTML('beforeend',
      '<a class="lf-extchip" href="' + esc(href) + '" target="_blank" rel="noopener nofollow" data-ext-u="' + esc(href) + '">' +
        '<span class="lf-ext-ico" aria-hidden="true"><i class="fas fa-arrow-up-right-from-square"></i></span>' +
        '<span class="lf-ext-main"><span class="lf-ext-host">' + esc(host) + '</span>' +
        '<span class="lf-ext-label">বাহ্যিক লিংক</span></span></a>');
  }

  function lpvMount139(bubble, href, j) {
    if (!bubble || !bubble.isConnected) return;
    /* বাস্তব-কার্ড-গার্ড — লোডিং-প্লেসহোল্ডার বাদ (নইলে নিজের-শিমার-দেখে ফেরত!) */
    if (bubble.querySelector('.lf-ogcard:not(.lf-og-loading)[data-lpv-u="' + lpvMarkOf(href) + '"]')) return;
    var loading = bubble.querySelector('.lf-ogcard.lf-og-loading[data-lpv-u="' + lpvMarkOf(href) + '"]') ||
                  bubble.querySelector('.lf-ogcard.lf-og-loading[data-lpv-u]');
    if (loading) loading.remove();
    if (!j || !j.ok || !j.card) return;
    var tmp = document.createElement('div');
    tmp.innerHTML = lpvCardHtml139(href, j.card);
    var card = tmp.firstElementChild;
    if (card) { card.setAttribute('data-lpv-u', href); bubble.appendChild(card); }
  }

  function lpvFetch139(bubble, href) {
    /* বাস্তব-কার্ড-গার্ড (লোডিং বাদ) — পুনঃ-স্ক্যানে দ্বৈত-কার্ড-নিষিদ্ধ */
    if (bubble.querySelector('.lf-ogcard:not(.lf-og-loading)[data-lpv-u="' + lpvMarkOf(href) + '"]')) return;
    if (LPV_CACHE139[href]) { lpvMount139(bubble, href, { ok: true, card: LPV_CACHE139[href] }); return; }
    if (bubble.querySelector('.lf-ogcard.lf-og-loading[data-lpv-u="' + lpvMarkOf(href) + '"]')) return; /* ইন-ফ্লাইট */
    bubble.insertAdjacentHTML('beforeend',
      '<span class="lf-ogcard lf-og-loading" data-lpv-u="' + esc(href) + '" aria-hidden="true">' +
        '<span class="lf-og-thumb"></span><span class="lf-og-main">' +
          '<span class="lf-og-domain">&nbsp;</span><span class="lf-og-title">&nbsp;</span><span class="lf-og-desc">&nbsp;</span>' +
        '</span></span>');
    fetch('/api/link-preview?u=' + encodeURIComponent(href))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j && j.ok && j.card) LPV_CACHE139[href] = j.card;
        lpvMount139(bubble, href, j);
      })
      .catch(function () {
        var l = bubble.querySelector('.lf-ogcard.lf-og-loading[data-lpv-u="' + lpvMarkOf(href) + '"]');
        if (l) l.remove();
      });
  }

  function lpvScanBody139(body) {
    if (!body || body.getAttribute('data-lpv') === '1') return;
    var anchors = [].slice.call(body.querySelectorAll('a.a-link'));
    if (!anchors.length) return;
    /* সেশন ১৪৩: বাবল-রিজলুশন — কমেন্টে .fc-bubble, ফিড-পোস্টে .feed-card-body
       (og-কার্ড/চিপ পোস্ট-টেক্সটের নিচে — FB-বসানো) */
    var bubble = body.closest('.fc-bubble') || body.closest('.feed-card-body') || body.parentElement;
    if (!bubble) return;
    var seen = {};
    var hit = false;
    anchors.forEach(function (a) {
      var rawHref = a.getAttribute('href') || '';
      if (seen[rawHref]) return;
      seen[rawHref] = 1;
      /* অরিজিন-স্ট্রিপ আগে-ম্যাচ (same-origin absolute URL-ও অভ্যন্তরীণ) */
      var href = rawHref.replace(/^https?:\/\/[^\/]+/i, '');
      if (LPV_INTERNAL_RE139.test(href)) { hit = true; lpvFetch139(bubble, href); return; }
      /* সেশন ১৪৩: এক্সটার্নাল → domain-chip (ক্লায়েন্ট-সাইড, ফেচ-শূন্য) */
      if (/^https?:\/\//i.test(rawHref)) { hit = true; extChip143(bubble, rawHref); }
    });
    if (hit) body.setAttribute('data-lpv', '1');
  }

  function lpvScanAll139() {
    /* সেশন ১৪৩: .feed-text যোগ — পোস্ট-বডিতেও og-কার্ড/domain-chip (session142-ব্যাকলগ ①) */
    document.querySelectorAll('.fc-body, .feed-text').forEach(lpvScanBody139);
  }

  // MutationObserver — ড্রয়ার-লোড/reconcile/optimistic/canonical-ইনসার্ট সব-পাথ
  // এক-জায়গাতেই ধরে (প্রতিটি পেইন্ট-পাথে হাত না-দিয়ে); ১৫০ms-ডিবাউন্স।
  new MutationObserver(function () {
    clearTimeout(LPV_TIMER139);
    LPV_TIMER139 = setTimeout(lpvScanAll139, 150);
  }).observe(document.body, { childList: true, subtree: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lpvScanAll139);
  else lpvScanAll139();
})();
