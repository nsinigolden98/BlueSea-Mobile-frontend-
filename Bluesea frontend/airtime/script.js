/* airtime - script.js (updated)
   - Theme toggle (light default)
   - Smart Top-up focus behavior
   - Phone input stacked above summary and updates
   - Chip selection (networks, plans) no defaults
   - Custom amount prefix behavior (prefix static in DOM)
   - Summary updates and CTA enable/disable
   - Entrance animation from right -> left
*/

(function(){
  // DOM refs
  const body = document.querySelector('.airtime_body');
  const themeToggle = document.getElementById('airtime_theme_toggle');

  const rightPanel = document.getElementById('airtime_right_panel');

  const topupCard = document.getElementById('airtime_topup_card');

  const phoneInput = document.getElementById('airtime_phone_input');

  const networksContainer = document.getElementById('airtime_networks');
  const plansContainer = document.getElementById('airtime_plans');
  const customAmountInput = document.getElementById('airtime_custom_amount');

  const summaryNetwork = document.getElementById('airtime_summary_network');
  const summaryPlan = document.getElementById('airtime_summary_plan');
  const summaryRecipient = document.getElementById('airtime_summary_recipient');

  const buyBtn = document.getElementById('airtime_buy_btn');
  const buyLabel = document.getElementById('airtime_buy_label');
  const ctaSpinner = document.getElementById('airtime_cta_spinner');

  // state
  const state = {
    network: null,
    plan: null,
    customAmount: null,
    phone: '',
    inFlight: false,
    walletBalance: 50000 // mock ₦ balance
  };

  function formatNaira(n) {
    if (n === null || n === undefined || n === '') return '—';
    const v = Number(n);
    if (Number.isNaN(v)) return '—';
    return '₦' + v.toLocaleString();
  }

  function setSummary(){
    summaryNetwork.textContent = state.network || '—';
    summaryPlan.textContent = state.customAmount ? formatNaira(state.customAmount) : (state.plan ? formatNaira(state.plan) : '—');
    summaryRecipient.textContent = state.phone || '—';
  }

  function isValidPhone(p){
    if (!p) return false;
    const digits = p.replace(/\D/g,'');
    return digits.length >= 7 && digits.length <= 15;
  }

  function effectiveAmount(){
    if (state.customAmount) return Number(state.customAmount);
    if (state.plan) return Number(state.plan);
    return null;
  }

  function updateCTAState(){
    const amt = effectiveAmount();
    const phoneOk = isValidPhone(state.phone);
    const enough = amt ? (state.walletBalance >= amt) : false;
    const enabled = !!(amt && phoneOk && enough && !state.inFlight && !!state.network);
    buyBtn.disabled = !enabled;
    buyBtn.setAttribute('aria-disabled', String(!enabled));
  }

  // Light default
  if (!body.classList.contains('airtime_lightmode') && !body.classList.contains('airtime_darkmode')){
    body.classList.add('airtime_lightmode');
  }
  themeToggle.checked = body.classList.contains('airtime_darkmode');

  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked){
      body.classList.remove('airtime_lightmode');
      body.classList.add('airtime_darkmode');
    } else {
      body.classList.remove('airtime_darkmode');
      body.classList.add('airtime_lightmode');
    }
  });

  // entrance animation
  window.requestAnimationFrame(() => {
    setTimeout(() => rightPanel.classList.add('airtime_in'), 80);
  });

  // Top-up click -> focus phone input (no upload)
  if (topupCard){
    topupCard.addEventListener('click', () => {
      phoneInput.focus();
    });
    topupCard.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); topupCard.click(); } });
  }

  // networks selection (no defaults)
  networksContainer.querySelectorAll('.airtime_network_chip').forEach(btn => {
    btn.addEventListener('click', () => {
      networksContainer.querySelectorAll('.airtime_network_chip').forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      state.network = btn.getAttribute('data-value') || btn.textContent.trim();
      setSummary(); updateCTAState();
    });
    btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') btn.click(); });
  });

  // plans selection
  plansContainer.querySelectorAll('.airtime_plan_chip').forEach(btn => {
    btn.addEventListener('click', () => {
      customAmountInput.value = '';
      state.customAmount = null;
      plansContainer.querySelectorAll('.airtime_plan_chip').forEach(b => b.setAttribute('aria-pressed','false'));
      btn.setAttribute('aria-pressed','true');
      state.plan = Number(btn.getAttribute('data-value')) || null;
      setSummary(); updateCTAState();
    });
    btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') btn.click(); });
  });

  // custom amount input (overrides plan)
  customAmountInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val === '' || Number(val) <= 0) {
      state.customAmount = null;
    } else {
      state.customAmount = Math.floor(Number(val));
      plansContainer.querySelectorAll('.airtime_plan_chip').forEach(b => b.setAttribute('aria-pressed','false'));
      state.plan = null;
    }
    setSummary(); updateCTAState();
  });

  // phone input
  phoneInput.addEventListener('input', (e) => {
    state.phone = e.target.value.trim();
    setSummary(); updateCTAState();
  });

  // buy CTA behavior (simulate)
  buyBtn.addEventListener('click', async () => {
    if (state.inFlight) return;
    const amt = effectiveAmount();
    if (!amt || !isValidPhone(state.phone) || !state.network){
      alert('Please select a network, enter a valid phone number and amount.');
      return;
    }
    if (amt > state.walletBalance){
      alert('Insufficient wallet balance. Please top up.');
      return;
    }

    state.inFlight = true;
    buyBtn.classList.add('loading');
    buyBtn.disabled = true;
    buyBtn.setAttribute('aria-disabled','true');
    buyLabel.textContent = 'Processing...';
    ctaSpinner.style.display = 'inline-block';

    try {
      await new Promise(resolve => setTimeout(resolve, 1250));
      state.walletBalance = Math.max(0, state.walletBalance - amt);
      alert(`Success! Sent ${formatNaira(amt)} to ${state.phone} on ${state.network}.\nNew balance: ${formatNaira(state.walletBalance)}`);

      // reset selections but keep phone
      networksContainer.querySelectorAll('.airtime_network_chip').forEach(b => b.setAttribute('aria-pressed','false'));
      plansContainer.querySelectorAll('.airtime_plan_chip').forEach(b => b.setAttribute('aria-pressed','false'));
      state.network = null; state.plan = null; state.customAmount = null;
      customAmountInput.value = '';
      setSummary();
    } catch (err){
      alert('Transaction failed. Please try again.');
    } finally {
      state.inFlight = false;
      buyBtn.classList.remove('loading');
      buyBtn.disabled = true;
      buyBtn.setAttribute('aria-disabled','true');
      buyLabel.textContent = 'Buy now';
      ctaSpinner.style.display = 'none';
      updateCTAState();
    }
  });

  // init (no defaults)
  (function init(){
    networksContainer.querySelectorAll('.airtime_network_chip').forEach(b => b.setAttribute('aria-pressed','false'));
    plansContainer.querySelectorAll('.airtime_plan_chip').forEach(b => b.setAttribute('aria-pressed','false'));
    document.querySelectorAll('.airtime_chip').forEach(el => el.setAttribute('tabindex','0'));
    setSummary(); updateCTAState();
  })();

})();
