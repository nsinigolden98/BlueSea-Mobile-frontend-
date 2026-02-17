function showToast(msg, ms = 8200) {
    const t = document.getElementById("toast");
    if (!t) { alert(msg); return; }
    t.textContent = msg;
    t.hidden = false;
    t.style.opacity = "1";
    clearTimeout(t._hideTO);
    t._hideTO = setTimeout(() => { t.hidden = true; }, ms);
  }
//document.addEventListener('DOMContentLoaded', async() => {
    async function user(){
      const user = await getRequest(ENDPOINTS.user);
     
      if (user.phone.includes("+234")) {
      const removeZero = user.phone.slice(4,)
      document.getElementById("recipient-number").value = "0" + String(removeZero);
      }
      else {
     document.getElementById("recipient-number").value = String(user.phone);
        
      }
    updateSummary()
    }
    user()

    // ----------------------------------------------------------------------
    // 1. DOM Elements and State Variables
    // ----------------------------------------------------------------------
    const networkTabsContainer = document.querySelector('.network-tabs');
    const recipientNumberInput = document.getElementById('recipient-number');
    const airtimeAmountInput = document.getElementById('airtime-amount');
    const amountSelectGrid = document.querySelector('.amount-select-grid');
    const airtimeCards = document.querySelectorAll('.airtime-card'); // TARGETING THE NEW CLASS
    const buyNowBtn = document.getElementById('buy-now-btn');

    // Summary Elements
    const summaryNetwork = document.getElementById('summary-network');
    const summaryAmount = document.getElementById('summary-amount');
    const summaryRecipientId = document.getElementById('summary-recipient-id');

    // State
    let currentNetwork = 'MTN';
    let currentRecipient = recipientNumberInput.value;
    let currentAmount = 0;

    const MIN_AIRTIME_AMOUNT = 50;

    // ----------------------------------------------------------------------
    // 2. CORE LOGIC FUNCTIONS
    // ----------------------------------------------------------------------

    /**
     * Deactivates all quick-select amount cards.
     */
    function deactivateAmountButtons() {
        airtimeCards.forEach(card => card.classList.remove('active'));
    }

    /**
     * Updates all displayed summary fields based on the current state.
     */
    function updateSummary() {
        summaryNetwork.textContent = currentNetwork;

        // --- 1. Validate Recipient ---
        const recipientValue = recipientNumberInput.value.trim();
        const hasValidRecipient = recipientValue.length === 11;

        if (hasValidRecipient) {
            currentRecipient = recipientValue;
        } else {
            currentRecipient = recipientNumberInput.value ;
        }
        summaryRecipientId.textContent = currentRecipient;

        // --- 2. Determine Amount ---
        // If an amount is selected via buttons, currentAmount is already set.
        // If the manual input has a valid number, that overrides the button selection.
        const manualAmount = parseInt(airtimeAmountInput.value);

        let finalAmount;

        if (!isNaN(manualAmount) && manualAmount >= MIN_AIRTIME_AMOUNT) {
            finalAmount = manualAmount;
        } else if (currentAmount >= MIN_AIRTIME_AMOUNT) {
             finalAmount = currentAmount;
        } else {
            finalAmount = 0;
        }

        currentAmount = finalAmount; // Update state with the final determined amount

        // --- 3. Update Summary Display ---
        const hasValidAmount = currentAmount >= MIN_AIRTIME_AMOUNT;

        if (hasValidAmount) {
            summaryAmount.textContent = `₦${currentAmount.toLocaleString()}`;
        } else {
            summaryAmount.textContent = `₦0 (Min ₦${MIN_AIRTIME_AMOUNT})`;
        }

        // --- 4. Enable/Disable Button ---
        const isButtonEnabled = hasValidRecipient && hasValidAmount;
      buyNowBtn.disabled = !isButtonEnabled;
      document.getElementById('buy-now-btn-group').disabled = !isButtonEnabled;
    }

    // ----------------------------------------------------------------------
    // 3. EVENT HANDLERS
    // ----------------------------------------------------------------------

    // Network Tab Selection Handler
    networkTabsContainer.addEventListener('click', (event) => {
        const target = event.target.closest('.tab-button');
        if (target && !target.classList.contains('active')) {
            networkTabsContainer.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));
            target.classList.add('active');

            currentNetwork = target.getAttribute('data-network');
            updateSummary();
        }
    });

    const Network_prefixes = {
        "MTN": ["0803", "0806", "0810", "0813", "0814", "0816", "0703", "0704", "0706", "0903"],
        "Glo": ["0705", "0805", "0807", "0811", "0815", "0905"],
        "Airtel": ["0701", "0802", "0808", "0810", "0812", "0902"],
        "9mobile": ["0809", "0817", "0818", "0909"]
    };

    function detectNetwork(number) {
        if (number.length < 4) return null;

        const prefix = number.substring(0, 4);

        for (const network in Network_prefixes) {
            if (Network_prefixes[network].includes(prefix)) {
                return network;
            }
        }
        return null;
    }

    function setActiveNetworkTab(networkName) {
        const buttonNetworkName = networkName

        networkTabsContainer.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));

        const targetButton = networkTabsContainer.querySelector(`[data-network="${buttonNetworkName}"]`);
        if (targetButton) {
            targetButton.classList.add('active');
            currentNetwork = networkName;
        } else {
            currentNetwork = networkName;
        }
    }


    // Recipient Number Input Handler
     recipientNumberInput.addEventListener('input', () => {
        const value = recipientNumberInput.value.replace(/\D/g, '');
        recipientNumberInput.value = value.substring(0, 11);

         if (value.length >= 4) {
            const detected = detectNetwork(value);
            if (detected && detected !== currentNetwork) {
                // If a new network is detected, update the visual tabs and state
                setActiveNetworkTab(detected);
            }
        }

        updateSummary();
    });

    // Amount Card Selection Handler (UPDATED TARGET CLASS)
    amountSelectGrid.addEventListener('click', (event) => {
        const target = event.target.closest('.airtime-card');
        if (target) {
            deactivateAmountButtons();

            // Set card as active
            target.classList.add('active');

            // Update state and clear manual input
            currentAmount = parseInt(target.getAttribute('data-amount'));
            airtimeAmountInput.value = '';

            updateSummary();
        }
    });

    // Manual Amount Input Handler
    airtimeAmountInput.addEventListener('input', () => {
        let value = airtimeAmountInput.value.replace(/\D/g, '');
        if (value.startsWith('0') && value.length > 1) {
            value = value.substring(1);
        }
        airtimeAmountInput.value = value;

        // Clear selected card state when user types manually
        deactivateAmountButtons();
        currentAmount = parseInt(airtimeAmountInput.value) || 0;

        updateSummary();
    });

    // Buy Now Button Click Handler
