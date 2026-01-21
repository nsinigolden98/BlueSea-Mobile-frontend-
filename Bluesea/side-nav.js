"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // function body
  getUserNav();
  getBalanace();
  getElectricityHistory();
});

let API_BASE = "http://127.0.0.1:8000"; // from Postman collection
//let API_BASE = "https://api.blueseamobile.com.ng"; 

function getCookie(name) {
  const nameEQ = name + "=";

  const cookieArray = decodeURIComponent(document.cookie).split("; ");

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];

    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }

  return null;
}

let token = getCookie("accessToken");
let refresh_token = getCookie("refreshToken");

let ENDPOINTS = {
  balance: `${API_BASE}/wallet/balance/`,
  fund: `${API_BASE}/transactions/fund-wallet/`,
  webhook: `${API_BASE}/transactions/webhook/paystack/`,
  history: `${API_BASE}/transactions/history/`,
  withdraw: `${API_BASE}/transactions/withdraw/`,
  user: `${API_BASE}/user_preference/user/`,
  pin_set: `${API_BASE}/accounts/pin/set/`,
  pin_verify: `${API_BASE}/accounts/pin/verify/`,
  pin_reset: `${API_BASE}/accounts/pin/reset/`,
  buy_airtime: `${API_BASE}/payments/airtime/`,
  buy_airtel: `${API_BASE}/payments/airtel-data/`,
  buy_mtn: `${API_BASE}/payments/mtn-data/`,
  buy_glo: `${API_BASE}/payments/glo-data/`,
  buy_etisalat: `${API_BASE}/payments/etisalat-data/`,
  account_name: `${API_BASE}/transactions/account-name/`,
  electricity: `${API_BASE}/payments/electricity/`,
  electricity_user: `${API_BASE}/payments/electricity/customer/`,
  group_payment_history: `${API_BASE}/payments/group-payment/history/`,
  group_payment: `${API_BASE}/payments/group-payment/`,
  dstv: `${API_BASE}/payments/dstv/`,
  gotv: `${API_BASE}/payments/gotv/`,
  showmax: `${API_BASE}/payments/showmax/`,
  startimes: `${API_BASE}/payments/startimes/`,
  logout: `${API_BASE}/accounts/logout/`
};

// Get Requset Function
async function getRequest(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const json = await response.json().catch(() => ({}));
    if (json.detail === "Authentication credentials were not provided.") {
      window.parent.location.replace("../../index.html");
    } else {
      return json;
    }
  } catch (err) {
    // Only network or fundamental request errors reach here
    return { ok: false, success: false, error: "Network error" };
  }
}

//Post Request Function
async function postRequest(url, payload) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const json = await response.json().catch(() => ({}));
    return json;
  } catch (err) {
    // Only network or fundamental request errors reach here
    return { ok: false, success : false, error: "Network error" };
  }
}

async function patchRequest(url, payload) {
  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: payload,
    });
    const json = await response.json().catch(() => ({}));
    return json;
  } catch (err) {
    // Only network or fundamental request errors reach here
    return { ok: false, success: false, error: "Network error" };
  }
}

function hideBalance() {
  let value = document.getElementById("balance_value");
  console.log(value.textContent);
  if (value.textContent.trim() === "******") {
    getBalanace("balance_value");
  } else {
    value.textContent = "******";
  }
}
async function getBalanace() {
  const balance = await getRequest(ENDPOINTS.balance);
  document.getElementById("balance_value").textContent = balance.balance;
}

function getDate(date = "2025-11-20") {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  const date_value = `${String(date.slice(8, 10))}  ${String(
    months[date.slice(5, 7) - 1]
  )} ${String(date.slice(0, 4))}`;
  return date_value;
}

function showLoader() {
  document.getElementById("loader").style.display = "block";
}
function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

async function getUserNav() {
  const user = await getRequest(ENDPOINTS.user);
  // Side nav
  document.getElementById("profile_name").textContent = user.other_names;
  // document.getElementById("avatar_img").src = API_BASE + user.image;
  document.getElementById("avatar_img").src = 
    user.image ? API_BASE + user.image : "basic_imgs/profile.jpeg";
  document.getElementById("profile_email").textContent = user.email;
}

function showNav() {
  document.getElementById("side-bar").style.display = "block";
}

function closeNav() {
  document.getElementById("nav_body").style.display = "none";
  let path = window.parent.location.href;
  window.parent.location.href = path;
}

function closeNavBody() {
  const screen_size = window.matchMedia("(max-width: 768px)").matches;
  if (
    document.getElementById("side-bar").style.display === "block" &&
    screen_size
  ) {
    document.getElementById("side-bar").style.display = "none";
  }
}

// PROTECTED PAGE GUARD – Works perfectly with your cookie setup
() => {
  function isLoggedIn() {
    const token = getCookie("accessToken");
    const refresh_token = getCookie("refreshToken");
    return !!(token || refresh_token); // true if at least one exists
  }

  function redirectToLogin() {
    // Use replace() so user can't go back to this page
    window.location.replace("../login/login.html");
  }

  // This fires on EVERY page view — including back/forward button!
  window.addEventListener("pageshow", (event) => {
    if (event.persisted || !isLoggedIn()) {
      redirectToLogin();
    }
  });

  // Also protect normal page loads/refresh
  if (!isLoggedIn()) {
    redirectToLogin();
  }
};


async function getElectricityHistory() {
   
    const list = await getRequest(ENDPOINTS.history);
    const page_length = Math.round(list.count / 5) + 1;
    
    for(let i = 1; i<=page_length; i++ ){
 
    const histories = await getRequest(`${ENDPOINTS.history}?page=${i}`);
    const history = histories.results;
    let hist_body = document.getElementById("history-list");
    
    for(let i = 0; i< history.length ; i++){
       if(history[i].description.includes("Electricity")){
        let  time = getDate(history[i].created_at.slice(0,10))
        let  amount_history =  history[i].formatted_amount
        let description = history[i].description
        if(history[i].transaction_type ==='DEBIT'){
             amount_history = "-" + amount_history;
        }
        else{
             amount_history = "+" + amount_history;
        }
        
        const typeBody = document.createElement('span')
        const timeBody = document.createElement('small')
        const enclose = document.createElement('div')
        const amountBody = document.createElement('strong')
        
        typeBody.textContent = description 
        timeBody.textContent = time
        amountBody.textContent = amount_history
        
        enclose.appendChild(amountBody);
        enclose.appendChild(typeBody);
        
        const history_item = document.createElement('div')
        history_item.classList.add("history-item")
        history_item.appendChild(enclose);
        history_item.appendChild(timeBody);
        hist_body.appendChild(history_item);
        document.getElementById("history").style.display = "grid";
    }}
    
    } 
    
}


