/**
 * main.js — Shared logic for all pages
 * Navigation, language switching, dynamic content rendering
 */

/* ─── Navigation Component ─── */
function renderNav(activePage) {
  // Two tiers, mapped to how an investor reads the site:
  //   decide (case → numbers → capital) is always visible,
  //   the supporting detail sits one hover away, Contact is the standing action.
  const pages = [
    { id: 'vision', key: 'nav_vision', href: 'vision.html' },
    { id: 'home', key: 'nav_home', href: 'index.html?home=1' },
    { id: 'thesis', key: 'nav_thesis', href: 'thesis.html' },
    { id: 'ask', key: 'nav_ask', href: 'ask.html' },
    { key: 'nav_g_tech', children: [
      { id: 'overview', key: 'nav_overview', href: 'overview.html' },
      { id: 'efficiency', key: 'nav_efficiency', href: 'efficiency.html' },
      { id: 'costs', key: 'nav_costs', href: 'costs.html' }
    ]},
    { key: 'nav_g_evidence', children: [
      { id: 'value-chain', key: 'nav_value_chain', href: 'value-chain.html' },
      { id: 'collaboration', key: 'nav_collaboration', href: 'collaboration.html' },
      { id: 'gallery', key: 'nav_gallery', href: 'gallery.html' }
    ]},
    { id: 'contact', key: 'nav_contact', href: 'contact.html', cta: true }
  ];

  // The Riyadh deployment subpage is nested under Costs — highlight Costs as active
  const act = activePage === 'riyadh' ? 'costs' : activePage;

  const linksHtml = pages.map(p => {
    if (!p.children) {
      const cls = [p.cta ? 'nav-link-cta' : '', act === p.id ? 'active' : ''].filter(Boolean).join(' ');
      return `<li><a class="nav-link ${cls}" href="${p.href}" data-i18n="${p.key}"></a></li>`;
    }
    const inGroup = p.children.some(c => c.id === act);
    const items = p.children.map(c =>
      `<a class="nav-menu-link ${act === c.id ? 'active' : ''} ${c.id === 'costs' ? 'nav-link-locked' : ''}" href="${c.href}" data-i18n="${c.key}"></a>`
    ).join('');
    return `<li class="nav-group">
      <button type="button" class="nav-link nav-group-label ${inGroup ? 'active' : ''}" aria-haspopup="true" aria-expanded="false" onclick="toggleNavGroup(event, this)">
        <span data-i18n="${p.key}"></span>
        <svg class="nav-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="nav-menu">${items}</div>
    </li>`;
  }).join('');

  return `
    <nav class="navbar">
      <div class="navbar-inner">
        <a href="index.html" class="nav-brand" aria-label="napell.space home">
          <div class="nav-brand-icon">
            <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="napell-lg" x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stop-color="#1d9bf0"/>
                  <stop offset="1" stop-color="#7c5cff"/>
                </linearGradient>
              </defs>
              <path d="M24 2 44 13v22L24 46 4 35V13Z" fill="url(#napell-lg)" fill-opacity="0.16" stroke="url(#napell-lg)" stroke-width="2.5" stroke-linejoin="round"/>
              <path d="M16.5 33V15l15 18V15" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="6.5" cy="12.5" r="1.8" fill="#7c5cff"/>
              <circle cx="41.5" cy="35.5" r="1.8" fill="#1d9bf0"/>
              <circle cx="41.5" cy="12.5" r="1.2" fill="#7cffff"/>
              <circle cx="6.5" cy="35.5" r="1.2" fill="#7cffff"/>
            </svg>
          </div>
          <div class="nav-brand-text">
            <span class="nav-brand-name" data-i18n="nav_brand"></span>
            <span class="nav-brand-tag" data-i18n="nav_tagline"></span>
          </div>
        </a>
        <ul class="nav-links" id="nav-links">${linksHtml}</ul>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="lang-switcher">
            <button class="lang-toggle" onclick="toggleLangDropdown(event)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/>
              </svg>
              <span id="lang-current-label">English</span>
            </button>
            <div class="lang-dropdown" id="lang-dropdown">
              <button class="lang-option" data-lang="en" onclick="switchLang('en')">
                <span class="lang-option-flag">🇺🇸</span>
                <span class="lang-option-text">
                  <span class="lang-option-name">English</span>
                  <span class="lang-option-desc" data-i18n="modal_en_desc"></span>
                </span>
              </button>
              <button class="lang-option" data-lang="zh" onclick="switchLang('zh')">
                <span class="lang-option-flag">🇨🇳</span>
                <span class="lang-option-text">
                  <span class="lang-option-name">简体中文</span>
                  <span class="lang-option-desc" data-i18n="modal_zh_desc"></span>
                </span>
              </button>
              <button class="lang-option" data-lang="ar" onclick="switchLang('ar')">
                <span class="lang-option-flag">🇸🇦</span>
                <span class="lang-option-text">
                  <span class="lang-option-name">العربية</span>
                  <span class="lang-option-desc" data-i18n="modal_ar_desc"></span>
                </span>
              </button>
            </div>
          </div>
          <button class="nav-mobile-toggle" onclick="toggleMobileNav()" aria-label="Toggle navigation" aria-expanded="false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  `;
}

