//document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. RAW DATA (Provided Python Dictionaries)
    // ----------------------------------------------------------------------

    const Mtn_dict = {
        "N100 100MB - 24 hrs": ["mtn-10mb-100", 100],
        "N200 200MB - 2 days": ["mtn-50mb-200", 200],
        "N1000 1.5GB - 30 days": ["mtn-100mb-1000", 1000],
        "N2000 4.5GB - 30 days": ["mtn-500mb-2000", 2000],
        "N1500 6GB - 7 days": ["mtn-20hrs-1500", 1500],
        "N2500 6GB - 30 days": ["mtn-3gb-2500", 2500],
        "N3000 8GB - 30 days": ["mtn-data-3000", 3000],
        "N3500 10GB - 30 days": ["mtn-1gb-3500", 3500],
        "N5000 15GB - 30 days": ["mtn-100hr-5000", 5000],
        "N6000 20GB - 30 days": ["mtn-3gb-6000", 6000],
        "N10000 40GB - 30 days": ["mtn-40gb-10000", 10000],
        "N15000 75GB - 30 days": ["mtn-75gb-15000", 15000],
        "N20000 110GB - 30 days": ["mtn-110gb-20000", 20000],
        "N1500 3GB - 30 days": ["mtn-3gb-1500", 1500],
        "MTN N10,000 25GB SME Mobile Data ( 1 Month)": ["mtn-25gb-sme-10000", 10000],
        "MTN N50,000 165GB SME Mobile Data (2-Months)": ["mtn-165gb-sme-50000", 50000],
        "MTN N100,000 360GB SME Mobile Data (3 Months)": ["mtn-360gb-sme-100000", 100000],
        "MTN N450,000 4.5TB Mobile Data (1 Year)": ["mtn-4-5tb-450000", 450000],
        "MTN N100,000 1TB Mobile Data (1 Year)": ["mtn-1tb-110000", 100000],
        "MTN N600 2.5GB - 2 days": ["mtn-2-5gb-600", 600],
        "MTN N22000 120GB Monthly Plan + 80mins": ["mtn-120gb-22000", 22000],
        "MTN 100GB 2-Month Plan": ["mtn-100gb-20000", 20000],
        "MTN N30,000 160GB 2-Month Plan": ["mtn-160gb-30000", 30000],
        "MTN N50,000 400GB 3-Month Plan": ["mtn-400gb-50000", 50000],
        "MTN N75,000 600GB 3-Months Plan": ["mtn-600gb-75000", 75000],
        "MTN N300 Xtratalk Weekly Bundle": ["mtn-xtratalk-300", 300],
        "MTN N500 Xtratalk Weekly Bundle": ["mtn-xtratalk-500", 500],
        "MTN N1000 Xtratalk Monthly Bundle": ["mtn-xtratalk-1000", 1000],
        "MTN N2000 Xtratalk Monthly Bundle": ["mtn-xtratalk-2000", 2000],
        "MTN N5000 Xtratalk Monthly Bundle": ["mtn-xtratalk-5000", 5000],
        "MTN N10000 Xtratalk Monthly Bundle": ["mtn-xtratalk-10000", 10000],
        "MTN N15000 Xtratalk Monthly Bundle": ["mtn-xtratalk-15000", 15000],
        "MTN N20000 Xtratalk Monthly Bundle": ["mtn-xtratalk-20000", 20000],
        "MTN N800 3GB - 2 days": ["mtn-3gb-800", 800],
        "MTN N2000 7GB - 7 days": ["mtn-7gb-2000", 2000],
        "MTN N200 Xtradata": ["mtn-xtradata-200", 200],
        "MTN N200 Xtratalk - 3 days": ["mtn-xtratalk-300", 200],
    };

    const airtel_dict = {
        "Airtel Data Bundle - 50 Naira - 25MB  - 1Day": ["airt-50", 49],
        "Airtel Data Bundle - 100 Naira - 75MB - 1Day": ["airt-100", 99],
        "Airtel Data Bundle - 200 Naira - 200MB - 3Days": ["airt-200", 199],
        "Airtel Data Bundle - 300 Naira - 350MB - 7 Days": ["airt-300", 299],
        "Airtel Data Bundle - 500 Naira - 750MB - 14 Days": ["airt-500", 499],
        "Airtel Data Bundle - 1,000 Naira - 1.5GB - 30 Days": ["airt-1000", 999],
        "Airtel Data Bundle - 1,500 Naira - 3GB - 30 Days": ["airt-1500", 1499],
        "Airtel Data Bundle - 2,000 Naira - 4.5GB - 30 Days": ["airt-2000", 1999],
        "Airtel Data Bundle - 3,000 Naira - 8GB - 30 Days": ["airt-3000", 2999],
        "Airtel Data Bundle - 4,000 Naira - 11GB - 30 Days": ["airt-4000", 3999],
        "Airtel Data Bundle - 5,000 Naira - 15GB - 30 Days": ["airt-5000", 4999],
        "Airtel Binge Data - 1,500 Naira (7 Days) - 6GB": ["airt-1500-2", 1499],
        "Airtel Data Bundle - 10,000 Naira - 40GB - 30 Days": ["airt-10000", 9999],
        "Airtel Data Bundle - 15,000 Naira - 75GB - 30 Days": ["airt-15000", 14999],
        "Airtel Data Bundle - 20,000 Naira - 110GB - 30 Days": ["airt-20000", 19999],
        "Airtel Data - 600 Naira - 1GB - 14 days": ["airt-600", 600],
        "Airtel Data - 1000 Naira - 1.5GB - 7 days": ["airt-1000-7", 1000],
        "Airtel Data - 2000 Naira - 7GB - 7 days": ["airt-2000-7", 2000],
        "Airtel Data - 5000 Naira - 25GB - 7 days": ["airt-5000-7", 5000],
        "Airtel Data - 400 Naira - 1.5GB - 1 day": ["airt-400-1", 400],
        "Airtel Data - 800 Naira - 3.5GB - 2 days": ["airt-800-2", 800],
        "Airtel Data - 6000 Naira - 23GB - 30 days": ["airt-6000-30", 6000],
        "600 Naira Voice Bundle": ["airt-voice-100", 100],
        "1200 Naira Voice Bundle": ["airt-voice-200", 200],
        "3000 Naira Voice Bundle": ["airt-voice-500", 500],
        "6000 Naira Voice Bundle": ["airt-voice-1000", 1000],
    };

    const glo_dict = {
        "Glo Data N100 -  105MB - 2 day": ["glo100", 100],
        "Glo Data N200 -  350MB - 4 days": ["glo200", 200],
        "Glo Data N500 -  1.05GB - 14 days": ["glo500", 500],
        "Glo Data N1000 -  2.5GB - 30 days": ["glo1000", 1000],
        "Glo Data N2000 -  5.8GB - 30 days": ["glo2000", 2000],
        "Glo Data N2500 -  7.7GB - 30 days": ["glo2500", 2500],
        "Glo Data N3000 -  10GB - 30 days": ["glo3000", 3000],
        "Glo Data N4000 -  13.25GB - 30 days": ["glo4000", 4000],
        "Glo Data N5000 -  18.25GB - 30 days": ["glo5000", 5000],
        "Glo Data N8000 -  29.5GB - 30 days": ["glo8000", 8000],
        "Glo Data N10000 -  50GB - 30 days": ["glo10000", 10000],
        "Glo Data N15000 -  93GB - 30 days": ["glo15000", 15000],
        "Glo Data N18000 -  119GB - 30 days": ["glo18000", 18000],
        "Glo Data N1500 -  4.1GB - 30 days": ["glo1500", 1500],
        "Glo Data N20000 -  138GB - 30 days": ["glo20000", 20000],
        "Glo Data (SME) N70 -  200MB - 14 days": ["glo-dg-70", 70],
        "Glo Data (SME) N320 - 1GB 30 days": ["glo-dg-320", 320],
        "Glo Data (SME) N960 - 3GB 30 days": ["glo-dg-960", 960],
        "Glo Data (SME) N3100 - 10GB - 30 Days": ["glo-dg-3100", 3100],
        "Glo Data (SME) N640 - 2GB 30 days": ["glo-dg-640", 640],
        "Glo Data (SME) N160 - 500MB 14 days": ["glo-dg-160-14", 160],
        "Glo Data (SME) N1600 - 5GB 30 days": ["glo-dg-1600", 1600],
        "45MB + 5MB Night N50 Oneoff": ["glo-daily-50", 50],
        "115Mb + 35MB Night N100 Oneoff": ["glo-daily-100", 100],
        "240MB + 110MB Night N200 Oneoff": ["glo-2days-200", 200],
        "800MB + 1GB Night N500 Oneoff": ["glo-2weeks-500", 500],
        "1.9GB + 2GB Night N1000 Oneoff": ["glo-monthly-1000", 1000],
        "3.5GB + 4GB Night N1500 Oneoff": ["glo-monthly-1500", 1500],
        "5.2GB + 4GB Night N2000 Oneoff": ["glo-monthly-2000", 2000],
        "6.8GB + 4GB Night N2500 Oneoff": ["glo-monthly-2500", 2500],
        "10GB +4GB Night N3000 Oneoff": ["glo-monthly-3000", 3000],
        "14GB + 4GB Night N4000 Oneoff": ["glo-monthly-4000", 4000],
        "20GB + 4GB Night N5000 Oneoff": ["glo-monthly-5000", 5000],
        "27.5GB + 2GB Night N8000 Oneoff": ["glo-monthly-8000", 8000],
        "46GB + 4GB N10000 Oneoff": ["glo-monthly-10000", 10000],
        "86GB + 7GB N15000 Oneoff": ["glo-monthly-15000", 15000],
        "109GB + 10Gb N18000 Oneoff": ["glo-monthly-18000", 18000],
        "126GB + 12GB N20000 Oneoff": ["glo-monthly-20000", 20000],
        "N300 1GB Special": ["glo-special-300", 300],
        "N500 2GB Special": ["glo-special-500", 500],
        "N1500 7GB Special": ["glo-special-1500", 1500],
        "N500 3GB Weekend": ["glo-weekend-500", 500],
        "N30000 225GB Glo Mega Oneoff": ["glo-mega-30000", 30000],
        "N36000 300GB Glo Mega Oneoff": ["glo-mega-36000", 36000],
        "N50000 425GB Glo Mega Oneoff": ["glo-mega-50000", 50000],
        "N60000 525GB Glo Mega Oneoff": ["glo-mega-60000", 60000],
        "N75000 675GB Glo Mega Oneoff": ["glo-mega-75000", 75000],
        "N100000 1TB Glo Mega Oneoff": ["glo-mega-75000", 100000],
        "Glo TV VOD 500 MB 3days Oneoff": ["glo-tv-150", 150],
        "Glo TV VOD 2GB 7days Oneoff": ["glo-tv-450", 450],
        "Glo TV VOD 6GB 30days Oneoff": ["glo-tv-1400", 1400],
        "Glo TV Lite 2GB Oneoff": ["glo-tv-900", 900],
        "Glo TV Max 6 GB Oneoff": ["glo-tv-3200", 3200],
        "WTF N25 100MB Oneoff": ["glo-wtf-25", 25],
        "WTF N50 200MB Oneoff": ["glo-wtf-50", 50],
        "WTF N100 500MB Oneoff": ["glo-wtf-100", 100],
        "Telegram N25 20MB Oneoff": ["glo-telegram-25", 25],
        "Telegram N50 50MB Oneoff": ["glo-telegram-50", 50],
        "Telegram N100 125MB Oneoff": ["glo-telegram-100", 100],
        "Instagram N25 20MB Oneoff": ["glo-insta-25", 25],
        "Instagram N50 50MB Oneoff": ["glo-insta-50", 50],
        "Instagram N100 125MB Oneoff": ["glo-insta-100", 100],
        "Tiktok N25 20MB Oneoff": ["glo-tiktok-25", 25],
        "Tiktok N50 50MB Oneoff": ["glo-tiktok-50", 50],
        "Tiktok N100 125MB Oneoff": ["glo-tiktok-100", 100],
        "Opera N25 25MB Oneoff": ["glo-opera-25", 25],
        "Opera N50 100MB Oneoff": ["glo-opera-50", 50],
        "Opera N100 300MB Oneoff": ["glo-opera-100", 100],
        "Youtube N50 100MB Oneoff": ["glo-youtube-50", 50],
        "Youtube N100 200MB Oneoff": ["glo-youtube-100", 100],
        "Youtube N250 500MB Oneoff": ["glo-youtube-250", 250],
        "Youtube N50 500MB Oneoff": ["glo-youtube-time-50", 50],
        "Youtube N130 1.5GB Oneoff": ["glo-youtube-time-130", 130],
        "Youtube N50 500MB Night Oneoff": ["glo-youtube-night-50", 50],
        "Youtube N200 2GB Night Oneoff": ["glo-youtube-night-200", 200],
        "Glo MyG N100 400 MB OneOff (Whatsapp, Instagram, Snapchat, Boomplay, Audiomac, GloTV, Tiktok)": [
            "glo-social-oneoff-100",
            100,
        ],
        "Glo MyG N300 1 GB OneOff (Whatsapp, Instagram, Snapchat, Boomplay, Audiomac, GloTV, Tiktok)": [
            "glo-social-oneoff-300",
            300,
        ],
        "Glo MyG N500 1.5 GB OneOff (Whatsapp, Instagram, Snapchat, Boomplay, Audiomac, GloTV, Tiktok)": [
            "glo-social-oneoff-500",
            500,
        ],
        "Glo MyG N1000 3.5 GB OneOff (Whatsapp, Instagram, Snapchat, Boomplay, Audiomac, GloTV, Tiktok)": [
            "glo-social-oneoff-1000",
            1000,
        ],
    };

    const etisalat_dict = {
        "9mobile Data - 100 Naira - 100MB - 1 day": ["eti-100", 100],
        "9mobile Data - 200 Naira - 650MB - 1 day": ["eti-200", 200],
        "9mobile Data - 500 Naira - 500MB - 30 Days": ["eti-500", 500],
        "9mobile Data - 1000 Naira - 1.5GB - 30 days": ["eti-1000", 1000],
        "9mobile Data - 2000 Naira - 4.5GB Data - 30 Days": ["eti-2000", 2000],
        "9mobile Data - 5000 Naira - 15GB Data - 30 Days": ["eti-5000", 5000],
        "9mobile Data - 10000 Naira - 40GB - 30 days": ["eti-10000", 10000],
        "9mobile Data - 15000 Naira - 75GB - 30 Days": ["eti-15000", 15000],
        "9mobile Data - 27,500 Naira - 30GB - 90 days": ["eti-27500", 27500],
        "9mobile Data - 55,000 Naira - 60GB - 180 days": ["eti-55000", 55000],
        "9mobile Data - 110,000 Naira - 120GB - 365 days": ["eti-110000", 110000],
        "9mobile 1GB + 100MB (1 day) - 300 Naira": ["eti-300", 300],
        "9mobile 11GB (7GB+ 4GB Night) - 2,500 Naira - 30 days": ["eti-2500", 2500],
        "9mobile 35 GB - 7,000 Naira - 30 days": ["eti-7000", 7000],
        "9mobile 125GB - 20,000 Naira - 30 days": ["eti-20000", 20000],
        "9mobile 4GB (2GB + 2GB Night) - 1000 Naira": ["eti-1000", 1000],
        "9mobile 7GB (6GB+1GB Night) - 7 days": ["eti-1500-7", 1500],
        "9mobile 200MB (100MB + 100MB night) + 300secs - 1 day": ["eti-150-1", 150],
    };

    // ----------------------------------------------------------------------
    // 2. DATA PROCESSING FUNCTION
    // ----------------------------------------------------------------------
    function showToast(msg, ms = 8200) {
    const t = document.getElementById("toast");
    if (!t) { alert(msg); return; }
    t.textContent = msg;
    t.hidden = false;
    t.style.opacity = 1;
    clearTimeout(t._hideTO);
    t._hideTO = setTimeout(() => { t.hidden = true; }, ms);
  }
    /**
     * Attempts to extract volume and validity from the plan name string.
     * @param {string} planName 
     * @returns {{volume: string, validity: string, type: string}}
     */
    function parsePlanDetails(planName) {
        // Default values
        let volume = "Bundle";
        let validity = "N/A";
        let type = "ExtraValue"; 

        // 1. Extract Volume (GB, MB, TB)
        const volumeMatch = planName.match(/(\d+(?:\.\d+)?)\s*(GB|MB|TB)/i);
        if (volumeMatch) {
            volume = volumeMatch[0].toUpperCase();
        } else {
            // For Voice/XtraTalk bundles, use the first NGN value followed by 'Bundle'
            const priceMatch = planName.match(/N(\d+,?\d*)/);
            if (priceMatch) {
                volume = `₦${priceMatch[1].replace(/,/g, '')} Bundle`;
            } else if (planName.includes("Voice")) {
                 volume = "Voice Bundle";
            }
        }
        
        // 2. Extract Validity (Days, Weeks, Months, Years, hrs)
        const validityMatch = planName.match(/(\d+)\s*(day|days|week|weeks|month|months|year|yrs|hrs)/i);
        
        if (validityMatch) {
            const num = parseInt(validityMatch[1]);
            const unit = validityMatch[2].toLowerCase();

            if (unit.startsWith('hr')) {
                 validity = `${num} Hrs`;
            } else if (unit.startsWith('day')) {
                validity = `${num} Day${num !== 1 ? 's' : ''}`;
                if (num === 1) type = 'Daily';
                else if (num <= 7) type = 'Daily'; // Keep 2-7 days as Daily for the plan tab grouping
            } else if (unit.startsWith('week')) {
                validity = `${num} Week${num !== 1 ? 's' : ''}`;
                type = 'Weekly';
            } else if (unit.startsWith('month')) {
                validity = `${num} Month${num !== 1 ? 's' : ''}`;
                type = 'Monthly';
            } else if (unit.startsWith('year') || unit.startsWith('yrs')) {
                validity = `${num} Year${num !== 1 ? 's' : ''}`;
                type = 'ExtraValue'; // Yearly plans go to ExtraValue
            }

        } else if (planName.toLowerCase().includes('weekly')) {
            validity = "7 Days";
            type = "Weekly";
        } else if (planName.toLowerCase().includes('monthly') || planName.toLowerCase().includes('30 days')) {
            validity = "30 Days";
            type = "Monthly";
        } else if (planName.toLowerCase().includes('weekend')) {
             validity = "Weekend";
             type = "ExtraValue";
        }

        // Catch edge cases for Daily/Monthly
        if (type === 'ExtraValue' && (validity.includes("Day") && parseInt(validity) <= 7)) {
            type = 'Daily';
        } else if (type === 'ExtraValue' && validity.includes("Day") && parseInt(validity) > 7) {
            type = 'Monthly';
        }

        return { volume, validity, type };
    }


    /**
     * Converts the raw Python dictionary data into the structured JS data format.
     * @param {Object} rawDict 
     * @returns {Object} Structured plans keyed by plan name
     */
    function processPlans(rawDict) {
        const processed = {};
        for (const name in rawDict) {
            // Note: rawDict[name] is an array: [id, price]
            const [id, price] = rawDict[name];
            const details = parsePlanDetails(name);
            processed[name] = {
                id: id,
                price: price,
                volume: details.volume,
                validity: details.validity,
                type: details.type,
                description: name // Use the full name as the description for simplicity
            };
        }
        return processed;
    }


    // 3. Structured DATA_PLANS
    const DATA_PLANS = {
        "MTN": processPlans(Mtn_dict),
        "Glo": processPlans(glo_dict),
        "Airtel": processPlans(airtel_dict),
        "9mobile": processPlans(etisalat_dict)
    };
    
    async function user(){
    const user = await getRequest(ENDPOINTS.user);
    const removeZero = user.phone.slice(4,)
    document.getElementById("recipient-number").value = "0" + String(removeZero);
    updateSummary();
    }
    user()
    // ----------------------------------------------------------------------
    // 4. DOM Elements and State Variables
    // ----------------------------------------------------------------------
    const networkTabsContainer = document.querySelector('.network-tabs');
    const planTypeTabsContainer = document.querySelector('.plan-tabs');
    const dataPlansGrid = document.querySelector('.data-plans-grid');
    const recipientNumberInput = document.getElementById('recipient-number');
    // Removed: const useMyNumberCheckbox = document.getElementById('use-my-number');
    const buyNowBtn = document.getElementById('buy-now-btn');

    // Summary Elements 
    const summaryNetwork = document.getElementById('summary-network');
    const summaryPlan = document.getElementById('summary-plan');
    const summaryRecipientId = document.getElementById('summary-recipient-id');

    // Removed: const myPhoneNumber = '08091234567'; 
    let currentNetwork = 'MTN';
    let currentPlanType = 'Daily';
    let currentRecipient = recipientNumberInput.value; 
    let currentPlan = { amount: 0, volume: 'N/A', id: '', name: 'N/A' };
    
    // ----------------------------------------------------------------------
    // 5. CORE LOGIC FUNCTIONS 
    // ----------------------------------------------------------------------

    /**
     * Dynamically generates and renders data plan cards with the simplified layout.
     */
    function renderDataPlans() {
        const plans = DATA_PLANS[currentNetwork];
        
        const filteredPlans = Object.keys(plans).filter(key => 
            plans[key].type === currentPlanType
        );

        if (filteredPlans.length === 0) {
            dataPlansGrid.innerHTML = `<p style="color:var(--text-muted-color); padding: 1rem;">No ${currentPlanType} plans available for ${currentNetwork}. Try another plan type.</p>`;
            updatePlanSummary(null);
            return;
        }

        let plansHTML = '';
        let firstPlan = null;

        filteredPlans.forEach((key, index) => {
            const plan = plans[key];
            const displayVolume = plan.volume;
            const displayDescription = key; // Use the full name for description

            // Always activate the first card in the list
            const isActive = index === 0; 
            if (isActive) {
                firstPlan = plan;
            }

            plansHTML += `
                <div class="data-plan-card ${isActive ? 'active' : ''}" 
                     data-plan-id="${plan.id}" 
                     data-price="${plan.price}" 
                     data-volume="${plan.volume}" 
                     data-name="${key}"
                     data-validity="${plan.validity}">
                    
                    <div class="plan-content">
                        <div class="plan-header">${displayVolume}</div>
                        <div class="plan-description">${displayDescription}</div>
                    </div>
                    
                    <div class="plan-info-bar">
                        <div class="price-column">Price<br>₦${plan.price.toLocaleString()}</div>
                        <div class="validity-column">Validity<br>${plan.validity}</div>
                    </div>
                </div>
            `;
        });

        dataPlansGrid.innerHTML = plansHTML;

        // Set the first plan as the active summary plan
        if (firstPlan) {
            currentPlan = {
                amount: firstPlan.price,
                volume: firstPlan.volume,
                id: firstPlan.id,
                name: filteredPlans[0]
            };
        } else {
            currentPlan = { amount: 0, volume: 'N/A', id: '', name: 'N/A' };
        }
        updateSummary();
    }

    /**
     * Updates the global currentPlan state and calls the summary update.
     */
    function updatePlanSummary(activeCard) {
        if (!activeCard) {
            currentPlan = { amount: 0, volume: 'N/A', id: '', name: 'N/A' };
        } else {
            const newAmount = activeCard.getAttribute('data-price');
            const newVolume = activeCard.getAttribute('data-volume');
            const newId = activeCard.getAttribute('data-plan-id');
            const newName = activeCard.getAttribute('data-name');
            
            currentPlan = {
                amount: parseFloat(newAmount),
                volume: newVolume,
                id: newId,
                name: newName
            };
        }
        updateSummary();
    }

    /**
     * Updates all displayed summary fields based on the current state.
     */
    function updateSummary() {
        summaryNetwork.textContent = currentNetwork;
        
        // Update Plan Summary
        summaryPlan.textContent = currentPlan.amount > 0 ? 
            `₦${currentPlan.amount.toLocaleString()} - ${currentPlan.volume}` : 
            "No Plan Selected";
        
        // Update Recipient State and Summary
        const recipientValue = recipientNumberInput.value.trim();
        const hasValidRecipient = recipientValue.length === 11; // Validation logic simplified to only check 11 digits

        if (hasValidRecipient) {
            currentRecipient = recipientValue;
        } else {
            // Set a placeholder or clear if invalid
            currentRecipient = recipientValue; 
        }
        summaryRecipientId.textContent = currentRecipient;

        // Enable/Disable main button 
        const isButtonEnabled = currentPlan.amount > 0 && hasValidRecipient;
        buyNowBtn.disabled = !isButtonEnabled;
    }

    // ----------------------------------------------------------------------
    // 6. EVENT HANDLERS 
    // ----------------------------------------------------------------------

    /**
     * Toggles the active class on buttons/cards and updates state.
     */
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

    // 7. Initialisation
    
    // 1. Main Button Click Handler (Simple Alert)
    /* buyNowBtn.addEventListener('click', () => {
        if (!buyNowBtn.disabled) {
            alert(`
                BUYING DATA CONFIRMATION:
                Network: ${currentNetwork}
                Plan: ${currentPlan.name} (₦${currentPlan.amount.toLocaleString()})
                Recipient: ${currentRecipient}

                (In a real app, this would initiate the payment process.)
            `);
        } else {
            alert('Please select a plan and enter a valid 11-digit recipient number to proceed.');
        }
    }); */
    
        // Buy Now Button Click Handler
    buyNowBtn.addEventListener('click', async() => {
        
        let valid = true;
        const user = await getRequest(ENDPOINTS.user)
        if (user.pin_is_set === false){
            window.parent.location.href = "../settings/pin/pin.html";
            return valid = false;
        }
        if (!buyNowBtn.disabled) {
            document.getElementById("pin-creation-step").style.display = 'block';
            document.getElementById("buy-data-form").style.opacity = '0.3';
        
            
        } else {
            showToast('Please select a network, enter a valid 11-digit number, and an amount of at least ₦50.');
        } 
    });
    
   function cancelPayment(){
        document.getElementById("pin-creation-step").style.display = 'none';
        document.getElementById("buy-data-form").style.opacity = '1';
        document.getElementById("pin").value = "";
    }
    // 2. Active State Management setup
    setupActiveToggle(networkTabsContainer, '.tab-button');
    setupActiveToggle(planTypeTabsContainer, '.tab-button');
    setupActiveToggle(dataPlansGrid, '.data-plan-card');

    // 3. Recipient Number Logic
    // Removed: useMyNumberCheckbox logic
    
        
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

    // 4. Initial Render and Summary Display
    renderDataPlans(); 
