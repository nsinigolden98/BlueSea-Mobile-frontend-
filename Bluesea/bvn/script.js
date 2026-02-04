/* =========================
   TAB SWITCHING LOGIC
========================= */
const bvnTab = document.getElementById("bvnTab");
const ninTab = document.getElementById("ninTab");
const bvnForm = document.getElementById("bvnForm");
const ninForm = document.getElementById("ninForm");

bvnTab.addEventListener("click", () => switchTab("bvn"));
ninTab.addEventListener("click", () => switchTab("nin"));

function switchTab(type) {
  bvnTab.classList.toggle("active", type === "bvn");
  ninTab.classList.toggle("active", type === "nin");

  bvnForm.classList.toggle("active", type === "bvn");
  ninForm.classList.toggle("active", type === "nin");
}

/* =========================
   FORM SUBMISSION
========================= */
const form = document.getElementById("verificationForm");
const loading = document.getElementById("loadingState");
const resultSection = document.getElementById("resultSection");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  loading.style.display = "block";

  setTimeout(mockVerification, 2000);
});

/* =========================
   VALIDATION
========================= */
function validateForm() {
  let valid = true;
  document.querySelectorAll(".error").forEach(e => e.textContent = "");

  const activeBVN = bvnForm.classList.contains("active");

  if (activeBVN) {
    if (!bvnNumber.value.match(/^\d+$/)) {
      bvnError.textContent = "Enter a valid BVN number.";
      valid = false;
    }
    if (!bvnPhone.value) {
      bvnPhoneError.textContent = "Phone number is required.";
      valid = false;
    }
  } else {
    if (!ninNumber.value.match(/^\d+$/)) {
      ninError.textContent = "Enter a valid NIN number.";
      valid = false;
    }
    if (!ninPhone.value) {
      ninPhoneError.textContent = "Phone number is required.";
      valid = false;
    }
  }

  return valid;
}

/* =========================
   MOCK VERIFICATION
========================= */
function mockVerification() {
  loading.style.display = "none";
  resultSection.classList.remove("hidden");

  const dobValue = "1998-06-15";
  const ageValue = calculateAge(dobValue);

  document.getElementById("fullName").textContent = "John Michael Doe";
  document.getElementById("firstName").textContent = "John";
  document.getElementById("verifiedPhone").textContent = "08012345678";
  document.getElementById("dob").textContent = dobValue;
  document.getElementById("age").textContent = ageValue;
  document.getElementById("gender").textContent = "Male";
}

/* =========================
   AGE CALCULATION
========================= */
function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/* =========================
   CONFIRMATION STEP
========================= */
const confirmCheckbox = document.getElementById("confirmCheckbox");
const confirmButton = document.getElementById("confirmButton");
const verifiedState = document.getElementById("verifiedState");

confirmCheckbox.addEventListener("change", () => {
  confirmButton.disabled = !confirmCheckbox.checked;
});

confirmButton.addEventListener("click", () => {
  resultSection.classList.add("hidden");
  verifiedState.classList.remove("hidden");
});