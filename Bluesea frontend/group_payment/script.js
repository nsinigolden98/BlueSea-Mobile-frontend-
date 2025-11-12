// script.js — updated: theme persistence + icons + tab switching + profile fallback

(function () {
  const THEME_KEY = 'gs.theme'; // 'light' or 'dark'
  const PANEL_ENTER_CLASS = 'gs-panel-enter';

  function getSavedTheme() {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'light' || v === 'dark') return v;
    return 'light';
  }
  function applyTheme(theme) {
    if (theme === 'light') document.body.classList.add('dash-theme-light');
    else document.body.classList.remove('dash-theme-light');
    localStorage.setItem(THEME_KEY, theme);
    updateThemeIcons(theme);
  }

  function updateThemeIcons(theme) {
    const isLight = theme === 'light';
    const sun = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>';
    const moon = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" fill="currentColor"/></svg>';
    const iconMain = document.getElementById('gs-theme-icon');
    const iconHead = document.getElementById('gs-theme-icon-header');
    if (iconMain) iconMain.outerHTML = isLight ? sun : moon;
    if (iconHead) iconHead.outerHTML = isLight ? sun : moon;
  }

  function runPanelEnter(panelEl) {
    if (!panelEl) return;
    panelEl.classList.remove(PANEL_ENTER_CLASS);
    setTimeout(() => panelEl.classList.add(PANEL_ENTER_CLASS), 40);
  }

  function switchToTab(tabName) {
    const createSection = document.getElementById('gs-section-create');
    const joinSection = document.getElementById('gs-section-join');
    const tabs = document.querySelectorAll('.gs-tab');

    tabs.forEach(t => {
      const isActive = t.dataset.tab === tabName;
      t.classList.toggle('gs-tab-active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (tabName === 'create') {
      joinSection.classList.add('hidden');
      joinSection.setAttribute('aria-hidden', 'true');
      setTimeout(() => {
        createSection.classList.remove('hidden');
        createSection.setAttribute('aria-hidden', 'false');
      }, 60);
    } else {
      createSection.classList.add('hidden');
      createSection.setAttribute('aria-hidden', 'true');
      setTimeout(() => {
        joinSection.classList.remove('hidden');
        joinSection.setAttribute('aria-hidden', 'false');
      }, 60);
    }

    const panel = document.getElementById('gs-panel');
    if (panel) {
      panel.classList.remove(PANEL_ENTER_CLASS);
      setTimeout(() => panel.classList.add(PANEL_ENTER_CLASS), 30);
    }
  }

  // Profile image fallback: if image fails, show initials
  function initProfileImageFallback() {
    const avatarImg = document.getElementById('gs-avatar-img');
    const initialsEl = document.getElementById('gs-avatar-initials');
    if (!avatarImg || !initialsEl) return;
    avatarImg.addEventListener('error', () => {
      avatarImg.style.display = 'none';
      initialsEl.style.display = 'flex';
    });
    // if image loads, hide initials
    avatarImg.addEventListener('load', () => {
      if (avatarImg.naturalWidth && avatarImg.naturalHeight) initialsEl.style.display = 'none';
    });
    // initial check
    setTimeout(() => {
      if (!avatarImg.complete || (avatarImg.naturalWidth === 0 && avatarImg.naturalHeight === 0)) {
        // not loaded or failed
        avatarImg.style.display = 'none';
        initialsEl.style.display = 'flex';
      } else {
        avatarImg.style.display = 'block';
        initialsEl.style.display = 'none';
      }
    }, 50);
  }

  document.addEventListener('DOMContentLoaded', function () {
    const panel = document.getElementById('gs-panel');

    // Apply saved theme early
    applyTheme(getSavedTheme());

    // Run panel enter
    if (panel) setTimeout(() => runPanelEnter(panel), 80);

    // Theme toggles in sidebar & header
    const themeToggle = document.getElementById('gs-theme-toggle');
    const themeToggleHeader = document.getElementById('gs-theme-toggle-header');
    [themeToggle, themeToggleHeader].forEach(btn => {
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const next = getSavedTheme() === 'light' ? 'dark' : 'light';
        applyTheme(next);
      });
    });

    // Tabs
    const tabButtons = Array.from(document.querySelectorAll('.gs-tab'));
    tabButtons.forEach(btn => btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (tab) switchToTab(tab);
    }));

    // Sidebar link replay
    const groupLink = document.querySelector('.gs-link-group-payments');
    if (groupLink) {
      groupLink.addEventListener('click', function (ev) {
        const href = groupLink.getAttribute('href') || '';
        const current = location.pathname.split('/').pop() || 'GoPayment.html';
        if (href.toLowerCase().endsWith(current.toLowerCase()) || href === '' || href === '#') {
          ev.preventDefault();
          runPanelEnter(panel);
          history.replaceState(null, '', href);
        }
      });
    }

    // Buttons micro-animations
    const createBtn = document.getElementById('gs-create-btn');
    if (createBtn) createBtn.addEventListener('click', (ev) => { ev.preventDefault(); createBtn.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-4px)' }, { transform: 'translateY(0)' }], { duration: 260, easing: 'ease-out' }); });

    const joinBtn = document.getElementById('gs-join-btn');
    if (joinBtn) joinBtn.addEventListener('click', (ev) => { ev.preventDefault(); joinBtn.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-4px)' }, { transform: 'translateY(0)' }], { duration: 260, easing: 'ease-out' }); });

    // Nav active visual
    const navLinks = Array.from(document.querySelectorAll('.gs-nav-link'));
    navLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        const href = link.getAttribute('href') || '';
        const current = location.pathname.split('/').pop();
        if (href && href.split('/').pop() === current) {
          e.preventDefault();
          navLinks.forEach(l => l.classList.remove('gs-active'));
          link.classList.add('gs-active');
        }
      });
    });

    // Ensure initial tab is create
    const initialTab = document.querySelector('.gs-tab.gs-tab-active') || document.querySelector('.gs-tab[data-tab="create"]');
    if (initialTab) initialTab.click();

    // profile fallback init
    initProfileImageFallback();
  });

})();