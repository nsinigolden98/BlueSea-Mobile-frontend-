const startBtn = document.getElementById('startScan');
const scanner = document.querySelector('.scanner');
const instructions = document.querySelector('.instructions');
const camera = document.getElementById('camera');
const errorText = document.getElementById('cameraError');

const modal = document.querySelector('.modal');
const modalTitle = document.getElementById('modalTitle');
const ticketIdEl = document.getElementById('ticketId');
const eventNameEl = document.getElementById('eventName');
const buyerNameEl = document.getElementById('buyerName');
const ticketStatusEl = document.getElementById('ticketStatus');
const statusIconEl = document.getElementById('statusIcon');
const grantBtn = document.getElementById('grantAccess');
const closeBtn = document.getElementById('closeModal');
const stopBtn = document.getElementById('stopScan');
const backBtn = document.querySelector('.back-btn');

let stream;
let scanning = false;
let scanningTimeout;

startBtn.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } }
    });
    camera.srcObject = stream;
    instructions.classList.add('hidden');
    scanner.classList.remove('hidden');
    scanning = true;
    simulateScan();
  } catch (err) {
    errorText.textContent = 'Camera access denied or unsupported.';
    errorText.hidden = false;
  }
});

function simulateScan() {
  if (!scanning) return;

  setTimeout(() => {
    scanning = false;
    showResult();
  }, 2500);
}

function showResult() {
  const statuses = ['VALID', 'USED', 'PENDING', 'DENIED'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  ticketIdEl.textContent = 'TCK-' + Math.floor(100000 + Math.random() * 900000);
  eventNameEl.textContent = 'Live Concert Night';
  buyerNameEl.textContent = 'John Doe';
  ticketStatusEl.textContent = status;

  modalTitle.textContent =
    status === 'VALID' ? 'Access Granted' :
    status === 'USED' ? 'Ticket Already Used' :
    status === 'PENDING' ? 'Pending Verification' :
    'Invalid Ticket';

  statusIconEl.innerHTML = getStatusIcon(status);
  grantBtn.classList.toggle('hidden', status !== 'VALID');

  modal.classList.remove('hidden');
}

closeBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
  scanning = true;
  simulateScan();
});

function getStatusIcon(status) {
  const colors = {
    VALID: '#2ecc71',
    USED: '#f4a261',
    PENDING: '#1da1f2',
    DENIED: '#e63946'
  };

  return `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${colors[status]}" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M8 12l2 2 4-4"></path>
    </svg>
  `;
}

stopBtn.addEventListener('click', resetScanner);
backBtn.addEventListener('click', resetScanner);


function resetScanner() {
  clearTimeout(scanningTimeout);
  stopCamera();
  scanner.classList.add('hidden');
  instructions.classList.remove('hidden');
  backCover.classList.add('hidden');
}

function stopCamera() {
  if (!stream) return;

  stream.getTracks().forEach(track => track.stop());
  camera.srcObject = null;
}

function resetScanner() {
  scanning = false;
  clearTimeout(scanningTimeout);
  stopCamera();

  modal.classList.add('hidden');
  scanner.classList.add('hidden');
  instructions.classList.remove('hidden');
}
