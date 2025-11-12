/* data/script.js
   - Renders plans (8 per tab)
   - Keeps constant 4-column grid (CSS)
   - Theme toggle (sync key dash.theme)
   - Tab underline positioning & interactions
   - Phone input: digits-only enforcement + maxlength=11
   - SVG badge is decorative (no click behavior)
*/

(function () {
  'use strict';

  const THEME_KEY = 'dash.theme';

  // DOM refs
  const panel = document.getElementById('data_panel');
  const planGrid = document.getElementById('plan_grid');
  const tabs = Array.from(document.querySelectorAll('.data_tab'));
  const tabUnderline = document.getElementById('tab_underline');
  const networkBtns = Array.from(document.querySelectorAll('.data_network_btn'));
  const summaryNetwork = document.getElementById('summary_network');
  const summaryPlan = document.getElementById('summary_plan');
  const summaryRecipient = document.getElementById('summary_recipient');
  const recipientInput = document.getElementById('recipient_phone');
  const buyNow = document.getElementById('buy_now');
  const smartTopup = document.getElementById('smart_topup');
  const themeToggleBtn = document.getElementById('data_theme_toggle');
  const notificationsBtn = document.getElementById('notifications_btn');

  const state = {
    network: 'MTN',
    planTab: 'Daily',
    selectedPlanId: null,
    phone: ''
  };

  const PLANS = {
    Daily: [
      { id: 'd1', size: '100MB', desc: '100MB data + 30s call', price: 50, validity: '1 Day' },
      { id: 'd2', size: '200MB', desc: '200MB data + 1 min call', price: 100, validity: '1 Day' },
      { id: 'd3', size: '500MB', desc: '500MB data + 2 mins call', price: 200, validity: '1 Day' },
      { id: 'd4', size: '1GB', desc: '1GB data + 1.5 mins talktime', price: 500, validity: '1 Day' },
      { id: 'd5', size: '1.5GB', desc: '1.5GB data', price: 700, validity: '1 Day' },
      { id: 'd6', size: '2GB', desc: '2GB data', price: 900, validity: '1 Day' },
      { id: 'd7', size: '3GB', desc: '3GB data', price: 1200, validity: '1 Day' },
      { id: 'd8', size: '5GB', desc: '5GB data', price: 1800, validity: '1 Day' }
    ],
    Weekly: [
      { id: 'w1', size: '500MB', desc: 'Weekly 500MB', price: 250, validity: '7 Days' },
      { id: 'w2', size: '1GB', desc: 'Weekly 1GB', price: 500, validity: '7 Days' },
      { id: 'w3', size: '2GB', desc: 'Weekly 2GB', price: 900, validity: '7 Days' },
      { id: 'w4', size: '3GB', desc: 'Weekly 3GB', price: 1300, validity: '7 Days' },
      { id: 'w5', size: '5GB', desc: 'Weekly 5GB', price: 2000, validity: '7 Days' },
      { id: 'w6', size: '7GB', desc: 'Weekly 7GB', price: 2600, validity: '7 Days' },
      { id: 'w7', size: '10GB', desc: 'Weekly 10GB', price: 3500, validity: '7 Days' },
      { id: 'w8', size: '15GB', desc: 'Weekly 15GB', price: 4500, validity: '7 Days' }
    ],
    Monthly: [
      { id: 'm1', size: '1GB', desc: 'Monthly 1GB', price: 800, validity: '30 Days' },
      { id: 'm2', size: '3GB', desc: 'Monthly 3GB', price: 2000, validity: '30 Days' },
      { id: 'm3', size: '5GB', desc: 'Monthly 5GB', price: 3000, validity: '30 Days' },
      { id: 'm4', size: '10GB', desc: 'Monthly 10GB', price: 5500, validity: '30 Days' },
      { id: 'm5', size: '15GB', desc: 'Monthly 15GB', price: 8000, validity: '30 Days' },
      { id: 'm6', size: '20GB', desc: 'Monthly 20GB', price: 10000, validity: '30 Days' },
      { id: 'm7', size: '30GB', desc: 'Monthly 30GB', price: 14000, validity: '30 Days' },
      { id: 'm8', size: '50GB', desc: 'Monthly 50GB', price: 22000, validity: '30 Days' }
    ],
    XtraValue: [
      { id: 'x1', size: '350MB', desc: '350MB + Bonus', price: 150, validity: '7 Days' },
      { id: 'x2', size: '750MB', desc: '750MB + Bonus', price: 300, validity: '7 Days' },
      { id: 'x3', size: '1.25GB', desc: '1.25GB + Bonus', price: 550, validity: '7 Days' },
      { id: 'x4', size: '2.5GB', desc: '2.5GB + Bonus', price: 1000, validity: '14 Days' },
      { id: 'x5', size: '4GB', desc: '4GB + Bonus', price: 1600, validity: '30 Days' },
      { id: 'x6', size: '6GB', desc: '6GB + Bonus', price: 2200, validity: '30 Days' },
      { id: 'x7', size: '8GB', desc: '8GB + Bonus', price: 2800, validity: '30 Days' },
      { id: 'x8', size: '12GB', desc: '12GB + Bonus', price: 3800, validity: '30 Days' }
    ]
  };

  /* Theme helpers */
  function getSavedTheme() {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'light' || v === 'dark') return v;
    return 'dark';
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
    themeToggleBtn.addEventListener('click', () => {
      const current = getSavedTheme();
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
    });
  }
  applyTheme(getSavedTheme());

  /* Render plan cards */
  function renderPlans() {
    const list = PLANS[state.planTab] || [];
    planGrid.innerHTML = '';
    list.forEach(plan => {
      const card = document.createElement('button');
      card.className = 'data_plan_card';
      card.type = 'button';
      card.dataset.planId = plan.id;
      card.innerHTML = `
        <div class="data_plan_size">${plan.size}</div>
        <div class="data_plan_desc">${plan.desc}</div>
        <div class="data_plan_bottom">
          <div>₦${plan.price.toLocaleString()}</div>
          <div>${plan.validity}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        state.selectedPlanId = plan.id;
        document.querySelectorAll('.data_plan_card').forEach(c => c.classList.remove('data_plan_card--selected'));
        card.classList.add('data_plan_card--selected');
        updateSummary();
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
      planGrid.appendChild(card);
    });

    if (state.selectedPlanId) {
      const found = planGrid.querySelector(`[data-plan-id="${state.selectedPlanId}"]`);
      if (found) found.classList.add('data_plan_card--selected');
      else state.selectedPlanId = null;
    }
  }

  function updateSummary() {
    summaryNetwork.textContent = state.network;
    summaryRecipient.textContent = recipientInput.value || '—';
    if (state.selectedPlanId) {
      const all = PLANS[state.planTab] || [];
      const p = all.find(x => x.id === state.selectedPlanId) || null;
      summaryPlan.textContent = p ? `${p.size} • ₦${p.price} • ${p.validity}` : '—';
    } else {
      summaryPlan.textContent = '—';
    }
  }

  /* Tab underline and behavior */
  function positionTabUnderline() {
    const active = document.querySelector('.data_tab[aria-selected="true"]');
    if (!active || !tabUnderline) return;
    const rect = active.getBoundingClientRect();
    const containerRect = active.parentElement.getBoundingClientRect();
    const left = rect.left - containerRect.left;
    tabUnderline.style.width = `${rect.width}px`;
    tabUnderline.style.left = `${left}px`;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
      state.planTab = tab.dataset.tab;
      renderPlans();
      positionTabUnderline();
      updateSummary();
    });
  });

  // initial paint
  requestAnimationFrame(() => {
    panel.classList.add('data_panel--enter');
    renderPlans();
    updateSummary();
    positionTabUnderline();
  });

  // network buttons
  networkBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      networkBtns.forEach(b => b.setAttribute('aria-checked', 'false'));
      btn.setAttribute('aria-checked', 'true');
      state.network = btn.dataset.network;
      updateSummary();
    });
  });

  // phone input: digits only and maxlength already set on input element.
  recipientInput.addEventListener('input', (e) => {
    // strip non-digits
    const cleaned = (e.target.value || '').replace(/\D/g, '').slice(0, 11);
    if (cleaned !== e.target.value) {
      e.target.value = cleaned;
    }
    state.phone = cleaned;
    updateSummary();
  });

  // buy now simple interaction (UI-only)
  if (buyNow) {
    buyNow.addEventListener('click', () => {
      buyNow.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)' }, { transform: 'translateY(0)' }], { duration: 240, easing: 'ease-out' });
      // placeholder for integration later
    });
  }

  // notifications simple animation
  if (notificationsBtn) {
    notificationsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      notificationsBtn.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(0deg)' }], { duration: 360, easing: 'ease-out' });
    });
  }

  // recalc underline on resize
  window.addEventListener('resize', positionTabUnderline);

  // debug
  window.__blueSuiteState = state;
})();