/* ─── Language Modal Component ─── */
function renderLangModal() {
  return `
    <div class="lang-modal" id="lang-modal">
      <div class="lang-modal-card">
        <div class="lang-modal-icon">🌐</div>
        <h2 class="lang-modal-title" data-i18n="modal_title"></h2>
        <p class="lang-modal-subtitle" data-i18n="modal_subtitle"></p>
        <div class="lang-modal-options">
          <div class="lang-modal-option" data-lang="en" onclick="selectModalLang('en')">
            <div class="lang-modal-option-flag">🇺🇸</div>
            <div class="lang-modal-option-name" data-i18n="modal_en"></div>
            <div class="lang-modal-option-desc" data-i18n="modal_en_desc"></div>
          </div>
          <div class="lang-modal-option" data-lang="zh" onclick="selectModalLang('zh')">
            <div class="lang-modal-option-flag">🇨🇳</div>
            <div class="lang-modal-option-name" data-i18n="modal_zh"></div>
            <div class="lang-modal-option-desc" data-i18n="modal_zh_desc"></div>
          </div>
          <div class="lang-modal-option" data-lang="ar" data-lang="ar" onclick="selectModalLang('ar')">
            <div class="lang-modal-option-flag">🇸🇦</div>
            <div class="lang-modal-option-name" data-i18n="modal_ar"></div>
            <div class="lang-modal-option-desc" data-i18n="modal_ar_desc"></div>
          </div>
        </div>
        <label class="lang-modal-remember">
          <input type="checkbox" id="modal-remember" checked>
          <span data-i18n="modal_remember"></span>
        </label>
        <button class="lang-modal-btn" id="modal-confirm-btn" onclick="confirmModalLang()" disabled data-i18n="modal_confirm"></button>
      </div>
    </div>
  `;
}

/* ─── Footer Component ─── */
function renderFooter() {
  const year = new Date().getFullYear();
  return `
    <footer class="footer">
      <div class="footer-brand" data-i18n="nav_brand"></div>
      <div class="footer-text">© ${year} napell.space. <span data-i18n="footer_rights"></span></div>
      <div class="footer-disclaimer" data-i18n="footer_disclaimer"></div>
      <div class="footer-text" style="margin-top: 16px; color: var(--accent); font-weight: 600;" data-i18n="footer_made"></div>
    </footer>
  `;
}

/* ─── Language Modal Logic ─── */
let selectedModalLang = null;

function selectModalLang(lang) {
  selectedModalLang = lang;
  document.querySelectorAll('.lang-modal-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.lang === lang);
  });
  const btn = document.getElementById('modal-confirm-btn');
  if (btn) btn.disabled = false;
}