//});

        // Function to SHOW the loader
    function showLoader() {
                document.getElementById('loader').classList.remove('loader-hidden');
                document.getElementById('loader').classList.add('loader-visible');
            
                }

            // Function to HIDE the loader
    function hideLoader() {
            document.getElementById('loader').classList.remove('loader-visible');
            document.getElementById('loader').classList.add('loader-hidden');
                }
                
                
async function makePayment(){
        event.preventDefault()

        const pin =document.getElementById("pin").value.trim()
        const userPhoneNum = await getRequest(ENDPOINTS.user);
        const removeZero = userPhoneNum.phone.slice(4,)
         let  newNum = "0" + String(removeZero);
         const payload ={
                plan: currentPlan.name,
                billersCode: recipientNumberInput.value,
                phone_number: "08011111111", //newNum
                transaction_pin: pin
            }
        function paymentFeedback(buy_data){
        if(buy_data.state === false){
            showToast(buy_data.error)
        }
        else{
            console.log(buy_data)
            showToast(buy_data.response_description)
            cancelPayment()
      }
        }
        
        showLoader();
        console.log(payload);
        if(currentNetwork === "MTN"){
            
          const buy_data = await postRequest(ENDPOINTS.buy_mtn, payload)
          paymentFeedback(buy_data)
          hideLoader();
        
        }
        else if (currentNetwork === "Glo"){
            
          const buy_data = await postRequest(ENDPOINTS.buy_glo, payload)
          paymentFeedback(buy_data)
          hideLoader();

        }
        else if(currentNetwork === "9mobile"){
            
          const buy_data = await postRequest(ENDPOINTS.buy_etisalat, payload)
          paymentFeedback(buy_data)
          hideLoader();

        }
        else if (currentNetwork === "Airtel"){
            
          const buy_data = await postRequest(ENDPOINTS.buy_airtel, payload)
          paymentFeedback(buy_data)
          hideLoader();
        

        }
        else{
            console.log("Invalid Network")
            hideLoader();

        };
 
  }