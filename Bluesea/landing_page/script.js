const partnerBtn = document.getElementById("openPartner");
const feedbackBtn = document.getElementById("openFeedback");

const partnerModal = document.getElementById("partnerModal");
const feedbackModal = document.getElementById("feedbackModal");

partnerBtn.onclick = () => partnerModal.style.display = "flex";
feedbackBtn.onclick = () => feedbackModal.style.display = "flex";

window.onclick = e => {
  if (e.target.classList.contains("modal")) {
    partnerModal.style.display = "none";
    feedbackModal.style.display = "none";
  }
};

document.querySelectorAll(".close-modal").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
  };
});

window.onclick = e => {
  if (e.target.classList.contains("modal")) {
    document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
  }
};


