// script.js
// External JS: network detection, validation, UI interactions

(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const networkButtons = document.querySelectorAll('.network-btn');
  const planButtons = document.querySelectorAll('.plan-btn');
  const phoneInput = document.getElementById('phone');
  const phoneHint = document.getElementById('phone-hint');
  const amountInput = document.getElementById('amount');
  const summaryNetwork = document.getElementById('summary-network');
  const summaryPlan = document.getElementById('summary-plan');
  const summaryRecipient = document.getElementById('summary-recipient');
  const buyBtn = document.getElementById('buy-btn');
  const buyNowInline = document.getElementById('buy-now-inline');

  const confirmModal = document.getElementById('confirm-modal');
  const confirmText = document.getElementById('confirm-text');
  const confirmAmountEl = document.getElementById('confirm-amount');
  const confirmRecipientEl = document.getElementById('confirm-recipient');
  const confirmNetworkEl = document.getElementById('confirm-network');
  const confirmCancel = document.getElementById('confirm-cancel');
  const confirmOk = document.getElementById('confirm-ok');

  // Wallet simulation (for optional checks)
  const walletBalanceEl = document.getElementById('wallet-balance');
  let walletBalance = parseFloat(walletBalanceEl.textContent || '1200');

  // Common Nigerian mobile prefixes (not exhaustive — adjust if needed)
  const PREFIX_MAP = {
    MTN: ['0703','0706','0803','0806','0810','0813','0814','0816','0903','0906','0913'],
    GLO: ['0705','0805','0807','0815','0811','0905'],
    AIRTEL: ['0701','0708','0802','0808','0812','0902','0907','0912'],
    '9MOBILE': ['0809','0817','0818','0909','0908']
  };

  function normalizePhone(raw) {
    if (!raw) return '';
    let s = raw.trim();
    // remove non-digit except leading +
    s = s.replace(/[^\d+]/g,'');
    if (s.startsWith('+234')) {
      // convert to 0XXXXXXXXXX
      s = '0' + s.slice(4);
    }
    if (s.startsWith('234') && s.length === 13) {
      s = '0' + s.slice(3);
    }
    return s;
  }

  function detectNetwork(phoneNormalized) {
    // expects phoneNormalized like 08031234567
    if (!phoneNormalized) return null;
    for (const [network, prefixes] of Object.entries(PREFIX_MAP)) {
      for (const p of prefixes) {
        if (phoneNormalized.startsWith(p)) return network;
      }
    }
    return null;
  }

  function updateNetworkUI(network) {
    networkButtons.forEach(btn => {
      if (btn.dataset.network.toUpperCase() === (network || '').toUpperCase()) {
        btn.classList.add('active');
        summaryNetwork.textContent = btn.dataset.network;
      } else {
        btn.classList.remove('active');
      }
    });
    if (!network) summaryNetwork.textContent = '—';
  }

  // When user clicks a network button
  networkButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const net = btn.dataset.network;
      updateNetworkUI(net);
      // Keep current phone but allow manual override
    });
  });

  // When user clicks plan buttons
  planButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      planButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      amountInput.value = btn.dataset.amount;
      summaryPlan.textContent = `₦${Number(btn.dataset.amount).toLocaleString()}`;
    });
  });

  // Validate phone input (Nigerian numbers only)
  function validatePhoneDisplay(raw) {
    const normalized = normalizePhone(raw);
    // Accept 11-digit local starting with 0 and length 11, after normalization
    const ok = /^0\d{10}$/.test(normalized);
    if (!raw) {
      phoneHint.textContent = 'Nigerian numbers only • digits only';
      phoneHint.style.color = '';
    } else if (!ok) {
      phoneHint.textContent = 'Invalid Nigerian number. Use 0XXXXXXXXXX or +234XXXXXXXXXX';
      phoneHint.style.color = 'crimson';
    } else {
      phoneHint.textContent = 'Valid Nigerian number';
      phoneHint.style.color = 'var(--success)';
    }
    return {ok, normalized};
  }

  // Phone input handler (live)
  phoneInput.addEventListener('input', (e) => {
    // strip anything but digits and plus sign at start
    const raw = phoneInput.value;
    const {ok, normalized} = validatePhoneDisplay(raw);
    if (normalized) {
      const net = detectNetwork(normalized);
      if (net) {
        updateNetworkUI(net);
      }
      summaryRecipient.textContent = normalized || '—';
    } else {
      summaryRecipient.textContent = '—';
      updateNetworkUI(null);
    }
  });

  // When amount input changes, update summary and clear selected plan if manual
  amountInput.addEventListener('input', () => {
    const val = Number(amountInput.value || 0);
    if (!Number.isFinite(val) || val <= 0) {
      summaryPlan.textContent = '—';
    } else {
      summaryPlan.textContent = `₦${val.toLocaleString()}`;
    }
    // unselect plan buttons unless one matches exactly
    let matched = false;
    planButtons.forEach(b => {
      if (Number(b.dataset.amount) === val) {
        b.classList.add('selected');
        matched = true;
      } else {
        b.classList.remove('selected');
      }
    });
    if (!matched) {
      planButtons.forEach(b => b.classList.remove('selected'));
    }
  });

  // Buy button behavior
  function canProceed() {
    const {ok, normalized} = validatePhoneDisplay(phoneInput.value);
    if (!ok) return {ok:false, reason:'Please provide a valid Nigerian phone number.'};
    const amount = Number(amountInput.value || 0);
    if (!Number.isFinite(amount) || amount < 15) return {ok:false, reason:'Amount must be at least ₦15.'};
    if (amount > 500000) return {ok:false, reason:'Amount exceeds maximum ₦500,000.'};
    // optional wallet check (simulate)
    // if (amount > walletBalance) return {ok:false, reason:'Insufficient wallet balance.'};
    return {ok:true, normalized, amount};
  }

  function showConfirm({normalized, amount, network}) {
    confirmAmountEl.textContent = `₦${amount.toLocaleString()}`;
    confirmRecipientEl.textContent = normalized;
    confirmNetworkEl.textContent = network || '—';
    confirmModal.setAttribute('aria-hidden', 'false');
  }

  function hideConfirm() {
    confirmModal.setAttribute('aria-hidden', 'true');
  }

  buyBtn.addEventListener('click', () => {
    const check = canProceed();
    if (!check.ok) {
      alert(check.reason);
      return;
    }
    // choose network from active button
    const activeNetBtn = document.querySelector('.network-btn.active');
    const network = activeNetBtn ? activeNetBtn.dataset.network : (detectNetwork(check.normalized) || '—');
    showConfirm({normalized: check.normalized, amount: check.amount, network});
  });

  buyNowInline.addEventListener('click', () => {
    // same as main buy
    buyBtn.click();
  });

  confirmCancel.addEventListener('click', hideConfirm);

  confirmOk.addEventListener('click', () => {
    // simulate successful purchase
    const check = canProceed();
    if (!check.ok) { alert(check.reason); hideConfirm(); return; }
    // reduce wallet simulation
    // walletBalance -= check.amount; walletBalanceEl.textContent = walletBalance.toLocaleString();
    hideConfirm();
    // animate success
    const old = confirmText.textContent;
    confirmText.textContent = 'Processing…';
    setTimeout(() => {
      confirmText.textContent = 'Purchase successful! Airtime delivered.';
      setTimeout(() => {
        hideConfirm();
        confirmText.textContent = old;
        // clear inputs
        // amountInput.value = '';
        // phoneInput.value = '';
      }, 1400);
    }, 900);
  });

  // Modal click outside to close
  confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) hideConfirm();
  });

  // Theme toggle
  function setDarkMode(enabled) {
    if (enabled) {
      document.documentElement.classList.add('dark');
      themeToggle.textContent = '☀️';
    } else {
      document.documentElement.classList.remove('dark');
      themeToggle.textContent = '🌙';
    }
  }
  // initial theme: light
  setDarkMode(false);
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setDarkMode(isDark);
  });

  // Accessibility: keyboard navigation for network & plan buttons
  function setupKeyboardGroup(containerSelector, btnSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const buttons = container.querySelectorAll(btnSelector);
    buttons.forEach((btn, i) => {
      btn.setAttribute('tabindex','0');
      btn.addEventListener('keydown', (ev) => {
        if (ev.key === 'ArrowRight') {
          ev.preventDefault();
          const next = buttons[(i+1)%buttons.length]; next.focus();
        } else if (ev.key === 'ArrowLeft') {
          ev.preventDefault();
          const prev = buttons[(i-1+buttons.length)%buttons.length]; prev.focus();
        }
      });
    });
  }
  setupKeyboardGroup('#network-list', '.network-btn');
  setupKeyboardGroup('#plans', '.plan-btn');

  // small UX: format amount as user leaves input
  amountInput.addEventListener('blur', () => {
    const val = Number(amountInput.value || 0);
    if (!Number.isFinite(val) || val === 0) return;
    amountInput.value = Math.round(val);
  });

  // initial summary values
  summaryNetwork.textContent = '—';
  summaryPlan.textContent = '—';
  summaryRecipient.textContent = '—';

  // small protection: prevent non-digit chars in amount and phone input (but allow + for phone)
  phoneInput.addEventListener('keypress', (e) => {
    const allowed = /[0-9+\s]/;
    if (!allowed.test(e.key)) e.preventDefault();
  });
  amountInput.addEventListener('keypress', (e) => {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  });

  // Optional: pre-fill demo values for faster testing
  // phoneInput.value = '08031234567'; phoneInput.dispatchEvent(new Event('input'));
})();

