// ============================================================
// app.js - მთავარი გვერდის ლოგიკა (index.html)
// GET: სადგურები, გამგზავრებები, ბილეთები
// POST: ბილეთის დაჯავშნა
// GET confirm: ბილეთის დადასტურება
// DELETE cancel: ბილეთის გაუქმება
// ============================================================

const BASE_URL = "https://railway.stepprojects.ge/api";
const AUTH_URL = "https://rentcar.stepprojects.ge/api";

// ============================================================
// THEME TOGGLE
// ============================================================
const themeBtn = document.getElementById("themeToggleBtn");
const themeIcon = document.getElementById("themeIcon");
const htmlEl = document.documentElement;

const savedTheme = localStorage.getItem("theme") || "light";
htmlEl.setAttribute("data-theme", savedTheme);
themeIcon.textContent = savedTheme === "dark" ? "☀️" : "🌙";

themeBtn.addEventListener("click", () => {
  const current = htmlEl.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  htmlEl.setAttribute("data-theme", next);
  themeIcon.textContent = next === "dark" ? "☀️" : "🌙";
  localStorage.setItem("theme", next);
});

// ============================================================
// BURGER MENU
// ============================================================
const burgerBtn = document.getElementById("burgerBtn");
const mobileNav = document.getElementById("mobileNav");

burgerBtn.addEventListener("click", () => {
  mobileNav.classList.toggle("open");
});

document.querySelectorAll(".mob-link").forEach((link) => {
  link.addEventListener("click", () => mobileNav.classList.remove("open"));
});

// ============================================================
// AUTH MODAL
// ============================================================
const authModal = document.getElementById("authModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const openLoginBtn = document.getElementById("openLoginBtn");
const openRegBtn = document.getElementById("openRegisterBtn");
const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

function openModal(tab = "login") {
  authModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  showTab(tab);
}

function closeModal() {
  authModal.classList.add("hidden");
  document.body.style.overflow = "";
}

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

openLoginBtn.addEventListener("click", () => openModal("login"));
openRegBtn.addEventListener("click", () => openModal("register"));
closeModalBtn.addEventListener("click", closeModal);
tabLogin.addEventListener("click", () => showTab("login"));
tabRegister.addEventListener("click", () => showTab("register"));

authModal.addEventListener("click", (e) => {
  if (e.target === authModal) closeModal();
});

// ============================================================
// AUTH STATE
// ============================================================
const guestBtns = document.getElementById("guestBtns");
const userInfo = document.getElementById("userInfo");
const welcomeMsg = document.getElementById("welcomeMsg");
const logoutBtn = document.getElementById("logoutBtn");

function checkAuthState() {
  const token = localStorage.getItem("authToken");
  const name = localStorage.getItem("userName");

  // Desktop header
  if (token) {
    userInfo.style.display = "flex";
    userInfo.classList.remove("hidden");
    guestBtns.style.display = "none";
    guestBtns.classList.add("hidden");
    welcomeMsg.textContent = name || "მომხმარებელი";
  } else {
    userInfo.style.display = "none";
    userInfo.classList.add("hidden");
    guestBtns.style.display = "flex";
    guestBtns.classList.remove("hidden");
  }

  // Mobile nav auth
  const mobGuest = document.getElementById("mobGuestBtns");
  const mobUser = document.getElementById("mobUserInfo");
  const mobWelcome = document.getElementById("mobWelcomeMsg");
  if (mobGuest && mobUser) {
    if (token) {
      mobGuest.classList.add("hidden");
      mobUser.classList.remove("hidden");
      if (mobWelcome) mobWelcome.textContent = "👤 " + (name || "მომხმარებელი");
    } else {
      mobGuest.classList.remove("hidden");
      mobUser.classList.add("hidden");
    }
  }
}

checkAuthState();

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userName");
  checkAuthState();
});

// Mobile auth button listeners
const openLoginBtn2 = document.getElementById("openLoginBtn2");
const openRegBtn2 = document.getElementById("openRegisterBtn2");
const mobLogoutBtn = document.getElementById("mobLogoutBtn");

if (openLoginBtn2)
  openLoginBtn2.addEventListener("click", () => {
    mobileNav.classList.remove("open");
    openModal("login");
  });
if (openRegBtn2)
  openRegBtn2.addEventListener("click", () => {
    mobileNav.classList.remove("open");
    openModal("register");
  });
if (mobLogoutBtn)
  mobLogoutBtn.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    checkAuthState();
  });

