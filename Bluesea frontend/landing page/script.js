/* js/script.js - kept as before (modal, join hook, feature details) */

/* Feature details (kept as provided earlier) */
const LP_featureDetails = {
  "airtime-buyback": { title: "Airtime Buyback — How it works", meta: "Convert unused airtime into platform balance instantly", content: `<p><strong>What it is</strong><br/>Airtime Buyback lets users return unused airtime to BlueSea Mobile in exchange for platform credit at a fair rate. Instead of letting vouchers or scratch cards go unused, users convert remaining balances into spendable wallet credit that can be used for data, gift cards, bill payments, or transfers.</p><p><strong>How it works</strong><br/>The user opens the Buyback flow, selects the network and airtime denomination (or scans a voucher). BlueSea checks the voucher/denomination, runs a quick liquidity and pricing rule, and displays an immediate offer. On acceptance the voucher is validated and burned (or marked sold) and the user’s BlueSea wallet is credited instantly. The process uses automated validation and reconciliation logic so the buyback is fast and auditable.</p><p><strong>Why it's useful</strong><br/>Many people buy airtime and never use all of it. Buyback gives that value liquidity — users can convert wasted airtime into usable balance without bank transfers, reducing waste and increasing retention. For BlueSea it also increases transaction frequency, creates a natural on-platform wallet economy, and opens opportunities for marketplace sales and microtransactions.</p>` },
  "group-payment": { title: "Group Payment — How it works", meta: "Pool money with friends or family to pay a single bill", content: `<p><strong>What it is</strong><br/>Group Payment is a shared-pot feature that allows multiple people to contribute to one bill, purchase or subscription. One organizer creates a payment request (for rent, utility, event, or shared purchase) and others join by adding funds. The feature supports equal splits, custom shares, and deadlines.</p><p><strong>How it works</strong><br/>The organizer creates a group payment and defines the total required amount, a title, and how to split (equal, percentage, custom amounts). BlueSea generates a shareable code or QR and a private link. Contributors open the link, confirm their contribution amount, and pay via wallet, card, or USSD. Contributions are tracked in the pot with timestamps and contributor identities. When the pot reaches the required amount, the organizer (or authorized member) confirms payment and the app executes the transaction (payout to merchant, airtime/data purchase, or wallet transfer). The system keeps a ledger of who paid what and issues receipts automatically. Admin controls allow refunds, early withdrawals, or cancellations according to preconfigured rules.</p><p><strong>Why it's useful</strong><br/>Group Payment removes awkward money-collecting conversations and spreadsheets. It makes rent, event tickets, and group bills simple and transparent, reduces payment friction for shared obligations, and provides a trustworthy audit trail for contributors and payees. For businesses and campus groups it cuts reconciliation time and lowers failed payment rates.</p>` },
  "loyalty-marketplace": { title: "Loyalty Marketplace — How it works", meta: "Spend points earned from transactions on real products and services", content: `<p><strong>What it is</strong><br/>The Loyalty Marketplace turns transaction rewards into real value. Every eligible transaction earns points; points can be redeemed for data bundles, airtime top-ups, gift cards, merchant discounts, or marketplace items. The marketplace is an in-app storefront where points act like currency.</p><p><strong>How it works</strong><br/>Each purchase or action accrues points according to campaign rules (e.g., 1 point per ₦100 spent; bonus points for referrals). Points appear on the user’s wallet/loyalty tab. In the Loyalty Marketplace users browse categories (data, utilities, merchant offers) and apply points at checkout. The marketplace supports tiered rewards (bronze/silver/gold), time-limited promotions, and partner redemptions. For sellers/partners, BlueSea offers an API to list offers, set point pricing, and track redemptions. Points can also be converted into platform credit under controlled conditions or sold in the Bonus Marketplace (if enabled).</p><p><strong>Why it's useful</strong><br/>Loyalty programs increase retention and repeat purchases. They create a monetizable channel for partners and enable BlueSea to turn routine purchases into engagement opportunities. Users benefit by getting measurable returns on everyday spending, while BlueSea grows lifetime value and cross-sell opportunities.</p>` },
  "spend-analysis": { title: "Spend Analysis — How it works", meta: "Understand where your money goes with smart insights", content: `<p><strong>What it is</strong><br/>Spend Analysis is a suite of analytics and visual dashboards that show how a user spends airtime, data, and wallet balance over time. It breaks spending into categories, flags recurring charges, and provides actionable recommendations to save money or optimize bundles.</p><p><strong>How it works</strong><br/>All transactions are enriched with metadata (network, product type, date/time, merchant). BlueSea classifies this data using a rules engine (and machine learning for ambiguous cases) into categories like 'data', 'airtime', 'gift cards', 'merchant', and 'subscriptions'. Dashboards display weekly/monthly trends, category shares, top merchants, and streaks. Users can set budgets and alerts (e.g., notify when data spend hits 80% of monthly budget). The AI assistant can propose tailored bundles (e.g., 'buy 5GB every Monday to save 12%') and simulate the effect of switching plans.</p><p><strong>Why it's useful</strong><br/>Spend Analysis empowers users to stop money leaks and make better buying decisions — especially important for daily earners and students on tight budgets. It also helps BlueSea design targeted promotions and personalize offers, increasing conversion on bundles and buyback opportunities.</p>` },
  "smart-auto-topup": { title: "Smart Auto Top-Up", meta: "Auto-refill wallet or data when needed", content: `<p><strong>What it is</strong><br/>A simple automation that tops up a user's wallet or data when predefined conditions are met (low balance, scheduled times, or predicted need).</p><p><strong>How it works</strong><br/>Set a rule (e.g., top up ₦500 when balance < ₦200) or enable predictive mode. The system checks balances and either suggests or performs the refill using your chosen funding source.</p><p><strong>Why it's useful</strong><br/>Prevents service outages, saves time, and keeps users connected without remembering to top up manually.</p><p><strong>What you need to do</strong><br/>Choose a trigger (threshold, schedule, or predictive), pick a funding source, and set a monthly cap if you want spend control. First suggestion requires confirmation; later top-ups can run automatically.</p>` }
};