function confirmModalLang() {
  if (!selectedModalLang) {
    showToast(I18N.t('err_generic'), 'error');
    return;
  }
  const remember = document.getElementById('modal-remember').checked;
  if (remember) {
    localStorage.setItem('cti-lang', selectedModalLang);
  }
  sessionStorage.setItem('cti-modal-shown', '1');
  I18N.setLang(selectedModalLang);
  I18N.hideModal();
  // Language chosen — now show the brand card (Enter the Space) on the black backdrop
  setTimeout(renderBrandSplash, 500);
}

/* ─── Slogan Splash (front page popup) — sequenced brand moments ─── */
const SPLASH_SEQUENCE = [
  {
    html: 'A narrative of <span class="slogan-data">2 billion</span> coffee drinkers <span class="slogan-data">EVERYDAY</span>',
    sub: 'T H E &nbsp;D A I L Y &nbsp;R I T U A L'
  },
  {
    html: 'We empower the coffee with <span class="slogan-data">DATA</span>',
    sub: 'N A P E L L &nbsp;·&nbsp; S P A C E'
  },
  {
    html: 'We\'re <span class="slogan-data">NAPELL.SPACE</span>',
    sub: 'G R O W &nbsp;·&nbsp; T H E &nbsp;·&nbsp; F U T U R E'
  }
];

/* ─── Splash piano — calm & encouraging, plays only across the splash sequence ───
   Synthesized with Web Audio (no audio file, no licensing). Starts on the
   [Enter the Space] click (a user gesture, so autoplay policies are satisfied),
   loops softly through the three slogans, fades out when the sequence ends. */
const SplashMusic = (() => {
  let ctx = null, master = null, timer = null, playing = false, bar = 0, nextBarTime = 0;
  const BPM = 66, BAR = (60 / BPM) * 4; // ~3.64s per bar
  // I–V–vi–IV in C major — one chord per bar, 8-bar loop
  const PROG = [
    ['C3', 'G3', 'E4'], ['G2', 'D3', 'B3'], ['A2', 'E3', 'C4'], ['F2', 'C3', 'A3'],
    ['C3', 'G3', 'E4'], ['G2', 'D3', 'B3'], ['F2', 'C3', 'A3'], ['G2', 'D3', 'G3']
  ];
  // melody: [note, startBeat, durBeats] — soft, resolving line on top
  const MELODY = [
    [['E5', 0, 2], ['G5', 2, 2]], [['D5', 0, 4]], [['C5', 0, 2], ['E5', 2, 2]], [['A4', 0, 4]],
    [['G5', 0, 2], ['E5', 2, 2]], [['D5', 0, 4]], [['A4', 0, 2], ['C5', 2, 2]], [['B4', 0, 4]]
  ];

  function freq(n) {
    const m = /^([A-G])(#?)(\d)$/.exec(n);
    const semi = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0);
    return 440 * Math.pow(2, (12 * (parseInt(m[3], 10) + 1) + semi - 69) / 12);
  }

  function pluck(t, f, vel, dur) { // piano-ish voice: triangle + soft octave partial
    const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2;
    const g = ctx.createGain(); const g2 = ctx.createGain(); g2.gain.value = 0.35;
    const flt = ctx.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 2400;
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(flt); flt.connect(master);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vel, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o1.start(t); o2.start(t); o1.stop(t + dur + 0.1); o2.stop(t + dur + 0.1);
  }

  function scheduleBar(t, i) {
    const ch = PROG[i % 8];
    [0, 1, 2, 1, 0, 1, 2, 1].forEach((idx, k) => // gentle broken-chord arpeggio
      pluck(t + k * BAR / 8, freq(ch[idx]), 0.10 - k * 0.004, BAR / 4 + 1.2));
    MELODY[i % 8].forEach(([n, beat, dur]) =>
      pluck(t + beat * (BAR / 4), freq(n), 0.075, dur * (BAR / 4) + 1.4));
  }

  function tick() {
    while (nextBarTime < ctx.currentTime + 0.8) { scheduleBar(nextBarTime, bar); bar++; nextBarTime += BAR; }
  }

  function start() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!ctx) {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.setValueAtTime(0.0001, ctx.currentTime);
        master.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 1.2); // minimum sound level
        master.connect(ctx.destination);
        bar = 0; nextBarTime = ctx.currentTime + 0.15;
        tick(); timer = setInterval(tick, 200);
      }
      if (ctx.state === 'suspended') ctx.resume(); // retry after an autoplay block
      playing = true;
    } catch (e) { ctx = null; }
  }

  function stop() {
    if (!playing) return;
    playing = false;
    clearInterval(timer);
    try {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6); // fade out
      setTimeout(() => { try { if (ctx) ctx.close(); } catch (e) {} ctx = null; master = null; }, 1900);
    } catch (e) { ctx = null; }
  }

  return { start, stop };
})();

