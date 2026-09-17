/* ═══════════════════════════════════════════════════════════════════════════
   সেশন ৯৩: comment-tools.js — কমেন্ট-অভিজ্ঞতার গ্লোবাল ইঞ্জিন
   ─────────────────────────────────────────────────────────────────────────
   ১. মার্কডাউন-টুলবার (.cc-fmt) — selectionStart/End-ভিত্তিক সিনট্যাক্স-র‍্যাপ
      (আগের cf-hint চিপগুলো স্ট্যাটিক ছিল — ক্লিকে কিছুই হতো না)
   ২. @ম্যানশন-অটোকমপ্লিট — কার্সরের আগে @কোয়েরি ডিটেক্ট → /api/users/search
      ডিবাউন্স-ফেচ → ড্রপডাউন → সিলেক্টে @username ইনসার্ট
   ৩. পোস্ট-৩-ডট-মেনু (.pm-wrap) — খোলা/বন্ধ + আউটসাইড-ক্লিক + কনফার্ম
   ৪. ফিড-ইনলাইন-কমেন্ট ([data-toggle-comments]) — আলাদা পেজে না গিয়ে
      একই কার্ডে ড্রয়ার-টগল; প্রথম-ওপেনে GET /api/comments-ফেচ
   ৫. কমেন্ট-রেন্ডার (renderCommentItem) — FB-বাবল: অ্যাভাটার+গ্রে-বাবল+মেটা+উত্তর
   সব হ্যান্ডলার ডেলিগেটেড — /dashboard/more-এর ডায়নামিক-HTML-এও কাজ করে।
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var AUTHED = document.body && document.body.getAttribute('data-auth') === '1';

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
    if (diff < 60) return 'এইমাত্র';
    if (diff < 3600) return bnNum(Math.floor(diff / 60)) + ' মিনিট';
    if (diff < 86400) return bnNum(Math.floor(diff / 3600)) + ' ঘণ্টা';
    if (diff < 86400 * 7) return bnNum(Math.floor(diff / 86400)) + ' দিন';
    return new Date(iso).toLocaleDateString('bn-BD');
  }

  function renderCommentItem(c, postId) {
    var html = '<div class="fc-item" id="fc-c' + c.id + '">' +
      '<img class="fc-av" src="' + esc(c.avatar_url || ('/avatar/' + c.author_id)) + '" alt="" onerror="this.src=\'/assets/img/avatar-placeholder.svg?v=2\'">' +
      '<div class="fc-main">' +
        '<div class="fc-bubble"><a class="fc-author" href="/profile/' + esc(c.username) + '">' + esc(c.author_name) + '</a>' +
          '<div class="fc-body">' + (c.bodyHtml || esc(c.body)) + '</div>' +
          (c.edited ? '<span class="fc-edited">সম্পাদিত</span>' : '') +
        '</div>' +
        '<div class="fc-meta">' +
          '<span class="fc-time">' + relTime(c.created_at) + '</span>' +
          (AUTHED ? '<button type="button" class="fc-reply-btn" data-reply-to="' + c.id + '" data-reply-name="' + esc(c.author_name) + '">উত্তর দিন</button>' : '') +
        '</div>';
    if (AUTHED) {
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
        out += c.replies.map(function (r) {
          return '<div class="fc-item fc-reply" id="fc-c' + r.id + '">' +
            '<img class="fc-av small" src="' + esc(r.avatar_url || ('/avatar/' + r.author_id)) + '" alt="" onerror="this.src=\'/assets/img/avatar-placeholder.svg?v=2\'">' +
            '<div class="fc-main"><div class="fc-bubble"><a class="fc-author" href="/profile/' + esc(r.username) + '">' + esc(r.author_name) + '</a>' +
              '<div class="fc-body">' + (r.bodyHtml || esc(r.body)) + '</div></div>' +
            '<div class="fc-meta"><span class="fc-time">' + relTime(r.created_at) + '</span></div>' +
            '</div></div>';
        }).join('');
      }
      return out;
    }).join('');
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
    card.classList.add('fc-open');
    if (!drawer.dataset.loaded) {
      drawer.dataset.loaded = '1';
      var postId = drawer.getAttribute('data-comments-for');
      var list = drawer.querySelector('.fc-list');
      if (list) list.innerHTML = '<div class="fc-loading"><i class="fas fa-spinner fa-spin"></i> মন্তব্য লোড হচ্ছে…</div>';
      refreshDrawer(drawer, postId);
    }
    return true;
  }

  function refreshDrawer(drawer, postId) {
    return fetch('/api/comments?post_id=' + postId)
      .then(function (r) { return r.json(); })
      .then(function (j) {
        renderCommentList((j && j.comments) || [], postId, drawer);
        // কাউন্টার-আপডেট (actions-summary-র as-stat)
        var card = drawer.closest('.feed-card, article');
        if (card && typeof (j && j.total) === 'number') {
          var stat = card.querySelector('.as-stat[title="মন্তব্য"] span:first-child');
          if (stat) stat.textContent = j.total;
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
      drawer.hidden = true;
      card.classList.remove('fc-open');
    }
  });

  // রিপ্লাই-বাটন (ডেলিগেটেড — ড্রয়ারের ভেতরে)
  document.addEventListener('click', function (e) {
    var rBtn = e.target.closest('.fc-reply-btn');
    if (!rBtn) return;
    e.preventDefault();
    var item = rBtn.closest('.fc-item');
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

  /* ── ৫. কম্পোজার-সাবমিট (ডেলিগেটেড — ফিড-ড্রয়ার + আর্টিকেল-পেজ) ─────── */
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
          // ফিড-ড্রয়ার: লিস্ট-রিফ্রেশ (সার্ভার-রেন্ডার্ড bodyHtml-সহ) — রিলোড নেই
          refreshDrawer(drawer, drawer.getAttribute('data-comments-for'));
          var slot = form.closest('.fc-reply-slot');
          if (slot) { slot.hidden = true; slot.innerHTML = ''; }
        } else {
          // আর্টিকেল-পেজ: সার্ভার-রেন্ডার্ড থ্রেড-সাঙ্কেতি রিলোড
          // (রিপ্লাই-ফর্ম পুনঃলোডে নিজেই লুকানো থাকে)
          if (window.showToast) showToast('মন্তব্য প্রকাশিত হয়েছে ✓', 'success');
          setTimeout(function () { location.reload(); }, 450);
        }
      })
      .catch(function () {
        if (send) { send.disabled = false; send.innerHTML = '<i class="fas fa-paper-plane"></i>'; }
        if (window.showToast) showToast('নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন', 'error');
      });
  });
})();
