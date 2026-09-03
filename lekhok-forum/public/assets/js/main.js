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
  const header = document.getElementById('mainHeader');
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
    const revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

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
function toggleNotifs() {
  const dd = document.getElementById('notifDropdown');
  const ud = document.getElementById('userDropdown');
  if (ud) ud.classList.remove('open');
  if (dd) dd.classList.toggle('open');
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

    // Desktop hover; mobile long-press handled via touchstart timer
    let pressTimer = null;
    wrap.addEventListener('mouseenter', () => { if (window.matchMedia('(hover:hover)').matches) picker.classList.add('open'); });
    wrap.addEventListener('mouseleave', () => picker.classList.remove('open'));
    mainBtn.addEventListener('touchstart', () => {
      pressTimer = setTimeout(() => picker.classList.add('open'), 350);
    }, { passive: true });
    ['touchend', 'touchcancel'].forEach(ev =>
      mainBtn.addEventListener(ev, () => { clearTimeout(pressTimer); }, { passive: true })
    );

    // Quick react (default = current mine? toggle like) on main button click
    mainBtn.addEventListener('click', () => {
      if (!loggedIn()) return location.href = '/login?next=' + encodeURIComponent(location.pathname);
      const mine = mainBtn.dataset.mine || '';
      picker.classList.toggle('open');
      if (picker.classList.contains('open') && window.matchMedia('(hover:hover)').matches) {
        // desktop: hovering already opened; clicking toggles like
      }
      react(wrap, mine ? mine : 'like');
      setTimeout(() => picker.classList.remove('open'), 400);
    });

    wrap.querySelectorAll('.reaction-opt').forEach(opt => {
      opt.addEventListener('click', e => {
        e.stopPropagation();
        if (!loggedIn()) return location.href = '/login?next=' + encodeURIComponent(location.pathname);
        react(wrap, opt.dataset.reaction);
        picker.classList.remove('open');
      });
    });
  }

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