/* Continue the splash piano across pages — once started it keeps playing
   until the browser closes the tab (no in-page stop). If a new page load
   hits an autoplay block, the first user gesture retries the resume. */
function resumeSplashMusic() {
  if (sessionStorage.getItem('napell-music-muted') === '1') return; // visitor stopped the music
  if (!sessionStorage.getItem('napell-music-on')) return;
  SplashMusic.start();
  const kick = () => {
    SplashMusic.start();
    document.removeEventListener('pointerdown', kick);
    document.removeEventListener('keydown', kick);
    document.removeEventListener('touchstart', kick);
  };
  document.addEventListener('pointerdown', kick);
  document.addEventListener('keydown', kick);
  document.addEventListener('touchstart', kick);
}

/* ─── Music toggle — floating icon so the visitor can stop / restart the piano ─── */
const MUSIC_ON_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
const MUSIC_OFF_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><line x1="2" y1="2" x2="22" y2="22"/></svg>';

function ensureMusicToggle() {
  if (!sessionStorage.getItem('napell-music-on') && !sessionStorage.getItem('napell-music-muted')) return;
  if (document.getElementById('music-toggle')) return;
  const btn = document.createElement('div');
  btn.id = 'music-toggle';
  btn.className = 'music-toggle';
  btn.setAttribute('role', 'button');
  btn.setAttribute('tabindex', '0');
  const render = () => {
    const muted = sessionStorage.getItem('napell-music-muted') === '1';
    btn.innerHTML = muted ? MUSIC_OFF_SVG : MUSIC_ON_SVG;
    btn.setAttribute('aria-label', muted ? 'Play the music' : 'Stop the music');
    btn.classList.toggle('muted', muted);
  };
  const toggle = () => {
    if (sessionStorage.getItem('napell-music-muted') === '1') {
      sessionStorage.removeItem('napell-music-muted');
      SplashMusic.start();
    } else {
      sessionStorage.setItem('napell-music-muted', '1');
      SplashMusic.stop();
    }
    render();
  };
  btn.addEventListener('click', toggle);
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
  render();
  document.body.appendChild(btn);
}

/* Step two — brand card splash (dark glass card on black).
   Click-to-start: the slogan sequence begins only when [ Enter the Space → ] is clicked. */
function renderBrandSplash() {
  if (splashSkipped) return;
  ensureSplashBackdrop();
  const el = document.createElement('div');
  el.className = 'brand-splash';
  el.id = 'brand-splash';
  el.innerHTML = `
    <div class="brand-card">
      <div class="brand-name">N A P E L L</div>
      <div class="brand-divider"></div>
      <div class="brand-line">Coffee, Redefined.</div>
      <div class="brand-line brand-dim">Technology &ndash; Climate &ndash; Finance.</div>
      <div class="brand-line brand-strong">One ecosystem.</div>
      <div class="brand-enter" role="button" tabindex="0" aria-label="Enter the Space">[ Enter the Space &rarr; ]</div>
    </div>`;
  let advanced = false;
  const advance = () => {
    if (advanced) return; // click + keyboard may both fire — advance only once
    advanced = true;
    hideBrandSplash();
    SplashMusic.start(); // piano begins on the enter click — keeps playing until the browser closes the tab
    sessionStorage.setItem('napell-music-on', '1'); // resume on every later page
    ensureMusicToggle(); // floating stop/start icon appears as soon as the music exists
    // enter pressed — the three slogans play next, still on the black backdrop
    startSloganSequence(500);
  };
  const enter = el.querySelector('.brand-enter');
  enter.addEventListener('click', advance);
  enter.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); }
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  // No auto-advance timer — waits for the visitor to click Enter the Space
}

