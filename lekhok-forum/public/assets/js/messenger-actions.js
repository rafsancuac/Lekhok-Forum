/* ═══════════════════════════════════════════════════════════════════════
   সেশন ৭৬ — মেসেজিং প্রো-অ্যাকশনস (FB-মেসেঞ্জার প্যারিটি)
   • রিপ্লাই-থ্রেডিং (⋯-মেনু → রিপ্লাই-বার → reply_to ফর্ম-ফিল্ড → কোট-বাবল)
   • মেসেজ এডিট (নিজের, ১৫-মিনিট উইন্ডো — কম্পোজার এডিট-মোড)
   • ফরওয়ার্ড-মোডাল (টার্গেট তালিকা + সার্চ)
   • কপি-টু-ক্লিপবোর্ড
   • মিউট/পিন টগল (ডিটেইলস-প্যানেল + লিস্ট-রো ⋯-মেনু)
   • ড্রাফট অটোসেভ (প্রতি-কথোপকথন localStorage)
   • কোট-ক্লিক → মূল মেসেজে স্ক্রল+ফ্ল্যাশ
   নোট (চ্যাট-পেজ): convId/myId/otherUsername/sendUrl/isGroupChat/chatForm/
   msgInput/body/sendBtn/fbToast — ইনলাইন-স্ক্রিপ্টের টপ-লেভেল বাইন্ডিং,
   ক্লাসিক-স্ক্রিপ্ট গ্লোবাল স্কোপে শেয়ারড; এই ফাইল তার পরে লোড হয়।
   লিস্ট-পেজে এই ফাইলটি নিরাপদে লোড হয় (চ্যাট-নির্ভর কোড IIFE-গার্ডে স্কিপ)।
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CSRF = (document.querySelector('meta[name="csrf-token"]') || {}).content || '';

  function csrfHeaders(extra) {
    var h = Object.assign({ 'X-CSRF-Token': CSRF }, extra || {});
    return h;
  }

  function toast(msg) {
    if (typeof window.fbToast === 'function') { window.fbToast(msg); return; }
    var t = document.querySelector('.fb-toast');
    if (!t) { t = document.createElement('div'); t.className = 'fb-toast'; document.body.appendChild(t); }
    t.textContent = msg;
    requestAnimationFrame(function () { t.classList.add('show'); });
    clearTimeout(t._hide);
    t._hide = setTimeout(function () { t.classList.remove('show'); }, 2400);
  }

  /* ── ফরওয়ার্ড-মোডাল (চ্যাট + লিস্ট দুই পেজেই কাজ করে) ─────────────────
     সেশন ১৫৯ প্রিমিয়াম-রিরাইট:
     ① 🐛 রুট-কজ ফিক্স — <img>-এ ক্লাস ছিল না, তাই .fwd-av-এর ৩৮px-বৃত্ত
        প্রয়োগ হতো না → হাই-রেজোলিউশন প্রোফাইল-ছবি নিজ-পিক্সেলে (natural
        width) মডাল ভেঙে ফুল-স্ক্রিন হয়ে যেত। এখন class="fwd-av" লক + CSS
        defense-in-depth (.fwd-avwrap img) দ্বৈত-স্তরে।
     ② প্রতি-সারিতে 'পাঠান' টগল-বাটন (পাঠান → লোডিং-স্পিনার → ✓ পাঠানো হয়েছে)
        — মডাল বন্ধ না করেই একাধিক কথোপকথনে ফরওয়ার্ড (মাল্টি-সেন্ড)।
     ③ ফুটারে লাইভ-কাউন্টার (N জনকে পাঠানো হয়েছে — বাংলা-সংখ্যা চুক্তি)।
     ④ গ্রুপ-টার্গেটে আইকন-অ্যাভাটার + ইনিশিয়াল-ফলব্যাক XSS-হার্ডেনড। */
  var fwdOverlay = document.getElementById('fwdOverlay');
  var fwdList = document.getElementById('fwdList');
  var fwdSearch = document.getElementById('fwdSearch');
  var fwdTargets = null;        // ক্যাশ (৩০ সেকেন্ড)
  var fwdTargetsAt = 0;
  var fwdMsgId = null;
  var fwdPickHandler = null;    // লিস্ট-পেজ থেকেও ব্যবহারযোগ্য পিক-কলব্যাক
  var fwdSentMap = {};          // সেশন ১৫৯: convId → true (মাল্টি-ফরওয়ার্ড স্টেট)

  function bnNum(n) {
    return (typeof window.toBnNumber === 'function') ? window.toBnNumber(n) : String(n);
  }

  function escFwd(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function updateFwdSentCount() {
    var el = document.getElementById('fwdSentCount');
    if (!el) return;
    var n = Object.keys(fwdSentMap).length;
    if (!n) { el.hidden = true; el.textContent = ''; return; }
    el.hidden = false;
    el.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i> ' + bnNum(n) + ' জনকে পাঠানো হয়েছে';
  }

  function fwdAvatarHtml(c) {
    if (c.is_group) {
      return '<span class="fwd-av fwd-av--txt fwd-av--grp"><i class="fas fa-users" aria-hidden="true"></i></span>';
    }
    var initial = escFwd(String(c.name || '?').charAt(0));
    if (c.avatar) {
      var src = escFwd(c.avatar);
      return '<img loading="lazy" class="fwd-av" src="' + src + '" alt="" ' +
        'onerror="this.onerror=null;this.outerHTML=\'<span class=&quot;fwd-av fwd-av--txt&quot;>' + initial + '</span>\'" />';
    }
    return '<span class="fwd-av fwd-av--txt">' + initial + '</span>';
  }

  function openForward(msgId, onPicked) {
    if (!fwdOverlay) return;
    fwdMsgId = (msgId === null || msgId === undefined) ? null : String(msgId);
    fwdPickHandler = typeof onPicked === 'function' ? onPicked : null;
    fwdSentMap = {};
    updateFwdSentCount();
    fwdOverlay.hidden = false;
    if (fwdSearch) { fwdSearch.value = ''; }
    loadForwardTargets('');
    setTimeout(function () { if (fwdSearch) fwdSearch.focus(); }, 60);
  }

  function closeForward() {
    if (!fwdOverlay) return;
    fwdOverlay.hidden = true;
    fwdMsgId = null;
    fwdPickHandler = null;
    fwdSentMap = {};
  }

  async function loadForwardTargets(q) {
    if (!fwdList) return;
    var now = Date.now();
    if (!fwdTargets || (now - fwdTargetsAt) > 30000) {
      fwdList.innerHTML = '<div class="fwd-empty"><i class="fas fa-spinner fa-spin"></i> লোড হচ্ছে…</div>';
      try {
        var r = await fetch('/api/messages/forward-targets');
        var d = await r.json();
        fwdTargets = d.conversations || [];
        fwdTargetsAt = now;
      } catch (e) {
        fwdList.innerHTML = '<div class="fwd-empty"><i class="fas fa-triangle-exclamation"></i> লোড করা যায়নি — আবার চেষ্টা করুন।</div>';
        return;
      }
    }
    var ql = (q || '').toLowerCase().trim();
    var items = fwdTargets.filter(function (c) { return !ql || String(c.name || '').toLowerCase().indexOf(ql) !== -1; });
    if (!items.length) { fwdList.innerHTML = '<div class="fwd-empty"><i class="fas fa-magnifying-glass"></i> কোনো কথোপকথন মেলেনি।</div>'; return; }
    var pickMode = !!fwdPickHandler;
    fwdList.innerHTML = items.map(function (c) {
      var sub = c.is_group ? (bnNum(c.member_count || 0) + ' সদস্য · গ্রুপ') : 'ব্যক্তিগত চ্যাট';
      var right = pickMode
        ? '<i class="fas fa-share fwd-go"></i>'
        : (fwdSentMap[c.id]
          ? '<button type="button" class="fwd-send is-sent" data-fwd-send="' + c.id + '" disabled><i class="fas fa-check"></i> পাঠানো হয়েছে</button>'
          : '<button type="button" class="fwd-send" data-fwd-send="' + c.id + '" aria-label="' + escFwd(c.name || '') + '-কে ফরওয়ার্ড করুন"><i class="fas fa-paper-plane"></i> পাঠান</button>');
      var nav = pickMode ? ' role="button" tabindex="0"' : '';
      return '<div class="fwd-row' + (fwdSentMap[c.id] ? ' is-done' : '') + '" data-fwd-conv="' + c.id + '"' + nav + '>' +
        '<span class="fwd-avwrap">' + fwdAvatarHtml(c) + '</span>' +
        '<span class="fwd-meta"><span class="fwd-name">' + String(c.name || 'কথোপকথন').replace(/</g, '&lt;') + '</span>' +
        '<span class="fwd-sub">' + sub + (c.muted ? ' · <i class="fas fa-bell-slash"></i>' : '') + '</span></span>' +
        right +
        '</div>';
    }).join('');
  }

  async function sendForwardTo(convNum, btn) {
    if (!fwdMsgId || fwdSentMap[convNum]) return;
    var oldHtml = btn.innerHTML;
    btn.disabled = true;
    btn.classList.add('is-loading');
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin" aria-hidden="true"></i>';
    try {
      var r = await fetch('/api/messages/' + fwdMsgId + '/forward', {
        method: 'POST',
        headers: csrfHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ conv_id: parseInt(convNum, 10) })
      });
      var d = await r.json();
      if (d.ok) {
        fwdSentMap[convNum] = true;
        btn.classList.remove('is-loading');
        btn.classList.add('is-sent');
        btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> পাঠানো হয়েছে';
        var row = btn.closest('[data-fwd-conv]');
        if (row) row.classList.add('is-done');
        updateFwdSentCount();
        toast('মেসেজ ফরওয়ার্ড করা হয়েছে ✓');
      } else {
        btn.classList.remove('is-loading');
        btn.disabled = false;
        btn.innerHTML = oldHtml;
        toast(d.error === 'forbidden' ? 'অনুমতি নেই।' : 'ফরওয়ার্ড করা যায়নি।');
      }
    } catch (e2) {
      btn.classList.remove('is-loading');
      btn.disabled = false;
      btn.innerHTML = oldHtml;
      toast('নেটওয়ার্ক সমস্যা।');
    }
  }

  if (fwdOverlay) {
    fwdOverlay.addEventListener('click', function (e) { if (e.target === fwdOverlay) closeForward(); });
    document.getElementById('fwdClose')?.addEventListener('click', closeForward);
    document.getElementById('fwdCancel')?.addEventListener('click', closeForward);
    fwdSearch?.addEventListener('input', function () { loadForwardTargets(fwdSearch.value); });
    fwdList?.addEventListener('click', function (e) {
      var sendBtn = e.target.closest('[data-fwd-send]');
      if (sendBtn) { sendForwardTo(sendBtn.getAttribute('data-fwd-send'), sendBtn); return; }
      // লিস্ট-পেজ মোড: শুধু কলব্যাক (নেভিগেশন), কপি-পাঠানো নয়
      if (!fwdPickHandler) return;
      var row = e.target.closest('[data-fwd-conv]');
      if (!row) return;
      var cb = fwdPickHandler;
      closeForward();
      cb(row.getAttribute('data-fwd-conv'));
    });
    fwdList?.addEventListener('keydown', function (e) {
      if (!fwdPickHandler) return;
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var row = e.target.closest('[data-fwd-conv][role="button"]');
      if (!row) return;
      e.preventDefault();
      var cb = fwdPickHandler;
      closeForward();
      cb(row.getAttribute('data-fwd-conv'));
    });
  }

  /* ── চ্যাট-পেজ অংশ (লিস্ট-পেজে স্কিপ) ─────────────────────────────────── */
  var chatBody = document.getElementById('chatBody');
  var msgInput = document.getElementById('msgInput');
  var chatForm = document.getElementById('chatForm');

  // ইনলাইন-স্ক্রিপ্টের টপ-লেভেল const গুলো গ্লোবাল লেক্সিকাল বাইন্ডিং — যেকোনো
  // ক্লাসিক স্ক্রিপ্ট সরাসরি পড়তে পারে (window-প্রপার্টি নয়)। CSP-র কারণে
  // eval নিষিদ্ধ, তাই typeof-গার্ডে সরাসরি রেফারেন্স (undeclared-এ typeof নিরাপদ)।
  var isChat = !!(chatBody && msgInput && chatForm) && (typeof convId !== 'undefined') && !!convId;

  if (isChat) {
    var convIdV = convId;
    var isGroupV = (typeof isGroupChat !== 'undefined') && !!isGroupChat;
    var sendUrlV = (typeof sendUrl !== 'undefined') ? sendUrl : '/messages';
    var sendBtn = document.getElementById('sendBtn');
    var replyBar = document.getElementById('replyBar');
    var replyBarName = document.getElementById('replyBarName');
    var replyBarText = document.getElementById('replyBarText');
    var replyBarCancel = document.getElementById('replyBarCancel');
    var replyToInput = document.getElementById('replyToInput');
    var editBar = document.getElementById('editBar');
    var editBarText = document.getElementById('editBarText');
    var editBarCancel = document.getElementById('editBarCancel');

    /* ── স্টেট ── */
    var replyState = null;   // { id, name, text }
    var editState = null;    // { id, orig }
    var draftKey = 'lf_msg_draft_' + convIdV;
    var draftTimer = null;
    var lastDraft = '';

    /* ── ভাসমান ⋯-মেনু ── */
    var msgMenu = document.createElement('div');
    msgMenu.className = 'msg-menu';
    msgMenu.hidden = true;
    msgMenu.setAttribute('role', 'menu');
    document.body.appendChild(msgMenu);
    var menuBubble = null;

    function bubbleTextOf(b) {
      var t = b.querySelector('.bubble-text');
      return t ? t.textContent : '';
    }

    function showMenu(bubble, anchor) {
      menuBubble = bubble;
      var own = bubble.dataset.own === '1';
      var hasText = !!bubbleTextOf(bubble).trim();
      var items = [];
      items.push('<button type="button" data-act="reply" role="menuitem"><i class="fas fa-reply"></i> উত্তর দিন</button>');
      if (hasText) items.push('<button type="button" data-act="copy" role="menuitem"><i class="far fa-copy"></i> কপি</button>');
      items.push('<button type="button" data-act="forward" role="menuitem"><i class="fas fa-share"></i> ফরওয়ার্ড</button>');
      if (own && hasText) items.push('<button type="button" data-act="edit" role="menuitem"><i class="fas fa-pen"></i> সম্পাদনা</button>');
      if (own) items.push('<button type="button" data-act="unsend" role="menuitem" class="is-danger"><i class="fas fa-trash"></i> আনসেন্ড</button>');
      msgMenu.innerHTML = items.join('');
      msgMenu.hidden = false;
      var r = anchor.getBoundingClientRect();
      var mw = msgMenu.offsetWidth || 180, mh = msgMenu.offsetHeight || 160;
      var left = Math.max(8, Math.min(r.left, window.innerWidth - mw - 8));
      var top = r.top - mh - 8;
      if (top < 8) top = Math.min(r.bottom + 8, window.innerHeight - mh - 8);
      msgMenu.style.left = left + 'px';
      msgMenu.style.top = top + 'px';
    }

    function hideMenu() { msgMenu.hidden = true; menuBubble = null; }

    /* ── রিপ্লাই ── */
    function startReply(bubble) {
      var id = bubble.dataset.id;
      var name;
      if (bubble.dataset.own === '1') {
        name = 'আপনি';
      } else if (isGroupV) {
        var s = bubble.querySelector('.bubble-sender');
        name = (s && s.textContent.trim()) || 'সদস্য';
      } else {
        name = ((document.querySelector('.mdp-name') || {}).textContent || document.querySelector('.fb-chat-name')?.textContent || 'প্রাপক').trim();
      }
      var text = bubbleTextOf(bubble).trim() || (bubble.querySelector('.bubble-voice') ? '🎙️ ভয়েস মেসেজ' : '📎 ফাইল');
      replyState = { id: id, name: name, text: text.slice(0, 120) };
      replyToInput.value = id;
      replyBarName.textContent = name;
      replyBarText.textContent = text.slice(0, 90);
      replyBar.hidden = false;
      hideMenu();
      msgInput.focus();
    }
    function cancelReply() {
      replyState = null;
      replyToInput.value = '';
      replyBar.hidden = true;
    }

    /* ── এডিট ── */
    function enterEdit(bubble) {
      editState = { id: bubble.dataset.id, orig: bubbleTextOf(bubble) };
      editBarText.textContent = editState.orig.slice(0, 90);
      editBar.hidden = false;
      cancelReply();
      hideMenu();
      msgInput.value = editState.orig;
      if (typeof updateSendBtn === 'function') updateSendBtn();
      msgInput.focus();
    }
    function exitEdit() {
      editState = null;
      editBar.hidden = true;
      msgInput.value = '';
      if (typeof updateSendBtn === 'function') updateSendBtn();
    }
    async function saveEdit() {
      if (!editState) return;
      var text = (msgInput.value || '').trim();
      if (!text) { toast('খালি মেসেজ সংরক্ষণ করা যাবে না।'); return; }
      try {
        var r = await fetch('/api/messages/' + editState.id + '/edit', {
          method: 'POST',
          headers: csrfHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ body: text })
        });
        var d = await r.json();
        if (d.ok) {
          var b = chatBody.querySelector('.bubble[data-id="' + editState.id + '"]');
          if (b) {
            var t = b.querySelector('.bubble-text');
            if (t) t.textContent = d.body;
            if (!b.querySelector('.bubble-edited')) {
              var bt = b.querySelector('.bubble-text');
              if (bt) bt.insertAdjacentHTML('afterend', '<span class="bubble-edited">সম্পাদিত</span>');
            }
          }
          exitEdit();
          toast('মেসেজ সম্পাদিত হয়েছে ✓');
        } else {
          toast(d.error === 'window' ? '১৫ মিনিট পার হয়ে গেছে — এখন আর সম্পাদনা করা যাবে না।' : 'সম্পাদনা করা যায়নি।');
        }
      } catch (e) { toast('নেটওয়ার্ক সমস্যা।'); }
    }

    // এডিট-মোডে ফর্ম-সাবমিট আটকাও (window-capture — ইনলাইন হ্যান্ডলারের আগে চলে)
    window.addEventListener('submit', function (e) {
      if (!editState) return;
      var f = e.target;
      if (f && f.id === 'chatForm') {
        e.preventDefault();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        e.stopPropagation();
        saveEdit();
      }
    }, true);

    /* ── কপি ── */
    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        toast('কপি হয়েছে ✓');
      } catch (e) {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); toast('কপি হয়েছে ✓'); } catch (_) { toast('কপি করা যায়নি।'); }
        ta.remove();
      }
    }

    /* ── মেনু/বাবল ক্লিক-ডেলিগেশন ── */
    chatBody.addEventListener('click', function (e) {
      var more = e.target.closest('[data-msg-more]');
      if (more) {
        var bubble = more.closest('.bubble');
        if (msgMenu.hidden || menuBubble !== bubble) showMenu(bubble, more);
        else hideMenu();
        return;
      }
      // সেশন ৯৩: FB-স্টাইল সাইড-রেলের দ্রুত-রিপ্লাই বাটন (↩)
      var replyBtn = e.target.closest('[data-msg-reply]');
      if (replyBtn) {
        var rbubble = replyBtn.closest('.bubble');
        if (rbubble && String(rbubble.dataset.id).indexOf('tmp-') !== 0) startReply(rbubble);
        return;
      }
      // কোট-ক্লিক → মূল মেসেজে স্ক্রল + ফ্ল্যাশ
      var quote = e.target.closest('.bubble-quote');
      if (quote) {
        var target = chatBody.querySelector('.bubble[data-id="' + quote.getAttribute('data-quote-id') + '"]');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.classList.remove('is-flash');
          void target.offsetWidth;
          target.classList.add('is-flash');
        }
        return;
      }
      if (!e.target.closest('.msg-menu')) hideMenu();
    });

    msgMenu.addEventListener('click', async function (e) {
      var act = e.target.closest('[data-act]');
      if (!act || !menuBubble) return;
      var action = act.dataset.act;
      var bubble = menuBubble;
      hideMenu();
      if (action === 'reply') startReply(bubble);
      else if (action === 'copy') copyText(bubbleTextOf(bubble).trim());
      else if (action === 'forward') openForward(bubble.dataset.id);
      else if (action === 'edit') enterEdit(bubble);
      else if (action === 'unsend') {
        if (!confirm('আনসেন্ড করবেন? মেসেজটি সবার কাছ থেকে মুছে যাবে।')) return;
        try {
          var r = await fetch('/api/messages/' + bubble.dataset.id + '/delete', { method: 'POST', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
          var d = await r.json();
          if (d.ok) { bubble.remove(); toast('মেসেজ আনসেন্ড হয়েছে'); }
          else toast('আনসেন্ড করা যায়নি।');
        } catch (_) { toast('নেটওয়ার্ক সমস্যা।'); }
      }
    });

    document.addEventListener('click', function (e) {
      if (!msgMenu.hidden && !e.target.closest('.msg-menu') && !e.target.closest('[data-msg-more]')) hideMenu();
    });
    window.addEventListener('scroll', hideMenu, true);
    window.addEventListener('resize', hideMenu);

    replyBarCancel?.addEventListener('click', cancelReply);
    editBarCancel?.addEventListener('click', function () { exitEdit(); });

    // এডিট-মোডে সেন্ড-বাটন = ✓-সেভ (updateSendBtn র‍্যাপ — ইনলাইন কলগুলোও ধরে)
    if (typeof updateSendBtn === 'function' && sendBtn) {
      var _usb76 = updateSendBtn;
      window.updateSendBtn = function () {
        if (editState) {
          var has = (msgInput.value || '').trim().length > 0;
          sendBtn.classList.remove('is-like');
          sendBtn.title = 'সম্পাদনা সংরক্ষণ';
          sendBtn.innerHTML = '<i class="fas fa-check"></i>';
          sendBtn.disabled = !has;
          return;
        }
        _usb76();
      };
    }

    /* ── ড্রাফট অটোসেভ (সুইপ-ভিত্তিক — সেন্ড-সাকসেস হুক লাগে না) ── */
    try {
      var savedDraft = localStorage.getItem(draftKey);
      if (savedDraft && !msgInput.value) {
        msgInput.value = savedDraft;
        lastDraft = savedDraft;
        if (typeof updateSendBtn === 'function') updateSendBtn();
      }
    } catch (e) {}
    setInterval(function () {
      try {
        var v = (msgInput.value || '').trim();
        if (v === lastDraft) return;
        lastDraft = v;
        if (v) localStorage.setItem(draftKey, v);
        else localStorage.removeItem(draftKey);
      } catch (e) {}
    }, 1200);
    window.addEventListener('beforeunload', function () {
      try {
        var v = (msgInput.value || '').trim();
        if (v) localStorage.setItem(draftKey, v); else localStorage.removeItem(draftKey);
      } catch (e) {}
    });

    /* ── মিউট/পিন টগল (ডিটেইলস-প্যানেল) ── */
    var muteToggle = document.getElementById('muteToggle');
    var pinToggle = document.getElementById('pinToggle');
    async function toggleFlag(btn, kind) {
      var want = btn.dataset[kind] === '1' ? 0 : 1;
      // এন্ডপয়েন্ট-নেম আলাদা: dataset 'muted' → route 'mute', 'pinned' → 'pin'
      var endpoint = (kind === 'muted') ? 'mute' : 'pin';
      btn.disabled = true;
      try {
        var r = await fetch('/api/messages/conv/' + convIdV + '/' + endpoint, {
          method: 'POST',
          headers: csrfHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(kind === 'muted' ? { muted: want } : { pinned: want })
        });
        var d = await r.json();
        if (d.ok) {
          btn.dataset[kind] = want ? '1' : '0';
          if (kind === 'muted') {
            btn.querySelector('i').className = 'fas ' + (want ? 'fa-bell-slash' : 'fa-bell');
            btn.querySelector('.mt-label').textContent = want ? 'আনমিউট করুন' : 'মিউট করুন';
            toast(want ? 'কথোপকথন মিউট করা হয়েছে 🔕' : 'মিউট সরানো হয়েছে 🔔');
          } else {
            toast(want ? 'কথোপকথন পিন করা হয়েছে 📌' : 'পিন সরানো হয়েছে');
          }
        } else toast('পরিবর্তন করা যায়নি।');
      } catch (e) { toast('নেটওয়ার্ক সমস্যা।'); }
      btn.disabled = false;
    }
    muteToggle?.addEventListener('click', function () { toggleFlag(muteToggle, 'muted'); });
    pinToggle?.addEventListener('click', function () { toggleFlag(pinToggle, 'pinned'); });

    // Escape: মেনু → রিপ্লাই → এডিট → ফরওয়ার্ড
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!msgMenu.hidden) { hideMenu(); return; }
      if (!fwdOverlay || fwdOverlay.hidden) { /* noop */ }
      if (replyState) { cancelReply(); return; }
      if (editState) { exitEdit(); return; }
      if (fwdOverlay && !fwdOverlay.hidden) closeForward();
    });

    // প্রি-এক্সিস্টিং ফিক্স (সেশন ৭৬): মোবাইলে অ্যাসিঙ্ক-ফন্ট রিফ্লোতে
    // প্রাথমিক scroll-to-bottom হারিয়ে যায় (চ্যাট-বডি top:0-তে থেকে যায়) —
    // ফন্ট-রেডি + load-এ পুনর্নিশ্চিত করি (শুধু শুরুতে; ইউজার-স্ক্রলে হস্তক্ষেপ নেই)।
    var autoScrollLeft = 3;
    function autoScrollBottom() {
      if (autoScrollLeft <= 0) return;
      autoScrollLeft--;
      chatBody.scrollTop = chatBody.scrollHeight;
    }
    autoScrollBottom();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(autoScrollBottom);
    window.addEventListener('load', autoScrollBottom);
    setTimeout(autoScrollBottom, 400);

    // সেন্ড-সাকসেস হুক (ইনলাইন থেকে কল হয়): রিপ্লাই-বার বন্ধ
    window.MSA = {
      currentReply: function () { return replyState ? { id: replyState.id, text: replyState.text, name: replyState.name } : null; },
      afterSent: function () {
        cancelReply();
        try {
          lastDraft = '';
          localStorage.removeItem(draftKey);
        } catch (e) {}
      }
    };
  } else {
    /* ── লিস্ট-পেজ: রো-লেভেল ⋯-মেনু (পিন/মিউট) ── */
    var convList = document.getElementById('convListDefault');
    if (convList) {
      var rowMenu = document.createElement('div');
      rowMenu.className = 'msg-menu conv-menu';
      rowMenu.hidden = true;
      document.body.appendChild(rowMenu);
      var menuRow = null;

      function showRowMenu(btn) {
        menuRow = btn.closest('.conv-item');
        var pinned = btn.dataset.pinned === '1';
        var muted = btn.dataset.muted === '1';
        rowMenu.innerHTML =
          '<button type="button" data-rid="' + btn.dataset.convMore + '" data-ract="pin"><i class="fas fa-thumbtack"></i> ' + (pinned ? 'আনপিন করুন' : 'পিন করুন') + '</button>' +
          '<button type="button" data-rid="' + btn.dataset.convMore + '" data-ract="mute"><i class="fas ' + (muted ? 'fa-bell' : 'fa-bell-slash') + '"></i> ' + (muted ? 'আনমিউট করুন' : 'মিউট করুন') + '</button>' +
          '<button type="button" data-rid="' + btn.dataset.convMore + '" data-ract="fwd"><i class="fas fa-share"></i> শেষ মেসেজ ফরওয়ার্ড</button>';
        rowMenu.hidden = false;
        var r = btn.getBoundingClientRect();
        var mw = rowMenu.offsetWidth || 200, mh = rowMenu.offsetHeight || 100;
        rowMenu.style.left = Math.max(8, Math.min(r.left - 40, window.innerWidth - mw - 8)) + 'px';
        var top = r.bottom + 6;
        if (top + mh > window.innerHeight - 8) top = r.top - mh - 6;
        rowMenu.style.top = top + 'px';
      }
      function hideRowMenu() { rowMenu.hidden = true; menuRow = null; }

      convList.addEventListener('click', function (e) {
        var more = e.target.closest('[data-conv-more]');
        if (more) {
          e.preventDefault();
          e.stopPropagation();
          if (rowMenu.hidden || menuRow !== more.closest('.conv-item')) showRowMenu(more);
          else hideRowMenu();
        } else if (!e.target.closest('.conv-menu')) {
          hideRowMenu();
        }
      }, true);

      rowMenu.addEventListener('click', async function (e) {
        var act = e.target.closest('[data-ract]');
        if (!act || !menuRow) return;
        var convIdN = act.dataset.rid, action = act.dataset.ract;
        var row = menuRow;
        hideRowMenu();
        if (action === 'fwd') {
          var link = row.getAttribute('href');
          // শেষ মেসেজ ফরওয়ার্ড: রো থেকে msg-id নেই — লিস্টে শেষ-মেসেজ-প্রিভিউ আছে;
          // সরল আচরণ: চ্যাটে নিয়ে যাই (FB-তেও ফরওয়ার্ড চ্যাট-ভিউ থেকেই)
          if (link) window.location.href = link;
          return;
        }
        var want = (action === 'pin')
          ? (act.textContent.indexOf('আনপিন') === -1 ? 1 : 0)
          : (act.textContent.indexOf('আনমিউট') === -1 ? 1 : 0);
        try {
          var r = await fetch('/api/messages/conv/' + convIdN + '/' + (action === 'pin' ? 'pin' : 'mute'), {
            method: 'POST',
            headers: csrfHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(action === 'pin' ? { pinned: want } : { muted: want })
          });
          var d = await r.json();
          if (d.ok) {
            var more = row.querySelector('[data-conv-more]');
            if (more) {
              if (action === 'pin') { more.dataset.pinned = want ? '1' : '0'; row.classList.toggle('is-pinned', !!want); }
              else { more.dataset.muted = want ? '1' : '0'; row.classList.toggle('is-muted', !!want); }
            }
            toast(action === 'pin' ? (want ? 'পিন করা হয়েছে 📌' : 'পিন সরানো হয়েছে') : (want ? 'মিউট করা হয়েছে 🔕' : 'মিউট সরানো হয়েছে'));
            if (action === 'pin') setTimeout(function () { window.location.reload(); }, 450);
          } else toast('পরিবর্তন করা যায়নি।');
        } catch (err) { toast('নেটওয়ার্ক সমস্যা।'); }
      });
      window.addEventListener('scroll', hideRowMenu, true);
      window.addEventListener('resize', hideRowMenu);
    }
  }

  // ফরওয়ার্ড-মোডাল পাবলিক API (উভয় পেজ)
  window.MSAForward = { open: openForward, close: closeForward };
})();
