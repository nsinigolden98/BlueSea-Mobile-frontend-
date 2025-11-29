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
    const response = await postRequest(ENDPOINTS.fund, {amount: Number(amount)});
    window.parent.location.href = response.authorization_url;
    //hideLoader()
};

document.getElementById('deposit-input').addEventListener('input', e => 
  e.target.value = e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
);
async function withdraw() {

}