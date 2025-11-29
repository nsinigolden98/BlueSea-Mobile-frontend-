"use strict";

const login = document.getElementById("login");
const signUp = document.getElementById("sign-up");
const email_tab = document.getElementById("email_modal")
const phone_tab = document.getElementById("phone_modal")

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("tab_signup").style.borderBottomColor = "#f4f7f8";
    document.getElementById("modal_tab_phone").style.borderBottomColor = "#ffffff";
    document.getElementById("modal_tab_email").style.color = "#0ea5e9";
    document.getElementById("tab_login").style.color = "#0ea5e9";
    phone_tab.style.display = 'none';
}); 

function clearInput(){
    const inputs = document.getElementsByTagName("input");

// Iterate through the collection and set the value of each element
for (let i = 0; i < inputs.length; i++) {
  inputs[i].value = "";
}

}
// sign up tab button function 
function signUpSwitch(){
    signUp.style.display =  "block";
    login.style.display ="none";
    document.getElementById("tab_signup").style.borderBottomColor = "#0ea5e9";
    document.getElementById("tab_login").style.borderBottomColor = "#f4f7f8";

    document.getElementById("tab_login").style.color = "black";
    document.getElementById("tab_signup").style.color = "#0ea5e9";
    clearInput()
    
};

// login tab  button function 
function loginSwitch(){
    signUp.style.display =  "none";
    login.style.display ="block";
    document.getElementById("tab_signup").style.borderBottomColor = "#f4f7f8";
    document.getElementById("tab_login").style.borderBottomColor = "#0ea5e9";
    document.getElementById("tab_login").style.color = "#0ea5e9";
    document.getElementById("tab_signup").style.color = "black";
    clearInput
};

// email switch tab for verifying user account 
function emailSwitch(){
    phone_tab.style.display =  "none";
    email_tab.style.display ="block";
    document.getElementById("modal_tab_phone").style.borderBottomColor = "#ffffff";
    document.getElementById("modal_tab_email").style.borderBottomColor = "#0ea5e9";
    document.getElementById("modal_tab_email").style.color = "#0ea5e9";
    document.getElementById("modal_tab_phone").style.color = "black";
    resetModalTimers("signup");
};

// phone number switch tab for verifying user account 

function phoneSwitch(){
    email_tab.style.display =  "none";
    phone_tab.style.display ="block";
    document.getElementById("modal_tab_email").style.borderBottomColor = "#ffffff";
    document.getElementById("modal_tab_phone").style.borderBottomColor = "#0ea5e9";
    document.getElementById("modal_tab_phone").style.color = "#0ea5e9";
    document.getElementById("modal_tab_email").style.color = "black";
    resetModalTimers("signup");
};

function closeModal(){
    document.getElementById("FP").style.display= "none";
    document.getElementById("modal_panel").style.display= "none";
    document.getElementById("form_signup").style.opacity = "1";
    document.getElementById("form_login").style.opacity = "1";
    resetModalTimers("signup");
    resetModalTimers("forgot_password");
};

 // Domain base; update if your API is at another subdomain
 const API_BASE = "https://notepad-one-wheat.vercel.app"; // <--- change if needed
 //let API_BASE = "http://127.0.0.1:8000"; // <--- change if needed this is for testing locally

