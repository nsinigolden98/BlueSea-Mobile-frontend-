"use strict";

const BANK_LIST = {
  // --- Commercial Banks (Keys use simple names) ---
  AccessBank: {
    name: "Access Bank",
    cbnCode: "044",
    category: "COMMERCIAL",
  },
  ZenithBank: {
    name: "Zenith Bank",
    cbnCode: "057",
    category: "COMMERCIAL",
  },
  GTBank: {
    name: "Guaranty Trust Bank",
    cbnCode: "058",
    category: "COMMERCIAL",
  },
  FirstBank: {
    name: "First Bank of Nigeria",
    cbnCode: "011",
    category: "COMMERCIAL",
  },
  UBA: {
    name: "United Bank For Africa",
    cbnCode: "033",
    category: "COMMERCIAL",
  },
  WemaBank: {
    name: "Wema Bank",
    cbnCode: "035",
    category: "COMMERCIAL",
  },
  FidelityBank: {
    name: "Fidelity Bank",
    cbnCode: "070",
    category: "COMMERCIAL",
  },
  SterlingBank: {
    name: "Sterling Bank",
    cbnCode: "232",
    category: "COMMERCIAL",
  },
  Ecobank: {
    name: "Ecobank Nigeria",
    cbnCode: "050",
    category: "COMMERCIAL",
  },
  PolarisBank: {
    name: "Polaris Bank",
    cbnCode: "076",
    category: "COMMERCIAL",
  },
  ProvidusBank: {
    name: "Providus Bank",
    cbnCode: "101",
    category: "COMMERCIAL",
  },
  UnionBank: {
    name: "Union Bank of Nigeria",
    cbnCode: "032",
    category: "COMMERCIAL",
  },
  StanbicIBTC: {
    name: "Stanbic IBTC Bank",
    cbnCode: "221",
    category: "COMMERCIAL",
  },
  TitanBank: {
    name: "Titan Trust Bank",
    cbnCode: "102",
    category: "COMMERCIAL",
  },
  KeystoneBank: {
    name: "Keystone Bank",
    cbnCode: "082",
    category: "COMMERCIAL",
  },
  HeritageBank: {
    name: "Heritage Bank",
    cbnCode: "030",
    category: "COMMERCIAL",
  },

  // --- Fintechs / Digital & Payments Banks ---
  KudaBank: {
    name: "Kuda Microfinance Bank",
    cbnCode: "50211", // MFB Code supported for transfers
    category: "FINTECH/MFB",
  },
  Opay: {
    name: "Paycom (OPay)",
    cbnCode: "999992", // Paycom PSB Code
    category: "FINTECH/PSB",
  },
  PalmPay: {
    name: "PalmPay",
    cbnCode: "999991", // PSB Code
    category: "FINTECH/PSB",
  },
  Paga: {
    name: "Paga",
    cbnCode: "100002", // Paga's NIBSS Code for transfers
    category: "FINTECH/PSP",
  },
  Moniepoint: {
    name: "Moniepoint MFB",
    cbnCode: "50515",
    category: "FINTECH/MFB",
  },
  VFDMFB: {
    name: "VFD Microfinance Bank",
    cbnCode: "566",
    category: "MFB",
  },

  // --- Non-Interest / Mortgage Banks ---
  JaizBank: {
    name: "Jaiz Bank",
    cbnCode: "301",
    category: "NON-INTEREST",
  },
  TajBank: {
    name: "TAJ Bank",
    cbnCode: "302",
    category: "NON-INTEREST",
  },
  AbbeyMortgage: {
    name: "Abbey Mortgage Bank",
    cbnCode: "402",
    category: "MORTGAGE",
  },
};

function deposit() {
  document.getElementById("deposit-modal").style.display = "block";
  document.getElementById("page_inner").style.opacity = "0.3";
}

function cancel(id) {
  document.getElementById("page_inner").style.opacity = "1";
  document.getElementById(id).style.display = "none";
  document.getElementById("deposit-input").value = "";
  document.getElementById("account-input").value = "";
  document.getElementById("account_helper").textContent = "";
  document.getElementById("amount_helper").textContent = "";
}

async function fund() {
  
  let error = document.getElementById("error-amount");
  let amount = document.getElementById("deposit-input").value.trim();
  
  if (Number(amount) < 100) {
    error.textContent = "Amount must be more than ₦100.00";
    return;
  }
  
  showLoader();
  error.textContent = "";
  const response = await postRequest(ENDPOINTS.fund, {
    amount: Number(amount.replace(/,/g, "")),
  });
  if (response.success) {
    hideLoader();
   window.parent.location.href = response.authorization_url;
  } else {
    hideLoader();
    cancel("deposit-modal");
    showToast("Wallet funding error. Please try again.");
  }
}

document
  .getElementById("deposit-input")
  .addEventListener(
    "input",
    (e) =>
      (e.target.value = e.target.value
        .replace(/\D/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ","))
  );

document
  .getElementById("withdraw-input")
  .addEventListener(
    "input",
    (e) =>
      (e.target.value = e.target.value
        .replace(/\D/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ","))
  );

function withdraw() {
  document.getElementById("recipient_card").style.display = "block";
  //document.getElementById("confirm_modal").style.display = "block";
  document.getElementById("page_inner").style.opacity = "0.3";
}

