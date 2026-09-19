/**
 * main.js — Shared logic for all pages
 * Navigation, language switching, dynamic content rendering
 */

/* ─── Navigation Component ─── */
function renderNav(activePage) {
  const pages = [
    { id: 'vision', key: 'nav_vision', href: 'vision.html' },
    { id: 'home', key: 'nav_home', href: 'index.html?home=1' },
    { id: 'collaboration', key: 'nav_collaboration', href: 'collaboration.html' },
    { id: 'overview', key: 'nav_overview', href: 'overview.html' },
    { id: 'value-chain', key: 'nav_value_chain', href: 'value-chain.html' },
    { id: 'efficiency', key: 'nav_efficiency', href: 'efficiency.html' },
    { id: 'costs', key: 'nav_costs', href: 'costs.html' },
    { id: 'gallery', key: 'nav_gallery', href: 'gallery.html' },
    { id: 'contact', key: 'nav_contact', href: 'contact.html' }
  ];

  // The Riyadh deployment subpage is nested under Costs — highlight Costs as active
  const act = activePage === 'riyadh' ? 'costs' : activePage;

  const linksHtml = pages.map(p =>
    `<li><a class="nav-link ${act === p.id ? 'active' : ''} ${p.id === 'costs' ? 'nav-link-locked' : ''}" href="${p.href}" data-i18n="${p.key}"></a></li>`
  ).join('');

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
  }
];

function renderSloganSplash(step = 0) {
  const s = SPLASH_SEQUENCE[step];
  if (!s) { // sequence finished — remove backdrop, then chain to the language modal
    removeSplashBackdrop();
    showLangModalIfNeeded(400);
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
function ensureSplashBackdrop() {
  let bd = document.getElementById('splash-backdrop');
  if (!bd) {
    bd = document.createElement('div');
    bd.id = 'splash-backdrop';
    bd.className = 'splash-backdrop';
    document.body.appendChild(bd);
  }
  requestAnimationFrame(() => bd.classList.add('show'));
}

function removeSplashBackdrop() {
  const bd = document.getElementById('splash-backdrop');
  if (!bd) return;
  bd.classList.remove('show');
  setTimeout(() => bd.remove(), 600);
}

/* Chain: after the splash sequence ends, show the language modal (once per session). */
function showLangModalIfNeeded(delay = 0) {
  if (sessionStorage.getItem('cti-modal-shown')) return;
  setTimeout(() => {
    // Splash still on screen (playing or backdrop fading out) — check again shortly
    if (document.getElementById('slogan-splash') || document.getElementById('splash-backdrop')) {
      showLangModalIfNeeded(300);
      return;
    }
    if (!document.getElementById('lang-modal')) {
      const c = document.getElementById('modal-container');
      if (c) c.innerHTML = renderLangModal();
    }
    if (typeof I18N !== 'undefined' && typeof I18N.showModal === 'function') I18N.showModal();
  }, delay);
}

function maybeShowSlogan(delay = 0) {
  // Show ONCE per browser session, on the landing page (Vision is the site entry)
  if (document.body.dataset.page !== 'vision' && document.body.dataset.page !== 'home') return;
  if (sessionStorage.getItem('napell-slogan-shown')) {
    // Splash already played this session — go straight to the language modal if pending
    showLangModalIfNeeded(400);
    return;
  }
  if (sessionStorage.getItem('napell-slogan-shown')) return;
  sessionStorage.setItem('napell-slogan-shown', '1');
  setTimeout(renderSloganSplash, delay);
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

// Close mobile nav when a nav link is clicked
document.addEventListener('click', (e) => {
  const link = e.target.closest('.nav-link');
  if (link) closeMobileNav();
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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runInit);
} else {
  runInit();
}
