/* Blue Vault – Loyalty Marketplace
   - Separate data, UI, and logic
   - No globals exposed 
   
j*/


( async function () {
'use strict';
  
  
const bvModal = document.getElementById('bvModal');
const modalImg = document.getElementById('bvModalImage');
const modalCount = document.getElementById('bvModalCount');
const modalTitle = document.getElementById('bvModalTitle');
const modalDesc = document.getElementById('bvModalDesc');
const modalDetails = document.getElementById('bvModalDetails');
const modalAction = document.getElementById('bvModalAction');
const ticketTypeSelect = document.getElementById('ticketTypeSelect');
const ticketTypeGroup = document.getElementById('ticketTypeGroup');
const pinGroup = document.getElementById('pinGroup');
const transactionPin = document.getElementById('transactionPin');
const totalCostSection = document.getElementById('totalCostSection');
const totalCostAmount = document.getElementById('totalCostAmount');

let modalImages = [];
let modalIndex = 0;
let currentItem = null;
let purchasedEventIds = new Set();

async function fetchUserTickets() {
  try {
    const response = await getRequest(ENDPOINTS.mytickets);
    if (response && Array.isArray(response)) {
      response.forEach(ticket => {
        if (ticket.event && ticket.event.id) {
          purchasedEventIds.add(ticket.event.id);
        }
      });
    }
  } catch (err) {
    console.log('Could not fetch user tickets');
  }
}

function hasUserPurchasedEvent(eventId) {
  return purchasedEventIds.has(eventId);
}

function showModal(item) {
  currentItem = item;
  modalImages = item.images;
  modalIndex = 0;

  modalImg.src = modalImages[0];
  modalCount.textContent = `1 / ${modalImages.length}`;

  modalTitle.textContent = item.title;
  modalDesc.textContent = item.short;

  modalDetails.innerHTML = Object.entries(item.details || {})
    .map(([k,v]) => `<div class="detail-row"><strong>${k}</strong> ${v}</div>`)
    .join('');

  modalAction.textContent = primaryTextForCategory(state.category);

  const alreadyPurchased = hasUserPurchasedEvent(item.id);
  const is_free = item.price === "Free";
  const is_sold_out = is_free && (item.tickets_left === 0 || item.tickets_left === '0');
  
  if (alreadyPurchased) {
    ticketTypeGroup.style.display = 'none';
    pinGroup.style.display = 'none';
    totalCostSection.innerHTML = `<span>Status:</span><span style="color: var(--brand);">Already Purchased</span>`;
    totalCostSection.style.display = 'flex';
    modalAction.disabled = true;
    modalAction.style.opacity = '0.5';
    modalAction.style.cursor = 'not-allowed';
  } else if (is_sold_out) {
    ticketTypeGroup.style.display = 'none';
    pinGroup.style.display = 'none';
    totalCostSection.innerHTML = `<span>Status:</span><span class="sold-out">Sold Out</span>`;
    totalCostSection.style.display = 'flex';
    modalAction.disabled = true;
    modalAction.style.opacity = '0.5';
    modalAction.style.cursor = 'not-allowed';
  } else if (is_free) {
    ticketTypeGroup.style.display = 'none';
    pinGroup.style.display = 'none';
    totalCostSection.innerHTML = `<span>Tickets Available:</span><span>${item.tickets_left ?? 'N/A'}</span>`;
    totalCostSection.style.display = 'flex';
    modalAction.disabled = false;
    modalAction.style.opacity = '1';
    modalAction.style.cursor = 'pointer';
  } else {
    const allSoldOut = item.price.every(type => type.quantity_available === 0);
    
    ticketTypeGroup.style.display = 'block';
    pinGroup.style.display = 'block';
    totalCostSection.innerHTML = `<span>Total:</span><span id="totalCostAmount">${formatCurrency(0)}</span>`;
    totalCostSection.style.display = 'flex';
    
    ticketTypeSelect.innerHTML = item.price.map((type, idx) => {
      const isTypeSoldOut = type.quantity_available === 0;
      return `<option value="${idx}" data-price="${type.price}" ${isTypeSoldOut ? 'disabled' : ''}>${type.name} - ${formatCurrency(type.price)} (${isTypeSoldOut ? 'Sold Out' : type.quantity_available + ' left'})</option>`;
    }).join('');
    
    if (allSoldOut) {
      modalAction.disabled = true;
      modalAction.style.opacity = '0.5';
      modalAction.style.cursor = 'not-allowed';
    } else {
      modalAction.disabled = false;
      modalAction.style.opacity = '1';
      modalAction.style.cursor = 'pointer';
    }
    
    updateTotalCost();
  }
  
  transactionPin.value = '';

  bvModal.classList.add('show');
  bvModal.setAttribute('aria-hidden', 'false');
}

function updateTotalCost() {
  if (!currentItem || currentItem.price === "Free") return;
  
  const selectedOption = ticketTypeSelect.options[ticketTypeSelect.selectedIndex];
  const price = parseFloat(selectedOption.dataset.price) || 0;
  
  const totalCostAmount = document.getElementById("totalCostAmount");
  if (totalCostAmount) {
    totalCostAmount.textContent = formatCurrency(price);
  }
}

function hideModal() {
  bvModal.classList.remove('show');
  bvModal.setAttribute('aria-hidden', 'true');
}

bvModal.addEventListener('click', e => {
  if (e.target.dataset.close !== undefined) hideModal();
  if (e.target.dataset.prev !== undefined) slide(-1);
  if (e.target.dataset.next !== undefined) slide(1);
});

function slide(dir) {
  modalIndex = (modalIndex + dir + modalImages.length) % modalImages.length;
  modalImg.src = modalImages[modalIndex];
  modalCount.textContent = `${modalIndex + 1} / ${modalImages.length}`;
}

ticketTypeSelect.addEventListener('change', updateTotalCost);

transactionPin.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
});
  

  /* -------------------------
     Data: datasets per category
     ------------------------- */
  // Get events ticket available
  
 
    
  let response = await getRequest(ENDPOINTS.events)   
  
 

  let DATA = {
     Tickets:  [],

    // Data: [
    //   {
    //     id: 'd1',
    //     title: '5GB Data Bundle',
    //     short: 'Valid for 30 days across networks.',
    //     points: 2500,
    //     popularity: 'popular',
    //     images: [
    //       svgDataURI('5GB 1', '#10B981', '#fff'),
    //       svgDataURI('5GB 2', '#34D399', '#fff')
    //     ],
    //     details: {
    //       pointType: 'Data Bundle',
    //       quantity: '5GB',
    //       fullDescription: '5GB data bundle valid for 30 days on all networks.'
    //     }
    //   },
    //   {
    //     id: 'd2',
    //     title: '10GB Night Plan',
    //     short: 'Extra data for night browsing.',
    //     points: 1800,
    //     popularity: 'new',
    //     images: [
    //       svgDataURI('10GB Night 1', '#06B6D4', '#fff'),
    //       svgDataURI('10GB Night 2', '#0891B2', '#fff')
    //     ],
    //     details: {
    //       pointType: 'Data Bundle',
    //       quantity: '10GB',
    //       fullDescription: '10GB night plan valid between 12AM-6AM for 14 days.'
    //     }
    //   },
    //   {
    //     id: 'd3',
    //     title: '1GB Daily',
    //     short: 'Daily 1GB for 7 days.',
    //     points: 700,
    //     popularity: 'popular',
    //     images: [
    //       svgDataURI('1GB 1', '#06B6D4', '#fff'),
    //       svgDataURI('1GB 2', '#60A5FA', '#fff')
    //     ],
    //     details: {
    //       pointType: 'Data Bundle',
    //       quantity: '1GB/day',
    //       fullDescription: '1GB per day for 7 days, auto-renew disabled.'
    //     }
    //   }
    // ],

    // 'Gift Cards': [
    //   {
    //     id: 'g1',
    //     title: 'Store Gift Card - $25',
    //     short: 'Redeemable at partner stores.',
    //     points: 5000,
    //     popularity: 'popular',
    //     images: [
    //       svgDataURI('Gift 25 1', '#F59E0B', '#fff'),
    //       svgDataURI('Gift 25 2', '#F97316', '#fff')
    //     ],
    //     details: {
    //       pointType: 'Gift Card',
    //       quantity: '$25',
    //       fullDescription: 'Redeemable at participating retailers for goods and services.'
    //     }
    //   },
    //   {
    //     id: 'g2',
    //     title: 'Dining Voucher - $50',
    //     short: 'Use at selected restaurants.',
    //     points: 9500,
    //     popularity: 'new',
    //     images: [
    //       svgDataURI('Dining 50 1', '#EF4444', '#fff'),
    //       svgDataURI('Dining 50 2', '#FCA5A5', '#fff')
    //     ],
    //     details: {
    //       pointType: 'Gift Card',
    //       quantity: '$50',
    //       fullDescription: 'Valid for dine-in at partner restaurants for 6 months.'
    //     }
    //   }
    // ],

    // Airtime: [
    //   {
    //     id: 'a1',
    //     title: '₦500 Airtime',
    //     short: 'Instant top-up for any network.',
    //     points: 500,
    //     popularity: 'popular',
    //     images: [
    //       svgDataURI('Airtime 500 1', '#8B5CF6', '#fff'),
    //       svgDataURI('Airtime 500 2', '#C4B5FD', '#fff')
    //     ],
    //     details: {
    //       pointType: 'Airtime',
    //       quantity: '₦500',
    //       fullDescription: 'Instant airtime top-up delivered to your phone number.'
    //     }
    //   },
    //   {
    //     id: 'a2',
    //     title: '₦2000 Airtime',
    //     short: 'Higher value top-up for calls and data.',
    //     points: 2000,
    //     popularity: 'new',
    //     images: [
    //       svgDataURI('Airtime 2000 1', '#7C3AED', '#fff'),
    //       svgDataURI('Airtime 2000 2', '#A78BFA', '#fff')
    //     ],
    //     details: {
    //       pointType: 'Airtime',
    //       quantity: '₦2000',
    //       fullDescription: 'Instant airtime top-up delivered to your phone number.'
    //     }
    //   }
    // ],

    // Points: [
    //   {
    //     id: 'p1',
    //     title: 'COD Points Pack',
    //     short: 'Add 1000 COD points to your account.',
    //     points: 1000,
    //     popularity: 'popular',
    //     images: [
    //       svgDataURI('COD 1000 1', '#F97316', '#fff'),
    //       svgDataURI('COD 1000 2', '#FB923C', '#fff')
    //     ],
    //     details: {
    //       pointType: 'COD Points',
    //       quantity: '1000',
    //       fullDescription: 'Instantly credited COD points usable across the marketplace.'
    //     }
    //   },
    //   {
    //     id: 'p2',
    //     title: 'Academic Points Bundle',
    //     short: '500 academic points for learning credits.',
    //     points: 500,
    //     popularity: 'new',
    //     images: [
    //       svgDataURI('Academic 500 1', '#2563EB', '#fff'),
    //       svgDataURI('Academic 500 2', '#60A5FA', '#fff')
    //     ],
    //     details: {
    //       pointType: 'Academic Points',
    //       quantity: '500',
    //       fullDescription: 'Points redeemable for courses and learning materials.'
    //     }
    //   }
    // ]
  };

