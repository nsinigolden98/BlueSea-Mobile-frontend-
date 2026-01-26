const statusText = document.getElementById("statusText");
const headline = document.getElementById("headline");
const checkmarkSvg = document.querySelector(".checkmark-svg");
const checkmarkPath = document.querySelector(".checkmark-path");
const listItems = document.querySelectorAll(".confirmation-list li");
const doneBtn = document.getElementById("doneBtn");
const overlay = document.getElementById("overlay");

const microMessages = [
  "Establishing secure channel…",
  "Confirming network response…",
  "Final settlement in progress…"
];

let index = 0;

const microInterval = setInterval(() => {
  statusText.textContent = microMessages[index % microMessages.length];
  index++;
}, 1500);

setTimeout(() => {
  clearInterval(microInterval);

  statusText.textContent = "Transaction secured";
  headline.textContent = "Transaction Confirmed";

  checkmarkSvg.style.opacity = "1";
  checkmarkPath.style.transition = "stroke-dashoffset 0.9s ease-out";
  checkmarkPath.style.strokeDashoffset = "0";

  listItems.forEach((item, i) => {
    setTimeout(() => {
      item.style.opacity = "1";
      item.style.transform = "translateY(0)";
      item.style.transition = "all 0.6s ease";
    }, i * 400);
  });

}, 4200);

doneBtn.addEventListener("click", () => {
  overlay.style.transition = "opacity 0.4s ease";
  overlay.style.opacity = "0";

   setTimeout(() => overlay.remove(), 400);
  document.getElementById("body").style.display ="none"
});