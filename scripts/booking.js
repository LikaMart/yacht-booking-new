// ============================================================
// booking.js - ბილეთის დაჯავშნა
// CASCADE: იახტა → გემბანი → ადგილების სქემა
// ინვოისი sidebar-ში ავტომატურად განახლდება
// ============================================================
import { BASE_URL, showMsg } from "./theme.js";

// ============================================================
// STATE - ყველა მდგომარეობა ერთ ობიექტში
// ============================================================
const state = {
  trains: [], // ყველა იახტა
  selectedTrain: null, // არჩეული იახტა
  vagons: [], // გემბანები
  currentVagon: null, // მიმდინარე ვაგონი (seats-ით)
  passengers: [
    {
      name: "",
      surname: "",
      idNumber: "",
      seatId: "",
      seatLabel: "",
      seatPrice: 0,
    },
  ],
  activePassengerIdx: 0, // რომელი მგზავრისთვის ვირჩევთ ადგილს
};

// ============================================================
// THEME / BURGER - theme.js-ის import-ი ამას ამუშავებს

// ============================================================
// 1. მატარებლების ჩატვირთვა
// ============================================================
async function loadTrains() {
  const select = document.getElementById("f-trainId");
  try {
    const resp = await fetch(`${BASE_URL}/trains`);
    state.trains = await resp.json();
    state.trains.forEach((train) => {
      const opt = document.createElement("option");
      opt.value = train.id;
      opt.textContent = `⚓ #${train.number} — ${train.name} | ${train.date} | ${train.departure}→${train.arrive}`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("იახტები ვერ ჩაიტვირთა:", err);
  }
}

loadTrains();

// ============================================================
// 2. მატარებლის არჩევა → ვაგონები + info card
// ============================================================
document.getElementById("f-trainId").addEventListener("change", async () => {
  const trainId = document.getElementById("f-trainId").value;
  const vagonSelect = document.getElementById("f-vagonId");

  vagonSelect.innerHTML = '<option value="">ვაგონი...</option>';
  vagonSelect.disabled = true;
  state.currentVagon = null;
  state.currentVagonId = null;
  state.selectedTrain = null;
  document.getElementById("selectedTrainCard").classList.remove("show");

  // "ადგილის არჩევა" ღილაკები disable
  document
    .querySelectorAll(".choose-seat-btn")
    .forEach((b) => (b.disabled = true));

  if (!trainId) return;

  try {
    const resp = await fetch(`${BASE_URL}/trains/${trainId}`);
    const train = await resp.json();
    state.selectedTrain = train;

    // იახტის info card
    document.getElementById("trainBadge").textContent = `#${train.number}`;
    document.getElementById("trainName").textContent = train.name;
    document.getElementById("trainDate").textContent = train.date;
    document.getElementById("trainDep").textContent = train.departure;
    document.getElementById("trainArr").textContent = train.arrive;
    document.getElementById("trainFrom").textContent = train.from;
    document.getElementById("trainTo").textContent = train.to;
    document.getElementById("selectedTrainCard").classList.add("show");

    if (train.vagons?.length) {
      train.vagons.forEach((v) => {
        const opt = document.createElement("option");
        opt.value = v.id;
        opt.textContent = v.name;
        vagonSelect.appendChild(opt);
      });
      vagonSelect.disabled = false;
    }
  } catch (err) {
    console.error("ვაგონები ვერ ჩაიტვირთა:", err);
  }
});

// ============================================================
// 3. ვაგონის არჩევა → ადგილების ჩატვირთვა
// ============================================================
document.getElementById("f-vagonId").addEventListener("change", async () => {
  const vagonId = document.getElementById("f-vagonId").value;

  state.currentVagon = null;
  state.currentVagonId = null;
  document
    .querySelectorAll(".choose-seat-btn")
    .forEach((b) => (b.disabled = true));

  if (!vagonId) return;

  // მხოლოდ ID ვინახავთ - fresh fetch გამოხსნაზე ხდება openSeatMap()-ში
  state.currentVagonId = vagonId;
  document
    .querySelectorAll(".choose-seat-btn")
    .forEach((b) => (b.disabled = false));
});

// ============================================================
// 4. კალენდარი
// ============================================================
(function initCalendar() {
  const input = document.getElementById("f-date");
  const calWrap = document.getElementById("calendarWrap");
  const today = new Date();
  let curYear = today.getFullYear();
  let curMonth = today.getMonth();

  input.addEventListener("click", () => {
    if (calWrap.classList.contains("cal-open")) {
      calWrap.classList.remove("cal-open");
    } else {
      renderCal(curYear, curMonth);
      calWrap.classList.add("cal-open");
    }
  });

  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !calWrap.contains(e.target)) {
      calWrap.classList.remove("cal-open");
    }
  });

  function renderCal(year, month) {
    const names = [
      "იანვარი",
      "თებერვალი",
      "მარტი",
      "აპრილი",
      "მაისი",
      "ივნისი",
      "ივლისი",
      "აგვისტო",
      "სექტემბერი",
      "ოქტომბერი",
      "ნოემბერი",
      "დეკემბერი",
    ];
    const days = ["კვ", "ორ", "სა", "ოთ", "ხუ", "პა", "შა"];
    const dInM = new Date(year, month + 1, 0).getDate();
    const first = (new Date(year, month, 1).getDay() + 6) % 7;
    const todayStr = `${today.getFullYear()}-${p(today.getMonth() + 1)}-${p(today.getDate())}`;

    let html = `<div class="cal-header">
      <button class="cal-nav" id="calPrev">&#8592;</button>
      <span class="cal-title">${names[month]} ${year}</span>
      <button class="cal-nav" id="calNext">&#8594;</button>
    </div><div class="cal-grid">
      ${days.map((d) => `<div class="cal-day-name">${d}</div>`).join("")}
      ${"<div class='cal-cell empty'></div>".repeat(first)}`;

    for (let d = 1; d <= dInM; d++) {
      const ds = `${year}-${p(month + 1)}-${p(d)}`;
      const past = ds < todayStr;
      const isTd = ds === todayStr;
      const isSel = ds === (input.dataset.value || "");
      html += `<button class="cal-cell${past ? " past" : ""}${isTd ? " today" : ""}${isSel ? " selected" : ""}"
        data-date="${ds}"${past ? " disabled" : ""}>${d}</button>`;
    }

    html += "</div>";
    calWrap.innerHTML = html;

    calWrap.querySelector("#calPrev").addEventListener("click", (e) => {
      e.stopPropagation();
      curMonth--;
      if (curMonth < 0) {
        curMonth = 11;
        curYear--;
      }
      renderCal(curYear, curMonth);
    });
    calWrap.querySelector("#calNext").addEventListener("click", (e) => {
      e.stopPropagation();
      curMonth++;
      if (curMonth > 11) {
        curMonth = 0;
        curYear++;
      }
      renderCal(curYear, curMonth);
    });
    calWrap
      .querySelectorAll(".cal-cell:not(.empty):not(.past)")
      .forEach((cell) => {
        cell.addEventListener("click", (e) => {
          e.stopPropagation();
          input.value = cell.dataset.date;
          input.dataset.value = cell.dataset.date;
          calWrap.classList.remove("cal-open");
        });
      });
  }

  function p(n) {
    return String(n).padStart(2, "0");
  }
})();

