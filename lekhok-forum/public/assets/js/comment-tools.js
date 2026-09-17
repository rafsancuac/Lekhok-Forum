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
    html += '<span class="fc-time">' + relTime(c.created_at) + '</span>';

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
      if (list) list.innerHTML = '<div class="fc-loading"><i class="fas fa-spinner fa-spin"></i> মন্তব্য লোড হচ্ছে…</div>';
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
        syncPreview(drawer, comments, total);
        // কাউন্টার-আপডেট (actions-summary-র as-stat)
        var card = drawer.closest('.feed-card, article');
        if (card) {
          var stat = card.querySelector('.as-stat[title="মন্তব্য"] span:first-child');
          if (stat) stat.textContent = total;
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
        var ed = bubble.querySelector('.fc-edited');
        if (!ed) {
          ed = document.createElement('span');
          ed.className = 'fc-edited';
          ed.textContent = 'সম্পাদিত';
          (bodyEl || bubble).insertAdjacentElement('afterend', ed);
        }
        RAW_CACHE[cid] = body;
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
        var drawer = item.closest('.fc-drawer');
        if (drawer) {
          // ফিড-ড্রয়ার: পূর্ণ-রিফ্রেশ — লিস্ট + কাউন্টার + প্রিভিউ-সিঙ্ক
          refreshDrawer(drawer, drawer.getAttribute('data-comments-for'));
        } else {
          // আর্টিকেল/প্রশ্ন-পেজ: ইন-প্লেস — এলিমেন্ট (রিপ্লাইসহ) সরাও + কাউন্টার-সিঙ্ক
          item.remove();
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
              if (stat) stat.textContent = total;
            }
          } catch (_) {}
        }
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
    var postId = rBtn.closest('.fc-drawer') && rBtn.closest('.fc-drawer').getAttribute('data-comments-for');
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

        var drawer = form.closest('.fc-drawer');
        if (drawer) {
          // ফিড-ড্রয়ার: লিস্ট-রিফ্রেশ (ক্যানোনিকাল CommentItem-HTML) — রিলোড নেই
          refreshDrawer(drawer, drawer.getAttribute('data-comments-for'));
          var slot = form.closest('.fc-reply-slot');
          if (slot) { slot.hidden = true; slot.innerHTML = ''; }
        } else if (refreshArticleThread(form)) {
          // আর্টিকেল-পেজ (সেশন ১০৫): রিলোড-নেই — ক্যানোনিকাল-HTML থ্রেড-সোয়াপ
        } else {
          // লিগ্যাসি থ্রেড-পেজ ফলব্যাক: সার্ভার-রেন্ডার্ড রিলোড
          if (window.showToast) showToast('মন্তব্য প্রকাশিত হয়েছে ✓', 'success');
          setTimeout(function () { location.reload(); }, 450);
        }
      })
      .catch(function () {
        if (send) { send.disabled = false; send.innerHTML = '<i class="fas fa-paper-plane"></i>'; }
        if (window.showToast) showToast('নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন', 'error');
      });
  });

  /* ── ৬. সেশন ১০৫: ক্যানোনিকাল CommentItem-আচরণ (রুল-২) + রিঅ্যাক্টরস-মডাল ── */

  // ৬.a আর্টিকেল-থ্রেড-রিফ্রেশ (রিলোড-নেই) — .comments-list[data-post-link] থাকলে
  function refreshArticleThread(form) {
    var list = document.querySelector('.comments-list[data-post-link]');
    if (!list) return false;
    var postId = form.getAttribute('data-post-id');
    var slot = form.closest('.fc-reply-slot');
    fetch('/api/comments?post_id=' + postId + '&format=html')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.html) list.innerHTML = j.html;
        var tot = document.querySelector('.comments-total');
        if (tot && typeof (j && j.total) === 'number') tot.textContent = bnNum(j.total);
        if (window.showToast) showToast('মন্তব্য প্রকাশিত হয়েছে ✓', 'success');
      })
      .catch(function () { location.reload(); });
    return true;
  }

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
            bodyEl.innerHTML = j.bodyHtml;
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
            if (it) it.remove();
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
        var tabsHtml = '<button type="button" class="lf-rxm-tab active" data-rx-filter="all">সব <span>' + bnNum(j.total || users.length) + '</span></button>';
        Object.keys(counts).forEach(function (k) {
          if (counts[k] > 0) tabsHtml += '<button type="button" class="lf-rxm-tab" data-rx-filter="' + k + '">' + (RX_META[k] || '👍') + ' <span>' + bnNum(counts[k]) + '</span></button>';
        });
        tabs.innerHTML = tabsHtml;
        renderRxList(list, users, 'all');
        tabs.onclick = function (ev) {
          var b = ev.target.closest('.lf-rxm-tab');
          if (!b) return;
          tabs.querySelectorAll('.lf-rxm-tab').forEach(function (x) { x.classList.toggle('active', x === b); });
          renderRxList(list, users, b.getAttribute('data-rx-filter'));
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
})();
