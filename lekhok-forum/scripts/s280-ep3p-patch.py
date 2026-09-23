#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
s280-ep3p-patch.py — session280 (ইউজার-স্পেক, PressReader ৩-প্যানেল): /epaper রিডার পুনর্গঠন
────────────────────────────────────────────────────────────────────────────────────────
ইউজার-স্পেক:
  ① একক স্লিক কন্ট্রোল-বার ([পত্রিকা-সিলেক্টর ▾] · [বাংলা তারিখ] │ [পাতা X/Y ▾] [- ১০০% +] [ঘোরান] [⛶] [মোড])
     — পুরনো ৩-স্তর বার (সুইচ-স্ট্রিপ + কন্ট্রোল-বার + ভিউয়ার-বার) সম্পূর্ণ বিলোপ (রিপিটিশন-শূন্য)
  ② বাম প্যানেল: সব পাতার থাম্বনেইল-রেল (pdf.js ছোট-ক্যানভাস অলস-ক্রমিক প্রি-রেন্ডার — PLANS session279-প্রস্তাব)
  ③ মাঝের প্যানেল: বড় হাই-রেজ ভিউ (বিদ্যমান pdf.js ইঞ্জিন অক্ষুণ্ণ)
  ④ ডান প্যানেল: পুরোনো সংখ্যা (ক্যালেন্ডার-উইজেট — উপলব্ধ-তারিখ-ডট, আজ-রিং, নির্বাচিত-ফিল) + নিচে পত্রিকা-তালিকা
