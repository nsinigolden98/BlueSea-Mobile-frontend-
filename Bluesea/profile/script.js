async function getUser() {
    const user = await getRequest(ENDPOINTS.user);
    document.getElementById("name").textContent = user.other_names;
    document.getElementById("email").textContent = user.email;
    document.getElementById("full_name").textContent = user.surname + " " +user.other_names;
    document.getElementById("phone_number").textContent = user.phone;
    document.getElementById("username").textContent = user.username;
    document.getElementById("user_image").src = 
    user.image ? API_BASE + user.image : "../basic_imgs/profile.jpeg";
}
 getUser();
function showToast(msg, ms = 8200) {
    const t = document.getElementById("toast");
    if (!t) { alert(msg); return; }
    t.textContent = msg;
    t.hidden = false;
    t.style.opacity = "1";
    clearTimeout(t._hideTO);
    t._hideTO = setTimeout(() => { t.hidden = true; }, ms);
  }
//
const imageInput = document.getElementById("profile_image_input");
const profileImage = document.getElementById("user_image");
const imageWrapper = document.querySelector(".profile-image-placeholder");

/* 1. Only clicking image opens file picker */
profileImage.addEventListener("click", () => {
    imageInput.click();
});

/* 2. Handle image change */
imageInput.addEventListener("change", async () => {
    const file = imageInput.files[0];
    if (!file) return;

    // Instant preview (demo)
    const previewURL = URL.createObjectURL(file);
    profileImage.src = previewURL;

    // Loading state
    imageWrapper.classList.add("loading");
    const formData = new FormData();
    formData.append('image', file);

    let response = await patchRequest(ENDPOINTS.user, formData)
        
    showToast(response.message)
    imageWrapper.classList.remove("loading");


});
