'use strict';
document.addEventListener('DOMContentLoaded', function() {
   getBalanace();
   getUserNav();
  getTansactionHistory();

}); 

let API_BASE = 'http://127.0.0.1:8000'; // from Postman collection

function getCookie(name) {
  // 1. Prepend '=' to the name to ensure accurate matching (e.g., 'user_id=')
  const nameEQ = name + "=";
  
  // 2. Decode the cookie string, then split it by '; ' to get an array of "key=value" pairs
  // decodeURIComponent handles values that were URL-encoded when set
  const cookieArray = decodeURIComponent(document.cookie).split('; ');
  
  // 3. Loop through the array
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    
    // Check if the current cookie string starts with the desired name
    if (cookie.indexOf(nameEQ) === 0) {
      // 4. If it matches, return the value part (the substring starting after 'name=')
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  
  // 5. Return null if no cookie with that name is found
  return null;
}

let token = getCookie("accessToken");
let refresh_token = getCookie("refreshToken");

 let ENDPOINTS = {
    balance: `${API_BASE}/wallet/balance/`,
    fund: `${API_BASE}/transactions/fund-wallet/`,
    webhook: `${API_BASE}/transactions/webhook/paystack/`,
    history: `${API_BASE}/transactions/history/`,
    user: `${API_BASE}/user_preference/user/`,
    pin_set: `${API_BASE}/accounts/pin/set/`,
    pin_verify: `${API_BASE}/accounts/pin/verify/`,
    pin_reset: `${API_BASE}/accounts/pin/reset/`,
    buy_airtime: `${API_BASE}/payments/airtime/`,
    buy_airtel: `${API_BASE}/payments/airtel-data/`,
    buy_mtn: `${API_BASE}/payments/mtn-data/`,
    buy_glo: `${API_BASE}/payments/glo-data/`,
    buy_etisalat: `${API_BASE}/payments/etisalat-data/`,
    logout: `${API_BASE}/accounts/logout/`,
  };
   
  
 // Get Requset Function 
async function getRequest(url){
      try {
        const response = await fetch(url, {
            headers: { "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            },
        });
        const json = await response.json().catch(() => ({})); 
        if(json.detail === "Authentication credentials were not provided."){
            window.parent.location.replace("../../index.html");
        }
        else{
        return json;
        }
    }
    catch (err) {
        // Only network or fundamental request errors reach here
        return { ok: false, status: 0, data: { error: "Network error" } };
    }
  }  

 //Post Request Function 
async function postRequest(url,payload){
      try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(payload)
        });
        const json = await response.json().catch(() => ({})); 
        return json ;
    }
    catch (err) {
        // Only network or fundamental request errors reach here
        return { ok: false, status: 0, data: { error: "Network error" } };
    }
  };
  


function hideBalance(){
    let value = document.getElementById("balance_value");
    console.log(value.textContent);
    if (value.textContent.trim() === "******"){
        getBalanace("balance_value");
    }
    else{
        value.textContent = "******";
    };
}
async function getBalanace(){
    const balance = await getRequest(ENDPOINTS.balance);
   document.getElementById("balance_value").textContent = balance.balance;
};

function getDate(date ="2025-11-20" ){
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov",  "Dec"];
    
    const date_value = `${String(date.slice(8,10))}  ${String(months[date.slice(5,7) -1])} ${String(date.slice(0,4))}`;
    return date_value;
};

async function getTansactionHistory() {
    showLoader()
    const histories = await getRequest(`${ENDPOINTS.history}?page=1`);
    const history =  histories.results
    
    let tbody = document.getElementById("transactions_body");
    tbody.innerHTML = '';
    
    for(let i = 0; i<= 5; i++){
        let  description = history[i].description
        let  time = getDate(history[i].created_at.slice(0,10))
        let  amount =  history[i].formatted_amount
        if(history[i].transaction_type ==='DEBIT'){
             amount = "-" + amount;
        }
        else{
             amount = "+" + amount;
        }
        
        const cellOne = document.createElement('td')
        const cellTwo = document.createElement('td')
        const cellThree = document.createElement('td')
        
        cellOne.textContent = description 
        cellTwo.textContent = time
        cellThree.textContent = amount
        
        const row = document.createElement('tr')
        row.appendChild(cellOne);
        row.appendChild(cellTwo);
        row.appendChild(cellThree);
        tbody.appendChild(row);
        hideLoader()
    }
    
}
async function getUserNav() {
    const user = await getRequest(ENDPOINTS.user);
    // Side nav
    document.getElementById("profile_name").textContent = user.other_names;
    document.getElementById("profile_email").textContent = user.email;
    

}

 

function showNav() {
     document.getElementById("side-bar").style.display = 'block';
}


function closeNav() {

    document.getElementById("nav_body").style.display = "none";
    let path = window.parent.location.href;
    window.parent.location.href = path;

}

function closeNavBody() {
   
    const screen_size = window.matchMedia('(max-width: 768px)').matches;
    if(document.getElementById("side-bar").style.display === 'block' && screen_size  ){
        document.getElementById("side-bar").style.display = 'none';
    }
}

function showLoader() {
                document.getElementById('loader').classList.remove('loader-hidden');
                document.getElementById('loader').classList.add('loader-visible');
            
                }

            // Function to HIDE the loader
function hideLoader() {
            document.getElementById('loader').classList.remove('loader-visible');
            document.getElementById('loader').classList.add('loader-hidden');
                }
                

// PROTECTED PAGE GUARD – Works perfectly with your cookie setup
(() => {
    function isLoggedIn() {
        const token = getCookie("accessToken");
        const refresh_token = getCookie("refreshToken");
        return !!(token || refresh_token);  // true if at least one exists
    }

    function redirectToLogin() {
        // Use replace() so user can't go back to this page
        window.location.replace("../../index.html");
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
})();