let ENDPOINT = {
    login: `${API_BASE}/accounts/login/`,
    signup: `${API_BASE}/accounts/sign-up/`,
    sendOtp: `${API_BASE}/accounts/resend-otp/`,
    sendOtp_FP: `${API_BASE}/accounts/password/reset/request/`,       
    verify_FP: `${API_BASE}/accounts/password/reset/verify-otp/`, 
    confirm_FP: `${API_BASE}/accounts/password/reset/confirm/`,
    verifyOtp: `${API_BASE}/accounts/verify-email/`, 
    forgotReset: `${API_BASE}/accounts/auth/forgot-reset/`,
    oauthGoogle: `${API_BASE}/accounts/auth/google/`
  };
  

 // OTP & timers
 const OTP_LENGTH = 6;
 const OTP_RESEND_SECONDS = 50;  
   // Password policy
 const PASSWORD_MIN_LENGTH = 8;
  // allowed special chars: # $ @
 const PASSWORD_ALLOWED_SPECIALS = /[#@$]/;
 
 
  /* -------------- Helpers -------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));
  const safeAdd = (el, ev, cb) => { if (el) el.addEventListener(ev, cb); };
const   modal_resend_email = $("#modal_resend_email");
const   modal_resend_phone = $("#modal_resend_phone");
const modal_timer_email  = $("#modal_timer_email");
const modal_timer_phone = $("#modal_timer_phone");
const modal_email_input = $("#modal_email_input");

function resetModalTimers(purpose = "signup") {
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
  
 // Important Functions
 
 function showToast(msg, ms = 8200) {
    const t = document.getElementById("toast");
    if (!t) { alert(msg); return; }
    t.textContent = msg;
    t.hidden = false;
    t.style.opacity = "1";
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


function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   return emailRegex.test(email);
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
  
  
 async function apiPost(url, body) {
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const json = await response.json().catch(() => ({})); 
        //console.log(json);
        // Return the structured response
        return { data: json };
    }
    catch (err) {
        // Only network or fundamental request errors reach here
        return { ok: false, status: 0, data: { error: "Network error" } };
    }
}

// Buttons Functions when they are clicked 

async function resendEmailSignUp(email = $("#signup_email").value.trim()){
    const userEmail = email;
    modal_resend_email.disabled = true;
    
    const res = await apiPost(ENDPOINT.sendOtp, {email: userEmail});
    const r = res.data;
    resetModalTimers("signup"); 
    if (r.state) {
      showToast("OTP sent to email.");
      startCountdown(modal_timer_email, modal_resend_email);
    } else {
      showToast(r.message);
      modal_resend_email.disabled = false;
    }
  };

async function verifyEmailSignUp(){
    const userEmail = $("#signup_email").value.trim();
    const code = $("#modal_email_otp").value;
    if (!/^\d{6}$/.test(code)) { setError(modal_email_input, "Enter 6-digit code"); return; }
    else{
    setError(modal_email_input, "")
    }; 
    
    let verifyOtp_payload = {
        otp: Number(code),
        email: userEmail
    };
    // call backend
    let res = await apiPost(ENDPOINT.verifyOtp, verifyOtp_payload);
    let r = res.data;
    
    //console.log(r.message);
     if (r.state) {
      showToast("Email verified.");
      closeModal();
     window.location.replace("login.html");
    }
    else {
      showToast(r.message);
    } 
 };

function setAccessToken(token, days) {
  const maxAge = days* 24 *60 * 60; // Convert minutes to seconds
  document.cookie = `accessToken=${encodeURIComponent(token)}; max-age=${maxAge}; path=/; SameSite=Lax; secure`;
}

function setRefreshToken(token, days) {
  const maxAge = days * 24 * 60 * 60; // Convert days to seconds
  document.cookie = `refreshToken=${encodeURIComponent(token)}; max-age=${maxAge}; path=/; SameSite=Lax; secure`;
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
    document.getElementById("loader").style.display = "block";
   
    const res = await apiPost(ENDPOINT.login, { email: identifier,password: password});
       if(res.data.user.email_verified){
         showToast("Login successful. Redirecting...");
         setRefreshToken(res.data.refresh_token, 30);
         setAccessToken(res.data.access_token, 30);
          document.getElementById("loader").style.display = "none";
            window.parent.location.replace("../dashboard/dashboard.html"); 
      }  
      else if (!res.data.user.email_verified){
        await apiPost(ENDPOINT.sendOtp, {email: identifier});
       showToast("Email Already Registered ");
       localStorage.setItem("email",  identifier);
         document.getElementById("loader").style.display = "none";
       window.parent.location.replace("../verify_email.html"); 
      }
      else{
          showToast(res.data.detail);
          document.getElementById("loader").style.display = "none";
      }
  });

  /* -------------- Signup Form Submit -------------- */
async  function SignUpButton() {
    event.preventDefault()
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
    if (!validateEmail(email)) { setError($("#signup_email"), "Please enter a valid email"); valid = false; }
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
    
    document.getElementById("loader").style.display = "block";
    
    // POST to signup
    let signup_payload = {
        email: email, 
        phone : String(phone),
        other_names :name,
        surname : surname, 
        password : password 
         };
    const res = await apiPost(ENDPOINT.signup, signup_payload);
    if(res.data.state){
    document.getElementById("modal_panel").style.display = "block";
    document.getElementById("form_signup").style.opacity = "0.3";
    showToast(res.data.message);
    document.getElementById("loader").style.display = "none";
    startCountdown(modal_timer_email, modal_resend_email);}
    else{
         showToast(res.data.message);
        document.getElementById("loader").style.display = "none";
    }
    
  };

  /* -------------- Forgot password flow (trigger modal for email) -------------- */
 function forgotPassword(){
    event.preventDefault();
    // Show modal purpose forgot_password (default to email)
    document.getElementById("FP").style.display = "block";
    document.getElementById("FP_email_field").style.display = "block";
    document.getElementById("OTP_field").style.display = "none";
    document.getElementById("Reset_password").style.display = "none";
    document.getElementById("form_login").style.opacity = "0.3";
  };
  // Send otp button
  safeAdd($("#modal_FP"), "click", async(ev) => {
    //ev.preventDefault();
    const email = $("#modal_email_FP").value.trim();
    let valid = true;
    if (!validateEmail(email)) { showToast("Invalid email"); valid = false; }
    if (!valid) return;
    const payload = {email: email};
    const send = await apiPost(ENDPOINT.sendOtp_FP,payload);
    if (send.data.state){
    $("#reset_text").textContent = `Email: ${email}`;
    showToast(`OTP sent to ${email}. Check your email`)
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
    const send = await apiPost(ENDPOINT.verify_FP,payload);
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
    const send = await apiPost(ENDPOINT.sendOtp_FP,payload);
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
    const send = await apiPost(ENDPOINT.confirm_FP,payload);
    showToast(send.data.message);
    closeModal();
  });
  
  // Toggle effects to view password 
  function  resetToggle(id){
    const target = document.getElementById(id);
     target.type = target.type === "password" ? "text" : "password";
  };
  safeAdd($("#reset_show"), "click", function (){
    resetToggle("reset_password") ;
  });
  safeAdd($("#confirm_show"), "click", function (){
    resetToggle("reset_confirm") ;
  });



async function handleCredentialResponse(response) {
    const idToken = response.credential;
    const redirect_uri = "https://www.blueseamobile.com.ng/Bluesea/dashboard/dashboard.html";
    
    let res  = await apiPost(ENDPOINT.oauthGoogle, { id_token: idToken,redirect_uri });
        if(res.data.success){
        showToast("Login successful. Redirecting...");
        setRefreshToken(res.data.refresh_token, 30);
        setAccessToken(res.data.access_token, 30);   
        window.location.href = redirect_uri;
        }
        else{
        window.parent.location.href  = "https://www.blueseamobile.com.ng";
            
        }
;
}
 
 window.addEventListener("popstate", (event)=>{
     history.go(0);
 })