function hideBrandSplash() {
  const el = document.getElementById('brand-splash');
  if (!el) return;
  el.classList.remove('show');
  setTimeout(() => el.remove(), 600);
}

/* The three brand slogans — played AFTER [ Enter the Space ] is clicked. */
function startSloganSequence(delay = 0) {
  if (splashSkipped) return;
  setTimeout(() => renderSloganSplash(0), delay);
}

function renderSloganSplash(step = 0) {
  if (splashSkipped) return;
  const s = SPLASH_SEQUENCE[step];
  if (!s) { // sequence finished — reveal the page; the piano keeps playing
    removeSplashBackdrop();
    return;
  }
  if (step === 0) ensureSplashBackdrop();
  const el = document.createElement('div');
  el.className = 'slogan-splash';
  el.id = 'slogan-splash';
  el.innerHTML = `
    <div class="slogan-splash-inner">
      <div class="slogan-text">${s.html}</div>
      <div class="slogan-sub">${s.sub}</div>
    </div>`;
  let advanced = false;
  const advance = () => {
    if (advanced) return; // click + timer may both fire — advance only once
    advanced = true;
    hideSloganSplash();
    setTimeout(() => renderSloganSplash(step + 1), 650);
  };
  el.addEventListener('click', advance);
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(advance, 4000);
}

function hideSloganSplash() {
  const el = document.getElementById('slogan-splash');
  if (!el) return;
  el.classList.remove('show');
  setTimeout(() => el.remove(), 600);
}

/* Persistent pure-black backdrop covering the WHOLE splash sequence,
   so page content never shows through between the two splash steps. */
let splashSkipped = false;

function ensureSplashBackdrop() {
  if (splashSkipped) return;
  let bd = document.getElementById('splash-backdrop');
  if (!bd) {
    bd = document.createElement('div');
    bd.id = 'splash-backdrop';
    bd.className = 'splash-backdrop';
    document.body.appendChild(bd);
  }
  requestAnimationFrame(() => bd.classList.add('show'));
  ensureSkipIntro();
}

/* [ Skip intro ] — lets a returning reader (or an investor following a link)
   drop the whole entry sequence in one click. */
