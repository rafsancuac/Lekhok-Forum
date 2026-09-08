/* সেশন ৬০: ইন্টারঅ্যাক্টিভ কুইজ — ক্লায়েন্ট লজিক
 * • অপশন-ক্লিকে POST /quiz/check (উত্তর সার্ভারে, view-source-এ নেই)
 * • সাথে সাথে ফিডব্যাক: সঠিক=সবুজ, ভুল=লালচে + সঠিকটি হাইলাইট + ব্যাখ্যা-বক্স
 * • স্কোর localStorage-এ (lf_quiz_v1) — রিলোডে পূর্বের উত্তর-স্টেট ফিরে আসে
 * • সেশন ৬২: লগইন-ইউজারের স্কোর সার্ভারেও (quiz_attempts টেবিল) —
 *   #quizServerState JSON থেকে মার্জ; সার্ভার-স্টেট প্রাধান্য পায়। ডিভাইস-
 *   বদলেও আগের উত্তর-স্টেট ফিরে আসে (localStorage খালি হলেও)।
 */
(function () {
  'use strict';

  var LS_KEY = 'lf_quiz_v1';
  var BN_DIGITS = '০১২৩৪৫৬৭৮৯';

  function loadStore() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveStore(s) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch (e) { /* প্রাইভেট-মোড ইত্যাদি */ }
  }
  function bn(n) {
    return String(n).replace(/\d/g, function (d) { return BN_DIGITS[+d]; });
  }

  var store = loadStore();

  /* ── সেশন ৬২: সার্ভার-স্টেট মার্জ (লগইন-ইউজার) ── */
  var server = null, serverStats = null;
  (function loadServerState() {
    var el = document.getElementById('quizServerState');
    if (!el) return;
    try {
      var d = JSON.parse(el.textContent || '{}');
      if (d && d.attempts) {
        server = d.attempts;
        serverStats = d.stats || null;
        // localStorage-এ না-থাকা সার্ভার-উত্তর বসিয়ে দিই (ক্রস-ডিভাইস রিস্টোর)
        Object.keys(server).forEach(function (k) {
          var sv = server[k];
          if (sv && (!store[k] || !store[k].answered)) {
            store[k] = { answered: true, choice: sv.choice, correct: !!sv.correct, ts: 0 };
          }
        });
        saveStore(store);
      }
    } catch (e) { /* খারাপ JSON — লোকাল-অনলি মোড */ }
  })();

  /* ── স্কোর-বার আপডেট ── */
  function updateScoreBar() {
    var bar = document.getElementById('quizScoreBar');
    if (!bar) return;
    // সেশন ৬২: লগইন-ইউজারের সার্ভার-স্ট্যাট প্রাধান্য পায় (DB-সত্য)
    if (serverStats) {
      var todayId = bar.getAttribute('data-today-id');
      var todayVal = '—';
      if (todayId && server[todayId]) todayVal = server[todayId].correct ? '১/১' : '০/১';
      bar.hidden = false;
      setVals(todayVal, bn(serverStats.correct) + '/' + bn(serverStats.answered), bn(serverStats.streak));
      return;
    }
    var entries = Object.keys(store)
      .map(function (k) { return store[k]; })
      .filter(function (v) { return v && v.answered; })
      .sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
    if (!entries.length) { bar.hidden = false; setVals('—', '—', '—'); return; }

    var totalCorrect = 0, streak = 0, i;
    for (i = 0; i < entries.length; i++) if (entries[i].correct) totalCorrect++;
    for (i = entries.length - 1; i >= 0; i--) {
      if (entries[i].correct) streak++; else break;
    }
    var todayId = bar.getAttribute('data-today-id');
    var todayVal = '—';
    if (todayId && store[todayId] && store[todayId].answered) {
      todayVal = store[todayId].correct ? '১/১' : '০/১';
    }
    bar.hidden = false;
    setVals(todayVal, bn(totalCorrect) + '/' + bn(entries.length), bn(streak));
    function setVals(a, b, c) {
      var t = document.getElementById('qsToday'); if (t) t.textContent = a;
      var tt = document.getElementById('qsTotal'); if (tt) tt.textContent = b;
      var st = document.getElementById('qsStreak'); if (st) st.textContent = c;
    }
  }

  /* ── একটি কুইজ-ব্লক আঁকা (ফিডব্যাক-স্টেট) ── */
  function paint(block, choice, correct, answer, body) {
    var opts = block.querySelectorAll('.quiz-opt');
    for (var i = 0; i < opts.length; i++) {
      var btn = opts[i];
      var idx = parseInt(btn.getAttribute('data-i'), 10);
      btn.disabled = true;
      if (answer !== null && answer !== undefined && idx === answer) {
        btn.classList.add('is-correct');
      } else if (idx === choice) {
        btn.classList.add(correct ? 'is-correct' : 'is-wrong');
      } else {
        btn.classList.add('is-muted');
      }
    }
    var result = block.querySelector('.quiz-result');
    if (result) {
      result.hidden = false;
      result.className = 'quiz-result ' + (correct ? 'is-ok' : 'is-no');
      if (correct) {
        result.innerHTML = '<i class="fas fa-circle-check"></i> <strong>চমৎকার! সঠিক উত্তর।</strong>'
          + (body ? '<p class="quiz-explain">' + esc(body) + '</p>' : '');
      } else {
        result.innerHTML = '<i class="fas fa-circle-xmark"></i> <strong>উত্তরটি সঠিক হয়নি।</strong>'
          + (body ? '<p class="quiz-explain">' + esc(body) + '</p>' : '');
      }
    }
    block.classList.add('quiz-done');
    if (correct) celebrate(block);
  }

  function celebrate(block) {
    if (!window.requestAnimationFrame) return;
    var card = block.classList.contains('quiz-card') ? block : block.closest('.quiz-arch-item') || block;
    card.classList.add('quiz-celebrate');
    window.setTimeout(function () { card.classList.remove('quiz-celebrate'); }, 900);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function showError(block) {
    var result = block.querySelector('.quiz-result');
    if (result) {
      result.hidden = false;
      result.className = 'quiz-result is-err';
      result.innerHTML = '<i class="fas fa-triangle-exclamation"></i> যাচাই করা যাচ্ছে না — একটু পরে আবার চেষ্টা করুন।';
    }
  }

  /* ── একটি কুইজ-ব্লক চালু ── */
  function initBlock(block) {
    var id = String(block.getAttribute('data-quiz') || '');
    var optBtns = block.querySelectorAll('.quiz-opt');
    if (!id || !optBtns.length) return;

    // আগের উত্তর থাকলে সাথে সাথে স্টেট আঁকা (সার্ভার-রাউন্ডট্রিপ লাগে না)
    var prev = store[id];
    if (prev && prev.answered) {
      paint(block, prev.choice, !!prev.correct, prev.answer, prev.body);
      return;
    }

    for (var i = 0; i < optBtns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          if (block.classList.contains('quiz-done')) return;
          var choice = parseInt(btn.getAttribute('data-i'), 10);
          block.classList.add('quiz-busy');
          fetch('/quiz/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ id: parseInt(id, 10), choice: choice })
          }).then(function (r) { return r.json(); })
            .then(function (d) {
              block.classList.remove('quiz-busy');
              if (!d || !d.ok) { showError(block); return; }
              // সেশন ৬২: সার্ভারে আগের চূড়ান্ত উত্তর থাকলে (অন্য ডিভাইস/ট্যাবে
              // দেওয়া) সেটিই দেখাই — প্রথম উত্তরই চূড়ান্ত।
              var shown = { choice: choice, correct: !!d.correct };
              if (d.final) shown = { choice: d.final.choice, correct: !!d.final.correct };
              paint(block, shown.choice, shown.correct, d.answer, d.body);
              store[id] = {
                answered: true, choice: shown.choice, correct: shown.correct,
                answer: d.answer, body: d.body, ts: Date.now()
              };
              // সার্ভার-স্ট্যাট রিফ্রেশ (recorded হলে লাইভ-আপডেট)
              if (serverStats && d.recorded) {
                serverStats.answered++;
                if (shown.correct) {
                  serverStats.correct++;
                  serverStats.streak++;
                } else {
                  serverStats.streak = 0;
                }
                server[id] = { choice: shown.choice, correct: shown.correct, ts: 0 };
              }
              saveStore(store);
              updateScoreBar();
            })
            .catch(function () {
              block.classList.remove('quiz-busy');
              showError(block);
            });
        });
      })(optBtns[i]);
    }
  }

  /* ── বুট ── */
  document.querySelectorAll('[data-quiz]').forEach(initBlock);
  updateScoreBar();
})();
