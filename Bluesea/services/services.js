// services.js
// Vanilla JS: handle navigation, animations, and feedback for service cards
// Upgrades: improved tap/hover animations, page-load stagger, ripple, accessibility

(function () {
  'use strict';

  const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
  const TAP_CLASS = 'tap';
  const SHAKE_CLASS = 'shake';
  const PRESS_CLASS = 'press';
  const TOAST_ID = 'toast';
  const TAP_DURATION = 180; // ms
  const SHAKE_DURATION = 180; // ms
  const TOAST_DURATION = 1400; // ms
  const STAGGER_STEP = 60; // ms between cards

  const toast = document.getElementById(TOAST_ID);

  // Utility: show ephemeral toast message
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, TOAST_DURATION);
  }

  // Utility: create small inline feedback near an element (for accessibility)
  function showInlineFeedback(target, message) {
    const existing = target.querySelector('.feedback');
    if (existing) {
      existing.remove();
    }

    const fb = document.createElement('div');
    fb.className = 'feedback';
    fb.textContent = message;
    // ensure relative positioning
    if (getComputedStyle(target).position === 'static') {
      target.style.position = 'relative';
    }
    target.appendChild(fb);

    // fade in
    requestAnimationFrame(() => {
      fb.style.opacity = '1';
    });

    setTimeout(() => {
      fb.style.opacity = '0';
      setTimeout(() => {
        fb.remove();
      }, 220);
    }, 900);
  }

  // Play tap animation on element (class-based)
  function playTap(el) {
    el.classList.remove(TAP_CLASS);
    // Force reflow to restart animation
    void el.offsetWidth;
    el.classList.add(TAP_CLASS);
    setTimeout(() => {
      el.classList.remove(TAP_CLASS);
    }, TAP_DURATION + 20);
  }

  // Play shake animation on element
  function playShake(el) {
    el.classList.remove(SHAKE_CLASS);
    void el.offsetWidth;
    el.classList.add(SHAKE_CLASS);
    setTimeout(() => {
      el.classList.remove(SHAKE_CLASS);
    }, SHAKE_DURATION + 20);
  }

  // Create ripple at pointer location
  function createRipple(el, x, y) {
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x - rect.left - size / 2}px`;
    ripple.style.top = `${y - rect.top - size / 2}px`;
    el.appendChild(ripple);

    // Force reflow then expand
    requestAnimationFrame(() => {
      ripple.style.transform = 'scale(1)';
      ripple.style.opacity = '0';
    });

    // Remove after transition
    setTimeout(() => {
      ripple.remove();
    }, 320);
  }

  // Navigate to route (use location.assign for proper navigation)
  function navigateTo(route) {
    setTimeout(() => {
      window.location.assign(route);
    }, TAP_DURATION);
  }

  // Handle activation (click or keyboard)
  function handleActivation(card, pointerEvent) {
    const status = card.getAttribute('data-status');
    const route = card.getAttribute('data-route');

    if (status === 'active') {
      // Play tap animation then navigate
      playTap(card);
      // ripple if pointer info available
      if (pointerEvent && pointerEvent.clientX !== undefined) {
        createRipple(card, pointerEvent.clientX, pointerEvent.clientY);
      }
      card.setAttribute('aria-pressed', 'true');
      navigateTo(route);
    } else {
      // Disabled: shake and show "Coming soon"
      playShake(card);
      showInlineFeedback(card, 'Coming soon');
     // showToast('Coming soon');
    }
  }

  // Event delegation for clicks
  document.addEventListener('click', function (ev) {
    const card = ev.target.closest('.service-card');
    if (!card) return;
    ev.preventDefault();
    handleActivation(card, ev);
  }, { passive: false });

  // Keyboard accessibility: Enter or Space activates
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' || ev.key === ' ') {
      const active = document.activeElement;
      if (active && active.classList && active.classList.contains('service-card')) {
        ev.preventDefault();
        handleActivation(active);
      }
    }
  });

  // Touch feedback: add press class on touchstart, remove on touchend
  document.addEventListener('touchstart', function (ev) {
    const card = ev.target.closest('.service-card');
    if (!card) return;
    card.classList.add(PRESS_CLASS);
  }, { passive: true });

  document.addEventListener('touchend', function (ev) {
    const card = ev.target.closest('.service-card');
    if (!card) return;
    // small delay to allow press to be perceived
    setTimeout(() => {
      card.classList.remove(PRESS_CLASS);
    }, 120);
  }, { passive: true });

  // Mouse down/up for desktop click press feedback
  document.addEventListener('mousedown', function (ev) {
    const card = ev.target.closest('.service-card');
    if (!card) return;
    card.classList.add(PRESS_CLASS);
  });
  document.addEventListener('mouseup', function (ev) {
    const card = ev.target.closest('.service-card');
    if (!card) return;
    setTimeout(() => {
      card.classList.remove(PRESS_CLASS);
    }, 120);
  });

  // Prevent accidental text selection on long press
  document.addEventListener('selectstart', function (ev) {
    if (ev.target.closest && ev.target.closest('.service-card')) {
      ev.preventDefault();
    }
  });

  // Ensure all service-card elements have required attributes and accessible roles
  function validateCards() {
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
      if (!card.hasAttribute('data-route')) {
        card.setAttribute('data-route', '/');
      }
      if (!card.hasAttribute('data-status')) {
        card.setAttribute('data-status', 'disabled');
      }
      if (!card.hasAttribute('role')) card.setAttribute('role', 'button');
      if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
      // prepare for load animation
      card.classList.add('card-preload');
    });
  }

  // Page-load staggered animation
  function runStaggeredLoad() {
    const cards = Array.from(document.querySelectorAll('.service-card'));
    cards.forEach((card, i) => {
      const delay = i * STAGGER_STEP;
      setTimeout(() => {
        card.classList.add('card-animate');
        // remove preload class after animation completes
        setTimeout(() => {
          card.classList.remove('card-preload');
        }, parseInt(getComputedStyle(document.documentElement).getPropertyValue('--load-duration')) || 360);
      }, delay);
    });
  }

  // Initialize
  function init() {
    validateCards();

    // Add ripple on pointerdown for better feedback (desktop)
    document.addEventListener('pointerdown', function (ev) {
      const card = ev.target.closest('.service-card');
      if (!card) return;
      // create ripple for primary button only
      if (ev.isPrimary) {
        createRipple(card, ev.clientX, ev.clientY);
      }
    });

    // Provide subtle initial focus outline for keyboard users
    document.body.addEventListener('keydown', function onFirstKey(e) {
      if (e.key === 'Tab') {
        document.documentElement.classList.add('user-is-tabbing');
        document.body.removeEventListener('keydown', onFirstKey);
      }
    });

    // Run page-load animation after a short delay to ensure paint
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(runStaggeredLoad, 80);
    } else {
      window.addEventListener('DOMContentLoaded', function () {
        setTimeout(runStaggeredLoad, 80);
      });
    }
  }

  // Run init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

