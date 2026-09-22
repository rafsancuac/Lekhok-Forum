/* session67r2: LekhokAuthed — reliable login guard (theme-agnostic). Old guard
   ".topbar-tabs a[href=/settings]" only exists on member-header pages, so on
   public layout (e.g. /articles) logged-in users got bounced to /login -> /dashboard
   when clicking save/react/share/follow. body[data-auth] (set server-side in both
   layouts) is now the primary source; old selector kept as fallback. */
window.LekhokAuthed=function(){return document.body&&"1"===document.body.getAttribute("data-auth")||!!document.querySelector('.topbar-tabs a[href="/settings"]')};
function openMenu(){const e=document.getElementById("mobileSidebar"),t=document.getElementById("mobileOverlay");e&&(e.classList.add("open"),e.setAttribute("aria-hidden","false")),t&&t.classList.add("show"),document.body.style.overflow="hidden"}function closeMenu(){const e=document.getElementById("mobileSidebar"),t=document.getElementById("mobileOverlay");e&&(e.classList.remove("open"),e.setAttribute("aria-hidden","true")),t&&t.classList.remove("show"),document.body.style.overflow=""}function toggleMega(e){e&&e.stopPropagation();const t=document.getElementById("megaMenu");t&&t.classList.toggle("open")}function closeMega(){const e=document.getElementById("megaMenu");e&&e.classList.remove("open")}function clearNotifBadge(){const e=document.getElementById("notifBadge");e&&(e.remove(),document.querySelectorAll("#notifList .notif-item.unread").forEach(e=>e.classList.remove("unread")),document.querySelectorAll("#notifList .notif-dot").forEach(e=>e.remove()),fetch("/api/notifications/read",{method:"POST"}).catch(function(){}))}function toggleNotifs(){const e=document.getElementById("notifDropdown"),t=document.getElementById("userDropdown");if(t&&t.classList.remove("open"),e){const t=!e.classList.contains("open");e.classList.toggle("open"),t&&clearNotifBadge()}}function toggleUserMenu(){const e=document.getElementById("userDropdown"),t=document.getElementById("notifDropdown");t&&t.classList.remove("open"),e&&e.classList.toggle("open")}function showToast(e,t){t=t||"";const n=document.createElement("div");n.className="toast "+t,n.textContent=e,document.body.appendChild(n),setTimeout(()=>n.classList.add("show"),10),setTimeout(()=>{n.classList.remove("show"),setTimeout(()=>n.remove(),350)},2400)}!function(){const e=document.getElementById("menuToggle"),t=document.getElementById("mobileSidebar"),n=document.getElementById("mobileOverlay"),o=document.getElementById("closeSidebar");function s(){t.classList.remove("open"),n.classList.remove("show"),t.setAttribute("aria-hidden","true")}e&&e.addEventListener("click",function(){t.classList.add("open"),n.classList.add("show"),t.setAttribute("aria-hidden","false")}),o&&o.addEventListener("click",s),n&&n.addEventListener("click",s);const a=document.getElementById("newsletterForm");if(a){const e=document.getElementById("newsletterMsg");a.addEventListener("submit",async function t(n){n.preventDefault();const o=a.querySelector('input[name="email"]'),s=a.querySelector("button"),r=(o&&o.value||"").trim();if(r){e&&(e.className="f-newsletter-msg show",e.textContent="অপেক্ষা করুন…"),s&&(s.disabled=!0);try{const t=await fetch(a.getAttribute("action"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:r})}),n=await t.json().catch(()=>({}));t.ok&&n.ok?(e&&(e.className="f-newsletter-msg show ok",e.textContent=n.message||"সাবস্ক্রিপশন সফল!"),o&&(o.value="")):e&&(e.className="f-newsletter-msg show err",e.textContent=n.message||"সাবস্ক্রিপশন ব্যর্থ — আবার চেষ্টা করুন।")}catch(e){return a.removeEventListener("submit",t),void a.submit()}finally{s&&(s.disabled=!1)}}})}const r=["০","১","২","৩","৪","৫","৬","৭","৮","৯"];function i(e){return String(e).replace(/[0-9]/g,e=>r[e])}function c(e){const t=parseInt(e.getAttribute("data-count"),10)||0,n=performance.now();requestAnimationFrame(function o(s){const a=Math.min(1,(s-n)/1600),r=1-Math.pow(1-a,3),c=Math.floor(t*r);e.textContent=i(c.toLocaleString("en-US")),a<1?requestAnimationFrame(o):e.textContent=i(t.toLocaleString("en-US"))})}if("IntersectionObserver"in window){const e=new IntersectionObserver(t=>{t.forEach(t=>{t.isIntersecting&&(c(t.target),e.unobserve(t.target))})},{threshold:.4});document.querySelectorAll(".stat-num").forEach(t=>e.observe(t))}else document.querySelectorAll(".stat-num").forEach(c);const l=["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];function _pTs131(s){s=String(s==null?"":s).trim();if(!s)return NaN;if(/^\d{4}-\d{2}-\d{2}$/.test(s))return new Date(s+"T00:00:00Z").getTime();if(/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(?:\.\d+)?)?$/.test(s))return new Date(s.replace(" ","T")+"Z").getTime();const d=new Date(s);return d.getTime()}function _dTs131(s){const t=_pTs131(s);if(isNaN(t))return String(s||"");try{return new Date(t).toLocaleString("bn-BD",{timeZone:"Asia/Dhaka"})}catch(e){const r=new Date(t+216e5);return r.getUTCDate()+" "+["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"][r.getUTCMonth()]+", "+r.getUTCFullYear()+" "+String(r.getUTCHours()).padStart(2,"0")+":"+String(r.getUTCMinutes()).padStart(2,"0")}}function d(e){(e||document).querySelectorAll("[data-ts]").forEach(e=>{const t=function(e){const t=_pTs131(e);if(isNaN(t))return null;const n=Date.now()-t,o=Math.floor(n/6e4);if(o<1)return"এইমাত্র";if(o<60)return i(o)+" মিনিট আগে";const s=Math.floor(o/60);if(s<24)return i(s)+" ঘণ্টা আগে";const a=Math.floor(s/24);if(1===a)return"গতকাল";if(a<7)return i(a)+" দিন আগে";const r=new Date(t+216e5);return i(r.getUTCDate())+" "+l[r.getUTCMonth()]+", "+i(r.getUTCFullYear())}(e.dataset.ts);if(t){const n=e.querySelector("i");e.textContent="",n&&e.appendChild(n),e.appendChild(document.createTextNode(" "+t)),e.setAttribute("title",_dTs131(e.dataset.ts))}})}window.LekhokRelTime={render:d},document.addEventListener("DOMContentLoaded",()=>d());const u=document.querySelector(".btclf-topbar")||document.getElementById("mainHeader")||document.getElementById("topbar");if(!document.getElementById("scrollProgress")){const e=document.createElement("div");e.className="scroll-progress",e.id="scrollProgress",document.body.firstChild?document.body.insertBefore(e,document.body.firstChild):document.body.appendChild(e)}const m=document.getElementById("scrollProgress"),g=document.querySelector(".hero.brand-hero");let h=0,p=!1;function v(){const e=window.scrollY||window.pageYOffset,t=Math.max(1,document.body.scrollHeight-window.innerHeight);if(u&&u.classList.toggle("shrunk",e>50),m&&(m.style.width=Math.min(100,e/t*100)+"%"),g){const t=g.getBoundingClientRect();t.bottom>0&&t.top<window.innerHeight&&(g.style.transform="translate3d(0, "+.3*e+"px, 0)")}h=e,p=!1;/* সেশন-৮৭ reveal-jump-fix: instant-jump (End/অ্যাঙ্কর) করলে উপরে-পার হয়ে-যাওয়া সেকশন IO-state বদলায় না → callback আসে না → চিরকাল opacity:0। তাই প্রতি স্ক্রল-ফ্রেমে অনাবৃত .reveal থেকে ভিউপোর্ট-উপরে-ওয়ালা সরাসরি আনভেইল */for(var q=document.querySelectorAll(".reveal:not(.in),.reveal-stagger:not(.in)"),z=0;z<q.length;z++){var rc=q[z].getBoundingClientRect();rc.bottom<0&&q[z].classList.add("in")}}if(window.addEventListener("scroll",function(){p||(requestAnimationFrame(v),p=!0)},{passive:!0}),"IntersectionObserver"in window){const e=new IntersectionObserver(function(t){t.forEach(function(t){(t.isIntersecting||t.boundingClientRect.top<0)&&(t.target.classList.add("in"),e.unobserve(t.target))})},{threshold:0,rootMargin:"0px 0px -60px 0px"});document.querySelectorAll(".reveal, .reveal-stagger").forEach(function(t){e.observe(t)})}else document.querySelectorAll(".reveal, .reveal-stagger").forEach(function(e){e.classList.add("in")});v()}(),window.openMenu=openMenu,window.closeMenu=closeMenu,document.addEventListener("DOMContentLoaded",function(){const e=document.getElementById("menuToggle"),t=document.getElementById("closeSidebar"),n=document.getElementById("mobileOverlay");e&&e.addEventListener("click",openMenu),t&&t.addEventListener("click",closeMenu),n&&n.addEventListener("click",closeMenu),document.addEventListener("keydown",function(e){"Escape"===e.key&&(closeMenu(),closeMega())});const o=document.getElementById("topbar");o&&window.addEventListener("scroll",function(){o.classList.toggle("scrolled",window.scrollY>8)},{passive:!0})}),window.toggleMega=toggleMega,window.closeMega=closeMega,window.toggleNotifs=toggleNotifs,window.toggleUserMenu=toggleUserMenu,document.addEventListener("click",function(e){const t=document.getElementById("megaWrap");t&&!t.contains(e.target)&&closeMega();const n=document.querySelector(".notif-bell-wrap");if(n&&!n.contains(e.target)){const e=document.getElementById("notifDropdown");e&&e.classList.remove("open")}const o=document.querySelector(".user-menu-wrap");if(o&&!o.contains(e.target)){const e=document.getElementById("userDropdown");e&&e.classList.remove("open")}}),window.showToast=showToast,function(){void 0;const e={like:{emoji:"👍",label:"লাইক"},love:{emoji:"❤️",label:"ভালোবাসা"},care:{emoji:"🤗",label:"কেয়ার"},haha:{emoji:"😂",label:"হাহা"},wow:{emoji:"😮",label:"বিস্ময়"},sad:{emoji:"😢",label:"দুঃখ"},angry:{emoji:"😡",label:"রাগ"}};function t(){return window.LekhokAuthed()}async function n(t,n){const o=t.dataset.targetId,s=t.dataset.targetType,a=await fetch("/api/react",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({target_id:o,target_type:s,reaction_type:n})});if(!a.ok)return 401===a.status?void(location.href="/login?next="+encodeURIComponent(location.pathname)):void showToast("প্রতিক্রিয়া জানানো যায়নি","error");const r=await a.json();!function(t,n,o,s){const a=t.querySelector(".main-react"),r=t.querySelector(".rb-emoji"),i=t.querySelector(".rb-label");s?(a.classList.add("active"),a.dataset.mine=s,r.textContent=e[s].emoji,i.textContent=e[s].label):(a.classList.remove("active"),a.dataset.mine="",r.textContent="👍",i.textContent="লাইক");t.querySelectorAll(".reaction-opt").forEach(e=>{e.classList.toggle("selected",e.dataset.reaction===s)});const c=t.parentElement.querySelector(".reaction-summary");if(c){const t=Object.entries(n).filter(e=>e[1]>0).sort((e,t)=>t[1]-e[1]).slice(0,3).map(t=>e[t[0]]?e[t[0]].emoji:"");c.querySelector(".rs-emojis").innerHTML=t.map(m=>'<span>'+m+'</span>').join(""),c.querySelector(".rs-count").textContent=o>0?window.toBnNumber(o):"";/* সেশন ১৪৭: কাউন্টার-ভাষা-চুক্তি — বাংলা-অঙ্ক (window.toBnNumber, layout.ejs-মিরর); আগে কাঁচা ইংরেজি যেত */try{c.dispatchEvent(new CustomEvent("lf:reactupdate",{bubbles:!0,detail:{reactions:n,total:o,mine:s}}))}catch(_){}}}(t,r.reactions||{},r.total,r.mine)}function o(e){const o=e.querySelector(".react-wrap");if(!o||o.dataset.initialized)return;o.dataset.initialized="1";const s=o.querySelector(".main-react"),a=o.querySelector(".reaction-picker");let r=null,i=!1,c=null;function l(){if(a.classList.add("open"),navigator.vibrate)try{navigator.vibrate(15)}catch(e){}}function d(){a.classList.remove("open")}function u(){c&&(c.classList.remove("preview"),c=null)}function m(e){e!==c&&(u(),e&&(e.classList.add("preview"),c=e))}function f(){i=!1,clearTimeout(r),r=setTimeout(()=>{l(),i=!0},350)}function g(){clearTimeout(r)}function h(e){if(!t())return location.href="/login?next="+encodeURIComponent(location.pathname);n(o,e),d()}window.matchMedia("(hover: hover)").matches&&(o.addEventListener("mouseenter",l),o.addEventListener("mouseleave",d));let p=!1;function v(e){if(e.target&&e.target.closest){const t=e.target.closest(".reaction-opt");if(t)return t}const t=document.elementFromPoint(e.clientX,e.clientY);return t&&t.closest?t.closest(".reaction-opt"):null}s.addEventListener("mousedown",f),o.addEventListener("mousemove",e=>{i&&m(v(e))}),document.addEventListener("mouseup",e=>{if(!i)return;g(),i=!1,p=!0,setTimeout(()=>{p=!1},0);const t=v(e);t?(u(),h(t.dataset.reaction)):e.target.closest&&e.target.closest(".react-wrap")||d(),u()}),s.addEventListener("mouseleave",g),s.addEventListener("contextmenu",e=>e.preventDefault()),s.addEventListener("touchstart",f,{passive:!0}),s.addEventListener("touchmove",e=>{if(!i)return;e.preventDefault();const t=e.touches[0],n=document.elementFromPoint(t.clientX,t.clientY);m(n&&n.closest?n.closest(".reaction-opt"):null)},{passive:!1}),s.addEventListener("touchend",e=>{if(g(),i){if(e.preventDefault(),i=!1,p=!0,setTimeout(()=>{p=!1},0),c){const e=c.dataset.reaction;u(),h(e)}}else u()},{passive:!1}),s.addEventListener("touchcancel",()=>{g(),u(),i=!1},{passive:!0}),s.addEventListener("click",()=>{if(p)return void(p=!1);if(!t())return location.href="/login?next="+encodeURIComponent(location.pathname);if(i)return void(i=!1);const e=s.dataset.mine||"";n(o,e||"like")}),o.querySelectorAll(".reaction-opt").forEach(e=>{e.addEventListener("click",s=>{if(s.stopPropagation(),!t())return location.href="/login?next="+encodeURIComponent(location.pathname);n(o,e.dataset.reaction),d()})})}function s(e){(e||document).querySelectorAll(".actions-bar").forEach(o)}document.addEventListener("click",e=>{e.target.closest(".react-wrap")||document.querySelectorAll(".reaction-picker.open").forEach(e=>e.classList.remove("open"))}),window.LekhokReactions={init:s},document.addEventListener("DOMContentLoaded",()=>s())}(),function(){const e=()=>window.LekhokAuthed();function t(e){const t=e.dataset.shareUrl||location.pathname;return location.origin+t}function n(e,t){const n=encodeURIComponent(t||document.title||"");return{whatsapp:"https://wa.me/?text="+n+"%20"+encodeURIComponent(e),facebook:"https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(e),telegram:"https://t.me/share/url?url="+encodeURIComponent(e)+"&text="+n,x:"https://twitter.com/intent/tweet?url="+encodeURIComponent(e)+"&text="+n}}function o(o){(o||document).querySelectorAll(".share-wrap").forEach(o=>{if(o.dataset.initialized)return;o.dataset.initialized="1";const a=o.querySelector(".share-trigger"),r=o.querySelector(".share-menu"),i=o.querySelector(".share-now");i&&i.addEventListener("click",t=>{if(t.stopPropagation(),!e())return location.href="/login";const n=i.dataset.sharePost;n?(i.disabled=!0,fetch("/articles/"+n+"/share",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin"}).then(e=>{if(401===e.status)return location.href="/login?next="+encodeURIComponent(location.pathname),null;if(!e.ok)throw new Error("share "+e.status);return e.json()}).then(e=>{if(e)if(e.ok){showToast("নিজের টাইমলাইনে শেয়ার হয়েছে ✓","success");i.closest(".actions-block")&&i.closest(".actions-block").querySelector(".as-right .as-stat:last-child");setTimeout(()=>{location.href=e.redirect||"/dashboard"},600)}else showToast(e.error||"শেয়ার ব্যর্থ হয়েছে","error"),i.disabled=!1}).catch(()=>{showToast("শেয়ার ব্যর্থ হয়েছে","error"),i.disabled=!1})):showToast("শেয়ার করা যাবে না","error")}),a.addEventListener("click",e=>{e.stopPropagation(),document.querySelectorAll(".share-menu.open").forEach(e=>{e!==r&&e.classList.remove("open")}),r.classList.toggle("open");const o=n(t(r));r.querySelectorAll("a[data-share]").forEach(e=>{e.href=o[e.dataset.share]||"#"})}),r.addEventListener("click",async o=>{const a=o.target.closest("[data-share]");if(!a)return;o.preventDefault();const i=a.dataset.share,c=t(r);if("copy"===i){try{await navigator.clipboard.writeText(c),showToast("লিংক কপি হয়েছে ✓","success")}catch(e){const t=document.createElement("textarea");t.value=c,document.body.appendChild(t),t.select(),document.execCommand("copy"),t.remove(),showToast("লিংক কপি হয়েছে ✓","success")}r.classList.remove("open")}else if("user"===i){if(!e())return location.href="/login";!function(e){s=e;const t=document.getElementById("shareUserModal");if(!t)return;t.classList.add("open"),t.setAttribute("aria-hidden","false");const n=document.getElementById("shareUserSearch");n.value="",document.getElementById("shareUserResults").innerHTML='<div class="modal-empty">নাম লিখতে শুরু করুন…</div>',document.getElementById("shareMsg").value="",setTimeout(()=>n.focus(),100)}(c),r.classList.remove("open")}else if("timeline"===i){if(!e())return location.href="/login";const t=r.dataset.sharePost;if(r.classList.remove("open"),!t)return void showToast("শেয়ার করা যাবে না","error");a.disabled=!0,fetch("/articles/"+t+"/share",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin"}).then(e=>{if(401===e.status)return location.href="/login?next="+encodeURIComponent(location.pathname),null;if(!e.ok)throw new Error("share "+e.status);return e.json()}).then(e=>{e&&(e.ok?(showToast("নিজের টাইমলাইনে শেয়ার হয়েছে ✓","success"),setTimeout(()=>{location.href=e.redirect||"/dashboard"},700)):(showToast(e.error||"শেয়ার ব্যর্থ হয়েছে","error"),a.disabled=!1))}).catch(()=>{showToast("শেয়ার ব্যর্থ হয়েছে","error"),a.disabled=!1})}else{if(navigator.share&&window.matchMedia("(max-width: 768px)").matches)try{return await navigator.share({title:document.title,url:c}),void r.classList.remove("open")}catch(e){}const e=n(c);e[i]&&window.open(e[i],"_blank","noopener,width=620,height=560"),r.classList.remove("open")}})})}window.LekhokShare={init:o},document.addEventListener("DOMContentLoaded",()=>o()),document.addEventListener("click",e=>{e.target.closest(".share-wrap")||document.querySelectorAll(".share-menu.open").forEach(e=>e.classList.remove("open"))});let s="";function a(){const e=document.getElementById("shareUserModal");e&&(e.classList.remove("open"),e.setAttribute("aria-hidden","true"))}document.addEventListener("click",e=>{(e.target.matches("[data-close-share]")||"shareUserModal"===e.target.id)&&a()}),document.addEventListener("keydown",e=>{"Escape"===e.key&&a()});let r=null;document.addEventListener("input",e=>{if("shareUserSearch"!==e.target.id)return;clearTimeout(r);const t=e.target.value.trim();r=setTimeout(async()=>{const e=document.getElementById("shareUserResults");if(t)try{const n=await fetch("/api/users/search?q="+encodeURIComponent(t)),o=await n.json();if(!o.users||!o.users.length)return void(e.innerHTML='<div class="modal-empty">কাউকে পাওয়া যায়নি</div>');e.innerHTML=o.users.map(e=>`\n          <button type="button" class="share-user-row" data-username="${e.username}" data-name="${e.full_name}">\n            <img src="${e.avatar_url||"/avatar/"+e.id}" alt="" onerror="this.src='/assets/img/avatar-placeholder.svg'">\n            <span><strong>${e.full_name}</strong><small>${e.designation||"সদস্য"}</small></span>\n            <i class="fas fa-paper-plane"></i>\n          </button>\n        `).join("")}catch(t){e.innerHTML='<div class="modal-empty">খোঁজা যায়নি — আবার চেষ্টা করুন</div>'}else e.innerHTML='<div class="modal-empty">নাম লিখতে শুরু করুন…</div>'},250)}),document.addEventListener("click",async e=>{const t=e.target.closest(".share-user-row");if(!t)return;const n=(s.match(/\/(articles|qa)\/(\d+)/)||[])[2],o=document.getElementById("shareMsg").value.trim(),r=await fetch("/api/share-to-user",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to_username:t.dataset.username,post_id:n,message:o})}),i=await r.json();i.ok?(a(),showToast("পাঠানো হয়েছে ✓","success"),setTimeout(()=>{location.href=i.redirect},500)):showToast("blocked"===i.error?"পাঠানো সম্ভব নয়":"পাঠানো যায়নি","error")}),function(){const e=document.getElementById("globalSearchWrap"),t=document.getElementById("globalSearchDropdown"),n=document.getElementById("globalSearchInput"),o=document.getElementById("globalSearchResults");if(!(e&&t&&n&&o))return;let s=null,a="";function r(){t.hidden=!1,setTimeout(()=>n.focus(),50)}function i(){t.hidden=!0}function c(e){return String(e||"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[e]))}function l(e,t){if(!t)return c(e);const n=String(e).toLowerCase().indexOf(t.toLowerCase());return-1===n?c(e):c(e.substring(0,n))+"<mark>"+c(e.substring(n,n+t.length))+"</mark>"+c(e.substring(n+t.length))}async function d(e){if((e=(e||"").trim())!==a)if(a=e,e.length<2)o.innerHTML='<div class="gs-hint">অন্তত ২ অক্ষর লিখুন...</div>';else{o.innerHTML='<div class="gs-loading"><i class="fas fa-spinner fa-spin"></i> খুঁজছি...</div>';try{const n=await fetch("/api/search?q="+encodeURIComponent(e)),s=await n.json();if(e!==a||t.hidden)return;let r="";s.articles&&s.articles.length&&(r+='<div class="gs-section"><div class="gs-section-head"><i class="fas fa-pen-nib"></i> লেখা <span class="gs-count">'+s.articles.length+"</span></div>",s.articles.slice(0,5).forEach(t=>{r+='<a class="gs-row" href="/articles/'+t.id+'"><i class="fas fa-file-alt"></i><div class="gs-meta"><div class="gs-title">'+l(t.title,e)+'</div><div class="gs-sub">'+c(t.author_name||"")+"</div></div></a>"}),r+="</div>"),s.questions&&s.questions.length&&(r+='<div class="gs-section"><div class="gs-section-head"><i class="fas fa-question-circle"></i> প্রশ্ন <span class="gs-count">'+s.questions.length+"</span></div>",s.questions.slice(0,5).forEach(t=>{r+='<a class="gs-row" href="/qa/'+t.id+'"><i class="fas fa-question"></i><div class="gs-meta"><div class="gs-title">'+l(t.title,e)+'</div><div class="gs-sub">'+c(t.author_name||"")+"</div></div></a>"}),r+="</div>"),s.users&&s.users.length&&(r+='<div class="gs-section"><div class="gs-section-head"><i class="fas fa-users"></i> সদস্য <span class="gs-count">'+s.users.length+"</span></div>",s.users.slice(0,5).forEach(t=>{r+='<a class="gs-row" href="/profile/'+encodeURIComponent(t.username)+'"><img loading="lazy" decoding="async" class="gs-avatar" src="'+(t.avatar_url||"/avatar/"+t.id)+'" onerror="this.src=\'/assets/avatars/neutral.svg\'" /><div class="gs-meta"><div class="gs-title">'+l(t.full_name,e)+'</div><div class="gs-sub">'+c(t.designation||"সদস্য")+"</div></div></a>"}),r+="</div>"),r?r+=function(e){return'<a class="gs-row gs-see-all" href="/search?q='+encodeURIComponent(e)+'"><i class="fas fa-arrow-right"></i><div class="gs-meta"><div class="gs-title">“'+c(e)+"” এর সব ফলাফল দেখুন</div></div></a>"}(e):r='<div class="gs-empty"><i class="fas fa-search"></i><p>কোনো ফলাফল পাওয়া যায়নি</p></div>',o.innerHTML=r}catch(e){o.innerHTML='<div class="gs-empty"><i class="fas fa-exclamation-circle"></i><p>সার্চ ব্যর্থ</p></div>'}}}window.toggleGlobalSearch=function(){t.hidden?r():i()},n.addEventListener("input",function(){s&&clearTimeout(s),s=setTimeout(()=>d(this.value),220)}),n.addEventListener("keydown",function(e){"Escape"===e.key&&(i(),this.blur()),"Enter"===e.key&&(e.preventDefault(),window.location="/search?q="+encodeURIComponent(this.value.trim()))}),document.addEventListener("click",function(e){e.target.closest("#globalSearchWrap")||i()}),document.addEventListener("keydown",function(e){"/"!==e.key||e.target.matches('input, textarea, select, [contenteditable="true"]')||(e.preventDefault(),r())})}(),function(){const e=document.getElementById("feedCarousel"),t=document.getElementById("fcTrack"),n=document.getElementById("fcDots");if(!e||!t||!n)return;const o=t.children.length;if(o<2)return;let s=0;const a=window.matchMedia("(prefers-reduced-motion: reduce)").matches,r=[];for(let e=0;e<o;e++){const t=document.createElement("button");t.type="button",t.className="fc-dot"+(0===e?" active":""),t.setAttribute("aria-label","স্লাইড "+(e+1)),t.addEventListener("click",()=>{i(e),u()}),n.appendChild(t),r.push(t)}function i(e){s=(e%o+o)%o,t.style.transform="translateX(-"+100*s+"%)",r.forEach((e,t)=>e.classList.toggle("active",t===s))}let c=null;function l(){a||c||(c=setInterval(()=>{document.hidden||i(s+1)},6e3))}function d(){c&&(clearInterval(c),c=null)}function u(){d(),l()}e.addEventListener("mouseenter",d),e.addEventListener("mouseleave",l),e.addEventListener("focusin",d),e.addEventListener("focusout",l),i(0),l()}()}(),document.addEventListener("click",async e=>{const t=e.target.closest(".bookmark-btn");if(!t)return;if(!window.LekhokAuthed())return location.href="/login?next="+encodeURIComponent(location.pathname);const n=await fetch("/api/bookmark",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({post_id:t.dataset.bookmarkId})});if(n.ok){const e=await n.json();t.classList.toggle("active",e.saved),t.querySelector("i").className=(e.saved?"fas":"far")+" fa-bookmark",showToast(e.saved?"সংরক্ষিত হয়েছে 📌":"সংরক্ষণ সরানো হয়েছে","success")}}),document.addEventListener("click",async e=>{const t=e.target.closest(".follow-inline");if(!t)return;if(!window.LekhokAuthed())return location.href="/login?next="+encodeURIComponent(location.pathname);const n=await fetch("/follow/"+t.dataset.user,{method:"POST"}),r=await n.json();r.following?(t.innerHTML='<i class="fas fa-check"></i><span>অনুসৃত</span>',t.classList.add("following"),showToast("অনুসরণ করছেন ✓","success")):(t.innerHTML='<i class="fas fa-plus"></i><span>অনুসরণ</span>',t.classList.remove("following"),"role_policy"===r.error&&showToast(r.message||"রোল-নীতি: এই পদের সাথে সরাসরি ফলো সম্ভব নয়","error"))}),document.addEventListener("click",function(e){const t=e.target.closest(".leader-card[data-href]");t&&(e.target.closest("a")||(location.href=t.getAttribute("data-href")))}),function(){function e(){document.querySelectorAll('form[data-submitting="1"]').forEach(e=>{e.dataset.submitting="",e.querySelectorAll('[type="submit"]').forEach(e=>{e.disabled=!1,e.dataset.origHtml&&(e.innerHTML=e.dataset.origHtml)})})}document.addEventListener("submit",function(e){const t=e.target;if(!t||"FORM"!==t.tagName)return;if("get"===(t.getAttribute("method")||"get").toLowerCase())return;if(!t.getAttribute("action")||void 0!==t.dataset.noguard)return;if("1"===t.dataset.submitting)return e.preventDefault(),void e.stopImmediatePropagation();t.dataset.submitting="1";const n=e.submitter&&e.submitter.form===t?e.submitter:t.querySelector('[type="submit"]'),o=t.querySelectorAll('[type="submit"]');o.forEach(e=>{e.disabled=!0}),n&&(n.dataset.origHtml=n.innerHTML,n.innerHTML='<i class="fas fa-spinner fa-spin"></i> প্রসেসিং...'),setTimeout(()=>{"1"===t.dataset.submitting&&(t.dataset.submitting="",o.forEach(e=>{e.disabled=!1}),n&&n.dataset.origHtml&&(n.innerHTML=n.dataset.origHtml))},1e4)},!0),document.addEventListener("submit",function(e){const t=e.target;t&&"FORM"===t.tagName&&"1"===t.dataset.submitting&&e.defaultPrevented&&(t.dataset.submitting="",t.querySelectorAll('[type="submit"]').forEach(e=>{e.disabled=!1,e.dataset.origHtml&&(e.innerHTML=e.dataset.origHtml)}))},!1),window.addEventListener("pageshow",e),window.addEventListener("load",e)}(),function(){function e(){const e=document.querySelector('meta[name="csrf-token"]');e&&e.content&&document.querySelectorAll("form").forEach(t=>{if("post"!==(t.getAttribute("method")||"get").toLowerCase())return;if(-1!==(t.getAttribute("enctype")||"").indexOf("multipart")){let n=t.getAttribute("action")||"";return n||(n=location.pathname+location.search),void(-1===n.indexOf("_csrf=")&&0!==n.indexOf("http")&&t.setAttribute("action",n+(-1===n.indexOf("?")?"?":"&")+"_csrf="+encodeURIComponent(e.content)))}if(t.querySelector('input[name="_csrf"]'))return;const n=document.createElement("input");n.type="hidden",n.name="_csrf",n.value=e.content,t.prepend(n)})}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",e):e()}();

/* ============= সেশন ৪৪-পরিপূরক: saveerr টোস্ট =============
   আনম্যাচড POST/সেভ-ব্যর্থতায় সার্ভার রেফারারে ?saveerr=1 দিয়ে ফেরত পাঠায় —
   এখানে এরর-টোস্ট দেখানো হয় ও URL ক্লিন করা হয়। footer.ejs-এর কপির সাথে
   ডাবল-টোস্ট এড়াতে window.__saveerr44 গার্ড। */
(function () {
  function run44() {
    try {
      if (window.__saveerr44) return; 
      var qs = new URLSearchParams(location.search);
      if (!qs.has('saveerr')) return;
      window.__saveerr44 = 1;
      qs.delete('saveerr');
      var clean = location.pathname + (qs.toString() ? '?' + qs.toString() : '') + location.hash;
      if (history.replaceState) history.replaceState(null, '', clean);
      var t = document.createElement('div');
      t.setAttribute('role', 'alert');
      t.style.cssText = 'position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:2000;background:#b91c1c;color:#fff;border-radius:5px;padding:13px 20px;font-size:.92rem;font-weight:600;box-shadow:0 8px 28px rgba(0,0,0,.35);max-width:92vw;text-align:center;transition:opacity .5s;';
      t.textContent = '⚠️ সংরক্ষণ সম্পন্ন হয়নি — ফর্মটি আবার পূরণ করে চেষ্টা করুন। সমস্যা চললে অ্যাডমিনকে জানান।';
      document.body.appendChild(t);
      setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 600); }, 7000);
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run44);
  else run44();
})();
!function () {
  // সেশন ৫৭: CSRF/সেভ-ব্যর্থতার গ্রেসফুল টোস্ট — server এখন 403-র বদলে
  // ফর্ম-পেজে ?csrf=1 (বা 404-হ্যান্ডলারের ?saveerr=1) দিয়ে ফেরত পাঠায়।
  // টোকেন পুরনো থাকলে নতুন পেজে নতুন টোকেন আসে; ইউজার শুধু আবার সাবমিট করে।
  function run57() {
    try {
      var p = new URLSearchParams(location.search);
      var isCsrf = p.get('csrf') === '1';
      var isSaveErr = p.get('saveerr') === '1';
      if (!isCsrf && !isSaveErr) return;
      p.delete('csrf'); p.delete('saveerr');
      var rest = p.toString();
      history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
      showToast(isCsrf
        ? 'নিরাপত্তা যাচাই পুরনো হয়ে গিয়েছিল। পেজ নতুন করে লোড হয়েছে, আবার চেষ্টা করুন।'
        : 'সেভ করা যায়নি। আবার চেষ্টা করুন।', 'error');
    } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run57);
  else run57();
}();

