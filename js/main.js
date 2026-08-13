/**
 * main.js — Shared logic for all pages
 * Navigation, language switching, dynamic content rendering
 */

/* ─── Navigation Component ─── */
function renderNav(activePage) {
  const pages = [
    { id: 'home', key: 'nav_home', href: 'index.html' },
    { id: 'overview', key: 'nav_overview', href: 'overview.html' },
    { id: 'costs', key: 'nav_costs', href: 'costs.html' },
    { id: 'efficiency', key: 'nav_efficiency', href: 'efficiency.html' },
    { id: 'value-chain', key: 'nav_value_chain', href: 'value-chain.html' },
    { id: 'collaboration', key: 'nav_collaboration', href: 'collaboration.html' }
  ];

  const linksHtml = pages.map(p =>
    `<li><a class="nav-link ${activePage === p.id ? 'active' : ''}" href="${p.href}" data-i18n="${p.key}"></a></li>`
  ).join('');

  return `
    <nav class="navbar">
      <div class="navbar-inner">
        <a href="index.html" class="nav-brand">
          <div class="nav-brand-icon">CI</div>
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
                <span class="lang-option-flag">🇬🇧</span>
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
          <button class="nav-mobile-toggle" onclick="toggleMobileNav()">
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
            <div class="lang-modal-option-flag">🇬🇧</div>
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
      <div class="footer-text"><span data-i18n="footer_ico"></span> · ICO Foundation · www.icofoundation.cn</div>
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
  if (links) links.classList.toggle('show');
}

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

  // Re-apply translations (already done by I18N.apply, but nav/footer were just re-rendered)
  I18N.apply();

  // Page-specific dynamic content
  const page = document.body.dataset.page;
  if (page === 'costs' && typeof renderCostsContent === 'function') renderCostsContent(lang);
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

// Run init before i18n.apply
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initPage();
  });
} else {
  initPage();
}
