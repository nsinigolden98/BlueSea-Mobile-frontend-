(function(){
  const STORAGE_KEY = 'bsm_tickets';

  const listColumn = document.getElementById('listColumn');
  const previewColumn = document.getElementById('previewColumn');
  const emptyState = document.getElementById('emptyState');

  function loadTickets(){
    try{
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }catch{
      return [];
    }
  }

  function ticketStatus(ticket){
    const now = Date.now();
    const eventTime = new Date(ticket.dateTime).getTime();
    if(ticket.canceled) return 'canceled';
    if(ticket.transferred) return 'transferred';
    if(eventTime < now) return 'expired';
    return 'upcoming';
  }

  function buildCard(ticket,index){
    const card = document.createElement('div');
    card.className='ticket-card';

    card.innerHTML=`
      <div class="qr-preview">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${ticket.ticketId}">
      </div>
      <div class="meta">
        <div class="event-name">${ticket.eventName}</div>
        <div class="meta-row">
          <span>${ticket.venue}</span>
          <span class="status ${ticketStatus(ticket)}">${ticketStatus(ticket)}</span>
        </div>
        <div class="meta-row">Buyer #${index+1}</div>
      </div>
    `;

    card.addEventListener('click',()=>handleSelect(ticket,card,index));
    return card;
  }

  function handleSelect(ticket,card,index){
    document.querySelectorAll('.ticket-card').forEach(c=>{
      c.classList.toggle('faded',c!==card);
    });

    if(window.innerWidth<900){
      document.querySelectorAll('.ticket-expanded').forEach(e=>e.remove());
      card.insertAdjacentHTML('afterend',expandedHTML(ticket,index));
    }else{
      renderPreview(ticket,index);
    }
  }

  function expandedHTML(ticket,index){
    return `
      <div class="ticket-expanded">
        <div class="expanded-banner">
          <h3>${ticket.eventName}</h3>
          <small>Buyer #${index+1}</small>
        </div>
        <div class="expanded-body">
          <div class="qr-large">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${ticket.ticketId}">
          </div>
          <div class="detail"><strong>When</strong>${ticket.dateTime}</div>
          <div class="detail"><strong>Venue</strong>${ticket.venue}</div>
          <div class="detail"><strong>Status</strong>${ticketStatus(ticket)}</div>
          <div class="actions">
            <button class="primary-btn">Download</button>
            <button class="ghost-btn">Email</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderPreview(ticket,index){
    previewColumn.innerHTML=`
      <h3>${ticket.eventName}</h3>
      <p><strong>Buyer #${index+1}</strong></p>
      <img width="260" src="https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${ticket.ticketId}">
      <p><strong>When:</strong> ${ticket.dateTime}</p>
      <p><strong>Venue:</strong> ${ticket.venue}</p>
      <p><strong>Status:</strong> ${ticketStatus(ticket)}</p>
    `;
  }

  function render(){
    const tickets = loadTickets();
    listColumn.innerHTML='';
    if(!tickets.length){
      emptyState.hidden=false;
      return;
    }
    tickets.forEach((t,i)=>listColumn.appendChild(buildCard(t,i)));
  }

  document.addEventListener('click',(e)=>{
    if(!e.target.closest('.ticket-card') && !e.target.closest('.ticket-expanded')){
      document.querySelectorAll('.ticket-expanded').forEach(e=>e.remove());
      document.querySelectorAll('.ticket-card').forEach(c=>c.classList.remove('faded'));
    }
  });

  render();
})();

(function(){
  const STORAGE_KEY = 'bsm_tickets';

  const listColumn = document.getElementById('listColumn');
  const previewColumn = document.getElementById('previewColumn');
  const emptyState = document.getElementById('emptyState');
  const carousel = document.getElementById('categoryCarousel');

  let activeStatus = 'all';

  function loadTickets(){
    let data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(!Array.isArray(data)){
      // DEMO FALLBACK (prevents undefined)
      data = [
        {
          ticketId:'DW-001',
          eventName:'DripWify Launch Party',
          hostName:'Blue Sea Mobile',
          dateTime:'2026-02-14 6:00 PM',
          venue:'Eko Convention Center',
          venueAddress:'Victoria Island, Lagos',
          ticketType:'VIP',
          purchasedAt:'2026-01-20',
          status:'upcoming'
        }
      ];
    }
    return data;
  }

  function getStatus(ticket){
    return ticket.status || 'upcoming';
  }

  function buildCard(ticket,index){
    const card = document.createElement('div');
    card.className='ticket-card';

    card.innerHTML=`
      <div class="qr-preview">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=${ticket.ticketId}">
      </div>
      <div class="meta">
        <div class="event-name">${ticket.eventName}</div>
        <div class="meta-row">
          <span>${ticket.venue}</span>
          <span class="status ${getStatus(ticket)}">${getStatus(ticket)}</span>
        </div>
        <div class="meta-row">Buyer #${index + 1}</div>
      </div>
    `;

    card.onclick=()=>{
      selectTicket(ticket,index,card);
    };

    return card;
  }

  function selectTicket(ticket,index,card){
    document.querySelectorAll('.ticket-card').forEach(c=>{
      c.classList.toggle('faded',c!==card);
    });

    if(window.innerWidth >= 900){
      renderPreview(ticket,index);
    }else{
      document.querySelectorAll('.ticket-expanded').forEach(e=>e.remove());
      card.insertAdjacentHTML('afterend',expandedHTML(ticket,index));
    }
  }

  function expandedHTML(ticket,index){
    return `
      <div class="ticket-expanded">
        <div class="expanded-banner">
          <div class="banner-overlay"></div>
          <div class="banner-content">
            <h3>${ticket.eventName}</h3>
            <small>Hosted by ${ticket.hostName}</small>
          </div>
        </div>
        <div class="expanded-body">
          <div class="qr-large">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${ticket.ticketId}">
          </div>

          <div class="detail"><strong>Buyer Position</strong>#${index+1}</div>
          <div class="detail"><strong>Date & Time</strong>${ticket.dateTime}</div>
          <div class="detail"><strong>Venue</strong>${ticket.venue}</div>
          <div class="detail"><strong>Address</strong>${ticket.venueAddress}</div>
          <div class="detail"><strong>Ticket Type</strong>${ticket.ticketType}</div>
          <div class="detail"><strong>Purchased</strong>${ticket.purchasedAt}</div>
          <div class="detail"><strong>Ticket ID</strong>${ticket.ticketId}</div>

          <div class="actions">
            <button class="primary-btn">Download</button>
            <button class="ghost-btn">Email</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderPreview(ticket,index){
    previewColumn.innerHTML=`
      <div class="preview-banner">
        <div class="banner-overlay"></div>
        <div class="banner-content">
          <h3>${ticket.eventName}</h3>
          <small>Hosted by ${ticket.hostName}</small>
        </div>
      </div>

      <img width="240" src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${ticket.ticketId}">

      <p><strong>Buyer Position:</strong> #${index+1}</p>
      <p><strong>Date & Time:</strong> ${ticket.dateTime}</p>
      <p><strong>Venue:</strong> ${ticket.venue}</p>
      <p><strong>Address:</strong> ${ticket.venueAddress}</p>
      <p><strong>Ticket Type:</strong> ${ticket.ticketType}</p>
      <p><strong>Purchased:</strong> ${ticket.purchasedAt}</p>
      <p><strong>Status:</strong> ${getStatus(ticket)}</p>
      <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>

      <div class="actions">
        <button class="primary-btn">Download</button>
        <button class="ghost-btn">Email</button>
      </div>
    `;
  }

  function render(){
    const tickets = loadTickets().filter(t=>{
      return activeStatus === 'all' || getStatus(t) === activeStatus;
    });

    listColumn.innerHTML='';
    if(!tickets.length){
      emptyState.hidden=false;
      return;
    }
    emptyState.hidden=true;

    tickets.forEach((t,i)=>{
      listColumn.appendChild(buildCard(t,i));
    });

    if(window.innerWidth >= 900 && tickets[0]){
      renderPreview(tickets[0],0);
    }
  }

  carousel.onclick=(e)=>{
    if(e.target.tagName!=='BUTTON') return;
    carousel.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
    e.target.classList.add('active');
    activeStatus = e.target.dataset.status;
    render();
  };

  render();
})();