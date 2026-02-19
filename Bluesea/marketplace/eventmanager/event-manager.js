const modal = document.getElementById("modal");
const openBtn = document.getElementById("openCreate");
const closeBtn = document.getElementById("closeModal");
const form = document.getElementById("eventForm");
const dropdown = document.getElementById("categoryDropdown");

let categoryValue = "";

function formatNumberWithCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function stripCommas(str) {
  return str.replace(/,/g, '');
}

function handleNumberInputWithCommas(e) {
  let rawValue = e.target.value.replace(/,/g, '').replace(/\D/g, '');
  if (rawValue) {
    e.target.value = formatNumberWithCommas(rawValue);
  } else {
    e.target.value = '';
  }
}


openBtn.onclick = () => modal.classList.remove("hidden");
function openCreate() {
  modal.classList.add("hidden");
  const inputElements =document.querySelectorAll('input, textarea');
  inputElements.forEach(input => {
    input.value = '';
  });
  
  document.getElementById('dropdown-selected').textContent === 'Select category'
}
closeBtn.onclick = openCreate()
modal.onclick = (e) => {
  if (e.target === modal) modal.classList.add("hidden");
  
};

// CATEGORY
dropdown.onclick = () => {document.getElementById('dropdown-list').style.display = 'block';
  dropdown.classList.toggle("open");}
dropdown.querySelectorAll(".dropdown-list div").forEach((opt) => {
  opt.onclick = () => {
    categoryValue = opt.dataset.value;
    dropdown.querySelector(".dropdown-selected").textContent = categoryValue;

    document.getElementById('dropdown-list').style.display= 'none' 
  };
});

// UPLOAD PREVIEW
document.querySelectorAll(".upload-box").forEach((box) => {
  box.onclick = () => box.nextElementSibling.click();
});
document.querySelectorAll("input[type=file]").forEach((input) => {
  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = input.previousElementSibling.querySelector("img");
      img.src = reader.result;
      img.style.display = "block";
      input.previousElementSibling.querySelector("span").style.display = "none";
    };
    reader.readAsDataURL(file);
  };
});

// DATE LOGIC (FUTURE ONLY)
form.date.oninput = (e) => {
  let v = e.target.value.replace(/\D/g, "");
  if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
  if (v.length >= 6) v = v.slice(0, 5) + "/" + v.slice(5, 9);
  e.target.value = v;
};

// TIME LOGIC (24H)
form.time.oninput = (e) => {
  let v = e.target.value.replace(/\D/g, "");
  if (v.length > 0 && v[0] > 2) v = "2";
  if (v.length > 1 && v[0] == "2" && v[1] > 4) v = "24";
  if (v.length >= 3) v = v.slice(0, 2) + ":" + v.slice(2, 4);
  e.target.value = v;
};

// PRICE TYPE
form.priceType.forEach((r) => {
  r.onchange = () => {
    form.price.disabled = r.value === "free" && r.checked;
    if (form.price.disable) {
      form.price.value = "";
      form.quantity.value = "";
      form.name.value = "" 
    }
  
  };
});

// VALIDATION
form.oninput = () => {
  let valid = true;
  [...form.elements].forEach((el) => {
    // Check if element has a name, is not disabled, and has a value (if it's a typical input)
    if (
      el.name &&
      !el.disabled &&
      !["BUTTON", "CHECKBOX", "RADIO", "FILE"].includes(el.tagName) && // Exclude buttons, checkboxes, radios, files from simple value check
      !el.value
    ) {
      valid = false;
    }
  });

  // Specific validation for category dropdown
  if (!categoryValue) valid = false;

  // Specific validation for file inputs
  const eventBannerInput = document.getElementById("eventBanner");
  const ticketImageInput = document.getElementById("ticketImage");
  if (
    !eventBannerInput ||
    !eventBannerInput.files ||
    eventBannerInput.files.length === 0
  )
    valid = false;
  if (
    !ticketImageInput ||
    !ticketImageInput.files ||
    ticketImageInput.files.length === 0
  )
    valid = false;

  // For radio buttons, ensure at least one is selected if required
  const priceTypeRadios = form.querySelectorAll('input[name="priceType"]');
  
  if (
    priceTypeRadios.length > 0 &&
    !Array.from(priceTypeRadios).some((radio) => radio.checked)
  ) {
    valid = false;
  }

  // For non-free events, check ticket details
  const isFree = form.querySelector('input[name="priceType"]:checked').value === 'free'
  
  if (isFree) {
    
  }
  
};