for (let i = 0; i  < response.length; i++){
  let ticketsLeft = response[i].is_free 
    ? Math.max(0, (response[i].total_tickets || 0) - (response[i].tickets_sold || 0)) 
    : null;
  
  let ticketTypes = response[i].is_free ? null : response[i].ticket_types;
  if (ticketTypes && Array.isArray(ticketTypes)) {
    ticketTypes = ticketTypes.map(type => ({
      ...type,
      quantity_available: Math.max(0, type.quantity_available || 0)
    }));
  }
  
  let ticket = {
      id: response[i].id,
      title: response[i].event_title,
      short: response[i].event_description,
      price: response[i].is_free ? "Free": ticketTypes,
      tickets_left: ticketsLeft,
      popularity: 'popular',
      images: [
      API_BASE + response[i].ticket_image,
      API_BASE + response[i].event_banner,
      API_BASE + response[i].ticket_image
      ],
      details: {
        "Event name": response[i].event_title,
        Venue: response[i].event_location,
        Time : response[i].event_date.split('T') ,
       Seller: response[i].vendor.brand_name
      }
  }
 
  DATA.Tickets.push(ticket)

 };
  

  /* -------------------------
     State
     ------------------------- */
  const state = {
    category: 'Tickets',
    search: '',
    maxPoints: 50000,
    popularity: 'all',
    expandedId: null
  };

  /* -------------------------
     DOM references
     ------------------------- */
  const refs = {
    grid: document.getElementById('gridWrap'),
    searchInput: document.getElementById('searchInput'),
    catButtons: null,
    // cartCount: document.getElementById('cartCount'),
    dotsBtn: document.getElementById('dotsBtn'),
    dotsDropdown: document.getElementById('dotsDropdown'),
    hamburgerBtn: document.getElementById('hamburgerBtn')
  };

  /* -------------------------
     Initialization
     ------------------------- */
  function init() {
    
    // category buttons
    refs.catButtons = Array.from(document.querySelectorAll('.cat-btn'));
    refs.catButtons.forEach(btn => {
      btn.addEventListener('click', onCategoryClick);
    });

    // search input
    refs.searchInput.addEventListener('input', onSearchInput);

    
    // dropdown menu
    refs.dotsBtn.addEventListener('click', toggleDropdown);
    document.addEventListener('click', onDocumentClick);
    
    // render initial grid
    renderGrid();

    // hamburger (no side menu required by spec; keep accessible)
    // refs.hamburgerBtn.addEventListener('click', () => {
    //   // simple accessible feedback: toggle aria-pressed
    //   const pressed = refs.hamburgerBtn.getAttribute('aria-pressed') === 'true';
    //   refs.hamburgerBtn.setAttribute('aria-pressed', String(!pressed));
    // });
  }

  /* -------------------------
     Utility helpers
     ------------------------- */
  function computeMaxPoints() {
    let max = 0;
    Object.values(DATA).forEach(arr => {
      arr.forEach(item => {
        if (item.points && item.points > max) max = item.points;
      });
    });
    return max;
  }

  function svgDataURI(text, bg = '#2563EB', fg = '#fff') {
    // returns a data URI for a simple SVG placeholder image
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'>
      <rect width='100%' height='100%' fill='${bg}' rx='12'/>
      <g fill='${fg}' font-family='Arial, Helvetica, sans-serif' font-weight='700'>
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='36'>${escapeXml(text)}</text>
      </g>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function escapeXml(s) {
    return String(s).replace(/[&<>'"]/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&apos;','"':'&quot;'}[c];
    });
  }

  /* -------------------------
     Event handlers
     ------------------------- */
  function onCategoryClick(e) {
    const btn = e.currentTarget;
    const cat = btn.getAttribute('data-cat');
    if (!cat) return;
    state.category = cat;
    // update active class
    refs.catButtons.forEach(b => b.classList.toggle('active', b === btn));
    // reset expanded
    state.expandedId = null;
    renderGrid();
  }

  function onSearchInput(e) {
    state.search = e.target.value.trim().toLowerCase();
    state.expandedId = null;
    renderGrid();
  }
  
  function toggleDropdown(e) {
    e.stopPropagation();
    const open = refs.dotsDropdown.classList.contains('show');
    
    if (open) {
      refs.dotsDropdown.classList.remove('show');
      refs.dotsDropdown.style.display = 'none';
      refs.dotsDropdown.setAttribute('aria-hidden', 'true');
    } else {
      const rect = refs.dotsBtn.getBoundingClientRect();
      refs.dotsDropdown.style.top = `${rect.bottom + 8}px`;
      refs.dotsDropdown.style.right = `${window.innerWidth - rect.right}px`;
      refs.dotsDropdown.style.display = 'block';
      refs.dotsDropdown.classList.add('show');
      refs.dotsDropdown.setAttribute('aria-hidden', 'false');
    }
  }

  function onDocumentClick(e) {
    // close dropdown if click outside
    if (!refs.dotsDropdown.contains(e.target) && !refs.dotsBtn.contains(e.target)) {
      refs.dotsDropdown.classList.remove('show');
      refs.dotsDropdown.style.display = 'none';
      refs.dotsDropdown.setAttribute('aria-hidden', 'true');
    }
  }

  /* -------------------------
     Rendering
     ------------------------- */
  function renderGrid() {
    const items = getFilteredItems();
    // clear
    refs.grid.innerHTML = '';
    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'No items match your filters.';
      refs.grid.appendChild(empty);
      return;
    }

    items.forEach(item => {
      const card = createCard(item);
      refs.grid.appendChild(card);
    });
  }

  function getFilteredItems() {
    const list = DATA[state.category] || [];
    return list.filter(item => {
     
      // search
      if (state.search) {
        const hay = (item.title + ' ' + (item.short || '')).toLowerCase();
        if (!hay.includes(state.search)) return false;
      }
      return true;
    });
  }

  /* -------------------------
     Card creation and logic
     ------------------------- */
  function createCard(item) {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.id = item.id;

    // image wrap
    const imgWrap = document.createElement('div');
    imgWrap.className = 'image-wrap';
    const img = document.createElement('img');
    img.src = item.images[0];
    img.alt = item.title;
    img.loading = 'lazy';
    imgWrap.appendChild(img);

    // expand icon
    const expandBtn = document.createElement('button');
    expandBtn.className = 'expand-btn';
    expandBtn.setAttribute('aria-label', 'Expand details');
    expandBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12h14M12 5v14" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    imgWrap.appendChild(expandBtn);

    // body
    const body = document.createElement('div');
    body.className = 'card-body';
    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = item.title;
    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = item.short;
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    const meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.style.alignItems = 'center';
    const price = document.createElement('div');
    price.className = 'price';
    if (item.price === "Free") {
      const ticketsLeft = item.tickets_left ?? 'N/A';
      const isSoldOut = ticketsLeft === 0 || ticketsLeft === '0';
      price.innerHTML = `Free<br>${isSoldOut ? '<span class="sold-out">Sold Out</span>' : 'Tickets left: ' + ticketsLeft}`;
    }
    else{
    for (let i = 0; i  < item.price.length; i++){
      const qty = item.price[i].quantity_available;
      const isTypeSoldOut = qty === 0;
      price.innerHTML += `${item.price[i].name} : ${formatCurrency(item.price[i].price)} <br> ${isTypeSoldOut ? '<span class="sold-out">Sold Out</span>' : 'Ticket left: ' + qty} <br> `;
      
    }
  }
    

    // primary action button text based on category
    const primary = document.createElement('button');
    primary.className = 'primary-btn';
    primary.textContent = primaryTextForCategory(state.category);
    primary.addEventListener('click', () => {
      // For tickets, simulate purchase flow; for others, redeem/buy points
      handlePrimaryAction(item);
    });

   

    actions.appendChild(primary);

    meta.appendChild(price);

    
    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(meta);
    
    const actionsWrap = document.createElement('div');
actionsWrap.style.display = 'flex';
actionsWrap.style.flexDirection = 'column';
actionsWrap.style.gap = '8px';

actionsWrap.appendChild(primary);


body.appendChild(actionsWrap);
    
    

    // expanded area
    const expanded = document.createElement('div');
    expanded.className = 'expanded-area';

    // details and carousel container
    const detailsWrap = document.createElement('div');
    detailsWrap.className = 'details';

    const detailText = document.createElement('div');
    detailText.className = 'detail-text';

    // populate details depending on category
    if (state.category === 'Tickets') {
      const d = item.details || {};
      detailText.innerHTML = `
        <div class="detail-row"><strong>Event Name</strong> ${escapeHtml(d.eventName || '')}</div>
        <div class="detail-row"><strong>Venue</strong> ${escapeHtml(d.venue || '')}</div>
        <div class="detail-row"><strong>Run Date</strong> ${escapeHtml(d.runDate || '')}</div>
        <div class="detail-row"><strong>Seller</strong> ${escapeHtml(d.seller || '')}</div>
      `;
    } else {
      const d = item.details || {};
      detailText.innerHTML = `
        <div class="detail-row"><strong>Point Type</strong> ${escapeHtml(d.pointType || '')}</div>
        <div class="detail-row"><strong>Quantity</strong> ${escapeHtml(d.quantity || '')}</div>
        <div class="detail-row"><strong>Description</strong> ${escapeHtml(d.fullDescription || '')}</div>
      `;
    }

    // carousel
    const carousel = document.createElement('div');
    carousel.className = 'carousel';
    const carouselImg = document.createElement('img');
    carouselImg.src = item.images[0];
    carouselImg.alt = item.title + ' image';
    carousel.appendChild(carouselImg);

    const ctrlLeft = document.createElement('button');
    ctrlLeft.className = 'ctrl left';
    ctrlLeft.setAttribute('aria-label', 'Previous image');
    ctrlLeft.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 18l-6-6 6-6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    const ctrlRight = document.createElement('button');
    ctrlRight.className = 'ctrl right';
    ctrlRight.setAttribute('aria-label', 'Next image');
    ctrlRight.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6l6 6-6 6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    carousel.appendChild(ctrlLeft);
    carousel.appendChild(ctrlRight);

    detailsWrap.appendChild(detailText);
    detailsWrap.appendChild(carousel);

    expanded.appendChild(detailsWrap);

    // append parts
    card.appendChild(imgWrap);
    card.appendChild(body);
    card.appendChild(expanded);

    // state for carousel index
    let idx = 0;

    // expand/collapse logic
expandBtn.addEventListener('click', (ev) => {
  ev.preventDefault();
  ev.stopPropagation();
  showModal(item);
});

    // carousel controls
    ctrlLeft.addEventListener('click', (ev) => {
      ev.stopPropagation();
      idx = (idx - 1 + item.images.length) % item.images.length;
      carouselImg.src = item.images[idx];
    });
    ctrlRight.addEventListener('click', (ev) => {
      ev.stopPropagation();
      idx = (idx + 1) % item.images.length;
      carouselImg.src = item.images[idx];
    });

    // ensure first image displayed in collapsed view
    img.src = item.images[0];
    carouselImg.src = item.images[0];

    // reflect expanded state
   

    return card;
  }

  function primaryTextForCategory(cat) {
    if (cat === 'Tickets') return 'Purchase Ticket';
    if (cat === 'Points') return 'Buy Points';
    // Data / Airtime / Gift Cards
    return 'Redeem Now';
  }

  function handlePrimaryAction(item) {
  showModal(item);
}

  // function addToCart(item) {
  //   // push item id to cart state
  //   state.cart.push({
  //     id: item.id,
  //     title: item.title,
  //     points: item.points,
  //     category: state.category
  //   });
  //   updateCartUI();
  // }

  // function updateCartUI() {
  //   refs.cartCount.textContent = String(state.cart.length);
  // }

  function toggleExpand(cardEl, id) {
    // collapse any other expanded card
    const prev = document.querySelector('.card.expanded');
    if (prev && prev !== cardEl) {
      prev.classList.remove('expanded');
    }

    const isExpanded = cardEl.classList.toggle('expanded');
    state.expandedId = isExpanded ? id : null;

    // when expanded, ensure carousel shows remaining images and controls work
    if (isExpanded) {
      // nothing else required; carousel logic is per-card
    }
  }

  /* -------------------------
     Helpers
     ------------------------- */
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

