'use strict';

const BANK_LIST = {
  // --- Commercial Banks (Keys use simple names) ---
  "AccessBank": {
    "name": "Access Bank",
    "cbnCode": "044",
    "category": "COMMERCIAL"
  },
  "ZenithBank": {
    "name": "Zenith Bank",
    "cbnCode": "057",
    "category": "COMMERCIAL"
  },
  "GTBank": {
    "name": "Guaranty Trust Bank",
    "cbnCode": "058",
    "category": "COMMERCIAL"
  },
  "FirstBank": {
    "name": "First Bank of Nigeria",
    "cbnCode": "011",
    "category": "COMMERCIAL"
  },
  "UBA": {
    "name": "United Bank For Africa",
    "cbnCode": "033",
    "category": "COMMERCIAL"
  },
  "WemaBank": {
    "name": "Wema Bank",
    "cbnCode": "035",
    "category": "COMMERCIAL"
  },
  "FidelityBank": {
    "name": "Fidelity Bank",
    "cbnCode": "070",
    "category": "COMMERCIAL"
  },
  "SterlingBank": {
    "name": "Sterling Bank",
    "cbnCode": "232",
    "category": "COMMERCIAL"
  },
  "Ecobank": {
    "name": "Ecobank Nigeria",
    "cbnCode": "050",
    "category": "COMMERCIAL"
  },
  "PolarisBank": {
    "name": "Polaris Bank",
    "cbnCode": "076",
    "category": "COMMERCIAL"
  },
  "ProvidusBank": {
    "name": "Providus Bank",
    "cbnCode": "101",
    "category": "COMMERCIAL"
  },
  "UnionBank": {
    "name": "Union Bank of Nigeria",
    "cbnCode": "032",
    "category": "COMMERCIAL"
  },
  "StanbicIBTC": {
    "name": "Stanbic IBTC Bank",
    "cbnCode": "221",
    "category": "COMMERCIAL"
  },
  "TitanBank": {
    "name": "Titan Trust Bank",
    "cbnCode": "102",
    "category": "COMMERCIAL"
  },
  "KeystoneBank": {
    "name": "Keystone Bank",
    "cbnCode": "082",
    "category": "COMMERCIAL"
  },
  "HeritageBank": {
    "name": "Heritage Bank",
    "cbnCode": "030",
    "category": "COMMERCIAL"
  },

  // --- Fintechs / Digital & Payments Banks ---
  "KudaBank": {
    "name": "Kuda Microfinance Bank",
    "cbnCode": "50211", // MFB Code supported for transfers
    "category": "FINTECH/MFB"
  },
  "Opay": {
    "name": "Paycom (OPay)",
    "cbnCode": "999992", // Paycom PSB Code
    "category": "FINTECH/PSB"
  },
  "PalmPay": {
    "name": "PalmPay",
    "cbnCode": "999991", // PSB Code
    "category": "FINTECH/PSB"
  },
  "Paga": {
    "name": "Paga",
    "cbnCode": "100002", // Paga's NIBSS Code for transfers
    "category": "FINTECH/PSP"
  },
  "Moniepoint": {
    "name": "Moniepoint MFB",
    "cbnCode": "50515",
    "category": "FINTECH/MFB"
  },
  "VFDMFB": {
    "name": "VFD Microfinance Bank",
    "cbnCode": "566",
    "category": "MFB"
  },

  // --- Non-Interest / Mortgage Banks ---
  "JaizBank": {
    "name": "Jaiz Bank",
    "cbnCode": "301",
    "category": "NON-INTEREST"
  },
  "TajBank": {
    "name": "TAJ Bank",
    "cbnCode": "302",
    "category": "NON-INTEREST"
  },
  "AbbeyMortgage": {
    "name": "Abbey Mortgage Bank",
    "cbnCode": "402",
    "category": "MORTGAGE"
  }
}

function deposit(){

    document.getElementById("deposit-modal").style.display = "block";
    document.getElementById("page_inner").style.opacity = "0.3";

}


function cancel(id) {
    document.getElementById("page_inner").style.opacity = "1";
    document.getElementById(id).style.display = "none";
    document.getElementById("deposit-input").value = ""; 
    document.getElementById("account-input").value = ""; 

}

async function fund(){
    let error =  document.getElementById("error-amount");
    let amount = document.getElementById("deposit-input").value.trim();
    let valid = true;
    if (Number(amount) < 100){
        error.textContent = "Amount must be more than ₦100.00";
        valid = false;
    }
    if (!valid) return;
    showLoader();
    error.textContent = "";
    const response = await postRequest(ENDPOINTS.fund, {amount: Number(amount.replace(/,/g, ""))});
    window.parent.location.href = response.authorization_url;
    //hideLoader()
};

document.getElementById('deposit-input').addEventListener('input', e => 
  e.target.value = e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
);
function withdraw(){
    document.getElementById('recipient_card').style.display = "block";
    document.getElementById("page_inner").style.opacity = "0.3";

}

function bankList(){
    const optionsList = document.getElementById("optionsList")
    const bankKeys = Object.keys(BANK_LIST)
    for(let i = 0; i < bankKeys.length ; i++){
        const listItems = document.createElement('li');
        listItems.textContent = BANK_LIST[bankKeys[i]].name;
        optionsList.appendChild(listItems);
    }
}
bankList()

 
function search() {
  const searchValue = document.getElementById('bank-list').value.trim().toLowerCase()
  const listItems = document.getElementsByTagName('li')
  for(let i = 0; i < listItems.length; i++){
    const listItem = listItems[i]
    const listText = listItem.textContent.toLowerCase()

    if(!listText.includes(searchValue) || searchValue === "" ){
        listItem.style.display = "none"
    }
    else{
       document.getElementById('optionsList').style.display ="block" ;  
       listItem.style.display = "block"
    }
  }
}
document.getElementById('bank-list').addEventListener("keyup", search)
  


async function accountName(account_number, bank_code) {
    const payload = {
        account_number,
        bank_code
    }
    const reponse = await postRequest(ENDPOINTS.account_name, payload)
}

function recipientNext(){
    const account_number = document.getElementById('account-input').value.trim();
    const account_helper = document.getElementById('account_helper')
    const bank_helper = document.getElementById('bank_helper')
    const bank  = document.getElementById('bank-list')
    
    let valid = true;
    if(!account_number){
         account_helper.textContent = "Input your account number";
        return false;
    }
    if(account_number.length < 9){
        account_helper.textContent = "Incomplete account number";
        return false;
    }
    if(!bank){
        bank_helper.textContent = "Select your bank";
        return false;
    }
    valid = false;

     accountName(account_number, bank_code)
}
