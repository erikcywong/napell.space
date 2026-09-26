/**
 * auth.js — Administrator authentication gate for Costs section
 * Uses SHA-256 hash comparison via Web Crypto API (no plaintext stored)
 * Session-scoped: auth persists for current browser session only
 */

const AUTH = {

  // SHA-256 hashes (pre-computed — plaintext never appears in source)
  // Valid admins: erik.wong (32c7...) and James (9345...), same password
  _userHash: '32c71c17cb86286e78764c7f1c6f84f85853deaf9d1f17b03f5e868cd8a1d2a9',
  _userHash2: '9345a35a6fdf174dff7219282a3ae4879790dbb785c70f6fff91e32fafd66eab',
  _passHash: 'b78a31f0e9654801916a1eda6286b3d4b8756d66803ba1b71151f8fd12d7ed10',
  _sessionKey: 'napell-costs-auth',
  _sessionTTL: 30 * 24 * 3600 * 1000,  // auto-login remembered for 30 days

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
   * Persist a successful login (localStorage — survives new tabs, sessions
   * and browser restarts until logout or 30-day expiry).
   */
  _setSession() {
    try { localStorage.setItem(this._sessionKey, String(Date.now())); } catch (e) { /* private mode */ }
  },

  /**
   * Check if the current browser is authenticated
   */
  isAuthenticated() {
    try {
      const raw = localStorage.getItem(this._sessionKey);
      if (!raw) return false;
      const ts = parseInt(raw, 10);
      if (!ts) return false;
      if (Date.now() - ts > this._sessionTTL) {
        localStorage.removeItem(this._sessionKey);
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Attempt login with provided credentials
   * Returns true if valid, false otherwise
   */
  async attemptLogin(username, password) {
    const userHash = await this._sha256(username.trim());
    const passHash = await this._sha256(password);
    if ((userHash === this._userHash || userHash === this._userHash2) && passHash === this._passHash) {
      this._setSession();
      return true;
    }
    return false;
  },

  /**
   * Logout and reload page
   */
  logout() {
    try { localStorage.removeItem(this._sessionKey); } catch (e) { /* ignore */ }
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
        <h2 class="auth-modal-title" id="auth-title" data-i18n="auth_login_title"></h2>
        <p class="auth-modal-desc" id="auth-desc" data-i18n="auth_login_desc"></p>
        <div class="auth-tabs">
          <button type="button" class="auth-tab active" id="auth-tab-login" data-i18n="auth_tab_login"></button>
          <button type="button" class="auth-tab" id="auth-tab-reg" data-i18n="auth_tab_reg"></button>
        </div>
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
        <form id="reg-form" autocomplete="off" onsubmit="return false;" style="display:none;">
          <div class="auth-field">
            <label for="reg-type" data-i18n="auth_reg_type"></label>
            <select id="reg-type">
              <option value="email" data-i18n="auth_type_email"></option>
              <option value="mobile" data-i18n="auth_type_mobile"></option>
              <option value="wechat" data-i18n="auth_type_wechat"></option>
            </select>
          </div>
          <div class="auth-field">
            <label for="reg-name" data-i18n="auth_reg_name"></label>
            <input type="text" id="reg-name" autocomplete="name">
          </div>
          <div class="auth-field">
            <label for="reg-id" id="reg-id-label"></label>
            <input type="text" id="reg-id" autocomplete="off" autocapitalize="none" spellcheck="false">
          </div>
          <div class="auth-field">
            <label for="reg-pass" data-i18n="auth_reg_pass"></label>
            <input type="password" id="reg-pass" autocomplete="new-password">
            <div class="auth-hint" data-i18n="auth_reg_pass_hint"></div>
          </div>
          <div class="auth-error" id="reg-error"></div>
          <button type="submit" class="auth-login-btn" id="reg-submit" data-i18n="auth_reg_btn"></button>
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
        const err1 = document.getElementById('auth-error');
        const err2 = document.getElementById('reg-error');
        for (const el of [err1, err2]) { if (el) { el.textContent = ''; el.style.display = 'none'; } }
      });
    });

    // Tab switching between Sign in and Register
    document.getElementById('auth-tab-login').addEventListener('click', () => this._switchTab('login'));
    document.getElementById('auth-tab-reg').addEventListener('click', () => this._switchTab('reg'));

    // Registration id label follows the selected method
    const regType = document.getElementById('reg-type');
    regType.addEventListener('change', () => this._updateRegIdLabel());
    this._updateRegIdLabel();

    document.getElementById('reg-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleRegister();
    });
  },

  _switchTab(tab) {
    const loginForm = document.getElementById('auth-form');
    const regForm = document.getElementById('reg-form');
    const tabLogin = document.getElementById('auth-tab-login');
    const tabReg = document.getElementById('auth-tab-reg');
    const title = document.getElementById('auth-title');
    const desc = document.getElementById('auth-desc');
    const isReg = tab === 'reg';
    if (loginForm) loginForm.style.display = isReg ? 'none' : '';
    if (regForm) regForm.style.display = isReg ? '' : 'none';
    if (tabLogin) tabLogin.classList.toggle('active', !isReg);
    if (tabReg) tabReg.classList.toggle('active', isReg);
    if (title) title.textContent = I18N.t(isReg ? 'auth_reg_title' : 'auth_login_title');
    if (desc) desc.textContent = I18N.t(isReg ? 'auth_reg_desc' : 'auth_login_desc');
  },

  _updateRegIdLabel() {
    const sel = document.getElementById('reg-type');
    const label = document.getElementById('reg-id-label');
    if (sel && label && typeof I18N !== 'undefined') {
      const key = sel.value === 'email' ? 'auth_id_email' : sel.value === 'mobile' ? 'auth_id_mobile' : 'auth_id_wechat';
      label.textContent = I18N.t(key);
    }
  },

  /**
   * Server-side login (registered accounts). Legacy admin accounts fall back
   * to the local hash check in attemptLogin().
   */
  async _serverLogin(id, pass) {
    try {
      const r = await fetch('https://api.napell.space/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id.toLowerCase(), pass })
      });
      return await r.json();
    } catch (e) {
      return { ok: false };
    }
  },

  /**
   * Handle registration form submission — creates the account on the worker,
   * which emails the owner instantly, then signs the visitor in.
   */
  async _handleRegister() {
    const typeEl = document.getElementById('reg-type');
    const nameEl = document.getElementById('reg-name');
    const idEl = document.getElementById('reg-id');
    const passEl = document.getElementById('reg-pass');
    const errorEl = document.getElementById('reg-error');
    const btn = document.getElementById('reg-submit');

    const type = typeEl ? typeEl.value : 'email';
    const name = nameEl ? nameEl.value.trim() : '';
    const id = idEl ? idEl.value.trim() : '';
    const pass = passEl ? passEl.value : '';

    const fail = (msgKey) => {
      if (errorEl) {
        errorEl.textContent = I18N.t(msgKey);
        errorEl.style.display = 'block';
      }
      if (btn) { btn.disabled = false; btn.textContent = I18N.t('auth_reg_btn'); }
    };

    if (!id || !pass) return fail('auth_reg_fill');
    if (pass.length < 6) return fail('auth_reg_pass_hint');

    if (btn) { btn.disabled = true; btn.textContent = '...'; }

    try {
      const r = await fetch('https://api.napell.space/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, name, pass })
      });
      const j = await r.json();
      if (j && j.ok) {
        this._setSession();
        // Owner gets an instant registration email; log the sign-in too.
        if (window.TRACK) TRACK.login(id, true);
        this.hideLoginModal();
        this.revealContent();
        this._renderCosts();
        return;
      }
      return fail(j && j.error === 'exists' ? 'auth_reg_dup' : 'auth_reg_error');
    } catch (e) {
      return fail('auth_reg_error');
    }
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

    // Legacy admin accounts verify locally; registered accounts verify on the server.
    let valid = await this.attemptLogin(username, password);
    if (!valid) {
      const server = await this._serverLogin(username.trim(), password);
      valid = !!(server && server.ok);
    }

    // Telemetry: report every attempt (username only — never the password).
    // The worker emails the owner instantly on both success and failure.
    if (window.TRACK) TRACK.login(username.trim(), valid);

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
   * Render gated page content (if the matching render function is available)
   * Page-specific render functions are declared in each page's inline script.
   */
  _renderCosts() {
    if (typeof I18N !== 'undefined') {
      const lang = I18N.getLang();
      if (typeof renderRiyadhContent === 'function') renderRiyadhContent(lang);
      else if (typeof renderCostsContent === 'function') renderCostsContent(lang);
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
   * Initialize auth gate on protected pages (costs & riyadh subpage)
   */
  init() {
    const page = document.body.dataset.page;
    const isProtected = page === 'costs' || page === 'riyadh';
    if (!isProtected) return;

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
