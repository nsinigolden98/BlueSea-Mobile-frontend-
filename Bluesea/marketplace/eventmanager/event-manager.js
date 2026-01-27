const modal = document.getElementById("modal");
const openBtn = document.getElementById("openCreate");
const closeBtn = document.getElementById("closeModal");
const form = document.getElementById("eventForm");
const dropdown = document.getElementById("categoryDropdown");

let categoryValue = "";

openBtn.onclick = () => modal.classList.remove("hidden");
closeBtn.onclick = () => modal.classList.add("hidden");
modal.onclick = e => { if (e.target === modal) modal.classList.add("hidden"); };

// CATEGORY
dropdown.onclick = () => dropdown.classList.toggle("open");
dropdown.querySelectorAll(".dropdown-list div").forEach(opt => {
  opt.onclick = () => {
    categoryValue = opt.dataset.value;
    dropdown.querySelector(".dropdown-selected").textContent = categoryValue;
    dropdown.classList.remove("open");
  };
});

// UPLOAD PREVIEW
document.querySelectorAll(".upload-box").forEach(box => {
  box.onclick = () => box.nextElementSibling.click();
});
document.querySelectorAll("input[type=file]").forEach(input => {
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
form.date.oninput = e => {
  let v = e.target.value.replace(/\D/g,"");
  if (v.length >= 3) v = v.slice(0,2)+"/"+v.slice(2);
  if (v.length >= 6) v = v.slice(0,5)+"/"+v.slice(5,9);
  e.target.value = v;
};

// TIME LOGIC (24H)
form.time.oninput = e => {
  let v = e.target.value.replace(/\D/g,"");
  if (v.length > 0 && v[0] > 2) v = "2";
  if (v.length > 1 && v[0] == "2" && v[1] > 4) v = "24";
  if (v.length >= 3) v = v.slice(0,2)+":"+v.slice(2,4);
  e.target.value = v;
};

// PRICE TYPE
form.priceType.forEach(r => {
  r.onchange = () => {
    form.price.disabled = r.value === "free" && r.checked;
    if (form.price.disabled) form.price.value = "";
  };
});

// VALIDATION
form.oninput = () => {
  let valid = true;
  [...form.elements].forEach(el => {
    if (el.name && !el.disabled && !el.value) valid = false;
  });
  if (!categoryValue) valid = false;
  form.querySelector("button").disabled = !valid;
};

form.onsubmit = e => {
  e.preventDefault();
  modal.classList.add("hidden");
  form.reset();
  categoryValue = "";
};