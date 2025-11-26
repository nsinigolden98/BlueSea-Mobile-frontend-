// PROTECTED PAGE GUARD – Works perfectly with your cookie setup
(() => {
    function isLoggedIn() {
        const token = getCookie("accessToken");
        const refresh_token = getCookie("refreshToken");
        return !!(token || refresh_token);  // true if at least one exists
    }

    function redirectToLogin() {
        // Use replace() so user can't go back to this page
        window.location.replace("../login/login.html");
    }

    // This fires on EVERY page view — including back/forward button!
    window.addEventListener("pageshow", (event) => {
        if (event.persisted || !isLoggedIn()) {
            redirectToLogin();
        }
    });

    // Also protect normal page loads/refresh
    if (!isLoggedIn()) {
        redirectToLogin();
    }
})();