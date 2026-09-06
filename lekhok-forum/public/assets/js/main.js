/* লেখক ফোরাম — main.js */
(function () {
  // Mobile sidebar toggle
  const toggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('mobileSidebar');
  const overlay = document.getElementById('mobileOverlay');
  const closeBtn = document.getElementById('closeSidebar');

  function openMenu() {
    sidebar.classList.add('open');
    overlay.classList.add('show');
    sidebar.setAttribute('aria-hidden', 'false');
  }
  function closeMenu() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    sidebar.setAttribute('aria-hidden', 'true');
  }
  if (toggle) toggle.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  // ── Footer newsletter subscription (AJAX — graceful form-post fallback) ──
  const nlForm = document.getElementById('newsletterForm');
  if (nlForm) {
    const nlMsg = document.getElementById('newsletterMsg');
    async function onNlSubmit(e) {
      e.preventDefault();
      const input = nlForm.querySelector('input[name="email"]');
      const btn = nlForm.querySelector('button');
      const email = (input && input.value || '').trim();
      if (!email) return;
      if (nlMsg) { nlMsg.className = 'f-newsletter-msg show'; nlMsg.textContent = 'অপেক্ষা করুন…'; }
      if (btn) btn.disabled = true;
      try {
        const resp = await fetch(nlForm.getAttribute('action'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await resp.json().catch(() => ({}));
        if (resp.ok && data.ok) {
          if (nlMsg) { nlMsg.className = 'f-newsletter-msg show ok'; nlMsg.textContent = data.message || 'সাবস্ক্রিপশন সফল!'; }
          if (input) input.value = '';
        } else {
          if (nlMsg) { nlMsg.className = 'f-newsletter-msg show err'; nlMsg.textContent = data.message || 'সাবস্ক্রিপশন ব্যর্থ — আবার চেষ্টা করুন।'; }
        }
      } catch (err) {
        // Network failure → classic form post as fallback
        nlForm.removeEventListener('submit', onNlSubmit);
        nlForm.submit();
        return;
      } finally {
        if (btn) btn.disabled = false;
      }
    }
    nlForm.addEventListener('submit', onNlSubmit);
  }

  // Bengali numeral counter
  const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  function toBn(n) { return String(n).replace(/[0-9]/g, d => bnDigits[d]); }

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const duration = 1600;
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.floor(target * eased);
      el.textContent = toBn(value.toLocaleString('en-US'));
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = toBn(target.toLocaleString('en-US'));
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.stat-num').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.stat-num').forEach(animateCount);
  }

  /* ── Bengali relative time for [data-ts] elements ─────────────────────
     Converts ISO timestamps into friendly relative strings:
     এইমাত্র → ৫ মিনিট আগে → ২ ঘণ্টা আগে → গতকাল → ৪ দিন আগে → (date)   */
  const BN_MONTHS = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
  function bnRelTime(iso) {
    const then = new Date(iso).getTime();
    if (isNaN(then)) return null;
    const diff = Date.now() - then;
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'এইমাত্র';
    if (min < 60) return toBn(min) + ' মিনিট আগে';
    const hr = Math.floor(min / 60);
    if (hr < 24) return toBn(hr) + ' ঘণ্টা আগে';
    const day = Math.floor(hr / 24);
    if (day === 1) return 'গতকাল';
    if (day < 7) return toBn(day) + ' দিন আগে';
    const d = new Date(then);
    return toBn(d.getDate()) + ' ' + BN_MONTHS[d.getMonth()] + ', ' + toBn(d.getFullYear());
  }
  function renderRelTimes(root) {
    (root || document).querySelectorAll('[data-ts]').forEach(el => {
      const rel = bnRelTime(el.dataset.ts);
      if (rel) {
        const icon = el.querySelector('i');
        el.textContent = '';
        if (icon) el.appendChild(icon);
        el.appendChild(document.createTextNode(' ' + rel));
        el.setAttribute('title', new Date(el.dataset.ts).toLocaleString('bn-BD'));
      }
    });
  }
  window.LekhokRelTime = { render: renderRelTimes };
  document.addEventListener('DOMContentLoaded', () => renderRelTimes());

  // ── v2: Sticky header shrink + scroll progress bar ────────────────────────
  // session33 fix: দুটো লেআউট সিস্টেম আছে — public পেজে layout.ejs (#mainHeader),
  // ইউজার পেজে partials/header.ejs (#topbar)। আগে শুধু #mainHeader খোঁজা হতো, ফলে
  // ৩৯টা ইউজার পেজে shrink/feature গুলো নীরবে মরে যেত। .btclf-topbar দুটোতেই আছে,
  // তাই সেটাই এখন প্রাইমারি সিলেক্টর।
  const header = document.querySelector('.btclf-topbar') || document.getElementById('mainHeader') || document.getElementById('topbar');
  // session33 fix: progress-bar + back-to-top markup আগে শুধু layout.ejs-এ ছিল।
  // এখন main.js নিজেই (idempotent) ইনজেক্ট করে — সব পেজে কাজ করে।
  if (!document.getElementById('scrollProgress')) {
    const sp = document.createElement('div');
    sp.className = 'scroll-progress';
    sp.id = 'scrollProgress';
    if (document.body.firstChild) document.body.insertBefore(sp, document.body.firstChild);
    else document.body.appendChild(sp);
  }
  if (!document.getElementById('backToTop')) {
    const bt = document.createElement('button');
    bt.className = 'back-to-top';
    bt.id = 'backToTop';
    bt.type = 'button';
    bt.setAttribute('aria-label', 'উপরে ফিরে যান');
    bt.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(bt);
  }
  const progress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');
  const heroBg = document.querySelector('.hero.brand-hero');

  let lastScrollY = 0;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    const max = Math.max(1, document.body.scrollHeight - window.innerHeight);

    // Shrink header after 50px
    if (header) header.classList.toggle('shrunk', y > 50);

    // Update progress bar
    if (progress) progress.style.width = Math.min(100, (y / max) * 100) + '%';

    // Show back-to-top after 400px
    if (backToTop) backToTop.classList.toggle('show', y > 400);

    // Parallax on home hero (only when hero is in/near viewport)
    if (heroBg) {
      const rect = heroBg.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        heroBg.style.transform = 'translate3d(0, ' + (y * 0.3) + 'px, 0)';
      }
    }

    lastScrollY = y;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  // Back-to-top click
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── v2: Reveal-on-scroll (IntersectionObserver) ───────────────────────────
  if ('IntersectionObserver' in window) {
    // threshold 0 (any visible pixel) — a percentage threshold never fires for
    // sections taller than the viewport (e.g. /members with dozens of cards),
    // which left those sections permanently invisible.
    const revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.reveal, .reveal-stagger').forEach(function (el) {
      revealIO.observe(el);
    });
  } else {
    // Fallback: just show everything
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(function (el) {
      el.classList.add('in');
    });
  }

  // Initial run
  onScroll();
})();

