/* BlueSeaMobile — BluePoints Dashboard
   Modular, well-commented JavaScript handling dynamic behavior and animations.
   Features:
   - Data module (mocked)
   - UI module (DOM interactions)
   - Animations module (count up, progress, charts)
   - Event handlers (tabs, toggles, modal, rewards)
*/

(() => {
  'use strict';

  /* -------------------------
     Mocked Data Module
     In a real app this would be fetched from an API.
  ------------------------- */
  const Data = (() => {
    // Current user state
    const state = {
      totalPoints: 1240,
      monthlyEarned: 420,
      monthlySpent: 180,
      streakDays: 6,
      nextUnlock: 1500,
      history: {
        earned: [
          { id: 1, action: 'Airtime purchase', points: 120, date: '2026-01-05', status: 'Completed' },
          { id: 2, action: 'Data bundle', points: 200, date: '2026-01-10', status: 'Completed' },
          { id: 3, action: 'Promo bonus', points: 100, date: '2026-01-12', status: 'Pending' }
        ],
        redeemed: [
          { id: 11, action: 'Discount voucher', points: -150, date: '2025-12-28', status: 'Completed' }
        ]
      },
      breakdown: [
        { id: 'airtime', title: 'Airtime purchases', points: 520, date: 'Last 30 days', icon: '📞' },
        { id: 'data', title: 'Data purchases', points: 420, date: 'Last 30 days', icon: '📶' },
        { id: 'bills', title: 'Bill payments', points: 200, date: 'Last 30 days', icon: '💡' },
        { id: 'promo', title: 'Promotions', points: 100, date: 'Last 30 days', icon: '🎁' }
      ],
      rewards: [
        { id: 'r1', title: '5% Airtime Bonus', cost: 500, desc: 'Get 5% extra airtime on next recharge', img: '🔋' },
        { id: 'r2', title: 'Data Booster 1GB', cost: 1200, desc: 'Redeem 1GB data bundle', img: '📦' },
        { id: 'r3', title: 'Movie Voucher', cost: 2500, desc: 'Watch a movie on us', img: '🎬' }
      ],
      boosts: [
        { id: 'ocean1', label: 'Ocean Hours', next: '2026-01-15T18:00:00Z', multiplier: 2 }
      ],
      trendPercent: 35,
      sevenDayTrend: [10, 20, 30, 25, 40, 35, 50] // sample points per day
    };

    // Utility: determine tier
    function getTier(total) {
      if (total >= 5000) return { key: 'captain', label: 'Captain', min: 5000 };
      if (total >= 1000) return { key: 'navigator', label: 'Navigator', min: 1000 };
      return { key: 'explorer', label: 'Explorer', min: 0 };
    }

    // Random mystery reward generator
    function mysteryReward() {
      const chance = Math.random();
      if (chance < 0.6) return { success: false, message: 'No bonus this time. Try again during Ocean Hours!' };
      const bonus = Math.floor(Math.random() * 300) + 50;
      state.totalPoints += bonus;
      return { success: true, bonus, message: `You won ${bonus} BluePoints!` };
    }

    return {
      state,
      getTier,
      mysteryReward
    };
  })();

  /* -------------------------
     Utilities
  ------------------------- */
  const Utils = {
    formatNumber(n) {
      return n.toLocaleString();
    },
    clamp(v, a, b) {
      return Math.max(a, Math.min(b, v));
    },
    // Simple debounce
    debounce(fn, wait = 200) {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
      };
    }
  };

  /* -------------------------
     Animations Module
     Handles count-up, progress, ring and bar charts.
  ------------------------- */
  const Anim = (() => {
    // Count up animation using requestAnimationFrame
    function countUp(el, start, end, duration = 900, formatter = Utils.formatNumber) {
      const startTime = performance.now();
      const diff = end - start;
      function step(now) {
        const t = Utils.clamp((now - startTime) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        const current = Math.round(start + diff * eased);
        el.textContent = formatter(current);
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    // Animate progress bar width
    function animateProgress(el, percent) {
      el.style.width = `${Utils.clamp(percent, 0, 100)}%`;
    }

    // Animate ring chart (stroke-dasharray)
    function animateRing(pathEl, textEl, percent) {
      const circumference = 100; // normalized for stroke-dasharray
      const dash = Utils.clamp(percent, 0, 100);
      pathEl.setAttribute('stroke-dasharray', `${dash} ${100 - dash}`);
      textEl.textContent = `${Math.round(dash)}%`;
    }

    // Simple bar chart for 7-day trend using SVG rects
    function renderBarChart(svgEl, data = []) {
      const w = 100, h = 60, padding = 6;
      svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svgEl.innerHTML = '';
      const max = Math.max(...data, 1);
      const barWidth = (w - padding * 2) / data.length;
      data.forEach((val, i) => {
        const barH = (val / max) * (h - padding * 2);
        const x = padding + i * barWidth + 4;
        const y = h - padding - barH;
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x.toString());
        rect.setAttribute('y', y.toString());
        rect.setAttribute('width', (barWidth - 8).toString());
        rect.setAttribute('height', barH.toString());
        rect.setAttribute('rx', '3');
        rect.setAttribute('fill', 'url(#barGrad)');
        rect.style.transition = 'height 700ms cubic-bezier(.2,.9,.3,1), y 700ms cubic-bezier(.2,.9,.3,1)';
        svgEl.appendChild(rect);
      });

      // Add gradient defs
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <linearGradient id="barGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#0b74ff"/>
          <stop offset="1" stop-color="#e6f6ff"/>
        </linearGradient>
      `;
      svgEl.prepend(defs);
    }

    return { countUp, animateProgress, animateRing, renderBarChart };
  })();

  /* -------------------------
     UI Module
     DOM caching, rendering and event wiring.
  ------------------------- */
  const UI = (() => {
    // Cache DOM nodes
    const nodes = {
      pointsValue: document.getElementById('pointsValue'),
      toggleEye: document.getElementById('toggleEye'),
      eyeOpen: document.getElementById('eyeOpen'),
      eyeClosed: document.getElementById('eyeClosed'),
      tierLabel: document.getElementById('tierLabel'),
      tierPill: document.getElementById('tierPill'),
      nextUnlock: document.getElementById('nextUnlock'),
      progressFill: document.getElementById('progressFill'),
      progressText: document.getElementById('progressText'),
      redeemBtn: document.getElementById('redeemBtn'),
      quickRedeem: document.getElementById('quickRedeem'),
      breakdownList: document.getElementById('breakdownList'),
      miniEarned: document.querySelector('#miniEarned .mini-value'),
      miniSpent: document.querySelector('#miniSpent .mini-value'),
      miniStreak: document.querySelector('#miniStreak .mini-value'),
      ringFill: document.getElementById('ringFill'),
      ringText: document.getElementById('ringText'),
      barsSvg: document.getElementById('barsSvg'),
      trendPercent: document.getElementById('trendPercent'),
      historyList: document.getElementById('historyList'),
      historyEmpty: document.getElementById('historyEmpty'),
      tabs: document.querySelectorAll('.tab'),
      marketGrid: document.getElementById('marketGrid'),
      modal: document.getElementById('modal'),
      modalBody: document.getElementById('modalBody'),
      modalClose: document.getElementById('modalClose'),
      modalOk: document.getElementById('modalOk'),
      toast: document.getElementById('toast'),
      btnMystery: document.getElementById('btnMystery'),
      btnBoost: document.getElementById('btnBoost'),
      redeemBtnAnchor: document.getElementById('redeemBtn')
    };

    // Render breakdown items
    function renderBreakdown(items) {
      nodes.breakdownList.innerHTML = '';
      items.forEach(it => {
        const el = document.createElement('div');
        el.className = 'breakdown-item';
        el.innerHTML = `
          <div class="breakdown-icon" aria-hidden="true">${it.icon}</div>
          <div class="breakdown-body">
            <div class="breakdown-title">${it.title}</div>
            <div class="breakdown-meta">${it.points} pts • ${it.date}</div>
          </div>
          <div class="breakdown-value"><strong>${Utils.formatNumber(it.points)}</strong></div>
        `;
        nodes.breakdownList.appendChild(el);
      });
    }

    // Render history list for a tab
    function renderHistory(tab = 'earned') {
      const list = Data.state.history[tab] || [];
      nodes.historyList.innerHTML = '';
      if (!list.length) {
        nodes.historyEmpty.hidden = false;
        return;
      }
      nodes.historyEmpty.hidden = true;
      list.forEach(row => {
        const el = document.createElement('div');
        el.className = 'history-row';
        el.innerHTML = `
          <div class="history-left">
            <div class="history-action">${row.action}</div>
            <div class="history-meta">${row.date}</div>
          </div>
          <div class="history-right">
            <div class="history-points">${row.points > 0 ? '+' : ''}${row.points}</div>
            <div class="status ${row.status.toLowerCase() === 'completed' ? 'completed' : 'pending'}">${row.status}</div>
          </div>
        `;
        nodes.historyList.appendChild(el);
      });
    }

    // Render marketplace preview
    function renderMarketplace(rewards, totalPoints) {
      nodes.marketGrid.innerHTML = '';
      rewards.forEach(r => {
        const unlocked = totalPoints >= r.cost;
        const card = document.createElement('div');
        card.className = 'reward-card' + (unlocked ? '' : ' reward-locked');
        card.innerHTML = `
          <div class="reward-thumb" aria-hidden="true">${r.img}</div>
          <div class="reward-body">
            <div class="reward-title">${r.title}</div>
            <div class="reward-desc" style="font-size:13px;color:${unlocked ? '#111' : '#6b7280'}">${r.desc}</div>
          </div>
          <div class="reward-actions">
            <div class="reward-cost">${r.cost}</div>
            <button class="btn primary-cta redeem-action" data-id="${r.id}" ${unlocked ? '' : 'disabled'}>${unlocked ? 'Redeem' : 'Locked'}</button>
          </div>
        `;
        nodes.marketGrid.appendChild(card);
      });
    }

    // Show modal
    function showModal(html) {
      nodes.modalBody.innerHTML = html;
      nodes.modal.setAttribute('aria-hidden', 'false');
      nodes.modal.style.display = 'flex';
      nodes.modal.focus();
    }

    // Hide modal
    function hideModal() {
      nodes.modal.setAttribute('aria-hidden', 'true');
      nodes.modal.style.display = 'none';
    }

    // Show toast
    let toastTimer = null;
    function showToast(msg, ms = 3000) {
      nodes.toast.textContent = msg;
      nodes.toast.style.opacity = '1';
      nodes.toast.setAttribute('aria-hidden', 'false');
      nodes.toast.style.pointerEvents = 'auto';
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        nodes.toast.style.opacity = '0';
        nodes.toast.setAttribute('aria-hidden', 'true');
        nodes.toast.style.pointerEvents = 'none';
      }, ms);
    }

    // Toggle eye (show/hide balance)
    function toggleEye(hide) {
      const pressed = hide === undefined ? nodes.toggleEye.getAttribute('aria-pressed') === 'false' : hide;
      if (pressed === 'true' || pressed === true) {
        // hide
        nodes.pointsValue.textContent = '•••';
        nodes.toggleEye.setAttribute('aria-pressed', 'true');
        nodes.eyeOpen.style.display = 'none';
        nodes.eyeClosed.style.display = 'inline';
        nodes.toggleEye.setAttribute('aria-label', 'Show balance');
      } else {
        // show
        nodes.toggleEye.setAttribute('aria-pressed', 'false');
        nodes.eyeOpen.style.display = 'inline';
        nodes.eyeClosed.style.display = 'none';
        nodes.toggleEye.setAttribute('aria-label', 'Hide balance');
        // re-run count up to current value
        Anim.countUp(nodes.pointsValue, 0, Data.state.totalPoints, 900);
      }
    }

    // Initialize UI with data and animations
    function init() {
      // Hero: points count up
      nodes.pointsValue.textContent = '0';
      Anim.countUp(nodes.pointsValue, 0, Data.state.totalPoints, 900);

      // Tier
      const tier = Data.getTier(Data.state.totalPoints);
      nodes.tierLabel.textContent = tier.label;
      nodes.nextUnlock.textContent = Utils.formatNumber(Data.state.nextUnlock);

      // Progress percent to next tier or reward
      const percent = Math.round((Data.state.totalPoints / Data.state.nextUnlock) * 100);
      Anim.animateProgress(nodes.progressFill, Utils.clamp(percent, 0, 100));
      nodes.progressText.textContent = `You are ${Utils.formatNumber(Math.max(0, Data.state.nextUnlock - Data.state.totalPoints))} points away from next reward`;

      // Mini boxes
      Anim.countUp(nodes.miniEarned, 0, Data.state.monthlyEarned, 700);
      Anim.countUp(nodes.miniSpent, 0, Data.state.monthlySpent, 700);
      Anim.countUp(nodes.miniStreak, 0, Data.state.streakDays, 700);

      // Ring chart: percent used this month (spent / earned+spent)
      const usedPercent = Math.round((Data.state.monthlySpent / Math.max(1, Data.state.monthlyEarned + Data.state.monthlySpent)) * 100);
      Anim.animateRing(nodes.ringFill, nodes.ringText, usedPercent);

      // Bar chart for 7-day trend
      Anim.renderBarChart(nodes.barsSvg, Data.state.sevenDayTrend);
      nodes.trendPercent.textContent = `${Data.state.trendPercent}%`;

      // Breakdown
      renderBreakdown(Data.state.breakdown);

      // History default tab
      renderHistory('earned');

      // Marketplace
      renderMarketplace(Data.state.rewards, Data.state.totalPoints);

      // Attach event listeners
      attachEvents();
    }

    // Attach event listeners
    function attachEvents() {
      // Eye toggle
      nodes.toggleEye.addEventListener('click', () => {
        const pressed = nodes.toggleEye.getAttribute('aria-pressed') === 'true';
        toggleEye(!pressed);
      });

      // Tabs
      nodes.tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          nodes.tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const tabName = tab.dataset.tab;
          // animate tab switch
          nodes.historyList.style.opacity = '0';
          setTimeout(() => {
            renderHistory(tabName);
            nodes.historyList.style.opacity = '1';
          }, 180);
        });
      });

      // Redeem button (marketplace)
      nodes.marketGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.redeem-action');
        if (!btn) return;
        const id = btn.dataset.id;
        const reward = Data.state.rewards.find(r => r.id === id);
        if (!reward) return;
        if (Data.state.totalPoints >= reward.cost) {
          // Simulate redeem flow
          showModal(`<h4>Confirm redemption</h4><p>Redeem <strong>${reward.title}</strong> for <strong>${reward.cost} BluePoints</strong>?</p>`);
          nodes.modalOk.onclick = () => {
            // Deduct points and update UI
            Data.state.totalPoints -= reward.cost;
            hideModal();
            showToast(`Redeemed ${reward.title}. ${Utils.formatNumber(Data.state.totalPoints)} pts remaining`);
            // Update hero and marketplace
            Anim.countUp(nodes.pointsValue, 0, Data.state.totalPoints, 700);
            renderMarketplace(Data.state.rewards, Data.state.totalPoints);
          };
        } else {
          // Locked
          showModal(`<h4>Locked reward</h4><p>This reward unlocks at <strong>${reward.cost} BluePoints</strong>. Keep earning to redeem great rewards.</p>`);
          nodes.modalOk.onclick = hideModal;
        }
      });

      // Redeem CTA (top)
      nodes.redeemBtnAnchor.addEventListener('click', (e) => {
        // For demo, marketplace is preview only
        e.preventDefault();
        showModal(`<h4>Coming soon</h4><p>Our loyalty marketplace is coming soon. Stay tuned — exciting rewards are on the way!</p>`);
        nodes.modalOk.onclick = hideModal;
      });

      // Quick Redeem (disabled if not enough)
      nodes.quickRedeem.addEventListener('click', () => {
        showToast('Quick Redeem is not available yet. Visit the marketplace preview below.');
      });

      // Modal close
      nodes.modalClose.addEventListener('click', hideModal);
      nodes.modal.addEventListener('click', (e) => {
        if (e.target === nodes.modal) hideModal();
      });

      // Mystery reward button
      nodes.btnMystery.addEventListener('click', () => {
        const result = Data.mysteryReward();
        if (result.success) {
          // animate bonus
          showModal(`<h4>Surprise!</h4><p>${result.message}</p>`);
          nodes.modalOk.onclick = () => {
            hideModal();
            // update UI
            Anim.countUp(nodes.pointsValue, 0, Data.state.totalPoints, 900);
            Anim.countUp(nodes.miniEarned, 0, Data.state.monthlyEarned += result.bonus, 900);
            renderMarketplace(Data.state.rewards, Data.state.totalPoints);
            showToast(`Bonus added: ${result.bonus} pts`);
          };
        } else {
          showToast(result.message);
        }
      });

      // Boosts button
      nodes.btnBoost.addEventListener('click', () => {
        const next = Data.state.boosts[0];
        const when = new Date(next.next);
        showModal(`<h4>${next.label}</h4><p>Next double-points event: <strong>${when.toLocaleString()}</strong>. Multiplier: x${next.multiplier}</p>`);
        nodes.modalOk.onclick = hideModal;
      });

      // Keyboard accessibility: close modal with Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hideModal();
      });

      // Reward locked buttons show friendly message
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('button[disabled]');
        if (btn && btn.classList.contains('redeem-action')) {
          showToast('This reward is locked. Earn more BluePoints to unlock.');
        }
      });

      // Responsive adjustments (example: re-render charts on resize)
      window.addEventListener('resize', Utils.debounce(() => {
        Anim.renderBarChart(nodes.barsSvg, Data.state.sevenDayTrend);
      }, 220));
    }

    return { init, showModal, hideModal, showToast };
  })();

  /* -------------------------
     Initialize app on DOMContentLoaded
  ------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    UI.init();
  });

})();

