/* script.js — BlueSea Dashboard (notifications dropdown removed, blue accents, API wired)
   Notes:
   - Uses localStorage 'bs_token' if present; fallback to Postman token
   - Notifications bell is now a link to /notifications.html (no inline dropdown)
*/
(function () {
  'use strict';

  /* ------------- CONFIG ------------- */
  const API_BASE = 'http://127.0.0.1:8000'; // from Postman collection
  // const FALLBACK_BEARER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzkwMzM5NDk5LCJpYXQiOjE3NTkyMzU0OTksImp0aSI6ImU2NzRlOTRiMjU2YjQwZDdhODhjZmVkYjlkZjM3Y2FjIiwidXNlcl9pZCI6IjEifQ.o2o4PdU0jnI_wW5CqneyvbEU9HOm_Mct9L4Ubq2Zm24';
// 
  function authHeaders() {
    const token = localStorage.getItem('access_token') ;
    if (!token) return {};
    return { 'Authorization': `Bearer ${token}` };
  }

  /* ------------- DOM helpers ------------- */
  const qs = (sel, ctx = document) => (ctx || document).querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));
  const toastEl = document.getElementById('bsdash_toast');

  /* ------------- Toast ------------- */
  function showToast(message = 'Done', opts = {}) {
    if (!toastEl) { console.log('[toast] ', message); return; }
    const div = document.createElement('div');
    div.className = 'bsdash_toast_item';
    div.style.cssText = [
      'background:rgba(15,20,25,0.95)',
      'color:#fff',
      'padding:10px 14px',
      'border-radius:10px',
      'margin-top:8px',
      'box-shadow:0 10px 30px rgba(0,0,0,0.25)',
      'pointer-events:auto',
      'transition: opacity 300ms ease, transform 300ms ease'
    ].join(';');
    div.textContent = message;
    toastEl.appendChild(div);
    setTimeout(()=> {
      div.style.opacity = '0';
      div.style.transform = 'translateY(6px)';
      setTimeout(()=> div.remove(), 380);
    }, opts.duration || 1800);
  }

  /* ------------- Theme handling ------------- */
  const root = document.documentElement;
  //const THEME_ENDPOINT = `${API_BASE}/user/preferences`;

  function applyTheme(theme) {
    theme = (theme === 'dark') ? 'dark' : 'light';
    root.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    const toggle = qs('#bsdash_toggle_theme');
    if (toggle) {
      toggle.querySelector('.bsdash_toggle_label').textContent = theme === 'dark' ? 'Light' : 'Dark';
      toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }
  }

  async function fetchAndApplyTheme() {
    try {
      const res = await fetch(THEME_ENDPOINT, { headers: { 'Content-Type': 'application/json', ...authHeaders() }});
      if (res.ok) {
        const json = await res.json();
        if (json && json.theme) { applyTheme(json.theme); return; }
      }
    } catch (err) {}
    const saved = localStorage.getItem('bsdash_theme');
    applyTheme(saved || 'light');
  }

  async function persistTheme(theme) {
    try {
      const res = await fetch(THEME_ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ theme })
      });
      if (!res.ok) throw new Error('Failed');
      return true;
    } catch (err) {
      showToast('Could not save theme preference');
      return false;
    }
  }

  /* ------------- Safety helpers ------------- */
  function safeText(node, text) { if (!node) return; node.textContent = String(text == null ? '' : text); }
  function escapeHtml(str) { return String(str || '').replace(/[&<>"'`=\/]/g, s => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;','/':'&#47;','=':'&#61;' }[s])); }

  /* ------------- API helpers ------------- */
  async function apiGet(path) {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', ...authHeaders()  }
    });
    if (!res.ok) { const text = await res.text(); throw new Error(`HTTP ${res.status} ${text}`); }
    return res.json();
  }
  async function apiPost(path, payload) {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload)
    });
    if (!res.ok) { const text = await res.text(); throw new Error(`HTTP ${res.status} ${text}`); }
    return res.json();
  }

  /* ------------- Bind Quick Actions ------------- */
  function bindQuickActions() {
    qsa('.bsdash_action_btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const act = btn.getAttribute('data-action');
        try {
          btn.disabled = true;
          btn.setAttribute('aria-busy', 'true');
          showToast(`Action: ${act}`);
        } finally {
          btn.disabled = false;
          btn.removeAttribute('aria-busy');
        }
      });
    });
  }

  /* ------------- Transactions rendering & search/filter ------------- */
  let _currentTransactions = [];
  function renderTransactions(list) {
    const ul = qs('#bsdash_tx_list');
    if (!ul) return;
    ul.innerHTML = '';
    if (!list || list.length === 0) {
      const li = document.createElement('li');
      li.className = 'bsdash_tx_row';
      li.textContent = 'No recent transactions';
      ul.appendChild(li);
      return;
    }
    list.forEach(tx => {
      const li = document.createElement('li');
      li.className = 'bsdash_tx_row';
      li.dataset.txid = tx.id || '';

      const left = document.createElement('div');
      left.className = 'bsdash_tx_left';
      const icon = document.createElement('div');
      icon.className = 'bsdash_tx_icon avatar-s';
      icon.setAttribute('aria-hidden','true');

      const meta = document.createElement('div');
      meta.className = 'bsdash_tx_meta';
      const title = document.createElement('div');
      title.className = 'bsdash_tx_title';
      title.textContent = tx.title || tx.description || 'Transaction';
      const sub = document.createElement('div');
      sub.className = 'bsdash_tx_sub';
      sub.textContent = tx.subtitle || tx.type || '';

      meta.appendChild(title);
      meta.appendChild(sub);
      left.appendChild(icon);
      left.appendChild(meta);

      const right = document.createElement('div');
      right.className = 'bsdash_tx_right';
      const amount = document.createElement('span');
      amount.className = 'bsdash_tx_amount';
      amount.textContent = formatCurrency(tx.amount);
      right.appendChild(amount);

      li.appendChild(left);
      li.appendChild(right);

      li.addEventListener('click', () => {
        showToast(`Transaction: ${tx.id}`);
      });
      ul.appendChild(li);
    });
  }

  function formatCurrency(amount) { if (amount == null) return '₦0'; return `₦${Number(amount).toLocaleString('en-NG')}`; }

  function bindTransactionSearch() {
    const input = qs('#bsdash_tx_search');
    if (!input) return;
    input.addEventListener('input', (e) => {
      const q = (e.target.value || '').trim().toLowerCase();
      if (!q) {
        renderTransactions(_currentTransactions);
        return;
      }
      const filtered = _currentTransactions.filter(t => {
        const hay = `${t.title || ''} ${t.description || ''} ${t.type || ''}`.toLowerCase();
        return hay.indexOf(q) !== -1;
      });
      renderTransactions(filtered);
    });
  }

  /* ------------- Notifications (NO INLINE DROPDOWN) ------------- */
  // Keep fetch/update only; bell is a link so clicking navigates
  async function fetchNotifications() {
    try {
      const data = await apiGet('/notifications?limit=10');
      const count = data.unreadCount || (data.items ? data.items.filter(i=>!i.read).length : 0);
      updateNotificationCount(count);
      // do not render inline dropdown here; this data can be used on notifications page
    } catch (err) { console.warn('notifications fetch failed', err); }
  }
  function updateNotificationCount(n) {
    const badge = qs('#bsdash_notifications_count');
    const btn = qs('#bsdash_notifications_btn');
    if (!badge || !btn) return;
    if (!n || n <= 0) {
      badge.classList.add('visually-hidden');
      badge.textContent = '0';
      btn.setAttribute('aria-label', 'Notifications');
    } else {
      badge.classList.remove('visually-hidden');
      badge.textContent = String(n);
      btn.setAttribute('aria-label', `Notifications, ${n} unread`);
    }
  }

  /* ------------- Focus trap utility ------------- */
  function trapFocus(container, onClose) {
    const focusableSelectors = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(container.querySelectorAll(focusableSelectors));
    let first = focusable[0];
    let last = focusable[focusable.length - 1];
    function handleKey(e) {
      if (e.key !== 'Tab') return;
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', handleKey);
    return function release() {
      document.removeEventListener('keydown', handleKey);
      if (typeof onClose === 'function') onClose();
    };
  }

  /* ------------- Dropdown positioning utility (kept for wallet) ------------- */
  function positionDropdownRelativeTo(anchorEl, dropdownEl) {
    if (!anchorEl || !dropdownEl) return;
    const rect = anchorEl.getBoundingClientRect();
    let top = rect.bottom + window.scrollY + 8;
    let left = rect.right + window.scrollX - dropdownEl.offsetWidth;
    const viewportRight = window.scrollX + document.documentElement.clientWidth;
    if (left + dropdownEl.offsetWidth > viewportRight) {
      left = Math.max(window.scrollX + 8, rect.left + window.scrollX);
    }
    const viewportBottom = window.scrollY + document.documentElement.clientHeight;
    if (top + dropdownEl.offsetHeight > viewportBottom) {
      const altTop = rect.top + window.scrollY - dropdownEl.offsetHeight - 8;
      if (altTop > window.scrollY) top = altTop;
    }
    left = Math.max(8 + window.scrollX, Math.min(left, viewportRight - dropdownEl.offsetWidth - 8));
    top = Math.max(8 + window.scrollY, Math.min(top, viewportBottom - dropdownEl.offsetHeight - 8));
    dropdownEl.style.top = `${top}px`;
    dropdownEl.style.left = `${Math.max(8, left)}px`;
    dropdownEl.style.maxHeight = `${Math.max(160, (window.innerHeight - 120))}px`;
  }
  function positionDropdownRelativeTo(anchorEl, dropdownEl) {
    if (!anchorEl || !dropdownEl) return;
    const rect = anchorEl.getBoundingClientRect();
    let top = rect.bottom + window.scrollY + 8;
    let left = rect.right + window.scrollX - dropdownEl.offsetWidth;
    const viewportRight = window.scrollX + document.documentElement.clientWidth;
    if (left + dropdownEl.offsetWidth > viewportRight) {
      left = Math.max(window.scrollX + 8, rect.left + window.scrollX);
    }
    const viewportBottom = window.scrollY + document.documentElement.clientHeight;
    if (top + dropdownEl.offsetHeight > viewportBottom) {
      const altTop = rect.top + window.scrollY - dropdownEl.offsetHeight - 8;
      if (altTop > window.scrollY) top = altTop;
    }
    left = Math.max(8 + window.scrollX, Math.min(left, viewportRight - dropdownEl.offsetWidth - 8));
    top = Math.max(8 + window.scrollY, Math.min(top, viewportBottom - dropdownEl.offsetHeight - 8));
    dropdownEl.style.top = `${top}px`;
    dropdownEl.style.left = `${Math.max(8, left)}px`;
    dropdownEl.style.maxHeight = `${Math.max(160, (window.innerHeight - 120))}px`;
  }

  /* ------------- Wallet dropdown + long-press + top-up (fixed) ------------- */
  function bindWalletInteractions() {
    const preview = qs('#bsdash_wallet_preview');
    const dd = qs('#bsdash_wallet_dropdown');
    const close = qs('#bsdash_wallet_close');
    if (!preview || !dd) return;

    let lpTimer = null;
    let longPressed = false;
    let lastFocusEl = null;
    let releaseTrap = null;

    function openWallet() {
      positionDropdownRelativeTo(preview, dd);
      dd.classList.remove('hidden');
      dd.setAttribute('aria-hidden', 'false');
      preview.setAttribute('aria-expanded', 'true');
      lastFocusEl = document.activeElement;
      const focusable = dd.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) focusable.focus();
      releaseTrap = trapFocus(dd, () => { closeWallet(); });
      fetchWalletActivity();
      window.addEventListener('resize', handleRepositionWallet);
      window.addEventListener('scroll', handleRepositionWallet, true);
    }
    function closeWallet() {
      dd.classList.add('hidden');
      dd.setAttribute('aria-hidden', 'true');
      preview.setAttribute('aria-expanded', 'false');
      if (releaseTrap) { releaseTrap(); releaseTrap = null; }
      if (lastFocusEl && typeof lastFocusEl.focus === 'function') lastFocusEl.focus();
      window.removeEventListener('resize', handleRepositionWallet);
      window.removeEventListener('scroll', handleRepositionWallet, true);
    }

    function handleRepositionWallet() { positionDropdownRelativeTo(preview, dd); }

    preview.addEventListener('click', (e) => {
      if (longPressed) {
        longPressed = false;
        e.preventDefault();
        return;
      }
      if (dd.classList.contains('hidden')) openWallet(); else closeWallet();
    });

    if (close) close.addEventListener('click', closeWallet);

    preview.addEventListener('pointerdown', (e) => {
      if (lpTimer) clearTimeout(lpTimer);
      lpTimer = setTimeout(() => {
        longPressed = true;
        openWallet();
      }, 450);
    });
    function cancelLP() {
      if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; }
    }
    preview.addEventListener('pointerup', cancelLP);
    preview.addEventListener('pointerleave', cancelLP);
    preview.addEventListener('pointercancel', cancelLP);
    preview.addEventListener('touchmove', cancelLP, { passive: true });

    // top-up buttons
    qsa('.bsdash_topup_btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const amt = btn.dataset.amount;
        if (amt === 'other') {
          const x = prompt('Enter amount to top up (NGN)', '1000');
          if (!x) return;
          const parsed = Number(x.toString().replace(/[^\d.]/g, ''));
          if (!isFinite(parsed) || parsed <= 0) { showToast('Enter a valid amount'); return; }
          await doTopup(parsed);
        } else {
          await doTopup(Number(amt));
        }
      });
    });

    async function doTopup(amount) {
      const MIN = 100;
      const MAX = 10000000;
      if (!Number.isFinite(amount) || amount < MIN) { showToast(`Minimum top-up is ₦${MIN}`); return; }
      if (amount > MAX) { showToast(`Maximum top-up is ₦${MAX}`); return; }
      try {
        showToast('Initiating top-up...');
        const res = await apiPost('/transactions/fund-wallet/', { amount });
        if (res && res.redirectUrl) {
          try {
            const u = new URL(res.redirectUrl);
            if (u.protocol !== 'https:' && u.protocol !== 'http:') { showToast('Unsafe payment redirect detected. Contact support.'); return; }
            window.open(res.redirectUrl, '_blank', 'noopener');
            showToast('Opening payment gateway...');
          } catch (err) {
            showToast('Invalid payment URL');
          }
        } else if (res && (res.success || res.balance != null)) {
          if (res.balance != null) safeText(qs('#bsdash_wallet_amount'), formatCurrency(res.balance));
          showToast(res.message || 'Top-up successful');
          fetchWalletActivity();
          try { const b = (res.balance != null ? res.balance : res.data && res.data.balance); if (b != null) safeText(qs('#bsdash_balance_amount'), formatCurrency(b)); } catch(e){}
        } else {
          showToast('Top-up initiated. Complete payment in new tab or contact support.');
        }
      } catch (err) {
        console.error('topup failed', err);
        showToast('Top-up failed. Try again.');
      }
    }
  }

  async function fetchWalletActivity() {
    const wrap = qs('#bsdash_wallet_activity');
    const small = qs('#bsdash_wallet_available_small');
    const pending = qs('#bsdash_wallet_pending_small');
    if (!wrap) return;
    wrap.innerHTML = '<div class="skeleton w-60 h-18"></div>';
    try {
      const data = await apiGet('/wallet/balance/');
      wrap.innerHTML = '';
      if (Array.isArray(data.items) && data.items.length > 0) {
        data.items.forEach(it => {
          const row = document.createElement('div');
          row.className = 'bsdash_wallet_activity_row';
          const left = document.createElement('div'); left.style.fontSize = '13px'; left.textContent = it.desc || it.note || 'Activity';
          const right = document.createElement('div'); right.style.fontWeight = '700'; right.textContent = formatCurrency(it.amount || it.value || 0);
          row.appendChild(left); row.appendChild(right);
          wrap.appendChild(row);
        });
      } else {
        wrap.innerHTML = '<div style="color:var(--muted)">No recent activity</div>';
      }
      const balance = (data.balance != null) ? data.balance : (data.account && data.account.balance) ? data.account.balance : (data.data && data.data.balance) || null;
      const pendingAmt = (data.pending != null) ? data.pending : (data.account && data.account.pending) ? data.account.pending : 0;
      if (small) safeText(small, `Available: ${formatCurrency(balance)}`);
      if (pending) safeText(pending, `Pending: ${formatCurrency(pendingAmt || 0)}`);
      if (balance != null) safeText(qs('#bsdash_wallet_amount'), formatCurrency(balance));
      if (balance != null) safeText(qs('#bsdash_balance_amount'), formatCurrency(balance));
    } catch (err) {
      wrap.innerHTML = '<div style="color:var(--muted)">Could not load activity</div>';
      console.warn('wallet activity error', err);
    }
  }

  /* ------------- Smart shortcuts ------------- */
  async function fetchAndRenderShortcuts() {
    const container = qs('#bsdash_shortcuts_container');
    if (!container) return;
    container.innerHTML = '';
    try {
      const data = await apiGet('/user/shortcuts');
      if (!Array.isArray(data) || data.length === 0) return;
      data.slice(0,4).forEach(s => {
        const btn = document.createElement('button');
        btn.className = 'bsdash_shortcut';
        btn.type = 'button';
        const title = document.createElement('div'); title.style.fontWeight = '700'; title.textContent = s.title || '';
        const sub = document.createElement('div'); sub.style.fontSize = '12px'; sub.style.color = 'var(--muted)'; sub.textContent = s.subtitle || '';
        btn.appendChild(title); btn.appendChild(sub);
        btn.addEventListener('click', () => showToast(`Shortcut: ${s.title}`));
        container.appendChild(btn);
      });
    } catch (err) { console.warn('shortcuts fetch failed', err); }
  }

  /* ------------- Loyalty ------------- */
  async function fetchAndRenderLoyalty() {
    const pointsEl = qs('#bsdash_loyalty_points');
    const bar = qs('#bsdash_loyalty_bar');
    if (!pointsEl) return;
    try {
      const data = await apiGet('/rewards');
      const pts = data.points || 0;
      safeText(pointsEl, `Points: ${pts}`);
      const percent = data.nextThreshold ? Math.min(100, Math.round((pts / data.nextThreshold) * 100)) : 0;
      if (bar) bar.style.width = `${percent}%`;
    } catch (err) {
      safeText(pointsEl, `Points: —`);
      if (bar) bar.style.width = `0%`;
      console.warn('rewards fetch failed', err);
    }
  }

  /* ------------- Scheduled payments ------------- */
  async function fetchAndRenderScheduled() {
    const wrap = qs('#bsdash_scheduled_list');
    if (!wrap) return;
    wrap.innerHTML = '';
    try {
      const data = await apiGet('/autopay');
      if (!Array.isArray(data) || data.length === 0) {
        wrap.innerHTML = '<div style="color:var(--muted)">No scheduled payments</div>';
        return;
      }
      data.forEach(sp => {
        const div = document.createElement('div'); div.className = 'bsdash_tx_row';
        const left = document.createElement('div'); left.style.display = 'flex'; left.style.flexDirection = 'column';
        const name = document.createElement('div'); name.style.fontWeight = '700'; name.textContent = sp.name || sp.target;
        const sc = document.createElement('div'); sc.style.fontSize = '12px'; sc.style.color = 'var(--muted)'; sc.textContent = sp.schedule;
        left.appendChild(name); left.appendChild(sc);
        const right = document.createElement('div'); right.style.fontWeight = '700'; right.textContent = formatCurrency(sp.amount);
        div.appendChild(left); div.appendChild(right);
        wrap.appendChild(div);
      });
    } catch (err) {
      wrap.innerHTML = '<div style="color:var(--muted)">Could not load scheduled payments</div>';
      console.warn('autopay fetch failed', err);
    }
  }

  /* ------------- Activity timeline ------------- */
  async function fetchAndRenderTimeline() {
    const wrap = qs('#bsdash_timeline_list');
    if (!wrap) return;
    wrap.innerHTML = '<div class="skeleton w-60 h-14"></div>';
    try {
      try {
        const resp = await apiGet('/dashboard/activity?limit=30');
        renderTimelineItems(resp.items || []);
        return;
      } catch (err) {}
      const [txs, nots] = await Promise.allSettled([apiGet('/transactions/history/'), apiGet('/notifications?limit=10')]);
      const items = [];
      if (txs.status === 'fulfilled' && Array.isArray(txs.value.data || txs.value)) {
        const arr = Array.isArray(txs.value.data) ? txs.value.data : (Array.isArray(txs.value) ? txs.value : []);
        arr.forEach(t => items.push({ type: 'tx', time: t.created_at || t.time, title: t.title || t.description, amount: t.amount }));
      }
      if (nots.status === 'fulfilled' && Array.isArray(nots.value.items || nots.value)) {
        const arr = Array.isArray(nots.value.items) ? nots.value.items : (Array.isArray(nots.value) ? nots.value : []);
        arr.forEach(n => items.push({ type: 'note', time: n.created_at, title: n.title, body: n.body }));
      }
      items.sort((a,b) => new Date(b.time) - new Date(a.time));
      renderTimelineItems(items);
    } catch (err) {
      wrap.innerHTML = '<div style="color:var(--muted)">Could not load activity</div>';
      console.warn('timeline error', err);
    }
  }
  function renderTimelineItems(items) {
    const wrap = qs('#bsdash_timeline_list');
    if (!wrap) return;
    wrap.innerHTML = '';
    if (!items || items.length === 0) { wrap.innerHTML = '<div style="color:var(--muted)">No activity yet</div>'; return; }
    items.forEach(it => {
      const node = document.createElement('div');
      node.className = 'bsdash_timeline_item';
      const time = it.time ? new Date(it.time).toLocaleString() : '';
      if (it.type === 'tx') {
        node.innerHTML = `<div style="width:44px;height:44px;border-radius:8px;background:linear-gradient(90deg,var(--accent-a),var(--accent-b));"></div>
                          <div style="flex:1;">
                            <div style="font-weight:700">${escapeHtml(it.title || 'Transaction')}</div>
                            <div class="bsdash_timeline_item_time">${time} • ${formatCurrency(it.amount)}</div>
                          </div>`;
      } else {
        node.innerHTML = `<div style="width:44px;height:44px;border-radius:8px;background:rgba(0,0,0,0.03);"></div>
                          <div style="flex:1;">
                            <div style="font-weight:700">${escapeHtml(it.title || 'Notification')}</div>
                            <div class="bsdash_timeline_item_time">${time} • ${escapeHtml(it.body || '')}</div>
                          </div>`;
      }
      wrap.appendChild(node);
    });
  }

  /* ------------- Fetch initial data ------------- */
  async function fetchInitialData() {
    try {
      const [walletP, txsP, notsP, rewardsP, shortcutsP, autopayP] = await Promise.allSettled([
        apiGet('/wallet/balance/'),
        apiGet('/transactions/history/'),
        apiGet('/notifications?limit=6'),
        apiGet('/rewards').catch(()=>null),
        apiGet('/user/shortcuts').catch(()=>[]),
        apiGet('/autopay').catch(()=>[])
      ]);

      // wallet
      if (walletP.status === 'fulfilled' && walletP.value) {
        const w = walletP.value;
        const balance = (w.balance != null) ? w.balance : (w.account && w.account.balance) ? w.account.balance : (w.data && w.data.balance) || null;
        if (balance != null) safeText(qs('#bsdash_balance_amount'), formatCurrency(balance));
        if (qs('#bsdash_wallet_available_small')) safeText(qs('#bsdash_wallet_available_small'), `Available: ${formatCurrency(balance)}`);
        if (qs('#bsdash_wallet_amount')) safeText(qs('#bsdash_wallet_amount'), formatCurrency(balance));
      } else {
        safeText(qs('#bsdash_balance_amount'), '₦—');
      }

      // transactions
      if (txsP.status === 'fulfilled' && txsP.value) {
        const dataArr = Array.isArray(txsP.value.data) ? txsP.value.data : (Array.isArray(txsP.value) ? txsP.value : []);
        _currentTransactions = dataArr;
        renderTransactions(_currentTransactions);
      } else {
        renderTransactions([]);
      }

      // notifications (only update count)
      if (notsP.status === 'fulfilled' && notsP.value) {
        updateNotificationCount(notsP.value.unreadCount || 0);
      } else {
        // optionally, fetch notifications periodically
        fetchNotifications().catch(()=>{});
      }

      // rewards
      if (rewardsP.status === 'fulfilled' && rewardsP.value) {
        const r = rewardsP.value;
        safeText(qs('#bsdash_loyalty_points'), `Points: ${r.points || 0}`);
        const pct = r.nextThreshold ? Math.min(100, Math.round((r.points / r.nextThreshold) * 100)) : 0;
        const bar = qs('#bsdash_loyalty_bar'); if (bar) bar.style.width = `${pct}%`;
      } else {
        fetchAndRenderLoyalty().catch(()=>{});
      }

      // shortcuts
      if (shortcutsP.status === 'fulfilled' && Array.isArray(shortcutsP.value) && shortcutsP.value.length) {
        const container = qs('#bsdash_shortcuts_container'); container.innerHTML = '';
        shortcutsP.value.slice(0,4).forEach(s => {
          const btn = document.createElement('button'); btn.className='bsdash_shortcut'; btn.type='button';
          const title = document.createElement('div'); title.style.fontWeight='700'; title.textContent = s.title || '';
          const sub = document.createElement('div'); sub.style.fontSize='12px'; sub.style.color='var(--muted)'; sub.textContent = s.subtitle || '';
          btn.appendChild(title); btn.appendChild(sub);
          btn.addEventListener('click', ()=>showToast(`Shortcut: ${s.title}`));
          container.appendChild(btn);
        });
      } else {
        fetchAndRenderShortcuts().catch(()=>{});
      }

      // autopay / scheduled
      if (autopayP.status === 'fulfilled' && Array.isArray(autopayP.value) && autopayP.value.length) {
        const wrap = qs('#bsdash_scheduled_list'); wrap.innerHTML = '';
        autopayP.value.forEach(sp => {
          const div = document.createElement('div'); div.className = 'bsdash_tx_row';
          const left = document.createElement('div'); left.style.display='flex'; left.style.flexDirection='column';
          const name = document.createElement('div'); name.style.fontWeight='700'; name.textContent = sp.name || sp.target;
          const sc = document.createElement('div'); sc.style.fontSize='12px'; sc.style.color='var(--muted)'; sc.textContent = sp.schedule;
          left.appendChild(name); left.appendChild(sc);
          const right = document.createElement('div'); right.style.fontWeight='700'; right.textContent = formatCurrency(sp.amount);
          div.appendChild(left); div.appendChild(right);
          wrap.appendChild(div);
        });
      } else {
        fetchAndRenderScheduled().catch(()=>{});
      }

      fetchAndRenderTimeline().catch(()=>{});
    } catch (err) {
      console.error('initial load failed', err);
      showToast('Could not load all data. Refresh to retry.');
    }
  }

  /* ------------- Theme toggle ------------- */
  function bindThemeToggle() {
    const toggle = qs('#bsdash_toggle_theme');
    if (!toggle) return;
    toggle.addEventListener('click', async () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('bsdash_theme', next);
      const ok = await persistTheme(next);
      if (!ok) applyTheme(current); else showToast('Theme updated');
    });
  }

  /* ------------- Profile image & streak ------------- */
  function setProfileImage(url) {
    const img = qs('#bsdash_profile_img');
    const svg = qs('#bsdash_profile_svg');
    if (!img || !svg) return;
    if (url) {
      const tmp = new Image();
      tmp.crossOrigin = 'anonymous';
      tmp.onload = () => {
        img.src = url;
        img.classList.remove('visually-hidden');
        svg.classList.add('visually-hidden');
      };
      tmp.onerror = () => {
        img.classList.add('visually-hidden');
        svg.classList.remove('visually-hidden');
      };
      tmp.src = url;
    } else {
      img.classList.add('visually-hidden');
      svg.classList.remove('visually-hidden');
    }
  }
  function setStreak(count) {
    const el = qs('#bsdash_streak');
    if (!el) return;
    if (count && Number(count) > 0) {
      el.classList.remove('visually-hidden');
      qs('#bsdash_streak_count').textContent = String(count);
    } else {
      el.classList.add('visually-hidden');
    }
  }

  /* ------------- Bindings & init ------------- */
  function initBindings() {
    bindQuickActions();
    // notifications toggle intentionally NOT bound (bell is a link to /notifications.html)
    bindThemeToggle();
    bindTransactionSearch();
    bindWalletInteractions();
    const profileBtn = qs('#bsdash_profile_btn');
    if (profileBtn) profileBtn.addEventListener('click', () => showToast('Open profile (implement routing)'));
  }

  async function init() {
    await fetchAndApplyTheme();
    initBindings();
    await fetchInitialData();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  /* ------------- Exports for debugging ------------- */
  window.bsdash = {
    apiGet, apiPost, fetchWalletActivity, fetchAndRenderShortcuts, fetchAndRenderLoyalty, fetchAndRenderScheduled, fetchAndRenderTimeline
  };

})();
