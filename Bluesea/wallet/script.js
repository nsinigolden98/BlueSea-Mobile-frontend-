'use strict';

function deposit() {
    document.getElementById("deposit-modal").style.display = "block";
    document.getElementById("page_inner").style.opacity = "0.3";
}

let error =  document.getElementById("error-amount");

function cancel() {
    document.getElementById("page_inner").style.opacity = "1";
    document.getElementById("deposit-modal").style.display = "none";
    document.getElementById("deposit-input").value = "";   
}

async function fund(){
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
    window.location.href = response.authorization_url;
    //hideLoader()
};
window.addEventListener('load', function(event) {
 showLoader();
});

async function withdraw() {

}