const submitButton = document.getElementById('formSubmit'); 
const id= (id)=>document.getElementById(id)
submitButton.addEventListener('click', () => {
  
  document.querySelectorAll('small').forEach((e) => {
    e.textContent = ""
  })
  
  let name = Array.from(document.querySelectorAll(".ticketName"), e => e.value.length > 0)
  let price = Array.from(document.querySelectorAll(".ticketPrice"), e => stripCommas(e.value) > 0)
  let quantity = Array.from(document.querySelectorAll(".ticketQuantity"), e => stripCommas(e.value) > 0)
  
  if (!id('eventTitle').value) {
    id('title-helper').textContent = 'This field is required'
  }
  else if (!id('hostedBy').value) {
    id('host-helper').textContent = "This field id required"
  }
  else if (id('dropdown-selected').textContent === 'Select category') {
    id('category-helper').textContent = "This field id required"
  }
  else if (!id('eventBanner').files) {
    id('event-banner-helper').textContent = "This field id required"
  }
  else if (!id('ticketImage').files) {
    id('ticket-image-helper').textContent = "This field id required"
  }
  else if (!id('eventLocation').value) {
    id('location-helper').textContent = "This field id required"
  } 
  else if (!id('eventDate').value) {
    id('event-date-helper').textContent = "This field id required"
  }
  else if (!id('eventTime').value) {
    id('event-time-helper').textContent = "This field id required"
  }
  else if (!stripCommas(id('ticket-quantity').value) && id("free").checked) {
    id('quantity-helper').textContent = "This field id required"
  }else if (!id('eventDescription').value) {
    id('description-helper').textContent = "This field id required"
  }
  else if (id("free").checked || name.includes(false) || price.includes(false) || quantity.includes(false)) {
    id('tickets-helper').textContent = "Incomplete entries"
    console.log("Incomplete entries")
  }
  else {   
    modal.classList.add("hidden");
     createEvent();
  }
  
});

// Create Event function
async function createEvent() {
  const formData = new FormData();

  showLoader();

  // Assuming form elements have 'name' attributes matching these properties or have these IDs
  // For text inputs
  formData.append("event_title", document.getElementById("eventTitle").value);
  formData.append("hosted_by", document.getElementById("hostedBy").value);
  formData.append("category", document.getElementById("dropdown-selected").textContent);
  formData.append(
    "event_location",
    document.getElementById("eventLocation").value,
  );
  formData.append(
    "event_description",
    document.getElementById("eventDescription").value,
  );

  const isFree =
    form.querySelector('input[name="priceType"]:checked').value === "free";
  formData.append("is_free", isFree);

  // Combine date and time
  const eventDate = document.getElementById("eventDate").value; // e.g., "DD/MM/YYYY"
  const eventTime = document.getElementById("eventTime").value; // e.g., "HH:MM"
  if (eventDate && eventTime) {
    const [day, month, year] = eventDate.split("/");
    // Backend expects ISO 8601 format, e.g., "YYYY-MM-DDTHH:MM:SSZ"
    // Note: Assuming date is DD/MM/YYYY and time is HH:MM
    const isoDate = `${year}-${month}-${day}T${eventTime}:00Z`;
    formData.append("event_date", isoDate);
  }
  const ticket_type_list = document.querySelectorAll(".ticketName")
  const ticket_price_list = document.querySelectorAll(".ticketPrice")
  const ticket_quantity_list = document.querySelectorAll(".ticketQuantity")
  
  const ticket_types = Array.from(ticket_type_list).map((input, index) => {
    return {
      name: input.value,
      price: ticket_price_list[index] ? stripCommas(ticket_price_list[index].value) : "0",
      quantity_available: ticket_quantity_list[index] ? stripCommas(ticket_quantity_list[index].value) : "0"
    }
  })
  // Ticket details (only if not free)
  if (!isFree) {
    formData.append(
      "ticket_types", JSON.stringify(ticket_types));
  }
  formData.append(
    "ticket_quantity",
    stripCommas(document.getElementById("ticket-quantity").value)
  );
  
  // File inputs
  const eventBannerFile = document.getElementById("eventBanner").files[0];
  const ticketImageFile = document.getElementById("ticketImage").files[0];

  if (eventBannerFile) {
    formData.append("event_banner", eventBannerFile);
  }
  if (ticketImageFile) {
    formData.append("ticket_image", ticketImageFile);
  }
 
  // postFileRequest is assumed to be globally available from side-nav.js
  
  
  const response = await postFileRequest(ENDPOINTS.create_events, formData);
  hideLoader(); 
  if (response.success || response.state) {
    // Assuming a successful event creation returns an event ID
    showToast(response.message);
    modal.classList.add("hidden");
    form.reset();
    categoryValue = ""; // Reset category dropdown selected value

    // Reset image previews
    document.querySelectorAll(".upload-box img").forEach((img) => {
      img.src = "";
      //img.style.display = "none";
      //img.nextElementSibling.style.display = "block"; 
    });
    // Maybe refresh event list on marketplace or redirect
  }
  else {
    
    showToast(response.error || response.event_date  || "Not a valid Vendor")
    
  }
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
 
async function postFileRequest(url, payload) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: payload, // FormData object
    });
    const json = await response.json().catch(() => ({}));
    return json;
  } catch (err) {
    return { ok: false, success: false, error: "Network error" };
  }
}