/* ── সেশন ৫৯: ব্যাক-টু-টপ ফ্লোটিং বাটন ───────────────────────────────────── */
(function () {
  var btn = document.getElementById('backToTop');
  if (!btn) return;
  var ticking = false;
  function upd() {
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    if (y > 420) btn.classList.add('is-visible');
    else btn.classList.remove('is-visible');
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(upd); ticking = true; }
  }, { passive: true });
  upd();
  btn.addEventListener('click', function () {
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); }
    catch (e) { window.scrollTo(0, 0); }
  });
})();

/* ── সেশন ৮৯: FB-২০২৪ ফেসপাইল লাইভ-আপডেট + ফিড ইনফিনিট-স্ক্রল (B1) ────────── */
(function () {
  console.log('%cলেখক ফোরাম · main.js build 2026-09-22-r7 (p0-premium-voice)', 'color:#006A4E;font-weight:600');

  // (১) ফেসপাইল: /api/react সফল হলে মিনিফায়েড আপডেটার 'lf:reactupdate' ছড়ায় —
  // এখানে .rs-faces হালনাগাদ করি (data-uid-ম্যাচে আমার অ্যাভাটার যোগ/বাদ)।
  // ডকুমেন্ট-লেভেল লিসেনার — ডায়নামিক যোগ হওয়া কার্ডেও re-init ছাড়া কাজ করে।
  function bodyAttr(name) { return document.body ? document.body.getAttribute(name) : null; }
  document.addEventListener('lf:reactupdate', function (e) {
    var sum = e.target;
    if (!sum || !sum.classList || !sum.classList.contains('reaction-summary')) return;
    var faces = sum.querySelector('.rs-faces');
    if (!faces) return;
    var uid = bodyAttr('data-uid');
    if (!uid) return;
    var mine = faces.querySelector('.rsf-av[data-uid="' + uid + '"]');
    if (e.detail && e.detail.mine) {
      if (!mine) {
        var img = document.createElement('img');
        img.className = 'rsf-av rsf-new';
        img.src = bodyAttr('data-avatar') || '/avatar/0';
        img.alt = '';
        img.setAttribute('data-uid', uid);
        img.title = bodyAttr('data-name') || '';
        img.onerror = function () { img.style.display = 'none'; };
        faces.insertBefore(img, faces.firstChild);
      }
      faces.hidden = false;
    } else if (mine) {
      mine.remove();
      if (!faces.querySelector('.rsf-av')) faces.hidden = true;
    }
  });

  // (২) ইনফিনিট-স্ক্রল: #feedMore সেন্টিনেল ভিউপোর্টের ৬০০px কাছে এলেই
  // /dashboard/more → ফলাফল HTML কার্ডগুলো সেন্টিনেলের আগে append।
  var more = document.getElementById('feedMore');
  if (!more) return;
  var spinner = document.getElementById('feedMoreSpinner');
  var btn = document.getElementById('feedMoreBtn');
  var offset = parseInt(more.getAttribute('data-offset') || '0', 10) || 0;
  var filter = more.getAttribute('data-filter') || 'all';
  var sort = more.getAttribute('data-sort') || 'recent'; // সেশন ১০০ (০৮): র‍্যাংকড-মোড ধারাবাহিকতা
  // সেশন ১০৪ (রোডম্যাপ-০৫): keyset-কার্সার — সার্ভার পেজ-১-এর শেষ-আইটেম-টুপল দেয়;
  // recent-মোডে কার্সার-প্যারাম যায় (OFFSET-বিহীন), ranked-মোডে OFFSET-ই থাকে (পুল-স্লাইস)।
  var curTs = more.getAttribute('data-cursor-ts') || '';
  var curType = more.getAttribute('data-cursor-type') || '';
  var curId = parseInt(more.getAttribute('data-cursor-id') || '0', 10) || 0;
  var busy = false, done = false;
  // সেশন ৯৩ (০৫-পলিশ): ধারাবাহিক-লোড চেইন — স্ক্রল-রিস্টোর একাধিক পেজ পরপর চাইলে
  // busy-গার্ডের ইনস্ট্যান্ট-রিটার্নে আটকে না-যায়; প্রতিটি কল চেইনে সারিবদ্ধ হয়।
  var chain = Promise.resolve();
  function loadNext() {
    if (done) return Promise.resolve(false);
    chain = chain.then(function () {
      if (done) return false;
      return loadMore().then(function () { return !done; });
    }).catch(function () { return false; });
    return chain;
  }

  function finish() {
    done = true;
    more.classList.add('feed-more--done');
    if (spinner) spinner.hidden = true;
    if (btn) {
      btn.disabled = true;
      btn.classList.add('is-done');
      btn.innerHTML = 'সব লেখা দেখানো হয়েছে <i class="fas fa-check-circle"></i>';
      btn.hidden = false;
    }
  }

  async function loadMore() {
    if (busy || done) return;
    busy = true;
    more.classList.add('is-loading');
    if (spinner) spinner.hidden = false;
    if (btn) btn.hidden = true;
    try {
      // ১০৪: recent + বৈধ-কার্সার → keyset-কুয়েরি; নইলে legacy OFFSET
      var useCursor = sort !== 'ranked' && curTs && curType && curId;
      var q = '/dashboard/more?filter=' + encodeURIComponent(filter) + '&sort=' + encodeURIComponent(sort);
      q += useCursor
        ? '&cursor=' + encodeURIComponent(curTs) + '&cursorType=' + encodeURIComponent(curType) + '&cursorId=' + curId
        : '&offset=' + offset;
      var res = await fetch(q, { credentials: 'same-origin' });
      var data = await res.json();
      if (!data || !data.ok || !data.html) { finish(); return; }
      var tpl = document.createElement('template');
      tpl.innerHTML = data.html;
      more.parentNode.insertBefore(tpl.content, more);
      if (data.nextCursor && data.nextCursor.ts && data.nextCursor.type && data.nextCursor.id) {
        curTs = data.nextCursor.ts; curType = data.nextCursor.type; curId = data.nextCursor.id;
      }
      offset = data.nextOffset || offset;
      // নতুন ডমে ইন্টারঅ্যাকশন-ইঞ্জিনগুলো পুনঃচালু (আইডি-ইমপোটেন্ট)
      try { window.LekhokReactions && window.LekhokReactions.init(); } catch (_) {}
      try { window.LekhokShare && window.LekhokShare.init(); } catch (_) {}
      try { window.LekhokRelTime && window.LekhokRelTime.render(); } catch (_) {}
      if (!data.hasMore) finish();
    } catch (_) {
      finish();
    } finally {
      busy = false;
      more.classList.remove('is-loading');
      if (spinner) spinner.hidden = true;
      if (!done && btn) btn.hidden = false;
    }
  }

  // সেশন ৯৩: বাটন/সেন্টিনেল/রিস্টোর সবগুলো ট্রিগার একই চেইনে — busy-দ্বন্দ্ব শেষ
  if (btn) btn.addEventListener('click', loadNext);
  // সেশন ৯৩: স্ক্রল-রিস্টোর-ইঞ্জিনের জন্য পাবলিক API (০৫-পলিশ — load-on-restore)
  window.LekhokFeedMore = {
    loadNext: loadNext,
    isDone: function () { return done; }
  };
  more.hidden = false; // JS আছে — সেন্টিনেল সক্রিয় (নইলে ফলব্যাক-বাটনও লুকানো থাকবে ঠিকই)
  if ('IntersectionObserver' in window) {
    var sentinel = document.createElement('div');
    sentinel.className = 'feed-more-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    more.parentNode.insertBefore(sentinel, more);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) loadNext(); });
    }, { rootMargin: '600px 0px' });
    io.observe(sentinel);
  }
})();


