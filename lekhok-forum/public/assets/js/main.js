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

  // ── v2: Sticky header shrink + scroll progress bar ────────────────────────
  const header = document.getElementById('mainHeader');
  const progress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');
  const heroBg = document.querySelector('.hero.curhs');

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
