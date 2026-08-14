/**
 * auth.js — Administrator authentication gate for Costs section
 * Uses SHA-256 hash comparison via Web Crypto API (no plaintext stored)
 * Session-scoped: auth persists for current browser session only
 */

const AUTH = {

  // SHA-256 hashes (pre-computed — plaintext never appears in source)
  _userHash: 'f166226706d234dbf22ef3eda3a666a9c6a6fb249c193dd38920cc18a953dfb1',
  _passHash: 'b78a31f0e9654801916a1eda6286b3d4b8756d66803ba1b71151f8fd12d7ed10',
  _sessionKey: 'napell-costs-auth',

  /**
   * Hash a string with SHA-256 using Web Crypto API
   */
  async _sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Check if current session is authenticated
   */
  isAuthenticated() {
    return sessionStorage.getItem(this._sessionKey) === '1';
  },

  /**
   * Attempt login with provided credentials
   * Returns true if valid, false otherwise
   */
  async attemptLogin(username, password) {
    const userHash = await this._sha256(username.trim());
    const passHash = await this._sha256(password);
    if (userHash === this._userHash && passHash === this._passHash) {
      sessionStorage.setItem(this._sessionKey, '1');
      return true;
    }
    return false;
  },

  /**
   * Logout and reload page
   */
  logout() {
    sessionStorage.removeItem(this._sessionKey);
    location.reload();
  },

  /**
   * Show the login modal overlay
   */
  showLoginModal() {
    // Remove existing modal if any
    const existing = document.getElementById('auth-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.className = 'auth-modal active';
    modal.innerHTML = `
      <div class="auth-modal-card">
        <div class="auth-modal-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 class="auth-modal-title" data-i18n="auth_login_title"></h2>
        <p class="auth-modal-desc" data-i18n="auth_login_desc"></p>
        <form id="auth-form" autocomplete="off" onsubmit="return false;">
          <div class="auth-field">
            <label for="auth-user" data-i18n="auth_username"></label>
            <input type="text" id="auth-user" autocomplete="off" autocapitalize="none" spellcheck="false" required>
          </div>
          <div class="auth-field">
            <label for="auth-pass" data-i18n="auth_password"></label>
            <input type="password" id="auth-pass" autocomplete="new-password" required>
          </div>
          <div class="auth-error" id="auth-error"></div>
          <button type="submit" class="auth-login-btn" id="auth-submit" data-i18n="auth_login_btn"></button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Translate modal text
    this._translateModal();

    // Focus username field
    setTimeout(() => {
      const userInput = document.getElementById('auth-user');
      if (userInput) userInput.focus();
    }, 100);

    // Handle form submission
    const form = document.getElementById('auth-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleLogin();
    });

    // Clear error on input
    const inputs = modal.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        const errorEl = document.getElementById('auth-error');
        if (errorEl) { errorEl.textContent = ''; errorEl.style.display = 'none'; }
      });
    });
  },

  /**
   * Translate the modal using i18n
   */
  _translateModal() {
    if (typeof I18N === 'undefined') return;
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = I18N.t(key);
      if (val && val !== key) el.textContent = val;
    });
  },

  /**
   * Handle login form submission
   */
  async _handleLogin() {
    const userInput = document.getElementById('auth-user');
    const passInput = document.getElementById('auth-pass');
    const errorEl = document.getElementById('auth-error');
    const btn = document.getElementById('auth-submit');

    const username = userInput ? userInput.value : '';
    const password = passInput ? passInput.value : '';

    if (!username || !password) {
      if (errorEl) {
        errorEl.textContent = I18N.t('auth_login_error');
        errorEl.style.display = 'block';
      }
      return;
    }

    // Disable button during verification
    if (btn) { btn.disabled = true; btn.textContent = '...'; }

    const valid = await this.attemptLogin(username, password);

    if (valid) {
      this.hideLoginModal();
      this.revealContent();
      this._renderCosts();
    } else {
      // Show error
      if (errorEl) {
        errorEl.textContent = I18N.t('auth_login_error');
        errorEl.style.display = 'block';
      }
      // Shake animation
      const card = document.querySelector('.auth-modal-card');
      if (card) {
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 500);
      }
      // Clear password
      if (passInput) { passInput.value = ''; passInput.focus(); }
      // Re-enable button
      if (btn) { btn.disabled = false; btn.textContent = I18N.t('auth_login_btn'); }
    }
  },

  /**
   * Hide and remove the login modal
   */
  hideLoginModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.remove();
    document.body.style.overflow = '';
  },

  /**
   * Reveal the page content (was hidden)
   */
  revealContent() {
    const content = document.querySelector('.page-content');
    if (content) content.style.display = '';
  },

  /**
   * Render costs content (if function available)
   */
  _renderCosts() {
    if (typeof renderCostsContent === 'function' && typeof I18N !== 'undefined') {
      renderCostsContent(I18N.getLang());
    }
    // Add logout button
    this._injectLogoutBtn();
  },

  /**
   * Inject a small logout button at top of content
   */
  _injectLogoutBtn() {
    const content = document.querySelector('.page-content');
    if (!content) return;
    // Remove existing logout button
    const existing = document.getElementById('auth-logout-btn');
    if (existing) existing.remove();

    const btn = document.createElement('button');
    btn.id = 'auth-logout-btn';
    btn.className = 'auth-logout-btn';
    btn.textContent = (typeof I18N !== 'undefined' && I18N.t('auth_logout')) || 'Logout';
    btn.onclick = () => this.logout();
    content.insertBefore(btn, content.firstChild);
  },

  /**
   * Initialize auth gate on costs page
   */
  init() {
    const isCostsPage = document.body.dataset.page === 'costs';
    if (!isCostsPage) return;

    if (this.isAuthenticated()) {
      // Already authed — reveal content and render
      this.revealContent();
      this._renderCosts();
    } else {
      // Not authed — show login modal (content is hidden via inline style)
      this.showLoginModal();
    }
  }
};

// Initialize on DOMContentLoaded (ensures all scripts parsed)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AUTH.init());
} else {
  // DOM ready — use setTimeout to ensure inline script has executed
  setTimeout(() => AUTH.init(), 0);
}

// Re-translate modal on language change
if (typeof I18N !== 'undefined') {
  I18N.onChange(() => {
    const modal = document.getElementById('auth-modal');
    if (modal) AUTH._translateModal();
    const logoutBtn = document.getElementById('auth-logout-btn');
    if (logoutBtn && typeof I18N !== 'undefined') {
      logoutBtn.textContent = I18N.t('auth_logout');
    }
  });
}