// ============================================================
// REGISTER - POST /api/Users/register
// ============================================================
document
  .getElementById("registerSubmitBtn")
  .addEventListener("click", async () => {
    const msgEl = document.getElementById("registerMsg");
    const firstName = document.getElementById("reg-name").value.trim();
    const lastName = document.getElementById("reg-surname").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();

    if (!firstName || !lastName || !email || !password) {
      showMsg(msgEl, "ყველა ველი შეავსეთ", "error");
      return;
    }
    if (password.length < 6) {
      showMsg(msgEl, "პაროლი მინ. 6 სიმბოლო", "error");
      return;
    }

    try {
      const resp = await fetch(`${AUTH_URL}/Users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phoneNumber: "",
          role: "User",
        }),
      });
      const text = await resp.text();
      if (resp.ok) {
        showMsg(msgEl, "რეგისტრაცია წარმატებულია! შედით ანგარიშში.", "success");
        setTimeout(() => showTab("login"), 1500);
      } else {
        showMsg(msgEl, text || "შეცდომა, სცადეთ თავიდან", "error");
      }
    } catch (err) {
      showMsg(msgEl, `კავშირის შეცდომა: ${err.message}`, "error");
    }
  });

// ============================================================
// LOGIN - POST /api/Users/login
// ============================================================
document
  .getElementById("loginSubmitBtn")
  .addEventListener("click", async () => {
    const msgEl = document.getElementById("loginMsg");
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!email || !password) {
      showMsg(msgEl, "ელ-ფოსტა და პაროლი შეავსეთ", "error");
      return;
    }

    try {
      const resp = await fetch(`${AUTH_URL}/Users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          phoneNumber: "",
          firstName: "",
          lastName: "",
          role: "",
        }),
      });
      const data = await resp.json();

      if (resp.ok) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userName", data.firstName || email.split("@")[0]);
        showMsg(msgEl, "წარმატებით შეხვედით!", "success");
        setTimeout(() => {
          closeModal();
          checkAuthState();
        }, 1000);
      } else {
        showMsg(msgEl, data.message || "არასწორი ელ-ფოსტა ან პაროლი", "error");
      }
    } catch (err) {
      showMsg(msgEl, `კავშირის შეცდომა: ${err.message}`, "error");
    }
  });

// ============================================================
// STATIONS - GET /api/stations
// ============================================================
function showStations(list) {
  const div = document.querySelector(".stations");
  div.innerHTML = "";

  if (!list || list.length === 0) {
    div.innerHTML = "<p>სადგური ვერ მოიძებნა</p>";
    return;
  }

  list.forEach((station) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <h3>${station.name}</h3>
      <p>სადგური №${station.stationNumber}</p>
    `;
    div.appendChild(card);
  });
}

async function getStations() {
  try {
    const resp = await fetch(`${BASE_URL}/stations`);
    const data = await resp.json();
    showStations(data);
  } catch (err) {
    document.querySelector(".stations").innerHTML =
      `<p style="color:var(--red)">შეცდომა: ${err.message}</p>`;
  }
}

getStations();

// სადგურების ძებნა - input + ღილაკი
const stationInput = document.getElementById("stationFilter");
const stationDropdown = document.getElementById("stationDropdown");

async function searchStations() {
  const kw = stationInput.value.trim().toLowerCase();

  if (!kw) {
    stationDropdown.style.display = "none";
    getStations();
    return;
  }

  try {
    const resp = await fetch(`${BASE_URL}/stations`);
    const data = await resp.json();
    const filtered = data.filter((s) => s.name.toLowerCase().includes(kw));

    stationDropdown.innerHTML = "";

    if (!filtered.length) {
      stationDropdown.style.display = "none";
      showStations([]);
      return;
    }

    filtered.forEach((station) => {
      const opt = document.createElement("p");
      opt.textContent = `${station.name} (№${station.stationNumber})`;
      opt.addEventListener("click", () => {
        showStations([station]);
        stationInput.value = station.name;
        stationDropdown.style.display = "none";
      });
      stationDropdown.appendChild(opt);
    });

    stationDropdown.style.display = "block";
  } catch {
    stationDropdown.style.display = "none";
  }
}

stationInput.addEventListener("input", searchStations);
document
  .getElementById("stationSearchBtn")
  .addEventListener("click", searchStations);

// ============================================================
// DEPARTURES - GET /api/departures
// ============================================================
function showDepartures(list) {
  const div = document.querySelector(".departures");
  div.innerHTML = "";

  if (!list || list.length === 0) {
    div.innerHTML = "<p>გამგზავრება ვერ მოიძებნა</p>";
    return;
  }

  list.forEach((dep) => {
    const depCard = document.createElement("div");
    depCard.classList.add("card");
    depCard.innerHTML = `
      <h3>${dep.source} → ${dep.destination}</h3>
      <p>${dep.date}</p>
    `;
    div.appendChild(depCard);

    if (dep.trains?.length) {
      dep.trains.forEach((train) => {
        const tCard = document.createElement("div");
        tCard.classList.add("card", "trainCard");
        tCard.innerHTML = `
          <h4>⚓ იახტა #${train.number} — ${train.name}</h4>
          <p>გამგ: ${train.departure} | ჩამ: ${train.arrive}</p>
        `;
        div.appendChild(tCard);
      });
    }
  });
}

async function getDepartures() {
  try {
    const resp = await fetch(`${BASE_URL}/departures`);
    const data = await resp.json();
    showDepartures(data);
  } catch (err) {
    document.querySelector(".departures").innerHTML =
      `<p style="color:var(--red)">შეცდომა: ${err.message}</p>`;
  }
}

getDepartures();

// გამგზავრებების ძებნა - input + ღილაკი
const depInput = document.getElementById("departureFilter");
const depDropdown = document.getElementById("departureDropdown");

async function searchDepartures() {
  const kw = depInput.value.trim().toLowerCase();

  if (!kw) {
    depDropdown.style.display = "none";
    getDepartures();
    return;
  }

  try {
    const resp = await fetch(`${BASE_URL}/departures`);
    const data = await resp.json();
    const filtered = data.filter(
      (d) =>
        d.destination.toLowerCase().includes(kw) ||
        d.source.toLowerCase().includes(kw),
    );

    depDropdown.innerHTML = "";

    if (!filtered.length) {
      depDropdown.style.display = "none";
      showDepartures([]);
      return;
    }

    filtered.forEach((dep) => {
      const opt = document.createElement("p");
      opt.textContent = `${dep.source} → ${dep.destination} (${dep.date})`;
      opt.addEventListener("click", () => {
        showDepartures([dep]);
        depInput.value = opt.textContent;
        depDropdown.style.display = "none";
      });
      depDropdown.appendChild(opt);
    });

    depDropdown.style.display = "block";
  } catch {
    depDropdown.style.display = "none";
  }
}

depInput.addEventListener("input", searchDepartures);
document
  .getElementById("filterDepartureBtn")
  .addEventListener("click", searchDepartures);

// ============================================================
// TICKETS - GET /api/tickets
// ============================================================
function showTickets(list) {
  const div = document.querySelector(".tickets");
  div.innerHTML = "";

  if (!list || list.length === 0) {
    div.innerHTML = "<p>ბილეთი ვერ მოიძებნა</p>";
    return;
  }

  list.forEach((ticket) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <h3>ბილეთი #${ticket.id}</h3>
      <p>${ticket.ticketPrice} ₾ | ${ticket.date} | ${
        ticket.confirmed ? "✅ დადასტ." : "⏳ მოლოდინი"
      }</p>
      <p>${ticket.email || "—"} | ${ticket.phone || "—"}</p>
    `;

    if (ticket.train) {
      const tp = document.createElement("p");
      tp.textContent = `⚓ #${ticket.train.number} | ${ticket.train.from} → ${ticket.train.to} | ${ticket.train.departure}`;
      card.appendChild(tp);
    }

    ticket.persons?.forEach((person) => {
      const pp = document.createElement("p");
      pp.textContent = `👤 ${person.name || "—"} ${person.surname || ""} | ადგ: ${person.seat?.number} | ${person.seat?.price} ₾`;
      card.appendChild(pp);
    });

    div.appendChild(card);
  });
}

