document.addEventListener('DOMContentLoaded', () => {
    
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
    let currentRecipient = '12345678900'; 
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
            currentRecipient = 'Invalid/Missing'; 
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

    // Recipient Number Input Handler
    recipientNumberInput.addEventListener('input', () => {
        const value = recipientNumberInput.value.replace(/\D/g, ''); 
        recipientNumberInput.value = value.substring(0, 11);
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
    buyNowBtn.addEventListener('click', () => {
        if (!buyNowBtn.disabled) {
            alert(`
                BUYING AIRTIME CONFIRMATION:
                Network: ${currentNetwork}
                Amount: ₦${currentAmount.toLocaleString()}
                Recipient: ${currentRecipient}

                (Airtime recharge successful!)
            `);
        } else {
            alert('Please select a network, enter a valid 11-digit number, and an amount of at least ₦50.');
        }
    });

    // 4. Initialisation
    updateSummary(); 
});