async function vendorStatus() {
  const response = await getRequest(ENDPOINTS.vendor_status);
  if (response.vendor) {
    let status = response.vendor.verification_status;
    if (status === 'approved') {
      document.getElementById('openCreate').disabled = false;
      loadVendorEvents();
    } else {
      let text = status === 'pending' 
        ? "Admin is verifying your application, Please come back later." 
        : "Vendor's verification was rejected please kindly apply again.";
      document.getElementById('text').textContent = text;
      hideLoader();
    }
  }
}

vendorStatus();
const paid = document.getElementById('paid')
const free = document.getElementById('free')
const ticketType = document.getElementById('tickets-type')
const quantity = document.getElementById('quantity-div')
function updateVisibility() {
  if (free.checked) {
    ticketType.style.display = 'none'
    quantity.style.display = 'block'
  } 
  else if (paid.checked) {
    ticketType.style.display = 'block'   
    quantity.style.display = 'none'
  }
  
}
paid.addEventListener('change', updateVisibility);
free.addEventListener('change', updateVisibility); 
updateVisibility();

document.querySelectorAll('.ticketPrice').forEach(input => {
  input.addEventListener('input', handleNumberInputWithCommas);
});
document.querySelectorAll('.ticketQuantity').forEach(input => {
  input.addEventListener('input', handleNumberInputWithCommas);
});
document.getElementById('ticket-quantity').addEventListener('input', handleNumberInputWithCommas);


// Creating a new ticket set 

let ticketBody = document.getElementById("ticketBody")
let id_num = 1


document.getElementById('add-button').addEventListener('click', () => { 
    let inputName = document.createElement('input')
    let inputPrice = document.createElement('input')
    let inputQuantity = document.createElement('input')
    inputName.classList.add('ticketName')
    inputName.type = 'text'
    inputName.placeholder = 'name'
    inputPrice.classList.add('ticketPrice')
    inputPrice.type = 'text'
    inputPrice.placeholder = 'price'
    inputPrice.addEventListener('input', handleNumberInputWithCommas)
    inputQuantity.placeholder = 'quantity'
    inputQuantity.type = 'text'
    inputQuantity.classList.add('ticketQuantity')
    inputQuantity.addEventListener('input', handleNumberInputWithCommas)
 
    let button = document.createElement('button')
    button.type = 'button'
    button.textContent = 'DELETE'
    button.classList.add('primary-btn')
    button.classList.add('delete-btn')
    let id = "del-"+id_num
    button.id = "del-" + id_num
    button.onclick =  ()=>  document.getElementById(id).parentElement.remove()
    
    let ticketDiv = document.createElement('div')
    ticketDiv.classList.add('ticket-div')
    ticketDiv.appendChild(inputName)
    ticketDiv.appendChild(inputPrice)
    ticketDiv.appendChild(inputQuantity)
    ticketDiv.appendChild(button)
  ticketBody.appendChild(ticketDiv)
  id_num += 1
})