/* ============= Topbar dropdowns + mega menu ============= */
function openMenu() {
  const s = document.getElementById('mobileSidebar');
  const o = document.getElementById('mobileOverlay');
  if (s) { s.classList.add('open'); s.setAttribute('aria-hidden', 'false'); }
  if (o) o.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  const s = document.getElementById('mobileSidebar');
  const o = document.getElementById('mobileOverlay');
  if (s) { s.classList.remove('open'); s.setAttribute('aria-hidden', 'true'); }
  if (o) o.classList.remove('show');
  document.body.style.overflow = '';
}
window.openMenu = openMenu; window.closeMenu = closeMenu;
document.addEventListener('DOMContentLoaded', function () {
  const t = document.getElementById('menuToggle');
  const c = document.getElementById('closeSidebar');
  const o = document.getElementById('mobileOverlay');
  if (t) t.addEventListener('click', openMenu);
  if (c) c.addEventListener('click', closeMenu);
  if (o) o.addEventListener('click', closeMenu);
  // Close on Esc
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); closeMega(); } });

  // Sticky-shadow on topbar
  const topbar = document.getElementById('topbar');
  if (topbar) {
    window.addEventListener('scroll', function () {
      topbar.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }
});

function toggleMega(e) {
  if (e) e.stopPropagation();
  const m = document.getElementById('megaMenu');
  if (m) m.classList.toggle('open');
}
function closeMega() {
  const m = document.getElementById('megaMenu');
  if (m) m.classList.remove('open');
}
window.toggleMega = toggleMega;
window.closeMega = closeMega;