function showToast(msg, ms = 4000) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(t._hideTO);
  t._hideTO = setTimeout(() => { t.hidden = true; }, ms);
}

function hideSuccess() {
  const success = document.getElementById("success");
  if (success) success.style.display = "none";
}

function formatCurrency(amount) {
  return '₦' + Number(amount).toLocaleString('en-NG');
}

function parseCurrency(str) {
  return String(str).replace(/[₦,\s]/g, '');
}

async function purchaseTicket(payload, event_id) {
  try {
    showLoader();
    let response = await postRequest(ENDPOINTS.purchase + event_id + "/purchase/", payload);
    hideLoader();
    
    if (response.success || response.tickets) {
      showSuccess();
      showToast(response.message || "Ticket purchased successfully!");
      setTimeout(() => {
        location.reload();
      }, 2500);
    } else if (response.error) {
      showToast(response.error);
    } else if (response.non_field_errors) {
      showToast(response.non_field_errors.join(', '));
    } else if (response.transaction_pin) {
      showToast("PIN: " + response.transaction_pin.join(', '));
    } else if (response.ticket_type) {
      showToast("Ticket Type: " + response.ticket_type);
    } else {
      showToast("Purchase failed. Please try again.");
    }
  } catch (err) {
    hideLoader();
    showToast("An error occurred. Please try again.");
  }
}

