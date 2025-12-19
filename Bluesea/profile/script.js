async function getUser() {
    const user = await getRequest(ENDPOINTS.user);
    document.getElementById("name").textContent = user.other_names;
    document.getElementById("email").textContent = user.email;
    document.getElementById("full_name").textContent = user.surname + " " +user.other_names;
    document.getElementById("phone_number").textContent = user.phone;
    document.getElementById("user_image").src = user.image;
}
 getUser();

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

    try {
        // ---- DEMO BACKEND SIMULATION ----
        await fakeUpload(file);

        // When backend returns image URL later:
        // profileImage.src = response.image;

        console.log("Upload successful");
    } catch (err) {
        console.error("Upload failed", err);
        alert("Failed to upload image");
    } finally {
        imageWrapper.classList.remove("loading");
    }
});

/* 3. Fake backend upload (replace later) */
function fakeUpload(file) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, 1500);
    });
    }