/* ── সেশন ৯২ (রোডম্যাপ B1/০৬): ফিড স্ক্রল-পজিশন রিস্টোর — ব্যাক-নেভিগেশনে যেখানে ছিলেন সেখানেই ফেরা ──
 * /dashboard ও / (ফিড-পেজ) এ scrollY প্রতি-pathname+query-key sessionStorage-এ সেভ হয়;
 * পোস্ট পড়তে গিয়ে গেলে/ফিরে এলে সেভ-অবস্থানে রিস্টোর (ফন্ট/ইমেজ-রিফলোর পরেও পুনঃনিশ্চিত)।
 * উপরের ১২০px-এর কম হলে রিস্টোর নেই (টপ-ভিজিট = নরমাল টপ); ফিল্টার-ট্যাব (?filter=) ভিন্ন-কী। */
(function () {
  try {
    var p = location.pathname;
    var isFeed = (p === '/' || p.indexOf('/dashboard') === 0);
    if (!isFeed || !window.sessionStorage) return;

    var KEY = 'lf_feed_y:' + p + location.search;
    var saved = parseInt(sessionStorage.getItem(KEY) || '0', 10);
    var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
    function clampGo() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.min(saved, Math.max(max, 0)));
    }
    /* সেশন ৯৩ (রোডম্যাপ-০৫ পলিশ): load-on-restore — সেভ-অবস্থান বর্তমান-কনটেন্টের
     * নিচে হলে (গভীর স্ক্রল করে পোস্টে গিয়ে ফেরা), আগে ফিডের পরের পেজগুলো
     * ধারাবাহিকভাবে লোড করে যথেষ্ট উচ্চতা আনি (সর্বোচ্চ ১২ পেজ), তারপর নিখুঁত
     * রিস্টোর — আগে clamp-এ উপরে আটকে যেত। */
    function loadUntilReachable(tries) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (saved <= max + 40) { clampGo(); doneRestoring(); return; }
      var fm = window.LekhokFeedMore;
      if (!fm || !fm.loadNext || tries <= 0) { clampGo(); doneRestoring(); return; }
      Promise.resolve(fm.loadNext()).then(function (progressed) {
        if (!progressed) { clampGo(); doneRestoring(); return; }
        raf(function () { loadUntilReachable(tries - 1); });
      });
    }
    function doneRestoring() {
      try {
        var n = 0;
        var iv = setInterval(function () { // ইমেজ-রিফলোর পরেও পুনঃনিশ্চিত
          clampGo();
          if (++n >= 6) { clearInterval(iv); document.documentElement.classList.remove('lf-restoring'); }
        }, 250);
      } catch (e) { document.documentElement.classList.remove('lf-restoring'); }
    }
    if (saved > 120) {
      document.documentElement.classList.add('lf-restoring');
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { clampGo(); loadUntilReachable(12); });
      else { clampGo(); loadUntilReachable(12); }
      raf(function () { raf(function () { clampGo(); loadUntilReachable(12); }); });
      window.addEventListener('load', function () { clampGo(); loadUntilReachable(12); }, { once: true });
    }
    var t = null;
    window.addEventListener('scroll', function () {
      if (t) return;
      t = setTimeout(function () {
        t = null;
        try { sessionStorage.setItem(KEY, String(window.scrollY || 0)); } catch (e) {}
      }, 160);
    }, { passive: true });
  } catch (e) {}
})();

