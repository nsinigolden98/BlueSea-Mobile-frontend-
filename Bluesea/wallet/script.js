'use strict';

function deposit() {
    document.getElementById("deposit-modal").style.display = "block";
    document.getElementById("page_inner").style.opacity = "0.3";
}


function cancel() {
    document.getElementById("page_inner").style.opacity = "1";
    document.getElementById("deposit-modal").style.display = "none";
    document.getElementById("deposit-input").value = "";   
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
async function withdraw() {

}


const BANK_LIST = [
    { code: 'ACCESS', name: 'Access Bank' },
    { code: 'GTB', name: 'Guaranty Trust Bank' },
    { code: 'ZENITH', name: 'Zenith Bank' },
    { code: 'UBA', name: 'UBA' },
    { code: 'FIRST', name: 'First Bank' },
    { code: 'FCMB', name: 'FCMB' },
    { code: 'STERLING', name: 'Sterling Bank' },
    { code: 'UNION', name: 'Union Bank' },
    { code: 'ECO', name: 'Ecobank' },
    { code: 'STANBIC', name: 'Stanbic IBTC' },
    { code: 'WEMA', name: 'Wema Bank' },
    { code: 'PROVIDUS', name: 'Providus Bank' },
    { code: 'POLARIS', name: 'Polaris Bank' },
    { code: 'OPAY', name: 'OPay' },
    { code: 'PAGA', name: 'Paga' },
    { code: 'MONIEPOINT', name: 'Moniepoint' },
    { code: 'CITIBANK', name: 'Citi Bank' },
    { code: 'KEYSTONE', name: 'Keystone Bank' },
    { code: 'FIDELITY', name: 'Fidelity Bank' },
    { code: 'UNITY', name: 'Unity Bank' },
    { code: 'HERITAGE', name: 'Heritage Bank' },
    { code: 'STANDARD', name: 'Standard Chartered' },
    { code: 'ACCESSCORP', name: 'AccessCorp' },
    { code: 'KALD', name: 'Kuda Bank' },
    { code: 'OPPO', name: 'Opay Micro' },
    { code: 'STERLNG', name: 'Sterling (Alt)' },
    { code: 'CHAP', name: 'Chapman Bank' },
    { code: 'LOANS', name: 'Loans Bank' },
    { code: 'SIMPLE', name: 'Simple Bank' },
    { code: 'ALAT', name: 'ALAT by WEMA' },
    { code: 'GTCO', name: 'GTCO (alias)' },
    { code: 'HERIT', name: 'Heritage (alt)' },
    { code: 'MFB1', name: 'MicroBank One' },
    { code: 'MFB2', name: 'MicroBank Two' },
    { code: 'CORAL', name: 'Coral Bank' },
    { code: 'NLNB', name: 'NLN Bank' },
    { code: 'SOV', name: 'Sovereign Bank' },
    { code: 'PAYSTACK', name: 'Paystack Bank' },
    { code: 'FLUTTER', name: 'Flutter Bank' },
    { code: 'MOB', name: 'Mobile Bank' },
    { code: 'NEX', name: 'Next Bank' },
    { code: 'LAGO', name: 'Lagos State Bank' },
    { code: 'RUBY', name: 'Ruby Bank' },
    { code: 'BLUE', name: 'Blue Bank' },
    { code: 'ORANGE', name: 'Orange Bank' },
    { code: 'GREEN', name: 'Green Bank' },
    { code: 'TRUST', name: 'Trust Bank' },
    { code: 'SUMMIT', name: 'Summit Bank' },
    { code: 'ZEN', name: 'Zen Fintech' }
  ];

async function accountName() {
    const payload = {
        account_name,
        bank_code
    }
    const reponse = await postRequest(ENDPOINTS.account_name, payload)
}