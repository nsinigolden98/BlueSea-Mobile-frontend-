/* rewardLogic.js
   Core reward calculations, state management, invite validation simulation,
   QR verification logic, identity handling, bonuses, community pool, and streaks.
   This module exposes a clean API on window.rewardLogic for the UI to consume.
   Responsibilities:
   - Maintain canonical state (no DOM access)
   - Provide deterministic simulation helpers
   - Provide functions that UI can call to mutate state
   - Keep logic separate from UI rendering
*/

const rewardLogic = (function () {
  // Internal canonical state
  const state = {
    // Mode: 'cash' or 'waitlist'
    mode: 'cash',
    cashPerInvite: 500,
    // Data reward parameters
    dataCapGB: 50,
    dataEarnedGB: 0,
    dataRedeemedGB: 0,
    // Invite tracking
    invitesTotal: 0,
    invitesValid: 0,
    pendingInvites: [], // {id, createdAt, status:'pending'|'registered'|'transacted'|'mature'|'invalid', qualityScore:0-100}
    inviteCode: null,
    invitesNeededPerUnlock: 2,
    unlockInitialGB: 10,
    unlockPerChunkGB: 5,
    lastValidSinceUnlock: 0,
    registrationPhone: '+234 800 000 0000',
    // Paste/uploaded QR value
    pastedQrValue: null,
    // Identity selection: null | 'speed' | 'value' | 'influencer'
    identity: null,
    // Bonuses and history
    bonuses: [], // {id, label, type:'gb'|'cash', amount, unlocked:boolean, unlockedAt:timestamp|null}
    claimedHistory: [], // records of redeemed claims
    // Community pool simulation
    communityProgress: 0, // 0-100 percent
    communityBoostActive: false,
    // Streak tracking
    streakDays: 0,
    lastInviteDay: null, // timestamp of last invite day
    // Simulation flags
    simulationNote: 'Simulation mode: all actions are simulated for testing'
  };

  let inviteCounter = 1;
  let bonusCounter = 1;

  /* Utility: generate a short unique invite code */
  function generateInviteCode() {
    const prefix = 'VTU';
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    const code = `${prefix}-${rand}`;
    state.inviteCode = code;
    return code;
  }

  /* Initialize state for a fresh session */
  function init() {
    state.mode = 'cash';
    state.dataEarnedGB = 0;
    state.dataRedeemedGB = 0;
    state.invitesTotal = 0;
    state.invitesValid = 0;
    state.pendingInvites = [];
    state.lastValidSinceUnlock = 0;
    state.pastedQrValue = null;
    state.identity = null;
    state.bonuses = [];
    state.claimedHistory = [];
    state.communityProgress = 0;
    state.communityBoostActive = false;
    state.streakDays = 0;
    state.lastInviteDay = null;
    if (!state.inviteCode) generateInviteCode();
    // Pre-seed a couple of locked bonuses for milestones
    seedBonuses();
    return getState();
  }

  /* Seed surprise bonuses locked until milestones */
  function seedBonuses() {
    state.bonuses = [
      { id: bonusCounter++, label: 'Surprise +2GB', type: 'gb', amount: 2, unlocked: false, unlockedAt: null, milestoneGB: 20 },
      { id: bonusCounter++, label: 'Free ₦200 Cash', type: 'cash', amount: 200, unlocked: false, unlockedAt: null, milestoneGB: 40 }
    ];
  }

  /* Return a deep copy of state for UI consumption */
  function getState() {
    return {
      mode: state.mode,
      cashPerInvite: state.cashPerInvite,
      dataCapGB: state.dataCapGB,
      dataEarnedGB: state.dataEarnedGB,
      dataRedeemedGB: state.dataRedeemedGB,
      invitesTotal: state.invitesTotal,
      invitesValid: state.invitesValid,
      pendingInvites: state.pendingInvites.slice(),
      inviteCode: state.inviteCode,
      invitesNeededPerUnlock: state.invitesNeededPerUnlock,
      unlockInitialGB: state.unlockInitialGB,
      unlockPerChunkGB: state.unlockPerChunkGB,
      registrationPhone: state.registrationPhone,
      pastedQrValue: state.pastedQrValue,
      identity: state.identity,
      bonuses: state.bonuses.map(b => ({ ...b })),
      claimedHistory: state.claimedHistory.slice(),
      communityProgress: state.communityProgress,
      communityBoostActive: state.communityBoostActive,
      streakDays: state.streakDays,
      lastInviteDay: state.lastInviteDay,
      simulationNote: state.simulationNote
    };
  }

  /* Activate waitlist mode and apply initial 10GB unlock if not already applied */
  function activateWaitlistMode() {
    if (state.mode === 'waitlist') return;
    state.mode = 'waitlist';
    if (state.dataEarnedGB === 0) {
      state.dataEarnedGB = Math.min(state.unlockInitialGB, state.dataCapGB);
      checkBonuses(); // check if initial unlock triggers any bonus
    }
  }

  /* Apply a verified QR string (from paste or other detection).
     Stores the QR value and applies waitlist activation if simulated verification passes.
     Returns {ok, source, message}
     NOTE: This function is synchronous and uses simulateVerifyQrString for demo.
     Replace simulateVerifyQrString with real API call when backend is ready.
  */
  function applyVerifiedQr(qrString) {
    state.pastedQrValue = qrString || null;

    // TEMPORARY: This simulates backend QR verification.
    // Replace this block with real API call when backend is ready.
    const verified = simulateVerifyQrString(qrString);

    if (verified) {
      activateWaitlistMode();
      return { ok: true, source: 'pasted', message: 'Verified (simulated)' };
    }

    return { ok: false, source: 'pasted', message: 'Invalid QR (simulated)' };
  }

  /* TEMPORARY: This simulates backend QR verification.
     Replace this block with real API call when backend is ready.
     Logic: valid if starts with 'WL-' or matches a small mocked list.
  */
  function simulateVerifyQrString(qr) {
    if (!qr || typeof qr !== 'string') return false;
    const mocked = ['WL-ALPHA-01', 'WL-BETA-22', 'WL-GAMMA-99'];
    if (qr.startsWith('WL-')) return true;
    if (mocked.includes(qr)) return true;
    return false;
  }

  /* Public: verifyQrImage(file)
     Used by upload flow. Keeps previous behavior but now also records pastedQrValue
     when verification succeeds.
     Returns Promise<boolean>
  */
  function verifyQrImage(file) {
    return new Promise((resolve) => {
      if (!file || !file.type.startsWith('image/')) {
        setTimeout(() => resolve(false), 400);
        return;
      }
      const size = file.size || 0;
      if (size < 2000) {
        setTimeout(() => resolve(false), 700);
        return;
      }
      if (size >= 2000 && size < 200000) {
        setTimeout(() => {
          // For upload flow we don't have QR string; we simulate success and set a placeholder
          state.pastedQrValue = 'WL-UPLOAD-SIM';
          activateWaitlistMode();
          resolve(true);
        }, 900);
        return;
      }
      setTimeout(() => {
        const pass = Math.random() > 0.35;
        if (pass) {
          state.pastedQrValue = 'WL-UPLOAD-SIM';
          activateWaitlistMode();
        }
        resolve(pass);
      }, 1000);
    });
  }

  /* Identity application: affects unlock behavior and later cash bonuses.
     identity: 'speed' | 'value' | 'influencer'
     Returns applied identity.
  */
  function applyIdentity(identity) {
    if (!['speed', 'value', 'influencer'].includes(identity)) return null;
    state.identity = identity;

    // Adjust parameters subtly based on identity
    if (identity === 'speed') {
      // Speed Runner: faster unlocks -> fewer invites per unlock
      state.invitesNeededPerUnlock = 1;
      state.unlockPerChunkGB = 5;
    } else if (identity === 'value') {
      // Value Builder: slower GB but higher cash bonus later
      state.invitesNeededPerUnlock = 3;
      state.unlockPerChunkGB = 5;
      // schedule a future cash bonus on completion
      state.bonuses.push({ id: bonusCounter++, label: 'Value Bonus ₦500', type: 'cash', amount: 500, unlocked: false, unlockedAt: null, milestoneGB: 50 });
    } else if (identity === 'influencer') {
      // Influencer: extra perks - small immediate bonus and badges
      state.invitesNeededPerUnlock = 2;
      state.unlockPerChunkGB = 6; // slightly larger chunks
      state.bonuses.push({ id: bonusCounter++, label: 'Influencer Badge Perk', type: 'badge', amount: 0, unlocked: false, unlockedAt: null, milestoneGB: 10 });
    }
    return state.identity;
  }

  /* Simulate an invite being created.
     type: 'auto' | 'valid' | 'invalid'
     Returns an invite object immediately; validation completes asynchronously.
     Invite quality simulation:
       - Step 1: pending
       - Step 2: registered (after 2-4s)
       - Step 3: transacted (after additional 2-4s)
       - Step 4: matured (after simulated 3 days -> we accelerate in demo)
     The invite only counts toward unlocks when it reaches 'mature'.
  */
  function createInvite(type = 'auto') {
    const id = inviteCounter++;
    const createdAt = Date.now();
    const invite = {
      id,
      createdAt,
      status: 'pending',
      qualityScore: 0 // 0-100
    };
    state.invitesTotal += 1;
    state.pendingInvites.push(invite);

    // Simulate registration step
    const regDelay = 2000 + Math.floor(Math.random() * 2000);
    setTimeout(() => {
      const willRegister = type === 'valid' ? true : (type === 'invalid' ? false : Math.random() < 0.85);
      if (!willRegister) {
        updateInviteStatus(id, 'invalid');
        return;
      }
      updateInviteStatus(id, 'registered');
      // simulate transaction
      const txDelay = 2000 + Math.floor(Math.random() * 3000);
      setTimeout(() => {
        const willTransact = Math.random() < 0.8;
        if (!willTransact) {
          // registered but no transaction -> lower quality
          finalizeInviteAsRegistered(id);
          return;
        }
        updateInviteStatus(id, 'transacted');
        // simulate maturation (3 days) - accelerated to 4-6s for demo
        const matureDelay = 4000 + Math.floor(Math.random() * 2000);
        setTimeout(() => {
          updateInviteStatus(id, 'mature');
          // When matured, count as valid invite
          state.invitesValid += 1;
          // If in waitlist mode and data not complete, count toward unlocks
          if (state.mode === 'waitlist' && state.dataEarnedGB < state.dataCapGB) {
            state.lastValidSinceUnlock += 1;
            // Check unlocks
            while (state.lastValidSinceUnlock >= state.invitesNeededPerUnlock && state.dataEarnedGB < state.dataCapGB) {
              state.lastValidSinceUnlock -= state.invitesNeededPerUnlock;
              const add = Math.min(state.unlockPerChunkGB, state.dataCapGB - state.dataEarnedGB);
              state.dataEarnedGB += add;
              checkBonuses();
              if (state.dataEarnedGB >= state.dataCapGB) {
                state.dataEarnedGB = state.dataCapGB;
                state.mode = 'cash';
                // unlock any completion bonuses
                unlockCompletionBonuses();
                break;
              }
            }
          } else if (state.mode === 'cash') {
            // cash mode: invitesValid already incremented
          }
        }, matureDelay);
      }, txDelay);
    }, regDelay);

    // Update streak: if invite created today, increment streak logic handled externally via simulate day
    return invite;
  }

  /* Helper to update invite status */
  function updateInviteStatus(id, status) {
    const idx = state.pendingInvites.findIndex(p => p.id === id);
    if (idx === -1) return;
    state.pendingInvites[idx].status = status;
    // quality score heuristic
    if (status === 'registered') state.pendingInvites[idx].qualityScore = 40;
    if (status === 'transacted') state.pendingInvites[idx].qualityScore = 75;
    if (status === 'mature') state.pendingInvites[idx].qualityScore = 100;
    if (status === 'invalid') state.pendingInvites[idx].qualityScore = 0;
  }

  /* Finalize invite as registered but not transacted */
  function finalizeInviteAsRegistered(id) {
    updateInviteStatus(id, 'registered');
    // After some time it may remain registered and never mature; we do not count it as valid
  }

  /* Check and unlock surprise bonuses based on dataEarnedGB */
  function checkBonuses() {
    state.bonuses.forEach(b => {
      if (!b.unlocked && state.dataEarnedGB >= (b.milestoneGB || 0)) {
        b.unlocked = true;
        b.unlockedAt = Date.now();
        // Apply immediate effects for certain bonus types
        if (b.type === 'gb') {
          state.dataEarnedGB = Math.min(state.dataCapGB, state.dataEarnedGB + b.amount);
        } else if (b.type === 'cash') {
          // cash bonus recorded in claimedHistory for later redemption
          state.claimedHistory.push({ type: 'cash', amount: b.amount, at: Date.now(), label: b.label });
        } else if (b.type === 'badge') {
          state.claimedHistory.push({ type: 'badge', amount: 0, at: Date.now(), label: b.label });
        }
      }
    });
  }

  /* Unlock bonuses that are tied to completion (50GB) */
  function unlockCompletionBonuses() {
    state.bonuses.forEach(b => {
      if (!b.unlocked && (b.milestoneGB || 0) <= state.dataEarnedGB) {
        b.unlocked = true;
        b.unlockedAt = Date.now();
      }
    });
  }

  /* Redeem available data: requires phone number externally validated by UI.
     Returns amount redeemed.
     Also records claimed history and hides phone redemption when full cap claimed.
  */
  function redeemData(phone) {
    const available = state.dataEarnedGB - state.dataRedeemedGB;
    if (!phone || available <= 0) return 0;
    state.dataRedeemedGB = state.dataEarnedGB;
    state.claimedHistory.push({ type: 'data', amount: available, at: Date.now(), phone });
    // If full cap claimed, ensure completion bonuses unlocked
    if (state.dataRedeemedGB >= state.dataCapGB) {
      unlockCompletionBonuses();
    }
    return available;
  }

  /* Community boost simulation: increase communityProgress and possibly activate boost */
  function triggerCommunityBoost(increment = 25) {
    state.communityProgress = Math.min(100, state.communityProgress + increment);
    if (state.communityProgress >= 100) {
      state.communityBoostActive = true;
      // grant a small community bonus to all (simulated)
      state.bonuses.push({ id: bonusCounter++, label: 'Community +1GB', type: 'gb', amount: 1, unlocked: true, unlockedAt: Date.now(), milestoneGB: 0 });
      // apply immediately
      state.dataEarnedGB = Math.min(state.dataCapGB, state.dataEarnedGB + 1);
      checkBonuses();
    }
  }

  /* Streak simulation: advance day and update streakDays
     For demo, this function simulates the user returning the next day and inviting.
  */
  function simulateNextDayInvite() {
    const today = new Date().toDateString();
    if (state.lastInviteDay === today) {
      // already counted today
      return state.streakDays;
    }
    // For demo, increment streak
    state.streakDays += 1;
    state.lastInviteDay = today;
    // reward small bonus for streak milestones
    if (state.streakDays > 0 && state.streakDays % 3 === 0) {
      // every 3-day streak -> small GB
      state.bonuses.push({ id: bonusCounter++, label: `Streak +1GB (${state.streakDays}d)`, type: 'gb', amount: 1, unlocked: true, unlockedAt: Date.now(), milestoneGB: 0 });
      state.dataEarnedGB = Math.min(state.dataCapGB, state.dataEarnedGB + 1);
      checkBonuses();
    }
    return state.streakDays;
  }

  /* Expose API */
  return {
    init,
    getState,
    generateInviteCode,
    verifyQrImage,
    createInvite,
    redeemData,
    applyVerifiedQr,
    applyIdentity,
    triggerCommunityBoost,
    simulateNextDayInvite
  };
})();

/* Expose to global scope for UI module to use */
window.rewardLogic = rewardLogic;