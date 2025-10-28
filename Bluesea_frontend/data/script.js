document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. DATA (Original Data Structure)
    // ----------------------------------------------------------------------
    const DATA_PLANS = {
        "MTN": {
            "N100 100MB - 24 hrs": {id: "mtn-100mb-100", price: 100, volume: "100MB", validity: "1 Day", type: "Daily"},
            "N200 200MB - 2 days": {id: "mtn-200mb-200", price: 200, volume: "200MB", validity: "2 Days", type: "Daily"},
            "N600 2.5GB - 2 days": {id: "mtn-2-5gb-600", price: 600, volume: "2.5GB", validity: "2 Days", type: "Daily"},
            "N800 3GB - 2 days": {id: "mtn-3gb-800", price: 800, volume: "3GB", validity: "2 Days", type: "Daily"},
            "N1500 6GB - 7 days": {id: "mtn-6gb-1500", price: 1500, volume: "6GB", validity: "7 Days", type: "Weekly"},
            "N1000 1.5GB - 30 days": {id: "mtn-1-5gb-1000", price: 1000, volume: "1.5GB", validity: "30 Days", type: "Monthly"},
            "N5000 15GB - 30 days": {id: "mtn-15gb-5000", price: 5000, volume: "15GB", validity: "30 Days", type: "Monthly"},
            "MTN N300 Xtratalk": {id: "mtn-xtratalk-300", price: 300, volume: "Talk", validity: "7 Days", type: "ExtraValue"},
        },
        "Glo": {
            "N100 105MB - 2 day": {id: "glo100", price: 100, volume: "105MB", validity: "2 Days", type: "Daily"},
            "N1000 2.5GB - 30 days": {id: "glo1000", price: 1000, volume: "2.5GB", validity: "30 Days", type: "Monthly"},
        },
        "Airtel": {
            "N100 75MB - 1Day": {id: "airt-100", price: 99, volume: "75MB", validity: "1 Day", type: "Daily"},
            "N1500 6GB (7 Days)": {id: "airt-1500-7", price: 1499, volume: "6GB", validity: "7 Days", type: "Weekly"},
        },
        "9mobile": {
            "N100 100MB - 1 day": {id: "eti-100", price: 100, volume: "100MB", validity: "1 Day", type: "Daily"},
            "N1000 1.5GB - 30 days": {id: "eti-1-5gb-1000", price: 1000, volume: "1.5GB", validity: "30 Days", type: "Monthly"},
        }
    };
    
    // ----------------------------------------------------------------------
    // 2. DOM Elements and State Variables (New Modal Elements)
    // ----------------------------------------------------------------------
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const networkTabsContainer = document.querySelector('.network-tabs');
    const planTypeTabsContainer = document.querySelector('.plan-tabs');
    const dataPlansGrid = document.querySelector('.data-plans-grid');
    const recipientNumberInput = document.getElementById('recipient-number');
    const useMyNumberCheckbox = document.getElementById('use-my-number');
    const proceedToPaymentBtn = document.getElementById('proceed-to-payment-btn');

    // Modal Elements
    const pinModal = document.getElementById('pin-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const pinDigits = document.querySelectorAll('.pin-digit');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    const pinMessage = document.getElementById('pin-message');

    const myPhoneNumber = '08091234567'; 
    const correctPin = '1234'; // Simulated correct PIN for demo

    let currentNetwork = 'MTN';
    let currentPlanType = 'Daily';
    let currentRecipient = '12345678900'; 
    let currentPlan = { amount: 0, volume: '0MB', id: '' };
    
    // ----------------------------------------------------------------------
    // 3. CORE LOGIC FUNCTIONS
    // ----------------------------------------------------------------------

    /**
     * Dynamically generates and renders data plan cards.
     */
    function renderDataPlans() {
        const plans = DATA_PLANS[currentNetwork];
        // ... (Plan filtering logic) ... 
        const filteredPlans = Object.keys(plans).filter(key => plans[key].type === currentPlanType);

        if (filteredPlans.length === 0) {
            dataPlansGrid.innerHTML = `<p style="color:var(--text-muted-color); padding: 1rem;">No ${currentPlanType} plans available for ${currentNetwork}. Try another plan type.</p>`;
            updatePlanSummary(null);
            return;
        }

        let plansHTML = '';
        let firstPlan = null;

        filteredPlans.forEach((key, index) => {
            const plan = plans[key];
            const isActive = index === 0; 
            if (isActive) {
                firstPlan = plan;
            }
            
            const headerVolume = plan.volume.split('(')[0].trim();
            
            // --- PLACEHOLDER LOGIC FOR STYLING ONLY ---
            const showSlashedPrice = index % 3 === 0; 
            const showCashback = index % 2 === 0;    
            const showTag = index % 4 === 0 || index === 1; 
            const tagValue = (index === 1) ? "%" : "HOT"; 
            const placeholderSlashedPrice = plan.price + 50; 
            const placeholderCashback = (plan.price * 0.05).toFixed(2); 

            const slashedPriceHtml = showSlashedPrice ? `<span class="plan-slashed-price">₦${placeholderSlashedPrice.toLocaleString()}</span>` : '';
            const tagHtml = showTag ? `<div class="plan-tag">${tagValue}</div>` : '';
            const cashbackHtml = showCashback ? `<div class="plan-cashback-row">₦${placeholderCashback} Cashback</div>` : '';
            
            plansHTML += `
                <div class="data-plan-card ${isActive ? 'active' : ''}" 
                     data-plan-id="${plan.id}" 
                     data-price="${plan.price}" 
                     data-volume="${plan.volume}" 
                     data-validity="${plan.validity}">
                    
                    ${tagHtml}

                    <div class="plan-content">
                        <div class="plan-header">${headerVolume}</div>
                        <div class="plan-validity">${plan.validity}</div>
                        
                        <div class="plan-price-row">
                            ${slashedPriceHtml}
                            <span class="plan-price">₦${plan.price.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    ${cashbackHtml}
                </div>
            `;
        });

        dataPlansGrid.innerHTML = plansHTML;

        // Set the first plan as the active summary plan
        if (firstPlan) {
            currentPlan = {
                amount: firstPlan.price,
                volume: firstPlan.volume,
                id: firstPlan.id
            };
        } else {
            currentPlan = { amount: 0, volume: '0MB', id: '' };
        }
        updateSummary();
    }

    /**
     * Updates the global currentPlan state and calls the summary update.
     */
    function updatePlanSummary(activeCard) {
        if (!activeCard) {
            currentPlan = { amount: 0, volume: '0MB', id: '' };
        } else {
            const newAmount = activeCard.getAttribute('data-price');
            const newVolume = activeCard.getAttribute('data-volume');
            const newId = activeCard.getAttribute('data-plan-id');
            
            currentPlan = {
                amount: parseFloat(newAmount),
                volume: newVolume,
                id: newId
            };
        }
        updateSummary();
    }

    /**
     * Updates the recommendation banner and button status based on the current state.
     */
    function updateSummary() {
        const hasValidPlan = currentPlan.amount > 0;
        const recipientValue = recipientNumberInput.value.trim();
        const isValidRecipient = recipientValue.length === 11 || useMyNumberCheckbox.checked;

        if (isValidRecipient) {
            currentRecipient = recipientValue.length === 11 ? recipientValue : myPhoneNumber;
        } else {
            currentRecipient = '';
        }

        // Update Banner Text
        let bannerText = "Select a plan to proceed with your purchase.";
        if (hasValidPlan && isValidRecipient) {
            bannerText = `Ready to buy ${currentPlan.volume} on ${currentNetwork} for ₦${currentPlan.amount.toLocaleString()} for ${currentRecipient}.`;
        } else if (hasValidPlan) {
            bannerText = `Plan selected! Please enter a valid 11-digit phone number.`;
        } else if (isValidRecipient) {
            bannerText = `Recipient set! Now, select a plan.`;
        }
            
        document.querySelector('.recommendation-banner p').textContent = bannerText;
        
        // Enable/Disable main button
        proceedToPaymentBtn.disabled = !(hasValidPlan && isValidRecipient);
    }
    
    // ----------------------------------------------------------------------
    // 4. MODAL & PIN LOGIC (New)
    // ----------------------------------------------------------------------

    function showModal() {
        pinModal.style.display = 'flex';
        pinMessage.textContent = '';
        pinDigits.forEach(input => input.value = ''); // Clear old pin
        pinDigits[0].focus();
    }

    function hideModal() {
        pinModal.style.display = 'none';
    }

    function getPinValue() {
        let pin = '';
        pinDigits.forEach(input => {
            pin += input.value;
        });
        return pin;
    }

    // PIN input auto-focus/navigation
    pinDigits.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.data && /^\d$/.test(e.data) && index < pinDigits.length - 1) {
                pinDigits[index + 1].focus();
            }
            if (getPinValue().length === 4) {
                confirmPaymentBtn.focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value === '' && index > 0) {
                pinDigits[index - 1].focus();
            }
        });
    });

    // Handle payment confirmation
    confirmPaymentBtn.addEventListener('click', () => {
        const pin = getPinValue();
        if (pin.length !== 4) {
            pinMessage.textContent = "PIN must be 4 digits.";
            return;
        }

        if (pin === correctPin) {
            pinMessage.textContent = 'Transaction Successful! Redirecting...';
            pinMessage.style.color = 'var(--plan-cashback-color)';
            confirmPaymentBtn.disabled = true;

            setTimeout(() => {
                hideModal();
                alert(`SUCCESS! Bought ${currentPlan.volume} on ${currentNetwork} for ₦${currentPlan.amount} for ${currentRecipient}.`);
                // In a real application, you would redirect the user here.
            }, 1500);

        } else {
            pinMessage.textContent = "Invalid PIN. Please try again.";
            pinMessage.style.color = 'var(--error-color)';
        }
    });

    // ----------------------------------------------------------------------
    // 5. EVENT HANDLERS
    // ----------------------------------------------------------------------
    
    // Global Event Listeners for Modal
    closeModalBtn.addEventListener('click', hideModal);
    window.addEventListener('click', (event) => {
        if (event.target === pinModal) {
            hideModal();
        }
    });

    // Main Button Click
    proceedToPaymentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!proceedToPaymentBtn.disabled) {
            showModal();
        }
    });

    // Active State Management setup
    function setupActiveToggle(container, selector) {
        container.addEventListener('click', (event) => {
            const target = event.target.closest(selector);
            if (target && !target.classList.contains('active')) {
                container.querySelectorAll(selector).forEach(el => el.classList.remove('active'));
                target.classList.add('active');

                if (container === networkTabsContainer || container === planTypeTabsContainer) {
                    currentNetwork = target.getAttribute('data-network') || currentNetwork;
                    currentPlanType = target.getAttribute('data-plan-type') || currentPlanType;
                    renderDataPlans(); 
                } else if (target.classList.contains('data-plan-card')) {
                    updatePlanSummary(target);
                }
            }
        });
    }
    
    // Theme Toggle 
    themeToggle.addEventListener('click', () => {
        const isDarkMode = body.classList.toggle('dark-mode');
        body.classList.toggle('light-mode', !isDarkMode); 
        themeToggle.setAttribute('data-mode', isDarkMode ? 'dark' : 'light');
        const icon = themeToggle.querySelector('svg');
        // Simplified icon switch
        icon.innerHTML = isDarkMode ? 
            '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>' : 
            '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    });

    // 2. Active State Management setup
    setupActiveToggle(networkTabsContainer, '.tab-button');
    setupActiveToggle(planTypeTabsContainer, '.tab-button');
    setupActiveToggle(dataPlansGrid, '.data-plan-card');

    // 3. Recipient Number Logic
    useMyNumberCheckbox.addEventListener('change', () => {
        if (useMyNumberCheckbox.checked) {
            recipientNumberInput.value = myPhoneNumber;
            recipientNumberInput.disabled = true;
        } else {
            recipientNumberInput.value = '';
            recipientNumberInput.disabled = false;
        }
        updateSummary();
    });

    recipientNumberInput.addEventListener('input', () => {
        const value = recipientNumberInput.value.replace(/\D/g, ''); 
        recipientNumberInput.value = value.substring(0, 11);
        updateSummary();
    });

    // 4. Initial Render and Summary Display
    renderDataPlans(); 
});