/* ── সেশন ৯৪ (রোডম্যাপ-০১): লাইভ-পুশ ক্লায়েন্ট (live.js) লোডার ────────────────────
 * লগড-ইন পেজে (body[data-uid]) live.js ডায়নামিক-লোড — ৪৮টি ভিউতে আলাদা <script>
 * ট্যাগ এডিট না-করে এক-জায়গা-থেকে। ক্যাশ-বাস্ট: এই main.js-ট্যাগের ?v= পুনঃব্যবহার। */
(function () {
  try {
    if (!document.body || !document.body.getAttribute('data-uid')) return;
    var mine = null;
    try { mine = document.querySelector('script[src*="main.js"]'); } catch (e) {}
    var v = '94';
    if (mine && mine.src) { var m = mine.src.match(/[?&]v=([^&]+)/); if (m) v = m[1]; }
    var s = document.createElement('script');
    s.src = '/assets/js/live.js?v=' + encodeURIComponent(v);
    s.defer = true;
    (document.body || document.head).appendChild(s);
  } catch (e) {}
})();
/* ═══ সেশন ১১০: শেয়ার-মেনু রিসেন্ট-চ্যাট-শর্টকাট (ShareWithRecentChats) ═══
   · .share-trigger-ক্লিকে মেনু খুললে (আগের হ্যান্ডলার .open টগল করে) পরের-টিকে
     স্ট্রিপ [data-recent-chats] দেখে লেজি-ফেচ GET /api/messages/recent-chats
   · চিপ: অ্যাভাটার (+অনলাইন-ডট) + প্রথম-নাম + 'পাঠান'-পিল
   · ১-ট্যাপ পাঠান: POST /api/share-to-user {to_username, post_id} — নেভিগেশন-নেই;
     বাটন ✓ 'পাঠানো হয়েছে' (এমারল্ড) + টোস্ট; ব্যর্থলে রিভার্ট
   · প্রতি-মেনু একবারই লোড; sent-স্টেট strip-dataset-এ টিকে থাকে (রি-ওপেনেও) */
