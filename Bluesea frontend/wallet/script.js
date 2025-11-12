/* wallet/script.js
   - Right-side entry animation on load
   - searchable bank dropdown (50 banks)
   - recipient stays visible and withdraw slides below
   - modal overlay blue tint
   - improved eye visibility
   - fee = percent(0.3%) with min 1.50
*/
(function () {
  'use strict';

  const THEME_KEY = 'wallet.theme';
  const TOTAL_HIDDEN_KEY = 'wallet.totalHidden';

  const FEE_PERCENT = 0.003; // 0.3%
  const FEE_MIN = 1.50;

  // 50 banks (code & name). We'll generate inline SVG placeholders programmatically.
  const BANK_LIST = [
    { code: 'ACCESS', name: 'Access Bank' },
    { code: 'GTB', name: 'Guaranty Trust Bank' },
    { code: 'ZENITH', name: 'Zenith Bank' },
    { code: 'UBA', name: 'UBA' },
    { code: 'FIRST', name: 'First Bank' },
    { code: 'FCMB', name: 'FCMB' },
    { code: 'STERLING', name: 'Sterling Bank' },
    { code: 'UNION', name: 'Union Bank' },
    { code: 'ECO', name: 'Ecobank' },
    { code: 'STANBIC', name: 'Stanbic IBTC' },
    { code: 'WEMA', name: 'Wema Bank' },
    { code: 'PROVIDUS', name: 'Providus Bank' },
    { code: 'POLARIS', name: 'Polaris Bank' },
    { code: 'OPAY', name: 'OPay' },
    { code: 'PAGA', name: 'Paga' },
    { code: 'MONIEPOINT', name: 'Moniepoint' },
    { code: 'CITIBANK', name: 'Citi Bank' },
    { code: 'KEYSTONE', name: 'Keystone Bank' },
    { code: 'FIDELITY', name: 'Fidelity Bank' },
    { code: 'UNITY', name: 'Unity Bank' },
    { code: 'HERITAGE', name: 'Heritage Bank' },
    { code: 'STANDARD', name: 'Standard Chartered' },
    { code: 'ACCESSCORP', name: 'AccessCorp' },
    { code: 'KALD', name: 'Kuda Bank' },
    { code: 'OPPO', name: 'Opay Micro' },
    { code: 'STERLNG', name: 'Sterling (Alt)' },
    { code: 'CHAP', name: 'Chapman Bank' },
    { code: 'LOANS', name: 'Loans Bank' },
    { code: 'SIMPLE', name: 'Simple Bank' },
    { code: 'ALAT', name: 'ALAT by WEMA' },
    { code: 'GTCO', name: 'GTCO (alias)' },
    { code: 'HERIT', name: 'Heritage (alt)' },
    { code: 'MFB1', name: 'MicroBank One' },
    { code: 'MFB2', name: 'MicroBank Two' },
    { code: 'CORAL', name: 'Coral Bank' },
    { code: 'NLNB', name: 'NLN Bank' },
    { code: 'SOV', name: 'Sovereign Bank' },
    { code: 'PAYSTACK', name: 'Paystack Bank' },
    { code: 'FLUTTER', name: 'Flutter Bank' },
    { code: 'MOB', name: 'Mobile Bank' },
    { code: 'NEX', name: 'Next Bank' },
    { code: 'LAGO', name: 'Lagos State Bank' },
    { code: 'RUBY', name: 'Ruby Bank' },
    { code: 'BLUE', name: 'Blue Bank' },
    { code: 'ORANGE', name: 'Orange Bank' },
    { code: 'GREEN', name: 'Green Bank' },
    { code: 'TRUST', name: 'Trust Bank' },
    { code: 'SUMMIT', name: 'Summit Bank' },
    { code: 'ZEN', name: 'Zen Fintech' }
  ];

  // Utilities to create placeholder SVG logos (keeps the code self-contained).
  function svgPlaceholder(text, w = 120, h = 40, bg = null) {
    const color = bg || colorFromString(text);
    const safeText = (text || '').toUpperCase().replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    const fontSize = Math.max(8, Math.min(12, Math.floor(w / Math.max(6, safeText.length))));
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"><rect width="${w}" height="${h}" rx="6" fill="${color}"/><text x="50%" y="58%" text-anchor="middle" fill="#fff" font-family="Poppins, Arial, sans-serif" font-weight="700" font-size="${fontSize}">${safeText}</text></svg>`;
  }
  function colorFromString(s) {
    // quick deterministic pastel color from string
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
    const hue = Math.abs(h) % 360;
    return `hsl(${hue} 75% 30%)`;
  }

  // DOM refs
  const body = document.body;
  const menuItems = Array.from(document.querySelectorAll('.wallet_menu_item'));
  const themeToggleBtn = document.getElementById('wallet_theme_toggle');

  const totalEyeBtn = document.getElementById('wallet_total_eye_btn');
  const totalEyeIcon = document.getElementById('wallet_total_eye_icon');
  const totalBalanceValueEl = document.getElementById('wallet_total_balance_value');

  const withdrawBtn = document.getElementById('wallet_withdraw_btn');
  const recipientWrap = document.getElementById('wallet_recipient_wrap');
  const accountInput = document.getElementById('wallet_account_input');
  const accountHelper = document.getElementById('wallet_account_helper');

  const bankDropdown = document.getElementById('wallet_bank_dropdown');
  const bankToggle = document.getElementById('wallet_bank_toggle');
  const bankList = document.getElementById('wallet_bank_list');
  const bankSelected = document.getElementById('wallet_bank_selected');

  const recipientNext = document.getElementById('wallet_recipient_next');

  const withdrawWrap = document.getElementById('wallet_withdraw_wrap');
  const withdrawName = document.getElementById('wallet_withdraw_name');
  const withdrawSub = document.getElementById('wallet_withdraw_sub');
  const withdrawBankLogo = document.getElementById('wallet_withdraw_bank_logo');
  const withdrawAmountInput = document.getElementById('wallet_withdraw_amount');
  const withdrawRemarkInput = document.getElementById('wallet_withdraw_remark');
  const quickChipsRow = document.getElementById('wallet_quick_chips');
  const confirmBtn = document.getElementById('wallet_confirm_btn');
  const cancelBtn = document.getElementById('wallet_cancel_btn');

  // modal refs
  const confirmModal = document.getElementById('wallet_confirm_modal');
  const confirmTitle = document.getElementById('wallet_confirm_title');
  const confirmText = document.getElementById('wallet_confirm_text');
  const confirmName = document.getElementById('confirm_name');
  const confirmAccount = document.getElementById('confirm_account');
  const confirmBank = document.getElementById('confirm_bank');
  const confirmAmount = document.getElementById('confirm_amount');
  const confirmFeeRow = document.getElementById('confirm_fee_row');
  const confirmFee = document.getElementById('confirm_fee');
  const confirmRecheck = document.getElementById('wallet_confirm_recheck');
  const confirmContinue = document.getElementById('wallet_confirm_continue');

  let selectedBank = null;
  let lookupTimer = null;
  let lookupController = null;
  const DEBOUNCE_MS = 400;
  const QUICK_AMOUNTS = [500, 1000, 2500, 5000, 10000, 20000];

  /* THEME */
  function getSavedTheme() {
    const v = localStorage.getItem(THEME_KEY);
    return (v === 'light' || v === 'dark') ? v : 'light';
  }
  function applyTheme(theme) {
    if (theme === 'light') body.classList.add('wallet-theme-light');
    else body.classList.remove('wallet-theme-light');
    themeToggleBtn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    themeToggleBtn.textContent = theme === 'light' ? 'Light' : 'Dark';
    localStorage.setItem(THEME_KEY, theme);
  }

  /* TOTAL VISIBILITY */
  function isTotalHidden() { return localStorage.getItem(TOTAL_HIDDEN_KEY) === 'true'; }
  function setTotalHidden(v) { localStorage.setItem(TOTAL_HIDDEN_KEY, v ? 'true' : 'false'); }
  function applyTotalVisibility(hidden) {
    setTotalHidden(hidden);
    if (!totalBalanceValueEl) return;
    if (hidden) {
      totalBalanceValueEl.textContent = '*****';
      totalBalanceValueEl.classList.add('wallet-hidden');
      totalEyeBtn.setAttribute('aria-pressed', 'true');
      totalEyeIcon.innerHTML = '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><path d="M3 3l18 18"></path>';
    } else {
      totalEyeBtn.setAttribute('aria-pressed', 'false');
      totalEyeIcon.innerHTML = '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>';
      const orig = totalBalanceValueEl.dataset.original || '₦0.00';
      totalBalanceValueEl.textContent = orig;
      totalBalanceValueEl.classList.remove('wallet-hidden');
    }
  }

  /* Build the bank list UI with a search input */
  function buildBankList() {
    bankList.innerHTML = '';
    // search input
    const search = document.createElement('input');
    search.type = 'search';
    search.placeholder = 'Type to search bank...';
    search.className = 'wallet_bank_search';
    bankList.appendChild(search);

    // container for options
    const optsWrap = document.createElement('div');
    optsWrap.className = 'wallet_bank_options_wrap';
    bankList.appendChild(optsWrap);

    function renderOptions(filter = '') {
      optsWrap.innerHTML = '';
      const normalized = (filter || '').trim().toLowerCase();
      const filtered = BANK_LIST.filter(b => b.name.toLowerCase().includes(normalized) || b.code.toLowerCase().includes(normalized));
      filtered.forEach(b => {
        const row = document.createElement('div');
        row.className = 'wallet_bank_option';
        row.setAttribute('role','option');
        row.tabIndex = 0;
        row.setAttribute('data-code', b.code);
        const logoSvg = svgPlaceholder(b.code, 120, 40, colorFromString(b.code));
        row.innerHTML = `<div class="bank-logo" aria-hidden="true">${logoSvg}</div><div>${b.name}</div>`;
        row.addEventListener('click', () => {
          chooseBank(b.code);
          closeBankList();
          accountInput && accountInput.focus();
          maybeTriggerLookup();
        });
        row.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault(); row.click();
          } else if (ev.key === 'ArrowDown') {
            const next = row.nextElementSibling;
            if (next) next.focus();
          } else if (ev.key === 'ArrowUp') {
            const prev = row.previousElementSibling;
            if (prev) prev.focus();
          }
        });
        optsWrap.appendChild(row);
      });
      if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'wallet_bank_option';
        empty.style.opacity = '0.6';
        empty.style.cursor = 'default';
        empty.innerHTML = `<div style="padding:10px;color:var(--wallet-text-muted)">No banks match "${filter}"</div>`;
        optsWrap.appendChild(empty);
      }
    }

    search.addEventListener('input', (e) => { renderOptions(e.target.value); });
    search.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowDown') {
        const first = optsWrap.querySelector('.wallet_bank_option');
        if (first) first.focus();
      }
    });

    // initial render
    renderOptions('');
    return { search, optsWrap };
  }

  function openBankList() {
    bankList.classList.add('is-open');
    bankList.setAttribute('aria-hidden', 'false');
    bankToggle.setAttribute('aria-expanded', 'true');
    const search = bankList.querySelector('.wallet_bank_search');
    if (search) search.focus();
  }
  function closeBankList() {
    bankList.classList.remove('is-open');
    bankList.setAttribute('aria-hidden', 'true');
    bankToggle.setAttribute('aria-expanded', 'false');
  }

  function chooseBank(code) {
    selectedBank = BANK_LIST.find(x => x.code === code) || null;
    const name = selectedBank ? selectedBank.name : 'Select bank';
    const logoHTML = svgPlaceholder(selectedBank ? selectedBank.code : 'BANK', 120, 40, colorFromString(code || name));
    const logoNode = bankSelected.querySelector('.bank-logo');
    if (logoNode) logoNode.innerHTML = logoHTML;
    const nameNode = bankSelected.querySelector('.bank-name');
    if (nameNode) nameNode.textContent = name;
    if (selectedBank) withdrawBankLogo.innerHTML = svgPlaceholder(selectedBank.code, 56, 56, colorFromString(selectedBank.code));
  }

  /* lookup simulation */
  function scheduleLookup() {
    if (lookupTimer) clearTimeout(lookupTimer);
    lookupTimer = setTimeout(() => doLookup(), DEBOUNCE_MS);
  }

  async function doLookup() {
    const acct = (accountInput.value || '').trim();
    if (!acct) return;
    lookupController && lookupController.abort();
    lookupController = new AbortController();
    accountHelper.textContent = 'Looking up account…';
    accountHelper.style.color = 'var(--wallet-text-muted)';
    try {
      await new Promise(r => setTimeout(r, 900)); // simulate lookup latency
      const digits = acct.replace(/\D/g,'');
      if (digits.length >= 10 || selectedBank) {
        const name = 'PETER JAMES'; // demo resolved name
        const bankName = selectedBank ? selectedBank.name : 'Selected Bank';
        accountHelper.textContent = `${name} — ${bankName}`;
        accountHelper.style.color = 'var(--wallet-text)';
        withdrawName.textContent = name;
        withdrawSub.textContent = `${digits} • ${bankName}`;
        recipientNext.disabled = false;
      } else {
        accountHelper.textContent = 'Account not found';
        accountHelper.style.color = '#ffb4b4';
        recipientNext.disabled = true;
      }
    } catch (err) {
      accountHelper.textContent = 'Lookup canceled';
      accountHelper.style.color = '#ffb4b4';
      recipientNext.disabled = true;
    } finally {
      lookupController = null;
    }
  }

  function maybeTriggerLookup() {
    const account = (accountInput.value || '').trim();
    if (!account) return;
    if (account.replace(/\D/g,'').length >= 10 || selectedBank) scheduleLookup();
  }

  /* show/hide recipient/withdraw. Important: recipient stays visible while withdraw slides in below */
  function showRecipient(visible) {
    const r = document.getElementById('wallet_recipient_wrap');
    if (!r) return;
    if (visible) {
      r.classList.add('is-visible'); r.setAttribute('aria-hidden','false');
      setTimeout(()=>accountInput && accountInput.focus(), 260);
    } else {
      r.classList.remove('is-visible'); r.setAttribute('aria-hidden','true');
    }
  }
  function showWithdraw(visible) {
    const w = document.getElementById('wallet_withdraw_wrap');
    if (!w) return;
    if (visible) {
      w.classList.add('is-visible'); w.setAttribute('aria-hidden','false');
      setTimeout(()=>withdrawAmountInput && withdrawAmountInput.focus(), 260);
    } else {
      w.classList.remove('is-visible'); w.setAttribute('aria-hidden','true');
    }
  }

  function resetWithdrawFlow() {
    accountInput.value = '';
    accountHelper.textContent = '';
    selectedBank = null;
    chooseBank(null);
    recipientNext.disabled = true;
    withdrawAmountInput.value = '';
    withdrawRemarkInput.value = '';
    withdrawName.textContent = '—';
    withdrawSub.textContent = '—';
    withdrawBankLogo.innerHTML = '';
    quickChipsRow.innerHTML = '';
    showWithdraw(false);
    showRecipient(false);
    if (lookupTimer) clearTimeout(lookupTimer);
    if (lookupController) {
      try { lookupController.abort(); } catch(e){}
      lookupController = null;
    }
  }

  function buildQuickChips() {
    quickChipsRow.innerHTML = '';
    QUICK_AMOUNTS.forEach(a => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'wallet-chip';
      b.textContent = `₦${a}`;
      b.dataset.amount = a;
      b.addEventListener('click', () => {
        document.querySelectorAll('.wallet-chip.selected').forEach(x=>x.classList.remove('selected'));
        b.classList.add('selected');
        withdrawAmountInput.value = String(a);
      });
      quickChipsRow.appendChild(b);
    });
  }

  function computeFee(amount) {
    const n = Number(amount) || 0;
    const raw = n * FEE_PERCENT;
    const fee = Math.max(FEE_MIN, raw);
    return Math.round(fee * 100) / 100;
  }
  function formatNumber(n) {
    if (typeof n !== 'number') n = Number(n) || 0;
    return n.toLocaleString(undefined, { minimumFractionDigits: (n % 1 === 0 ? 0 : 2), maximumFractionDigits: 2 });
  }

  /* Modal handling */
  let modalMode = 'reminder'; // 'reminder' | 'summary'
  function openConfirmModal(mode = 'reminder') {
    modalMode = mode;
    confirmName.textContent = withdrawName.textContent || '—';
    confirmAccount.textContent = (accountInput.value || '—');
    confirmBank.textContent = selectedBank ? selectedBank.name : '—';
    const amountRaw = withdrawAmountInput.value ? Number(withdrawAmountInput.value) : 0;
    confirmAmount.textContent = amountRaw ? `₦${formatNumber(amountRaw)}` : '—';

    if (mode === 'reminder') {
      confirmFeeRow.style.display = 'none';
      confirmTitle.textContent = 'Reminder';
      confirmText.textContent = 'Double check the withdrawals details before you proceed. Please note that successful withdrawals cannot be reversed';
      confirmContinue.textContent = 'Continue';
    } else {
      const fee = computeFee(amountRaw);
      confirmFeeRow.style.display = '';
      confirmFee.textContent = `₦${formatNumber(fee)}`;
      confirmTitle.textContent = 'Confirmation';
      confirmText.textContent = '';
      confirmContinue.textContent = 'Continue';
    }

    confirmModal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    setTimeout(()=>confirmContinue && confirmContinue.focus(), 200);
  }
  function closeConfirmModal() {
    confirmModal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    setTimeout(()=>confirmBtn && confirmBtn.focus(), 160);
  }

  function goToSummary() {
    confirmText.textContent = 'Calculating fee…';
    confirmFeeRow.style.display = 'none';
    setTimeout(() => {
      // show summary (fee)
      openConfirmModal('summary');
    }, 700);
  }

  /* wiring */
  function wire() {
    // nav items: navigate to fragment files (simple redirect)
    menuItems.forEach(mi => {
      mi.addEventListener('click', () => {
        const target = mi.dataset.fragment;
        if (target) {
          window.location.href = target;
        }
      });
    });

    themeToggleBtn.addEventListener('click', () => {
      const cur = getSavedTheme();
      const next = cur === 'light' ? 'dark' : 'light';
      applyTheme(next);
    });
    applyTheme(getSavedTheme());

    totalEyeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const curr = isTotalHidden();
      applyTotalVisibility(!curr);
    });
    applyTotalVisibility(isTotalHidden());

    // Withdraw flow
    withdrawBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showRecipient(true);
      showWithdraw(false);
      closeBankList();
    });

    accountInput.addEventListener('input', (e) => {
      const val = e.target.value.replace(/[^\d]/g,'');
      e.target.value = val;
      accountHelper.textContent = '';
      recipientNext.disabled = true;
      if (val.length >= 10 || selectedBank) scheduleLookup();
    });
    accountInput.addEventListener('blur', () => { maybeTriggerLookup(); });

    // bank dropdown
    buildBankList();
    bankToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const open = bankList.classList.contains('is-open');
      if (open) closeBankList(); else openBankList();
    });
    document.addEventListener('click', (e) => {
      if (!bankDropdown.contains(e.target)) closeBankList();
    });

    recipientNext.addEventListener('click', async (e) => {
      e.preventDefault();
      await doLookup();
      buildQuickChips();
      // show both: recipient stays visible, withdraw slides down below
      showRecipient(true);
      showWithdraw(true);
      closeBankList();
    });

    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      resetWithdrawFlow();
    });

    confirmBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openConfirmModal('reminder');
    });

    confirmRecheck.addEventListener('click', (e) => {
      e.preventDefault();
      closeConfirmModal();
      showWithdraw(true);
      showRecipient(true);
    });

    confirmContinue.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirmFeeRow.style.display === 'none') {
        goToSummary(); // reminder -> summary
      } else {
        // final Continue - demo no-op, micro animation for confirmation
        confirmContinue.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-4px)' }, { transform: 'translateY(0)' }], { duration: 260, easing: 'ease-out' });
      }
    });

    // quick chips selection
    buildQuickChips();

    // small bells and helpers
    const bell = document.getElementById('wallet_bell');
    if (bell) bell.addEventListener('click', (ev) => { ev.preventDefault(); bell.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-12deg)' }, { transform: 'rotate(0deg)' }], { duration: 360 }); });

    const viewAll = document.getElementById('wallet_view_all');
    if (viewAll) viewAll.addEventListener('click', (e)=>{ e.preventDefault(); /* demo: no-op */ });
  }

  /* right-side entry animation on load */
  function startEntryAnimation() {
    const page = document.querySelector('.wallet_page');
    if (!page) return;
    // force reflow then add entered
    requestAnimationFrame(() => {
      page.classList.add('entered');
    });
  }

  function getSavedTheme() {
    const v = localStorage.getItem(THEME_KEY);
    return (v === 'light' || v === 'dark') ? v : 'dark';
  }

  /* init */
  window.addEventListener('DOMContentLoaded', () => {
    wire();
    // fire entry animation for right-side content
    startEntryAnimation();
  });

})();
