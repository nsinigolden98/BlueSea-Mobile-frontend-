/* scripts.js
   BlueseaMobile front-end logic
   - Tab switching + measured sliding (works on mobile by measuring actual widths)
   - Theme toggle
   - Password show/hide with SVG icons
   - Client-side validation (Nigeria phone, username, password policy)
   - Signup/login flows with OTP modal (send-otp, verify-otp)
   - Remember-me flow (localStorage flag + backend receives rememberMe boolean)
   - OTP resend cooldown (50s), OTP attempt limit (5 tries then 30-min lock stored in localStorage)
   - Social OAuth popup scaffolding (Google + Apple; Apple button enabled on Apple platforms only)
   - Fetch uses credentials: 'include' (cookie-based auth)
   IMPORTANT: replace API_BASE constant with your real backend URL if different.
*/

(function () {
  "use strict";

  /* -------------- Configuration (change as needed) -------------- */
  // Domain base; update if your API is at another subdomain
  const API_BASE = "https://blueseamobile.com.ng"; // <--- change if needed

  // Endpoints used by frontend (server must implement these)
  const ENDPOINTS = {
    login: `${API_BASE}/api/auth/login`,
    signup: `${API_BASE}/api/auth/signup`,
    sendOtp: `${API_BASE}/api/auth/send-otp`,       // POST { purpose, target } -> 200
    verifyOtp: `${API_BASE}/api/auth/verify-otp`,   // POST { purpose, target, otp } -> 200
    forgotReset: `${API_BASE}/api/auth/forgot-reset`, // POST { email, otp, newPassword }
    oauthGoogle: `${API_BASE}/api/auth/oauth/google`, // GET -> starts OAuth handshake
    oauthApple: `${API_BASE}/api/auth/oauth/apple`,   // GET -> starts Apple handshake
  };

  // OTP & timers
  const OTP_LENGTH = 6;
  const OTP_RESEND_SECONDS = 50;
  const OTP_ATTEMPT_LIMIT = 5;
  const OTP_BLOCK_MINUTES = 30;

  // Password policy
  const PASSWORD_MIN_LENGTH = 8;
  // allowed special chars: # $ @
  const PASSWORD_ALLOWED_SPECIALS = /[#@$]/;

  /* -------------- Helpers -------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));
  const safeAdd = (el, ev, cb) => { if (el) el.addEventListener(ev, cb); };

  function showToast(msg, ms = 2200) {
    const t = $("#bs_toast");
    if (!t) { alert(msg); return; }
    t.textContent = msg;
    t.hidden = false;
    t.style.opacity = 1;
    clearTimeout(t._hideTO);
    t._hideTO = setTimeout(() => { t.hidden = true; }, ms);
  }

  function setError(inputEl, message) {
    if (!inputEl) return;
    const field = inputEl.closest(".bs_field");
    const err = field ? field.querySelector(".bs_error") : null;
    if (err) {
      err.textContent = message || "";
      if (message) err.classList.add("active");
      else err.classList.remove("active");
    }
  }

  function clearAllErrors(container = document) {
    $$(".bs_error", container).forEach(e => { e.textContent = ""; e.classList.remove("active"); });
  }

  /* Normalize phone to E.164 for Nigeria:
     Accepts:
       0XXXXXXXXXX (11 digits starting with 0, second digit must be 7/8/9)
       +234XXXXXXXXXX (13 chars including +234, then 10 digits, first digit after +234 must be 7/8/9)
     Returns normalized +234XXXXXXXXXX or null if invalid
  */
  function normalizeNigeriaPhone(raw) {
    if (!raw) return null;
    let s = raw.trim().replace(/\s+/g, "");
    // strip non-digits except leading +
    if (s.startsWith("+")) {
      s = "+" + s.slice(1).replace(/\D/g, "");
    } else {
      s = s.replace(/\D/g, "");
    }
    // local 0XXXXXXXXXX (11)
    if (/^0\d{10}$/.test(s)) {
      const second = s[1];
      if (!/[789]/.test(second)) return null;
      return `+234${s.slice(1)}`;
    }
    // +234XXXXXXXXXX
    if (/^\+234\d{10}$/.test(s)) {
      const firstAfter = s[4];
      if (!/[789]/.test(firstAfter)) return null;
      return s;
    }
    return null;
  }

  function validUsername(u) {
    if (!u) return false;
    return /^[a-zA-Z0-9_-]{3,30}$/.test(u);
  }

  function validPassword(p) {
    if (!p) return false;
    if (p.length < PASSWORD_MIN_LENGTH) return false;
    if (!/[A-Za-z]/.test(p)) return false;
    if (!/\d/.test(p)) return false;
    // allow only alphanumerics and # $ @ as specials
    if (/[^A-Za-z0-9#@$]/.test(p)) return false;
    return true;
  }

  /* OTP attempt/block storage in localStorage keyed by target+purpose */
  function _otpKey(target, purpose) { return `bs_otp_${purpose}_${target}`; }
  function getOtpState(target, purpose) {
    try {
      const raw = localStorage.getItem(_otpKey(target, purpose));
      return raw ? JSON.parse(raw) : { attempts: 0, blockedUntil: 0 };
    } catch (e) { return { attempts: 0, blockedUntil: 0 }; }
  }
  function setOtpState(target, purpose, state) {
    try { localStorage.setItem(_otpKey(target, purpose), JSON.stringify(state)); } catch (e) {}
  }

  /* -------------- DOM references -------------- */
  const el_tab_login = $("#bs_tab_login");
  const el_tab_signup = $("#bs_tab_signup");
  const el_indicator = $("#bs_tab_indicator");
  const el_forms_inner = $("#bs_forms_inner");
  const htmlEl = document.documentElement;
  const theme_toggle = $("#bs_theme_toggle");

  const form_login = $("#bs_form_login");
  const form_signup = $("#bs_form_signup");

  const btn_google = $("#bs_google");
  const btn_apple = $("#bs_apple");

  const modal = $("#bs_modal");
  const modal_close = $("#bs_modal_close");
  const modal_tabs = $$(".bs_modal_tab", modal);
  const modal_panels = $$(".bs_modal_panel_item", modal);
  const modal_timer_email = $("#bs_modal_timer_email");
  const modal_timer_phone = $("#bs_modal_timer_phone");
  const modal_resend_email = $("#bs_modal_resend_email");
  const modal_resend_phone = $("#bs_modal_resend_phone");
  const modal_verify_email = $("#bs_modal_verify_email");
  const modal_verify_phone = $("#bs_modal_verify_phone");
  const modal_email_input = $("#modal_email_otp");
  const modal_phone_input = $("#modal_phone_otp");

  const rememberChk = $("#login_remember");

  /* -------------- initial state -------------- */
  htmlEl.dataset.show = "login";
  htmlEl.dataset.theme = "light"; // default
  // If user has previously chosen remember-me (flag only) pre-check:
  try {
    const remembered = localStorage.getItem("bs_remember_me") === "true";
    if (remembered && rememberChk) rememberChk.checked = true;
  } catch (e) {}

  /* -------------- Tab indicator: measure active tab and set CSS vars -------------- */
  function updateTabIndicator() {
    if (!el_indicator) return;
    const active = document.querySelector(".bs_tab.active");
    if (!active) return;
    const parentRect = el_indicator.getBoundingClientRect();
    const tabRect = active.getBoundingClientRect();
    const left = Math.round(tabRect.left - parentRect.left);
    const width = Math.round(tabRect.width);
    el_indicator.style.setProperty("--indicator-left", `${left}px`);
    el_indicator.style.setProperty("--indicator-width", `${width}px`);
  }

  /* -------------- Sliding forms that measures widths so it works same on mobile & desktop -------------- */
  function computeAndSetSlide(index /* 0 or 1 */) {
    // index 0 -> login, 1 -> signup
    if (!el_forms_inner) return;
    const forms = $$(".bs_form", el_forms_inner);
    if (!forms.length) return;
    // calculate offset as sum of widths of preceding forms
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += forms[i].offsetWidth;
    }
    el_forms_inner.style.transform = `translateX(-${offset}px)`;
  }

  function setActiveTab(tab) {
    if (!el_tab_login || !el_tab_signup) return;
    if (tab === "signup") {
      el_tab_signup.classList.add("active");
      el_tab_signup.setAttribute("aria-selected", "true");
      el_tab_signup.setAttribute("tabindex", "0");
      el_tab_login.classList.remove("active");
      el_tab_login.setAttribute("aria-selected", "false");
      el_tab_login.setAttribute("tabindex", "-1");
      if (form_signup) form_signup.setAttribute("aria-hidden", "false");
      if (form_login) form_login.setAttribute("aria-hidden", "true");
      htmlEl.dataset.show = "signup";
      // compute based on actual layout
      computeAndSetSlide(1);
    } else {
      el_tab_login.classList.add("active");
      el_tab_login.setAttribute("aria-selected", "true");
      el_tab_login.setAttribute("tabindex", "0");
      el_tab_signup.classList.remove("active");
      el_tab_signup.setAttribute("aria-selected", "false");
      el_tab_signup.setAttribute("tabindex", "-1");
      if (form_login) form_login.setAttribute("aria-hidden", "false");
      if (form_signup) form_signup.setAttribute("aria-hidden", "true");
      htmlEl.dataset.show = "login";
      computeAndSetSlide(0);
    }
    updateTabIndicator();
  }

  safeAdd(el_tab_login, "click", (e) => { e.preventDefault(); setActiveTab("login"); });
  safeAdd(el_tab_signup, "click", (e) => { e.preventDefault(); setActiveTab("signup"); });

  // keyboard navigation for tabs
  safeAdd(document.querySelector(".bs_tabs"), "keydown", (e) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const tabs = Array.from(document.querySelectorAll(".bs_tab"));
    const currentIndex = tabs.findIndex(t => t.classList.contains("active"));
    let nextIndex = currentIndex;
    if (e.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (e.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (e.key === "Home") nextIndex = 0;
    if (e.key === "End") nextIndex = tabs.length - 1;
    const nextTab = tabs[nextIndex];
    if (nextTab) { nextTab.click(); nextTab.focus(); }
  });

  // Update indicator on load/resize
  safeAdd(window, "load", () => { updateTabIndicator(); computeAndSetSlide(htmlEl.dataset.show === "signup" ? 1 : 0); });
  safeAdd(window, "resize", () => { updateTabIndicator(); computeAndSetSlide(htmlEl.dataset.show === "signup" ? 1 : 0); });
  setTimeout(() => { updateTabIndicator(); computeAndSetSlide(0); }, 160);

  /* -------------- Theme toggle -------------- */
  safeAdd(theme_toggle, "click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    // This only toggles CSS variables; persist if desired:
    try { localStorage.setItem("bs_theme", next); } catch (e) {}
  });

  /* -------------- Password toggle behaviour (eye icon) -------------- */
  $$(".bs_toggle_password").forEach(btn => {
    safeAdd(btn, "click", () => {
      const targetId = btn.getAttribute("data-target");
      if (!targetId) return;
      const input = document.getElementById(targetId);
      if (!input) return;
      const isPwd = input.type === "password";
      input.type = isPwd ? "text" : "password";
      // toggle class on button to switch SVGs
      if (isPwd) btn.classList.add("bs_toggle_show"); else btn.classList.remove("bs_toggle_show");
      btn.setAttribute("aria-pressed", isPwd ? "true" : "false");
    });
  });

  /* -------------- Social OAuth popup helpers -------------- */
  function isApplePlatform() {
    // simple check
    return /iPad|iPhone|Macintosh/.test(navigator.userAgent) && !/Android/.test(navigator.userAgent);
  }

  function openOAuthPopup(url, name, w = 600, h = 700) {
    // open centered popup
    const left = Math.max(0, (screen.width / 2) - (w / 2));
    const top = Math.max(0, (screen.height / 2) - (h / 2));
    const opts = `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=${w}, height=${h}, top=${top}, left=${left}`;
    const popup = window.open(url, name, opts);
    if (!popup) {
      showToast("Popup blocked — please allow popups for this site.");
      return null;
    }

    // Listen for message from popup (the popup should postMessage back upon success)
    function handleMessage(e) {
      try {
        // Security: check origin in production
        // if (e.origin !== API_BASE) return;
      } catch (err) {}
      // expected payload { type: 'oauth', success: true }
      if (e.data && e.data.type === "oauth" && e.data.success) {
        showToast("Signed in via provider.");
        // close popup and cleanup
        try { popup.close(); } catch (e) {}
        window.removeEventListener("message", handleMessage);
        // redirect or refresh as necessary:
        window.location.href = "/dashboard.html";
      }
    }
    window.addEventListener("message", handleMessage);
    return popup;
  }

  safeAdd(btn_google, "click", (e) => {
    e.preventDefault();
    // Open OAuth popup to our backend endpoint which starts Google flow.
    openOAuthPopup(ENDPOINTS.oauthGoogle, "bs_google_oauth");
  });

  // Enable apple button only on Apple platforms per request
  if (!isApplePlatform()) {
    btn_apple.setAttribute("disabled", "true");
    btn_apple.title = "Apple sign-in is only available on Apple devices";
    btn_apple.classList.add("bs_disabled");
  } else {
    safeAdd(btn_apple, "click", (e) => {
      e.preventDefault();
      openOAuthPopup(ENDPOINTS.oauthApple, "bs_apple_oauth");
    });
  }

  /* -------------- Modal: open/close and tabs -------------- */
  function openModal(purposeData = {}) {
    // purposeData: { purpose: 'signup_email' | 'signup_phone' | 'login' | 'forgot_password', target: 'user@example.com' }
    modal.dataset.purpose = JSON.stringify(purposeData || {});
    modal.setAttribute("aria-hidden", "false");
    // default to email tab
    switchModalPanel("email");
    // start timers (resend disabled initially until first send called)
    resetModalTimers();
  }
  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    // clear inputs and errors
    modal_email_input.value = "";
    modal_phone_input.value = "";
    clearAllErrors(modal);
  }

  safeAdd(modal_close, "click", () => { closeModal(); });
  safeAdd(modal, "click", (ev) => { if (ev.target === modal) closeModal(); }); // backdrop click

  modal_tabs.forEach(tab => {
    safeAdd(tab, "click", () => {
      modal_tabs.forEach(t => { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); t.setAttribute("tabindex", "-1"); });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      tab.setAttribute("tabindex", "0");
      const target = tab.getAttribute("data-target");
      switchModalPanel(target);
    });
  });

  function switchModalPanel(target) {
    modal_panels.forEach(p => {
      const match = p.getAttribute("data-panel") === target;
      p.setAttribute("aria-hidden", match ? "false" : "true");
    });
  }

  /* -------------- Modal resend timers & OTP logic -------------- */
  function resetModalTimers() {
    modal_timer_email.textContent = OTP_RESEND_SECONDS;
    modal_timer_phone.textContent = OTP_RESEND_SECONDS;
    modal_resend_email.disabled = true;
    modal_resend_phone.disabled = true;
  }

  function startCountdown(spanEl, btnEl) {
    let t = OTP_RESEND_SECONDS;
    spanEl.textContent = t;
    btnEl.disabled = true;
    const id = setInterval(() => {
      t -= 1;
      spanEl.textContent = t;
      if (t <= 0) { clearInterval(id); btnEl.disabled = false; spanEl.textContent = OTP_RESEND_SECONDS; }
    }, 1000);
    return id;
  }

  /* -------------- Helper to call backend endpoints (with credentials included) -------------- */
  async function apiPost(url, body) {
    try {
      const res = await fetch(url, {
        method: "POST",
        credentials: "include", // cookie-based auth
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const json = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data: json };
    } catch (err) {
      return { ok: false, status: 0, data: { error: "Network error" } };
    }
  }

  /* -------------- Send OTP (email or phone) -------------- */
  async function sendOtp(purpose, target) {
    // purpose values: 'signup_email', 'signup_phone', 'login_email', 'login_phone', 'forgot_password'
    if (!purpose || !target) return { ok:false, data:{error:"Missing purpose/target"} };

    // check OTP blocked state
    const state = getOtpState(target, purpose);
    const now = Date.now();
    if (state.blockedUntil && state.blockedUntil > now) {
      return { ok:false, data:{ error:`Too many attempts. Try again after ${Math.ceil((state.blockedUntil - now)/60000)} minutes.` } };
    }

    const payload = { purpose, target };
    const res = await apiPost(ENDPOINTS.sendOtp, payload);
    return res;
  }

  /* -------------- Verify OTP -------------- */
  async function verifyOtp(purpose, target, otp) {
    const state = getOtpState(target, purpose);
    const now = Date.now();
    if (state.blockedUntil && state.blockedUntil > now) {
      return { ok:false, data:{ error:`Blocked. Try again later.` } };
    }

    // call backend
    const res = await apiPost(ENDPOINTS.verifyOtp, { purpose, target, otp });
    if (!res.ok) {
      // increment attempt count
      state.attempts = (state.attempts || 0) + 1;
      if (state.attempts >= OTP_ATTEMPT_LIMIT) {
        state.blockedUntil = Date.now() + OTP_BLOCK_MINUTES * 60 * 1000;
        state.attempts = 0;
      }
      setOtpState(target, purpose, state);
    } else {
      // success: clear state
      setOtpState(target, purpose, { attempts: 0, blockedUntil: 0 });
    }
    return res;
  }

  /* -------------- Modal UI actions (resend & verify) -------------- */
  safeAdd(modal_resend_email, "click", async () => {
    const meta = JSON.parse(modal.dataset.purpose || "{}");
    const target = meta.target || $("#signup_email").value || $("#login_identifier").value;
    const purpose = (meta.purpose === "signup" ? "signup_email" : (meta.purpose || "login_email"));
    modal_resend_email.disabled = true;
    const r = await sendOtp(purpose, target);
    if (r.ok) {
      showToast("OTP sent to email.");
      startCountdown(modal_timer_email, modal_resend_email);
    } else {
      showToast(r.data?.error || "Failed to send OTP.");
      modal_resend_email.disabled = false;
    }
  });

  safeAdd(modal_resend_phone, "click", async () => {
    const meta = JSON.parse(modal.dataset.purpose || "{}");
    const target = meta.target || $("#signup_phone").value || $("#login_identifier").value;
    const purpose = (meta.purpose === "signup" ? "signup_phone" : (meta.purpose || "login_phone"));
    modal_resend_phone.disabled = true;
    const r = await sendOtp(purpose, target);
    if (r.ok) {
      showToast("OTP sent to phone.");
      startCountdown(modal_timer_phone, modal_resend_phone);
    } else {
      showToast(r.data?.error || "Failed to send OTP.");
      modal_resend_phone.disabled = false;
    }
  });

  safeAdd(modal_verify_email, "click", async () => {
    const meta = JSON.parse(modal.dataset.purpose || "{}");
    const target = meta.target || $("#signup_email").value || $("#login_identifier").value;
    const purpose = meta.purpose || "login_email";
    const code = modal_email_input.value.trim();
    if (!/^\d{6}$/.test(code)) { setError(modal_email_input, "Enter 6-digit code"); return; }
    setError(modal_email_input, "");
    const r = await verifyOtp(purpose, target, code);
    if (r.ok) {
      showToast("Email verified.");
      // Post-success behaviour:
      // if we were verifying as part of signup -> optionally continue to let user verify phone as well
      closeModal();
      if (purpose.startsWith("signup")) {
        // after signup verification, we switch UI to login
        setActiveTab("login");
        showToast("Signup verified. Please login.");
      } else if (purpose === "login_email" || purpose === "login_phone") {
        // Login finalization: server should have created session cookie upon OTP verify.
        window.location.href = "/dashboard.html";
      } else if (purpose === "forgot_password") {
        // Show reset password UI inside modal (not implemented here) -> we will open a small prompt
        // For simplicity, redirect to a reset flow page or show a prompt:
        showToast("Email verified — now reset your password (server flow).");
      }
    } else {
      setError(modal_email_input, r.data?.error || "Invalid code");
    }
  });

  safeAdd(modal_verify_phone, "click", async () => {
    const meta = JSON.parse(modal.dataset.purpose || "{}");
    const target = meta.target || $("#signup_phone").value || $("#login_identifier").value;
    const purpose = meta.purpose || "login_phone";
    const code = modal_phone_input.value.trim();
    if (!/^\d{6}$/.test(code)) { setError(modal_phone_input, "Enter 6-digit code"); return; }
    setError(modal_phone_input, "");
    const r = await verifyOtp(purpose, target, code);
    if (r.ok) {
      showToast("Phone verified.");
      closeModal();
      if (purpose.startsWith("signup")) {
        setActiveTab("login");
        showToast("Signup verified. Please login.");
      } else if (purpose === "login_phone" || purpose === "login_email") {
        window.location.href = "/dashboard.html";
      }
    } else {
      setError(modal_phone_input, r.data?.error || "Invalid code");
    }
  });

  /* -------------- Login Form Submit -------------- */
  safeAdd(form_login, "submit", async (ev) => {
    ev.preventDefault();
    clearAllErrors(form_login);
    const identifier = $("#login_identifier").value.trim();
    const password = $("#login_password").value;
    const rememberMe = !!$("#login_remember").checked;

    let valid = true;
    if (!identifier) { setError($("#login_identifier"), "Please enter email, phone or username."); valid = false; }
    if (!password) { setError($("#login_password"), "Please enter your password."); valid = false; }
    if (!valid) return;

    // prepare payload: send identifier as-is. Server should accept email/phone/username.
    const res = await apiPost(ENDPOINTS.login, { identifier, password, rememberMe });
    if (!res.ok) {
      // server-side validation errors mapping
      if (res.data && res.data.errors) {
        for (const k in res.data.errors) {
          const msg = res.data.errors[k];
          // map server fields to UI elements
          if (k.includes("email") || k.includes("identifier")) setError($("#login_identifier"), msg);
          if (k.includes("password")) setError($("#login_password"), msg);
        }
      } else {
        // if server indicates OTP required (e.g. status 202 or custom response)
        if (res.status === 202 && res.data && res.data.otpRequiredFor) {
          // open modal for OTP, meta { purpose, target }
          const purpose = res.data.otpRequiredFor === "email" ? "login_email" : "login_phone";
          const target = res.data.target || identifier;
          openModal({ purpose, target });
          // send otp proactively
          await sendOtp(purpose, target);
          startCountdown(modal_timer_email, modal_resend_email);
          startCountdown(modal_timer_phone, modal_resend_phone);
          return;
        }
        showToast(res.data?.error || "Login failed.");
      }
      return;
    }

    // Successful login: server should set session cookie.
    // Save remember-me flag locally so we pre-check next time
    try { localStorage.setItem("bs_remember_me", rememberMe ? "true" : "false"); } catch (e) {}

    showToast("Login successful. Redirecting...");
    setTimeout(() => { window.location.href = "/dashboard.html"; }, 700);
  });

  /* -------------- Signup Form Submit -------------- */
  safeAdd(form_signup, "submit", async (ev) => {
    ev.preventDefault();
    clearAllErrors(form_signup);
    const email = $("#signup_email").value.trim();
    const phoneRaw = $("#signup_phone").value.trim();
    const username = $("#signup_username").value.trim();
    const password = $("#signup_password").value;
    const confirm = $("#signup_confirm").value;
    const terms = !!$("#signup_terms").checked;

    let valid = true;
    if (!email) { setError($("#signup_email"), "Please enter your email."); valid = false; }
    if (!phoneRaw) { setError($("#signup_phone"), "Please enter your phone."); valid = false; }
    if (!username) { setError($("#signup_username"), "Please choose a username."); valid = false; }
    if (!password) { setError($("#signup_password"), "Please enter a password."); valid = false; }
    if (!confirm) { setError($("#signup_confirm"), "Confirm your password."); valid = false; }
    if (!terms) { setError($("#signup_terms"), "You must accept Terms & Policy."); valid = false; }
    if (!valid) return;
    
    // validate phone
    const phone = normalizeNigeriaPhone(phoneRaw);
    if (!phone) { setError($("#signup_phone"), "Use Nigerian format: 0XXXXXXXXXX or +234XXXXXXXXXX starting with 7|8|9."); return; }

    // password policy
    if (!validPassword(password)) {
      setError($("#signup_password"), "Password must be >=8 chars, include letters and digits; allowed specials: # $ @");
      return;
    }
    if (password !== confirm) { setError($("#signup_confirm"), "Passwords do not match."); return; }

    // POST to signup
    const res = await apiPost(ENDPOINTS.signup, { email, phone, username, password });
    if (!res.ok) {
      if (res.data && res.data.errors) {
        for (const k in res.data.errors) {
          if (k.includes("email")) setError($("#signup_email"), res.data.errors[k]);
          if (k.includes("phone")) setError($("#signup_phone"), res.data.errors[k]);
          if (k.includes("username")) setError($("#signup_username"), res.data.errors[k]);
          if (k.includes("password")) setError($("#signup_password"), res.data.errors[k]);
        }
      } else {
        showToast(res.data?.error || "Signup failed.");
      }
      return;
    }

    // Signup success: open OTP modal for either email or phone as user chooses.
    showToast("Signup created. Please verify your email (and phone if you want).");
    // Open modal with purpose 'signup' and target = email by default (user can switch to phone)
    openModal({ purpose: "signup", target: email });
    // send OTP for email by default (user can switch to phone and click resend for phone)
    const sendRes = await sendOtp("signup_email", email);
    if (sendRes.ok) {
      startCountdown(modal_timer_email, modal_resend_email);
    } else {
      showToast(sendRes.data?.error || "Failed to send email OTP.");
    }
  });

  /* -------------- Forgot password flow (trigger modal for email) -------------- */
  safeAdd($("#bs_forgot"), "click", (ev) => {
    ev.preventDefault();
    // Show modal purpose forgot_password (default to email)
    openModal({ purpose: "forgot_password", target: "" });
    modal_tabs[0].click();
  });

  /* -------------- Misc: auto-focus input when modal opens -------------- */
  const mo = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.attributeName === "aria-hidden") {
        if (modal.getAttribute("aria-hidden") === "false") {
          setTimeout(() => { $("#modal_email_otp").focus(); }, 120);
        }
      }
    }
  });
  mo.observe(modal, { attributes: true });

  /* -------------- On load: set initial remembered flag and update indicator -------------- */
  document.addEventListener("DOMContentLoaded", () => {
    updateTabIndicator();
    computeAndSetSlide(htmlEl.dataset.show === "signup" ? 1 : 0);
  });

  /* -------------- Final developer notes (in-code) --------------
     - The backend must implement the endpoints referenced in ENDPOINTS.
     - The login endpoint should:
         * validate credentials
         * if credentials valid and OTP is required, return 202 with { otpRequiredFor: "email"|"phone", target: "..."}
         * if credentials valid and no OTP required (rememberMe flow), set secure HTTP-only cookie and return 200
     - send-otp endpoint should accept { purpose, target } and respond 200 on success.
     - verify-otp endpoint should accept { purpose, target, otp } and on successful verification set session cookie if purpose = login_* OR return success for signup verification.
     - OAuth popup flow: the endpoints oauthGoogle / oauthApple should start the provider handshake on backend and eventually redirect to a small oauth-redirect page that will postMessage { type: 'oauth', success: true } to the opener.
     - All fetch() calls use credentials: 'include' to allow server to set HttpOnly cookie; ensure server CORS allows credentials and returns appropriate Access-Control-Allow-Origin.
     - Replace API_BASE with your real base if different.
  -------------------------------------------------------------- */

})();