function ensureSkipIntro() {
  if (splashSkipped || document.getElementById('skip-intro')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'skip-intro';
  btn.className = 'skip-intro';
  btn.setAttribute('data-i18n', 'splash_skip');
  btn.textContent = (typeof I18N !== 'undefined' && I18N.t) ? I18N.t('splash_skip') : 'Skip intro →';
  btn.addEventListener('click', skipIntro);
  document.body.appendChild(btn);
  requestAnimationFrame(() => btn.classList.add('show'));
}

function removeSkipIntro() {
  const btn = document.getElementById('skip-intro');
  if (!btn) return;
  btn.classList.remove('show');
  setTimeout(() => btn.remove(), 300);
}

/* Ends the entry sequence immediately. The visitor's music choice is untouched:
   if they already pressed [ Enter the Space ] the piano keeps playing. */
function skipIntro() {
  splashSkipped = true;
  sessionStorage.setItem('napell-slogan-shown', '1');
  sessionStorage.setItem('cti-modal-shown', '1');
  if (typeof I18N !== 'undefined' && typeof I18N.hideModal === 'function') I18N.hideModal();
  const modal = document.getElementById('lang-modal');
  if (modal) setTimeout(() => modal.remove(), 400);
  hideBrandSplash();
  hideSloganSplash();
  removeSkipIntro();
  removeSplashBackdrop();
}

function removeSplashBackdrop() {
  const bd = document.getElementById('splash-backdrop');
  if (bd) {
    bd.classList.remove('show');
    setTimeout(() => bd.remove(), 600);
  }
  removeSkipIntro();
}

/* Language modal — the first step of the entry sequence (once per session).
   Opening it also lays down the black backdrop so the page stays hidden behind it. */
function showLangModalIfNeeded(delay = 0) {
  if (sessionStorage.getItem('cti-modal-shown')) return;
  if (document.body.dataset.page !== 'vision' && document.body.dataset.page !== 'home') return;
  setTimeout(() => {
    if (splashSkipped || sessionStorage.getItem('cti-modal-shown')) return;
    if (!document.getElementById('lang-modal')) {
      const c = document.getElementById('modal-container');
      if (c) c.innerHTML = renderLangModal();
    }
    ensureSplashBackdrop(); // black behind the modal — the page must not show through
    if (typeof I18N !== 'undefined' && typeof I18N.showModal === 'function') I18N.showModal();
  }, delay);
}

function maybeShowSlogan(delay = 0) {
  // Show ONCE per browser session, on the landing page (Vision is the site entry)
  if (document.body.dataset.page !== 'vision' && document.body.dataset.page !== 'home') return;

  // Deep-link options for links we hand out (mail, deck, chat):
  //   ?lang=zh|en|ar  force the reading language
  //   ?skip=1         straight to the content: no splash, no language modal, no music
  const params = new URLSearchParams(location.search);
  const forced = params.get('lang');
  if (forced && typeof I18N !== 'undefined' && I18N.translations && I18N.translations[forced]) {
    I18N.setLang(forced);
  }
  if (params.get('skip') === '1') {
    splashSkipped = true;
    sessionStorage.setItem('napell-slogan-shown', '1');
    sessionStorage.setItem('cti-modal-shown', '1');
    const mc = document.getElementById('modal-container');
    if (mc) mc.innerHTML = ''; // initPage pre-rendered the modal — drop it with the rest
    removeSplashBackdrop();
    return;
  }

  const splashDone = !!sessionStorage.getItem('napell-slogan-shown');
  const modalDone = !!sessionStorage.getItem('cti-modal-shown');
  if (splashDone && modalDone) {
    // returning visitor — lift the static black cover, page shows normally
    removeSplashBackdrop();
    return;
  }
  // Pure black from the very first paint: nothing shows behind or before the language toggle
  ensureSplashBackdrop();
  if (splashDone) {
    showLangModalIfNeeded(400);
    return;
  }
  sessionStorage.setItem('napell-slogan-shown', '1');
  // Sequence entry: language modal first → brand card (Enter the Space) → three slogans → reveal
  if (!modalDone) {
    showLangModalIfNeeded(delay || 700); // the modal opens itself; the card chains after confirm
  } else {
    setTimeout(renderBrandSplash, delay); // modal already answered this session
  }
}

/* ─── Language Switching ─── */
function switchLang(lang) {
  I18N.setLang(lang);
  closeLangDropdown();
  showToast(I18N.t('dyn_switching'), 'success');
}

function toggleLangDropdown(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('lang-dropdown');
  if (dropdown) dropdown.classList.toggle('show');
}

function closeLangDropdown() {
  const dropdown = document.getElementById('lang-dropdown');
  if (dropdown) dropdown.classList.remove('show');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.lang-switcher')) closeLangDropdown();
});

function toggleMobileNav() {
  const links = document.getElementById('nav-links');
  const btn = document.querySelector('.nav-mobile-toggle');
  if (links) {
    const isOpen = links.classList.toggle('show');
    if (btn) btn.setAttribute('aria-expanded', String(isOpen));
  }
}

