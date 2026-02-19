const startBtn = document.getElementById('startScan');
const scannerSection = document.querySelector('.scanner');
const instructions = document.querySelector('.instructions');
const errorText = document.getElementById('cameraError');

const modal = document.querySelector('.modal');
const modalTitle = document.getElementById('modalTitle');
const ticketIdEl = document.getElementById('ticketId');
const eventNameEl = document.getElementById('eventName');
const buyerNameEl = document.getElementById('buyerName');
const ticketStatusEl = document.getElementById('ticketStatus');
const statusIconEl = document.getElementById('statusIcon');
const closeBtn = document.getElementById('closeModal');
const stopBtn = document.getElementById('stopScan');

let html5QrCode = null;
let isScanning = false;

startBtn.addEventListener('click', startScanner);

async function startScanner() {
  try {
    html5QrCode = new Html5Qrcode("qr-reader");
    
    instructions.classList.add('hidden');
    scannerSection.classList.remove('hidden');
    isScanning = true;
    
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };
    
    await html5QrCode.start(
      { facingMode: "environment" },
      config,
      onScanSuccess,
      onScanFailure
    );
  } catch (err) {
    errorText.textContent = 'Camera access denied or unsupported.';
    errorText.hidden = false;
    scannerSection.classList.add('hidden');
    instructions.classList.remove('hidden');
  }
}

async function onScanSuccess(decodedText, decodedResult) {
  if (!isScanning) return;
  
  isScanning = false;
  
  try {
    const response = await postRequest(ENDPOINTS.scan_ticket, {
      qr_data: decodedText
    });
    
    showResult(response);
  } catch (err) {
    showError('Failed to validate ticket. Please try again.');
  }
}

function onScanFailure(error) {
}

function showResult(response) {
  const isSuccess = response.state === true || response.scan_result === 'success';
  
  if (isSuccess && response.ticket_details) {
    const ticket = response.ticket_details;
    
    ticketIdEl.textContent = ticket.ticket_id || 'N/A';
    eventNameEl.textContent = ticket.event?.title || 'N/A';
    buyerNameEl.textContent = ticket.owner_name || 'N/A';
    ticketStatusEl.textContent = 'VALIDATED';
    
    modalTitle.textContent = 'Access Granted';
    statusIconEl.innerHTML = getStatusIcon('VALID');
  } else {
    const ticket = response.ticket_details || {};
    
    ticketIdEl.textContent = ticket.ticket_id || 'N/A';
    eventNameEl.textContent = ticket.event?.title || 'Unknown Event';
    buyerNameEl.textContent = ticket.owner_name || 'Unknown';
    ticketStatusEl.textContent = response.error_code || 'DENIED';
    
    modalTitle.textContent = getErrorTitle(response.error_code);
    statusIconEl.innerHTML = getStatusIcon(response.error_code || 'DENIED');
  }
  
  modal.classList.remove('hidden');
}

function getErrorTitle(errorCode) {
  const titles = {
    'ALREADY_USED': 'Ticket Already Used',
    'EXPIRED': 'Ticket Expired',
    'TRANSFERRED': 'Ticket Transferred',
    'CANCELED': 'Ticket Canceled',
    'INVALID_QR_CODE': 'Invalid QR Code',
    'TICKET_NOT_FOUND': 'Ticket Not Found',
    'UNAUTHORIZED_SCANNER': 'Unauthorized Scanner',
    'EVENT_MISMATCH': 'Wrong Event',
    'TOO_EARLY': 'Too Early for Entry'
  };
  return titles[errorCode] || 'Invalid Ticket';
}

function getStatusIcon(status) {
  const colors = {
    'VALID': '#2ecc71',
    'VALIDATED': '#2ecc71',
    'SUCCESS': '#2ecc71',
    'ALREADY_USED': '#f4a261',
    'EXPIRED': '#e63946',
    'TRANSFERRED': '#f4a261',
    'CANCELED': '#e63946',
    'INVALID_QR_CODE': '#e63946',
    'TICKET_NOT_FOUND': '#e63946',
    'UNAUTHORIZED_SCANNER': '#e63946',
    'EVENT_MISMATCH': '#e63946',
    'TOO_EARLY': '#f4a261',
    'DENIED': '#e63946'
  };
  
  const color = colors[status] || '#e63946';
  
  return `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      ${status === 'VALID' || status === 'VALIDATED' || status === 'SUCCESS' 
        ? '<path d="M8 12l2 2 4-4"></path>' 
        : '<path d="M15 9l-6 6M9 9l6 6"></path>'}
    </svg>
  `;
}

function showError(message) {
  ticketIdEl.textContent = 'N/A';
  eventNameEl.textContent = 'N/A';
  buyerNameEl.textContent = 'N/A';
  ticketStatusEl.textContent = 'ERROR';
  
  modalTitle.textContent = 'Scan Failed';
  statusIconEl.innerHTML = getStatusIcon('DENIED');
  
  modal.classList.remove('hidden');
}

closeBtn.addEventListener('click', async () => {
  modal.classList.add('hidden');
  
  if (html5QrCode && html5QrCode.isScanning) {
    isScanning = true;
  }
});

stopBtn.addEventListener('click', stopScanner);

async function stopScanner() {
  if (html5QrCode && html5QrCode.isScanning) {
    await html5QrCode.stop();
    html5QrCode.clear();
  }
  
  isScanning = false;
  scannerSection.classList.add('hidden');
  instructions.classList.remove('hidden');
}

function resetScanner() {
  stopScanner();
}
