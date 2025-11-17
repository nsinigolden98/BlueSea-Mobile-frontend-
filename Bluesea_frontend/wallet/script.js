'use strict';

function deposit() {
    document.getElementById("deposit-modal").style.display = "block";
    document.getElementById("page_inner").style.opacity = "0.3";
}

function cancel() {
    document.getElementById("page_inner").style.opacity = "1";
    document.getElementById("deposit-modal").style.display = "none";
    document.getElementById("deposit-input").textContent = "";   
}

async function fund(){
    let amount = document.getElementById("deposit-input").textContent.trim();
    if (amount < 0){
        
    }
    const response = await postRequest(ENDPOINTS.fund, {amount: Number(amount)});
    console.log(response);
    window.location.href = response.authorization_url;
};

async function withdraw() {

}