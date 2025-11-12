/* js/script.js
   Blue Sea Mobile — interactions & accessibility
   - Modern ES6
   - No external libraries required
   - Handles: reveal on scroll, modal open/close (dialog fallback),
     testimonials seamless duplication, footer year, and nav smooth-scroll
*/

/* ====== DOMContentLoaded ====== */
document.addEventListener('DOMContentLoaded', () => {
  // Set footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Reveal on scroll using IntersectionObserver
  initRevealOnScroll();

  // Modal open/close wiring (supports <dialog> and fallback)
  initModals();

  // Testimonials: duplicate items to make loop seamless (if not already duplicated)
  initTestimonials();

  // Smooth scroll for internal links with data-link
  initSmoothScroll();
});

/* ===== Reveal on scroll ===== */
function initRevealOnScroll() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      } else {
        // keep visible once seen to avoid jank on small devices
        // entry.target.classList.remove('is-visible');
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(r => io.observe(r));
}

/* ===== Modals (dialog) ===== */
function initModals() {
  // open buttons
  document.querySelectorAll('.js-open-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-modal');
      openModalById(id);
    });
  });

  // fallback: attach close handlers
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const dlg = btn.closest('dialog');
      if (!dlg) return;
      if (typeof dlg.close === 'function') dlg.close();
      else dlg.removeAttribute('open');
    });
  });

  // close on backdrop click for native dialog
  document.querySelectorAll('dialog.modal').forEach(d => {
    d.addEventListener('click', (e) => {
      const rect = d.querySelector('.modal-inner').getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom || e.clientX < rect.left || e.clientX > rect.right) {
        if (typeof d.close === 'function') d.close();
        else d.removeAttribute('open');
      }
    });
  });
}

function openModalById(id){
  if (!id) return;
  const dlg = document.getElementById(id);
  if (!dlg) return;
  if (typeof dlg.showModal === 'function') {
    try {
      dlg.showModal();
      // set focus on first focusable element inside
      const first = dlg.querySelector('button, a, input, [tabindex]:not([tabindex="-1"])');
      if (first) first.focus();
    } catch (err) {
      // If showModal fails, fallback to class toggle
      dlg.setAttribute('open', 'true');
    }
  } else {
    // fallback: emulate open
    dlg.setAttribute('open', 'true');
  }
}

/* ===== Testimonials seamless loop ===== */
function initTestimonials() {
  const track = document.getElementById('testimonials-track');
  if (!track) return;

  // Duplicate children to ensure seamless loop (only once)
  if (!track.dataset.duplicated) {
    const items = Array.from(track.children);
    items.forEach(node => {
      const clone = node.cloneNode(true);
      track.appendChild(clone);
    });
    track.dataset.duplicated = "true";
  }

  // On window resize, adjust animation duration (smaller screens slower)
  const adjust = () => {
    const w = window.innerWidth;
    const base = w < 720 ? 24 : 28;
    track.style.animationDuration = base + 's';
  };
  adjust();
  window.addEventListener('resize', adjust);
}

/* ===== Smooth scroll for anchor links with data-link ===== */
function initSmoothScroll(){
  document.querySelectorAll('[data-link]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const href = a.getAttribute('href');
      if (!href || href[0] !== '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // update focus for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({preventScroll:true});
    });
  });
}
