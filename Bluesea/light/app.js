const meterNumber = document.getElementById('meterNumber');
const nickname = document.getElementById('nickname');
const amount = document.getElementById('amount');
const continueBtn = document.getElementById('continueBtn');
const meterCard = document.getElementById('meterCard');
const lockIndicator = document.getElementById('lockIndicator');
const lockSvg = lockIndicator.querySelector('.lock');
const unitCount = document.getElementById('unitCount');

let meterType = null;
let disco = null;
const UNIT_PRICE = 65;

/* CUSTOM SELECT */
document.querySelectorAll('.custom-select').forEach(select => {
  const selected = select.querySelector('.selected');
  const options = select.querySelector('.options');

  selected.addEventListener('click', () => {
    select.classList.toggle('open');
  });

  options.querySelectorAll('div').forEach(option => {
    option.addEventListener('click', () => {
      selected.textContent = option.textContent.trim();
      select.classList.remove('open');

      if (select.id === 'meterTypeSelect') meterType = option.dataset.value;
      if (select.id === 'discoSelect') disco = option.dataset.value;

      validate();
    });
  });
});

/* VALIDATION + LOCK */
function validate() {
  const locked = meterNumber.value && meterType && disco;

  lockSvg.classList.toggle('locked', locked);
  lockIndicator.querySelector('span').textContent =
    locked ? 'Meter locked' : 'Meter not locked';

  if (locked) {
    meterCard.classList.remove('hidden');
    document.getElementById('cardTitle').textContent =
      nickname.value || 'Unnamed Meter';
    document.getElementById('cardDetails').textContent =
      `${meterType} • ${disco}`;
  }

  continueBtn.disabled = !(locked && amount.value);
}

/* UNIT CALCULATION */
amount.addEventListener('input', () => {
  const val = Number(amount.value);
  if (!val) {
    unitCount.textContent = '—';
    validate();
    return;
  }

  const units = Math.floor(val / UNIT_PRICE);
  unitCount.textContent = `${units} units`;
  validate();
});

[meterNumber, nickname].forEach(el =>
  el.addEventListener('input', validate)
);

//for meter number 
function isValidMeterNumber(value) {
  return /^[0-9]{8,13}$/.test(value);
}