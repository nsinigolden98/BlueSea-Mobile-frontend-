document.addEventListener('DOMContentLoaded', function() {
   getUser();
   
});

async function getUser() {
    const user = await getRequest(ENDPOINTS.user);
    console.log(user);
    document.getElementById("name").textContent = user.other_names;
    document.getElementById("email").textContent = user.email;
    document.getElementById("full_name").textContent = user.surname + " " +user.other_names;
    document.getElementById("phone_number").textContent = user.phone;
}