let allVendorEvents = [];
let allVendorStats = {};

async function loadVendorEvents() {
  showLoader();
  const response = await getRequest(ENDPOINTS.vendor_tickets);
  hideLoader();
  
  if (response.state && response.event_breakdown) {
    const eventList = document.getElementById('eventList');
    const textEl = document.getElementById('text');
    
    allVendorEvents = response.event_breakdown;
    allVendorStats = response.statistics;
    
    if (allVendorEvents.length > 0) {
      textEl.style.display = 'none';
      renderEventContainer();
      filterEvents('all');
    } else {
      textEl.textContent = 'No events yet. Create your first event.';
    }
  }
}

function renderEventContainer() {
  const eventList = document.getElementById('eventList');
  
  const statsDiv = document.createElement('div');
  statsDiv.className = 'stats-summary';
  statsDiv.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Total</span>
      <span class="stat-value">${formatNumberWithCommas(allVendorStats.total_tickets)}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Upcoming</span>
      <span class="stat-value">${formatNumberWithCommas(allVendorStats.upcoming)}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Used</span>
      <span class="stat-value">${formatNumberWithCommas(allVendorStats.used)}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Expired</span>
      <span class="stat-value">${formatNumberWithCommas(allVendorStats.expired)}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Canceled</span>
      <span class="stat-value">${formatNumberWithCommas(allVendorStats.canceled)}</span>
    </div>
  `;
  eventList.insertBefore(statsDiv, eventList.firstChild);
  
  const filterTabs = document.createElement('div');
  filterTabs.className = 'filter-tabs';
  filterTabs.innerHTML = `
    <button class="filter-tab active" data-filter="all">All</button>
    <button class="filter-tab" data-filter="approved">Approved</button>
    <button class="filter-tab" data-filter="pending">Pending</button>
  `;
  eventList.insertBefore(filterTabs, statsDiv.nextSibling);
  
  const eventsContainer = document.createElement('div');
  eventsContainer.id = 'eventsContainer';
  eventsContainer.className = 'events-container';
  eventList.appendChild(eventsContainer);
  
  filterTabs.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterEvents(tab.dataset.filter);
    });
  });
}

function filterEvents(filter) {
  const container = document.getElementById('eventsContainer');
  container.innerHTML = '';
  
  let filteredEvents = allVendorEvents;
  
  if (filter === 'approved') {
    filteredEvents = allVendorEvents.filter(e => e.is_approved);
  } else if (filter === 'pending') {
    filteredEvents = allVendorEvents.filter(e => !e.is_approved);
  }
  
  if (filteredEvents.length === 0) {
    container.innerHTML = '<p class="no-events">No events in this category.</p>';
    return;
  }
  
  filteredEvents.forEach(event => {
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    
    const approvalBadge = event.is_approved 
      ? '<span class="badge approved">Approved</span>'
      : '<span class="badge pending">Pending Approval</span>';
    
    eventCard.innerHTML = `
      <div class="event-info">
        <div class="event-header">
          <h3 class="event-title">${event.event_title}</h3>
          ${approvalBadge}
        </div>
        <p class="event-date">${event.event_date}</p>
        <div class="event-stats">
          <span class="badge upcoming">${event.upcoming} upcoming</span>
          <span class="badge used">${event.used} used</span>
          <span class="badge expired">${event.expired} expired</span>
          <span class="badge canceled">${event.canceled} canceled</span>
          <span class="badge total">${event.total_tickets} total</span>
        </div>
        ${!event.is_approved ? '<p class="approval-notice">This event is pending admin approval. Tickets cannot be purchased until approved.</p>' : ''}
      </div>
    `;
    container.appendChild(eventCard);
  });
}
