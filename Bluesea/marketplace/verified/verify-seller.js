/* verify-seller.js
   Plain JS, no frameworks.
   Handles:
   - Prefill readonly fields from login-provided localStorage keys if present
   - Custom selects
   - Custom file uploads with UI and validation
   - Inline validation and enabling/disabling submit
   - Submission behavior and success state with localStorage status
   - Accessibility: keyboard navigation and focus management
*/

/* ---------- Utilities ---------- */
const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
const bytesToSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/* ---------- Elements ---------- */
const form = qs("#verifyForm");
const submitBtn = qs("#submitBtn");
const successScreen = qs("#successScreen");
const formContainer = qs("#formContainer");
const backBtn = qs("#backBtn");
const statusBtn = qs("#statusBtn");
const backToMarket = qs("#backToMarket");
const whyToggle = qs("#whyToggle");
const whyPanel = qs("#whyPanel");

/* ---------- Prefill readonly fields from login context ----------
   We expect login to have stored user data in localStorage keys:
   - bsm_user_fullName
   - bsm_user_phone
   - bsm_user_email
   - bsm_user_nin
   If not present, fields remain empty but user is shown a calm note in error messages when validating.
*/
const legalNameInput = qs("#legalName");
const phoneInput = qs("#phone");
const emailInput = qs("#email");

const loginFullName = localStorage.getItem("bsm_user_fullName") || "";
const loginPhone = localStorage.getItem("bsm_user_phone") || "";
const loginEmail = localStorage.getItem("bsm_user_email") || "";
const loginNin = localStorage.getItem("bsm_user_nin") || "";

legalNameInput.value = loginFullName;
phoneInput.value = loginPhone;
emailInput.value = loginEmail;

/* ---------- State ---------- */
const state = {
  selects: {},
  uploads: {},
  checkboxes: {},
  fields: {},
};

/* ---------- Check for existing verification status ---------- */

/* ---------- Back button behavior ---------- */
backBtn.addEventListener("click", (e) => {
  e.preventDefault();
  // Navigate back to marketplace - in-app route or homepage
  window.location.href = "../marketplace/marketplace.html";
});

/* ---------- Accordion ---------- */
whyToggle.addEventListener("click", () => {
  const expanded = whyToggle.getAttribute("aria-expanded") === "true";
  whyToggle.setAttribute("aria-expanded", String(!expanded));
  whyPanel.hidden = expanded;
});

/* ---------- Custom Select Implementation ---------- */
function initCustomSelects() {
  const selects = qsa(".custom-select");
  selects.forEach((sel) => {
    const toggle = qs(".select-toggle", sel);
    const options = qs(".select-options", sel);
    const valueEl = qs(".select-value", sel);
    const name = sel.dataset.name;
    state.selects[name] = { value: "", el: sel };

    // open/close
    const open = () => {
      options.style.display = "block";
      toggle.setAttribute("aria-expanded", "true");
      options.setAttribute("aria-hidden", "false");
    };
    const close = () => {
      options.style.display = "none";
      toggle.setAttribute("aria-expanded", "false");
      options.setAttribute("aria-hidden", "true");
    };

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) close();
      else open();
    });

    // keyboard support
    sel.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle.click();
      } else if (e.key === "Escape") {
        close();
        toggle.focus();
      }
    });

    // option selection
    qsa("li", options).forEach((li) => {
      li.addEventListener("click", () => {
        const val = li.dataset.value || li.textContent.trim();
        valueEl.textContent = li.textContent.trim();
        qsa("li", options).forEach((x) => x.removeAttribute("aria-selected"));
        li.setAttribute("aria-selected", "true");
        state.selects[name].value = val;
        close();
        validateField(name);
        updateSubmitState();
      });
    });

    // close on outside click
    document.addEventListener("click", (ev) => {
      if (!sel.contains(ev.target)) close();
    });
  });
}