// ============================================================
// 5. ადგილების სქემა (modal)
// ============================================================
const seatOverlay = document.getElementById("seatModalOverlay");
const seatContainer = document.getElementById("seatMapContainer");

document.getElementById("seatModalClose").addEventListener("click", () => {
  seatOverlay.classList.add("hidden");
});

// overlay გარეთ კლიკი
seatOverlay.addEventListener("click", (e) => {
  if (e.target === seatOverlay) seatOverlay.classList.add("hidden");
});

// "ადგილის არჩევა" ღილაკი
document.addEventListener("click", (e) => {
  if (!e.target.matches(".choose-seat-btn")) return;
  const pIdx = parseInt(e.target.dataset.passenger);
  state.activePassengerIdx = pIdx;
  openSeatMap();
});

async function openSeatMap() {
  if (!state.currentVagonId) return;

  // ყოველ გახსნაზე სახელმძღვ. fresh data - "already occupied" error-ის თავიდან ასაცილებლად
  seatContainer.innerHTML = '<p style="padding:2rem;text-align:center;color:var(--text-light)">⏳ იტვირთება...</p>';
  seatOverlay.classList.remove("hidden");

  try {
    const resp = await fetch(`${BASE_URL}/getvagon/${state.currentVagonId}`);
    const data = await resp.json();
    state.currentVagon = Array.isArray(data) ? data[0] : data;
  } catch (err) {
    seatContainer.innerHTML = `<p style="padding:2rem;color:var(--red)">შეცდომა: ${err.message}</p>`;
    return;
  }

  const vagon = state.currentVagon;

  document.getElementById("seatModalTitle").textContent =
    `${vagon.name} — გემბანი #${vagon.id}`;

  // უკვე სხვა მგზავრებზე დარეზერვირებული ადგილები
  const takenIds = state.passengers
    .filter((_, i) => i !== state.activePassengerIdx)
    .map((p) => p.seatId)
    .filter(Boolean);

  // ადგილების ბადის აგება: 1A,1B | gap | 1C,1D
  const rowCount =
    Math.max(...vagon.seats.map((s) => parseInt(s.number))) || 10;

  let html = `<div class="vagon-shell">
    <div class="vagon-toilet">⚓ შესასვლელი</div>
    <div class="seat-grid">`;

  for (let r = 1; r <= rowCount; r++) {
    ["A", "B"].forEach((l) => {
      const seat = vagon.seats.find((s) => s.number === `${r}${l}`);
      html += seatBtn(seat, takenIds);
    });
    html += `<div class="seat-aisle"></div>`;
    ["C", "D"].forEach((l) => {
      const seat = vagon.seats.find((s) => s.number === `${r}${l}`);
      html += seatBtn(seat, takenIds);
    });
  }

  html += `</div><div class="vagon-toilet">⚓ გასასვლელი</div></div>`;
  seatContainer.innerHTML = html;

  // კლიკი ადგილზე
  seatContainer.querySelectorAll(".seat-btn.free").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pIdx = state.activePassengerIdx;
      const seatId = btn.dataset.seatid;
      const seatLabel = btn.dataset.label;
      const seatPrice = parseInt(btn.dataset.price) || 0;

      state.passengers[pIdx].seatId = seatId;
      state.passengers[pIdx].seatLabel = seatLabel;
      state.passengers[pIdx].seatPrice = seatPrice;

      const badge = document.getElementById(`badge-${pIdx}`);
      if (badge) {
        badge.textContent = `ადგ. ${seatLabel}`;
        badge.classList.remove("empty");
      }

      updateInvoice();
      seatOverlay.classList.add("hidden");
    });
  });
}