let type = "";
async function enterPin(pay_type) {
        
    type = pay_type
        const user = await getRequest(ENDPOINTS.user)
        if (!user.pin_is_set){
            window.parent.location.href = "../settings/pin/pin.html";
            return;
        }
   
       else if (!buyNowBtn.disabled && type === 'single') {
            document.getElementById("pin-creation-step").style.display = 'block';
          document.getElementById("buy-data-form").style.opacity = '0.3';
          document.getElementById("pin").value = "";
          disableBtn(true)
        }
        else if (type === 'group') {
    
    let name = document.getElementById("group-name").value.trim();
     let purpose = document.getElementById("group-purpose").value.trim();
    let invite = document.getElementById("invite-members").value.trim();
    if (!name) {
      showToast("Enter A Group Name")
      return;
    }
    let user_email = localStorage.getItem("email");
    if (!invite ) {
      showToast("Enter Emails Of Members")
      return;
    }
    if (invite.includes(user_email)) {
      showToast("Do Not Include Your Email In Invite")
      return;
    }
    checkInvite = invite.split(',').every(e=> validateEmail(e.trim()))
      
      
    if (!checkInvite) {
      showToast('Invalid Email In Invite')
      return;
    }
    document.getElementById("pin-creation-step").style.display = 'block';
    document.getElementById("buy-data-form").style.opacity = '0.3';
     document.getElementById("pin").value = ""
    document.getElementById('create-form').style.display = "none"
    
        } 
         
       else {
            showToast('Please select a network, enter a valid 11-digit number, and an amount of at least ₦50.');
        }
  
};

   function cancelPayment(){

        document.getElementById("pin-creation-step").style.display = 'none';
        document.getElementById("buy-data-form").style.opacity = '1';
     document.getElementById("pin").value = "";
     cancelGroupPayment()
    }


updateSummary();

async function makePayment(){
  let pin = document.getElementById("pin").value.trim();
  let name = document.getElementById("group-name").value.trim();
   let purpose = document.getElementById("group-purpose").value.trim();
   let invite = document.getElementById("invite-members").value.trim();
    cancelPayment()
  const payload_single ={
                amount: String(currentAmount),
                network: currentNetwork.toLowerCase() !== "9mobile" ? currentNetwork.toLowerCase() : "etisalat",
                phone_number: String(currentRecipient),
                transaction_pin: pin
            };
  const payload_group = {
    name,
    service_type: "Airtime",
    target_amount: String(currentAmount),
    plan: currentNetwork.toLowerCase() !== "9mobile" ? currentNetwork.toLowerCase() : "etisalat",
    description: purpose,
    sub_number: String(currentRecipient),
    invite_members: invite,
    join_code: generateJoinCode(),
    transaction_pin: pin
        }
   if(type==='single'){
    showLoader();
          const buy_airtime = await postRequest(ENDPOINTS.buy_airtime, payload_single);

        if(buy_airtime.success || buy_airtime.code ==="000"){
          showToast(buy_airtime.response_description)
         showSuccess();
        }
        else{
          showToast(buy_airtime.error ? buy_airtime.error : buy_airtime.response_description)
    }
     hideLoader();
   }
  if (type === 'group') {
   
    showLoader();
    
    let  create_group = await postRequest(ENDPOINTS.create_group,payload_group)
    
    if (create_group.success) {
      
    showToast(create_group.message)
    }
    else {
      
    showToast(create_group.error)
    }
    //showToast('Group created successfully.');
    hideLoader();
   }
  disableBtn(false)
}

function showGroupPayment() {
  document.getElementById('create-form').style.display = 'block'
  document.getElementById("buy-data-form").style.opacity = '0.3';
  
  document.getElementById('network-group').value = currentNetwork;
  document.getElementById('phone-number-group').value = currentRecipient;
  document.getElementById('target-amount').value = currentAmount;
  disableBtn(true)
  }

function cancelGroupPayment() {
  document.getElementById('create-form').style.display = 'none'
 document.getElementById("buy-data-form").style.opacity = '1';

  document.getElementById("group-name").value = ''

  document.getElementById("phone-number-group").value = ''
  document.getElementById("target-amount").value = ''
  document.getElementById("group-purpose").value = ''
  document.getElementById("invite-members").value = ''
  // document.getElementById("create-form").getElementById("buy-data-f").style.display = 'none'

  disableBtn(false)
}

// to disable button when there is a modal
function disableBtn(bool) {
  const ids = ['cancel-create', 'create-submit', 'make-payment','cancel-payment' ]
 disableAllBtn(ids,bool=bool) 
}

