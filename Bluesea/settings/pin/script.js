document.addEventListener('DOMContentLoaded', async function() {
    // --- Step 1: PIN Creation Elements ---
    const pinCreationStep = document.getElementById('pin-creation-step');
    const otpVerificationStep = document.getElementById('otp-verification-step');
    const createPinForm = document.getElementById('create-pin-form');
    const newPinInput = document.getElementById('new-pin');
    const confirmPinInput = document.getElementById('confirm-pin');
    const pinErrorMessage = document.getElementById('pin-error-message');

    // --- Step 2: OTP Verification Elements ---
    const otpForm = document.getElementById('otp-form');
    const otpCodeInput = document.getElementById('otp-code');
    const otpErrorMessage = document.getElementById('otp-error-message');
    
    // Global variable to store the successfully created PIN
    let createdPin = '';
    
    function showToast(msg, ms = 8200) {
    const t = document.getElementById("toast");
    if (!t) { alert(msg); return; }
    t.textContent = msg;
    t.hidden = false;
    t.style.opacity = 1;
    clearTimeout(t._hideTO);
    t._hideTO = setTimeout(() => { t.hidden = true; }, ms);
  }
    

    // --- Step 1 Form Submission Handler ---
    createPinForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Stop the form from submitting normally

        const newPin = newPinInput.value;
        const confirmPin = confirmPinInput.value;

        // 1. Basic length and digit check (though HTML pattern helps)
        if (newPin.length !== 4 || isNaN(newPin) || confirmPin.length !== 4 || isNaN(confirmPin)) {
            pinErrorMessage.textContent = 'PIN must be exactly 4 digits.';
            return;
        }

        // 2. **CRITICAL VALIDATION**: Ensure the two PIN inputs match
        if (newPin !== confirmPin) {
            pinErrorMessage.textContent = 'The two PINs do not match. Please re-enter.';
            // Clear the fields for security and forced re-entry
            newPinInput.value = ''; 
            confirmPinInput.value = '';
            newPinInput.focus();
            return;
        }

        // If validation passes
        pinErrorMessage.textContent = ''; // Clear error message
        
       const payload= {
           pin: newPin,
           confirm_pin: confirmPin
       }
        
        const set_pin = await postRequest(ENDPOINTS.pin_set, payload);
        console.log(set_pin)
        showToast(set_pin.message)
        
        if(set_pin.state === true){
            window.parent.location.replace("../../dashboard/dashboard.html")
        }
        // **Transition to the next step**
        //pinCreationStep.classList.remove('active-step');
       // pinCreationStep.classList.add('hidden-step');
      //  otpVerificationStep.classList.remove('hidden-step');
      //  otpVerificationStep.classList.add('active-step');
        
    });

    // --- Step 2 Form Submission Handler (OTP Verification) ---
    otpForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const otpCode = otpCodeInput.value;
        
        // 1. Basic length and digit check
        if (otpCode.length !== 6 || isNaN(otpCode)) {
            otpErrorMessage.textContent = 'OTP must be exactly 6 digits.';
            return;
        }

        // In a real application, this is where you'd make the API call to VERIFY the OTP
        // For this frontend demo, we'll just check if the OTP is 123456 as an example.
        if (otpCode === '123456') {
            otpErrorMessage.textContent = '';
            alert('Success! Your PIN is created and your account is verified.');
            // Redirect the user or show a final confirmation screen
        } else {
            otpErrorMessage.textContent = 'Invalid OTP. Please try again.';
            otpCodeInput.value = '';
            otpCodeInput.focus();
        }
    });

    // --- Resend OTP Button Handler ---
    document.getElementById('resend-otp').addEventListener('click', function() {
        // In a real app, you'd trigger another API call to resend the OTP
        alert('OTP Resend Initiated. Check your message/email.');
        // You might want to disable the resend button for a short duration here.
    });
});
