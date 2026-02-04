/**
 * script.js
 * - Combined data + UI script
 * - Loads after DOM (defer in HTML)
 */
(function () {
  'use strict';

  /* ---------------------------
     Data helpers & storage
     --------------------------- */
  const STORAGE_KEY = 'gp_groups_v1';

  function loadGroups() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load groups', e);
      return [];
    }
  }

  function saveGroups(groups) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    } catch (e) {
      console.error('Failed to save groups', e);
    }
  }

  function generateId() {
    return 'grp-' + Math.random().toString(36).slice(2, 10);
  }

  function generateJoinCode() {
    return Math.random().toString(36).slice(2, 10).toUpperCase();
  }

  function formatNumber(n) {
    return Number(n).toLocaleString();
  }

  function distributeAmounts(targetAmount, count) {
    const base = Math.floor(targetAmount / count);
    const remainder = targetAmount - base * count;
    const parts = new Array(count).fill(base);
    for (let i = 0; i < remainder; i++) parts[i] = parts[i] + 1;
    return parts;
  }

  /* ---------------------------
     DOM refs
     --------------------------- */
  const q = id => document.getElementById(id);

  const openCreateBtn = q('open-create');
  const emptyCreateBtn = q('empty-create');
  const emptyJoinBtn = q('empty-join');
  const panel = q('create-panel');
  const closePanelBtn = q('close-panel');
  const tabCreate = q('tab-create');
  const tabJoin = q('tab-join');
  const createForm = q('create-form');
  const joinForm = q('join-form');
  const cancelCreate = q('cancel-create');
  const cancelJoin = q('cancel-join');
  const groupListEl = q('group-list');
  const dashboardSection = q('dashboard');
  const dynamicFields = q('dynamic-fields');
  const serviceTypeSelect = q('service-type');
  const targetAmountInput = q('target-amount');
  const joinCodeInput = q('join-code');
  const joinSubmit = q('join-submit');
  const createSubmit = q('create-submit');
  const groupDetailSection = q('group-detail');
  const backToDashboardBtn = q('back-to-dashboard');
  const detailName = q('detail-name');
  const detailService = q('detail-service');
  const detailOptions = q('detail-options');
  const detailPurpose = q('detail-purpose');
  const detailAmount = q('detail-amount');
  const detailJoinCode = q('detail-joincode');
  const paymentsList = q('payments-list');
  const sendReminderBtn = q('send-reminder');
  const yearEl = q('year');
  const emptyStateEl = q('empty-state');
  const toastEl = q('toast');

  /* ---------------------------
     App state
     --------------------------- */
  let groups = loadGroups() || [];

  /* ---------------------------
     Init
     --------------------------- */
  function init() {
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    renderDashboard();
    attachEventListeners();
  }

  /* ---------------------------
     Toast
     --------------------------- */
  /* function showToast(message, ms = 2500) {
    if (!toastEl) {
      alert(message);
      return;
    }
    toastEl.textContent = message;
    toastEl.hidden = false;
    toastEl.classList.remove('fade-out');
    toastEl.classList.add('fade-in');
    setTimeout(() => {
      toastEl.classList.remove('fade-in');
      toastEl.classList.add('fade-out');
      setTimeout(() => { toastEl.hidden = true; }, 220);
    }, ms);
  } 
 */
  /* ---------------------------
     Event listeners
     --------------------------- */
  function attachEventListeners() {
    if (openCreateBtn) openCreateBtn.addEventListener('click', () => openPanel('create'));
    if (emptyCreateBtn) emptyCreateBtn.addEventListener('click', () => openPanel('create'));
    if (emptyJoinBtn) emptyJoinBtn.addEventListener('click', () => openPanel('join'));
    if (closePanelBtn) closePanelBtn.addEventListener('click', closePanel);
    if (cancelCreate) cancelCreate.addEventListener('click', closePanel);
    if (cancelJoin) cancelJoin.addEventListener('click', closePanel);

    if (tabCreate) tabCreate.addEventListener('click', () => switchTab('create'));
    if (tabJoin) tabJoin.addEventListener('click', () => switchTab('join'));

    if (serviceTypeSelect) serviceTypeSelect.addEventListener('change', onServiceTypeChange);

    if (createForm) createForm.addEventListener('submit', onCreateSubmit);
    if (joinForm) joinForm.addEventListener('submit', onJoinSubmit);

    if (backToDashboardBtn) backToDashboardBtn.addEventListener('click', showDashboard);

    if (sendReminderBtn) {
      sendReminderBtn.addEventListener('click', () => {
        sendReminderBtn.disabled = true;
        const original = sendReminderBtn.textContent;
        sendReminderBtn.textContent = 'Reminders Sent';
        setTimeout(() => {
          sendReminderBtn.disabled = false;
          sendReminderBtn.textContent = original || 'Send AI Powered Reminders';
        }, 1500);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (panel && panel.getAttribute('aria-hidden') === 'false') closePanel();
        if (groupDetailSection && groupDetailSection.getAttribute('aria-hidden') === 'false') showDashboard();
      }
    });
  }

  /* ---------------------------
     Tabs & Panel
     --------------------------- */
  function openPanel(tab = 'create') {
    if (!panel) return;
    panel.setAttribute('aria-hidden', 'false');
    panel.style.display = 'flex';
    switchTab(tab);
    setTimeout(() => {
      const el = tab === 'create' ? q('group-name') : joinCodeInput;
      if (el) el.focus();
    }, 120);
  }

  function closePanel() {
    if (!panel) return;
    panel.setAttribute('aria-hidden', 'true');
    panel.style.display = 'none';
    if (createForm) createForm.reset();
    if (joinForm) joinForm.reset();
    if (dynamicFields) dynamicFields.innerHTML = '';
    switchTab('create');
  }

  function switchTab(tab) {
    const showForm = tab === 'create' ? createForm : joinForm;
    const hideForm = tab === 'create' ? joinForm : createForm;

    if (tabCreate && tabJoin) {
      if (tab === 'create') {
        tabCreate.classList.add('active');
        tabCreate.setAttribute('aria-selected', 'true');
        tabJoin.classList.remove('active');
        tabJoin.setAttribute('aria-selected', 'false');
      } else {
        tabJoin.classList.add('active');
        tabJoin.setAttribute('aria-selected', 'true');
        tabCreate.classList.remove('active');
        tabCreate.setAttribute('aria-selected', 'false');
      }
    }

    if (hideForm) {
      hideForm.classList.add('fade-out');
      setTimeout(() => {
        hideForm.classList.add('hidden');
        hideForm.classList.remove('fade-out');
      }, 180);
    }
    if (showForm) {
      showForm.classList.remove('hidden');
      showForm.classList.add('fade-in');
      setTimeout(() => showForm.classList.remove('fade-in'), 220);
    }
  }

  /* ---------------------------
     Dynamic fields config
     --------------------------- */
  const SERVICE_FIELDS = {
    airtime: [
      { id: 'airtime-network', 
        label: 'Select Network', 
        tag: 'select',
        required: true,
        options: 
        [{ value: 'mtn', label: 'MTN' }, { value: 'glo', label: 'GLO' }, { value: 'airtel', label: 'Airtel' }, { value: 'etisalat', label: '9mobile' }]
      },
      { id: 'airtime-amount', label: 'Airtime Amount (NGN)', tag: 'input', type: 'number', required: true, placeholder: 'Enter amount' },
       { id: 'sub-number', label: 'Phone Number', tag: 'input', type: 'number', required: true, placeholder: 'Enter Phone Number For the Group Payment' }
    ],
    data: [
      { id: 'data-network', label: 'Select Network', tag: 'select', required: true, options: [{value:'mtn',label:'MTN'},{value:'glo',label:'GLO'},{value:'airtel',label:'Airtel'},{value:'9mobile',label:'9mobile'}] },
      { id: 'data-plan', label: 'Select Data Plan', tag: 'select', required: true, options: [{ value: 'daily', label: 'Daily - 100MB' }, { value: 'weekly', label: 'Weekly - 1GB' }, { value: 'monthly', label: 'Monthly - 5GB' }] },
       { id: 'sub-number', label: 'Phone Number', tag: 'input', type: 'number', required: true, placeholder: 'Enter Phone Number For The Group Payment' }
    ],
    electricity: [
      {
        id: 'electricity-provider', label: 'Select Provider', tag: 'select', required: true, options: [{ value: 'ikeja-electric', label: 'Ikeja Electric (EKEDC)' }, { value: 'eko-electric', label: 'Eko Electric (EKEDC)' },
        { value: 'kano-electric', label: 'Kano Electric (KEDCO)' },
        { value: 'portharcourt-electric', label: 'Port-harcourt Electric (PHED)' },
        { value: 'jos-electric', label: 'Jos Electric (JED)' },
        { value: 'ibadan-electric', label: 'Ibadan Electric (IBEDC)' },
        { value: 'kaduna-electric', label: 'Kaduna Electric (KAEDCO)' },
        { value: 'abuja-electric', label: 'Abuja Electric (AEDC)' },
        { value: 'enugu-electric', label: 'Enugu Electric (EEDC)' },
        { value: 'aba-electric', label: 'Aba Electric (ABA)' },
        { value: 'yola-electric', label: 'Yola Electric (YEDC)' }
        
        ]
      },
      { id: 'meter-type', label: 'Meter Type', tag: 'select', required: true, options: [{value:'prepaid',label:'Prepaid'},{value:'postpaid',label:'Postpaid'}] },
      { id: 'sub-number', label: 'Meter Number', tag: 'input', required: true, placeholder: 'Enter meter number' }
    ],
    subscriptions: [
      { id: 'subscription-provider', label: 'Select Provider', tag: 'select', required: true, options: [{value:'showmax',label:'ShowMax'},{value:'dstv',label:'DSTV'},{value:'gotv',label:'GOTV'}] },
      { id: 'subscription-plan', label: 'Select Plan', tag: 'select', required: true, options: [{ value: 'basic', label: 'Basic' }, { value: 'standard', label: 'Standard' }, { value: 'premium', label: 'Premium' }] },
       { id: 'sub-number', label: 'IUC Number', tag: 'input', type: 'number', required: true, placeholder: 'Enter your IUC number' }
    ],
    // betting: [
    //   { id: 'betting-platform', label: 'Select Platform', tag: 'select', required: true, options: [{value:'bet9ja',label:'Bet9ja'},{value:'sportybet',label:'SportyBet'},{value:'betking',label:'BetKing'}] },
    //   { id: 'account-id', label: 'Account ID', tag: 'input', required: true, placeholder: 'Enter account ID' },
    //   { id: 'wallet-type', label: 'Wallet Type', tag: 'select', required: true, options: [{value:'main',label:'Main Wallet'},{value:'bonus',label:'Bonus Wallet'}] }
    // ]
  };

  function onServiceTypeChange(e) {
    if (!dynamicFields) return;
    const type = e.target.value;
    dynamicFields.innerHTML = '';
    if (!type || !SERVICE_FIELDS[type]) return;

    SERVICE_FIELDS[type].forEach(field => {
      const wrapper = document.createElement('div');
      wrapper.className = 'field';
      const lab = document.createElement('label');
      lab.className = 'form-label';
      lab.setAttribute('for', field.id);
      lab.textContent = field.label;
      wrapper.appendChild(lab);

      let control;
      if (field.tag === 'select') {
        control = document.createElement('select');
        control.className = 'form-select';
        control.id = field.id;
        control.name = field.id;
        const empty = document.createElement('option');
        empty.value = '';
        empty.textContent = 'Select';
        control.appendChild(empty);
        field.options.forEach(opt => {
          const o = document.createElement('option');
          o.value = opt.value;
          o.textContent = opt.label;
          control.appendChild(o);
        });
      } else if (field.tag === 'textarea') {
        control = document.createElement('textarea');
        control.className = 'form-textarea';
        control.id = field.id;
        control.name = field.id;
        control.placeholder = field.placeholder || '';
      } else {
        control = document.createElement('input');
        control.className = 'form-input';
        control.id = field.id;
        control.name = field.id;
        control.type = field.type || 'text';
        control.placeholder = field.placeholder || '';
      }

      if (field.required) control.setAttribute('data-required', 'true');
      wrapper.appendChild(control);
      dynamicFields.appendChild(wrapper);
    });
  }

  /* ---------------------------
     Create group
     --------------------------- */
  
  
 async function onCreateSubmit(e) {
    e.preventDefault();
    if (!createForm) return;

    const nameEl = q('group-name');
    const subNumEl = q('subscription-number');
    const name = nameEl ? nameEl.value.trim() : '';
   const subNum = subNumEl ?  subNumEl.value : '';
    const serviceType = serviceTypeSelect ? serviceTypeSelect.value : '';
    const targetAmount = targetAmountInput ? Math.floor(Number(targetAmountInput.value)) : 0;
    const purpose = q('group-purpose') ? q('group-purpose').value.trim() : '';
    const invite = q('invite-members') ? q('invite-members').value.trim() : '';

    if (!name) {
      if (nameEl) nameEl.focus();
      showToast('Please enter a group name.');
      return;
    }
    if (!serviceType) {
      if (serviceTypeSelect) serviceTypeSelect.focus();
      showToast('Please select a service type.');
      return;
    }
    if (!targetAmount || targetAmount <= 0) {
      if (targetAmountInput) targetAmountInput.focus();
      showToast('Please enter a valid target amount.');
      return;
    }
    if (!subNum) {
      if (subNumEl) subNumEl.focus();
      showToast('Please enter subscription or phone number type.');
      return;
    }
   const dynamicInputs = dynamicFields ? Array.from(dynamicFields.querySelectorAll('select, input, textarea')) : [];
    for (const el of dynamicInputs) {
      if (el.dataset.required === 'true') {
        const val = (el.value || '').toString().trim();
        if (!val) {
          el.focus();
          showToast(`Please complete: ${el.previousElementSibling ? el.previousElementSibling.textContent : el.id}`);
          return;
        }
      } 
    }

    const options = {};
    dynamicInputs.forEach(el => { options[el.id] = el.value; });

    // const inviteParts = invite ? invite.split(',').map(s => s.trim()).filter(Boolean) : [];
    // const membersCount = inviteParts.length > 0 ? inviteParts.length : 1;
    // const parts = distributeAmounts(targetAmount, membersCount);

    // const members = [];
    // if (inviteParts.length > 0) {
    //   inviteParts.forEach((p, idx) => {
    //     members.push({
    //       id: `m-${idx}-${Date.now()}`,
    //       name: p,
    //       amount: parts[idx],
    //       status: idx === 0 ? 'paid' : 'pending'
    //     });
    //   });
    // } else {
    //   members.push({
    //     id: `m-owner-${Date.now()}`,
    //     name: 'You',
    //     amount: parts[0],
    //     status: 'pending'
    //   });
    // }

    // const id = generateId();
   //  const joinCode = generateJoinCode();
    const group = {
      name,
      description: purpose,
      service_type: serviceType,
      plan:options,
      sub_number: subNum,
      target_amount: targetAmount,
      invite_members: invite,
      transaction_pin: pin,
    };

    groups.push(group);
    saveGroups(groups);
    let  create_group = await postRequest(ENDPOINTS.create_group,group)

    closePanel();
    renderDashboard();
    showToast('Group created successfully.');

    setTimeout(() => {
      const el = document.querySelector(`[data-id="${id}"]`);
      if (el) el.focus();
    }, 120);
  }

  /* ---------------------------
     Join group
     --------------------------- */
  function onJoinSubmit(e) {
    e.preventDefault();
    if (!joinForm) return;
    const code = joinCodeInput ? joinCodeInput.value.trim() : '';
    if (!code) {
      if (joinCodeInput) joinCodeInput.focus();
      showToast('Please enter a group code or invitation link.');
      return;
    }

    const found = groups.find(g => g.joinCode && (g.joinCode.toLowerCase() === code.toLowerCase() || g.id === code));
    if (found) {
      const newCount = found.members.length + 1;
      const parts = distributeAmounts(found.targetAmount, newCount);
      found.members.forEach((m, idx) => { m.amount = parts[idx]; });
      found.members.push({
        id: `m-join-${Date.now()}`,
        name: 'New Member',
        amount: parts[parts.length - 1],
        status: 'pending'
      });
      saveGroups(groups);
      closePanel();
      renderDashboard();
      showToast('Joined group successfully.');
    } else {
      showToast('Group not found. Try a valid join code.');
    }
  }

  /* ---------------------------
     Dashboard rendering
     --------------------------- */
  function renderDashboard() {
    if (!groupListEl || !emptyStateEl) return;

    if (!groups || groups.length === 0) {
      emptyStateEl.classList.remove('hidden');
      groupListEl.innerHTML = '';
      groupListEl.classList.add('hidden');
      return;
    }

    emptyStateEl.classList.add('hidden');
    groupListEl.classList.remove('hidden');
    groupListEl.innerHTML = '';

    groups.slice().reverse().forEach(group => {
      const li = document.createElement('li');
      li.className = 'group-card';
      li.tabIndex = 0;
      li.setAttribute('role', 'button');
      li.setAttribute('data-id', group.id);
      li.setAttribute('aria-label', `Open group ${group.name}`);
      li.innerHTML = `
        <div class="card-top">
          <div>
            <div style="font-weight:700">${escapeHtml(group.name)}</div>
            <div class="small muted">${escapeHtml(prettyService(group.serviceType))}</div>
          </div>
          <div style="text-align:right">
            <div class="small muted">Target</div>
            <div style="font-weight:700">NGN ${formatNumber(group.targetAmount)}</div>
          </div>
        </div>
        <div class="progress" aria-hidden="true"><i style="width:${calcProgress(group)}%"></i></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <div class="small muted">Members: ${group.members.length}</div>
          <div class="small muted">Code: ${group.joinCode.slice(0,8)}</div>
        </div>
      `;

      li.addEventListener('click', () => openGroupDetail(group.id));
      li.addEventListener('keydown', (e) => {
        const key = e.key;
        if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
          e.preventDefault();
          openGroupDetail(group.id);
        }
      });

      groupListEl.appendChild(li);
    });
  }

  /* ---------------------------
     Group detail view
     --------------------------- */
  function openGroupDetail(id) {
    const group = groups.find(g => g.id === id);
    if (!group || !groupDetailSection) return;

    if (detailName) detailName.textContent = group.name;
    if (detailService) detailService.textContent = prettyService(group.serviceType);
    if (detailPurpose) detailPurpose.textContent = group.purpose || '-';
    if (detailAmount) detailAmount.textContent = `NGN ${formatNumber(group.targetAmount)}`;
    if (detailJoinCode) detailJoinCode.textContent = group.joinCode || '-';

    const opts = Object.entries(group.options || {}).filter(([k, v]) => v).map(([k, v]) => `${k.replace(/-/g,' ')}: ${v}`);
    if (detailOptions) detailOptions.textContent = opts.length ? opts.join(' • ') : '-';

    if (paymentsList) {
      paymentsList.innerHTML = '';
      group.members.forEach(m => {
        const div = document.createElement('div');
        div.className = 'payment-item';
        div.innerHTML = `
          <div>
            <div style="font-weight:700">${escapeHtml(m.name)}</div>
            <div class="small muted">NGN ${formatNumber(m.amount)}</div>
          </div>
          <div class="payment-status">
            ${m.status === 'paid' ? paidIcon() : pendingIcon()}
            <div class="${m.status === 'paid' ? 'status-paid' : 'status-pending'}">${m.status.toUpperCase()}</div>
          </div>
        `;
        paymentsList.appendChild(div);
      });
    }

    if (dashboardSection) dashboardSection.style.display = 'none';
    groupDetailSection.setAttribute('aria-hidden', 'false');
    groupDetailSection.style.display = 'block';
    setTimeout(() => { if (backToDashboardBtn) backToDashboardBtn.focus(); }, 80);
  }

  function showDashboard() {
    if (!groupDetailSection) return;
    groupDetailSection.setAttribute('aria-hidden', 'true');
    groupDetailSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = '';
    renderDashboard();
  }

  /* ---------------------------
     Utilities
     --------------------------- */
  function calcProgress(group) {
    const paid = group.members.reduce((acc, m) => acc + (m.status === 'paid' ? Number(m.amount) : 0), 0);
    const pct = Math.min(100, Math.round((paid / group.targetAmount) * 100));
    return isFinite(pct) ? pct : 0;
  }

  function prettyService(key) {
    const map = {
      airtime: 'Airtime',
      data: 'Data',
      electricity: 'Electricity',
      subscriptions: 'Subscriptions',
      betting: 'Betting'
    };
    return map[key] || key;
  }

  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str).replace(/[&<>"']/g, function (m) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m];
    });
  }

  function getCssVar(name, fallback) {
  try { 
    const v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return v ? v.trim() : fallback;
  } catch (e) { 
    return fallback;
  }
  } 
  
  function paidIcon() { 
    const stroke = getCssVar('--color-success', '#16a34a'); 
    return `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false"> 
    <path d="M20 6L9 17l-5-5" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/> 
    </svg>`;
  } 
  
  function pendingIcon() {
    const stroke = getCssVar('--color-warning', '#f59e0b'); 
    return `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false"> 
    <path d="M12 6v6l4 2" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/> 
    <circle cx="12" cy="12" r="9" stroke="${stroke}" stroke-width="1.2" fill="none"/> 
    </svg>`;
  }
  
  /* --------------------------- 
   Boot 
  --------------------------- */ 
  init(); 
})();

// async function joinGroup() {
//   let payload = {
//     code
//   }
//   let response = await postRequest(ENDPOINTS.join_group, payload);
  
//  }  

async function getGroup(){
    
    let groups = await getRequest(ENDPOINTS.my_group);
    if(groups.count > 0){
 
      document.getElementById("dashboard-inner").style.display = "block"
      
    }else{
      document.getElementById("add-btn").style.display = "none"   
    }
    
}
getGroup()
function hideCreateGroup(){
      document.getElementById("create-form").style.display ="none"
    document.getElementById("join-form").style.display = "block"
      
}
function hideJoinGroup(){
      document.getElementById("create-form").style.display ="block"
    document.getElementById("join-form").style.display ="none"
      
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