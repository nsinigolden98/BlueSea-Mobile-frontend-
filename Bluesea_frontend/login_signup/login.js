document.getElementById('post-data-btn').addEventListener('click', postData);

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));
const email = $("#signup_email").value.trim();
const phoneRaw = $("#signup_phone").value.trim();
const name = $("#signup_name").value.trim();
const surname = $("#signup_surname").value.trim();
const password = $("#signup_password").value;
const confirm = $("#signup_confirm").value;
const terms = !!$("#signup_terms").checked;
const form_signup = $("#bs_form_signup");

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


function validCheck(){
    let valid = true;
    if (!email) { setError($("#signup_email"), "Please enter your email."); valid = false; }
    if (!phoneRaw) { setError($("#signup_phone"), "Please enter your phone."); valid = false; }
    if (!name) { setError($("#signup_name"), "Please enter your name."); valid = false; }
    if (!surname) { setError($("#signup_surname"), "Please enter you surname."); valid = false; }
    if (!password) { setError($("#signup_password"), "Please enter a password."); valid = false; }
    if (!confirm) { setError($("#signup_confirm"), "Confirm your password."); valid = false; }
    if (!terms) { setError($("#signup_terms"), "You must accept Terms & Policy."); valid = false; }
    if (!valid) return;
}

    // validate phone
const phone = normalizeNigeriaPhone(phoneRaw);
if (!phone) { setError($("#signup_phone"), "Use Nigerian format: 0XXXXXXXXXX or +234XXXXXXXXXX starting with 7|8|9."); return; }

    // password policy
if (!validPassword(password)) {
      setError($("#signup_password"), "Password must be >=8 chars, include letters and digits; allowed specials: # $ @");
      return;
    }
if (password !== confirm) { setError($("#signup_confirm"), "Passwords do not match."); return; }
    
async function postData() {
    // 1. Get data from input fields
    const messageElement = document.getElementById('response-message');
    
    // Clear previous message
    messageElement.textContent = 'Sending...';

    // 2. Define the data payload
    const dataToSend = {
        user_name: name,
        user_email: email,
        timestamp: new Date().toISOString()
    };

    const endpointUrl = '/api/submit-data'; // Replace with your actual server URL

    try {
        // 3. Perform the asynchronous POST request
        const response = await fetch(endpointUrl, {
            method: 'POST', // The HTTP method
            headers: {
                // Tell the server we are sending JSON data
                'Content-Type': 'application/json' 
            },
            // Convert the JavaScript object to a JSON string for the body
            body: JSON.stringify(dataToSend) 
        });

        // 4. Handle the response
        if (response.ok) { // Status is 200-299
            const responseData = await response.json();
            messageElement.textContent = `Success! ID: ${responseData.id || 'N/A'}. Server Response: ${JSON.stringify(responseData)}`;
            // Clear inputs on success
            document.getElementById('name-input').value = '';
            document.getElementById('email-input').value = '';
        } else {
            // Handle errors (e.g., 404, 500, etc.)
            const errorText = await response.text();
            messageElement.textContent = `Error: ${response.status} - ${errorText.substring(0, 100)}...`;
        }

    } catch (error) {
        // Handle network errors (e.g., server offline, no internet)
        console.error('Network or CORS error:', error);
        messageElement.textContent = 'A network error occurred. Check the console for details.';
    }
}
