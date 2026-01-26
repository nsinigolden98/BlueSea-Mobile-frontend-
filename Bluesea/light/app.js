
const meterNumber = document.getElementById('meterNumber');
const nickname = document.getElementById('nickname');
const amount = document.getElementById('amount');
const continueBtn = document.getElementById('continueBtn');
const meterCard = document.getElementById('meterCard');
const lockIndicator = document.getElementById('lockIndicator');
const lockSvg = lockIndicator.querySelector('.lock');
const unitCount = document.getElementById('unitCount');

BILLER_NAME= {
 'Ikeja Electric(IKEDC)': 'ikeja-electric' ,
'Eko Electric(EKEDC)' : 'eko-electric',
 'Kano Electric(KEDCO)' : 'kano-electric',
 'Port-harcourt Electric(PHED)' : 'portharcourt-electric',
 'Jos Electric(JED)' : 'jos-electric' ,
'Ibadan Electric(IBEDC)':'ibadan-electric' ,
 'Kaduna Electric(KAEDCO)' : 'kaduna-electric',
 'Abuja Electric(AEDC)' :'abuja-electric',
 'Enugu Electric(EEDC)' : 'enugu-electric',
'Benin Electric(BEDC)' : 'benin-electric',
 'Aba Electric(ABA)': 'aba-electric',
 'Yola Electric(YEDC)' : 'yola-electric'
}

let meterType = null;
let disco = null;
const UNIT_PRICE = 70;

/* CUSTOM SELECT */
document.querySelectorAll('.custom-select').forEach(select => {
  const selected = select.querySelector('.selected');
  const options = select.querySelector('.options');

  selected.addEventListener('click', () => {
    select.classList.toggle('open');
  });

  options.querySelectorAll('div').forEach(option => {
    option.addEventListener('click', () => {
      selected.textContent = option.textContent.trim();
      select.classList.remove('open');

      if (select.id === 'meterTypeSelect') meterType = option.dataset.value;
      if (select.id === 'discoSelect') disco = option.dataset.value;

      validate();
    });
  });
});


/* VALIDATION + LOCK */
async function validate() {
  const locked = meterNumber.value && meterType && disco && meterNumber.value.length >= 13;

  lockSvg.classList.toggle('locked', locked);
  lockIndicator.querySelector('span').textContent =
    locked ? 'Meter locked' : 'Meter not locked';
    
  if(locked){
    meterCard.classList.remove('hidden');
    getCustomer()
    document.getElementById('cardDetails').textContent =
      `${meterType} • ${disco}`;
  }

 // continueBtn.disabled = !(locked && amount.value);
}

/* UNIT CALCULATION */
amount.addEventListener('input', () => {
  const val = Number(amount.value);
  if (!val) {
    unitCount.textContent = '—';
    //validate();
    return;
  }

  const units = Math.floor(val / UNIT_PRICE);
  unitCount.textContent = `${units} units`;
  // validate();
});

[meterNumber, nickname].forEach(el =>
  el.addEventListener('input', validate)
);

//for meter number 
function isValidMeterNumber(value) {
  return /^[0-9]{8,13}$/.test(value);
}

async function getCustomer() {
  payload= {
    meter_number: meterNumber.value,
    meter_type: meterType.toLowerCase(),
    biller: BILLER_NAME[disco]
  }

  showLoader()
  let user = await postRequest(ENDPOINTS.electricity_user,payload)

  if(user.success){
    hideLoader()
    document.getElementById('cardTitle').textContent = user.response.Customer_Name ? user.response.Customer_Name : user.response.error;
    continueBtn.disabled = user.response.Customer_Name ? false : true;
  }
  else{
    document.getElementById('cardTitle').textContent = user.error
  }
}

async function makePayment(){
    
    pin = document.getElementById("pin")
 
  payload={
    billerCode: meterNumber.value,
    amount: amount.value,
    biller_name:BILLER_NAME[disco],
    meter_type: meterType.toLowerCase(),
    transaction_pin: pin.value
  }
  showLoader()
  if(pin.value.length <3){
      showToast("Incomplete Pin")
  }
  else{
  let response = await  postRequest(ENDPOINTS.electricity, payload) 
  if(response.success || response.code ==="000"){
      showToast(response.response_description)
      showSuccess()
  }else{
      showToast(response.error)
  }
  cancelPayment()
  }
  hideLoader()
  
}

function cancelPayment(){
       //event.preventDefault()
        document.getElementById("pin-creation-step").style.display = 'none';
        // document.getElementById("buy-data-form").style.opacity = '1';
        document.getElementById("pin").value = "";
    }
    
    

// Buy Now Button Click Handler
async function enterPin() {
        
        let valid = true;
        const user = await getRequest(ENDPOINTS.user)
        if (user.pin_is_set === false){
            window.parent.location.href = "../settings/pin/pin.html";
            return valid = false;
        }
        if (!continueBtn.disabled && amount.value > 1500) {
            document.getElementById("pin-creation-step").style.display = 'block';
           // document.getElementById("buy-data-form").style.opacity = '0.3';
            
        }
        else{
            showToast("Minimum Purchase is ₦1,500")
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