// ადგილის ღილაკი HTML
function seatBtn(seat, takenIds) {
  if (!seat) return `<div></div>`;
  const isTaken = seat.isOccupied || takenIds.includes(seat.seatId);
  const cls = isTaken ? "occupied" : "free";
  return `<button class="seat-btn ${cls}"
    data-seatid="${seat.seatId}"
    data-label="${seat.number}"
    data-price="${seat.price}"
    ${isTaken ? "disabled" : ""}
    title="${seat.number} — ${seat.price}₾">${seat.number}</button>`;
}

// ============================================================
// 6. მგზავრის დამატება
// ============================================================
document.getElementById("addPassengerBtn").addEventListener("click", () => {
  const idx = state.passengers.length;
  state.passengers.push({
    name: "",
    surname: "",
    idNumber: "",
    seatId: "",
    seatLabel: "",
    seatPrice: 0,
  });
  addPassengerRow(idx);
});

function addPassengerRow(idx) {
  const container = document.getElementById("passengersContainer");
  const div = document.createElement("div");
  div.classList.add("passenger-row");
  div.dataset.passenger = idx;
  div.innerHTML = `
    <div class="passenger-header">
      <div class="passenger-label">
        <span>მგზავრი ${idx + 1}</span>
        <span class="passenger-seat-badge empty" id="badge-${idx}">ადგილი არ არჩეულა</span>
      </div>
      <button class="choose-seat-btn" data-passenger="${idx}" id="chooseSeat-${idx}"
        ${state.currentVagon ? "" : "disabled"}>
        ადგილის არჩევა
      </button>
    </div>
    <div class="passenger-fields">
      <div class="form-group">
        <label>სახელი <span style="color:var(--red)">*</span></label>
        <input type="text" id="p-name-${idx}" placeholder="გიორგი" required />
      </div>
      <div class="form-group">
        <label>გვარი <span style="color:var(--red)">*</span></label>
        <input type="text" id="p-surname-${idx}" placeholder="ბაგრატიონი" required />
      </div>
      <div class="form-group">
        <label>პირადი ნომერი</label>
        <input type="text" id="p-id-${idx}" placeholder="01234567890" maxlength="11" />
      </div>
    </div>`;
  container.appendChild(div);
}

// ============================================================
// 7. ინვოისის განახლება
// ============================================================
function updateInvoice() {
  const body = document.getElementById("invoiceBody");
  const empty = document.getElementById("invoiceEmpty");
  const total = document.getElementById("invoiceTotal");

  const chosen = state.passengers.filter((p) => p.seatId);

  if (!chosen.length) {
    empty.style.display = "block";
    body.querySelectorAll(".invoice-row").forEach((r) => r.remove());
    total.textContent = "0 ₾";
    return;
  }

  empty.style.display = "none";

  // ძველი row-ები ამოვიღოთ
  body.querySelectorAll(".invoice-row").forEach((r) => r.remove());

  let sum = 0;
  chosen.forEach((p) => {
    sum += p.seatPrice;
    const row = document.createElement("div");
    row.classList.add("invoice-row");
    row.innerHTML = `<span class="seat-code">${p.seatLabel}</span>
      <span class="price">${p.seatPrice} ₾</span>`;
    body.insertBefore(row, empty);
  });

  total.textContent = `${sum} ₾`;
}

