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
  
  const BANK_LIST_PAYSTACK_COMPATIBLE = [
    // Commercial Banks
    { code: 'ACCESS', name: 'Access Bank', nip_code: '044', type: 'COMMERCIAL' },
    { code: 'GTB', name: 'Guaranty Trust Bank', nip_code: '058', type: 'COMMERCIAL' },
    { code: 'ZENITH', name: 'Zenith Bank', nip_code: '057', type: 'COMMERCIAL' },
    { code: 'UBA', name: 'UBA', nip_code: '033', type: 'COMMERCIAL' },
    { code: 'FIRST', name: 'First Bank', nip_code: '011', type: 'COMMERCIAL' },
    { code: 'FCMB', name: 'FCMB', nip_code: '214', type: 'COMMERCIAL' },
    { code: 'STERLING', name: 'Sterling Bank', nip_code: '232', type: 'COMMERCIAL' },
    { code: 'UNION', name: 'Union Bank', nip_code: '032', type: 'COMMERCIAL' },
    { code: 'ECO', name: 'Ecobank', nip_code: '050', type: 'COMMERCIAL' },
    { code: 'STANBIC', name: 'Stanbic IBTC', nip_code: '221', type: 'COMMERCIAL' },
    { code: 'WEMA', name: 'Wema Bank', nip_code: '035', type: 'COMMERCIAL' },
    { code: 'PROVIDUS', name: 'Providus Bank', nip_code: '101', type: 'COMMERCIAL' },
    { code: 'POLARIS', name: 'Polaris Bank', nip_code: '076', type: 'COMMERCIAL' },
    { code: 'CITIBANK', name: 'Citi Bank', nip_code: '023', type: 'COMMERCIAL' },
    { code: 'KEYSTONE', name: 'Keystone Bank', nip_code: '082', type: 'COMMERCIAL' },
    { code: 'FIDELITY', name: 'Fidelity Bank', nip_code: '070', type: 'COMMERCIAL' },
    { code: 'UNITY', name: 'Unity Bank', nip_code: '215', type: 'COMMERCIAL' },
    { code: 'HERITAGE', name: 'Heritage Bank', nip_code: '030', type: 'COMMERCIAL' },
    { code: 'STANDARD', name: 'Standard Chartered', nip_code: '068', type: 'COMMERCIAL' },
    { code: 'TITAN', name: 'Titan Trust Bank', nip_code: '102', type: 'COMMERCIAL' },
    { code: 'PARALLEX', name: 'Parallex Bank', nip_code: '104', type: 'COMMERCIAL' },
    { code: 'GLOBUS', name: 'Globus Bank', nip_code: '00103', type: 'COMMERCIAL' },
    { code: 'PREMIUM', name: 'PremiumTrust Bank', nip_code: '105', type: 'COMMERCIAL' },
    
    // Fintechs / Digital Banks / MFBs / Payment Service Banks (PSBs)
    { code: 'OPAY', name: 'OPay', nip_code: '999992', type: 'FINTECH' },
    { code: 'MONIEPOINT', name: 'Moniepoint MFB', nip_code: '50515', type: 'MICROFINANCE' },
    { code: 'KALD', name: 'Kuda Bank', nip_code: '50211', type: 'MICROFINANCE' },
    { code: 'ALAT', name: 'ALAT by WEMA', nip_code: '035A', type: 'DIGITAL' },
    { code: 'RUBY', name: 'Rubies MFB', nip_code: '125', type: 'MICROFINANCE' },
    { code: 'PAGA', name: 'Paga', nip_code: '100002', type: 'FINTECH' },
    { code: 'PALMPAY', name: 'PalmPay', nip_code: '999991', type: 'FINTECH' },
    { code: 'VFD', name: 'VFD Microfinance Bank', nip_code: '566', type: 'MICROFINANCE' },
    { code: 'SPARKLE', name: 'Sparkle Microfinance Bank', nip_code: '51310', type: 'MICROFINANCE' },

    // Non-Interest / Merchant Banks
    { code: 'JAIZ', name: 'Jaiz Bank', nip_code: '301', type: 'NON_INTEREST' },
    { code: 'TAJ', name: 'TAJ Bank', nip_code: '302', type: 'NON_INTEREST' },
    { code: 'FSDH', name: 'FSDH Merchant Bank', nip_code: '501', type: 'MERCHANT' },
    { code: 'LOTUS', name: 'Lotus Bank', nip_code: '303', type: 'NON_INTEREST' },
];


async function accountName() {
    const payload = {
        account_number,
        bank_code,
    }
    const reponse = await postRequest(ENDPOINTS.account_name, payload)
}

