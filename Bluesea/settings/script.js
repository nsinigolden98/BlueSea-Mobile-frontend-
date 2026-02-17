async function editPin() {
        const user = await getRequest(ENDPOINTS.user)
        if (user.pin_is_set === false){
            window.parent.location.href = "pin/pin.html";
        }
        else{
            window.parent.location.href = "edit_pin/edit_pin.html";
        }
}

function deleteCookie(name) {
  // Set max-age to 0 and an expiration date in the past to delete the cookie
  document.cookie = `${name}=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

async function logOut() {
       
        const logout = await postRequest(ENDPOINTS.logout, {refresh_token})
        
        // Delete the Access Token cookie
        deleteCookie('accessToken');

        // Delete the Refresh Token cookie
        deleteCookie('refreshToken');
       window.parent.location.replace("../login/login.html")
}