// ============================================================
// 8. POST - ბილეთის დაჯავშნა
// endpoint: POST /api/tickets/register
// ============================================================
document.getElementById("postTicketBtn").addEventListener("click", async () => {
  const msgEl = document.getElementById("bookingMsg");
  const email = document.getElementById("f-email").value.trim();
  const phone = document.getElementById("f-phone").value.trim();
  const trainId = parseInt(document.getElementById("f-trainId").value);

  // ვალიდაცია
  if (!email || !phone) {
    showMsg(msgEl, "ელ-ფოსტა და ტელეფონი შეავსეთ", "error");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMsg(msgEl, "სწორი ელ-ფოსტა შეიყვანეთ", "error");
    return;
  }
  if (!trainId) {
    showMsg(msgEl, "იახტა აირჩიეთ", "error");
    return;
  }

  // მგზავრების მონაცემები
  const people = state.passengers.map((p, i) => ({
    seatId: p.seatId || "",
    name: (document.getElementById(`p-name-${i}`)?.value || "").trim(),
    surname: (document.getElementById(`p-surname-${i}`)?.value || "").trim(),
    idNumber: (document.getElementById(`p-id-${i}`)?.value || "").trim(),
    status: "Active",
    payoutCompleted: false,
  }));

  if (people.some((p) => !p.name || !p.surname)) {
    showMsg(msgEl, "ყველა მგზავრის სახელი და გვარი შეავსეთ", "error");
    return;
  }
  if (people.some((p) => !p.seatId)) {
    showMsg(msgEl, "ყველა მგზავრს ადგილი მიუჩინეთ", "error");
    return;
  }

  try {
    const resp = await fetch(`${BASE_URL}/tickets/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainId,
        date: document.getElementById("f-date").dataset.value
          ? new Date(
              document.getElementById("f-date").dataset.value,
            ).toISOString()
          : new Date().toISOString(),
        email,
        phoneNumber: phone,
        people,
      }),
    });

    const text = await resp.text();

    if (resp.ok) {
      showMsg(msgEl, "ბილეთი წარმატებით დაჯავშნა!", "success");
    } else {
      showMsg(msgEl, text || `შეცდომა (${resp.status})`, "error");
    }
  } catch (err) {
    showMsg(msgEl, `კავშირის შეცდომა: ${err.message}`, "error");
  }
});

// ============================================================
// 9. CONFIRM - GET /api/tickets/confirm/{id}
// ============================================================
document.getElementById("putTicketBtn").addEventListener("click", async () => {
  const msgEl = document.getElementById("updateMsg");
  const id = document.getElementById("u-id").value.trim();
  if (!id) {
    showMsg(msgEl, "ბილეთის ID შეიყვანეთ", "error");
    return;
  }

  try {
    const resp = await fetch(`${BASE_URL}/tickets/confirm/${id}`);
    const text = await resp.text();
    if (resp.ok) {
      showMsg(msgEl, "ბილეთი დადასტურდა!", "success");
    } else {
      showMsg(msgEl, text || resp.status, "error");
    }
  } catch (err) {
    showMsg(msgEl, `კავშირის შეცდომა: ${err.message}`, "error");
  }
});

// ============================================================
// 10. DELETE - DELETE /api/tickets/cancel/{uuid}
// ticketId UUID ფორმატია (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
// ============================================================
document
  .getElementById("deleteTicketBtn")
  .addEventListener("click", async () => {
    const msgEl = document.getElementById("deleteMsg");
    const id = document.getElementById("d-id").value.trim();
    if (!id) {
      showMsg(msgEl, "ბილეთის ID შეიყვანეთ", "error");
      return;
    }
    if (!confirm("ბილეთი გაუქმდება. გრძელდება?")) return;

    try {
      const resp = await fetch(`${BASE_URL}/tickets/cancel/${id}`, {
        method: "DELETE",
      });
      const text = await resp.text();
      if (resp.ok) {
        showMsg(msgEl, "ბილეთი გაუქმდა!", "success");
      } else {
        showMsg(msgEl, text || resp.status, "error");
      }
    } catch (err) {
      showMsg(msgEl, `კავშირის შეცდომა: ${err.message}`, "error");
    }
  });