/* ---------- Custom Upload Implementation ---------- */
function initUploads() {
  const uploads = qsa(".upload");
  uploads.forEach((u) => {
    const fileInput = qs(".file-input", u);
    const drop = qs(".upload-drop", u);
    const info = qs(".upload-info", u);
    const name = u.dataset.name;
    state.uploads[name] = { file: null, el: u };

    // open file dialog
    qs(".btn-upload", u).addEventListener("click", () => fileInput.click());

    // drag & drop
    ["dragenter", "dragover"].forEach((evt) => {
      u.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        u.style.borderColor = "rgba(29,161,242,0.6)";
        u.style.background = "#fbfdff";
      });
    });
    ["dragleave", "drop"].forEach((evt) => {
      u.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        u.style.borderColor = "";
        u.style.background = "";
      });
    });
    u.addEventListener("drop", (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length) {
        handleFile(dt.files[0], name, info);
      }
    });

    // file input change
    fileInput.addEventListener("change", (e) => {
      if (fileInput.files && fileInput.files[0]) {
        handleFile(fileInput.files[0], name, info);
      }
    });

    // keyboard: Enter opens file dialog
    u.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fileInput.click();
      }
    });
  });

  function handleFile(file, name, infoEl) {
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      state.uploads[name].file = null;
      infoEl.innerHTML = `<div class="error">We accept PDF, JPG, PNG only. Please upload a supported file.</div>`;
      validateField(name);
      updateSubmitState();
      return;
    }
    // success UI
    state.uploads[name].file = file;
    infoEl.innerHTML = `<div class="upload-success"><strong>${escapeHtml(file.name)}</strong> &middot; ${bytesToSize(file.size)}</div>`;
    validateField(name);
    updateSubmitState();
  }
}

/* ---------- Escape HTML for filenames ---------- */
function escapeHtml(str) {
  return String(str).replace(
    /[&<>\"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '\"': "&quot;",
        "'": "&#39;",
      })[m],
  );
}

// Assuming ENDPOINTS and token are available globally from side-nav.js
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

