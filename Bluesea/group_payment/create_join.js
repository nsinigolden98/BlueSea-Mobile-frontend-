// --- Modal/Message Box Functions (To replace alert()) ---
const messageBox = document.getElementById('message-box');
const messageTitle = document.getElementById('message-title');
const messageText = document.getElementById('message-text');

function showMessageBox(title, message) {
    messageTitle.textContent = title;
    messageText.textContent = message;
    messageBox.classList.add('show');
    messageBox.style.display = 'flex';
}

function closeMessageBox() {
    messageBox.classList.remove('show');
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 300); // Match transition speed
}

// --- Tab Switching Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Function to switch tabs
    function switchTab(targetId) {
        // Remove active class from all buttons and hide all panes
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        tabPanes.forEach(pane => {
            pane.style.display = 'none';
        });

        // Add active class to the selected button
        const activeButton = document.querySelector(`[data-target="${targetId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Show the target pane
        const activePane = document.getElementById(targetId);
        if (activePane) {
            activePane.style.display = 'block';
        }
    }

    // Attach click listeners to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            switchTab(targetId);
        });
    });

    // Initialize: Ensure the first tab is active on load
    switchTab('create-group');
});

// --- Form Submission Handlers (Placeholder Logic) ---

function handleCreateGroup() {
    const groupName = document.getElementById('group-name').value.trim();
    const targetAmount = document.getElementById('target-amount').value.trim();
    const paymentType = document.getElementById('payment-type').value;

    if (!groupName || !targetAmount || !paymentType) {
        showMessageBox("Validation Error", "Please fill out Group Name, Target Amount, and select a Payment Type before proceeding.");
        return;
    }

    // Simulate form data collection and submission
    const formData = {
        groupName: groupName,
        targetAmount: parseFloat(targetAmount),
        paymentType: paymentType,
        serviceProvider: document.getElementById('service-provider').value.trim(),
        selectPlan: document.getElementById('select-plan').value,
        inviteMembers: document.getElementById('invite-members').value
            .split(',')
            .map(s => s.trim())
            .filter(s => s)
    };

    console.log('Create Group Data:', formData);
    showMessageBox("Success!", `Group "${groupName}" has been successfully created (Simulated).`);
    // Reset form fields after success (optional)
    document.getElementById('create-group').querySelectorAll('.form-field').forEach(field => {
        field.value = '';
    });
}

function handleJoinGroup() {
    const groupCode = document.getElementById('group-code').value.trim();

    if (!groupCode) {
        showMessageBox("Validation Error", "Please enter a Group Code or Invitation Link.");
        return;
    }

    // Simulate join action
    console.log('Join Group Code:', groupCode);
    showMessageBox("Joining Group...", `Attempting to join group with code: ${groupCode}. This is a simulation.`);
    document.getElementById('group-code').value = '';
}