(function () {
  'use strict';
  if (window.LekhokRecentChats110) return;
  window.LekhokRecentChats110 = true;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function firstName(n) {
    var d = String(n || '').trim();
    return d ? d.split(' ')[0] : 'ইউজার';
  }
  function markSent(strip, uid) {
    try {
      var m = {};
      if (strip.dataset.sentMap) m = JSON.parse(strip.dataset.sentMap);
      m[uid] = 1;
      strip.dataset.sentMap = JSON.stringify(m);
    } catch (e) { /* নিরীহ */ }
  }
  function wasSent(strip, uid) {
    try {
      return !!(strip.dataset.sentMap && JSON.parse(strip.dataset.sentMap)[uid]);
    } catch (e) { return false; }
  }

  function render(strip, chats) {
    var row = strip.querySelector('.smxr110-row');
    if (!row) return;
    if (!chats.length) {
      row.innerHTML = '<span class="smxr110-empty">এখনো কোনো চ্যাট নেই — “মেসেজে পাঠান” দিয়ে খুঁজুন</span>';
      return;
    }
    var html = '';
    chats.forEach(function (c) {
      var sent = wasSent(strip, c.id);
      html += '<span class="smxr110-chip" data-uid="' + esc(c.id) + '" data-username="' + esc(c.username) + '" data-name="' + esc(c.name) + '">' +
        '<span class="smxr110-avwrap">' +
          '<img loading="lazy" decoding="async" class="smxr110-av" src="' + esc(c.avatar_url || '/avatar/' + encodeURIComponent(c.id)) + '" alt="" onerror="this.src=\'/assets/img/avatar-placeholder.svg?v=2\'">' +
          (c.online ? '<span class="smxr110-dot" title="অনলাইন"></span>' : '') +
        '</span>' +
        '<span class="smxr110-name" title="' + esc(c.name) + '">' + esc(firstName(c.pen_name || c.name)) + '</span>' +
        '<button type="button" class="smxr110-send' + (sent ? ' is-sent' : '') + '"' + (sent ? ' disabled' : '') + ' data-uid="' + esc(c.id) + '">' + (sent ? '✓ পাঠানো' : 'পাঠান') + '</button>' +
      '</span>';
    });
    row.innerHTML = html;
  }

  function load(strip) {
    if (strip.dataset.loaded === '1' || strip.dataset.loading === '1') return;
    strip.dataset.loading = '1';
    fetch('/api/messages/recent-chats', { credentials: 'same-origin' })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (j) {
        strip.dataset.loaded = '1';
        strip.dataset.loading = '';
        render(strip, (j && j.chats) || []);
      })
      .catch(function () {
        strip.dataset.loading = '';
        var row = strip.querySelector('.smxr110-row');
        if (row) row.innerHTML = '<span class="smxr110-empty">লোড করা যায়নি</span>';
      });
  }

  // মেনু-ওপেন-ওয়াচার: শেয়ার-ট্রিগার ক্লিকে পরের-টিকে open-মেনুর স্ট্রিপ লোড।
  // ⚠ ক্যাপচার-ফেজ (capture:true) — লেগেসি শেয়ার-হ্যান্ডলার টার্গেট-ফেজে
  // e.stopPropagation() করে; বাবল-ফেজ-ডেলিগেশন তখন কখনোই ট্রিগার-ক্লিক দেখে না।
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.share-trigger')) return;
    setTimeout(function () {
      document.querySelectorAll('.share-menu--fb.open').forEach(function (menu) {
        var strip = menu.querySelector('[data-recent-chats]');
        if (strip) load(strip);
      });
    }, 0);
  }, true);

  // ১-ট্যাপ পাঠান (ডেলিগেশন — রেন্ডার-পরবর্তী চিপগুলোও ধরে)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.smxr110-send');
    if (!btn || btn.disabled) return;
    e.preventDefault();
    e.stopPropagation();
    if (window.LekhokAuthed && !window.LekhokAuthed()) return void (location.href = '/login?next=' + encodeURIComponent(location.pathname));
    var chip = btn.closest('.smxr110-chip');
    var strip = btn.closest('[data-recent-chats]');
    if (!chip || !strip) return;
    var postId = strip.getAttribute('data-share-post');
    if (!postId) return;
    var orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = '…';
    fetch('/api/share-to-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ to_username: chip.getAttribute('data-username'), post_id: postId, message: '' })
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (j) {
        if (j && j.ok) {
          markSent(strip, chip.getAttribute('data-uid'));
          btn.classList.add('is-sent');
          btn.textContent = '✓ পাঠানো';
          if (window.showToast) window.showToast(firstName(chip.getAttribute('data-name')) + '-কে পাঠানো হয়েছে ✓', 'success');
        } else {
          btn.disabled = false;
          btn.textContent = orig;
          var errMap = { blocked: 'পাঠানো সম্ভব নয়', self: 'নিজেকে পাঠানো যায় না', msg_none: 'এই ইউজার বার্তা গ্রহণ করছেন না', msg_followers: 'শুধু অনুসারীরা বার্তা পাঠাতে পারেন' };
          if (window.showToast) window.showToast(errMap[j && j.error] || 'পাঠানো যায়নি', 'error');
        }
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = orig;
        if (window.showToast) window.showToast('নেটওয়ার্ক-সমস্যা — আবার চেষ্টা করুন', 'error');
      });
  });
})();
