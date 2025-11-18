'use strict';
  
  
document.addEventListener('DOMContentLoaded', function() {
   getBalanace();
   getTansactionHistory();
   getUser();
});

let API_BASE = 'http://127.0.0.1:8000'; // from Postman collection
let token = localStorage.getItem('access_token') ;
let ENDPOINTS = {
    balance: `${API_BASE}/wallet/balance/`,
    fund: `${API_BASE}/transactions/fund-wallet/`,
    webhook: `${API_BASE}/transactions/webhook/paystack/`,
    history: `${API_BASE}/transactions/history/`,
    user: `${API_BASE}/user_preference/user/`,
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
        return json;
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
  
function showNav(){
    document.getElementById("side-bar").style.display = 'block';
    
   // document.getElementsByTagName("main").style.opacity = '1';
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

async function getTansactionHistory() {
    const history = await getRequest(ENDPOINTS.history);
    console.log(history);
}

async function getUser() {
    const user = await getRequest(ENDPOINTS.user);
    //console.log(user);
    document.getElementById("profile_name").textContent = user.other_names;
    document.getElementById("profile_email").textContent = user.email;
}

function closeNav() {
    document.getElementById("nav_html").style.display = "none";
    // location.close()
}