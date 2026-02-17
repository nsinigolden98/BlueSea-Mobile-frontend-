/* rewardUI.js
   DOM updates, core QR handling, identity selection, and primary render loop.
   This file contains the primary UI logic and exposes a small API on window.rewardUI
   so that rewardUI2.js can extend behavior without duplicating responsibilities.

   Responsibilities kept here:
   - Core DOM references
   - QR upload & paste handling (scanImageForQr)
   - Identity selection flow and hiding the verify card
   - Primary renderAll function that updates the main UI
   - Minimal helpers used by both parts

   Note: This file intentionally exposes a limited API (window.rewardUI) for the
   companion file rewardUI2.js to attach additional controls and animations.
*/

(function () {
  const logic = window.rewardLogic;

  /* DOM refs */
  const statusTitle = document.getElementById('statusTitle');
  const statusSub = document.getElementById('statusSub');
  const progressWrap = document.getElementById('progressWrap');
  const progressBar = document.getElementById('progressBar');
  const gbEarnedEl = document.getElementById('gbEarned');
  const gbRemainingEl = document.getElementById('gbRemaining');
  const nextActionEl = document.getElementById('nextAction');
  const momentumEl = document.getElementById('momentum');

  const qrForm = document.getElementById('qrForm');
  const qrImageInput = document.getElementById('qrImage');
  const imagePreview = document.getElementById('imagePreview');
  const verifyImageBtn = document.getElementById('verifyImageBtn');
  const verifyMessage = document.getElementById('verifyMessage');
  const verifyCard = document.getElementById('verifyCard');

  const identitySelect = document.getElementById('identitySelect');
  const identityButtons = document.querySelectorAll('.identity-btn');

  const phoneCard = document.getElementById('phoneCard');
  const phoneInput = document.getElementById('phoneInput');
  const useRegPhone = document.getElementById('useRegPhone');
  const redeemBtn = document.getElementById('redeemBtn');
  const redeemMsg = document.getElementById('redeemMsg');

  const timelineEl = document.getElementById('timeline');

  const inviteCodeEl = document.getElementById('inviteCode');
  const totalInvitesEl = document.getElementById('totalInvites');
  const validInvitesEl = document.getElementById('validInvites');
  const toNextEl = document.getElementById('toNext');
  const pendingInvitesEl = document.getElementById('pendingInvites');

  const streakBadge = document.getElementById('streakBadge');
  const streakCount = document.getElementById('streakCount');
  const communityBoost = document.getElementById('communityBoost');

  /* Initialization */
  const initial = logic.init();
  if (!initial.inviteCode) logic.generateInviteCode();
  renderAll();

  /* Event bindings (core) */
  qrImageInput.addEventListener('change', handleImageSelect);
  verifyImageBtn.addEventListener('click', handleVerifyImage);
  qrForm.addEventListener('paste', handlePasteEvent); // paste handling for QR images
  identityButtons.forEach(btn => btn.addEventListener('click', handleIdentitySelect));

  useRegPhone.addEventListener('change', handleUseRegToggle);
  phoneInput.addEventListener('input', updateRedeemButton);
  redeemBtn.addEventListener('click', handleRedeem);

  // Expose a small API for rewardUI2.js to use and extend
  window.rewardUI = {
    renderAll,
    scanImageForQr,
    clearVerifyMessage,
    animateHideVerifyCard,
    showIdentitySelection
  };

  // Poll UI for state changes
  setInterval(renderAll, 700);

  /* Image selection preview */
  function handleImageSelect() {
    const file = qrImageInput.files && qrImageInput.files[0];
    imagePreview.innerHTML = '';
    clearVerifyMessage();
    if (!file) {
      imagePreview.setAttribute('aria-hidden', 'true');
      return;
    }
    const img = document.createElement('img');
    img.alt = 'QR preview';
    img.src = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(img.src);
    imagePreview.appendChild(img);
    imagePreview.setAttribute('aria-hidden', 'false');
  }

  /* Upload verify flow (uses rewardLogic.verifyQrImage) */
  function handleVerifyImage() {
    const file = qrImageInput.files && qrImageInput.files[0];
    clearVerifyMessage();
    verifyMessage.textContent = 'Verifying...';
    verifyImageBtn.disabled = true;
    logic.verifyQrImage(file).then((ok) => {
      verifyImageBtn.disabled = false;
      if (ok) {
        verifyMessage.textContent = 'Verified — choose your reward identity';
        // show identity selection
        showIdentitySelection();
      } else {
        verifyMessage.textContent = 'Invalid QR code';
        verifyMessage.style.color = '#b91c1c';
      }
      // clear preview after attempt
      setTimeout(() => {
        qrImageInput.value = '';
        imagePreview.innerHTML = '';
        imagePreview.setAttribute('aria-hidden', 'true');
      }, 1200);
    });
  }

  /* Paste handling for QR detection (image paste)
     - Processes only the first image pasted
     - Uses scanImageForQr to detect QR codes client-side (jsQR)
     - If no QR found: shows inline error "Only QR code images are allowed"
     - If QR found: calls logic.applyVerifiedQr(qrValue) to simulate verification
     - On success: shows identity selection and hides upload controls
  */
  function handlePasteEvent(e) {
    if (!e.clipboardData || !e.clipboardData.items) return;
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find(it => it.type && it.type.startsWith('image/'));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;
    // preview
    imagePreview.innerHTML = '';
    const img = document.createElement('img');
    img.alt = 'Pasted QR preview';
    img.src = URL.createObjectURL(file);
    img.onload = () => URL.revokeObjectURL(img.src);
    imagePreview.appendChild(img);
    imagePreview.setAttribute('aria-hidden', 'false');
    clearVerifyMessage();
    // scan for QR using jsQR
    scanImageForQr(file).then(result => {
      if (!result || !result.data) {
        verifyMessage.textContent = 'Only QR code images are allowed';
        verifyMessage.style.color = '#b91c1c';
        // clear any stored QR
        logic.applyVerifiedQr(null);
        return;
      }
      const qrValue = result.data || '';
      const verification = logic.applyVerifiedQr(qrValue);
      if (!verification.ok) {
        verifyMessage.textContent = 'Invalid QR code';
        verifyMessage.style.color = '#b91c1c';
        return;
      }
      // success: prompt identity selection
      verifyMessage.innerHTML = 'Verified — choose your reward identity';
      verifyMessage.style.color = '';
      showIdentitySelection();
    }).catch(() => {
      verifyMessage.textContent = 'Only QR code images are allowed';
      verifyMessage.style.color = '#b91c1c';
    });
  }

  /* scanImageForQr(file)
     Converts a File into an Image and canvas, extracts pixel data, and runs jsQR.
     Returns Promise resolving to jsQR result or null.

     Comments:
     - Uses a max dimension to avoid huge canvases on mobile.
     - Normal images without QR will return null; these are rejected by UI.
  */
  function scanImageForQr(file) {
    return new Promise((resolve, reject) => {
      if (typeof jsQR !== 'function') {
        reject(new Error('jsQR not available'));
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 1024;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          const code = jsQR(imageData.data, width, height);
          resolve(code || null);
        } catch (err) {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  }

  /* Show identity selection UI and prevent re-upload until identity chosen */
  function showIdentitySelection() {
    identitySelect.classList.remove('hidden');
    identitySelect.classList.add('visible');
    // disable upload controls to prevent re-upload
    qrImageInput.disabled = true;
    verifyImageBtn.disabled = true;
  }

  /* Handle identity selection */
  function handleIdentitySelect(e) {
    const id = e.currentTarget.getAttribute('data-id');
    if (!id) return;
    logic.applyIdentity(id);
    // animate and then hide verifyCard
    animateHideVerifyCard();
    // show a subtle confirmation
    verifyMessage.textContent = `Identity set: ${id === 'speed' ? 'Speed Runner' : id === 'value' ? 'Value Builder' : 'Influencer Path'}`;
    verifyMessage.style.color = '';
    // ensure UI updates
    renderAll();
  }

  /* Animate hiding the verifyCard after identity chosen */
  function animateHideVerifyCard() {
    if (!verifyCard) return;
    verifyCard.style.transition = 'opacity .4s ease, transform .4s ease, height .4s ease';
    verifyCard.style.opacity = '0';
    verifyCard.style.transform = 'translateY(-8px)';
    setTimeout(() => {
      verifyCard.classList.add('hidden');
      verifyCard.style.opacity = '';
      verifyCard.style.transform = '';
    }, 420);
  }

  /* Redeem handling (kept minimal here; rewardUI2.js may extend) */
  function handleUseRegToggle() {
    if (useRegPhone.checked) {
      const s = logic.getState();
      phoneInput.value = s.registrationPhone || '';
      phoneInput.disabled = true;
    } else {
      phoneInput.disabled = false;
      phoneInput.value = '';
    }
    updateRedeemButton();
  }

  function updateRedeemButton() {
    const s = logic.getState();
    const phone = phoneInput.value.trim();
    const available = s.dataEarnedGB - s.dataRedeemedGB;
    redeemBtn.disabled = !(phone && available > 0);
  }

  function handleRedeem() {
    const phone = phoneInput.value.trim();
    const amount = logic.redeemData(phone);
    if (amount > 0) {
      redeemMsg.textContent = `Success: ${amount}GB scheduled to ${phone}`;
      redeemMsg.style.color = '';
      // If full cap claimed, UI will update via renderAll
      setTimeout(() => {
        renderAll();
      }, 600);
      setTimeout(() => { redeemMsg.textContent = ''; }, 4000);
    } else {
      redeemMsg.textContent = 'No data available to redeem';
      redeemMsg.style.color = '#b91c1c';
    }
  }

  /* Render helpers */
  function renderAll() {
    const s = logic.getState();

    // Status card
    if (s.mode === 'cash') {
      statusTitle.textContent = 'Cash Invite Mode';
      statusSub.textContent = `₦${s.cashPerInvite} per valid invite`;
      progressWrap.setAttribute('aria-hidden', 'true');
      progressWrap.style.display = 'none';
    } else {
      statusTitle.textContent = 'Waitlist Data Reward Mode';
      statusSub.textContent = 'Data rewards active — cash locked';
      progressWrap.setAttribute('aria-hidden', 'false');
      progressWrap.style.display = 'block';
    }

    // Progress bar and numbers
    gbEarnedEl.textContent = `${s.dataEarnedGB}GB`;
    gbRemainingEl.textContent = `${Math.max(0, s.dataCapGB - s.dataEarnedGB)}GB`;
    const pct = Math.round((s.dataEarnedGB / s.dataCapGB) * 100);
    progressBar.style.width = `${pct}%`;

    // Next action text
    if (s.mode === 'waitlist' && s.dataEarnedGB < s.dataCapGB) {
      const toNext = Math.max(1, s.invitesNeededPerUnlock - (s.invitesValid % s.invitesNeededPerUnlock));
      nextActionEl.textContent = `You are ${toNext} invite${toNext>1?'s':''} away from unlocking +${s.unlockPerChunkGB}GB`;
    } else if (s.mode === 'waitlist' && s.dataEarnedGB >= s.dataCapGB) {
      nextActionEl.textContent = '50GB reached — cash rewards unlocked';
    } else {
      nextActionEl.textContent = `Earn ₦${s.cashPerInvite} per valid invite`;
    }

    // Streak and community indicators
    if (s.streakDays > 0) {
      streakBadge.style.display = 'flex';
      streakBadge.setAttribute('aria-hidden', 'false');
      streakCount.textContent = s.streakDays;
    } else {
      streakBadge.style.display = 'none';
      streakBadge.setAttribute('aria-hidden', 'true');
    }
    if (s.communityBoostActive) {
      communityBoost.style.display = 'flex';
      communityBoost.setAttribute('aria-hidden', 'false');
    } else {
      communityBoost.style.display = 'none';
      communityBoost.setAttribute('aria-hidden', 'true');
    }

    // Timeline
    renderTimeline(s);

    // Invite code and stats
    inviteCodeEl.textContent = s.inviteCode || '—';
    totalInvitesEl.textContent = s.invitesTotal;
    validInvitesEl.textContent = s.invitesValid;
    const toNext = s.mode === 'waitlist' && s.dataEarnedGB < s.dataCapGB ? Math.max(1, s.invitesNeededPerUnlock - (s.invitesValid % s.invitesNeededPerUnlock)) : '-';
    toNextEl.textContent = toNext;

    // Pending invites list with quality visualization
    const pendingParts = s.pendingInvites.map(p => {
      const statusLabel = p.status === 'pending' ? 'pending' : p.status === 'registered' ? 'registered' : p.status === 'transacted' ? 'transacted' : p.status === 'mature' ? 'mature' : 'rejected';
      return `#${p.id}: ${statusLabel}`;
    });
    pendingInvitesEl.textContent = pendingParts.join(' • ');

    // Phone redemption visibility: hide if full cap claimed (dataRedeemedGB >= dataCapGB)
    if (s.dataRedeemedGB >= s.dataCapGB) {
      if (!phoneCard.classList.contains('hidden')) {
        phoneCard.classList.add('hidden');
        phoneCard.style.opacity = '0';
      }
    } else {
      phoneCard.classList.remove('hidden');
      phoneCard.style.opacity = '';
    }

    // If verifyCard should be hidden (after identity chosen and waitlist active)
    if (s.mode === 'waitlist' && s.pastedQrValue && s.identity) {
      if (!verifyCard.classList.contains('hidden')) {
        verifyCard.classList.add('hidden');
      }
    }

    // Update redeem button state
    updateRedeemButton();
  }

  /* Render timeline with steps and reveal states */
  function renderTimeline(s) {
    timelineEl.innerHTML = '';
    // Step 1: Verified -> 10GB
    const step1 = createStep(1, 'Verified', '10GB unlocked', s.dataEarnedGB >= s.unlockInitialGB);
    timelineEl.appendChild(step1);

    // Invite steps until cap
    let accumulated = s.unlockInitialGB;
    let idx = 2;
    while (accumulated < s.dataCapGB) {
      const completed = s.dataEarnedGB >= (accumulated + s.unlockPerChunkGB);
      const step = createStep(idx, `Invite ${s.invitesNeededPerUnlock} users`, `+${s.unlockPerChunkGB}GB`, completed);
      timelineEl.appendChild(step);
      accumulated += s.unlockPerChunkGB;
      idx++;
    }

    // Final: cash unlocked
    const cashComplete = s.dataEarnedGB >= s.dataCapGB;
    const finalStep = createStep(idx, 'Complete 50GB', 'Unlock ₦500 per invite', cashComplete);
    timelineEl.appendChild(finalStep);

    // Show any unlocked bonuses as celebratory steps
    s.bonuses.forEach(b => {
      if (b.unlocked) {
        const bonusStep = createStep('★', b.label, b.type === 'gb' ? `+${b.amount}GB` : b.type === 'cash' ? `₦${b.amount}` : 'Perk', true);
        timelineEl.appendChild(bonusStep);
      }
    });
  }

  function createStep(index, title, sub, complete) {
    const el = document.createElement('div');
    el.className = 'timeline-step' + (complete ? ' step-complete' : '');
    el.innerHTML = `
      <div class="step-index">${complete ? '✓' : index}</div>
      <div class="step-body">
        <div class="step-title">${title}</div>
        <div class="step-sub">${sub}</div>
      </div>
    `;
    return el;
  }

  /* Utility to clear verify message */
  function clearVerifyMessage() {
    verifyMessage.textContent = '';
    verifyMessage.style.color = '';
  }

})();