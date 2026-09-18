/* ═══════════════════════════════════════════════════════════════════════════
   সেশন ৯৩ — LekhokCall: WebRTC অডিও/ভিডিও কল (HTTP-পোলিং সিগন্যালিং)
   ─────────────────────────────────────────────────────────────────────────
   Vercel-serverless-নিরাপদ: কোনো WebSocket নেই — সিগন্যাল (SDP/ICE) যায়
   /api/calls/* এন্ডপয়েন্ট দিয়ে, ক্লায়েন্ট অ্যাডাপটিভ ইন্টারভালে পোল করে।

   বিল্ট-ইন হার্ডেনিং (ক্লাসিক WebRTC-ফেইল-ফিক্স সেট):
   ① ICE-candidate QUEUE — remoteDescription সেট হওয়ার আগে এলে কিউতে থাকে,
      সেট-হওয়ার সাথে সাথেই drain (InvalidStateError/race-condition-নিরাপদ)
   ② STUN×২ + TURN-রিলে — ভিন্ন নেটওয়ার্ক/মোবাইল-ডাটাতেও NAT-traversal
   ③ autoPlay+playsInline+muted(local) — autoplay-policy ও echo-নিরাপদ;
      play() প্রত্যাখ্যাত হলে "ট্যাপ করে চালু করুন" ফলব্যাক
   ④ সম্পূর্ণ স্টেট-মেশিন + ক্লিনআপ — ট্র্যাক-স্টপ, pc.close, টাইমার-ক্লিয়ার,
      beforeunload/pagehide-এ keepalive end-কল

   ব্যবহার: window.LekhokCallCtx = { me, meName, meAvatar, convId, convUsername, peer }
   তারপর LekhokCall.start('audio'|'video')
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* সেশন ৯৪: গ্লোবাল-রিংগার — মডিউল এখন header.ejs থেকে সব লগড-ইন পেজে লোড হয়।
     ctx আর লোড-টাইমে স্থির করা হয় না — প্রতিবার পড়া হয় (মেসেঞ্জার-ভিউগুলো পরে
     window.LekhokCallCtx সমৃদ্ধ করে দেয় — convId/peer)। ডাবল-ইনক্লুড নিরাপদ। */
  if (window.LekhokCall) return; /* ডাবল-ইনক্লুড গার্ড — দ্বিতীয় পোল-লুপ নয় */
  function C() { return window.LekhokCallCtx || {}; }
  if (!C().me) return; /* অতিথি-পেজে মডিউল নিষ্ক্রিয় */

  var RTC_CFG = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'turn:openrelay.metered.ca:80', username: 'openrelay', credential: 'openrelay' },
      { urls: 'turn:openrelay.metered.ca:80?transport=tcp', username: 'openrelay', credential: 'openrelay' },
      { urls: 'turn:openrelay.metered.ca:443', username: 'openrelay', credential: 'openrelay' },
      { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelay', credential: 'openrelay' }
    ],
    iceCandidatePoolSize: 10
  };

  /* সেশন ৯৭: ঐচ্ছিক env-TURN — header.ejs window.LekhokCallCtx.iceServers-এ দিলে
     (LEKHOK_TURN_URLS/USERNAME/CREDENTIAL) openrelay-এর বদলে সেটিই ব্যবহার হয়।
     ctx লেজি-পাঠ — createPC-এর সময় পড়া হয় (পেজ-লাইফসাইকেলে বদলালেও ধরা পড়ে)। */
  function rtcConfig() {
    var c = C();
    var srv = (c.iceServers && c.iceServers.length) ? c.iceServers : RTC_CFG.iceServers;
    return { iceServers: srv, iceCandidatePoolSize: 10 };
  }

  var BN = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  function bn(n) { return String(n).replace(/[0-9]/g, function (d) { return BN[+d]; }); }

  /* ── স্টেট ─────────────────────────────────────────────────────────────── */
  var S = {
    state: 'idle',          // idle|outgoing|incoming|connecting|connected
    callId: null,
    kind: 'audio',
    role: null,             // caller|callee
    peer: null,             // {id,name,avatar,username}
    pendingOffer: null,
    pc: null,
    local: null,            // MediaStream
    remote: null,
    after: 0,               // signal-cursor
    queue: [],              // আসা ICE যেগুলোর remoteDescription এখনো সেট হয়নি
    outBuf: [],             // পাঠানো-হবে ICE ব্যাচ
    flushT: null,
    pollT: null,
    incT: null,             // সেশন ৯৭: আসন্ন-কল ক্লায়েন্ট-সাইড সেফটি-টাইমআউট
    iceRestarts: 0,         // সেশন ৯৭: ICE-restart রিট্রাই-কাউন্টার
    restartAnswer: false,   // সেশন ৯৭: পিয়ারের restart-answer-এর অপেক্ষায়
    tickT: null,            // কানেক্টেড-টাইমার
    t0: 0,                  // connected-timestamp
    muted: false,
    camOff: false,
    minimized: false,
    ringing: null,          // WebAudio হ্যান্ডেল
    /* সেশন ১১১: নেটওয়ার্ক-কোয়ালিটি + ডায়াগনস্টিকস */
    qPollT: null,           // getStats-টিকার টাইমার
    statsOpen: false,       // ডায়াগনস্টিকস-প্যানেল খোলা কি-না
    lastStats: null,        // সর্বশেষ নমুনা {rtt,path,local,remote,jitter,lost,kbps}
    poorStreak: 0,          // টানা দুর্বল-নমুনা
    poorNotified: false,    // দুর্বল-নেটওয়ার্ক টোস্ট (একবারী)
    /* সেশন ১৩১: অটো-ভিডিও-ডিগ্রেড (সাশ্রয়-ল্যাডার) */
    degrade: 0,             // বর্তমান সাশ্রয়-স্তর (0-৩)
    goodStreak: 0,          // টানা ভালো-নমুনা (রিকভারি-হিস্টেরেসিস)
    degradeNotBefore: 0,    // কানেক্টের ৮সে-পরেই ইঞ্জিন-সক্রিয় (শুরুর মিথ্যা-ধনাত্মক গার্ড)
    degradeToasted: {},     // স্তর-প্রতি একবারী টোস্ট
    lastBytes: 0,           // bitrate-ডেল্টা-বেস
    lastBytesAt: 0,
    /* সেশন ১১৩: গ্রুপ-কল (mesh) — প্রতি-পিয়ার PC + গ্রিড-UI */
    group: false,           // এই-কল গ্রুপ-কল কি-না (1:1 পুরনো-পথ অক্ষুণ্ণ)
    peers: {},              // uid → {pc, info, queue, madeOffer, stream}
    meJoinedAt: null,       // আমার জয়েন-টাইমস্ট্যাম্প (গ্লেয়ার-টাই-ব্রেকে ব্যবহৃত)
    /* সেশন ১২২: UI-ফার্স্ট পারমিশন-ফ্লো + ব্যাকগ্রাউন্ড-পোল */
    permRetry: null,        // অনুমতি পেলে যে-ফাংশন থেকে কল-ফ্লো পুনঃশুরু হবে
    permBusy: false,        // রিট্রাই-চলাকালীন ডাবল-ক্লিক-গার্ড
    pollBusy: false,        // পোল-ইন-ফ্লাইট গার্ড (হার্টবিট+লুপ উভয় ট্রিগারের জন্য)
    auth401: 0,             // টানা 401-পোল-কাউন্ট (লগআউট/মেয়াদোত্তীর্ণ → ব্যাকঅফ)
    hbWorker: null,         // ব্যাকগ্রাউন্ড-ট্যাব হার্টবিট (Worker-টাইমার থ্রটল-হয় না)
    notifT: null,           // আসন্ন-কল title-flash টাইমার
    titleBase: null,        // মূল document.title (ফ্ল্যাশ-শেষে পুনঃস্থাপন)
    seq: 0                  /* সেশন ১৪৮: কল-লাইফসাইকেল-টোকেন — দ্রুত-বাতিলে (UI-ফার্স্টে
                               /start-POST-এর আগেই হ্যাংআপ) লেট-কমপ্লিটিং স্টার্ট-ফলাফল
                               নতুন-কল-অ্যাডপ্ট/ঝুলে-থাকা ringing-লক দুটোই বন্ধ */
  };

  /* ── DOM হেল্পার ───────────────────────────────────────────────────────── */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function icon(name) { return '<i class="fas ' + name + '"></i>'; }
  function toast(msg, isErr) {
    if (typeof window.fbToast === 'function') return window.fbToast(msg, isErr);
    var t = el('div', 'lc-toast' + (isErr ? ' lc-toast--err' : ''), msg);
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 10);
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 350); }, 3200);
  }

  /* ── সাউন্ড (WebAudio — কোনো এক্সটার্নাল ফাইল/CSP-ঝুঁকি নেই) ──────────── */
  var AC = null;
  function audioCtx() {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { return null; } }
    if (AC && AC.state === 'suspended') { try { AC.resume(); } catch (_) {} }
    return AC;
  }
  function beep(ac, freq, t0, dur, vol) {
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.03);
    g.gain.setValueAtTime(vol, t0 + dur - 0.05);
    g.gain.linearRampToValueAtTime(0, t0 + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
    return { o: o, g: g }; /* সেশন ১৪৮: নোড-পেয়ার ফেরত — হার্ডস্টপের জন্য ট্র্যাক */
  }
  function startRing(mode) { /* 'outgoing' রিংব্যাক | 'incoming' রিংটোন */
    stopRing();
    var ac = audioCtx(); if (!ac) return;
    var seq = [];
    if (mode === 'incoming') {          /* US-স্টাইল ডুয়াল-টোন: ২সে অন / ১সে অফ */
      for (var i = 0; i < 6; i++) { seq.push([440, 480, i * 3, 1.8, 0.06]); }
    } else {                            /* রিংব্যাক: ৪২৫Hz, ১সে অন / ৩সে অফ */
      for (var j = 0; j < 10; j++) { seq.push([425, 0, j * 4, 1.2, 0.05]); }
    }
    var now = ac.currentTime + 0.05;
    var nodes = [];
    seq.forEach(function (s) {
      if (s[2] === 0 && s[3] === 0) return;
      nodes.push(beep(ac, s[0], now + s[2], s[3], s[4]));
      if (s[1]) nodes.push(beep(ac, s[1], now + s[2], s[3], s[4]));
    });
    S.ringing = { ac: ac, nodes: nodes, stopAt: now + 40, timer: setTimeout(function () { stopRing(); }, 40000) };
  }
  function stopRing() {
    /* সেশন ১৪৮-হার্ডস্টপ (সাউন্ড-লিক-ফিক্স): আগে শুধু সেফটি-টাইমার ক্লিয়ার হত —
       কিন্তু beep()-নোডগুলো ৪০-সেকেন্ড পর্যন্ত ভবিষ্যতে-শিডিউল (o.start(t0)) থাকে →
       কল-কাটার পরেও বাকি রিং-বিটগুলো বাজতে থাকত (ইউজার-রিপোর্ট: "কল কেটে দিলেও
       আরও কিছুক্ষণ রিং হচ্ছে")। এখন প্রতিটি শিডিউল-নোড তাৎক্ষণিক: gain-cancel→০,
       stop(now), দ্বি-disconnect — এক-মিলিসেকেন্ডে পূর্ণ নীরবতা।
       নোট: AC শেয়ার্ড-কনটেক্সট (স্পিকার-মিটার SPK-ও ব্যবহার করে) — ctx.close()
       নয়, প্রতি-নোড হার্ড-শাটডাউনই সঠিক। */
    if (S.ringing) {
      clearTimeout(S.ringing.timer);
      var rac = S.ringing.ac, rnodes = S.ringing.nodes || [];
      for (var i = 0; i < rnodes.length; i++) {
        var nd = rnodes[i];
        if (!nd) continue;
        try { nd.g.gain.cancelScheduledValues(rac.currentTime); } catch (_) {}
        try { nd.g.gain.setValueAtTime(0, rac.currentTime); } catch (_) {}
        try { nd.o.stop(rac.currentTime); } catch (_) {}
        try { nd.o.disconnect(); } catch (_) {}
        try { nd.g.disconnect(); } catch (_) {}
      }
    }
    S.ringing = null;
  }
  function click() {
    var ac = audioCtx(); if (!ac) return;
    beep(ac, 880, ac.currentTime, 0.08, 0.05);
  }

  /* ── সেশন ১১৮: স্পিকার-হাইলাইট (WebAudio লেভেল-মিটার) ──────────────────
     প্রতি-অডিও-স্ট্রিমে AnalyserNode (MediaStreamSource → analyser —
     destination-এ যায় না, নীরব-বিশ্লেষণ) → ২৫০ms-অন্তর RMS-নমুনা →
     থ্রেশহোল্ডের-উপরে সর্বোচ্চ-লেভেল পিয়ার = সক্রিয়-স্পিকার → গ্রিড-টাইলে
     .is-speaking (সবুজ-রিং + ওয়েভ-বার), 1:1-এ .lc-audioface-রিং।
     হাইস্টেরেসিস: ৮০০ms-হোল্ড — ফ্লিকার-প্রতিরোধ; মিউটে লেভেল-শূন্যে
     অটো-নিভে (track.enabled=false → RMS=0)। যেকোনো-স্ট্রিম-ব্যর্থতায়
     graceful — হাইলাইট ছাড়াই কল চলবে। ═══ */
  var SPK = { nodes: {}, tid: null, active: null, activeAt: 0 };
  function spkEnsure(uid, stream) {
    if (!stream || SPK.nodes[uid]) return;
    var ac = audioCtx(); if (!ac) return;
    try {
      var src = ac.createMediaStreamSource(stream);
      var an = ac.createAnalyser();
      an.fftSize = 512; an.smoothingTimeConstant = 0.6;
      src.connect(an);
      SPK.nodes[uid] = { src: src, an: an, arr: new Uint8Array(an.fftSize) };
    } catch (_) { /* স্ট্রিম-অবস্থা-ভুল — নীরব */ }
  }
  function spkDrop(uid) {
    var n = SPK.nodes[uid]; if (!n) return;
    try { n.src.disconnect(); } catch (_) {}
    try { n.an.disconnect(); } catch (_) {}
    delete SPK.nodes[uid];
    if (SPK.active === uid) { SPK.active = null; spkPaint(null); }
  }
  function spkLevel(n) {
    n.an.getByteTimeDomainData(n.arr);
    var sum = 0;
    for (var i = 0; i < n.arr.length; i++) { var v = (n.arr[i] - 128) / 128; sum += v * v; }
    return Math.sqrt(sum / n.arr.length) * 140; /* ০-১০০-স্কেলে */
  }
  function spkTick() {
    var best = null, bestL = 0;
    var keys = Object.keys(SPK.nodes);
    for (var i = 0; i < keys.length; i++) {
      var n = SPK.nodes[keys[i]];
      if (!n || !n.an) continue;
      var l = spkLevel(n);
      if (l > bestL) { bestL = l; best = keys[i]; }
    }
    var cand = (best && bestL > 5.5) ? best : null; /* থ্রেশহোল্ড — পরিবেশ-শব্দ-বাদ */
    var now = Date.now();
    if (cand !== SPK.active && now - SPK.activeAt < 800) cand = SPK.active; /* হোল্ড */
    if (cand !== SPK.active) { SPK.active = cand; SPK.activeAt = now; spkPaint(cand); }
  }
  function spkPaint(uid) {
    if (!root) return;
    root.querySelectorAll('.lc-grid .lc-tile').forEach(function (t) {
      var on = uid != null && t.getAttribute('data-uid') === String(uid);
      t.classList.toggle('is-speaking', on);
      var b = t.querySelector('.lc-spkbars');
      if (b) b.hidden = !on;
    });
    var af = root.querySelector('.lc-audioface');
    if (af) af.classList.toggle('is-speaking', uid === 'peer');
  }
  function spkStart() {
    spkStop();
    SPK.active = null; SPK.activeAt = 0;
    spkTick();
    SPK.tid = setInterval(spkTick, 250);
  }
  function spkStop() {
    if (SPK.tid) { clearInterval(SPK.tid); SPK.tid = null; }
  }
  function spkTeardown() {
    spkStop();
    Object.keys(SPK.nodes).forEach(spkDrop);
    SPK.active = null; SPK.activeAt = 0;
  }

  /* ── API হেল্পার ───────────────────────────────────────────────────────── */
  function api(method, url, body) {
    var opt = { method: method, headers: { 'Content-Type': 'application/json' } };
    if (body !== undefined) opt.body = JSON.stringify(body);
    return fetch(url, opt).then(function (r) {
      return r.json().catch(function () { return { ok: false, error: 'badjson' }; }).then(function (j) { j.__status = r.status; return j; });
    });
  }

  /* ── UI: ওভারলে-নির্মাণ ────────────────────────────────────────────────── */
  var root = null;
  function ensureRoot() {
    if (root) return root;
    root = el('div', 'lc-root');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.innerHTML =
      '<div class="lc-backdrop"></div>' +
      '<div class="lc-stage">' +
      '  <div class="lc-minbar" hidden><button type="button" class="lc-minbar-btn" data-lc="restore" title="কল আবার খুলুন">' + icon('fa-phone-volume') + '<span class="lc-minbar-t"></span></button></div>' +
      '  <div class="lc-panel">' +
      '    <div class="lc-videos" hidden>' +
      '      <video class="lc-remote-video" autoplay playsinline></video>' +
      '      <div class="lc-tapplay" hidden><button type="button" class="lc-tapplay-btn">' + icon('fa-play') + ' ট্যাপ করে চালু করুন</button></div>' +
      '    </div>' +
      '    <video class="lc-local-video" autoplay playsinline muted></video>' +
      '    <div class="lc-quality" hidden><span class="lc-quality-bars"><i></i><i></i><i></i><i></i></span><span class="lc-quality-t">—</span><span class="lc-eco" hidden></span></div>' +
      '    <div class="lc-audioface">' +
      '      <div class="lc-aura"><span></span><span></span><span></span></div>' +
      '      <img class="lc-avatar" alt="" />' +
      '      <video class="lc-remote-video--audio" autoplay playsinline hidden></video>' +
      '    </div>' +
      '    <div class="lc-meta">' +
      '      <div class="lc-name"></div>' +
      '      <div class="lc-status"></div>' +
      '    </div>' +
      '    <div class="lc-stats" hidden role="region" aria-label="সংযোগ-তথ্য">' +
      '      <div class="lc-stats-head"><span>' + icon('fa-signal') + ' সংযোগ-তথ্য</span><button type="button" class="lc-stats-x" data-lc="stats-close" title="বন্ধ করুন" aria-label="সংযোগ-তথ্য বন্ধ করুন">' + icon('fa-xmark') + '</button></div>' +
      '      <div class="lc-stats-rows"></div>' +
      '    </div>' +
      '    <div class="lc-retrybar" hidden>' +
      '      <span class="lc-retrybar-t">' + icon('fa-triangle-exclamation') + ' সংযোগ বিচ্ছিন্ন</span>' +
      '      <button type="button" class="lc-retrybar-btn lc-retrybar-btn--retry" data-lc="retry">' + icon('fa-rotate-right') + ' আবার চেষ্টা করুন</button>' +
      '      <button type="button" class="lc-retrybar-btn lc-retrybar-btn--end" data-lc="end">' + icon('fa-phone-slash') + ' কল শেষ করুন</button>' +
      '    </div>' +
      '    <div class="lc-perm" hidden role="alertdialog" aria-modal="true" aria-label="অনুমতি প্রয়োজন">' +
      '      <div class="lc-perm-card">' +
      '        <div class="lc-perm-ico">' + icon('fa-microphone-slash') + '</div>' +
      '        <h3 class="lc-perm-title">মাইক্রোফোন/ক্যামেরা-অনুমতি প্রয়োজন</h3>' +
      '        <p class="lc-perm-msg"></p>' +
      '        <ol class="lc-perm-steps">' +
      '          <li>অ্যাড্রেস-বারের বাঁ পাশের <b>তালা (🔒)</b> আইকনে চাপ দিন।</li>' +
      '          <li><b>Microphone</b> ও <b>Camera</b> — দুটোই <b>Allow</b> করুন।</li>' +
      '          <li>নিচের “আবার চেষ্টা করুন” বোতামে চাপ দিন — কল পুনঃশুরু হবে।</li>' +
      '        </ol>' +
      '        <div class="lc-perm-hint" hidden></div>' +
      '        <div class="lc-perm-actions">' +
      '          <button type="button" class="lc-btn lc-btn--retry" data-lc="perm-retry">' + icon('fa-rotate-right') + ' আবার চেষ্টা করুন</button>' +
      '          <button type="button" class="lc-btn lc-btn--tab" data-lc="perm-newtab" hidden>' + icon('fa-up-right-from-square') + ' নতুন ট্যাবে খুলুন</button>' +
      '          <button type="button" class="lc-btn lc-btn--cancel" data-lc="perm-cancel">কল বাতিল করুন</button>' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '    <div class="lc-controls">' +
      '      <button type="button" class="lc-ctl lc-ctl--info" data-lc="stats" title="সংযোগ-তথ্য (নেটওয়ার্ক)">' + icon('fa-circle-info') + '</button>' +
      '      <button type="button" class="lc-ctl lc-ctl--mic" data-lc="mic" title="মাইক বন্ধ/চালু">' + icon('fa-microphone') + '</button>' +
      '      <button type="button" class="lc-ctl lc-ctl--cam" data-lc="cam" title="ক্যামেরা বন্ধ/চালু">' + icon('fa-video') + '</button>' +
      '      <button type="button" class="lc-ctl lc-ctl--min" data-lc="min" title="মিনিমাইজ">' + icon('fa-chevron-down') + '</button>' +
      '      <button type="button" class="lc-ctl lc-ctl--end" data-lc="end" title="কল কেটে দিন">' + icon('fa-phone-slash') + '</button>' +
      '    </div>' +
      '  </div>' +
      '</div>' +
      '<div class="lc-incoming" hidden>' +
      '  <div class="lc-incoming-card">' +
      '    <div class="lc-incoming-kind"></div>' +
      '    <div class="lc-incoming-avatarwrap"><span></span><span></span><span></span><img class="lc-avatar2" alt="" /></div>' +
      '    <div class="lc-incoming-name"></div>' +
      '    <div class="lc-incoming-sub">উত্তর দিতে সবুজ, প্রত্যাখ্যান করতে লাল বাটনে চাপ দিন</div>' +
      '    <div class="lc-incoming-actions">' +
      '      <button type="button" class="lc-act lc-act--decline" data-lc="decline" title="প্রত্যাখ্যান">' + icon('fa-phone-slash') + '</button>' +
      '      <button type="button" class="lc-act lc-act--accept" data-lc="accept" title="গ্রহণ">' + icon('fa-phone') + '</button>' +
      '    </div>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(root);
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-lc]');
      if (!b) return;
      var a = b.getAttribute('data-lc');
      if (a === 'mic') toggleMic();
      else if (a === 'cam') toggleCam();
      else if (a === 'min') minimize(true);
      else if (a === 'restore') minimize(false);
      else if (a === 'end') { click(); endCall('hangup'); }
      else if (a === 'accept') acceptCall();
      else if (a === 'decline') { click(); declineCall(); }
      else if (a === 'stats') toggleStats();
      else if (a === 'stats-close') toggleStats(false);
      /* সেশন ১২২: পারমিশন-প্যানেল-অ্যাকশন */
      else if (a === 'perm-retry') retryPermission();
      else if (a === 'perm-cancel') { click(); cancelFromPermPanel(); }
      else if (a === 'perm-newtab') { try { window.open(location.href, '_blank'); } catch (_) {} }
      else if (a === 'retry') {
        click();
        var rb = root && root.querySelector('.lc-retrybar');
        if (rb) rb.hidden = true;
        S.iceRestarts = 0; /* ম্যানুয়াল-রিট্রাইয়ে নতুন ভাতা */
        attemptIceRestart();
      }
      else if (a === 'tapplay') { /* handled below */ }
    });
    var tp = root.querySelector('.lc-tapplay');
    tp.addEventListener('click', function () {
      var v = root.querySelector('.lc-remote-video');
      var va = root.querySelector('.lc-remote-video--audio');
      var p = (v && v.play()) || (va && va.play()) || Promise.resolve();
      Promise.resolve(p).then(function () { tp.hidden = true; }).catch(function () {});
    });
    return root;
  }

  /* ── সেশন ১২২: UI-ফার্স্ট পারমিশন-প্যানেল (FB-নীতি: আগে ইন্টারফেস, পরে হার্ডওয়্যার) ──
     আগের-আচরণে মাইক/ক্যামেরা-অনুমতি ব্লক থাকলে মোডাল মুহূর্তেই গায়েব + টোস্ট —
     ইউজার বুঝতেই পারত না কী হলো। এখন মোডাল খোলাই থাকে, ভেতরে সমাধান-গাইড
     + "আবার চেষ্টা করুন" + (প্রয়োজনে) "নতুন ট্যাবে খুলুন" দেখায় — অনুমতি দিলে
     সেই-মুহূর্তে কল-ফ্লো স্বয়ংক্রিয়ভাবে পুনঃশুরু হয় (কল হাতছাড়া হয় না)। */
  function humanMediaError(err) {
    var m = (err && err.message) || '';
    var name = (err && err.name) || '';
    if (m.indexOf('permission:') === 0) return m.split(':').slice(1).join(':').trim();
    if (m.indexOf('insecure:') === 0) return m.split(':').slice(1).join(':').trim();
    if (m.indexOf('device:') === 0) return m.split(':').slice(1).join(':').trim();
    if (m.indexOf('busy:') === 0) return m.split(':').slice(1).join(':').trim();
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') return 'ব্রাউজারে এই সাইটের মাইক্রোফোন/ক্যামেরার অনুমতি ব্লক করা আছে।';
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return 'কোনো মাইক্রোফোন/ক্যামেরা পাওয়া যায়নি — ডিভাইস যুক্ত করে আবার চেষ্টা করুন।';
    if (name === 'NotReadableError' || name === 'TrackStartError') return 'মাইক/ক্যামেরা অন্য অ্যাপ (Zoom/Meet/Teams) দখলে রেখেছে — সেগুলো বন্ধ করে আবার চেষ্টা করুন।';
    if (name === 'OverconstrainedError') return 'নির্ধারিত ক্যামেরা-মান এই ডিভাইসে মেলেনি।';
    return 'মাইক/ক্যামেরা চালু করা যায়নি' + (m ? (' — ' + m) : '') + '।';
  }
  function showPermPanel(msg) {
    if (!root) return;
    var p = root.querySelector('.lc-perm');
    if (!p) return;
    p.querySelector('.lc-perm-msg').textContent = msg || 'মাইক্রোফোন/ক্যামেরার অনুমতি প্রয়োজন।';
    var inIframe = false;
    try { inIframe = (window.self !== window.top); } catch (_) { inIframe = true; }
    var insecure = !window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';
    var hint = p.querySelector('.lc-perm-hint');
    var tabBtn = p.querySelector('[data-lc="perm-newtab"]');
    if (insecure) {
      hint.textContent = '💡 এই পেজটি HTTPS-ছাড়া খোলা — ব্রাউজারের নিরাপত্তা-নীতিতে মাইক/ক্যামেরা সম্পূর্ণ বন্ধ। নিরাপদ (https) ঠিকানায় খুলুন।';
      hint.hidden = false; if (tabBtn) tabBtn.hidden = false;
    } else if (inIframe) {
      hint.textContent = '💡 প্রিভিউ-ফ্রেমের ভেতরে অনুমতি-ডায়ালগ আসতে পারে না — “নতুন ট্যাবে খুলুন” চেপে পূর্ণ ব্রাউজার-ট্যাবে কল চালিয়ে যান।';
      hint.hidden = false; if (tabBtn) tabBtn.hidden = false;
    } else {
      hint.hidden = true; if (tabBtn) tabBtn.hidden = true;
    }
    p.hidden = false;
    status('অনুমতি প্রয়োজন', 'is-warn');
  }
  function hidePermPanel() {
    if (!root) return;
    var p = root.querySelector('.lc-perm');
    if (p) p.hidden = true;
  }
  async function retryPermission() {
    if (!S.permRetry || S.permBusy) return;
    S.permBusy = true;
    var b = root && root.querySelector('[data-lc="perm-retry"]');
    if (b) { b.disabled = true; b.innerHTML = icon('fa-spinner fa-spin') + ' চেষ্টা চলছে…'; }
    try {
      var fn = S.permRetry; S.permRetry = null;
      await fn();
    } catch (err) {
      S.permRetry = fn; /* আবারও ব্যর্থ — রিজিউম-হুক ফেরত রাখো */
      showPermPanel(humanMediaError(err));
    } finally {
      S.permBusy = false;
      if (b) { b.disabled = false; b.innerHTML = icon('fa-rotate-right') + ' আবার চেষ্টা করুন'; }
    }
  }
  async function cancelFromPermPanel() {
    var id = S.callId;
    var role = S.role;
    cleanup(true);
    if (!id) return;
    try {
      if (role === 'callee') await api('POST', '/api/calls/' + id + '/decline'); /* উত্তর-দেওয়ার-আগে বাতিল = প্রত্যাখ্যান */
      else await api('POST', '/api/calls/' + id + '/end', { reason: 'failed' });
    } catch (_) {}
  }
  /* মিডিয়া-ব্যর্থতাকে UI-ফার্স্ট প্যানেলে রূপান্তর — কল-ফ্লো মেরে না-ফেলে */
  function handleMediaError(err, resumeFn) {
    S.permRetry = resumeFn || null;
    stopRing();
    showPermPanel(humanMediaError(err));
  }

  function setPeerUI() {
    if (!root) return;
    var img = root.querySelector('.lc-avatar'), img2 = root.querySelector('.lc-avatar2');
    var url = (S.peer && S.peer.avatar) || '';
    if (img) { img.src = url; img.onerror = function () { img.hidden = true; }; }
    if (img2) { img2.src = url; img2.onerror = function () { img2.hidden = true; }; }
    var n = root.querySelector('.lc-name'), n2 = root.querySelector('.lc-incoming-name');
    if (n) n.textContent = S.peer ? S.peer.name : '';
    if (n2) n2.textContent = S.peer ? S.peer.name : '';
  }
  function status(text, cls) {
    if (!root) return;
    var s = root.querySelector('.lc-status');
    if (s) { s.textContent = text; s.className = 'lc-status' + (cls ? ' ' + cls : ''); }
  }
  function showVideos(on) {
    if (!root) return;
    var vv = root.querySelector('.lc-videos');
    if (vv) {
      vv.hidden = !on;
      /* সেশন ১৪৮: রিং→কানেক্ট ক্রসফেড — হুট-করে-সোয়াপ নয়, ২৮০ms ফেড-ইন */
      if (on) { vv.classList.remove('is-in'); void vv.offsetWidth; vv.classList.add('is-in'); }
    }
    root.querySelector('.lc-audioface').hidden = on;
    if (on) { tryPlayLocal(); tryPlayRemote(); }
  }
  /* সেশন ১৪৮: লোকাল-প্রিভিউ স্পষ্ট-প্লে — srcObject সেট-কালে এলিমেন্ট display:none
     থাকলে Chrome autoplay-মিস করতে পারে; প্রতিবার-দৃশ্যমানতা-পরিবর্তনে পুনঃকল */
  function tryPlayLocal() {
    if (!root) return;
    var lv = root.querySelector('.lc-local-video');
    if (lv && lv.srcObject) { var p = lv.play(); if (p && p.catch) p.catch(function () {}); }
  }
  function minimize(on) {
    if (!root) return;
    S.minimized = on;
    root.classList.toggle('lc-root--min', on);
    var mb = root.querySelector('.lc-minbar');
    if (mb) mb.hidden = !on;
  }

  /* ── PeerConnection ───────────────────────────────────────────────────── */
  function createPC() {
    var pc = new RTCPeerConnection(rtcConfig());

    pc.onicecandidate = function (e) {
      if (e.candidate) {
        S.outBuf.push({ type: 'candidate', candidate: e.candidate.toJSON ? e.candidate.toJSON() : { candidate: e.candidate.candidate, sdpMid: e.candidate.sdpMid, sdpMLineIndex: e.candidate.sdpMLineIndex } });
        scheduleFlush();
      }
    };
    pc.ontrack = function (e) {
      var stream = e.streams && e.streams[0];
      if (!stream) return;
      S.remote = stream;
      spkEnsure('peer', stream); /* সেশন ১১৮: ১:১-স্পিকার-হাইলাইট */
      if (root) {
        var rv = root.querySelector('.lc-remote-video');
        var ra = root.querySelector('.lc-remote-video--audio');
        if (rv) rv.srcObject = stream;
        if (ra) ra.srcObject = stream;
        tryPlayRemote();
      }
      status('সংযুক্ত', 'is-live');
    };
    pc.onconnectionstatechange = function () {
      if (!pc) return;
      var st = pc.connectionState;
      if (st === 'connected') { onConnected(); }
      else if (st === 'failed') { handleConnFailed(); }
      else if (st === 'disconnected') { status('সংযোগ বিচ্ছিন্ন হচ্ছে…', 'is-warn'); }
      else if (st === 'closed') { /* cleanup already */ }
    };
    pc.oniceconnectionstatechange = function () {
      if (pc && (pc.iceConnectionState === 'failed')) {
        try { pc.restartIce && pc.restartIce(); } catch (_) {}
      }
    };
    return pc;
  }

  /* ── সেশন ৯৭: সংযোগ-ব্যর্থতা রিকভারি (ICE-restart + রিট্রাই-UI) ─────────
     'failed' এ সরাসরি কল-কাটার বদলে ২ বার পর্যন্ত ICE-restart (নতুন ICE-পথ
     খোঁজা — একই pc-তে createOffer({iceRestart:true})), তারপরও ব্যর্থ হলে
     ইউজারের হাতে "আবার চেষ্টা / কল শেষ" বার দেখাও। */
  function handleConnFailed() {
    if (S.state !== 'connecting' && S.state !== 'connected') return;
    if (S.iceRestarts < 2) { attemptIceRestart(); return; }
    showRetryBar();
  }
  async function attemptIceRestart() {
    var pc = S.pc;
    if (!pc || !S.callId) { showRetryBar(); return; }
    S.iceRestarts++;
    status('পুনঃসংযোগের চেষ্টা চলছে… (' + bn(S.iceRestarts) + '/২)', 'is-warn');
    try {
      var offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      S.restartAnswer = true;
      S.outBuf.push({ type: 'offer', sdp: { type: offer.type, sdp: offer.sdp }, restart: 1 });
      scheduleFlush();
    } catch (_) { showRetryBar(); }
  }
  function showRetryBar() {
    if (!root) return;
    var rb = root.querySelector('.lc-retrybar');
    if (rb) rb.hidden = false;
    status('সংযোগ ব্যর্থ', 'is-warn');
    toast('সংযোগ স্থাপন করা যায়নি — নেটওয়ার্ক/ফায়ারওয়াল (TURN রিলে) সমস্যা', true);
  }

  /* ── সেশন ১১১: নেটওয়ার্ক-কোয়ালিটি ইন্ডিকেটর + ডায়াগনস্টিকস (getStats) ────
     ① কোয়ালিটি-পিল (4-বার, FB-প্যারিটি) — RTT ভিত্তিক: <150ms ভালো, <300 মাঝারি,
        <500 দুর্বল, তার-বেশি/অজানা সংকট; সংযুক্ত-অবস্থায় ২.৫সে-অন্তর নমুনা।
     ② ডায়াগনস্টিকস-প্যানেল — সংযোগ-পথ (সরাসরি/রিলে=TURN-প্রমাণ), ক্যান্ডিডেট-টাইপ,
        RTT/jitter/হারানো-প্যাকেট/রিসিভ-গতি — রোডম্যাপ-③ (TURN-যাচাই)-এর হাতে-কলমে সহায়ক।
     ③ দুর্বল-নেটওয়ার্ক অটো-হিন্ট — টানা ৩-দুর্বল-নমুনায় একবারী টোস্ট; রিকভারিতে রিসেট। */
  function setQuality(lvl, rttMs, note) {
    if (!root) return;
    var q = root.querySelector('.lc-quality');
    if (!q) return;
    q.hidden = false;
    q.classList.remove('is-good', 'is-warn', 'is-bad');
    q.classList.add(lvl >= 2 ? 'is-good' : (lvl === 1 ? 'is-warn' : 'is-bad'));
    var bars = q.querySelectorAll('.lc-quality-bars i');
    for (var i = 0; i < bars.length; i++) {
      if (bars[i]) bars[i].classList.toggle('is-on', i < (lvl + 1));
    }
    var t = q.querySelector('.lc-quality-t');
    if (t) t.textContent = (rttMs != null ? bn(rttMs) + ' ms' : '—');
    q.title = 'নেটওয়ার্ক: ' + (lvl >= 2 ? 'ভালো' : (lvl === 1 ? 'মাঝারি' : 'দুর্বল')) + (rttMs != null ? ' · RTT ' + bn(rttMs) + ' ms' : '') + (note ? ' · ' + note : '');
    q.setAttribute('aria-label', q.title);
  }
  function hideQuality() {
    if (!root) return;
    var q = root.querySelector('.lc-quality');
    if (q) q.hidden = true;
  }
  /* ── সেশন ১৩১: অটো-ভিডিও-ডিগ্রেড — দুর্বল-নেটওয়ার্ক স্বয়ংক্রিয় সাশ্রয়-ল্যাডার ──
     getStats-টিকারের poorStreak-এর ওপর video-sender-প্যারামিটার (scaleResolutionDownBy/
     maxBitrate/maxFramerate) ধাপে ধাপে কমানো হয় — রিকভারিতে goodStreak-হিস্টেরেসিসে
     ধীরে ধাপ-নামা। স্তর: ০=অস্পৃশ্ত · ১=÷২+২৫০kbps · ২=÷৪+১২০kbps+১০fps ·
     ৩=÷৪+৬০kbps+৮fps (মিনিমাল)। ক্যাম-অফ/অডিও-কলে ইঞ্জিন-স্থগিত। ট্র্যাক-স্তরে ধস নয়
     (ক্যাম-টগল-বিরোধ-শূন্য) — কেবল sender.setParameters; ব্রাউজার-অসমর্থনে নীরব-ক্যাচ। */
  function videoSenders() {
    var pcs = [], out = [];
    if (!isGroup()) { if (S.pc) pcs.push(S.pc); }
    else { Object.keys(S.peers).forEach(function (uid) { if (S.peers[uid].pc) pcs.push(S.peers[uid].pc); }); }
    for (var i = 0; i < pcs.length; i++) {
      try {
        var ss = pcs[i].getSenders ? pcs[i].getSenders() : [];
        for (var j = 0; j < ss.length; j++) {
          if (ss[j] && ss[j].track && ss[j].track.kind === 'video') out.push(ss[j]);
        }
      } catch (_) {}
    }
    return out;
  }
  function setEcoBadge(level) {
    if (!root) return;
    var q = root.querySelector('.lc-quality');
    if (!q) return;
    var eco = q.querySelector('.lc-eco');
    if (!eco) return;
    if (level > 0) {
      q.hidden = false; /* সাশ্রয়-সক্রিয় হলে পিল-নিজেও দৃশ্যমান (setQuality-অগ্রাধিকার) */
      eco.hidden = false;
      eco.innerHTML = icon('fa-leaf') + '<b>' + (level === 3 ? 'সাশ্রয়-৩' : (level === 2 ? 'সাশ্রয়-২' : 'সাশ্রয়-১')) + '</b>';
      q.classList.add('is-eco');
      q.title = 'দুর্বল-নেটওয়ার্ক সাশ্রয়-মোড স্তর ' + bn(level) + ' — ভিডিও-মান স্বয়ংক্রিয়ভাবে কমানো হচ্ছে';
    } else {
      eco.hidden = true; eco.innerHTML = '';
      q.classList.remove('is-eco');
      q.title = 'নেটওয়ার্ক মান';
    }
    q.setAttribute('aria-label', q.title);
  }
  function applyVideoDegradation(level) {
    if ((S.degrade || 0) === level) return;
    S.degrade = level;
    var ss = videoSenders();
    for (var i = 0; i < ss.length; i++) {
      try {
        var snd = ss[i];
        if (!snd.getParameters || !snd.setParameters) continue;
        var p = snd.getParameters();
        if (!p.encodings || !p.encodings.length) p.encodings = [{}];
        var e = p.encodings[0];
        if (level === 1) { e.scaleResolutionDownBy = 2; e.maxBitrate = 250000; if ('maxFramerate' in e) delete e.maxFramerate; }
        else if (level === 2) { e.scaleResolutionDownBy = 4; e.maxBitrate = 120000; e.maxFramerate = 10; }
        else if (level === 3) { e.scaleResolutionDownBy = 4; e.maxBitrate = 60000; e.maxFramerate = 8; }
        else { e.scaleResolutionDownBy = 1; if ('maxBitrate' in e) delete e.maxBitrate; if ('maxFramerate' in e) delete e.maxFramerate; }
        snd.setParameters(p).catch(function () {});
      } catch (_) {}
    }
    setEcoBadge(level);
    if (S.statsOpen) renderStats();
    S.degradeToasted = S.degradeToasted || {};
    if (level > 0 && !S.degradeToasted[level] && S.state === 'connected') {
      S.degradeToasted[level] = true;
      toast(level === 1 ? 'দুর্বল নেটওয়ার্ক — ভিডিও স্বয়ংক্রিয় সাশ্রয়-স্তর ১'
        : (level === 2 ? 'নেটওয়ার্ক আরও দুর্বল — সাশ্রয়-স্তর ২ (রেজোলিউশন+এফপিএস কমানো)'
        : 'সাশ্রয়-স্তর ৩ — মিনিমাল ভিডিও; নেটওয়ার্ক ভালো হলে মান ফিরবে'), true);
    }
    if (level === 0) S.degradeToasted = {};
  }
  function startStatsTicker() {
    clearTimeout(S.qPollT);
    S.poorStreak = 0; S.poorNotified = false;
    S.lastBytes = 0; S.lastBytesAt = 0;
    S.degrade = 0; S.goodStreak = 0; S.degradeToasted = {};
    S.degradeNotBefore = Date.now() + 8000; /* শুরুর ৮সে ইঞ্জিন-স্থগিত — RTT-নমুনা উত্তপ্ত হোক */
    statsTick();
    spkStart(); /* সেশন ১১৮: স্পিকার-হাইলাইট টিকারও সংযুক্ত-অবস্থায় চালু */
  }
  async function statsTick() {
    clearTimeout(S.qPollT);
    var pc = activePC(); /* সেশন ১১৩: গ্রুপে প্রথম connected পিয়ার-PC */
    if (!pc || (S.state !== 'connected' && S.state !== 'connecting')) return;
    try {
      var st = await pc.getStats();
      var pair = null, lcMap = {}, rcMap = {}, inbound = null, vInbound = null;
      st.forEach(function (r) {
        if (r.type === 'candidate-pair' && (r.selected || r.state === 'succeeded')) {
          if (!pair || (r.selected && !pair.selected)) pair = r;
        } else if (r.type === 'local-candidate') { lcMap[r.id] = r; }
        else if (r.type === 'remote-candidate') { rcMap[r.id] = r; }
        else if (r.type === 'inbound-rtp' && !r.isRemote && r.kind === 'audio') { inbound = r; }
        else if (r.type === 'inbound-rtp' && !r.isRemote && r.kind === 'video') { vInbound = r; } /* সেশন ১১৮ */
      });
      var d = { at: Date.now(), rtt: null, path: null, local: null, remote: null, jitter: null, lost: null, kbps: null, vw: null, vh: null, vfps: null, lw: null, lh: null };
      if (pair) {
        if (typeof pair.currentRoundTripTime === 'number') d.rtt = Math.round(pair.currentRoundTripTime * 1000);
        var l = lcMap[pair.localCandidateId], r2 = rcMap[pair.remoteCandidateId];
        if (l) d.local = l.candidateType || null;
        if (r2) d.remote = r2.candidateType || null;
        if (l && r2) {
          d.path = (l.candidateType === 'relay' || r2.candidateType === 'relay') ? 'রিলে (TURN)'
            : ((l.candidateType === 'host' && r2.candidateType === 'host') ? 'সরাসরি (একই-নেটওয়ার্ক)' : 'সরাসরি (NAT-ভেদ)');
        }
      }
      if (inbound) {
        if (typeof inbound.jitter === 'number') d.jitter = Math.round(inbound.jitter * 1000);
        if (typeof inbound.packetsLost === 'number') d.lost = Math.max(0, inbound.packetsLost);
        if (typeof inbound.bytesReceived === 'number') {
          if (S.lastBytesAt && d.at > S.lastBytesAt && inbound.bytesReceived >= S.lastBytes) {
            d.kbps = Math.max(0, Math.round(((inbound.bytesReceived - S.lastBytes) * 8) / (d.at - S.lastBytesAt) / 1000));
          }
          S.lastBytes = inbound.bytesReceived; S.lastBytesAt = d.at;
        }
      }
      /* সেশন ১১১-③ (সেশন ১১৮-বাস্তবায়ন): ভিডিও-track-স্ট্যাট — রিসিভ-রেজোলিউশন + FPS
         (inbound-rtp video; Chrome/Firefox দুটোতেই) + আমার-ভিডিও (local-track settings) */
      if (vInbound) {
        if (typeof vInbound.frameWidth === 'number') d.vw = vInbound.frameWidth;
        if (typeof vInbound.frameHeight === 'number') d.vh = vInbound.frameHeight;
        if (typeof vInbound.framesPerSecond === 'number') d.vfps = Math.round(vInbound.framesPerSecond);
      }
      if (S.local) {
        var vt = S.local.getVideoTracks()[0];
        if (vt && vt.getSettings) {
          var vs = vt.getSettings() || {};
          if (typeof vs.width === 'number') d.lw = vs.width;
          if (typeof vs.height === 'number') d.lh = vs.height;
        }
      }
      S.lastStats = d;
      var lvl = (d.rtt == null) ? 0 : (d.rtt < 150 ? 3 : (d.rtt < 300 ? 2 : (d.rtt < 500 ? 1 : 0)));
      setQuality(lvl, d.rtt, d.path);
      if (S.statsOpen) renderStats();
      if ((d.rtt == null || d.rtt > 450)) S.poorStreak++;
      else { S.poorStreak = 0; S.poorNotified = false; }
      if (S.poorStreak >= 3 && !S.poorNotified && S.state === 'connected') {
        S.poorNotified = true;
        toast('নেটওয়ার্ক দুর্বল হচ্ছে — ভিডিও বন্ধ করলে সংযোগ ভালো থাকতে পারে', true);
      }
      /* সেশন ১৩১: অটো-সাশ্রয়-ল্যাডার — poorStreak-এ ধাপ-ওঠা, goodStreak(≥৩, rtt<৩০০ms)-এ
         এক-ধাপ-নামা (হিস্টেরেসিস — দ্রুত-ওঠানামা-বিরোধী); অ-ভিডিও/ক্যাম-অফে স্তর-রিসেট */
      if (d.rtt != null && d.rtt < 300) S.goodStreak++;
      else S.goodStreak = 0;
      var ecoLive = (S.state === 'connected' && S.kind === 'video' && !S.camOff && Date.now() >= (S.degradeNotBefore || 0));
      if (ecoLive) {
        var want = (S.poorStreak >= 8) ? 3 : (S.poorStreak >= 6) ? 2 : (S.poorStreak >= 4) ? 1 : 0;
        if (want > (S.degrade || 0)) applyVideoDegradation(want);
        else if (want < (S.degrade || 0) && (S.goodStreak || 0) >= 3) { applyVideoDegradation((S.degrade || 0) - 1); S.goodStreak = 0; }
      } else if (S.degrade) applyVideoDegradation(0);
    } catch (_) { /* pc বন্ধ — নেক্সট-টিকে থামবে */ }
    S.qPollT = setTimeout(statsTick, 2500);
  }
  function statsRow(k, v, cls) {
    return '<div class="lc-stats-row' + (cls ? ' ' + cls : '') + '"><span>' + k + '</span><b>' + ((v == null || v === '') ? '—' : v) + '</b></div>';
  }
  function renderStats() {
    if (!root) return;
    var rows = root.querySelector('.lc-stats-rows');
    if (!rows) return;
    if (S.state !== 'connected' || !S.lastStats) {
      rows.innerHTML = '<div class="lc-stats-empty">সংযোগ স্থাপিত হলে লাইভ-তথ্য দেখা যাবে।</div>';
      return;
    }
    var d = S.lastStats;
    rows.innerHTML =
      statsRow('সংযোগ-পথ', d.path, (d.path && d.path.indexOf('রিলে') === 0) ? 'is-relay' : '') +
      statsRow('আমার ক্যান্ডিডেট', d.local) +
      statsRow('পিয়ার ক্যান্ডিডেট', d.remote) +
      statsRow('RTT (রাউন্ড-ট্রিপ)', d.rtt != null ? bn(d.rtt) + ' ms' : null) +
      statsRow('জিটার', d.jitter != null ? bn(d.jitter) + ' ms' : null) +
      statsRow('হারানো প্যাকেট (মোট)', d.lost != null ? bn(d.lost) : null) +
      statsRow('গতি (রিসিভ)', d.kbps != null ? bn(d.kbps) + ' kbps' : null) +
      /* সেশন ১১৮: ভিডিও-track-স্ট্যাট (শুধু ভিডিও-কলে) */
      (S.kind === 'video' ?
        '<div class="lc-stats-section">' + icon('fa-video') + ' ভিডিও</div>' +
        statsRow('আমার ভিডিও', d.lw != null ? bn(d.lw) + '×' + bn(d.lh) : null, 'is-video') +
        statsRow('রিসিভ ভিডিও', d.vw != null ? bn(d.vw) + '×' + bn(d.vh) + (d.vfps ? ' @ ' + bn(d.vfps) + ' fps' : '') : null, 'is-video') +
        statsRow('অটো-সাশ্রয়', (S.degrade || 0) ? 'স্তর ' + bn(S.degrade) : null, (S.degrade || 0) ? 'is-video is-eco' : 'is-video')
        : '');
  }
  function toggleStats(force) {
    if (!root) return;
    var p = root.querySelector('.lc-stats');
    if (!p) return;
    S.statsOpen = (force !== undefined) ? !!force : !S.statsOpen;
    p.hidden = !S.statsOpen;
    var b = root.querySelector('.lc-ctl--info');
    if (b) b.classList.toggle('is-active', S.statsOpen);
    if (S.statsOpen) renderStats();
  }

  function tryPlayRemote() {
    if (!root) return;
    var v = root.querySelector('.lc-remote-video');
    var a = root.querySelector('.lc-remote-video--audio');
    var tp = root.querySelector('.lc-tapplay');
    var p = null;
    if (S.kind === 'video' && v) p = v.play();
    else if (a) p = a.play();
    if (!p) return;
    Promise.resolve(p).then(function () { if (tp) tp.hidden = true; }).catch(function () {
      /* autoplay-policy ব্লক — ইউজার-জেসচার দরকার */
      if (tp) tp.hidden = false;
    });
  }
  document.addEventListener('click', function once() {
    document.removeEventListener('click', once);
    if (S.state === 'connected') tryPlayRemote();
    audioCtx();
  }, { once: false });

  async function getMedia(kind) {
    /* সেশন ১২২: নিরাপদ-প্রসঙ্গ প্রি-ফ্লাইট — HTTP/আইপি-ঠিকানায় ব্রাউজার-নীতিতে
       getUserMedia নিষিদ্ধ; আগেই মানব-পাঠযোগ্য বার্তা (ক্র্যাশ-টোস্ট নয়) */
    if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      var ie = new Error('insecure: এই পেজটি নিরাপদ (HTTPS) সংযোগে নেই — ব্রাউজার-নীতিতে মাইক/ক্যামেরা সম্পূর্ণ বন্ধ।');
      ie.name = 'NotAllowedError';
      throw ie;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      var ne = new Error('insecure: এই ব্রাউজারে মাইক/ক্যামেরা-API নেই (HTTPS ছাড়া API-ই বন্ধ থাকে)।');
      ne.name = 'NotAllowedError';
      throw ne;
    }
    try {
      return await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: kind === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false
      });
    } catch (err) {
      if (kind === 'video') {
        /* ক্যামেরা নেই/দখলে → অডিও-অনলি-ফলব্যাক (অনুমতি-ব্লক ছাড়া) */
        var st = (err && err.name) || '';
        if (st === 'NotFoundError' || st === 'OverconstrainedError' || st === 'NotReadableError') {
          var s2 = await navigator.mediaDevices.getUserMedia({ audio: true });
          toast('ক্যামেরা পাওয়া যায়নি — অডিও-কল হিসেবে চলছে', true);
          S.kind = 'audio';
          return s2;
        }
      }
      throw err; /* মানব-বার্তা humanMediaError()-এ নাম-ভিত্তিক ম্যাপ হয় */
    }
  }

  function attachLocal(stream) {
    S.local = stream;
    spkEnsure('self', stream); /* সেশন ১১৮: নিজের-মাইক লেভেল (মিউটে অটো-নিভে) */
    if (root) {
      var lv = root.querySelector('.lc-local-video');
      /* সেশন ১৪৮: সেলফি-PIP কানেক্ট-পূর্বেই (রিং-অবস্থায়) দৃশ্যমান (FB/টেলিগ্রাম-প্যারিটি) —
         স্ট্রিম-অ্যাটাচেই has-local-ক্লাস → PIP খোলে; স্পষ্ট play()। অডিও-ফলব্যাকে
         (S.kind='audio') PIP নয় — আগের-মতো অ্যাভাটার-মুখ। গ্রুপে CSS-নিষেধ (গ্রিড-টাইলই সেলফি)। */
      if (lv && S.kind === 'video') {
        lv.srcObject = stream;
        root.classList.add('lc-root--has-local');
        tryPlayLocal();
      }
    }
  }

  /* ── ICE flush (ব্যাচ-পোস্ট) ───────────────────────────────────────────── */
  function scheduleFlush() {
    if (S.flushT) return;
    S.flushT = setTimeout(function () { S.flushT = null; flushSignals(); }, 250);
  }
  async function flushSignals() {
    /* সেশন ১২২-বাগফিক্স: অফার-পোস্টের আগেই ICE-gathering শুরু হয় (setLocalDescription
       → onicecandidate) — কল-আইডি না-থাকায় আগের early-return-এ ব্যাচ আটকে পড়ত ও
       আর কখনো পাঠানো হত না → পিয়ার ক্যান্ডিডেট-শূন্য → ICE 'connecting'-এ আটকে যেত।
       এখন: কল-আইডি না-এলে রি-শিডিউল (কল-আইডি সেট হলেই পাঠানো হবে)। */
    if (!S.callId) { if (S.outBuf.length) scheduleFlush(); return; }
    if (!S.outBuf.length) return;
    var batch = S.outBuf.splice(0, 24);
    try { await api('POST', '/api/calls/' + S.callId + '/signal', { signals: batch }); } catch (_) {}
    if (S.outBuf.length) scheduleFlush();
  }

  /* ── কিউ-drain (রেস-কন্ডিশন ফিক্স) ────────────────────────────────────── */
  async function drainQueue() {
    var pc = S.pc;
    if (!pc || !pc.remoteDescription || !pc.remoteDescription.type) return;
    while (S.queue.length) {
      var c = S.queue.shift();
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (e) { /* stale candidate — চুপচাপ */ }
    }
  }

  /* ═══ সেশন ১১৩: গ্রুপ-কল (mesh WebRTC) ═════════════════════════════════
     টপোলজি: মেশ — প্রতি-অংশগ্রহণকারী-জোড়ায় আলাদা RTCPeerConnection।
     সিগন্যালিং: একই /api/calls/* HTTP-পোলিং; প্রতি-সিগন্যালে from (সার্ভার যোগ
     করে) + ঐচ্ছিক to — ক্লায়েন্ট from-ভিত্তিক রাউট করে সঠিক পিয়ার-PC-তে।
     গ্লেয়ার-প্রতিরোধ (deterministic): নতুন-জয়েনকারী আগে-জয়েনডদের প্রতি অফার
     পাঠায় — গ্রহণ-রেসপনসের joined-তালিকাই কর্তৃত্বপূর্ণ; রেস-কেসে (একই-সেকেন্ডে
     দুই-জয়েন) (joined_at, uid) টোটাল-অর্ডারে টাই-ব্রেক — বড় uid অফার পাঠায়।
     কলার সবচেয়ে-পুরনো অংশগ্রহণকারী → কলার কখনো অফার পাঠায় না, শুধু উত্তর দেয়।
     UI: .lc-grid — ভিডিও-মোডে ভিডিও-টাইল, অডিও-মোডে অ্যাভাটার-টাইল (+ hidden
     audio-বহনকারী video-element); সেলফি-টাইল muted। 1:1-পথ (.lc-videos/
     .lc-audioface) অক্ষুণ্ণ — গ্রুপে root-এ lc-root--group ক্লাসে লুকানো। ═══ */

  function isGroup() { return !!S.group; }

  /* স্ট্যাটস/কোয়ালিটির জন্য সক্রিয় PC — গ্রুপে প্রথম connected পিয়ার */
  function activePC() {
    if (!isGroup()) return S.pc;
    var keys = Object.keys(S.peers);
    for (var i = 0; i < keys.length; i++) {
      var p = S.peers[keys[i]];
      if (p.pc && p.pc.connectionState === 'connected') return p.pc;
    }
    for (var j = 0; j < keys.length; j++) { if (S.peers[keys[j]].pc) return S.peers[keys[j]].pc; }
    return null;
  }

  function peerEnsure(uid, pinfo) {
    if (S.peers[uid]) {
      if (pinfo) S.peers[uid].info = pinfo;
      return S.peers[uid];
    }
    var p = { pc: null, info: pinfo || null, queue: [], madeOffer: false, stream: null };
    S.peers[uid] = p;
    return p;
  }

  function peerPC(uid) {
    var p = peerEnsure(uid);
    if (p.pc) return p.pc;
    var pc = new RTCPeerConnection(rtcConfig());
    p.pc = pc;
    if (S.local) S.local.getTracks().forEach(function (t) { try { pc.addTrack(t, S.local); } catch (_) {} });
    pc.onicecandidate = function (e) {
      if (e.candidate) {
        S.outBuf.push({ type: 'candidate', to: uid, candidate: e.candidate.toJSON ? e.candidate.toJSON() : { candidate: e.candidate.candidate, sdpMid: e.candidate.sdpMid, sdpMLineIndex: e.candidate.sdpMLineIndex } });
        scheduleFlush();
      }
    };
    pc.ontrack = function (e) {
      var stream = e.streams && e.streams[0];
      if (!stream) return;
      p.stream = stream;
      spkEnsure(uid, stream); /* সেশন ১১৮: প্রতি-পিয়ার লেভেল-মিটার */
      gridAttachStream(uid, stream);
      tryPlayGrid();
      status('সংযুক্ত', 'is-live');
    };
    pc.onconnectionstatechange = function () {
      var st = pc.connectionState;
      if (st === 'connected') { gridTileState(uid, 'live'); maybeGroupConnected(); }
      else if (st === 'connecting') { gridTileState(uid, 'conn'); }
      else if (st === 'failed') { gridTileState(uid, 'fail'); }
      else if (st === 'disconnected') { gridTileState(uid, 'warn'); }
    };
    return pc;
  }

  function peerDrain(uid) {
    var p = S.peers[uid];
    if (!p || !p.pc || !p.pc.remoteDescription || !p.pc.remoteDescription.type) return Promise.resolve();
    var chain = Promise.resolve();
    while (p.queue.length) {
      (function (c) {
        chain = chain.then(function () { return p.pc.addIceCandidate(new RTCIceCandidate(c)).catch(function () {}); });
      })(p.queue.shift());
    }
    return chain;
  }

  function peerDrop(uid) {
    var p = S.peers[uid];
    if (!p) return;
    if (p.pc) { try { p.pc.close(); } catch (_) {} }
    spkDrop(uid); /* সেশন ১১৮: লেভেল-মিটার-নোডও সরাও */
    if (root) {
      var t = root.querySelector('.lc-grid [data-uid="' + uid + '"]');
      if (t) t.remove();
    }
    delete S.peers[uid];
  }

  async function groupOfferPeer(uid, pinfo) {
    var p = peerEnsure(uid, pinfo);
    if (p.madeOffer) return;
    try {
      var pc = peerPC(uid);
      var offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      p.madeOffer = true;
      S.outBuf.push({ type: 'offer', to: uid, sdp: { type: offer.type, sdp: offer.sdp } });
      scheduleFlush();
    } catch (_) { /* পরের reconcile-এ আবার */ }
  }

  /* (joined_at, uid) টোটাল-অর্ডারে আমি কি পরে-জয়েনকারী? (তাহলে আমি-ই অফার পাঠাব) */
  function joinedLaterThan(mine, myUid, theirs, theirUid) {
    if (!mine || !theirs) return false;
    if (mine > theirs) return true;
    if (mine === theirs) return Number(myUid) > Number(theirUid);
    return false;
  }

  /* ── গ্রিড-UI ── */
  function ensureGrid() {
    if (!root) return null;
    var g = root.querySelector('.lc-grid');
    if (!g) {
      g = el('div', 'lc-grid');
      g.setAttribute('aria-label', 'কল-অংশগ্রহণকারী');
      root.querySelector('.lc-panel').insertBefore(g, root.querySelector('.lc-controls'));
    }
    return g;
  }
  function gridTile(uid, pinfo) {
    var g = ensureGrid();
    if (!g) return null;
    var t = g.querySelector('[data-uid="' + uid + '"]');
    if (t) return t;
    var isSelf = (uid === 'self');
    t = el('div', 'lc-tile' + (isGroup() && S.kind === 'video' ? ' lc-tile--video' : ''));
    t.setAttribute('data-uid', uid);
    var inner = '';
    if (isGroup() && S.kind === 'video') {
      inner += '<video class="lc-tile-video" autoplay playsinline' + (isSelf ? ' muted' : '') + '></video>';
    } else {
      inner += '<div class="lc-tile-face"><img alt="" /></div>';
      /* অডিও-মোডে দৃশ্যমান টাইলের ভেতরে hidden video-element — remote-অডিও-বাহক */
      if (!isSelf) inner += '<video class="lc-tile-audio" autoplay playsinline></video>';
    }
    inner += '<div class="lc-tile-meta"><span class="lc-tile-name"></span><span class="lc-spkbars" hidden><i></i><i></i><i></i></span><span class="lc-tile-state"></span></div>'; /* সেশন ১১৮: স্পিকার-ওয়েভ-বার */
    t.innerHTML = inner;
    var nm = t.querySelector('.lc-tile-name');
    if (nm) nm.textContent = isSelf ? 'আপনি' : ((pinfo && (pinfo.name || pinfo.username)) || 'সদস্য');
    var img = t.querySelector('.lc-tile-face img');
    if (img) {
      var av = isSelf ? (C().meAvatar || '') : ((pinfo && pinfo.avatar) || '');
      if (av) { img.src = av; img.onerror = function () { img.hidden = true; }; } else { img.hidden = true; }
    }
    if (isSelf) t.classList.add('lc-tile--self');
    g.appendChild(t);
    return t;
  }
  function gridAttachStream(uid, stream) {
    if (!root) return;
    var t = root.querySelector('.lc-grid [data-uid="' + uid + '"]');
    if (!t) t = gridTile(uid, (S.peers[uid] && S.peers[uid].info) || null);
    if (!t) return;
    var v = t.querySelector('.lc-tile-video');
    var a = t.querySelector('.lc-tile-audio');
    var target = v || a;
    if (target) { target.srcObject = stream; tryPlayGrid(); }
  }
  function gridSelfAttach() {
    if (!S.local) return;
    var t = gridTile('self', null);
    if (!t) return;
    var v = t.querySelector('.lc-tile-video');
    if (v) { v.srcObject = S.local; tryPlayGrid(); /* সেশন ১৪৮: সেলফি-টাইলেও স্পষ্ট-প্লে */ }
  }
  function gridTileState(uid, st) {
    if (!root) return;
    var t = root.querySelector('.lc-grid [data-uid="' + uid + '"]');
    if (!t) return;
    var s = t.querySelector('.lc-tile-state');
    if (!s) return;
    t.classList.remove('is-live', 'is-warn', 'is-fail');
    if (st === 'live') { t.classList.add('is-live'); s.textContent = ''; }
    else if (st === 'conn') { s.textContent = 'সংযোগ হচ্ছে…'; }
    else if (st === 'warn') { t.classList.add('is-warn'); s.textContent = 'বিচ্ছিন্ন হচ্ছে…'; }
    else if (st === 'fail') { t.classList.add('is-fail'); s.textContent = 'সংযোগ ব্যর্থ'; }
  }
  function tryPlayGrid() {
    if (!root) return;
    root.querySelectorAll('.lc-grid video').forEach(function (v) {
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () { /* জেসচার-প্রয়োজন — নীরব */ });
    });
  }
  function groupUI(on) {
    if (!root) return;
    root.classList.toggle('lc-root--group', !!on);
  }
  function setGroupHeader(title) {
    if (!root) return;
    var n = root.querySelector('.lc-name');
    if (n) n.textContent = title || (C().convTitle || 'গ্রুপ কল');
    var i2 = root.querySelector('.lc-avatar2');
    if (i2 && i2.src !== C().meAvatar) { /* মোডাল-অ্যাভাটার কলার-নামেই থাকে */ }
  }
  function maybeGroupConnected() {
    if (!isGroup()) return;
    if (S.state === 'connected') return;
    var anyLive = Object.keys(S.peers).some(function (k) { return S.peers[k].pc && S.peers[k].pc.connectionState === 'connected'; });
    if (!anyLive) return;
    S.state = 'connected';
    stopRing();
    S.t0 = Date.now();
    clearInterval(S.tickT);
    S.tickT = setInterval(function () {
      var s = Math.floor((Date.now() - S.t0) / 1000);
      var m = Math.floor(s / 60); s = s % 60;
      status(bn(m) + ':' + (s < 10 ? '০' + bn(s) : bn(s)), 'is-live');
    }, 1000);
    status('সংযুক্ত', 'is-live');
    startStatsTicker();
    tryPlayGrid();
  }

  /* poll-এর ভেতর থেকে ডাকা হয় — অংশগ্রহণকারী-রিকনসাইল + গ্লেয়ার-ফলব্যাক-অফার */
  function groupReconcile(g) {
    if (!isGroup() || !g || !root) return;
    if (typeof g.me_joined_at === 'string' && g.me_joined_at) S.meJoinedAt = g.me_joined_at;
    var seen = {};
    (g.participants || []).forEach(function (pj) {
      var meId = C().me;
      if (pj.id === meId) return;
      if (pj.status === 'joined') {
        seen[pj.id] = true;
        var p = peerEnsure(pj.id, pj);
        if (!p.tile || !root.querySelector('.lc-grid [data-uid="' + pj.id + '"]')) {
          gridTile(pj.id, pj);
          p.tile = true;
        }
        if (!p.pc && !p.madeOffer && joinedLaterThan(S.meJoinedAt, meId, pj.joined_at, pj.id)) {
          groupOfferPeer(pj.id, pj);
        }
      } else if (pj.status === 'left' || pj.status === 'declined' || pj.status === 'missed') {
        peerDrop(pj.id);
      }
    });
    /* টাইল-অরফান-সিঙ্ক: participants-এ আর নেই এমন পিয়ার সরাও */
    Object.keys(S.peers).forEach(function (uid) {
      if (!seen[uid]) peerDrop(uid);
    });
    /* কলার outgoing → কেউ জয়েন করলেই স্টেট-নামাও */
    if (S.state === 'outgoing' && Object.keys(S.peers).length) {
      stopRing();
      status('সংযোগ করা হচ্ছে…');
    }
    var liveCount = Object.keys(S.peers).filter(function (k) { return S.peers[k].pc && S.peers[k].pc.connectionState === 'connected'; }).length;
    if (S.state === 'connected') {
      if (!liveCount) status('প্রত্যাশা করা হচ্ছে…', 'is-warn');
    }
  }

  /* গ্রুপ-সিগন্যাল রাউটিং (poll থেকে) — from-ভিত্তিক পিয়ার-PC নির্বাচন */
  async function groupSignal(fromUid, p) {
    if (!isGroup()) return;
    if (p.type === 'offer' && p.sdp) {
      try {
        var pc = peerPC(fromUid);
        var pinfo = (S.peers[fromUid] && S.peers[fromUid].info) || null;
        if (!root.querySelector('.lc-grid [data-uid="' + fromUid + '"]')) gridTile(fromUid, pinfo);
        await pc.setRemoteDescription(new RTCSessionDescription(p.sdp));
        await peerDrain(fromUid);
        var ans = await pc.createAnswer();
        await pc.setLocalDescription(ans);
        S.outBuf.push({ type: 'answer', to: fromUid, sdp: { type: ans.type, sdp: ans.sdp } });
        scheduleFlush();
      } catch (_) { /* পরের অফারে/রিকনসাইলে আবার */ }
    } else if (p.type === 'answer' && p.sdp) {
      var pp = S.peers[fromUid];
      if (pp && pp.pc) {
        try { await pp.pc.setRemoteDescription(new RTCSessionDescription(p.sdp)); await peerDrain(fromUid); } catch (_) {}
      }
    } else if (p.type === 'candidate' && p.candidate) {
      var pq = S.peers[fromUid];
      if (pq && pq.pc && pq.pc.remoteDescription && pq.pc.remoteDescription.type) {
        try { await pq.pc.addIceCandidate(new RTCIceCandidate(p.candidate)); } catch (_) { /* stale */ }
      } else if (pq) {
        pq.queue.push(p.candidate); /* প্রতি-পিয়ার ICE-কিউ (1:1-এর S.queue-চুক্তির মতোই) */
      }
    } else if (p.type === 'left') {
      peerDrop(fromUid);
    } else if (p.type === 'ended' || p.type === 'cancelled') {
      if (S.state !== 'idle') {
        toast(p.type === 'cancelled' ? 'গ্রুপ-কল বাতিল হয়েছে' : 'কল শেষ হয়েছে');
        cleanup(true);
      }
    } else if (p.type === 'declined') {
      /* নীরব — ইতিহাস/অংশগ্রহণ-তালিকাতেই দৃশ্যমান (টোস্ট-স্প্যাম এড়ানো) */
    } else if (p.type === 'joined') {
      /* রিকনসাইল পোলেই টাইল আঁকবে */
    }
  }

  /* ── গ্রুপ-কল শুরু (caller) ── */
  async function startGroup(kind) {
    var ctx = C();
    if (S.state !== 'idle') { toast('একটি কল ইতিমধ্যে চলছে', true); return; }
    if (!ctx.convId) { toast('কল দিতে গ্রুপ-কথোপকথন খুলুন', true); return; }

    S.state = 'outgoing';
    S.role = 'caller';
    S.kind = kind;
    S.group = true;
    S.peer = null;
    S.queue = []; S.outBuf = []; /* সেশন ১২২: S.after রিসেট নয় (গায়েব-বাগ) */
    S.peers = {}; S.meJoinedAt = null;
    S.seq++; /* সেশন ১৪৮: নতুন-লাইফসাইকেল */

    ensureRoot();
    root.querySelector('.lc-ctl--cam').style.display = kind === 'video' ? '' : 'none';
    root.querySelector('.lc-incoming').hidden = true;
    root.classList.remove('lc-root--min'); minimize(false);
    setGroupHeader();
    groupUI(true);
    ensureGrid();
    gridTile('self', null);
    showVideos(false);
    status(kind === 'video' ? icon('fa-video') + ' গ্রুপ ভিডিও কল দেওয়া হচ্ছে…' : icon('fa-phone') + ' গ্রুপ অডিও কল দেওয়া হচ্ছে…');
    startRing('outgoing');
    schedulePoll(900);

    try {
      var seq0 = S.seq; /* সেশন ১৪৮: এই-লাইফসাইকেলের টোকেন */
      var stream = await getMedia(kind);
      attachLocal(stream);
      gridSelfAttach();
      var r = await api('POST', '/api/calls/start', { conv_id: ctx.convId, kind: S.kind });
      if (!r.ok) {
        var gmsg = { busy: 'আপনার আরেকটি কল চলছে', no_members: 'গ্রুপে অন্য কোনো সদস্য নেই', too_many_members: 'গ্রুপটি কল-সীমার (৮ জন) বেশি বড়' };
        toast(gmsg[r.error] || 'গ্রুপ-কল শুরু করা যায়নি', true);
        cleanup(true);
        return;
      }
      /* সেশন ১৪৮: দ্রুত-বাতিল-রেস — নিচের ১:১-শাখার মতোই (বিস্তারিত সেখানে) */
      if (seq0 !== S.seq) {
        try { await api('POST', '/api/calls/' + r.call_id + '/end', { reason: 'cancelled' }); } catch (_) {}
        return;
      }
      S.callId = r.call_id;
      status('রিং হচ্ছে…');
    } catch (err) {
      var gm = (err && err.message) || '';
      var _gfid = S.callId;
      if (gm.indexOf('permission:') === 0 || gm.indexOf('device:') === 0 || gm.indexOf('insecure:') === 0) toast(gm.split(':').slice(1).join(':').trim(), true);
      else toast('মাইক/ক্যামেরা চালু করা যায়নি', true);
      cleanup(true);
      if (_gfid) { try { await api('POST', '/api/calls/' + _gfid + '/end', { reason: 'failed' }); } catch (_) {} }
    }
  }

  /* ── গ্রুপ-কল গ্রহণ (callee) — অফার নেই; সার্ভারে জয়েন + আগে-জয়েনডদের প্রতি অফার ── */
  async function acceptGroup() {
    if (S.state !== 'incoming') return;
    click();
    hideIncoming();
    if (S.incT) { clearTimeout(S.incT); S.incT = null; }
    S.state = 'connecting';
    status('সংযোগ করা হচ্ছে…');
    try {
      var stream = await getMedia(S.kind);
      attachLocal(stream);
      var r = await api('POST', '/api/calls/' + S.callId + '/answer', {});
      if (!r.ok || !r.group) { toast('কল গ্রহণ করা যায়নি (' + (r.error || '?') + ')', true); cleanup(true); return; }
      S.meJoinedAt = r.me_joined_at || null;
      groupUI(true);
      ensureGrid();
      gridTile('self', null);
      gridSelfAttach();
      var offered = false;
      (r.joined || []).forEach(function (pj) {
        if (pj.id === C().me) return;
        peerEnsure(pj.id, pj);
        gridTile(pj.id, pj);
        groupOfferPeer(pj.id, pj);
        offered = true;
      });
      if (!offered) status('অন্যদের অপেক্ষা হচ্ছে…');
      else status('সংযোগ করা হচ্ছে…');
    } catch (err) {
      var m = (err && err.message) || '';
      var _gaid = S.callId;
      if (m.indexOf('permission:') === 0 || m.indexOf('device:') === 0 || m.indexOf('insecure:') === 0) toast(m.split(':').slice(1).join(':').trim(), true);
      else toast('কল গ্রহণে সমস্যা', true);
      cleanup(true);
      if (_gaid) { api('POST', '/api/calls/' + _gaid + '/end', { reason: 'failed' }).catch(function () {}); }
    }
  }

  /* ═══ সেশন ১১৩ শেষ ═══════════════════════════════════════════════════ */

  /* ── কল শুরু (caller) — সেশন ১২২ UI-ফার্স্ট পুনর্গঠন ────────────────── */
  async function start(kind) {
    var ctx = C(); /* লেজি-পাঠ — মেসেঞ্জার-ভিউ পরে সমৃদ্ধ করলেও ধরা পড়বে */
    if (S.state !== 'idle') { toast('একটি কল ইতিমধ্যে চলছে', true); return; }
    /* সেশন ১১৩: গ্রুপ-কথোপকথনে (isGroup+convId, peer নেই) গ্রুপ-স্টার্ট-শাখা */
    if (ctx.isGroup && ctx.convId && !ctx.peer) return startGroup(kind);
    if (!ctx.convId || !ctx.peer) { toast('কল দিতে কথোপকথন খুলুন', true); return; }

    S.state = 'outgoing';
    S.role = 'caller';
    S.kind = kind;
    S.peer = ctx.peer;
    S.queue = [];
    S.outBuf = [];
    S.seq++; /* সেশন ১৪৮: নতুন-লাইফসাইকেল */
    /* সেশন ১২২-বাগফিক্স: S.after=0 রিসেট নয় — কার্সার গ্লোবাল (call_signals-id);
       রিসেট করলে শুরুর প্রথম পোলেই ১০-মিনিট-উইন্ডোর পুরনো অন্য-কলের 'ended'/'cancelled'
       সিগন্যাল রিপ্লে হত → কল-UI নিজে-ই নিজেকে কেটে ফেলত (মডাল গায়েব-বাগ)। */

    /* ধাপ-১ (UI-ফার্স্ট): ইন্টারফেস তাৎক্ষণিক সামনে — মিডিয়া/নেটওয়ার্ক পরে */
    ensureRoot();
    root.querySelector('.lc-ctl--cam').style.display = kind === 'video' ? '' : 'none';
    root.querySelector('.lc-incoming').hidden = true;
    hidePermPanel();
    root.classList.remove('lc-root--min'); minimize(false);
    setPeerUI();
    showVideos(false);
    status(kind === 'video' ? icon('fa-video') + ' ভিডিও কল দেওয়া হচ্ছে…' : icon('fa-phone') + ' অডিও কল দেওয়া হচ্ছে…');
    startRing('outgoing');
    schedulePoll(900);
    /* কল-ইন্টেন্ট-জেসচারেই নোটিফিকেশন-অনুমতি জেনেলি চাওয়া */
    try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch (_) {}

    /* ধাপ-২: মিডিয়া + অফার — ব্যর্থ হলে প্যানেল, মোডাল খোলাই থাকে */
    await acquireAndOffer();
  }

  async function acquireAndOffer() {
    var seq0 = S.seq; /* সেশন ১৪৮: এই-লাইফসাইকেলের টোকেন */
    status(S.kind === 'video' ? icon('fa-video') + ' ভিডিও কল দেওয়া হচ্ছে…' : icon('fa-phone') + ' অডিও কল দেওয়া হচ্ছে…');
    try {
      var stream = await getMedia(S.kind);
      hidePermPanel();
      attachLocal(stream);
      var pc = createPC();
      S.pc = pc;
      stream.getTracks().forEach(function (t) { pc.addTrack(t, stream); });

      var offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      var r = await api('POST', '/api/calls/start', {
        conv_id: C().convId,
        kind: S.kind,
        offer: { type: offer.type, sdp: offer.sdp }
      });
      if (!r.ok) {
        var msgMap = { busy: 'আপনার আরেকটি কল চলছে', peer_busy: 'প্রাপক এখন অন্য কলে ব্যস্ত', group_call_unsupported: 'গ্রুপ-কল এখনো সমর্থিত নয়' };
        toast(msgMap[r.error] || 'কল শুরু করা যায়নি', true);
        cleanup(true);
        return;
      }
      /* সেশন ১৪৮-রেস-ফিক্স (স্টেবিলিটি): UI-ফার্স্টে ক্লিক-মুহূর্তেই মোডাল+রিং, কিন্তু
         /start-POST তখনও ফ্লাইটে — এই-ফাঁকেই হ্যাংআপ করলে S.callId=null → end-POST
         কখনো যেত না → সার্ভারে ৪৫-সেকেন্ড 'ringing' ঝুলে থেকে busy-লক (৪০৯)।
         এখন: লাইফসাইকেল-টোকেন বদলে গেলে (বাতিল/নতুন-কল) সদ্য-তৈরি কল সরাসরি
         'cancelled'-মার্ক — সার্ভার পরিষ্কার, busy-লক শূন্য। */
      if (seq0 !== S.seq) {
        try { await api('POST', '/api/calls/' + r.call_id + '/end', { reason: 'cancelled' }); } catch (_) {}
        return;
      }
      S.callId = r.call_id;
      status('রিং হচ্ছে…');
      startRing('outgoing');
      scheduleFlush(); /* সেশন ১২২: অফার-পূর্ব জমা-করা ICE-ব্যাচ তাৎক্ষণিক পাঠাও */
    } catch (err) {
      /* মিডিয়া/অফার-ব্যর্থতা → UI খোলা রেখে সমাধান-গাইড; রিট্রাইয়ে এখান থেকেই পুনঃশুরু */
      handleMediaError(err, acquireAndOffer);
    }
  }

  /* ── আসন্ন-কল মোডাল (callee) ──────────────────────────────────────────── */
  function showIncoming(inc) {
    if (S.state !== 'idle') return; /* ব্যস্ত — সার্ভার নিজেই missed-মার্ক করবে */
    S.state = 'incoming';
    S.role = 'callee';
    S.callId = inc.id;
    S.kind = inc.kind;
    S.group = !!inc.group; /* সেশন ১১৩: গ্রুপ-আসন্ন-কল ফ্ল্যাগ */
    S.peer = inc.caller;
    S.pendingOffer = inc.offer;
    S.queue = [];
    S.outBuf = [];
    S.peers = {}; S.meJoinedAt = null;
    /* সেশন ১২২: S.after রিসেট নয় (গায়েব-বাগ — উপরের নোট দ্রষ্টব্য) */

    ensureRoot();
    root.querySelector('.lc-ctl--cam').style.display = inc.kind === 'video' ? '' : 'none';
    setPeerUI();
    var box = root.querySelector('.lc-incoming');
    box.hidden = false;
    box.classList.remove('is-out'); /* সেশন ১৪৮: পুনঃদর্শনে বিদায়-ক্লাস রিসেট */
    box.querySelector('.lc-incoming-kind').innerHTML = inc.group
      ? (inc.kind === 'video' ? icon('fa-users') + ' গ্রুপ ভিডিও কল আসছে' : icon('fa-users') + ' গ্রুপ অডিও কল আসছে')
      : (inc.kind === 'video' ? icon('fa-video') + ' ভিডিও কল আসছে' : icon('fa-phone') + ' অডিও কল আসছে');
    status('');
    startRing('incoming');
    schedulePoll(900);
    /* সেশন ৯৭: ক্লায়েন্ট-সাইড সেফটি-টাইমআউট — কলারের ক্লায়েন্ট মারা গেলে
       (end-কল না-পাঠিয়ে) সার্ভার মিসড-মার্ক করতে পারে না এবং ক্যালির মোডাল
       অনির্দিষ্টকাল ঝুলে থাকত। সার্ভারের ring_timeout_s - age_s (+৬সে মার্জিন)
       পরে নিজে থেকেই মোডাল সরাও। */
    if (S.incT) { clearTimeout(S.incT); S.incT = null; }
    var rtS = (typeof inc.ring_timeout_s === 'number' ? inc.ring_timeout_s : 45) - (inc.age_s || 0);
    S.incT = setTimeout(function () {
      S.incT = null;
      if (S.state === 'incoming') { toast('সাড়া পাওয়া যায়নি — কলটি মিসড ধরা হলো', true); cleanup(true); }
    }, Math.max(rtS * 1000 + 6000, 12000));
    /* সেশন ১২২: হিডেন-ট্যাব-সচেতনতা — টাইটেল-ফ্ল্যাশ + (অনুমতি থাকলে) নোটিফিকেশন */
    startIncomingAttention(inc);
    /* সেশন ১৩০: মোবাইল-ভাইব্রেশন — পাবলিক-পেজ/অন্য-ট্যাবে থাকলেও শরীরে-অনুভূত
       রিং (one-shot প্যাটার্ন ~১.৩সে; লুপ-নয় তাই cleanup-ছাড়াই নিরাপদ);
       iOS-Safari vibrate নেই — typeof-গার্ড বাধ্যতামূলক */
    try { if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate([380, 180, 380, 180, 420]); } catch (_) {}
  }
  /* সেশন ১২২: আসন্ন-কল দৃষ্টি-আকর্ষণ — FB-প্যারিটি (ট্যাব-শিরোনাম ফ্ল্যাশ + OS-নোটিফিকেশন) */
  function startIncomingAttention(inc) {
    stopIncomingAttention();
    S.titleBase = document.title;
    var kindBn = inc.kind === 'video' ? 'ভিডিও' : 'অডিও';
    var pname = (inc.caller && inc.caller.name) || '';
    var flip = false;
    S.notifT = setInterval(function () {
      flip = !flip;
      try { document.title = flip ? ('📞 ' + pname + ' — ' + kindBn + ' কল!') : (S.titleBase || ''); } catch (_) {}
    }, 1100);
    try {
      if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
        var n = new Notification('📞 ' + kindBn + ' কল আসছে', { body: pname + ' আপনাকে কল দিচ্ছেন — উত্তর দিতে চাপ দিন', tag: 'lf-call' });
        n.onclick = function () { try { window.focus(); n.close(); } catch (_) {} };
      }
    } catch (_) {}
  }
  function stopIncomingAttention() {
    if (S.notifT) { clearInterval(S.notifT); S.notifT = null; }
    if (S.titleBase != null) { try { document.title = S.titleBase; } catch (_) {} S.titleBase = null; }
  }
  function hideIncoming() {
    if (root) {
      var box = root.querySelector('.lc-incoming');
      /* সেশন ১৪৮: গ্রহণ/প্রত্যাখ্যানে ফেড+স্কেল-ডাউন বিদায় (হুট-গায়েব নয়) —
         is-out-ক্লাসে pointer-events:none তাৎক্ষণিক, ২০০ms পরে hidden */
      if (box && !box.hidden) {
        box.classList.add('is-out');
        setTimeout(function () { if (box.isConnected) { box.hidden = true; box.classList.remove('is-out'); } }, 200);
      } else if (box) { box.hidden = true; }
    }
    stopRing();
  }

  async function acceptCall() {
    if (S.state !== 'incoming') return;
    if (isGroup()) return acceptGroup(); /* সেশন ১১৩: গ্রুপ-গ্রহণ-শাখা (pendingOffer নেই) */
    if (!S.pendingOffer) return;
    click();
    hideIncoming();
    stopIncomingAttention();
    if (S.incT) { clearTimeout(S.incT); S.incT = null; }
    S.state = 'connecting';
    status('সংযোগ করা হচ্ছে…');
    await acceptResume();
  }
  /* সেশন ১২২: গ্রহণ-ফ্লো আলাদা — অনুমতি-ব্লক হলে প্যানেল + রিট্রাইয়ে এখান থেকেই
     পুনঃশুরু; এই-পর্যায়ে সার্ভার-সাইড কল কেটে দেওয়া হয় না (কলার তখনও রিং পান) */
  async function acceptResume() {
    try {
      var stream = await getMedia(S.kind);
      hidePermPanel();
      attachLocal(stream);
      var pc = createPC();
      S.pc = pc;
      stream.getTracks().forEach(function (t) { pc.addTrack(t, stream); });

      await pc.setRemoteDescription(new RTCSessionDescription(S.pendingOffer));
      S.pendingOffer = null;
      await drainQueue();

      var answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      var r = await api('POST', '/api/calls/' + S.callId + '/answer', { answer: { type: answer.type, sdp: answer.sdp } });
      if (!r.ok) {
        if (r.error === 'expired' || r.error === 'not_ringing') toast('কলটির মেয়াদ শেষ — মিসড ধরা হয়েছে', true);
        else toast('কল গ্রহণ করা যায়নি (' + (r.error || '?') + ')', true);
        cleanup(true);
        return;
      }
      showVideos(S.kind === 'video');
    } catch (err) {
      handleMediaError(err, acceptResume);
    }
  }

  async function declineCall() {
    hideIncoming();
    if (S.incT) { clearTimeout(S.incT); S.incT = null; }
    var id = S.callId;
    cleanup(true);
    if (id) { try { await api('POST', '/api/calls/' + id + '/decline'); } catch (_) {} }
  }

  /* ── সংযুক্ত ──────────────────────────────────────────────────────────── */
  function onConnected() {
    if (S.state === 'connected') return;
    if (isGroup()) { maybeGroupConnected(); return; } /* সেশন ১১৩: গ্রুপে নিজস্ব-পথ */
    S.state = 'connected';
    stopRing();
    hideIncoming();
    showVideos(S.kind === 'video');
    tryPlayRemote();
    S.t0 = Date.now();
    status('সংযুক্ত', 'is-live');
    clearInterval(S.tickT);
    S.tickT = setInterval(function () {
      var s = Math.floor((Date.now() - S.t0) / 1000);
      var m = Math.floor(s / 60); s = s % 60;
      status(bn(m) + ':' + (s < 10 ? '০' + bn(s) : bn(s)), 'is-live');
    }, 1000);
    startStatsTicker(); /* সেশন ১১১: কোয়ালিটি-পিল + ডায়াগনস্টিকস লাইভ */
  }

  /* ── শেষ/ক্লিনআপ ──────────────────────────────────────────────────────── */
  function cleanup(silent) {
    S.seq++; /* সেশন ১৪৮: চলমান-লাইফসাইকেল বাতিল — লেট-কমপ্লিটিং /start আর অ্যাডপ্ট হবে না */
    stopRing();
    stopIncomingAttention(); /* সেশন ১২২ */
    clearInterval(S.tickT); S.tickT = null;
    clearTimeout(S.flushT); S.flushT = null;
    clearTimeout(S.pollT); S.pollT = null;
    clearTimeout(S.qPollT); S.qPollT = null; /* সেশন ১১১ */
    spkTeardown(); /* সেশন ১১৮: লেভেল-মিটার-নোড + টিকার পরিষ্কার */
    if (S.incT) { clearTimeout(S.incT); S.incT = null; }
    S.statsOpen = false; S.lastStats = null; S.poorStreak = 0; S.poorNotified = false;
    S.degrade = 0; S.goodStreak = 0; S.degradeToasted = {}; S.degradeNotBefore = 0;
    S.lastBytes = 0; S.lastBytesAt = 0;
    S.iceRestarts = 0; S.restartAnswer = false;
    /* সেশন ১১৩: গ্রুপ-পিয়ার-PC সমূহ বন্ধ */
    Object.keys(S.peers).forEach(function (uid) {
      var p = S.peers[uid];
      if (p && p.pc) { try { p.pc.close(); } catch (_) {} }
    });
    S.peers = {}; S.group = false; S.meJoinedAt = null;
    if (S.pc) { try { S.pc.close(); } catch (_) {} S.pc = null; }
    if (S.local) { S.local.getTracks().forEach(function (t) { try { t.stop(); } catch (_) {} }); S.local = null; }
    S.remote = null;
    S.queue = []; S.outBuf = [];
    S.callId = null; S.pendingOffer = null; S.role = null;
    S.muted = false; S.camOff = false;
    S.permRetry = null; S.permBusy = false; /* সেশন ১২২: পারমিশন-ফ্লো রিসেট */
    S.state = 'idle';
    if (root) {
      var dying = root;
      root = null;
      /* সেশন ১৪৮: এক্সিট-অ্যানিমেশন (FB/টেলিগ্রাম-প্যারিটি) — হুট-করে-গায়েব নয়,
         ২৪০ms ফেড+স্কেল-ডাউন; hidden-ট্যাবে টাইমার-থ্রটল/রিডিউসড-মোশনে সরাসরি remove */
      if (document.hidden || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
        try { dying.remove(); } catch (_) {}
      } else {
        dying.classList.add('lc-root--closing');
        setTimeout(function () { try { dying.remove(); } catch (_) {} }, 240);
      }
    }
    if (!silent && typeof S._onended === 'function') { try { S._onended(); } catch (_) {} }
    /* পোল-হার্টবিট পুনরায় চালু — নাহলে কল-শেষে ক্যালি আর কখনো নতুন আসন্ন-কল দেখবে না */
    schedulePoll();
  }
  async function endCall(reason) {
    var id = S.callId;
    var wasConnected = S.state === 'connected';
    var wasGroupCallee = isGroup() && S.role !== 'caller';
    cleanup(true);
    if (id) {
      try { await api('POST', '/api/calls/' + id + '/end', { reason: reason || 'hangup' }); } catch (_) {}
    }
    if (reason === 'failed') { /* টোস্ট আগেই দেখানো */ }
    else if (wasGroupCallee) toast(wasConnected ? 'গ্রুপ-কল থেকে বেরিয়ে গেছেন' : 'গ্রুপ-কল বাতিল হয়েছে');
    else if (wasConnected && reason === 'hangup') toast('কল শেষ হয়েছে');
  }

  window.addEventListener('pagehide', function () {
    if (S.callId) {
      try {
        fetch('/api/calls/' + S.callId + '/end', {
          method: 'POST', keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'left_page' })
        });
      } catch (_) {}
    }
    if (S.local) S.local.getTracks().forEach(function (t) { try { t.stop(); } catch (_) {} });
    if (S.pc) { try { S.pc.close(); } catch (_) {} }
  });

  /* ── কন্ট্রোল ─────────────────────────────────────────────────────────── */
  function toggleMic() {
    if (!S.local) return;
    S.muted = !S.muted;
    S.local.getAudioTracks().forEach(function (t) { t.enabled = !S.muted; });
    if (root) {
      var b = root.querySelector('.lc-ctl--mic');
      b.classList.toggle('is-off', S.muted);
      b.innerHTML = icon(S.muted ? 'fa-microphone-slash' : 'fa-microphone');
      b.title = S.muted ? 'মাইক চালু করুন' : 'মাইক বন্ধ করুন';
    }
    toast(S.muted ? 'মাইক বন্ধ' : 'মাইক চালু');
  }
  function toggleCam() {
    if (!S.local || S.kind !== 'video') return;
    S.camOff = !S.camOff;
    S.local.getVideoTracks().forEach(function (t) { t.enabled = !S.camOff; });
    if (root) {
      var b = root.querySelector('.lc-ctl--cam');
      b.classList.toggle('is-off', S.camOff);
      b.innerHTML = icon(S.camOff ? 'fa-video-slash' : 'fa-video');
      root.classList.toggle('lc-root--camoff', S.camOff);
    }
    toast(S.camOff ? 'ক্যামেরা বন্ধ' : 'ক্যামেরা চালু');
  }

  /* ── পোল-লুপ (সিগন্যালিং-হার্টবিট) ────────────────────────────────────── */
  function schedulePoll(ms) {
    clearTimeout(S.pollT);
    var interval;
    if (ms) interval = ms;
    else if (S.state === 'connecting') interval = 800;
    else if (S.state === 'outgoing' || S.state === 'incoming') interval = 1000;
    else if (S.state === 'connected') interval = 1500;
    /* মেসেঞ্জার-পেজে ৩সে, অন্য-পেজে ৫সে (সার্ভার-লোড-বান্ধব);
       মেয়াদোত্তীর্ণ সেশন (টানা 401) → ১৫সে নিঃশব্দ ব্যাকঅফ (সেশন ১২২) */
    else if (S.auth401 > 2) interval = 15000;
    else interval = C().convId ? 3000 : 5000;
    S.pollT = setTimeout(poll, interval);
  }

  async function poll() {
    /* সেশন ১২২: হার্টবিট+ভিজিবিলিটি+লুপ — একাধিক ট্রিগারে ডাবল-পোল-গার্ড */
    if (S.pollBusy) return;
    S.pollBusy = true;
    var nextState = S.state;
    try {
      var r = await api('GET', '/api/calls/poll?after=' + S.after);
      /* মেয়াদোত্তীর্ণ সেশন (401) — নিঃশব্দ ব্যাকঅফ (schedulePoll-এ ব্যবহৃত) */
      if (r && r.__status === 401) S.auth401 = Math.min(S.auth401 + 1, 9);
      else if (r && r.ok) S.auth401 = 0;
      if (r && r.ok) {
        S.after = r.after || S.after;

        /* (ক) আসন্ন কল */
        if (r.incoming && S.state === 'idle') showIncoming(r.incoming);

        /* (খ) চলমান কল-স্টেট (caller: accepted+answer) */
        if (r.active && r.active.id === S.callId && S.role === 'caller' && (S.state === 'outgoing' || S.state === 'connecting') && r.active.answer) {
          nextState = 'connecting';
          stopRing();
          status('সংযোগ করা হচ্ছে…');
          var pc = S.pc;
          if (pc && (!pc.remoteDescription || !pc.remoteDescription.type)) {
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(r.active.answer));
              await drainQueue();
              showVideos(S.kind === 'video');
            } catch (e) { /* পুনঃপোলে আবার */ }
          }
        }

        /* (গ) সিগন্যাল-ডেলিভারি (ICE + লাইফসাইকেল) — গ্রুপে from-ভিত্তিক মেশ-রাউটিং (সেশন ১১৩)
           সেশন ১২২: S.callId ছাড়া প্রসেস-নয় — callId-null অবস্থায় পুরনো-সিগন্যাল-রিপ্লেতে
           cleanup-সুইসাইড-বাগ বন্ধ (গায়েব-বাগের অর্ধেক এখানেই) */
        if (r.signals && r.signals.length && S.callId) {
          for (var i = 0; i < r.signals.length; i++) {
            var sg = r.signals[i];
            if (S.callId && sg.call_id !== S.callId) continue;
            var p = sg.signal;
            if (!p) continue;
            if (isGroup()) { await groupSignal(sg.from, p); continue; }
            if (p.type === 'candidate') {
              var cand = p.candidate;
              if (!cand) continue;
              if (S.pc && S.pc.remoteDescription && S.pc.remoteDescription.type) {
                try { await S.pc.addIceCandidate(new RTCIceCandidate(cand)); } catch (e) { /* stale — ঠিক আছে */ }
              } else {
                S.queue.push(cand); /* ① ICE-কিউ — remoteDescription-এর অপেক্ষায় */
              }
            } else if (p.type === 'accepted') {
              /* caller-এর answer আসবে active.answer দিয়ে — এখানে শুধু দ্রুত-নজ (রিং থামাও) */
              if (S.state === 'outgoing') { stopRing(); status('সংযোগ করা হচ্ছে…'); nextState = 'connecting'; }
            } else if (p.type === 'declined') {
              if (S.state === 'outgoing' || S.state === 'connecting') { toast('কল প্রত্যাখ্যাত হয়েছে'); cleanup(true); }
            } else if (p.type === 'cancelled') {
              if (S.state === 'incoming') { toast('কলটি বাতিল হয়েছে'); cleanup(true); }
            } else if (p.type === 'ended') {
              if (S.state === 'outgoing' || S.state === 'connecting' || S.state === 'connected' || S.state === 'incoming') {
                if (S.state === 'connected') toast(isGroup() ? 'গ্রুপ-কল শেষ হয়েছে' : 'অপর পক্ষ কল কেটে দিয়েছে');
                cleanup(true);
              }
            } else if (p.type === 'offer' && p.sdp) {
              /* সেশন ৯৭: পিয়ারের ICE-restart/renegotiation-অফার (সংযুক্ত-অবস্থায়) */
              if ((S.state === 'connected' || S.state === 'connecting') && S.pc) {
                try {
                  await S.pc.setRemoteDescription(new RTCSessionDescription(p.sdp));
                  await drainQueue();
                  var ans = await S.pc.createAnswer();
                  await S.pc.setLocalDescription(ans);
                  S.outBuf.push({ type: 'answer', sdp: { type: ans.type, sdp: ans.sdp } });
                  scheduleFlush();
                  status('পুনঃসংযোগ হচ্ছে…', 'is-warn');
                } catch (e) { /* পরের সিগন্যালে আবার */ }
              }
            } else if (p.type === 'answer' && p.sdp) {
              /* সেশন ৯৭: আমার ICE-restart-অফারের উত্তর */
              if (S.restartAnswer && S.pc) {
                S.restartAnswer = false;
                try {
                  await S.pc.setRemoteDescription(new RTCSessionDescription(p.sdp));
                  await drainQueue();
                } catch (e) { /* রিট্রাই-বারে ফিরবে */ }
              }
            }
          }
        }

        /* (ঘ) সদ্য-শেষ কল (রিং-টাইমআউট/মিসড ইত্যাদি) */
        if (r.ended && r.ended.length && S.state !== 'idle') {
          for (var j = 0; j < r.ended.length; j++) {
            var en = r.ended[j];
            if (en.id !== S.callId) continue;
            if (S.state === 'outgoing' && (en.status === 'missed' || en.reason === 'timeout')) toast('উত্তর পাওয়া যায়নি', true);
            else if (S.state === 'outgoing' && en.status === 'declined') toast('কল প্রত্যাখ্যাত হয়েছে');
            else if (S.state === 'connected' && en.status === 'ended') toast('কল শেষ হয়েছে');
            cleanup(true);
            break;
        }
        }

        /* (ঙ) সেশন ১১৩: গ্রুপ-অংশগ্রহণকারী-রিকনসাইল (টাইল/পিয়ার-সেট/অবস্থা) */
        if (isGroup() && r.group && r.group.id === S.callId) groupReconcile(r.group);
      }
    } catch (_) { /* নেটওয়ার্ক-ঝাঁকুনি — পরের টিকে আবার */ }
    finally {
      S.pollBusy = false;
      schedulePoll();
    }
  }

  /* সেশন ১২২: ব্যাকগ্রাউন্ড-ট্যাব পোল-হার্টবিট + দৃশ্যমানতা-সচেতন পোল ─────
     Chrome হিডেন-ট্যাবে DOM-টাইমার ১-মিনিট-পর-পর থ্রটল করে — ফলে কল-পপআপ
     দেরিতে/না-ও আসত (রিং-টাইমআউট ৪৫সে < থ্রটল ৬০সে)। Worker-টাইমার থ্রটল-হয়
     না — তাই হার্টবিট-টিকে দৃশ্যমানতা-নির্বিশেষে পোল ট্রিগার করাই (CSP-ক্লিন,
     same-origin /assets/js/call-heartbeat.js — blob: দরকার নেই)। */
  function startHeartbeat() {
    if (S.hbWorker) return;
    try {
      /* স্যান্ডবক্স-গেটওয়ে (XTransformPort) প্রসঙ্গে Worker-URL-এও কোয়েরি দরকার —
         নইলে গেটওয়ে ডিফল্ট-পোর্টে পাঠায় → 404 → হার্টবিট মৃত। প্রোডাকশনে কোয়েরি
         নেই → URL অপরিবর্তিত। */
      var wUrl = '/assets/js/call-heartbeat.js';
      try {
        var sbm = location.search.match(/XTransformPort=(\d+)/);
        if (sbm && wUrl.indexOf('XTransformPort') === -1) wUrl += '?XTransformPort=' + sbm[1];
      } catch (_) {}
      S.hbWorker = new Worker(wUrl);
      S.hbWorker.onerror = function () { try { S.hbWorker.terminate(); } catch (_) {} S.hbWorker = null; };
      S.hbWorker.onmessage = function () {
        if (document.hidden) { clearTimeout(S.pollT); poll(); }
      };
    } catch (_) { S.hbWorker = null; }
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) { clearTimeout(S.pollT); poll(); }
  });
  window.addEventListener('focus', function () { clearTimeout(S.pollT); poll(); });
  window.addEventListener('pageshow', function (e) { if (e && e.persisted) { clearTimeout(S.pollT); poll(); } });
  startHeartbeat();

  /* ── এক্সপোজ ──────────────────────────────────────────────────────────── */
  window.LekhokCall = {
    start: start,
    end: function () { endCall('hangup'); },
    toggleMic: toggleMic,
    toggleCam: toggleCam,
    minimize: function () { minimize(!S.minimized); },
    state: function () { return S.state; },
    toggleStats: function () { toggleStats(); },
    /* QA-হুক: হেডলেস-ব্রাউজার টেস্টে UI-স্টেট যাচাই */
    _debug: S,
    /* সেশন ১১১ QA-হুক — রুট/কোয়ালিটি-UI যাচাই (কল ছাড়াই) */
    _qaEnsureRoot: function () { ensureRoot(); return !!root; },
    _qaSetQuality: function (lvl, rtt) { setQuality(lvl, rtt, 'QA-নমুনা'); },
    /* সেশন ১৩১ QA-হুক — সাশ্রয়-ল্যাডার যাচাই (কল-ছাড়া ব্যাজ/স্তর-পেইন্ট; লাইভ-কলে প্রকৃত-পথ) */
    _qaDegradeState: function () { return { level: S.degrade || 0, streak: S.poorStreak, good: S.goodStreak || 0, gated: Date.now() < (S.degradeNotBefore || 0), senders: videoSenders().length }; },
    _qaApplyDegrade: function (level) { applyVideoDegradation(Math.max(0, Math.min(3, level | 0))); return S.degrade; },
    /* সেশন ১১৮ QA-হুক: স্পিকার-হাইলাইট + ভিডিও-স্ট্যাট (হেডলেস-যাচাই — কল/মাইক ছাড়াই) */
    _qaSetSpeaking: function (uid) { spkPaint(uid == null ? null : String(uid)); return true; },
    _qaSpeaking: function () { return SPK.active; },
    _qaSetVideoStats: function (o) {
      S.lastStats = S.lastStats || { at: Date.now() };
      if (o && typeof o === 'object') { for (var k in o) S.lastStats[k] = o[k]; }
      if (!S.statsOpen) toggleStats(true);
      var wasIdle = S.state === 'idle';
      if (wasIdle) S.state = 'connected'; /* QA-নমুনা — খালি-স্টেট-বাইপাস */
      renderStats();
      if (wasIdle) S.state = 'idle';
      return true;
    },
    /* সেশন ১১৩ QA-হুক: কল ছাড়াই গ্রুপ-গ্রিড DOM নির্মাণ (হেডলেস-যাচাই) —
       ফেক-অংশগ্রহণকারী টাইল + অবস্থা-ক্লাস; রিয়েল-কল-স্টেট অপরিবর্তিত থাকে */
    _qaEnsureGroupGrid: function () {
      S.group = true; S.kind = 'audio';
      ensureRoot();
      groupUI(true);
      ensureGrid();
      gridTile('self', { name: 'আপনি', avatar: C().meAvatar || '' });
      gridTile(9001, { name: 'কালাম-টেস্ট-১', avatar: '/avatar/0' });
      gridTile(9002, { name: 'কালাম-টেস্ট-২', avatar: '/avatar/0' });
      gridAttachStream(9001, new MediaStream());
      gridTileState(9002, 'fail');
      gridTileState(9001, 'live');
      return Object.keys(S.peers).length + 1;
    },
    _qaTeardownGroupGrid: function () {
      Object.keys(S.peers).forEach(peerDrop);
      S.group = false;
      if (root) { groupUI(false); var g = root.querySelector('.lc-grid'); if (g) g.remove(); }
      return true;
    },
    /* সেশন ১২২ QA-হুক — পারমিশন-প্যানেল/হার্টবিট/পোল যাচাই */
    _qaShowPerm: function (msg) { ensureRoot(); showPermPanel(msg || 'ব্রাউজারে এই সাইটের মাইক্রোফোন/ক্যামেরার অনুমতি ব্লক করা আছে।'); return !!root && !root.querySelector('.lc-perm').hidden; },
    _qaPermState: function () { return { retryHooked: !!S.permRetry, busy: S.permBusy, worker: !!S.hbWorker, auth401: S.auth401, state: S.state }; },
    _qaPollNow: function () { clearTimeout(S.pollT); poll(); return true; },
    /* সেশন ১৪৮ QA-হুক — রিং-হার্ডস্টপ + সেলফি-PIP যাচাই */
    _qaRingState: function () { return { active: !!S.ringing, nodes: S.ringing ? (S.ringing.nodes || []).length : 0 }; },
    _qaSelfPip: function () { var lv = root ? root.querySelector('.lc-local-video') : null; return { pip: !!root && root.classList.contains('lc-root--has-local'), visible: !!lv && lv.getClientRects().length > 0, live: !!lv && !!lv.srcObject && lv.videoWidth > 0 }; }
  };

  /* আইডল-অবস্থাতেও পোল-লুপ চালু — ক্যালি হিসেবে আসন্ন-কল দেখতে হলে
     পেজ-লোডের পর থেকেই হার্টবিট লাগবে (কলার তো start()-এ শুরু করেই) */
  schedulePoll();
})();