function bankList() {
  const optionsList = document.getElementById("optionsList");
  const bankKeys = Object.keys(BANK_LIST);
  for (let i = 0; i < bankKeys.length; i++) {
    const listItems = document.createElement("li");
    listItems.textContent = BANK_LIST[bankKeys[i]].name;
    optionsList.appendChild(listItems);
  }
}
bankList();

function search() {
  const searchValue = document
    .getElementById("bank-list")
    .value.trim()
    .toLowerCase();
  const listItems = document.getElementsByTagName("li");
  for (let i = 0; i < listItems.length; i++) {
    const listItem = listItems[i];
    const listText = listItem.textContent.toLowerCase();

    if (!listText.includes(searchValue) || searchValue === "") {
      listItem.style.display = "none";
    } else {
      document.getElementById("optionsList").style.display = "block";
      listItem.style.display = "block";
    }
  }
}
document.getElementById("bank-list").addEventListener("keyup", search);

let bankCode = "";
function selectBank() {
  const listItems = document.getElementsByTagName("li");
  const bank_output = document.getElementById("bank-output");

  const account_number = document.getElementById("account-input");

  const bankKeys = Object.keys(BANK_LIST);
  const account_helper = document.getElementById("account_helper");

  for (let i = 1; i < listItems.length; i++) {
    listItems[i].addEventListener("click", () => {
      account_helper.textContent = "";
      let bank_code = BANK_LIST[bankKeys[i]].cbnCode;
      document.getElementById("bank-list").value = "";

      bankCode = bank_code;
      let bank_name = listItems[i].textContent;
      bank_output.textContent = "Recipient Bank: " + bank_name;
      document.getElementById("optionsList").style.display = "none";
      if (account_number.value.length > 9) {
       accountName(account_number.value,bank_code)
      } else {
        bank_output.textContent = "";
        account_helper.textContent = "Input your account number";
      }
    });
  }
}
selectBank();

async function accountName(account_number, bank_code) {
  showLoader();
  const name_output = document.getElementById("name-output");
  const payload = {
    account_number,
    bank_code,
  };
  const response = await postRequest(ENDPOINTS.account_name, payload);

  if (response.account_name !== undefined){
    hideLoader();
    name_output.textContent = "Recipient Name: " + response.account_name;
  }
  else{
      hideLoader();
      name_output.textContent = "User Not Found"
      name_output.style.color = "red"
      showToast("Network Error. Try Again Later")

  }
}

async function recipientNext() {
  const account_number = document.getElementById("account-input").value.trim();
  const account_helper = document.getElementById("account_helper");
  const amount_helper = document.getElementById("amount_helper");
  const bank_helper = document.getElementById("bank_helper");
  const bank = document.getElementById("bank-output");
  const amount = document.getElementById("withdraw-input");
  const accountOwn = document.getElementById("name-output");
  account_helper.textContent = "";
  amount_helper.textContent = "";
  bank_helper.textContent = "";
  if (!account_number) {
    account_helper.textContent = "Input your account number";
  } else if (account_number.length < 9) {
    account_helper.textContent = "Incomplete account number";
  } else if (!bank.textContent) {
    bank_helper.textContent = "Select your bank";
  } else if (!amount.value) {
    amount_helper.textContent = "Enter an amount";
  } else if (accountOwn.textContent.includes("undefined")) {
      accountOwn.textContent = "User Not Found"
      accountOwn.style.color = "red"
      showToast("Network Error. Try Again Later")
  }else {
    showLoader()
    const user = await getRequest(ENDPOINTS.user);
    if (!user.pin_is_set) {
      window.parent.location.href = "../settings/pin/pin.html";
      return;
    } else {
      hideLoader();
      document.getElementById("confirm_modal").style.display = "block";
      document.getElementById("recipient_card").style.display = "none";

       document.getElementById('confirm_name').textContent = accountOwn.textContent.slice(16);
      document.getElementById('confirm_account').textContent = account_number;
      document.getElementById('confirm_bank').textContent = bank.textContent.slice(16);
      document.getElementById('confirm_amount').textContent = '₦'+amount.value;

    }
  }
}

function showToast(msg, ms = 8200) {
  const t = document.getElementById("toast");
  if (!t) { alert(msg); return; }
  t.textContent = msg;
  t.hidden = false;
  t.style.opacity = "1";
  clearTimeout(t._hideTO);
  t._hideTO = setTimeout(() => { t.hidden = true; }, ms);
}

async function makeWithdrawal() {
   
   const pin =document.getElementById("pin").value.trim()
   let account_name = document.getElementById('confirm_name').textContent ;
    let payload ={
           account_name,
           account_number: document.getElementById('confirm_account').textContent ,
           amount: document.getElementById('confirm_amount').textContent.slice(1).replace(/,/g, ""),
           bank_code: bankCode, 
           bank_name: document.getElementById('confirm_bank').textContent,
           transaction_pin: pin
       }

  showLoader(); 

  let  response = await postRequest(ENDPOINTS.withdraw, payload);
   if (response.status === "success"){
           hideLoader();
           cancel('confirm_modal')
           showToast(`Transfer  to ${account_name} Successful`)
   }
   else{
        hideLoader();
        showToast("Invalid Network")
   } 

}