সংরক্ষিত: pdf.js-ইঞ্জিন, keep-alive, ওয়ার্মার, জুম/ঘোরান/ফুলস্ক্রিন, জেসচার, কীবোর্ড, boot-hook(?file=)
ফুলস্ক্রিন-রুট .ep-viewer → #epGrid280 (পুরো ৩-প্যানেল-ওয়ার্কস্পেস ফুলস্ক্রিনে যায় — বার+রেল+তালিকাসহ)
idempotent: সব রিপ্লেসমেন্ট এঙ্কর-ভিত্তিক; এঙ্কর-অনুপস্থিতিতে SKIP (পুনঃরান-নিরাপদ)।
"""
import re, sys

EJS = 'views/user/epaper.ejs'
CSS = 'public/assets/css/epaper.css'

def fatal(msg):
    print('FATAL:', msg); sys.exit(1)

def replace_once(src, old, new, tag):
    n = src.count(old)
    if n == 0:
        print('SKIP:', tag, '(এঙ্কর-অনুপস্থিত — সম্ভবত পূর্ব-প্রয়োগ)')
        return src
    if n > 1:
        fatal(tag + ' — এঙ্কর-অগুনিত (' + str(n) + ')')
    print('OK:', tag)
    return src.replace(old, new, 1)

# ═══════════════════════════ ১. EJS ═══════════════════════════
src = open(EJS, encoding='utf-8').read()
orig = src

# ── ১.১ সুইচ-স্ট্রিপ ব্লক বিলোপ (hasPayload-ওপেন-লাইন থেকে গ্রিড-ওপেন-পর্যন্ত) ──
STRIP_OLD = """  <% if (hasPayload) { %>
  <%# ── session279 (ইউজার-স্পেক, PressReader-স্থাপত্য): কুইক-সুইচ স্ট্রিপ — কন্ট্রোল-বারের ঠিক উপরে
      জনপ্রিয় পত্রিকাগুলোর স্ক্রলেবল পিল-বাড়ি; এক-ক্লিকেই ড্রপডাউন না-খুলে পত্রিকা বদল।
      পিলগুলো JS নিজেই ভরে (বর্তমান-তারিখের র‍্যাংক-ক্রম) — পেজ-রিলোড শূন্য ── %>
  <div class="ep-switchstrip" id="epSwitchStrip" role="tablist" aria-label="দ্রুত পত্রিকা পরিবর্তন">
    <span class="ep-ss-label"><i class="fas fa-newspaper" aria-hidden="true"></i> শীর্ষ পত্রিকা:</span>
    <div class="ep-ss-pills" id="epSsPills"></div>
    <a href="#epDir226" class="ep-ss-all" id="epSsAll">
      সকল পত্রিকা (<%= (newspapers || []).length %>+) <i class="fas fa-arrow-right" aria-hidden="true"></i>
    </a>
  </div>
"""
src = replace_once(src, STRIP_OLD, "  <% if (hasPayload) { %>\n", '১.১ সুইচ-স্ট্রিপ-বিলোপ')

# ── ১.২ ওয়ার্কস্পেস-পুনর্গঠন: পুরনো ৩-বার+২-প্যানেল → একক-বার+৩-প্যানেল ──
WS_START = '  <%# ═══════════ টু-প্যানেল ওয়ার্কস্পেস ═══════════ %>'
WS_END = '  <% } else { %>'
i0 = src.find(WS_START)
i1 = src.find(WS_END)
if i0 == -1 or i1 == -1 or i1 <= i0:
    if 'epGrid280' in src:
        print('SKIP: ১.২ ওয়ার্কস্পেস-পুনর্গঠন (epGrid280 উপস্থিত)')
    else:
        fatal('১.২ ওয়ার্কস্পেস-এঙ্কর পাওয়া যায়নি')
else:
    WS_NEW = '''  <%# ═══════════ session280 (ইউজার-স্পেক, PressReader ৩-প্যানেল) ═══════════
      একক কন্ট্রোল-বার (রিপিট-শূন্য) + বাম পাতা-রেল + মাঝে বড় ভিউ + ডানে ক্যালেন্ডার ও তালিকা;
      ফুলস্ক্রিন-রুট = এই পুরো গ্রিড (#epGrid280) — বার/রেল/তালিকাসহ পূর্ণ-পাঠ-মোড ── %>
  <div class="ep-grid" id="epGrid280">
    <%# ── ① একক স্লিক কন্ট্রোল-বার: [পত্রিকা-সিলেক্টর ▾] · [বাংলা তারিখ] │ [পাতা X/Y ▾] [জুম] [ঘোরান] [⛶] [মোড] ── %>
    <div class="ep-ctlbar">
      <div class="ep-ctlbar-l">
        <div class="ep-ps-wrap">
          <i class="fas fa-building-columns ep-ps-ico" aria-hidden="true"></i>
          <select class="ep-paper-select" id="epPaperSelect" aria-label="পত্রিকা নির্বাচন"></select>
        </div>
        <span class="ep-ctl-sep" aria-hidden="true">·</span>
        <span class="ep-bardate" id="epBarDate">—</span>
        <input type="date" class="ep-date-input" id="epDateInput" value="<%= todayIso %>" hidden aria-label="নির্বাচিত তারিখ" />
      </div>
      <div class="ep-ctlbar-r">
        <select class="ep-jump" id="epPageJump" hidden disabled aria-label="পাতায় যান"></select>
        <div class="ep-zoomgrp" role="group" aria-label="জুম নিয়ন্ত্রণ">
          <button type="button" class="ep-zbtn" id="epZoomOut" title="জুম আউট" aria-label="জুম আউট"><i class="fas fa-minus" aria-hidden="true"></i></button>
          <button type="button" class="ep-zpct" id="epZoomReset" title="জুম রিসেট" aria-label="জুম রিসেট">১০০%</button>
          <button type="button" class="ep-zbtn" id="epZoomIn" title="জুম ইন" aria-label="জুম ইন"><i class="fas fa-plus" aria-hidden="true"></i></button>
        </div>
        <button type="button" class="ep-ctlbtn" id="epRotate" title="পেজ ঘোরান (৯০°)" aria-label="পেজ ঘোরান"><i class="fas fa-rotate-right" aria-hidden="true"></i></button>
        <button type="button" class="ep-ctlbtn" id="epFs" title="ফুলস্ক্রিন রিডার" aria-label="ফুলস্ক্রিন রিডার"><i class="fas fa-expand" id="epFsIcon" aria-hidden="true"></i></button>
        <div class="ep-vt" role="tablist" aria-label="ভিউ মোড">
          <button type="button" class="ep-vt-btn is-on" id="epModeReader" role="tab" aria-selected="true">ডিজিটাল রিডার</button>
          <button type="button" class="ep-vt-btn" id="epModeThumb" role="tab" aria-selected="false">প্রচ্ছদ</button>
        </div>
      </div>
    </div>
    <%# ── ② বাম প্যানেল: সব পাতার থাম্বনেইল-রেল (pdf.js ছোট-ক্যানভাস অলস-ক্রমিক; পাতায়-ক্লিকে জাম্প) ── %>
    <aside class="ep-rail" aria-label="সব পাতার থাম্বনেইল">
      <div class="ep-rail-head"><i class="fas fa-table-cells" aria-hidden="true"></i> সব পাতা <span class="ep-rail-count" id="epRailCount"></span></div>
      <div class="ep-rail-scroll" id="epRail" role="listbox" aria-label="পাতা নির্বাচন">
        <div class="ep-rail-empty"><i class="fas fa-layer-group" aria-hidden="true"></i><p>পত্রিকা বেছে নিলে পাতাগুলো এখানে দেখা যাবে</p></div>
      </div>
    </aside>
    <%# ── ③ মাঝের প্যানেল: বড় ভিউয়ার (session170-ইঞ্জিন অক্ষুণ্ণ) ── %>
    <section class="ep-viewer" aria-label="ই-পেপার ভিউয়ার">
      <div class="ep-stage" id="epStage">
        <div class="ep-stage-empty">
          <i class="fas fa-newspaper"></i>
          <p>ডান-দিকের তালিকা থেকে একটি পত্রিকা বেছে নিন</p>
        </div>
      </div>
    </section>
    <%# ── ④ ডান প্যানেল: পুরোনো সংখ্যা (ক্যালেন্ডার) + পত্রিকা-তালিকা + ওয়ার্ম-স্ট্যাটাস ── %>
    <aside class="ep-side" aria-label="পুরোনো সংখ্যা ও পত্রিকা তালিকা">
      <div class="ep-cal280" aria-label="পুরোনো সংখ্যার ক্যালেন্ডার">
        <div class="ep-cal-head">
          <span class="ep-cal-title"><i class="fas fa-calendar-days" aria-hidden="true"></i> পুরোনো সংখ্যা</span>
          <span class="ep-cal-nav">
            <button type="button" class="ep-cal-btn" id="epCalPrev" aria-label="আগের মাস"><i class="fas fa-chevron-right" aria-hidden="true"></i></button>
            <span class="ep-cal-month" id="epCalMonth">—</span>
            <button type="button" class="ep-cal-btn" id="epCalNext" aria-label="পরের মাস"><i class="fas fa-chevron-left" aria-hidden="true"></i></button>
          </span>
        </div>
        <div class="ep-cal-grid" id="epCalGrid"></div>
      </div>
      <div class="ep-side-head">
        <div class="ep-filter-top">
          <span class="ep-filter-title"><i class="fas fa-layer-group"></i> <span id="epListLbl">আজকের পত্রিকা</span></span>
          <span class="ep-count" id="epCount">০</span>
        </div>
        <div class="ep-search">
          <i class="fas fa-magnifying-glass" aria-hidden="true"></i>
          <input type="search" id="epSearch" placeholder="পত্রিকা খুঁজুন…" aria-label="পত্রিকার নামে খুঁজুন" autocomplete="off" />
          <button type="button" class="ep-search-clear" id="epSearchClear" aria-label="খোঁজা মুছুন" hidden><i class="fas fa-xmark" aria-hidden="true"></i></button>
        </div>
      </div>
      <%# ── পত্রিকা-তালিকা (নির্বাচিত তারিখের) ── %>
      <div class="ep-list" id="epList" role="listbox" aria-label="পত্রিকার তালিকা"></div>
      <%# ── session182: সিকুয়েন্সিয়াল-আইডল-ওয়ার্মার স্ট্যাটাস ── %>
      <div class="ep-warmbar" id="epWarmBar" hidden aria-live="polite">
        <i class="fas fa-bolt" aria-hidden="true"></i>
        <div class="ep-warmbar-main">
          <span class="ep-warmbar-txt" id="epWarmTxt">বাকি পত্রিকাগুলোও আগে থেকেই প্রস্তুত হচ্ছে…</span>
          <span class="ep-warmbar-track" aria-hidden="true"><i id="epWarmFill"></i></span>
        </div>
      </div>
    </aside>
  </div>
'''
    src = src[:i0] + WS_NEW + src[i1:]
    print('OK: ১.২ ওয়ার্কস্পেস-পুনর্গঠন')

# ── ১.৩ JS: ভেরি-এবল-হেডার (elName/elCurRank/elCurDate বিলোপ; elGrid/elRail/elBarDate সংযোজন) ──
OLD_VARS = """  var elStage = document.getElementById('epStage');
  var elName = document.getElementById('epCurName');
  var elCurDate = document.getElementById('epCurDate');
  var elReader = document.getElementById('epModeReader');
  var elThumb = document.getElementById('epModeThumb');
  var elCurRank = document.getElementById('epCurRank'); // সেশন ১৭২: ভিউয়ার-বার র‍্যাংক-চিপ
"""
NEW_VARS = """  var elStage = document.getElementById('epStage');
  var elReader = document.getElementById('epModeReader');
  var elThumb = document.getElementById('epModeThumb');
  // session280: ফুলস্ক্রিন-রুট = পূর্ণ ৩-প্যানেল গ্রিড; বার-তারিখ + পাতা-রেল + ক্যালেন্ডার-মডিউল-টার্গেট
  var elGrid = document.getElementById('epGrid280');
  var elBarDate = document.getElementById('epBarDate');
  var elListLbl = document.getElementById('epListLbl');
  var elRail = document.getElementById('epRail');
  var elRailCount = document.getElementById('epRailCount');
"""
src = replace_once(src, OLD_VARS, NEW_VARS, '১.৩ ভেরি-এবল-হেডার')

# ── ১.৪ elViewer → elGrid (ফুলস্ক্রিন-রুট) ──
src = replace_once(src, "  var elViewer = document.querySelector('.ep-viewer');\n", '', '১.৪a পুরনো-elViewer-বিলোপ')
src = replace_once(src, """  function toggleFs() {
    if (!elViewer) return;
    var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    if (!fsEl) {
      var req = elViewer.requestFullscreen || elViewer.webkitRequestFullscreen;
      if (req) req.call(elViewer);
""", """  function toggleFs() {
    if (!elGrid) return;
    var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    if (!fsEl) {
      var req = elGrid.requestFullscreen || elGrid.webkitRequestFullscreen;
      if (req) req.call(elGrid);
""", '১.৪b toggleFs→elGrid')
src = replace_once(src, """      if (elViewer) elViewer.classList.toggle('is-fs', fs);
""", """      if (elGrid) elGrid.classList.toggle('is-fs', fs);
""", '১.৪c fullscreenchange→elGrid')

# ── ১.৫ renderList: syncStrip-বিলোপ + calSync/listLbl-সংযোজন ──
src = replace_once(src, """  function renderList() {
    var rows = filtered();
    syncStrip(); // session279: কুইক-সুইচ স্ট্রিপ তারিখ-অনুযায়ী পুনর্নির্মাণ (active সিঙ্কসহ)
    elCount.textContent = bnDigits(rows.length) + ' টি';
""", """  function renderList() {
    var rows = filtered();
    elCount.textContent = bnDigits(rows.length) + ' টি';
    calSync(); // session280: ক্যালেন্ডারে নির্বাচিত-দিন-সিঙ্ক
    if (elListLbl) elListLbl.textContent = (elDate.value === todayIso ? 'আজকের পত্রিকা' : bnShort279(elDate.value) + '-এর পত্রিকা');
    syncBarDate(); // session280: বারের বাংলা-তারিখ
""", '১.৫ renderList-হেড')

# ── ১.৬ select(): নাম/র‍্যাংক/তারিখ-ভিউয়ার-বার-লাইন বিলোপ, নতুন-সিঙ্ক ──
OLD_SELECT = """  function select(id) {
    activeId = id;
    var p = papers.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    elName.textContent = p.name;
    // সেশন ১৭২: ভিউয়ার-বারে সক্রিয় পত্রিকার র‍্যাংক-চিপ
    if (elCurRank) {
      if (p.rank && p.rank < 999) { elCurRank.hidden = false; elCurRank.textContent = '#' + bnDigits(p.rank); }
      else { elCurRank.hidden = true; elCurRank.textContent = ''; }
    }
    elCurDate.textContent = '· ' + p.dateBn;
    syncPaperSelect(p); syncIssueSelect(p); syncStripActive(); // session279: প্রেসরিডার-কন্ট্রোল সিঙ্ক
    renderStage(p); // session183: জুম পেপার-সুইচেও ধরে থাকে — ধারাবাহিক পাঠ-অভিজ্ঞতা
    renderList();
  }
"""
NEW_SELECT = """  function select(id) {
    activeId = id;
    var p = papers.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    // session280: নাম = বারের সিলেক্টর-নিজেই, তারিখ = বারের টেক্সট — পুনরাবৃত্তি-শূন্য
    syncPaperSelect(p);
    renderStage(p); // session183: জুম পেপার-সুইচেও ধরে থাকে — ধারাবাহিক পাঠ-অভিজ্ঞতা
    renderList();
  }
"""
src = replace_once(src, OLD_SELECT, NEW_SELECT, '১.৬ select()-সংকোচন')

# ── ১.৭ armPageJump: buildPager→railBuild, syncPager→syncRail; resetPageJump: hidePager→railReset ──
src = replace_once(src, "    buildPager(numPages); // session279: সংখ্যাযুক্ত পেজিনেশন + কাউন্টার সক্রিয়\n", "    railBuild(st, numPages); // session280: বাম-রেল নির্মাণ (থাম্বনেইল অলস-ক্রমিক)\n", '১.৭a armPageJump→railBuild')
src = replace_once(src, "      if (String(sel.value) !== String(best)) sel.value = String(best);\n      syncPager(best); // session279: পেজিনেশন বাটন/কাউন্টারও স্ক্রলে সিঙ্ক\n", "      if (String(sel.value) !== String(best)) sel.value = String(best);\n      syncRail(best); // session280: রেলে সক্রিয়-পাতা-সিঙ্ক\n", '১.৭b jumpSync→syncRail')
src = replace_once(src, "    sel.hidden = true; sel.disabled = true; sel.innerHTML = ''; sel._pages = 0;\n    hidePager(); // session279: পেজিনেশন/সব-পাতা-গ্রিডও রিসেট (iframe-ফলব্যাক/প্রচ্ছদ-মোডে অদৃশ্য)\n", "    sel.hidden = true; sel.disabled = true; sel.innerHTML = ''; sel._pages = 0;\n    railReset(); // session280: রেল-রিসেট (iframe-ফলব্যাক/প্রচ্ছদ-মোডে খালি-অবস্থা)\n", '১.৭c resetPageJump→railReset')

# ── ১.৮ openReader cached-alive: setGrid-বিলোপ ──
src = replace_once(src, "      w.scrollTop = sc.t; w.scrollLeft = sc.l;\n      setGrid(false); // session279: পেপার-সুইচে গ্রিড-মোড রিসেট (নতুন-র‍্যাপে ক্লাস নেই)\n", "      w.scrollTop = sc.t; w.scrollLeft = sc.l;\n", '১.৮ cached-alive setGrid-বিলোপ')

# ── ১.৯ renderStage thumb-mode: railReset ──
src = replace_once(src, """      stowActiveScroll(); // রিডারের-স্ক্রল মনে রাখুন — ফেরত-এলে সেখানেই
      resetPageJump();
    }
""", """      stowActiveScroll(); // রিডারের-স্ক্রল মনে রাখুন — ফেরত-এলে সেখানেই
      resetPageJump();
      railReset(); // session280: প্রচ্ছদ-মোডে রেল খালি (স্টেল-থাম্ব-শূন্য)
    }
""", '১.৯ renderStage-রেল-রিসেট')

# ── ১.১০ iframe-ফলব্যাক-বার্তা: বাঁ→ডান ──
src = replace_once(src, "      elStage.innerHTML = '<div class=\"ep-stage-empty\"><i class=\"fas fa-newspaper\"></i><p>রিডার পাওয়া যায়নি — বাঁ-দিকের তালিকা থেকে অন্য সংখ্যা বেছে নিন</p></div>';\n", "      elStage.innerHTML = '<div class=\"ep-stage-empty\"><i class=\"fas fa-newspaper\"></i><p>রিডার পাওয়া যায়নি — ডান-দিকের তালিকা থেকে অন্য সংখ্যা বেছে নিন</p></div>';\n", '১.১০ iframe-বার্তা')

# ── ১.১১ stepDay/দিন-বাটন বিলোপ (ক্যালেন্ডার দায়িত্ব নেয়) ──
OLD_STEP = """  // আগের/পরের দিন — শুধু পত্রিকা-আছে-এমন দিনে লাফায়
  document.getElementById('epPrevDay').addEventListener('click', function () { stepDay(1); });
  document.getElementById('epNextDay').addEventListener('click', function () { stepDay(-1); });
  function stepDay(dir) {
    var cur = elDate.value;
    var idx = dates.indexOf(cur);
    if (idx < 0) { // বর্তমান-নির্বাচন তালিকায় নেই — দিক-অনুযায়ী নিকটতম
      idx = dir > 0 ? dates.findIndex(function (d) { return d < cur; }) : dates.findIndex(function (d) { return d <= cur; });
      if (idx < 0) idx = 0;
    }
    var nx = idx + dir;
    if (nx < 0 || nx >= dates.length) return;
    elDate.value = dates[nx];
    renderList();
    queueWarm();
  }

"""
src = replace_once(src, OLD_STEP, '', '১.১১ stepDay-বিলোপ')

# ── ১.১১b epTodayBtn-লিসেনার বিলোপ (বাটন-বিলুপ্ত; 'আজ'-ফেরা = ক্যালেন্ডারে আজ-ক্লিক) ──
src = replace_once(src, """  document.getElementById('epTodayBtn').addEventListener('click', function () {
    elDate.value = todayIso; renderList(); queueWarm();
  });
""", '', '১.১১b epTodayBtn-লিসেনার-বিলোপ')

# ── ১.১২ session279-মডিউল-হেডারে pager-ভের-বিলোপ ──
OLD_MOD = """  var elPaperSel = document.getElementById('epPaperSelect');
  var elIssueSel = document.getElementById('epIssueSelect');
  var pagerWrap = document.getElementById('epPagePager');
  var pagerNums = document.getElementById('epPgNums');
  var pagerCount = document.getElementById('epPgCount');
  var elAllPagesBtn = document.getElementById('epAllPagesBtn');
  var pagerTotal = 0, pagerCur = 1, gridOn = false;
"""
NEW_MOD = """  var elPaperSel = document.getElementById('epPaperSelect');
"""
src = replace_once(src, OLD_MOD, NEW_MOD, '১.১২ মডিউল-ভের-বিলোপ')

# ── ১.১৩ সংখ্যা-সিলেক্টর ব্লক বিলোপ (ক্যালেন্ডার-প্রতিস্থাপিত) ──
i0 = src.find("  /* ── ২. সংখ্যা-সিলেক্টর: একই পত্রিকার সব সংরক্ষিত তারিখ ── */")
i1 = src.find("  /* ── ৩. সংখ্যাযুক্ত পেজিনেশন")
if i0 == -1 and 'syncIssueSelect' not in src:
    print('SKIP: ১.১৩ সংখ্যা-সিলেক্টর-বিলোপ (পূর্ব-প্রয়োগ)')
elif i0 == -1 or i1 == -1 or i1 <= i0:
    fatal('১.১৩ সংখ্যা-সিলেক্টর-এঙ্কর')
else:
    src = src[:i0] + src[i1:]
    print('OK: ১.১৩ সংখ্যা-সিলেক্টর-বিলোপ')

# ── ১.১৪ পেজিনেশন+গ্রিড+স্ট্রিপ মডিউল বিলোপ, gotoPage রক্ষণাবেক্ষণ, নতুন-মডিউল স্থাপন ──
i0 = src.find("  /* ── ৩. সংখ্যাযুক্ত পেজিনেশন (pdf.js-ডকের numPages-এ) ── */")
i1 = src.find("  buildPaperSelect(); // বুটে-একবার")
if i0 == -1 and 'syncStrip' not in src and 'epRailQ' in src:
    print('SKIP: ১.১৪ পেজার/গ্রিড/স্ট্রিপ-বিলোপ (পূর্ব-প্রয়োগ)')
elif i0 == -1 or i1 == -1 or i1 <= i0:
    fatal('১.১৪ পেজার-ব্লক-এঙ্কর')
else:
    NEW_MODULES = '''  /* ═══════════ session280 (ইউজার-স্পেক): ৩-প্যানেল PressReader-মডিউল ═══════════
     ১) পাতা-পাজাম্প রক্ষী: gotoPage — রেল-ক্লিক/ড্রপডাউন উভয়-পথে
     ২) বাম পাতা-রেল: pdf.js ছোট-ক্যানভাস অলস-ক্রমিক রেন্ডার (টোকেন-গার্ড, সুইচে-বাতিল)
     ৩) ডান ক্যালেন্ডার: উপলব্ধ-তারিখ-ডট + আজ-রিং + নির্বাচিত-ফিল; মাস-নেভিগেশন
     ৪) বার-তারিখ-টেক্সট: বাংলা-বার-সহ পূর্ণ-তারিখ (নির্বাচিত দিনের সাথে সিঙ্ক) ═══════════ */
  function gotoPage(n) {
    var h = elStage.querySelector('.ep-page-holder[data-n="' + n + '"]'); if (!h) return;
    h.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── ২. বাম পাতা-রেল ── */
  var railTok = 0, railLastCur = 0;
  function railReset() {
    railTok++;
    railLastCur = 0;
    if (!elRail) return;
    elRail.innerHTML = '<div class="ep-rail-empty"><i class="fas fa-layer-group" aria-hidden="true"></i><p>ডিজিটাল রিডারে পত্রিকা খুললে সব পাতা এখানে দেখা যাবে</p></div>';
    if (elRailCount) elRailCount.textContent = '';
  }
  function railBuild(st, numPages) {
    if (!elRail) return;
    railTok++;
    var tok = railTok;
    railLastCur = 0;
    if (!st || !st.doc || !numPages) { railReset(); return; }
    if (elRailCount) elRailCount.textContent = bnDigits(numPages);
    var frag = document.createDocumentFragment();
    var items = [];
    for (var n = 1; n <= numPages; n++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ep-rail-item' + (n === 1 ? ' is-on' : '');
      b.setAttribute('role', 'option');
      b.setAttribute('data-n', n);
      b.setAttribute('aria-label', n === 1 ? 'প্রথম পাতা' : 'পাতা ' + bnDigits(n));
      b.innerHTML = '<span class="ep-rail-thumb is-pending" aria-hidden="true"></span>' +
        '<span class="ep-rail-cap">' + (n === 1 ? 'প্রথম পাতা' : 'পাতা ' + bnDigits(n)) + '</span>';
      frag.appendChild(b);
      items.push(b);
    }
    elRail.innerHTML = '';
    elRail.appendChild(frag);
    // অলস-ক্রমিক থাম্বনেইল-রেন্ডার — ছোট-ক্যানভাস (২×-শার্পনেস, মেমরি-সামান্য), পেপার-সুইচে টোকেন-বাতিল
    var TW = 176; // ব্যাকিং-প্রস্থ (≈৯২px CSS × ২ — রেটিনা-শার্প)
    var idx = 0;
    var step = function () {
      if (tok !== railTok) return; // সুইচ-হয়েছে — বাতিল
      if (idx >= items.length) return;
      var n = idx + 1;
      idx++;
      var done = function () { setTimeout(step, 40); }; // CPU-শ্বাস-বিরতি — মূল-রেন্ডারের-সাথে-প্রতিযোগিতা-শূন্য
      st.doc.getPage(n).then(function (page) {
        if (tok !== railTok) return;
        var base = page.getViewport({ scale: 1 });
        var scale = Math.min(TW / base.width, 2.5);
        var vp = page.getViewport({ scale: scale });
        var cv = document.createElement('canvas');
        cv.width = Math.floor(vp.width); cv.height = Math.floor(vp.height);
        var host = items[n - 1].querySelector('.ep-rail-thumb');
        if (!host) return done();
        host.classList.remove('is-pending');
        host.innerHTML = '';
        host.appendChild(cv);
        return page.render({ canvasContext: cv.getContext('2d', { alpha: false }), viewport: vp, background: '#ffffff' }).promise;
      }).then(function () { if (tok === railTok) done(); }).catch(function () { if (tok === railTok) done(); });
    };
    step();
  }
  function syncRail(cur) {
    if (!elRail || !cur || cur === railLastCur) return;
    railLastCur = cur;
    elRail.querySelectorAll('.ep-rail-item').forEach(function (b) {
      var on = Number(b.getAttribute('data-n')) === cur;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    var on = elRail.querySelector('.ep-rail-item.is-on');
    if (on && on.scrollIntoView) {
      try { on.scrollIntoView({ block: 'nearest' }); } catch (e) {}
    }
  }
  if (elRail) elRail.addEventListener('click', function (e) {
    var b = e.target.closest('.ep-rail-item'); if (!b) return;
    gotoPage(Number(b.getAttribute('data-n')) || 1);
  });

  /* ── ৩. ডান ক্যালেন্ডার (পুরোনো সংখ্যা) ── */
  var elCalMonth = document.getElementById('epCalMonth');
  var elCalGrid = document.getElementById('epCalGrid');
  var calY = 0, calM = 0; // 0-ভিত্তিক মাস
  var calWds = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
  function calIso(y, m, d) {
    return y + '-' + ('0' + (m + 1)).slice(-2) + '-' + ('0' + d).slice(-2);
  }
  function calRender() {
    if (!elCalGrid || !elCalMonth) return;
    elCalMonth.textContent = bnMonths279[calM] + ' ' + bnDigits(calY);
    var first = new Date(calY, calM, 1);
    var blanks = first.getDay();
    var days = new Date(calY, calM + 1, 0).getDate();
    var frag = '<span class="ep-cal-wd">' + calWds.join('</span><span class="ep-cal-wd">') + '</span>';
    for (var b = 0; b < blanks; b++) frag += '<span class="ep-cal-off" aria-hidden="true"></span>';
    for (var d = 1; d <= days; d++) {
      var iso = calIso(calY, calM, d);
      var cls = 'ep-cal-day';
      var has = !!byDate[iso];
      var future = iso > todayIso;
      if (has) cls += ' has';
      if (iso === todayIso) cls += ' is-today';
      if (iso === elDate.value) cls += ' is-sel';
      frag += '<button type="button" class="' + cls + '" data-d="' + iso + '"' + (future ? ' disabled' : '') +
        (has ? ' title="' + bnShort279(iso) + ' — সংরক্ষিত সংখ্যা আছে"' : '') + '>' + bnDigits(d) + '</button>';
    }
    elCalGrid.innerHTML = frag;
  }
  function calSync() {
    if (!elCalGrid) return;
    var cur = elDate.value;
    elCalGrid.querySelectorAll('.ep-cal-day').forEach(function (b) {
      b.classList.toggle('is-sel', b.getAttribute('data-d') === cur);
    });
  }
  function calJump(iso) {
    elDate.value = iso;
    renderList();
    queueWarm();
    // নির্বাচিত দিনের মাসে ক্যালেন্ডার-দৃশ্য মানানসই
    var m = /^(\\d{4})-(\\d{2})/.exec(String(iso || ''));
    if (m) { calY = +m[1]; calM = +m[2] - 1; calRender(); }
  }
  if (elCalGrid) elCalGrid.addEventListener('click', function (e) {
    var b = e.target.closest('.ep-cal-day'); if (!b || b.disabled) return;
    calJump(b.getAttribute('data-d'));
  });
  var elCalPrev = document.getElementById('epCalPrev'), elCalNext = document.getElementById('epCalNext');
  if (elCalPrev) elCalPrev.addEventListener('click', function () { calM++; if (calM > 11) { calM = 0; calY++; } calRender(); });
  if (elCalNext) elCalNext.addEventListener('click', function () { calM--; if (calM < 0) { calM = 11; calY--; } calRender(); });

  /* ── ৪. বার-তারিখ-টেক্সট (বার-সহ পূর্ণ বাংলা তারিখ) ── */
  var bnDayFmt280 = null;
  try { bnDayFmt280 = new Intl.DateTimeFormat('bn-BD', { timeZone: 'Asia/Dhaka', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { bnDayFmt280 = null; }
  function syncBarDate() {
    if (!elBarDate) return;
    var d = elDate.value;
    if (!d) { elBarDate.textContent = '—'; return; }
    try {
      elBarDate.textContent = bnDayFmt280 ? bnDayFmt280.format(new Date(d + 'T00:00:00+06:00')) : bnShort279(d);
    } catch (e) { elBarDate.textContent = bnShort279(d); }
  }

'''
    src = src[:i0] + NEW_MODULES + src[i1:]
    print('OK: ১.১৪ পেজার-বিলোপ + নতুন-মডিউল')

# ── ১.১৫ বুট-টেইল: ক্যালেন্ডার-ইনিট ──
src = replace_once(src, """  elDate.value = bootDate;
  var bootRows = (byDate[bootDate] || []).slice().sort(rankCmp);
  if (bootPaper) { select(bootPaper.id); }
  else if (bootRows.length) { select(bootRows[0].id); }
""", """  elDate.value = bootDate;
  var bootRows = (byDate[bootDate] || []).slice().sort(rankCmp);
  if (bootPaper) { select(bootPaper.id); }
  else if (bootRows.length) { select(bootRows[0].id); }
  // session280: ক্যালেন্ডার-বুট (নির্বাচিত দিনের মাসে; বার-তারিখ renderList-চেইনেই সিঙ্ক)
  var _bm = /^(\\d{4})-(\\d{2})/.exec(String(bootDate || ''));
  if (_bm) { calY = +_bm[1]; calM = +_bm[2] - 1; }
  else { var _n = new Date(); calY = _n.getFullYear(); calM = _n.getMonth(); }
  calRender();
""", '১.১৫ বুট-ক্যালেন্ডার-ইনিট')

if src != orig:
    open(EJS, 'w', encoding='utf-8').write(src)
    print('EJS লেখা হয়েছে ✓ (Δ', len(orig) - len(src), 'বাইট)')
else:
    print('EJS অপরিবর্তিত')

# ═══════════════════════════ ২. অবশিষ্ট-রেফারেন্স-পরিষ্কার যাচাই ═══════════════════════════
leftovers = [w for w in ['syncStrip', 'syncStripActive', 'syncIssueSelect', 'buildPager', 'syncPager',
                          'renderPagerNums', 'pagerWrap', 'pagerNums', 'elAllPagesBtn', 'setGrid', 'gridOn',
                          'stepDay', 'epPrevDay', 'epNextDay', 'epTodayBtn', 'epCurName', 'elCurRank',
                          'elCurDate', 'epSwitchStrip', 'epPagePager', 'epAllPagesBtn', 'epIssueSelect'] if w in src]
if leftovers:
    fatal('অবশিষ্ট-রেফারেন্স: ' + ', '.join(leftovers))
print('EJS রেফারেন্স-পরিষ্কার ✓ (পুরনো-মডিউল-অবশেষ-শূন্য)')
print('সম্পন্ন — CSS-ধাপ আলাদা স্ক্রিপ্টে')
