// script.js - Final version with right->left initial animation
// Notes: initial page loads now animate from right to left. When router loads a fragment
// and page === 'dashboard', that panel will animate from the right as well.

(function () {
  'use strict';

  /* ---------------------------
     Config
  --------------------------- */
  const USER_API_URL = '/api/user'; // change to your actual endpoint if different
  const ENTER_CLASS = 'dash_page--enter';
  const EXIT_CLASS = 'dash_page--exit';
  const ANIM_FLAG = 'is-animating';

  const FETCH_TIMEOUT_MS = 8000;
  const FETCH_HARD_TIMEOUT = 15000;
  const SHOW_MIN_LOADING_MS = 350;

  const THEME_KEY = 'dash.theme'; // 'dark' | 'light'

  /* ---------------------------
     DOM refs
  --------------------------- */
  const main = document.getElementById('dash_main');
  if (!main) return;
  const mainInner = document.getElementById('dash_main_inner');

  const loader = document.getElementById('dash_loader');
  const errorPanel = document.getElementById('dash_error');
  const errorMessageEl = document.getElementById('dash_error_message');
  const errorRetryBtn = document.getElementById('dash_error_retry');
  const errorCloseBtn = document.getElementById('dash_error_close');

  // theme controls
  const themeToggleBtn = document.getElementById('dash_theme_toggle');

  // profile / balances
  const avatarImg = document.getElementById('dash_avatar_img');
  const avatarInitials = document.getElementById('dash_avatar_initials');
  const profileNameEl = document.getElementById('dash_profile_name');
  const profileEmailEl = document.getElementById('dash_profile_email');

  const balanceValueEl = document.getElementById('dash_balance_value');
  const airtimeValueEl = document.getElementById('dash_airtime_value');
  const dataValueEl = document.getElementById('dash_data_value');
  const networkNameEl = document.getElementById('dash_network_name');
  const planNameEl = document.getElementById('dash_plan_name');

  const eyeBtn = document.getElementById('dash_eye_btn');
  const eyeIcon = document.getElementById('dash_eye_icon');

  /* ---------------------------
     State
  --------------------------- */
  let currentPanel = mainInner.querySelector('.dash_page[data-page]') || null;
  // NOTE: Do not add ENTER_CLASS immediately — we want to control initial animation timing
  const fragmentCache = new Map();
  let currentAbortController = null;
  let inflight = null;

  const BALANCE_HIDDEN_KEY = 'dash.balanceHidden';
  function isBalanceHidden() { return localStorage.getItem(BALANCE_HIDDEN_KEY) === 'true'; }
  function setBalanceHidden(v) { localStorage.setItem(BALANCE_HIDDEN_KEY, v ? 'true' : 'false'); }

  /* ---------------------------
     Theme helpers
  --------------------------- */
  function getSavedTheme() {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'light' || v === 'dark') return v;
    return 'light';
  }
  function applyTheme(theme) {
    const body = document.body;
    if (theme === 'light') body.classList.add('dash-theme-light');
    else body.classList.remove('dash-theme-light');

    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      themeToggleBtn.textContent = theme === 'light' ? 'Light' : 'Dark';
    }
    localStorage.setItem(THEME_KEY, theme);
  }
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', (e) => {
      const current = getSavedTheme();
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
    });
  }
  // apply initial theme early
  applyTheme(getSavedTheme());

  /* ---------------------------
     Loader & error helpers
  --------------------------- */
  function showLoader(message = 'Loading…') {
    if (!loader) return;
    const t = loader.querySelector('.dash_loader_text');
    if (t) t.textContent = message;
    loader.setAttribute('aria-hidden', 'false');
  }
  function hideLoader() { if (!loader) return; loader.setAttribute('aria-hidden', 'true'); }

  function addUserError(message, options = {}) {
    if (!errorPanel) return;
    errorMessageEl.textContent = message || 'Please check your network connection and try again.';
    errorPanel.setAttribute('aria-hidden', 'false');

    function onRetry(e) { e.preventDefault(); errorPanel.setAttribute('aria-hidden', 'true'); if (typeof options.retryCallback === 'function') options.retryCallback(); }
    function onClose(e) { e.preventDefault(); errorPanel.setAttribute('aria-hidden', 'true'); }

    errorRetryBtn.onclick = onRetry;
    errorCloseBtn.onclick = onClose;
  }

  /* ---------------------------
     Fragment fetching logic (folder-based)
  --------------------------- */
  function candidatePaths(original) {
    const c = [];
    if (!original) return c;
    const t = original.trim();
    c.push(t);

    if (t.endsWith('/')) {
      const base = t.replace(/\/$/, '');
      c.push(base + '/' + base.split('/').pop() + '.html');
      c.push(base + '.html');
    } else {
      const last = t.split('/').pop();
      if (last.indexOf('.') > -1) {
        const baseName = last.replace(/\.html$/i, '');
        if (t.indexOf('/') > -1) {
          c.push(baseName + '.html');
          c.push(baseName + '/' + last);
        } else {
          c.push(baseName + '/' + last);
        }
      } else {
        const base = last;
        c.push(base + '/' + base + '.html');
        c.push(base + '.html');
      }
    }
    return [...new Set(c)];
  }

  async function fetchWithAttempts(url) {
    if (fragmentCache.has(url)) return fragmentCache.get(url).cloneNode(true);

    const candidates = candidatePaths(url);
    let lastErr = null;

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      if (fragmentCache.has(candidate)) return fragmentCache.get(candidate).cloneNode(true);

      const controller = new AbortController();
      const signal = controller.signal;
      const hardTimer = setTimeout(() => controller.abort(), FETCH_HARD_TIMEOUT);

      try {
        const res = await fetch(candidate, { cache: 'no-cache', signal });
        clearTimeout(hardTimer);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const text = await res.text();
        const container = document.createElement('div');
        container.innerHTML = text.trim();
        const el = container.firstElementChild || container;
        fragmentCache.set(candidate, el.cloneNode(true));
        return el;
      } catch (err) {
        clearTimeout(hardTimer);
        lastErr = err;
        if (err.name === 'AbortError') throw err;
      }
    }
    throw lastErr || new Error('Failed to load: ' + url);
  }

  function transitionPanels(newPanel) {
    return new Promise(resolve => {
      const old = currentPanel;
      newPanel.classList.add('dash_page', 'is-animating');
      newPanel.classList.remove(ENTER_CLASS, EXIT_CLASS);

      // ensure from-right stays if present; the transform transition will animate from whichever transform is active
      mainInner.appendChild(newPanel);
      void newPanel.offsetWidth;
      newPanel.classList.add(ENTER_CLASS);

      if (!old) {
        newPanel.addEventListener('transitionend', function onEnd(e) {
          if (e.propertyName === 'transform') {
            newPanel.removeEventListener('transitionend', onEnd);
            newPanel.classList.remove('is-animating');
            // cleanup from-right if it was used
            newPanel.classList.remove('dash_page--from-right');
            currentPanel = newPanel;
            resolve();
          }
        });
        return;
      }

      old.classList.remove(ENTER_CLASS);
      old.classList.add(EXIT_CLASS, 'is-animating');

      let done = 0;
      function ready() {
        done += 1;
        if (done >= 2) {
          try { if (old && old.parentNode) old.parentNode.removeChild(old); } catch (e) {}
          newPanel.classList.remove('is-animating');
          // cleanup modifier
          newPanel.classList.remove('dash_page--from-right');
          currentPanel = newPanel;
          resolve();
        }
      }

      newPanel.addEventListener('transitionend', function onNew(e) {
        if (e.propertyName === 'transform') { newPanel.removeEventListener('transitionend', onNew); ready(); }
      });
      old.addEventListener('transitionend', function onOld(e) {
        if (e.propertyName === 'transform') { old.removeEventListener('transitionend', onOld); ready(); }
      });

      setTimeout(() => {
        if (currentPanel !== newPanel) {
          try { if (old && old.parentNode) old.parentNode.removeChild(old); } catch (e) {}
          newPanel.classList.remove('is-animating');
          newPanel.classList.remove('dash_page--from-right');
          currentPanel = newPanel;
          resolve();
        }
      }, 700);
    });
  }

  function setActiveNavImmediate(page) {
    const all = document.querySelectorAll('.dash_menu_item');
    all.forEach(b => {
      if (b.dataset.page === page) { b.classList.add('dash_menu_item--active'); b.setAttribute('aria-current', 'page'); }
      else { b.classList.remove('dash_menu_item--active'); b.removeAttribute('aria-current'); }
    });
  }

  async function navigate({ url, page, push = true } = {}) {
    if (!url) return;
    if (page) setActiveNavImmediate(page);

    if (currentAbortController) {
      try { currentAbortController.abort(); } catch (e) {}
      currentAbortController = null;
    }
    currentAbortController = new AbortController();
    const overallSignal = currentAbortController.signal;

    let loaderShown = false;
    const loaderTimer = setTimeout(() => { loaderShown = true; showLoader('Loading section…'); }, 120);
    const escalateTimer = setTimeout(() => { if (loaderShown) showLoader('Still loading — check your connection or try again.'); }, FETCH_TIMEOUT_MS);
    const fetchStart = Date.now();

    inflight = (async () => {
      try {
        const fragEl = await fetchWithAttempts(url);
        if (!fragEl.dataset.page) fragEl.dataset.page = page || url;
        fragEl.setAttribute('tabindex', '-1');

        // If loading dashboard fragment, animate it in from the right
        if (fragEl && fragEl.dataset.page === 'dashboard') {
          fragEl.classList.add('dash_page--from-right');
        }

        const elapsed = Date.now() - fetchStart;
        const wait = Math.max(0, SHOW_MIN_LOADING_MS - elapsed);
        if (loaderShown && wait > 0) await new Promise(r => setTimeout(r, wait));

        await transitionPanels(fragEl);
        setActiveNavImmediate(fragEl.dataset.page);
        fragEl.focus({ preventScroll: true });

        if (push) history.pushState({ url, page: fragEl.dataset.page }, '', `#${fragEl.dataset.page}`);
      } catch (err) {
        if (err && err.name === 'AbortError') return;
        const msg = (err && err.message && /404|HTTP/.test(err.message)) ?
          'This section could not be found (404). Please refresh or contact support.' :
          'Could not load content. Check your network connection and try again.';
        addUserError(msg, { retryCallback: () => navigate({ url, page, push: true }) });
        console.error('navigate error', err);
      } finally {
        clearTimeout(loaderTimer);
        clearTimeout(escalateTimer);
        if (loaderShown) hideLoader();
        currentAbortController = null;
        inflight = null;
      }
    })();

    await inflight;
  }

  /* ---------------------------
     Click behaviors (FULL-PAGE NAV)
     - Normal click -> FULL PAGE NAVIGATION to fragment path (folder/file.html)
     - Programmatic SPA navigation still available via dashRouter.navigateTo(...)
  --------------------------- */
  document.addEventListener('click', (e) => {
    const menuBtn = e.target.closest('.dash_menu_item');
    if (menuBtn && menuBtn.dataset.fragment) {
      // perform full navigation to file path
      const target = menuBtn.dataset.fragment;
      if (target) {
        setActiveNavImmediate(menuBtn.dataset.page);
        window.location.href = target;
      }
      return;
    }

    const actionBtn = e.target.closest('.dash_action_tile');
    if (actionBtn && actionBtn.dataset.fragment) {
      const target = actionBtn.dataset.fragment;
      if (target) {
        actionBtn.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }], { duration: 260, easing: 'ease-out' });
        const targetPage = actionBtn.dataset.page;
        const correspondingNav = document.querySelector(`.dash_menu_item[data-page="${targetPage}"]`);
        if (correspondingNav) setActiveNavImmediate(targetPage);
        window.location.href = target;
      }
      return;
    }
  });

  // pointerenter prefetch
  document.addEventListener('pointerenter', (e) => {
    const btn = e.target.closest('.dash_menu_item, .dash_action_tile');
    if (!btn || !btn.dataset || !btn.dataset.fragment) return;
    fetchWithAttempts(btn.dataset.fragment).catch(()=>{});
  }, { capture: true });

  // popstate handling (kept for programmatic SPA)
  window.addEventListener('popstate', (ev) => {
    const state = ev.state;
    if (state && state.url) navigate({ url: state.url, page: state.page, push: false });
    else {
      const hash = location.hash && location.hash.replace('#', '');
      if (hash) {
        const btn = document.querySelector(`.dash_menu_item[data-page="${hash}"]`);
        if (btn && btn.dataset.fragment) navigate({ url: btn.dataset.fragment, page: hash, push: false });
      }
    }
  });

  // initial load actions
  window.addEventListener('DOMContentLoaded', () => {
    const hash = location.hash && location.hash.replace('#', '');
    if (hash) {
      const btn = document.querySelector(`.dash_menu_item[data-page="${hash}"]`);
      if (btn && btn.dataset.fragment) navigate({ url: btn.dataset.fragment, page: hash, push: false });
    } else {
      const initialPage = currentPanel && currentPanel.dataset.page;
      if (initialPage) {
        // Apply from-right modifier so initial page animates from right -> left on load
        currentPanel.classList.add('dash_page--from-right');
        // force reflow then apply enter to trigger transition
        void currentPanel.offsetWidth;
        currentPanel.classList.add(ENTER_CLASS);
        setActiveNavImmediate(initialPage);
      }
    }

    // init profile/balances and eye toggle and theme state
    initProfileAndBalances();
    applyBalanceVisibility(isBalanceHidden());
    applyTheme(getSavedTheme());
  });

  // bell interaction
  const bell = document.getElementById('dash_bell');
  if (bell) {
    bell.addEventListener('click', (ev) => {
      ev.preventDefault();
      bell.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(0deg)' }], { duration: 360, easing: 'ease-out' });
    });
  }

  /* ---------------------------
     PROFILE + BALANCES (backend integration)
  --------------------------- */
  async function initProfileAndBalances() {
    const placeholders = {
      firstName: 'First',
      lastName: 'Last',
      email: 'email@example.com',
      avatarUrl: '',
      balance: 0.00,
      airtime: 0,
      data: '0.0GB',
      network: '—',
      plan: '—'
    };

    function renderUser(u) {
      const fullName = (u.firstName && u.lastName) ? `${u.firstName} ${u.lastName}` : (u.firstName || u.lastName || 'First Last');
      profileNameEl.textContent = u.firstName || fullName;
      profileEmailEl.textContent = u.email || placeholders.email;

      if (u.avatarUrl) {
        avatarImg.src = u.avatarUrl;
        avatarImg.style.display = 'block';
        avatarInitials.style.display = 'none';
      } else {
        avatarImg.src = '';
        avatarImg.style.display = 'none';
        const initials = ((u.firstName || '').charAt(0) + (u.lastName || '').charAt(0)).toUpperCase() || 'OJ';
        avatarInitials.textContent = initials;
        avatarInitials.style.display = 'flex';
      }

      setBalanceValue(balanceValueEl, u.balance);
      setBalanceValue(airtimeValueEl, u.airtime, true);
      setDataValue(dataValueEl, u.data);

      networkNameEl.textContent = u.network || placeholders.network;
      planNameEl.textContent = u.plan || placeholders.plan;
    }

    function formatNaira(amount) {
      if (amount === null || amount === undefined || isNaN(Number(amount))) return '₦0.00';
      const n = Number(amount);
      return '₦' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function setBalanceValue(el, amount, isAirtime = false) {
      const hidden = isBalanceHidden();
      if (hidden) {
        el.textContent = '*****';
        el.classList.add('dash-hidden');
      } else {
        el.classList.remove('dash-hidden');
        if (isAirtime) {
          el.textContent = '₦' + (isNaN(Number(amount)) ? '0' : Number(amount).toLocaleString());
        } else {
          el.textContent = formatNaira(amount);
        }
      }
    }

    function setDataValue(el, dataVal) {
      const hidden = isBalanceHidden();
      if (hidden) {
        el.textContent = '*****';
        el.classList.add('dash-hidden');
      } else {
        el.classList.remove('dash-hidden');
        el.textContent = dataVal || '0.0GB';
      }
    }

    try {
      const res = await fetch(USER_API_URL, { cache: 'no-cache' });
      if (res.ok) {
        const json = await res.json();
        const user = {
          firstName: json.firstName || json.first_name || placeholders.firstName,
          lastName: json.lastName || json.last_name || '',
          email: json.email || placeholders.email,
          avatarUrl: json.avatarUrl || json.avatar_url || '',
          balance: (json.balance !== undefined ? json.balance : placeholders.balance),
          airtime: (json.airtime !== undefined ? json.airtime : placeholders.airtime),
          data: (json.data !== undefined ? json.data : placeholders.data),
          network: json.network || placeholders.network,
          plan: json.plan || placeholders.plan
        };
        renderUser(user);
        return;
      } else {
        renderUser(placeholders);
      }
    } catch (err) {
      renderUser(placeholders);
    }
  }

  /* ---------------------------
     Eye toggle for balances
  --------------------------- */
  function applyBalanceVisibility(hidden) {
    setBalanceHidden(hidden);
    const allAmountEls = [balanceValueEl, airtimeValueEl, dataValueEl];
    if (hidden) {
      allAmountEls.forEach(el => { el.textContent = '*****'; el.classList.add('dash-hidden'); });
      eyeBtn.setAttribute('aria-pressed', 'true');
      eyeIcon.innerHTML = '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><path d="M3 3l18 18"></path>';
    } else {
      eyeBtn.setAttribute('aria-pressed', 'false');
      eyeIcon.innerHTML = '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>';
      initProfileAndBalances();
    }
  }
  if (eyeBtn) {
    eyeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const curr = isBalanceHidden();
      applyBalanceVisibility(!curr);
    });
  }

  /* ---------------------------
     Expose dashRouter API (programmatic SPA use)
  --------------------------- */
  window.dashRouter = {
    navigateTo: (fragmentUrl, pageKey) => navigate({ url: fragmentUrl, page: pageKey, push: true }),
    preload: (url) => fetchWithAttempts(url).catch(()=>{}),
    clearCache: () => fragmentCache.clear(),
    addUserError: addUserError
  };

})();