function closeMobileNav() {
  const links = document.getElementById('nav-links');
  const btn = document.querySelector('.nav-mobile-toggle');
  if (links) links.classList.remove('show');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

function toggleNavGroup(e, btn) {
  e.preventDefault();
  e.stopPropagation();
  const group = btn.closest('.nav-group');
  if (!group) return;
  const wasOpen = group.classList.contains('open');
  closeNavGroups();
  if (!wasOpen) {
    group.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

function closeNavGroups() {
  document.querySelectorAll('.nav-group.open').forEach(g => {
    g.classList.remove('open');
    const b = g.querySelector('.nav-group-label');
    if (b) b.setAttribute('aria-expanded', 'false');
  });
}

// Close mobile nav when a nav link is clicked (group labels only open their menu)
document.addEventListener('click', (e) => {
  const link = e.target.closest('.nav-link:not(.nav-group-label), .nav-menu-link');
  if (link) closeMobileNav();
  if (!e.target.closest('.nav-group')) closeNavGroups();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeNavGroups();
});

/* ─── Toast Notification ─── */
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/* ─── Dynamic Content Rendering ─── */
window.renderDynamicContent = function(lang) {
  // Re-render nav and footer after language change
  const navContainer = document.getElementById('nav-container');
  const footerContainer = document.getElementById('footer-container');
  const activePage = document.body.dataset.page || 'home';

  if (navContainer) {
    const wasDropdownOpen = document.getElementById('lang-dropdown')?.classList.contains('show');
    navContainer.innerHTML = renderNav(activePage);
    if (wasDropdownOpen) {
      const dd = document.getElementById('lang-dropdown');
      if (dd) dd.classList.add('show');
    }
  }
  if (footerContainer) {
    footerContainer.innerHTML = renderFooter();
  }

  // Translate newly rendered nav/footer elements without triggering recursion
  document.querySelectorAll('#nav-container [data-i18n], #footer-container [data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = I18N.t(key);
    el.textContent = Array.isArray(val) ? val.join(' ') : val;
  });
  document.querySelectorAll('#nav-container [data-i18n-attr], #footer-container [data-i18n-attr]').forEach(el => {
    const pairs = el.getAttribute('data-i18n-attr').split(';');
    pairs.forEach(pair => {
      const [attr, key] = pair.split(':').map(s => s.trim());
      if (attr && key) el.setAttribute(attr, I18N.t(key));
    });
  });

  // Keep language toggle label in sync
  const toggle = document.getElementById('lang-current-label');
  if (toggle) toggle.textContent = I18N.translations[I18N._lang]._lang_label;

  // Highlight active language option
  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === I18N._lang);
  });

  // Page-specific dynamic content
  const page = document.body.dataset.page;
  if (page === 'costs' && typeof renderCostsContent === 'function') {
    if (typeof AUTH === 'undefined' || AUTH.isAuthenticated()) renderCostsContent(lang);
  }
  if (page === 'riyadh' && typeof renderRiyadhContent === 'function') {
    if (typeof AUTH === 'undefined' || AUTH.isAuthenticated()) renderRiyadhContent(lang);
  }
  if (page === 'efficiency' && typeof renderEfficiencyContent === 'function') renderEfficiencyContent(lang);
  if (page === 'value-chain' && typeof renderValueChainContent === 'function') renderValueChainContent(lang);
  if (page === 'collaboration' && typeof renderCollaborationContent === 'function') renderCollaborationContent(lang);
  if (page === 'overview' && typeof renderOverviewContent === 'function') renderOverviewContent(lang);
  if (page === 'home' && typeof renderHomeContent === 'function') renderHomeContent(lang);
};

/* ─── GUARD — content capture deterrents ───
   No client-side measure is absolute, but this blocks casual capture:
   right-click menus, copy/cut, image dragging, save/print/view-source
   shortcuts and common devtools shortcuts. Inputs stay usable. */