async function getTickets() {
  try {
    const resp = await fetch(`${BASE_URL}/tickets`);
    const data = await resp.json();
    showTickets(data);
  } catch (err) {
    document.querySelector(".tickets").innerHTML =
      `<p style="color:var(--red)">შეცდომა: ${err.message}</p>`;
  }
}

getTickets();

// ბილეთების ძებნა ელ-ფოსტით
const ticketInput = document.getElementById("ticketFilter");
const ticketDropdown = document.getElementById("ticketsDropdown");

async function searchTickets() {
  const kw = ticketInput.value.trim();

  if (!kw) {
    ticketDropdown.style.display = "none";
    getTickets();
    return;
  }

  try {
    const resp = await fetch(`${BASE_URL}/tickets`);
    const data = await resp.json();
    const filtered = data.filter((t) => t.email?.includes(kw));

    ticketDropdown.innerHTML = "";

    if (!filtered.length) {
      ticketDropdown.style.display = "none";
      showTickets([]);
      return;
    }

    filtered.forEach((ticket) => {
      const opt = document.createElement("p");
      opt.textContent = `ბილეთი #${ticket.id} | ${ticket.email}`;
      opt.addEventListener("click", () => {
        showTickets([ticket]);
        ticketInput.value = ticket.email;
        ticketDropdown.style.display = "none";
      });
      ticketDropdown.appendChild(opt);
    });

    ticketDropdown.style.display = "block";
  } catch {
    ticketDropdown.style.display = "none";
  }
}

ticketInput.addEventListener("input", searchTickets);
document
  .getElementById("ticketSearchBtn")
  .addEventListener("click", searchTickets);

// dropdown-ის დახურვა გარეთ კლიკზე
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrap")) {
    document.querySelectorAll(".dropdown").forEach((d) => {
      d.style.display = "none";
    });
  }
});

// ============================================================
// HELPER - შეტყობინება
// ============================================================
function showMsg(el, text, type) {
  el.textContent = text;
  el.className = `auth-msg ${type}`;
  el.style.display = "block";
  setTimeout(() => {
    el.style.display = "none";
  }, 4000);
}