/* ── Notification bell + user dropdown toggles (header onclick) ── */
/* Bell খোলামাত্র সব নোটিফিকেশন "পঠিত" — ব্যাজ (১,২,৩) সাথে সাথে অদৃশ্য (DB-তেও is_read=1) */
function clearNotifBadge() {
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  badge.remove();
  document.querySelectorAll('#notifList .notif-item.unread')
    .forEach(el => el.classList.remove('unread'));
  fetch('/api/notifications/read', { method: 'POST' }).catch(function () {});
}
function toggleNotifs() {
  const dd = document.getElementById('notifDropdown');
  const ud = document.getElementById('userDropdown');
  if (ud) ud.classList.remove('open');
  if (dd) {
    const opening = !dd.classList.contains('open');
    dd.classList.toggle('open');
    if (opening) clearNotifBadge();
  }
}
function toggleUserMenu() {
  const dd = document.getElementById('userDropdown');
  const nd = document.getElementById('notifDropdown');
  if (nd) nd.classList.remove('open');
  if (dd) dd.classList.toggle('open');
}
window.toggleNotifs = toggleNotifs;
window.toggleUserMenu = toggleUserMenu;
document.addEventListener('click', function (e) {
  const wrap = document.getElementById('megaWrap');
  if (wrap && !wrap.contains(e.target)) closeMega();
  const nwrap = document.querySelector('.notif-bell-wrap');
  if (nwrap && !nwrap.contains(e.target)) {
    const dd = document.getElementById('notifDropdown');
    if (dd) dd.classList.remove('open');
  }
  const uwrap = document.querySelector('.user-menu-wrap');
  if (uwrap && !uwrap.contains(e.target)) {
    const ud = document.getElementById('userDropdown');
    if (ud) ud.classList.remove('open');
  }
});

/* ============= Toast ============= */
function showToast(msg, type) {
  type = type || '';
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 350);
  }, 2400);
}
window.showToast = showToast;

