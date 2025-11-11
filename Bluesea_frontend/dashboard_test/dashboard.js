'use strict;'
 
// Load User Data
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
});

const API_BASE = 'http://127.0.0.1:8000'; // from Postman collection
const token = localStorage.getItem('access_token') ;
const ENDPOINTS = {
    theme: `${API_BASE}/api/user_preference/theme/`,
  };
  
//);  
//document.body.setAttribute('data-theme', "dark");

    /* ------------- DOM helpers ------------- */
const root = document.documentElement;
const $ = (sel, ctx = document) => (ctx || document).querySelector(sel);
const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));
const safeAdd = (el, ev, cb) => { if (el) el.addEventListener(ev, cb); };

function showToast(msg, ms = 8200) {
    const t = $("#bsdash_toast");
    if (!t) { alert(msg); return; }
    t.textContent = msg;
    t.hidden = false;
    t.style.opacity = 1;
    clearTimeout(t._hideTO);
    t._hideTO = setTimeout(() => { t.hidden = true; }, ms);
  }
  
  // Get Requset Function 
async function getRequest(url){
      try {
        const response = await fetch(url, {
            headers: { "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            },
        });
        const json = await response.json().catch(() => ({})); 
        //console.log(json)
        return json;
    }
    catch (err) {
        // Only network or fundamental request errors reach here
        return { ok: false, status: 0, data: { error: "Network error" } };
    }
  }  
  
  // Put Request Function 
async function putRequest(url,payload){
      try {
        const response = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(payload)
        });
        const json = await response.json().catch(() => ({})); 
       // console.log(json.theme_color.trim());
        // Return the structured response
        return json ;
    }
    catch (err) {
        // Only network or fundamental request errors reach here
        return { ok: false, status: 0, data: { error: "Network error" } };
    }
  }

async function loadTheme() {
    let  theme = await getRequest(ENDPOINTS.theme);
    let theme_text = theme.theme_color;
    //let name = theme.email;
    console.log(theme);
    console.log(theme_text);
    document.getElementById("bsdash_username").textContent = name;
    root.setAttribute('data-theme', theme_text);
    document.body.setAttribute('data-theme', theme_text);
}
  
safeAdd($("#bsdash_toggle_theme"), "click", async function changeTheme() {
    const newTheme = root.getAttribute('data-theme') === "dark" ? "light" : "dark";
       let theme = await putRequest(ENDPOINTS.theme,{theme_color : newTheme});
        let theme_text = theme.theme_color;
        root.setAttribute('data-theme', theme_text);
        document.body.setAttribute('data-theme', theme_text);
    
});