'use strict';
  
  
document.addEventListener('DOMContentLoaded', function() {
   getTansactionHistory();
   getBalanace();
   getUserNav();
});

let API_BASE = 'http://127.0.0.1:8000'; // from Postman collection
let token = localStorage.getItem('access_token') ;
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

function getDate(date ="2025-11-20" ){
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov",  "Dec"];
    
    const date_value = String(date.slice(8,10))+ " " + String(months[date.slice(5,7) -1]) + " " + String(date.slice(0,4));
    return date_value;
};

async function getTansactionHistory() {
    const history = await getRequest(ENDPOINTS.history)
    console.log(history)
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
    }
    
    
}
async function getUserNav() {
    const user = await getRequest(ENDPOINTS.user);
    // Side nav
    document.getElementById("profile_name").textContent = user.other_names;
    document.getElementById("profile_email").textContent = user.email;
    

}

function closeNav() {
    document.getElementById("nav_html").style.display = "none";
    // location.close()
}