/* ============= v3: Reactions (5 emoji) ============= */
(function () {
  // Build marker — lets anyone verify in the DevTools console that the
  // browser is running THIS main.js (not a stale cached copy).
  console.log('%cলেখক ফোরাম · main.js build 2026-09-04-r3 (hold+slide reactions)', 'color:#059669;font-weight:600');
  const META = {
    like: { emoji: '👍', label: 'লাইক' },
    love: { emoji: '❤️', label: 'ভালোবাসা' },
    haha: { emoji: '😂', label: 'হাহা' },
    wow:  { emoji: '😮', label: 'বিস্ময়' },
    sad:  { emoji: '😢', label: 'দুঃখ' }
  };

  function loggedIn() { return !!document.querySelector('.topbar-tabs a[href="/settings"]'); }

  async function react(wrap, reactionType) {
    const targetId = wrap.dataset.targetId;
    const targetType = wrap.dataset.targetType;
    const res = await fetch('/api/react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_id: targetId, target_type: targetType, reaction_type: reactionType })
    });
    if (!res.ok) {
      if (res.status === 401) { location.href = '/login?next=' + encodeURIComponent(location.pathname); return; }
      showToast('প্রতিক্রিয়া জানানো যায়নি', 'error');
      return;
    }
    const data = await res.json();
    updateBar(wrap, data.reactions || {}, data.total, data.mine);
  }

  function updateBar(wrap, counts, total, mine) {
    const main = wrap.querySelector('.main-react');
    const emojiEl = wrap.querySelector('.rb-emoji');
    const labelEl = wrap.querySelector('.rb-label');
    if (mine) {
      main.classList.add('active');
      main.dataset.mine = mine;
      emojiEl.textContent = META[mine].emoji;
      labelEl.textContent = META[mine].label;
    } else {
      main.classList.remove('active');
      main.dataset.mine = '';
      emojiEl.textContent = '👍';
      labelEl.textContent = 'লাইক';
    }
    // picker selected state
    wrap.querySelectorAll('.reaction-opt').forEach(o => {
      o.classList.toggle('selected', o.dataset.reaction === mine);
    });
    // summary (bubble emojis + total) — show top 3
    const sumWrap = wrap.parentElement.querySelector('.reaction-summary');
    if (sumWrap) {
      const top = Object.entries(counts).filter(e => e[1] > 0)
        .sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => META[e[0]] ? META[e[0]].emoji : '');
      sumWrap.querySelector('.rs-emojis').textContent = top.join('');
      sumWrap.querySelector('.rs-count').textContent = total > 0 ? total : '';
    }
  }

  function initBar(bar) {
    const wrap = bar.querySelector('.react-wrap');
    if (!wrap || wrap.dataset.initialized) return;
    wrap.dataset.initialized = '1';

    const mainBtn = wrap.querySelector('.main-react');
    const picker = wrap.querySelector('.reaction-picker');

    // Facebook-style reactions:
    //   • quick click  → toggle the default reaction (like/unlike)
    //   • hover        → open the picker (pointer devices that support it)
    //   • press & hold → open the picker; then SLIDE over an emoji and
    //     release to select it (works with touch AND mouse)
    // The previous version fired the reaction on every single click AND
    // force-closed the picker 400ms later, so a different reaction could
    // never actually be chosen.
    let pressTimer = null;
    let longPressOpened = false;
    let holdPreview = null; /* option currently highlighted while holding */
    const LONG_PRESS_MS = 350;

    function openPicker() {
      picker.classList.add('open');
      /* haptic cue that the hold registered (mobile) */
      if (navigator.vibrate) { try { navigator.vibrate(15); } catch (_) {} }
    }
    function closePicker() { picker.classList.remove('open'); }
    function clearPreview() { if (holdPreview) { holdPreview.classList.remove('preview'); holdPreview = null; } }
    function previewOpt(opt) {
      if (opt !== holdPreview) { clearPreview(); if (opt) { opt.classList.add('preview'); holdPreview = opt; } }
    }
    function startPress() {
      longPressOpened = false;
      clearTimeout(pressTimer);
      pressTimer = setTimeout(() => { openPicker(); longPressOpened = true; }, LONG_PRESS_MS);
    }
    function cancelPress() { clearTimeout(pressTimer); }
    function applyReaction(reaction) {
      if (!loggedIn()) return location.href = '/login?next=' + encodeURIComponent(location.pathname);
      react(wrap, reaction);
      closePicker();
    }

    // Desktop hover (pointer devices only — touch reports hover:hover=false
    // so this never fights with the press-and-hold handling below).
    if (window.matchMedia('(hover: hover)').matches) {
      wrap.addEventListener('mouseenter', openPicker);
      wrap.addEventListener('mouseleave', closePicker);
    }

    // ── Mouse + touch: press-and-hold opens the picker; sliding over an
    // emoji previews it; releasing applies it (Facebook-style). Resolution
    // uses event-target traversal (NOT stored coordinates) so a shift of
    // the picker/scroll position can never make the gesture misfire. ──
    let suppressClick = false; /* a completed hold must not ALSO toggle on the click that follows */
    mainBtn.addEventListener('mousedown', startPress);

    function optFromEvent(e) {
      if (e.target && e.target.closest) { const o = e.target.closest('.reaction-opt'); if (o) return o; }
      const el = document.elementFromPoint(e.clientX, e.clientY);
      return el && el.closest ? el.closest('.reaction-opt') : null;
    }

    // While holding, moving over an emoji highlights it (mouse + touch).
    wrap.addEventListener('mousemove', (e) => {
      if (longPressOpened) previewOpt(optFromEvent(e));
    });

    // Release can happen anywhere (button, emoji, elsewhere on the page)
    // once a hold is in progress — hence the document-level listener.
    document.addEventListener('mouseup', (e) => {
      if (!longPressOpened) return;
      cancelPress();
      longPressOpened = false;
      suppressClick = true; /* swallow the click that trails this gesture */
      setTimeout(() => { suppressClick = false; }, 0);
      const opt = optFromEvent(e);
      if (opt) { clearPreview(); applyReaction(opt.dataset.reaction); }
      else {
        if (!(e.target.closest && e.target.closest('.react-wrap'))) closePicker();
        /* released on the button itself → picker stays open for a click */
      }
      clearPreview();
    });
    mainBtn.addEventListener('mouseleave', cancelPress);
    // Android: long-press would otherwise open the system text-selection /
    // context menu (~500ms) and break the hold gesture. A react button never
    // needs a context menu.
    mainBtn.addEventListener('contextmenu', (e) => e.preventDefault());

    // ── Touch: hold opens, slide previews, release selects ──
    // (Touch events keep firing on the element where the touch STARTED,
    // so binding move/end here covers the slide even over the picker.)
    mainBtn.addEventListener('touchstart', startPress, { passive: true });
    mainBtn.addEventListener('touchmove', (e) => {
      if (!longPressOpened) return; /* not holding → normal scrolling */
      e.preventDefault();           /* picker open → stop scroll, slide-select */
      const t = e.touches[0];
      const el = document.elementFromPoint(t.clientX, t.clientY);
      previewOpt(el && el.closest ? el.closest('.reaction-opt') : null);
    }, { passive: false });
    mainBtn.addEventListener('touchend', (e) => {
      cancelPress();
      if (longPressOpened) {
        e.preventDefault(); /* suppress the synthetic click after a hold */
        longPressOpened = false;
        suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);
        if (holdPreview) { const r = holdPreview.dataset.reaction; clearPreview(); applyReaction(r); }
        /* no slide → keep the picker open; next tap selects an option */
      } else { clearPreview(); }
    }, { passive: false });
    mainBtn.addEventListener('touchcancel', () => { cancelPress(); clearPreview(); longPressOpened = false; }, { passive: true });

    // Quick click → toggle default reaction (long-press gestures above
    // consume their own click via suppressClick, so this only fires for
    // plain taps).
    mainBtn.addEventListener('click', () => {
      if (suppressClick) { suppressClick = false; return; }
      if (!loggedIn()) return location.href = '/login?next=' + encodeURIComponent(location.pathname);
      if (longPressOpened) { longPressOpened = false; return; }
      const mine = mainBtn.dataset.mine || '';
      // Sending the same reaction again toggles it off server-side (POST
      // /api/react) — click applies 'like' when nothing is set, removes it
      // when the current reaction is 'like'.
      react(wrap, mine || 'like');
    });

    wrap.querySelectorAll('.reaction-opt').forEach(opt => {
      opt.addEventListener('click', e => {
        e.stopPropagation();
        if (!loggedIn()) return location.href = '/login?next=' + encodeURIComponent(location.pathname);
        react(wrap, opt.dataset.reaction);
        closePicker();
      });
    });
  }

  // Close any open picker when clicking elsewhere on the page.
  document.addEventListener('click', e => {
    if (!e.target.closest('.react-wrap')) {
      document.querySelectorAll('.reaction-picker.open').forEach(p => p.classList.remove('open'));
    }
  });

  function initAll(root) { (root || document).querySelectorAll('.actions-bar').forEach(initBar); }
  window.LekhokReactions = { init: initAll };
  document.addEventListener('DOMContentLoaded', () => initAll());
})();

