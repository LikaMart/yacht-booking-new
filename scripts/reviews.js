// ============================================================
// reviews.js - რევიუების ჩვენება და დამატება
// გვერდი: pages/reviews.html
// localStorage-ში ინახება - გვერდის გადატვირთვაზე არ იშლება
// ============================================================
import { showMsg } from "./theme.js";

// სტატიკური რევიუები უკვე HTML-შია, localStorage-დან ვამატებთ დამატებულებს
function loadSavedReviews() {
  const saved = JSON.parse(localStorage.getItem("userReviews") || "[]");
  const grid = document.getElementById("reviewsGrid");

  saved.forEach((review) => {
    grid.appendChild(createReviewCard(review));
  });
}

// რევიუს card-ის შექმნა
function createReviewCard(review) {
  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
  const card = document.createElement("div");
  card.classList.add("review-card");
  card.innerHTML = `
    <div class="review-header">
      <div class="review-avatar">${review.name.charAt(0)}</div>
      <div>
        <p class="review-name">${review.name}</p>
        <p class="review-date">${review.date}</p>
      </div>
      <div class="review-stars">${stars}</div>
    </div>
    <p class="review-text">${review.text}</p>
  `;
  return card;
}

loadSavedReviews();

// --- რევიუს დამატება ---
document.getElementById("addReviewBtn").addEventListener("click", () => {
  const msgEl = document.getElementById("reviewMsg");
  const name = document.getElementById("r-name").value.trim();
  const rating = parseInt(document.getElementById("r-rating").value);
  const text = document.getElementById("r-text").value.trim();

  if (!name || !text) {
    showMsg(msgEl, "სახელი და კომენტარი შეავსეთ", "error");
    return;
  }

  const review = {
    name,
    rating,
    text,
    date: new Date().toLocaleDateString("ka-GE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };

  // localStorage-ში ვინახავთ
  const saved = JSON.parse(localStorage.getItem("userReviews") || "[]");
  saved.unshift(review); // ახალი პირველი
  localStorage.setItem("userReviews", JSON.stringify(saved));

  // გვერდზე ვამატებთ
  const grid = document.getElementById("reviewsGrid");
  grid.insertBefore(createReviewCard(review), grid.firstChild);

  // ველებს ვასუფთავებთ
  document.getElementById("r-name").value = "";
  document.getElementById("r-text").value = "";

  showMsg(msgEl, "რევიუ დაემატა!", "success");
});