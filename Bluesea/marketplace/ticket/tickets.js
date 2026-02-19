(function(){
  const listColumn = document.getElementById('listColumn');
  const previewColumn = document.getElementById('previewColumn');
  const emptyState = document.getElementById('emptyState');
  const carousel = document.getElementById('categoryCarousel');

  let activeStatus = 'all';
  let ticketsData = [];
  let statsData = {};

  async function loadTickets(){
    try{
      const response = await getRequest(ENDPOINTS.mytickets);
      if(response.state && response.tickets){
        statsData = response.stats || {};
        return response.tickets;
      }
      return [];
    }catch(err){
      return [];
    }
  }

  async function loadTicketDetail(ticketId){
    try{
      const response = await getRequest(ENDPOINTS.tickets + ticketId + '/');
      if(response.state && response.ticket){
        return response.ticket;
      }
      return null;
    }catch(err){
      return null;
    }
  }

  function formatDate(dateStr){
    if(!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  }

  function buildCard(ticket, index){
    const card = document.createElement('div');
    card.className = 'ticket-card';
    card.dataset.ticketId = ticket.id;

    const statusClass = ticket.status || 'upcoming';
    const eventBanner = ticket.event_banner 
      ? API_BASE + ticket.event_banner 
      : 'https://picsum.photos/800/400?blur=2';

    card.innerHTML = `
      <div class="qr-preview">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${ticket.id}" alt="QR Code">
      </div>
      <div class="meta">
        <div class="event-name">${ticket.event_title || 'Unknown Event'}</div>
        <div class="meta-row">
          <span>${ticket.event_location || 'N/A'}</span>
          <span class="status ${statusClass}">${statusClass}</span>
        </div>
        <div class="meta-row">${ticket.ticket_type_name || 'Free Entry'} - ${ticket.vendor_name || 'N/A'}</div>
      </div>
    `;

    card.addEventListener('click', () => selectTicket(ticket, card, index));
    return card;
  }

  async function selectTicket(ticket, card, index){
    document.querySelectorAll('.ticket-card').forEach(c => {
      c.classList.toggle('faded', c !== card);
    });

    showLoader();
    const detail = await loadTicketDetail(ticket.id);
    hideLoader();

    if(!detail){
      showToast('Failed to load ticket details');
      return;
    }

    if(window.innerWidth >= 900){
      renderPreview(detail, index);
    }else{
      document.querySelectorAll('.ticket-expanded').forEach(e => e.remove());
      card.insertAdjacentHTML('afterend', expandedHTML(detail, index));
    }
  }

  function expandedHTML(ticket, index){
    const eventBanner = ticket.event?.event_banner 
      ? API_BASE + ticket.event.event_banner 
      : 'https://picsum.photos/800/400?blur=2';
    
    const qrCodeUrl = ticket.qr_code_url 
      ? API_BASE + ticket.qr_code_url 
      : `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${ticket.id}`;

    return `
      <div class="ticket-expanded">
        <div class="expanded-banner" style="background-image: url('${eventBanner}')">
          <div class="banner-overlay"></div>
          <div class="banner-content">
            <h3>${ticket.event?.event_title || 'Unknown Event'}</h3>
            <small>Hosted by ${ticket.event?.hosted_by || 'N/A'}</small>
          </div>
        </div>
        <div class="expanded-body">
          <div class="qr-large">
            <img src="${qrCodeUrl}" alt="QR Code">
          </div>

          <div class="detail"><strong>Owner</strong>${ticket.owner_name || 'N/A'}</div>
          <div class="detail"><strong>Email</strong>${ticket.owner_email || 'N/A'}</div>
          <div class="detail"><strong>Date & Time</strong>${formatDate(ticket.event?.event_date)}</div>
          <div class="detail"><strong>Venue</strong>${ticket.event?.event_location || 'N/A'}</div>
          <div class="detail"><strong>Ticket Type</strong>${ticket.ticket_type?.name || 'Free Entry'}</div>
          <div class="detail"><strong>Price</strong>${ticket.event?.is_free ? 'Free' : '₦' + (ticket.ticket_type?.price || '0.00')}</div>
          <div class="detail"><strong>Status</strong><span class="status ${ticket.status}">${ticket.status}</span></div>
          <div class="detail"><strong>Ticket ID</strong>${ticket.id}</div>

          <div class="actions">
            <button class="primary-btn" onclick="downloadTicket('${ticket.id}')">Download</button>
            ${ticket.can_transfer?.allowed ? `<button class="ghost-btn" onclick="showTransferModal('${ticket.id}')">Transfer</button>` : ''}
            ${ticket.can_cancel?.allowed ? `<button class="ghost-btn" onclick="showCancelModal('${ticket.id}')">Cancel</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderPreview(ticket, index){
    const eventBanner = ticket.event?.event_banner 
      ? API_BASE + ticket.event.event_banner 
      : 'https://picsum.photos/800/400?blur=2';
    
    const qrCodeUrl = ticket.qr_code_url 
      ? API_BASE + ticket.qr_code_url 
      : `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${ticket.id}`;

    previewColumn.innerHTML = `
      <div class="preview-banner" style="background-image: url('${eventBanner}')">
        <div class="banner-overlay"></div>
        <div class="banner-content">
          <h3>${ticket.event?.event_title || 'Unknown Event'}</h3>
          <small>Hosted by ${ticket.event?.hosted_by || 'N/A'}</small>
        </div>
      </div>

      <img width="240" src="${qrCodeUrl}" alt="QR Code">

      <p><strong>Owner:</strong> ${ticket.owner_name || 'N/A'}</p>
      <p><strong>Email:</strong> ${ticket.owner_email || 'N/A'}</p>
      <p><strong>Date & Time:</strong> ${formatDate(ticket.event?.event_date)}</p>
      <p><strong>Venue:</strong> ${ticket.event?.event_location || 'N/A'}</p>
      <p><strong>Ticket Type:</strong> ${ticket.ticket_type?.name || 'Free Entry'}</p>
      <p><strong>Price:</strong> ${ticket.event?.is_free ? 'Free' : '₦' + (ticket.ticket_type?.price || '0.00')}</p>
      <p><strong>Status:</strong> <span class="status ${ticket.status}">${ticket.status}</span></p>
      <p><strong>Ticket ID:</strong> ${ticket.id}</p>

      <div class="actions">
        <button class="primary-btn" onclick="downloadTicket('${ticket.id}')">Download</button>
        ${ticket.can_transfer?.allowed ? `<button class="ghost-btn" onclick="showTransferModal('${ticket.id}')">Transfer</button>` : ''}
        ${ticket.can_cancel?.allowed ? `<button class="ghost-btn" onclick="showCancelModal('${ticket.id}')">Cancel</button>` : ''}
      </div>
    `;
  }

  function updateStatsUI(){
    const buttons = carousel.querySelectorAll('button');
    buttons.forEach(btn => {
      const status = btn.dataset.status;
      const count = statsData[status] || 0;
      const label = btn.textContent.split('(')[0].trim();
      btn.textContent = count > 0 ? `${label} (${count})` : label;
    });
  }

  async function render(){
    showLoader();
    ticketsData = await loadTickets();
    hideLoader();

    listColumn.innerHTML = '';

    const filteredTickets = ticketsData.filter(t => {
      return activeStatus === 'all' || t.status === activeStatus;
    });

    if(!filteredTickets.length){
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;
    updateStatsUI();

    filteredTickets.forEach((t, i) => {
      listColumn.appendChild(buildCard(t, i));
    });

    if(window.innerWidth >= 900 && filteredTickets[0]){
      const firstCard = listColumn.querySelector('.ticket-card');
      if(firstCard){
        firstCard.click();
      }
    }
  }

  carousel.addEventListener('click', (e) => {
    if(e.target.tagName !== 'BUTTON') return;
    carousel.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    activeStatus = e.target.dataset.status;
    render();
  });

  document.addEventListener('click', (e) => {
    if(!e.target.closest('.ticket-card') && !e.target.closest('.ticket-expanded') && !e.target.closest('.preview-column')){
      document.querySelectorAll('.ticket-expanded').forEach(el => el.remove());
      document.querySelectorAll('.ticket-card').forEach(c => c.classList.remove('faded'));
    }
  });

  render();
})();

async function downloadTicket(ticketId){
  showToast('Download feature coming soon');
}

function showTransferModal(ticketId){
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Transfer Ticket</h3>
      <p>Enter the recipient's details:</p>
      <input type="email" id="transferEmail" placeholder="Recipient Email" required>
      <input type="text" id="transferName" placeholder="Recipient Name" required>
      <div class="modal-actions">
        <button class="ghost-btn" onclick="closeModal()">Cancel</button>
        <button class="primary-btn" onclick="transferTicket('${ticketId}')">Transfer</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function showCancelModal(ticketId){
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Cancel Ticket</h3>
      <p>Are you sure you want to cancel this ticket?</p>
      <input type="text" id="cancelReason" placeholder="Reason for cancellation" required>
      <div class="modal-actions">
        <button class="ghost-btn" onclick="closeModal()">No, Keep It</button>
        <button class="primary-btn" onclick="cancelTicket('${ticketId}')">Yes, Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeModal(){
  document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
}

async function transferTicket(ticketId){
  const email = document.getElementById('transferEmail').value.trim();
  const name = document.getElementById('transferName').value.trim();

  if(!email || !name){
    showToast('Please fill all fields');
    return;
  }

  if(!validateEmail(email)){
    showToast('Please enter a valid email');
    return;
  }

  showLoader();
  closeModal();

  try{
    const response = await postRequest(ENDPOINTS.tickets + ticketId + '/transfer/', {
      recipient_email: email,
      recipient_name: name
    });

    hideLoader();

    if(response.success || response.state){
      showSuccess();
      showToast(response.message || 'Ticket transferred successfully');
      setTimeout(() => location.reload(), 2000);
    }else{
      showToast(response.error || 'Transfer failed');
    }
  }catch(err){
    hideLoader();
    showToast('An error occurred');
  }
}

async function cancelTicket(ticketId){
  const reason = document.getElementById('cancelReason').value.trim();

  if(!reason){
    showToast('Please provide a reason');
    return;
  }

  showLoader();
  closeModal();

  try{
    const response = await postRequest(ENDPOINTS.tickets + ticketId + '/cancel/', {
      reason: reason
    });

    hideLoader();

    if(response.success || response.state){
      showSuccess();
      showToast(response.message || 'Ticket canceled successfully');
      setTimeout(() => location.reload(), 2000);
    }else{
      showToast(response.error || 'Cancellation failed');
    }
  }catch(err){
    hideLoader();
    showToast('An error occurred');
  }
}
