// ============================================================
// login.js - შესვლა, რეგისტრაცია + localStorage-ის ჩვენება
// ============================================================
import { AUTH_URL, showMsg } from "./theme.js";

// --- TAB გადართვა ---
const tabLogin    = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm   = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

function showTab(tab) {
  if (tab === "login") {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
  } else {
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
  }
}

tabLogin.addEventListener("click", () => showTab("login"));
tabRegister.addEventListener("click", () => showTab("register"));
document.getElementById("goToRegister").addEventListener("click", (e) => { e.preventDefault(); showTab("register"); });
document.getElementById("goToLogin").addEventListener("click", (e) => { e.preventDefault(); showTab("login"); });

if (new URLSearchParams(window.location.search).get("tab") === "register") {
  showTab("register");
}

// ============================================================
// localStorage ინფო - ყოველთვის ჩანს (შესული იყო თუ გულწრფელი სტუმარი)
// ============================================================
function renderStorageInfo() {
  const el = document.getElementById("tokenInfo");
  if (!el) return;

  const token  = localStorage.getItem("authToken");
  const name   = localStorage.getItem("userName");
  const theme  = localStorage.getItem("theme") || "light";
  const reviews = JSON.parse(localStorage.getItem("userReviews") || "[]").length;

  const status = token
    ? `<span class="token-status-in">✅ შესული</span>`
    : `<span class="token-status-out">👤 სტუმარი</span>`;

  const tokenRow = token
    ? `<div class="token-row">
         <span class="token-label">🔑 authToken</span>
         <span class="token-value token-mono">${token.substring(0, 52)}…</span>
       </div>`
    : `<div class="token-row">
         <span class="token-label">🔑 authToken</span>
         <span class="token-value token-status-out">— (არ არის)</span>
       </div>`;

  const nameRow = name
    ? `<div class="token-row">
         <span class="token-label">👤 userName</span>
         <span class="token-value">${name}</span>
       </div>`
    : "";

  el.innerHTML = `
    <div class="token-card">
      <p class="token-section-title">📦 localStorage — მიმდინარე მდგომარეობა</p>
      <div class="token-row">
        <span class="token-label">ℹ️ სტატუსი</span>
        <span class="token-value">${status}</span>
      </div>
      ${tokenRow}
      ${nameRow}
      <div class="token-row">
        <span class="token-label">🎨 theme</span>
        <span class="token-value">${theme}</span>
      </div>
      <div class="token-row">
        <span class="token-label">💬 userReviews</span>
        <span class="token-value">${reviews} რევიუ შენახულია</span>
      </div>
    </div>`;
}

renderStorageInfo();

// ============================================================
// REGISTER
// ============================================================
document.getElementById("registerSubmitBtn").addEventListener("click", async () => {
  const msgEl    = document.getElementById("registerMsg");
  const firstName = document.getElementById("reg-name").value.trim();
  const lastName  = document.getElementById("reg-surname").value.trim();
  const email     = document.getElementById("reg-email").value.trim();
  const password  = document.getElementById("reg-password").value.trim();

  if (!firstName || !lastName || !email || !password) {
    showMsg(msgEl, "ყველა ველი შეავსეთ", "error"); return;
  }
  if (password.length < 6) {
    showMsg(msgEl, "პაროლი მინ. 6 სიმბოლო", "error"); return;
  }

  try {
    const resp = await fetch(`${AUTH_URL}/Users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password, phoneNumber: "", role: "User" }),
    });
    const text = await resp.text();
    if (resp.ok) {
      showMsg(msgEl, "რეგისტრაცია წარმატებულია! შედით ანგარიშში.", "success");
      setTimeout(() => showTab("login"), 1500);
    } else {
      showMsg(msgEl, text || "შეცდომა — სცადეთ თავიდან", "error");
    }
  } catch (err) {
    showMsg(msgEl, `კავშირის შეცდომა: ${err.message}`, "error");
  }
});

// ============================================================
// LOGIN
// ============================================================
document.getElementById("loginSubmitBtn").addEventListener("click", async () => {
  const msgEl   = document.getElementById("loginMsg");
  const email   = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!email || !password) {
    showMsg(msgEl, "ელ-ფოსტა და პაროლი შეავსეთ", "error"); return;
  }

  try {
    const resp = await fetch(`${AUTH_URL}/Users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, phoneNumber: "", firstName: "", lastName: "", role: "" }),
    });
    const data = await resp.json();

    if (resp.ok) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userName", data.firstName || email.split("@")[0]);
      showMsg(msgEl, "წარმატებით შეხვედით!", "success");
      renderStorageInfo(); // განაახლე storage panel-ი
      setTimeout(() => { window.location.href = "../pages/index.html"; }, 1200);
    } else {
      showMsg(msgEl, data.message || "არასწორი ელ-ფოსტა ან პაროლი", "error");
    }
  } catch (err) {
    showMsg(msgEl, `კავშირის შეცდომა: ${err.message}`, "error");
  }
});