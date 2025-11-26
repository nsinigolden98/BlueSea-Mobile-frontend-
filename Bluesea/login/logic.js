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
  //const API_BASE = "https://blueseamobile.com.ng"; // <--- change if needed
  const API_BASE = "http://127.0.0.1:8000"; // <--- change if needed this is for testing locally

  // Endpoints used by frontend (server must implement these)
  const ENDPOINTS = {
    login: `${API_BASE}/accounts/login/`,
 
    signup: `${API_BASE}/accounts/sign-up/`,
    sendOtp: `${API_BASE}/accounts/resend-otp/`,       // POST { purpose, target } -> 200
    sendOtp_FP: `${API_BASE}/accounts/password/reset/request/`,       // POST { purpose, target } -> 200
    verify_FP: `${API_BASE}/accounts/password/reset/verify-otp/`,       // POST { purpose, target } -> 200
    confirm_FP: `${API_BASE}/accounts/password/reset/confirm/`,       // POST { purpose, target } -> 200
    verifyOtp: `${API_BASE}/accounts/verify-email/`,   // POST { purpose, target, otp } -> 200
    forgotReset: `${API_BASE}/accounts/auth/forgot-reset`, // POST { email, otp, newPassword }
    oauthGoogle: `${API_BASE}/accounts/auth/google`, // GET -> starts OAuth handshake
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


  function showToast(msg, ms = 8200) {
    const t = $("#toast");
    if (!t) { alert(msg); return; }
    t.textContent = msg;
    t.hidden = false;
    t.style.opacity = 1;
    clearTimeout(t._hideTO);
    t._hideTO = setTimeout(() => { t.hidden = true; }, ms);
  }

  function setError(inputEl, message) {
    if (!inputEl) return;
    const field = inputEl.closest(".field");
    const err = field ? field.querySelector(".error") : null;
    if (err) {
      err.textContent = message || "";
      if (message) err.classList.add("active");
      else err.classList.remove("active");
    }
  }

  function clearAllErrors(container = document) {
    $$(".error", container).forEach(e => { e.textContent = ""; e.classList.remove("active"); });
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
  function _otpKey(target, purpose) { return `otp_${purpose}_${target}`; }
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
  const el_tab_login = $("#tab_login");
  const el_tab_signup = $("#tab_signup");
  const el_indicator = $("#tab_indicator");
  const el_forms_inner = $("#forms_inner");
  const htmlEl = document.documentElement;
  const theme_toggle = $("#theme_toggle");

  const form_login = $("#form_login");
  const form_signup = $("#form_signup");

  const btn_google = $("#google");
  const btn_apple = $("#apple");

  const modal = $("#modal");
  const modal_close = $("#modal_close");
  const modal_tabs = $$(".modal_tab", modal);
  const modal_panels = $$(".modal_panel_item", modal);
  const modal_timer_email = $("#modal_timer_email");
  const modal_timer_phone = $("#modal_timer_phone");
  const modal_resend_email = $("#modal_resend_email");
  const modal_resend_phone = $("#modal_resend_phone");
  const modal_verify_email = $("#modal_verify_email");
  const modal_verify_phone = $("#modal_verify_phone");
  const modal_email_input = $("#modal_email_otp");
  const modal_phone_input = $("#modal_phone_otp");

  const rememberChk = $("#login_remember");

  /* -------------- initial state -------------- */
  htmlEl.dataset.show = "login";

  // If user has previously chosen remember-me (flag only) pre-check:
  try {
    const remembered = localStorage.getItem("remember_me") === "true";
    if (remembered && rememberChk) rememberChk.checked = true;
  } catch (e) {}

  /* -------------- Tab indicator: measure active tab and set CSS vars -------------- */
  function updateTabIndicator() {
    if (!el_indicator) return;
    const active = document.querySelector(".tab.active");
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
    const forms = $$(".form", el_forms_inner);
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
  safeAdd(document.querySelector(".tabs"), "keydown", (e) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const tabs = Array.from(document.querySelectorAll(".tab"));
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

  /* -------------- Password toggle behaviour (eye icon) -------------- */
  $$(".toggle_password").forEach(btn => {
    safeAdd(btn, "click", () => {
        
      const targetId = btn.getAttribute("data-target");
      console.log(targetId);
      if (!targetId) return;
      const input = document.getElementById(targetId);
      if (!input) return;
      const isPwd = input.type === "password";
      input.type = isPwd ? "text" : "password";
      // toggle class on button to switch SVGs
      if (isPwd) btn.classList.add("toggle_show"); else btn.classList.remove("toggle_show");
      btn.setAttribute("aria-pressed", isPwd ? "true" : "false");
    });
  });

  /* -------------- Social OAuth popup helpers -------------- */

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
    openOAuthPopup(ENDPOINTS.oauthGoogle, "google_oauth");
  });

  /* -------------- Modal: open/close and tabs -------------- */
  function openModal() {
    modal.setAttribute("aria-hidden", "false");
    switchModalPanel("email");
    resetModalTimers("signup");
  }
  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    // clear inputs and errors
    modal_email_input.value = "";
    modal_phone_input.value = "";
    clearAllErrors(modal);
  }
  function reset_closeModal(){
    // For Forgot Password
    $("#modal_email_FP").value = "";
    $("#modal_otp_FP").value = "";
    $("#reset_password").value = "";
    $("#reset_confirm").value = "";
    document.getElementById("FP").style.display = "none";
   // resetModalTimers("forgot_password");
  };
  safeAdd(modal_close, "click", () => { closeModal(); });
  safeAdd($("#fp_modal_close"), "click",() =>{
      reset_closeModal();
  });
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
  function resetModalTimers(purpose) {
    if(purpose === "signup"){
    modal_timer_email.textContent = OTP_RESEND_SECONDS;
    modal_timer_phone.textContent = OTP_RESEND_SECONDS;
    modal_resend_email.disabled = true;
    modal_resend_phone.disabled = true;
    }
    else if(purpose === "forgot_password"){
     $("#fp_modal_timer_email").textContent =OTP_RESEND_SECONDS;
     $("#reset_resend").disabled = true;
    }
    
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
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const json = await response.json().catch(() => ({})); 
        console.log(json);
        // Return the structured response
        return { data: json };
    }
    catch (err) {
        // Only network or fundamental request errors reach here
        return { ok: false, status: 0, data: { error: "Network error" } };
    }
}

  /* -------------- Send OTP (email or phone) -------------- */
  async function sendOtp(email) {
    //const payload = { purpose, target };
    const res = await apiPost(ENDPOINTS.sendOtp, {email: email});
    return res.data;
  }

  /* -------------- Verify OTP -------------- */
  async function verifyOtp(otp, mail) {
    let verifyOtp_payload = {
        otp: Number(otp),
        email: mail
    };
    // call backend
    let res = await apiPost(ENDPOINTS.verifyOtp, verifyOtp_payload);
    return res.data;
  };

  /* -------------- Modal UI actions (resend & verify) -------------- */
  safeAdd(modal_resend_email, "click", async () => {
    
    const userEmail = $("#signup_email").value.trim();
    modal_resend_email.disabled = true;
    const r = await sendOtp(userEmail);
    if (r.state) {
      showToast("OTP sent to email.");
      startCountdown(modal_timer_email, modal_resend_email);
    } else {
      showToast(r.message);
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

  safeAdd(modal_verify_email, "click", async() =>{
    const userEmail = $("#signup_email").value.trim();
    const code = $("#modal_email_otp").value;
    if (!/^\d{6}$/.test(code)) { setError(modal_email_input, "Enter 6-digit code"); return; }
    else{
    setError(modal_email_input, "")
    }; 
    let r = await verifyOtp(Number(code), userEmail);
    //console.log(r.message);
     if (r.state) {
      showToast("Email verified.");
      closeModal();
     window.location.replace("login_signup.html");

    } else {
      setError(modal_email_input, r.message);
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
  function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   return emailRegex.test(email);
    }
    
  safeAdd(form_login, "submit", async (ev) => {
    ev.preventDefault();
    clearAllErrors(form_login);
    const identifier = $("#login_identifier").value.trim();
    const password = $("#login_password").value;
    const rememberMe = !!$("#login_remember").checked;
    
    let valid = true;
    if (!identifier) { setError($("#login_identifier"), "Please enter email"); valid = false; }
    if (!validateEmail(identifier)) { setError($("#login_identifier"), "Please enter email"); valid = false; }
    if (!password) { setError($("#login_password"), "Please enter your password."); valid = false; }
    if (!valid) return;
   
    const res = await apiPost(ENDPOINTS.login, { email: identifier,password: password});
    if(res.data.access_token){
         showToast("Login successful. Redirecting...");
         localStorage.setItem("access_token",res.data.access_token);
    setTimeout(() => { window.location.replace("../dashboard/dashboard.html"); });
      }  
      else{
          showToast(res.data.detail);
          console.log(res);
      }
  });

  /* -------------- Signup Form Submit -------------- */
  safeAdd(form_signup, "submit", async (ev) => {
    ev.preventDefault();
    clearAllErrors(form_signup);
    const email = $("#signup_email").value.trim();
    const phoneRaw = $("#signup_phone").value.trim();
    const name = $("#signup_name").value.trim();
    const surname = $("#signup_surname").value.trim();
    const password = $("#signup_password").value;
    const confirm = $("#signup_confirm").value;
    const terms = !!$("#signup_terms").checked;

    let valid = true;
    if (!email) { setError($("#signup_email"), "Please enter your email."); valid = false; }
    if (!validateEmail(email)) { setError($("#login_identifier"), "Please enter a valid email"); valid = false; }
    if (!phoneRaw) { setError($("#signup_phone"), "Please enter your phone."); valid = false; }
    if (!name) { setError($("#signup_name"), "Please enter your name."); valid = false; }
    if (!surname) { setError($("#signup_surname"), "Please enter you surname."); valid = false; }
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
    let signup_payload = {
        email: email, 
        phone : String(phone),
        other_names :name,
        surname : surname, 
        password : password 
         };
   const res = await apiPost(ENDPOINTS.signup, signup_payload);
    showToast(res.data.message);
    console.log(res);
    openModal();
    startCountdown(modal_timer_email, modal_resend_email);
  });

  /* -------------- Forgot password flow (trigger modal for email) -------------- */
  safeAdd($("#forgot"), "click", (ev) => {
    ev.preventDefault();
    // Show modal purpose forgot_password (default to email)
    document.getElementById("FP").style.display = "block";
    document.getElementById("FP_email_field").style.display = "block";
    document.getElementById("OTP_field").style.display = "none";
    document.getElementById("Reset_password").style.display = "none";
  });
  // Send otp button
  safeAdd($("#modal_FP"), "click", async(ev) => {
    //ev.preventDefault();
    const email = $("#modal_email_FP").value.trim();
    let valid = true;
    if (!validateEmail(email)) { showToast("Invalid email"); valid = false; }
    if (!valid) return;
    const payload = {email: email};
    const send = await apiPost(ENDPOINTS.sendOtp_FP,payload);
    if (send.data.state){
    $("#reset_text").textContent = `Email: ${email}`;
    document.getElementById("FP_email_field").style.display = "none";
    document.getElementById("OTP_field").style.display = "block";
    document.getElementById("Reset_password").style.display = "none";
    $("#reset_password").value = "";
    resetModalTimers("forgot_password");
   startCountdown($("#fp_modal_timer_email"), $("#reset_resend"));}
   else{
       showToast("User not found");
   }
  });
  // confirm password button 
  safeAdd($("#change_pass"), "click", async(ev) => {
    ev.preventDefault();
    const email = $("#modal_email_FP").value.trim();
    const otp = $("#modal_otp_FP").value.trim();
    if (!/^\d{6}$/.test(otp)) { showToast("Enter 6-digit code"); return; };
    
     const payload = {
         email: email,
         otp : otp
     };
    const send = await apiPost(ENDPOINTS.verify_FP,payload);
    console.log(send);
    if(send.data.state){
    localStorage.setItem("reset_token",send.data.reset_token);
    document.getElementById("FP_email_field").style.display = "none";
    document.getElementById("OTP_field").style.display = "none";
    document.getElementById("Reset_password").style.display = "block";
    resetModalTimers("forgot_password");}
    else{
        showToast("Invalid OTP")
    }
  });
  // Resend OTP
  safeAdd($("#reset_resend"), "click", async(ev) => {
    ev.preventDefault();
    const email = $("#modal_email_FP").value.trim();
    const payload = {email: email};
    const send = await apiPost(ENDPOINTS.sendOtp_FP,payload);
    resetModalTimers("forgot_password");
    startCountdown($("#fp_modal_timer_email"), $("#reset_resend"));
  });
  // confirm password button (last)
  safeAdd($("#reset_btn"), "click", async(ev) => {
    ev.preventDefault();
    const reset_password = $("#reset_password").value.trim();
    const reset_confirm= $("#reset_confirm").value.trim();
    
    // password policy
    if (!validPassword(reset_password)) {
      showToast("Password must be >=8 chars, include letters and digits; allowed specials: # $ @");
      return;
    }
    if (reset_password !== reset_confirm) { showToast("Passwords do not match."); return; }
    const payload = {
        token: localStorage.getItem('reset_token'),
        new_password:reset_password,
        confirm_password: reset_confirm
    };
    const send = await apiPost(ENDPOINTS.confirm_FP,payload);
    showToast(send.data.message);
    reset_closeModal();
  });
  
  // Toggle effects to view password 
  function  resetToggle(id){
    target = document.getElementById(id);
    target.type = "text";
    //target.type = target.type !== "text" ? "text" : "password";
  };
  safeAdd($("#reset_show"), "click", function (){
    resetToggle("reset_password") ;
  });
  safeAdd($("#confirm_show"), "click", function (){
    resetToggle("confirm_password") ;
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