/* DOM refs */
const joinButtons = Array.from(document.querySelectorAll('.LP_join_button'));
const lumaAnchor = document.getElementById('LP_luma_anchor');
const featureCards = Array.from(document.querySelectorAll('.LP_feature_card'));
const modal = document.getElementById('LP_feature_modal');
const modalPanel = modal.querySelector('.LP_modal_panel');
const modalTitle = modal.querySelector('.LP_modal_title');
const modalMeta = modal.querySelector('.LP_modal_meta');
const modalBody = modal.querySelector('.LP_modal_body');
const modalCloseBtn = modal.querySelector('.LP_modal_close');

/* Join behavior */
function LP_openJoin(){
  try {
    window.dispatchEvent(new CustomEvent('lp:joinClicked', { detail: { timestamp: Date.now() } }));
    if (lumaAnchor) lumaAnchor.click();
  } catch (err) {
    console.warn('LP_openJoin error', err);
  }
}
joinButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    try { btn.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-3px)' }, { transform: 'translateY(0)' }], { duration: 220, easing: 'cubic-bezier(.2,.9,.3,1)' }); } catch(e){}
    LP_openJoin();
  });
});
window.LP_openJoin = LP_openJoin;

/* Modal logic */
let lastFocusedElement = null;
function openFeatureModal(featureKey) {
  const info = LP_featureDetails[featureKey];
  if (!info) return;
  lastFocusedElement = document.activeElement;
  modalTitle.innerHTML = info.title || '';
  modalMeta.innerHTML = info.meta || '';
  modalBody.innerHTML = info.content || '';
  modal.setAttribute('aria-hidden', 'false');
  setTimeout(() => modalCloseBtn.focus(), 60);
  document.body.style.overflow = 'hidden';
  document.addEventListener('focus', enforceFocus, true);
  document.addEventListener('keydown', handleModalKeyDown);
}
function closeFeatureModal() {
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  document.removeEventListener('focus', enforceFocus, true);
  document.removeEventListener('keydown', handleModalKeyDown);
  if (lastFocusedElement) lastFocusedElement.focus();
}
function enforceFocus(e) {
  if (!modal.contains(e.target)) { e.stopPropagation(); modalCloseBtn.focus(); }
}
function handleModalKeyDown(e) {
  if (e.key === 'Escape') { e.preventDefault(); closeFeatureModal(); }
}
featureCards.forEach(card => {
  const id = card.dataset.feature;
  const action = () => openFeatureModal(id);
  card.addEventListener('click', action);
  card.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); action(); } });
  const btn = card.querySelector('.LP_feature_more');
  if (btn) btn.addEventListener('click', (ev) => { ev.stopPropagation(); action(); });
});
modalCloseBtn.addEventListener('click', closeFeatureModal);
modal.querySelector('.LP_modal_overlay').addEventListener('click', (e) => { if (e.target.dataset.dismiss === 'true') closeFeatureModal(); });
window.LP_openFeature = openFeatureModal;

if (!modal || !modalPanel) console.error('LP Modal not initialized properly.');