/* ---------- Inline Validation ---------- */
function validateField(name) {
  // Map name to UI error element and rules
  const errors = {
    businessType: { required: true, el: qs("#businessTypeError") },
    legalName: {
      required: true,
      el: qs("#legalNameError"),
      value: legalNameInput.value,
    },
    brandName: {
      required: true,
      el: qs("#brandNameError"),
      value: qs("#brandName").value.trim(),
    },
    phone: { required: true, el: qs("#phoneError"), value: phoneInput.value },
    email: { required: true, el: qs("#emailError"), value: emailInput.value },
    resAddress: {
      required: true,
      el: qs("#resAddressError"),
      value: qs("#resAddress").value.trim(),
    },
    stateCity: { required: true, el: qs("#stateCityError") },
    idMeans: { required: true, el: qs("#idMeansError") },
    idDoc: { required: true, el: qs("#idDocError") },
    proofAddress: { required: true, el: qs("#proofAddressError") },
    // eventAuth is optional
    whatSell: { required: true, el: qs("#whatSellError") },
    monthlyVolume: { required: true, el: qs("#monthlyVolumeError") },
    businessDesc: {
      required: true,
      el: qs("#businessDescError"),
      value: qs("#businessDesc").value.trim(),
    },
    confirmAccurate: { required: true, el: qs("#confirmAccurateError") },
    understandSuspension: {
      required: true,
      el: qs("#understandSuspensionError"),
    },
  };

  const rule = errors[name];
  if (!rule) return true;

  const el = rule.el;
  el.textContent = "";
  el.classList.remove("hidden");

  // Evaluate required
  if (rule.required) {
    let valid = true;
    switch (name) {
      case "businessType":
        valid = Boolean(
          state.selects.businessType && state.selects.businessType.value,
        );
        if (!valid)
          el.textContent =
            "Please select your business type so we know which verification steps apply.";
        break;
      case "legalName":
        valid = Boolean(rule.value && rule.value.trim().length > 0);
        if (!valid)
          el.textContent =
            "Your legal name is required to match your government ID.";
        break;
      case "brandName":
        valid = Boolean(rule.value && rule.value.length >= 2);
        if (!valid)
          el.textContent =
            "Provide your business or brand name so buyers can identify your listings.";
        break;
      case "phone":
        valid = Boolean(rule.value && rule.value.trim().length > 0);
        if (!valid)
          el.textContent =
            "A phone number is required for verification and urgent contact.";
        break;
      case "email":
        valid = Boolean(rule.value && rule.value.includes("@"));
        if (!valid)
          el.textContent =
            "A valid email address is required to receive verification updates.";
        break;
      case "resAddress":
        valid = Boolean(rule.value && rule.value.length >= 10);
        if (!valid)
          el.textContent =
            "Please provide a full residential address so we can confirm identity.";
        break;
      case "stateCity":
        valid = Boolean(
          state.selects.stateCity && state.selects.stateCity.value,
        );
        if (!valid)
          el.textContent =
            "Select your state and city to help us verify local permissions.";
        break;
      case "idMeans":
        valid = Boolean(state.selects.idMeans && state.selects.idMeans.value);
        if (!valid)
          el.textContent =
            "Select the type of ID you will upload so we can validate the document.";
        break;
      case "idDoc":
        valid = Boolean(state.uploads.idDoc && state.uploads.idDoc.file);
        if (!valid)
          el.textContent =
            "Upload a clear scan or photo of your ID (PDF, JPG, PNG).";
        break;
      case "proofAddress":
        valid = Boolean(
          state.uploads.proofAddress && state.uploads.proofAddress.file,
        );
        if (!valid)
          el.textContent =
            "Upload a recent utility bill or bank statement as proof of address.";
        break;
      case "whatSell":
        const checked = qsa('input[name="sell[]"]:checked', form);
        valid = checked.length > 0;
        if (!valid)
          el.textContent =
            "Select at least one category you will sell so buyers can find your listings.";
        break;
      case "monthlyVolume":
        valid = Boolean(
          state.selects.monthlyVolume && state.selects.monthlyVolume.value,
        );
        if (!valid)
          el.textContent =
            "Estimate your monthly ticket volume to help us assess verification level.";
        break;
      case "businessDesc":
        valid = Boolean(rule.value && rule.value.length >= 20);
        if (!valid)
          el.textContent =
            "Provide a brief description (at least 20 characters) about your business or events.";
        break;
      case "confirmAccurate":
        valid = qs("#confirmAccurate").checked;
        if (!valid)
          el.textContent =
            "You must confirm that the information provided is accurate.";
        break;
      case "understandSuspension":
        valid = qs("#understandSuspension").checked;
        if (!valid)
          el.textContent =
            "You must acknowledge that false information may lead to suspension.";
        break;
      default:
        valid = true;
    }
    return valid;
  }
  return true;
}

/* ---------- Validate all fields and update submit button ---------- */
function validateAll() {
  const names = [
    "businessType",
    "legalName",
    "brandName",
    "phone",
    "email",
    "resAddress",
    "stateCity",
    "idMeans",
    "idDoc",
    "proofAddress",
    "whatSell",
    "monthlyVolume",
    "businessDesc",
    "confirmAccurate",
    "understandSuspension",
  ];
  let allValid = true;
  names.forEach((n) => {
    const ok = validateField(n);
    if (!ok) allValid = false;
  });
  return allValid;
}

function updateSubmitState() {
  const valid = validateAll();
  submitBtn.disabled = !valid;
}

/* ---------- Wire up inputs for live validation ---------- */
function wireInputs() {
  // textareas and inputs
  qsa(
    'input[type="text"], input[type="email"], input[type="tel"], textarea',
    form,
  ).forEach((inp) => {
    inp.addEventListener("input", () => {
      // update state for fields that rely on input
      if (inp.id === "brandName") validateField("brandName");
      if (inp.id === "resAddress") validateField("resAddress");
      if (inp.id === "businessDesc") validateField("businessDesc");
      updateSubmitState();
    });
  });

  // checkboxes
  qsa('input[type="checkbox"]', form).forEach((cb) => {
    cb.addEventListener("change", () => {
      validateField("whatSell");
      validateField("confirmAccurate");
      validateField("understandSuspension");
      updateSubmitState();
    });
  });

  // custom selects are validated when selection occurs (see initCustomSelects)
}

