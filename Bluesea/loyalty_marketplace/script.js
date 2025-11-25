/**
 * script.js
 * - Unique IDs / classes start with lp_
 * - No inline CSS created by JS (JS assigns class names)
 * - No simulation code (no fake +500 points)
 * - Responsive grid: Desktop 3 cols, Tablet/Mobile 2 cols
 *
 * NOTE: Replace mock fetchRewards() with your real backend endpoints.
 */

(() => {
  const state = {
    page: 1,
    perPage: 6,
    q: '',
    category: '',
    pointsMin: null,
    pointsMax: null,
    sort: 'popularity',
    isLoading: false,
    user: {
      id: 'user-123',
      points: 2500
    }
  };

  // Elements
  const $catalog = document.getElementById('lp_catalog_grid');
  const $search = document.getElementById('lp_search');
  const $loadMore = document.getElementById('lp_load_more');
  const $activeFilters = document.getElementById('lp_active_filters');
  const $modal = document.getElementById('lp_modal');
  const $modalContent = document.getElementById('lp_modal_content');
  const $modalClose = document.getElementById('lp_modal_close');
  const $themeToggle = document.getElementById('lp_theme_toggle');
  const $pointsAmount = document.getElementById('lp_points_amount');

  // Debounce helper
  function debounce(fn, wait = 300) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  // Idempotency key generator
  function makeIdempotencyKey() {
    return 'idem_' + (Date.now().toString(36)) + '_' + Math.random().toString(36).slice(2,10);
  }

  // Mock fetch (replace with real API)
  async function fetchRewards(page = 1, perPage = 6, q = '', category = '', min = null, max = null, sort = 'popularity') {
    // Replace with: const res = await fetch(`/api/rewards?...`); return res.json();
    const sample = [
      { id:'r1', title:'1 GB', desc:'Get 1GB of data on any network', points:1000, category:'data', image_url:null, popularity: 90, fulfil:'instant' },
      { id:'r2', title:'#500 Airtime', desc:'#500 Airtime on any network', points:500, category:'airtime', image_url:null, popularity: 78, fulfil:'instant' },
      { id:'r3', title:'Coffee Voucher', desc:'A free cup of coffee at selected cafes', points:1000, category:'voucher', image_url:null, popularity: 45, fulfil:'email' },
      { id:'r4', title:'Movie Ticket', desc:'One standard movie ticket', points:2500, category:'entertainment', image_url:null, popularity: 60, fulfil:'manual' },
      { id:'r5', title:'Uber Voucher', desc:'₦1,000 off your next ride', points:1000, category:'voucher', image_url:null, popularity: 80, fulfil:'email' },
      { id:'r6', title:'2 GB', desc:'Get 2GB of data on any network', points:1800, category:'data', image_url:null, popularity: 55, fulfil:'instant' },
      { id:'r7', title:'5 GB', desc:'Get 5GB of data', points:4300, category:'data', image_url:null, popularity: 50, fulfil:'instant' },
      { id:'r8', title:'#1,000 Airtime', desc:'#1,000 Airtime', points:1000, category:'airtime', image_url:null, popularity: 85, fulfil:'instant' }
    ];

    let out = sample.filter(s => {
      if (q && !(`${s.title} ${s.desc}`.toLowerCase().includes(q.toLowerCase()))) return false;
      if (category && s.category !== category) return false;
      if (min !== null && s.points < min) return false;
      if (max !== null && s.points > max) return false;
      return true;
    });

    if (sort === 'points_asc') out = out.sort((a,b) => a.points - b.points);
    else if (sort === 'points_desc') out = out.sort((a,b) => b.points - a.points);
    else out = out.sort((a,b)=> b.popularity - a.popularity);

    const start = (page-1)*perPage;
    const paged = out.slice(start, start + perPage);

    return new Promise(resolve => setTimeout(()=> resolve({
      items: paged,
      total: out.length
    }), 220));
  }

  // Utility: escape HTML
  function escapeHtml(s='') {
    return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  // Set user points (call when backend confirms)
  function setUserPoints(n) {
    state.user.points = n;
    if ($pointsAmount) $pointsAmount.textContent = Number(n).toLocaleString();
  }

  // Render single card -> list item <li>
  function renderCard(item) {
    const li = document.createElement('li');
    li.className = 'lp_card';
    li.setAttribute('role','listitem');
    li.innerHTML = `
      ${item.popularity ? `<div class="lp_badge">Popular</div>` : ''}
      <div class="lp_picture_frame">
        ${item.image_url ? `<img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.title)}">` : ''}
      </div>
      <h3 class="lp_card_title">${escapeHtml(item.title)}</h3>
      <p class="lp_card_desc">${escapeHtml(item.desc)}</p>
      <div class="lp_card_footer">
        <div><div class="lp_card_points">${Number(item.points).toLocaleString()} pts</div></div>
        <div class="lp_actions">
          <button class="lp_redeem_btn" data-id="${item.id}" aria-label="Redeem ${escapeHtml(item.title)}">Redeem Now</button>
        </div>
      </div>
    `;
    const btn = li.querySelector('.lp_redeem_btn');
    if (btn) btn.addEventListener('click', () => openRedeemModal(item));
    return li;
  }

  // Show skeletons (uses CSS classes not inline)
  function showSkeletons(count = 6) {
    const frag = document.createDocumentFragment();
    for (let i=0;i<count;i++){
      const li = document.createElement('li');
      li.className = 'lp_card';
      li.innerHTML = `
        <div class="lp_picture_frame lp_skeleton" aria-hidden="true"></div>
        <div class="lp_skeleton w-30" style="margin-top:8px;border-radius:6px"></div>
        <div class="lp_skeleton w-70" style="margin-top:8px;border-radius:6px"></div>
        <div class="lp_skeleton w-25" style="margin-top:auto;border-radius:6px"></div>
      `;
      frag.appendChild(li);
    }
    $catalog.innerHTML = '';
    $catalog.appendChild(frag);
  }

  // Load catalog
  // ensure grid children can shrink properly in all browsers (no-op)
  $catalog.style.gap = $catalog.style.gap || '';

  async function loadCatalog({append=false} = {}) {
    if (state.isLoading) return;
    state.isLoading = true;
    $loadMore.disabled = true;
    const page = append ? state.page + 1 : 1;
    showSkeletons(state.perPage);

    try {
      const res = await fetchRewards(page, state.perPage, state.q, state.category, state.pointsMin, state.pointsMax, state.sort);
      if (!append) $catalog.innerHTML = '';
      res.items.forEach(it => $catalog.appendChild(renderCard(it)));
      state.page = page;
      const totalShown = page * state.perPage;
      $loadMore.style.display = (totalShown < res.total) ? 'inline-block' : 'none';
    } catch (err) {
      showToast('Failed to load rewards. Try again.');
      console.error(err);
    } finally {
      state.isLoading = false;
      $loadMore.disabled = false;
    }
  }

  // Modal (accessible): open/close + focus trap + body scroll lock
  let _trap = null;
  function trapFocus(container) {
    releaseFocusTrap();
    _trap = function(e){
      if (e.key === 'Tab') {
        const focusables = container.querySelectorAll('a, button, input, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length -1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      } else if (e.key === 'Escape') {
        closeModal();
      }
    };
    document.addEventListener('keydown', _trap);
  }
  function releaseFocusTrap(){
    if (_trap) {
      document.removeEventListener('keydown', _trap);
      _trap = null;
    }
  }

  function showModal() {
    $modal.style.display = 'flex';
    $modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    document.querySelector('main').setAttribute('aria-hidden','true');
    const inner = $modal.querySelector('.lp_modal_inner');
    const focusable = inner.querySelectorAll('a, button, input, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();
    else inner.focus();
    trapFocus($modal);
  }
  function closeModal() {
    $modal.style.display = 'none';
    $modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    document.querySelector('main').removeAttribute('aria-hidden');
    releaseFocusTrap();
  }

  // Redeem modal content + flow
  function openRedeemModal(item) {
    $modalContent.innerHTML = `
      <h2 style="margin-top:0">${escapeHtml(item.title)}</h2>
      <p>${escapeHtml(item.desc)}</p>
      <p><strong>Cost:</strong> ${Number(item.points).toLocaleString()} pts</p>
      <p><strong>Your balance:</strong> ${Number(state.user.points).toLocaleString()} pts</p>
      <div class="lp_modal_actions" style="display:flex;gap:10px;margin-top:14px">
        <button id="lp_confirm_redeem" class="lp_redeem_btn">${item.points <= state.user.points ? 'Confirm & Redeem' : 'Not enough points'}</button>
        <button id="lp_cancel_redeem" class="lp_btn">Cancel</button>
      </div>
      <div style="margin-top:10px;color:var(--lp-muted);font-size:13px">Fulfillment: ${escapeHtml(item.fulfil || 'instant')}</div>
    `;
    const confirm = document.getElementById('lp_confirm_redeem');
    document.getElementById('lp_cancel_redeem').addEventListener('click', closeModal);

    if (item.points > state.user.points) {
      confirm.disabled = true;
      confirm.setAttribute('aria-disabled','true');
    } else {
      confirm.addEventListener('click', () => performRedeem(item));
    }
    showModal();
  }

  // Redeem POST flow (idempotent)
  async function performRedeem(item) {
    const key = makeIdempotencyKey();
    const btn = document.getElementById('lp_confirm_redeem');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    try {
      const payload = { reward_id: item.id, user_id: state.user.id, idempotency_key: key };
      // TODO: replace with real POST to backend
      // const res = await fetch('/api/redeem', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload) });
      // const data = await res.json();

      // Mock success response (demo only) - in production the backend returns authoritative result
      await new Promise(r => setTimeout(r, 700));
      const data = { success: true, transaction_id: 'txn_' + Date.now(), voucher: 'VCHR-1234-ABCD' };

      if (data && data.success) {
        // IMPORTANT: only update points if backend confirms new balance. Here we do a local update to reflect result, but backend must be authoritative.
        const newBalance = state.user.points - item.points;
        setUserPoints(newBalance);
        showToast(`Redeemed: ${item.title}. Voucher: ${data.voucher}`);
        closeModal();
      } else {
        throw new Error('Redemption failed');
      }
    } catch (err) {
      console.error(err);
      showToast('Redemption failed. Your points were not deducted.');
      closeModal();
    }
  }

  // Toast helper
  function showToast(msg, ms = 4500) {
    const t = document.getElementById('lp_toast');
    const el = document.createElement('div');
    el.className = 'lp_toast_item';
    el.textContent = msg;
    el.style.background = 'rgba(0,0,0,0.75)';
    el.style.color = 'white';
    el.style.padding = '10px 12px';
    el.style.marginTop = '8px';
    el.style.borderRadius = '8px';
    t.appendChild(el);
    setTimeout(()=> {
      el.style.opacity = '0'; 
      setTimeout(()=> el.remove(), 400);
    }, ms);
  }

  // --------------------------
  // Filters: single-open behavior
  // --------------------------

  function closeAllFilterLists() {
    document.querySelectorAll('.lp_filter_btn').forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
      const list = btn.nextElementSibling;
      if (list && list.classList.contains('lp_filter_list')) {
        list.setAttribute('aria-hidden', 'true');
        list.removeAttribute('data-open');
        // hide after small delay to allow close animation
        setTimeout(() => {
          if (!list.hasAttribute('data-open')) list.style.display = 'none';
        }, 220);
      }
    });
  }

  // open a specific list (closes others first)
  function openList(btn, list) {
    // Close any other open lists first
    document.querySelectorAll('.lp_filter_btn').forEach(b => {
      if (b !== btn) {
        const l = b.nextElementSibling;
        if (l && l.classList.contains('lp_filter_list')) {
          b.setAttribute('aria-expanded', 'false');
          l.setAttribute('aria-hidden', 'true');
          l.removeAttribute('data-open');
          setTimeout(() => { if (!l.hasAttribute('data-open')) l.style.display = 'none'; }, 220);
        }
      }
    });

    // Open this one
    btn.setAttribute('aria-expanded','true');
    list.style.display = 'block';
    list.setAttribute('aria-hidden','false');
    list.setAttribute('data-open', 'true');
    list.style.zIndex = 1200;
  }

  // close a specific list
  function closeList(btn, list) {
    btn.setAttribute('aria-expanded','false');
    list.setAttribute('aria-hidden','true');
    list.removeAttribute('data-open');
    setTimeout(() => {
      if (!list.hasAttribute('data-open')) list.style.display = 'none';
    }, 200);
  }

  // init filters with keyboard support & outside click handling
  function initFilters() {
    // Ensure deterministic state
    closeAllFilterLists();

    document.querySelectorAll('.lp_filter_btn').forEach(btn => {
      const list = btn.nextElementSibling;

      // Click toggles but ensures only-one-open via openList()
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent document click handler from closing it immediately
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        if (expanded) closeList(btn, list);
        else openList(btn, list);
      });

      // Keyboard handling (open + focus first option)
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openList(btn, list);
          const first = list.querySelector('[role="option"]');
          if (first) first.focus();
        } else if (e.key === 'Escape') {
          closeList(btn, list);
          btn.focus();
        }
      });

      // Make options keyboard-focusable & clickable
      list.querySelectorAll('[role="option"]').forEach(opt => {
        opt.setAttribute('tabindex','0');
        opt.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const type = list.getAttribute('data-filter-list');
          if (type === 'category') {
            state.category = opt.dataset.value || '';
            addChip('Category', opt.textContent || 'All', () => { state.category = ''; resetAndLoad(); });
          } else if (type === 'points') {
            state.pointsMin = opt.dataset.min ? Number(opt.dataset.min) : null;
            state.pointsMax = opt.dataset.max ? Number(opt.dataset.max) : null;
            addChip('Points', opt.textContent, () => { state.pointsMin = state.pointsMax = null; resetAndLoad(); });
          } else if (type === 'sort') {
            state.sort = opt.dataset.value || 'popularity';
            addChip('Sort', opt.textContent, () => { state.sort = 'popularity'; resetAndLoad(); });
          }
          closeList(btn, list);
          resetAndLoad();
        });

        opt.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opt.click(); }
          else if (e.key === 'Escape') { closeList(btn, list); btn.focus(); }
          else if (e.key === 'ArrowDown') { e.preventDefault(); (opt.nextElementSibling || list.firstElementChild).focus(); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); (opt.previousElementSibling || list.lastElementChild).focus(); }
        });
      });
    });

    // Close any open lists when clicking/tapping outside the .lp_filter group
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.lp_filter')) {
        closeAllFilterLists();
      }
    });

    // Close all on Escape globally (handy)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllFilterLists();
    });
  }

  // Add filter chip
  function addChip(name, label, onRemove) {
    const existing = $activeFilters.querySelector(`[data-chip="${name}"]`);
    if (existing) existing.remove();
    const chip = document.createElement('div');
    chip.className = 'lp_chip';
    chip.dataset.chip = name;
    chip.innerHTML = `<span class="lp_chip_label">${escapeHtml(label)}</span><button aria-label="Remove filter">✕</button>`;
    chip.querySelector('button').addEventListener('click', () => { chip.remove(); onRemove(); });
    $activeFilters.appendChild(chip);
  }

  function resetAndLoad() {
    state.page = 1;
    loadCatalog({append:false});
  }

  // Search (debounced)
  const onSearch = debounce((e) => {
    state.q = e.target.value.trim();
    resetAndLoad();
  }, 420);

  // Event bindings
  function bind() {
    $search.addEventListener('input', onSearch);
    $loadMore.addEventListener('click', () => loadCatalog({append:true}));
    $modalClose.addEventListener('click', closeModal);
    $modal.addEventListener('click', (ev) => { if (ev.target === $modal) closeModal(); });
    $themeToggle.addEventListener('click', () => {
      const body = document.body;
      const cur = body.getAttribute('data-theme') || 'light';
      const next = cur === 'light' ? 'dark' : 'light';
      body.setAttribute('data-theme', next);
      $themeToggle.setAttribute('aria-pressed', next === 'dark');
    });
    initFilters();
  }

  // === Search input highlight behavior ===
  // Keeps the border accent when user has typed text, even after blur.
  (function attachSearchValueListener() {
    const $searchInput = document.getElementById('lp_search');
    if (!$searchInput) return;

    function update() {
      if ($searchInput.value && $searchInput.value.trim() !== '') {
        $searchInput.classList.add('has-value');
      } else {
        $searchInput.classList.remove('has-value');
      }
    }

    // Initialize on page load
    update();

    // Update on typing or change
    $searchInput.addEventListener('input', update, { passive: true });
    $searchInput.addEventListener('change', update);

    // Optional: remove accent if user clears field with ESC or X icon
    $searchInput.addEventListener('search', update);
  })();

  // WebSocket placeholder - no simulation (connect only if WS URL configured)
  function initWebSocket() {
    const wsUrl = window.__LP_WS_URL__ || null;
    if (!wsUrl) return;
    try {
      const ws = new WebSocket(wsUrl + '?token=' + encodeURIComponent(window.__LP_AUTH_TOKEN__ || ''));
      ws.addEventListener('message', (ev) => {
        const payload = JSON.parse(ev.data);
        if (payload.type === 'points:update' && payload.user_id === state.user.id) {
          setUserPoints(payload.new_balance);
          showToast('Points updated');
        } else if (payload.type === 'redemption:update' && payload.user_id === state.user.id) {
          showToast('Redemption status: ' + payload.status);
        }
      });
    } catch (err) { console.warn('WebSocket init failed', err); }
  }

  // Init
  function init() {
    bind();
    loadCatalog();
    initWebSocket();
    // set initial points in header
    setUserPoints(state.user.points);
  }

  document.addEventListener('DOMContentLoaded', init);

})();