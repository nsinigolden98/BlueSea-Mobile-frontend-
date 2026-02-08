const modal = document.getElementById("modal");
const inviteModal = document.getElementById("inviteModal");
const eventList = document.getElementById("eventList");

openCreate.onclick = () => modal.classList.remove("hidden");
closeModal.onclick = () => modal.classList.add("hidden");
closeInvite.onclick = () => inviteModal.classList.add("hidden");

/* Hosted By caps */
eventForm.hostedBy.oninput = e => {
  e.target.value = e.target.value.replace(/\b\w/g,l=>l.toUpperCase());
};

/* Category */
let category="";
document.querySelectorAll(".category-grid button").forEach(b=>{
  b.onclick=()=>{
    document.querySelectorAll(".category-grid button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    category=b.dataset.cat;
  };
});

/* Banner upload */
const bannerBox=document.getElementById("bannerBox");
const bannerInput=document.getElementById("bannerInput");
const thumb=bannerBox.querySelector(".thumb");
const fileName=bannerBox.querySelector(".file-name");
const removeBtn=document.getElementById("removeBanner");

bannerBox.onclick=()=>bannerInput.click();
bannerInput.onchange=e=>{
  const f=e.target.files[0];
  if(!f) return;
  thumb.style.backgroundImage=`url(${URL.createObjectURL(f)})`;
  fileName.textContent=f.name;
  removeBtn.classList.remove("hidden");
};
removeBtn.onclick=e=>{
  e.stopPropagation();
  bannerInput.value="";
  thumb.style.backgroundImage="";
  fileName.textContent="No file selected";
  removeBtn.classList.add("hidden");
};

/* Date */
eventForm.date.oninput=e=>{
  let v=e.target.value.replace(/\D/g,"");
  if(v.length>=3)v=v.slice(0,2)+"/"+v.slice(2);
  if(v.length>=6)v=v.slice(0,5)+"/"+v.slice(5,9);
  e.target.value=v;
};

/* Time */
eventForm.time.oninput=e=>{
  let v=e.target.value.replace(/\D/g,"");
  if(v.length>=3)v=v.slice(0,2)+":"+v.slice(2,4);
  e.target.value=v;
};

/* Tickets */
document.querySelectorAll("input[name='priceType']").forEach(r=>{
  r.onchange=()=>ticketTiers.classList.toggle("hidden",r.value==="free");
});

document.querySelectorAll(".tier input[type=checkbox]").forEach(c=>{
  c.onchange=()=>{
    c.closest(".tier").querySelector(".tier-fields")
      .classList.toggle("hidden",!c.checked);
  };
});

/* Submit */
eventForm.onsubmit=e=>{
  e.preventDefault();
  eventList.classList.remove("empty");
  eventList.innerHTML+=`
    <div class="event-card">
      <h3>${eventForm.title.value}</h3>
      <p>${category}</p>
      <div class="actions">
        <button class="primary-btn invite-btn">Invite Moderator</button>
        <button class="primary-btn">Manage Event</button>
      </div>
    </div>`;
  modal.classList.add("hidden");
  eventForm.reset();
};

/* Invite modal */
document.addEventListener("click",e=>{
  if(e.target.classList.contains("invite-btn")){
    inviteModal.classList.remove("hidden");
  }
});