/* ============= v3: Share menu + share-to-user ============= */
(function () {
  const LOGGED_IN = () => !!document.querySelector('.topbar-tabs a[href="/settings"]');

  function currentUrl(menu) {
    const path = menu.dataset.shareUrl || location.pathname;
    return location.origin + path;
  }

  function openTargets(url, title) {
    const t = encodeURIComponent(title || document.title || '');
    return {
      whatsapp: 'https://wa.me/?text=' + t + '%20' + encodeURIComponent(url),
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url),
      telegram: 'https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + t,
      x: 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + t
    };
  }

  function initMenus(root) {
    (root || document).querySelectorAll('.share-wrap').forEach(wrap => {
      if (wrap.dataset.initialized) return;
      wrap.dataset.initialized = '1';
      const trigger = wrap.querySelector('.share-trigger');
      const menu = wrap.querySelector('.share-menu');

      trigger.addEventListener('click', e => {
        e.stopPropagation();
        // close other menus
        document.querySelectorAll('.share-menu.open').forEach(m => { if (m !== menu) m.classList.remove('open'); });
        menu.classList.toggle('open');
        const url = currentUrl(menu);
        const targets = openTargets(url);
        menu.querySelectorAll('a[data-share]').forEach(a => {
          a.href = targets[a.dataset.share] || '#';
        });
      });

      menu.addEventListener('click', async e => {
        const el = e.target.closest('[data-share]');
        if (!el) return;
        e.preventDefault();
        const kind = el.dataset.share;
        const url = currentUrl(menu);
        if (kind === 'copy') {
          try {
            await navigator.clipboard.writeText(url);
            showToast('লিংক কপি হয়েছে ✓', 'success');
          } catch (_) {
            const ta = document.createElement('textarea');
            ta.value = url; document.body.appendChild(ta); ta.select();
            document.execCommand('copy'); ta.remove();
            showToast('লিংক কপি হয়েছে ✓', 'success');
          }
          menu.classList.remove('open');
        } else if (kind === 'user') {
          if (!LOGGED_IN()) return location.href = '/login';
          openShareModal(url);
          menu.classList.remove('open');
        } else if (kind === 'timeline') {
          if (!LOGGED_IN()) return location.href = '/login';
          const postId = menu.dataset.sharePost;
          menu.classList.remove('open');
          if (!postId) { showToast('শেয়ার করা যাবে না', 'error'); return; }
          el.disabled = true;
          fetch('/articles/' + postId + '/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin'
          }).then(r => r.json()).then(d => {
            if (d.ok) {
              showToast('নিজের টাইমলাইনে শেয়ার হয়েছে ✓', 'success');
              setTimeout(() => { location.href = d.redirect || '/dashboard'; }, 700);
            } else {
              showToast(d.error || 'শেয়ার ব্যর্থ হয়েছে', 'error');
              el.disabled = false;
            }
          }).catch(() => { showToast('শেয়ার ব্যর্থ হয়েছে', 'error'); el.disabled = false; });
        } else {
          // Web Share API first on mobile
          if (navigator.share && window.matchMedia('(max-width: 768px)').matches) {
            try { await navigator.share({ title: document.title, url }); menu.classList.remove('open'); return; } catch (_) {}
          }
          const targets = openTargets(url);
          if (targets[kind]) window.open(targets[kind], '_blank', 'noopener,width=620,height=560');
          menu.classList.remove('open');
        }
      });
    });
  }
  window.LekhokShare = { init: initMenus };
  document.addEventListener('DOMContentLoaded', () => initMenus());

  // close menus on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.share-wrap')) {
      document.querySelectorAll('.share-menu.open').forEach(m => m.classList.remove('open'));
    }
  });

  // ── Share-to-user modal ──────────────────────────────────────────────────
  let shareUrl = '';
  function openShareModal(url) {
    shareUrl = url;
    const modal = document.getElementById('shareUserModal');
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    const search = document.getElementById('shareUserSearch');
    search.value = '';
    document.getElementById('shareUserResults').innerHTML = '<div class="modal-empty">নাম লিখতে শুরু করুন…</div>';
    document.getElementById('shareMsg').value = '';
    setTimeout(() => search.focus(), 100);
  }

  function closeModal() {
    const modal = document.getElementById('shareUserModal');
    if (modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }
  }

  document.addEventListener('click', e => {
    if (e.target.matches('[data-close-share]') || e.target.id === 'shareUserModal') closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  let searchTimer = null;
  document.addEventListener('input', e => {
    if (e.target.id !== 'shareUserSearch') return;
    clearTimeout(searchTimer);
    const q = e.target.value.trim();
    searchTimer = setTimeout(async () => {
      const box = document.getElementById('shareUserResults');
      if (!q) { box.innerHTML = '<div class="modal-empty">নাম লিখতে শুরু করুন…</div>'; return; }
      try {
        const res = await fetch('/api/users/search?q=' + encodeURIComponent(q));
        const data = await res.json();
        if (!data.users || !data.users.length) { box.innerHTML = '<div class="modal-empty">কাউকে পাওয়া যায়নি</div>'; return; }
        box.innerHTML = data.users.map(u => `
          <button type="button" class="share-user-row" data-username="${u.username}" data-name="${u.full_name}">
            <img src="${u.avatar_url || '/avatar/' + u.id}" alt="" onerror="this.src='/assets/img/avatar-placeholder.svg'">
            <span><strong>${u.full_name}</strong><small>@${u.username}</small></span>
            <i class="fas fa-paper-plane"></i>
          </button>
        `).join('');
      } catch (_) { box.innerHTML = '<div class="modal-empty">খোঁজা যায়নি — আবার চেষ্টা করুন</div>'; }
    }, 250);
  });

  document.addEventListener('click', async e => {
    const row = e.target.closest('.share-user-row');
    if (!row) return;
    const postId = (shareUrl.match(/\/(articles|qa)\/(\d+)/) || [])[2];
    const body = document.getElementById('shareMsg').value.trim();
    const res = await fetch('/api/share-to-user', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_username: row.dataset.username, post_id: postId, message: body })
    });
    const data = await res.json();
    if (data.ok) {
      closeModal();
      showToast('পাঠানো হয়েছে ✓', 'success');
      setTimeout(() => { location.href = data.redirect; }, 500);
    } else {
      showToast(data.error === 'blocked' ? 'পাঠানো সম্ভব নয়' : 'পাঠানো যায়নি', 'error');
    }
  });

  // ── Global search — session33: layout.ejs-এর inline স্ক্রিপ্ট থেকে main.js-এ
  // সরানো হলো। আগে শুধু public পেজে কাজ করত; এখন দুটো হেডার সিস্টেমেই চলে।
  // "সব ফলাফল" লিংক ড্রপডাউনের নিচে যোগ হয়েছে (/search?q= পূর্ণ পেজ)।
  (function initGlobalSearch() {
    const wrap = document.getElementById('globalSearchWrap');
    const dd = document.getElementById('globalSearchDropdown');
    const input = document.getElementById('globalSearchInput');
    const results = document.getElementById('globalSearchResults');
    if (!wrap || !dd || !input || !results) return;

    let gsTimer = null, gsLast = '';
    function openSearch() { dd.hidden = false; setTimeout(() => input.focus(), 50); }
    function closeSearch() { dd.hidden = true; }
    window.toggleGlobalSearch = function () { if (dd.hidden) openSearch(); else closeSearch(); };

    function escapeHtml(t) { return String(t || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
    function highlight(text, q) {
      if (!q) return escapeHtml(text);
      const idx = String(text).toLowerCase().indexOf(q.toLowerCase());
      if (idx === -1) return escapeHtml(text);
      return escapeHtml(text.substring(0, idx)) + '<mark>' + escapeHtml(text.substring(idx, idx + q.length)) + '</mark>' + escapeHtml(text.substring(idx + q.length));
    }
    function seeAllRow(q) {
      return '<a class="gs-row gs-see-all" href="/search?q=' + encodeURIComponent(q) + '"><i class="fas fa-arrow-right"></i><div class="gs-meta"><div class="gs-title">“' + escapeHtml(q) + '” এর সব ফলাফল দেখুন</div></div></a>';
    }
    async function doGlobalSearch(q) {
      q = (q || '').trim();
      if (q === gsLast) return;
      gsLast = q;
      if (q.length < 2) { results.innerHTML = '<div class="gs-hint">অন্তত ২ অক্ষর লিখুন...</div>'; return; }
      results.innerHTML = '<div class="gs-loading"><i class="fas fa-spinner fa-spin"></i> খুঁজছি...</div>';
      try {
        const r = await fetch('/api/search?q=' + encodeURIComponent(q));
        const data = await r.json();
        if (q !== gsLast || dd.hidden) return; // stale response guard
        let html = '';
        if (data.articles && data.articles.length) {
          html += '<div class="gs-section"><div class="gs-section-head"><i class="fas fa-pen-nib"></i> লেখা <span class="gs-count">' + data.articles.length + '</span></div>';
          data.articles.slice(0, 5).forEach(a => { html += '<a class="gs-row" href="/articles/' + a.id + '"><i class="fas fa-file-alt"></i><div class="gs-meta"><div class="gs-title">' + highlight(a.title, q) + '</div><div class="gs-sub">' + escapeHtml(a.author_name || '') + '</div></div></a>'; });
          html += '</div>';
        }
        if (data.questions && data.questions.length) {
          html += '<div class="gs-section"><div class="gs-section-head"><i class="fas fa-question-circle"></i> প্রশ্ন <span class="gs-count">' + data.questions.length + '</span></div>';
          data.questions.slice(0, 5).forEach(qu => { html += '<a class="gs-row" href="/qa/' + qu.id + '"><i class="fas fa-question"></i><div class="gs-meta"><div class="gs-title">' + highlight(qu.title, q) + '</div><div class="gs-sub">' + escapeHtml(qu.author_name || '') + '</div></div></a>'; });
          html += '</div>';
        }
        if (data.users && data.users.length) {
          html += '<div class="gs-section"><div class="gs-section-head"><i class="fas fa-users"></i> সদস্য <span class="gs-count">' + data.users.length + '</span></div>';
          data.users.slice(0, 5).forEach(u => { html += '<a class="gs-row" href="/profile/' + encodeURIComponent(u.username) + '"><img loading="lazy" decoding="async" class="gs-avatar" src="' + (u.avatar_url || '/avatar/' + u.id) + '" onerror="this.src=\'/assets/avatars/neutral.svg\'" /><div class="gs-meta"><div class="gs-title">' + highlight(u.full_name, q) + '</div><div class="gs-sub">@' + highlight(u.username, q) + '</div></div></a>'; });
          html += '</div>';
        }
        if (!html) html = '<div class="gs-empty"><i class="fas fa-search"></i><p>কোনো ফলাফল পাওয়া যায়নি</p></div>';
        else html += seeAllRow(q);
        results.innerHTML = html;
      } catch (e) { results.innerHTML = '<div class="gs-empty"><i class="fas fa-exclamation-circle"></i><p>সার্চ ব্যর্থ</p></div>'; }
    }

    input.addEventListener('input', function () { if (gsTimer) clearTimeout(gsTimer); gsTimer = setTimeout(() => doGlobalSearch(this.value), 220); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeSearch(); this.blur(); }
      if (e.key === 'Enter') { e.preventDefault(); window.location = '/search?q=' + encodeURIComponent(this.value.trim()); }
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('#globalSearchWrap')) closeSearch(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && !e.target.matches('input, textarea, select, [contenteditable="true"]')) { e.preventDefault(); openSearch(); }
    });
  })();


  // ── ইউজার ফিড শোকেস ক্যারোসেল (সেশন ৩৫ — হিরো থেকে সরিয়ে ফিড সেকশনে ইন্টিগ্রেট) ─
  (function initFeedCarousel() {
    const root = document.getElementById('feedCarousel');
    const track = document.getElementById('fcTrack');
    const dotsWrap = document.getElementById('fcDots');
    if (!root || !track || !dotsWrap) return;
    const slides = track.children;
    const count = slides.length;
    if (count < 2) return;
    let idx = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // build dots
    const dots = [];
    for (let i = 0; i < count; i++) {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'fc-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'স্লাইড ' + (i + 1));
      d.addEventListener('click', () => { go(i); restart(); });
      dotsWrap.appendChild(d);
      dots.push(d);
    }
    function go(i) {
      idx = ((i % count) + count) % count;
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      dots.forEach((d, j) => d.classList.toggle('active', j === idx));
    }

    let timer = null;
    function start() {
      if (reduce || timer) return;
      timer = setInterval(() => { if (!document.hidden) go(idx + 1); }, 6000);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);
    go(0);
    start();
  })();

})();

