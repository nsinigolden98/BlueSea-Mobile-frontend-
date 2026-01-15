/* rewardUI2.js
   Companion UI module that extends rewardUI.js without changing its core responsibilities.
   This file attaches additional controls, simulations, celebratory animations,
   claimed summary collapsible behavior, clipboard safety, and bonus monitoring.

   It relies on window.rewardUI (exposed by rewardUI.js) and window.rewardLogic.
   No existing functions or variable names are changed.
*/

(function () {
  const logic = window.rewardLogic;
  const ui = window.rewardUI;

  /* DOM refs used here (queried separately to avoid cross-file scope issues) */
  const copyCodeBtn = document.getElementById('copyCodeBtn');
  const simulateInviteBtn = document.getElementById('simulateInviteBtn');
  const simulateValidBtn = document.getElementById('simulateValidBtn');
  const simulateInvalidBtn = document.getElementById('simulateInvalidBtn');
  const simulateStreakBtn = document.getElementById('simulateStreakBtn');
  const simulateCommunityBtn = document.getElementById('simulateCommunityBtn');

  const summaryToggle = document.getElementById('summaryToggle');
  const summaryBody = document.getElementById('summaryBody');
  const claimedSummary = document.getElementById('claimedSummary');
  const claimedList = document.getElementById('claimedList');

  const pendingInvitesEl = document.getElementById('pendingInvites');
  const inviteCodeEl = document.getElementById('inviteCode');

  /* Attach event listeners for simulation controls and summary toggle */
  if (copyCodeBtn) copyCodeBtn.addEventListener('click', handleCopyCode);
  if (simulateInviteBtn) simulateInviteBtn.addEventListener('click', () => handleSimulate('auto'));
  if (simulateValidBtn) simulateValidBtn.addEventListener('click', () => handleSimulate('valid'));
  if (simulateInvalidBtn) simulateInvalidBtn.addEventListener('click', () => handleSimulate('invalid'));
  if (simulateStreakBtn) simulateStreakBtn.addEventListener('click', handleSimulateStreak);
  if (simulateCommunityBtn) simulateCommunityBtn.addEventListener('click', handleSimulateCommunity);
  if (summaryToggle) summaryToggle.addEventListener('click', toggleSummary);

  /* Safe clipboard write wrapper */
  function safeWriteClipboard(text) {
    try {
      return navigator.clipboard?.writeText(text);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /* Copy invite code */
  function handleCopyCode() {
    const s = logic.getState();
    const code = s.inviteCode || '';
    if (!code) return;
    safeWriteClipboard(code).then(() => {
      copyCodeBtn.textContent = 'Copied';
      setTimeout(() => { copyCodeBtn.textContent = 'Copy'; }, 1200);
    }).catch(() => {
      copyCodeBtn.textContent = 'Copy';
    });
  }

  /* Invite simulation handlers */
  function handleSimulate(type) {
    const invite = logic.createInvite(type === 'valid' ? 'valid' : (type === 'invalid' ? 'invalid' : 'auto'));
    renderPending(invite);
  }

  /* Render a single pending invite immediate feedback */
  function renderPending(invite) {
    pendingInvitesEl.textContent = `#${invite.id}: validating`;
  }

  /* Simulate streak progression (next day) */
  function handleSimulateStreak() {
    const days = logic.simulateNextDayInvite();
    // show small celebratory message via UI's renderAll feedback
    const verifyMessage = document.getElementById('verifyMessage');
    if (verifyMessage) {
      verifyMessage.textContent = `Streak: ${days} day(s). Keep it up!`;
      verifyMessage.style.color = '';
      setTimeout(() => { verifyMessage.textContent = ''; }, 2500);
    }
  }

  /* Simulate community boost activation */
  function handleSimulateCommunity() {
    logic.triggerCommunityBoost(50); // increment community progress
    const verifyMessage = document.getElementById('verifyMessage');
    if (verifyMessage) {
      verifyMessage.textContent = 'Community Boost triggered (simulated)';
      verifyMessage.style.color = '';
      setTimeout(() => { verifyMessage.textContent = ''; }, 2000);
    }
  }

  /* Claimed summary toggle */
  function toggleSummary() {
    if (!summaryBody || !claimedSummary) return;
    if (summaryBody.classList.contains('hidden')) {
      summaryBody.classList.remove('hidden');
      summaryBody.style.opacity = '1';
      summaryToggle.textContent = '▲';
    } else {
      summaryBody.classList.add('hidden');
      summaryBody.style.opacity = '0';
      summaryToggle.textContent = '▼';
    }
  }

  /* Populate claimed summary when full cap claimed (called periodically) */
  function showClaimedSummaryIfNeeded() {
    const s = logic.getState();
    if (s.dataRedeemedGB >= s.dataCapGB) {
      // populate claimedList from claimedHistory
      const items = s.claimedHistory.map(h => {
        const date = new Date(h.at).toLocaleDateString();
        if (h.type === 'data') return `${date}: ${h.amount}GB delivered to ${h.phone}`;
        if (h.type === 'cash') return `${date}: ₦${h.amount} cash bonus (${h.label || ''})`;
        if (h.type === 'badge') return `${date}: Badge earned (${h.label || ''})`;
        return `${date}: ${h.label || ''}`;
      });
      claimedList.innerHTML = items.length ? items.join('<br/>') : 'No claimed rewards yet';
      claimedSummary.classList.remove('hidden');
      claimedSummary.style.opacity = '1';
      summaryBody.classList.add('hidden');
      summaryToggle.textContent = '▼';
    }
  }

  /* Celebratory toast for newly unlocked bonuses */
  function celebrateBonus(text) {
    const toast = document.createElement('div');
    toast.className = 'card';
    toast.style.position = 'fixed';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.bottom = '28px';
    toast.style.padding = '10px 14px';
    toast.style.borderRadius = '999px';
    toast.style.boxShadow = '0 12px 36px rgba(11,102,255,0.12)';
    toast.style.background = '#0b66ff';
    toast.style.color = '#fff';
    toast.style.fontWeight = '800';
    toast.style.zIndex = 9999;
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity .4s ease, transform .4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-8px)';
    }, 1600);
    setTimeout(() => document.body.removeChild(toast), 2200);
  }

  /* Monitor bonuses and show celebration when newly unlocked */
  let seenBonuses = new Set();
  setInterval(() => {
    const s = logic.getState();
    s.bonuses.forEach(b => {
      if (b.unlocked && !seenBonuses.has(b.id)) {
        seenBonuses.add(b.id);
        celebrateBonus(`Unlocked: ${b.label}`);
      }
    });
    // also update claimed summary if needed
    showClaimedSummaryIfNeeded();
  }, 900);

  /* Ensure initial UI state is correct and keep invite code visible */
  (function initialRender() {
    const s = logic.getState();
    if (inviteCodeEl) inviteCodeEl.textContent = s.inviteCode || '—';
    // initial claimed summary check
    showClaimedSummaryIfNeeded();
  })();

})();