/* ---------- Form submission ---------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  // final validation
  const ok = validateAll();
  if (!ok) {
    // focus first error
    const firstError = qs(".error:not(.hidden):not(:empty)");
    if (firstError) {
      const field = firstError.previousElementSibling || firstError;
      field.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  // show loading state
  submitBtn.classList.add("loading");
  submitBtn.disabled = true;

  const formData = new FormData();
  // Append all text/select fields
  formData.append("business_type", state.selects.businessType.value);
  formData.append("legal_name", legalNameInput.value);
  formData.append("brand_name", qs("#brandName").value.trim()); // From TicketVendor
  formData.append("phone_number", phoneInput.value);
  formData.append("email", emailInput.value);
  formData.append("residential_address", qs("#resAddress").value.trim());
  formData.append("state", state.selects.stateCity.value);
  formData.append("id_type", state.selects.idMeans.value);
  const whatSellValues = qsa('input[name="sell[]"]:checked', form).map(
    (cb) => cb.value,
  );
  formData.append("what_will_you_sell", whatSellValues.join(",")); // Assuming backend expects comma-separated
  formData.append("monthly_volume", state.selects.monthlyVolume.value);
  formData.append("business_description", qs("#businessDesc").value.trim());
  formData.append("confirm_accurate", qs("#confirmAccurate").checked);
  formData.append("understand_suspension", qs("#understandSuspension").checked);

  // Append files
  if (state.uploads.idDoc.file) {
    formData.append("id_document", state.uploads.idDoc.file);
  }
  if (state.uploads.proofAddress.file) {
    formData.append("proof_of_address", state.uploads.proofAddress.file);
  }
  if (state.uploads.eventAuth && state.uploads.eventAuth.file) {
    // eventAuth is optional
    formData.append(
      "event_authorization_document",
      state.uploads.eventAuth.file,
    );
  }
  showLoader();
  const response = await postFileRequest(ENDPOINTS.create_vendor, formData);

  submitBtn.classList.remove("loading");
  submitBtn.disabled = false; // Re-enable for potential retry or further action
  hideLoader();
  if (response.success) {
    showToast(response.message);
    // Set status to pending
    showSuccessScreen();
  } else {
    showToast(response.error);
  }
});

/* ---------- Show success screen ---------- */
function showSuccessScreen() {
  // Hide form container
  if (formContainer) formContainer.hidden = true;
  // Show success
  successScreen.hidden = false;
}

/* ---------- Status and navigation actions ---------- */
if (statusBtn) {
  statusBtn.addEventListener("click", () => {
    // In-app status page
    window.location.href = "/verification-status";
  });
}
if (backToMarket) {
  backToMarket.addEventListener("click", () => {
    // Corrected: backToMarket.addEventListener
    window.location.href = "../marketplace/marketplace.html";
  });
}

/* ---------- Initialize everything ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  initCustomSelects();
  initUploads();
  wireInputs();

  // initial validation state
  //updateSubmitState();
});
async function getUser() {
  const user = await getRequest(ENDPOINTS.user);
  emailInput.value = user.email;
  legalNameInput.value = user.surname + " " + user.other_names;
  phoneInput.value = user.phone;
}
getUser();

function showToast(msg, ms = 8200) {
  const t = document.getElementById("toast");
  if (!t) {
    alert(msg);
    return;
  }
  t.textContent = msg;
  t.hidden = false;
  t.style.opacity = "1";
  clearTimeout(t._hideTO);
  t._hideTO = setTimeout(() => {
    t.hidden = true;
  }, ms);
}

async function vendorStatus() {
  const response = await getRequest(ENDPOINTS.vendor_status);
  let status = response.vendor.verification_status;
  if (status === "approved") {
    document.getElementById("successScreen").textContent = "Already A Verified Vendor ";
    document.getElementById("successScreen").hidden = false;
    document.getElementById("formContainer").style.display = 'none';
    document.getElementsByTagName('footer').style.display = 'none'
  } else if (status === "pending") {
    document.getElementById("successScreen").hidden = false;
    document.getElementById("formContainer").style.display = 'none';
    document.getElementsByTagName('footer').style.display = 'none'
  }
  else if (status === "rejected") {
    showToast("Previous application was rejected")
  }
}
vendorStatus()