const GUARD = window.GUARD = (function () {
  const editable = (t) => t && t.closest && t.closest('input, textarea, select, [contenteditable="true"], .allow-copy');
  function install() {
    try {
      document.addEventListener('contextmenu', (e) => { if (!editable(e.target)) e.preventDefault(); }, { capture: true });
      document.addEventListener('copy', (e) => { if (!editable(e.target)) e.preventDefault(); }, { capture: true });
      document.addEventListener('cut', (e) => { if (!editable(e.target)) e.preventDefault(); }, { capture: true });
      document.addEventListener('dragstart', (e) => {
        if (!editable(e.target) && (e.target.tagName === 'IMG' || e.target.tagName === 'A')) e.preventDefault();
      }, { capture: true });
      document.addEventListener('keydown', (e) => {
        const k = (e.key || '').toLowerCase();
        const combo = e.ctrlKey || e.metaKey;
        if (combo && !editable(e.target) && (k === 's' || k === 'p' || k === 'u')) { e.preventDefault(); return; }
        if (k === 'f12' || (combo && e.shiftKey && (k === 'i' || k === 'j' || k === 'c'))) e.preventDefault();
      }, { capture: true });
    } catch (err) { /* protection must never break the page */ }
  }
  return { install };
})();

/* ─── Telemetry beacon → Cloudflare Worker (/api/track) ───
   The worker enriches each beacon with the visitor's real IP, city/country
   and ASN (client JS cannot see those) and emails daily digests + instant
   login alerts to the site owner. Fails absolutely silently if absent. */
const TRACK = window.TRACK = (function () {
  function session() {
    let sid = sessionStorage.getItem('napell-sid');
    if (!sid) {
      sid = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem('napell-sid', sid);
    }
    return sid;
  }
  function beacon(payload) {
    try {
      payload.sid = session();
      payload.lang = (typeof I18N !== 'undefined' && I18N.getLang) ? I18N.getLang() : '';
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon && typeof navigator.sendBeacon === 'function') {
        navigator.sendBeacon('https://api.napell.space/api/track', body);
      } else if (typeof fetch === 'function') {
        fetch('https://api.napell.space/api/track', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(() => {});
      }
    } catch (e) { /* telemetry must never break the page */ }
  }
  // Outbound / contact links: where traffic leaves the site
  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (/^(https?:|mailto:|tel:)/i.test(href) && href.indexOf('napell.space') === -1) {
      beacon({ t: 'out', u: href });
    }
  }, true);
  return {
    pageview() { beacon({ t: 'pv', p: location.pathname + location.search, r: document.referrer || '(direct)' }); },
    outbound(url) { beacon({ t: 'out', u: url }); },
    login(user, ok) { beacon({ t: 'login', user: String(user || '').slice(0, 60), ok: !!ok }); }
  };
})();

/* ─── Init: inject nav, footer, modal ─── */
function initPage() {
  const activePage = document.body.dataset.page || 'home';

  // Inject nav
  const navContainer = document.getElementById('nav-container');
  if (navContainer) navContainer.innerHTML = renderNav(activePage);

  // Inject footer
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) footerContainer.innerHTML = renderFooter();

  // Inject modal (only if not already shown)
  if (!sessionStorage.getItem('cti-modal-shown')) {
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
      modalContainer.innerHTML = renderLangModal();
    }
  }
}

// Run init after all scripts parsed, then initialize i18n
function runInit() {
  initPage();
  if (typeof I18N !== 'undefined' && typeof I18N.init === 'function') {
    I18N.init();
  } else {
    console.error('[main] I18N not loaded; translations unavailable.');
  }
  // Front page: splash sequence first, language modal chains right after it
  maybeShowSlogan(700);
  // Keep the splash piano playing on every page until the browser closes the tab
  resumeSplashMusic();
  ensureMusicToggle();
  // Visitor telemetry (one beacon per page load — see TRACK above)
  TRACK.pageview();
  // Content capture deterrents (right-click / copy / drag / shortcuts)
  GUARD.install();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runInit);
} else {
  runInit();
}