document.getElementById('bvModalAction').addEventListener('click', () => {
  if (!currentItem) {
    showToast("No event selected");
    return;
  }

  const event_id = currentItem.id;
  
  // Check if already purchased
  if (hasUserPurchasedEvent(event_id)) {
    showToast("You have already purchased a ticket for this event");
    return;
  }
  
  const is_free = currentItem.price === "Free";
  
  // Check if sold out
  if (is_free && (currentItem.tickets_left === 0 || currentItem.tickets_left === '0')) {
    showToast("This event is sold out");
    return;
  }
  
  if (!is_free) {
    const ticketTypes = currentItem.price;
    const selectedIdx = parseInt(ticketTypeSelect.value);
    const selectedType = ticketTypes[selectedIdx];
    
    if (selectedType.quantity_available === 0) {
      showToast("This ticket type is sold out");
      return;
    }
    
    const pin = transactionPin.value.trim();
    
    if (!pin) {
      showToast("Transaction PIN is required");
      transactionPin.focus();
      return;
    }
    
    if (!/^\d{4}$/.test(pin)) {
      showToast("PIN must be 4 digits");
      transactionPin.focus();
      return;
    }
    
    const payload = {
      ticket_type: selectedType.name,
      quantity: 1,
      transaction_pin: pin
    };
    purchaseTicket(payload, event_id);
  } else {
    // Free ticket - no PIN required
    const payload = { 
      quantity: 1
    };
    purchaseTicket(payload, event_id);
  }
})

async function vendorStatus() {
    const response = await getRequest(ENDPOINTS.vendor_status);
    let status = response.vendor.verification_status
    if ( status === 'approved') {
      document.getElementById('scanner').style.display = 'block'
      
      document.getElementById('scanner').style.display = 'block'
      
      document.getElementById('seller').style.display = 'none'
    }
    else {
      status === 'pending' ?showToast("Not a vendor yet") : 
      document.getElementById('scanner').style.display = 'none'
      
      document.getElementById('event').style.display = 'none'
    }
   
  }
    
  vendorStatus();
  fetchUserTickets();
  /* -------------------------
     Start
     ------------------------- */
  init();

 })();