/* ============= v3: Bookmark toggle ============= */
document.addEventListener('click', async e => {
  const btn = e.target.closest('.bookmark-btn');
  if (!btn) return;
  if (!document.querySelector('.topbar-tabs a[href="/settings"]')) {
    return location.href = '/login?next=' + encodeURIComponent(location.pathname);
  }
  const res = await fetch('/api/bookmark', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ post_id: btn.dataset.bookmarkId })
  });
  if (res.ok) {
    const data = await res.json();
    btn.classList.toggle('active', data.saved);
    btn.querySelector('i').className = (data.saved ? 'fas' : 'far') + ' fa-bookmark';
    showToast(data.saved ? 'সংরক্ষিত হয়েছে 📌' : 'সংরক্ষণ সরানো হয়েছে', 'success');
  }
});

/* ============= v3: Inline follow buttons (sidebar / feed) ============= */
document.addEventListener('click', async e => {
  const btn = e.target.closest('.follow-inline');
  if (!btn) return;
  if (!document.querySelector('.topbar-tabs a[href="/settings"]')) {
    return location.href = '/login?next=' + encodeURIComponent(location.pathname);
  }
  const res = await fetch('/follow/' + btn.dataset.user, { method: 'POST' });
  const data = await res.json();
  if (data.following) {
    btn.innerHTML = '<i class="fas fa-check"></i>';
    btn.classList.add('following');
    showToast('অনুসরণ করছেন ✓', 'success');
  } else {
    btn.innerHTML = '<i class="fas fa-plus"></i>';
    btn.classList.remove('following');
  }
});

/* ============= Leadership cards: whole-card click → profile (সেশন ৩০) ============= */
/* আগে linked কার্ড পুরোটা <a>-তে মোড়ানো হতো — ভেতরে সোশ্যাল আইকনের <a> থাকায়
   nested anchor হয়ে ব্রাউজার কার্ড ভেঙে ফেলত (৩ টুকরো)। এখন কার্ড <div> +
   data-href: কার্ডের যেকোনো জায়গায় ক্লিকে প্রোফাইলে যাওয়া, তবে ভেতরের কোনো
   <a> (fb/email/profile আইকন)-এ ক্লিক হলে সেটার স্বাভাবিক আচরণই চলে। */
document.addEventListener('click', function (e) {
  const card = e.target.closest('.leader-card-featured[data-href]');
  if (!card) return;
  if (e.target.closest('a')) return;
  location.href = card.getAttribute('data-href');
});
