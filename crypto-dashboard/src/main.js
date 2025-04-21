import { loginAnonymous, watchAuth } from "./module/auth.js";
import { salvaPreferito, rimuoviPreferito, caricaPreferiti } from "./module/db.js";

let currentUser = null;
let fetchData = [];
let sortDirection = "asc";

// DOM Ready
document.addEventListener("DOMContentLoaded", async () => {
  // Init Auth
  currentUser = await loginAnonymous();
  watchAuth((user) => {
    currentUser = user;
    console.log("user loggato:", user.uid);
  });

  // Init UI
  setupThemeToggle();
  setupSorting();
  setupSearch();
  await fetchCryptos();
});

function setupThemeToggle() {
  const toggleThemeButton = document.getElementById("toggleTheme");
  toggleThemeButton.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  });

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
  // In fondo a setupThemeToggle()
  if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  }
}

async function fetchCryptos() {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false");
    if (!response.ok) throw new Error("Errore HTTP: " + response.status);

    const data = await response.json();
    fetchData = data;
    renderCards(fetchData);
  } catch (error) {
    console.error("errore nella chiamata:", error);
  }
}

function renderCards(cryptoArray) {
  const divCrypto = document.getElementById("cryptoContainer");
  divCrypto.innerHTML = '';

  caricaPreferiti(currentUser.uid).then(preferiti => {
    cryptoArray.forEach(crypto => {
      const card = renderCard(crypto, preferiti);
      divCrypto.appendChild(card);
    });
  });
} 

function renderCard(crypto, preferiti = []) {
  const card = document.createElement("div");
  card.className = "card flex justify-between items-center p-4 bg-white rounded-lg shadow transition hover:scale-105";

  const color = crypto.price_change_percentage_24h < 0 ? "text-red-500" : "text-green-500";

  const isPreferito = preferiti.some(p => p.id === crypto.id);
  const starIcon = isPreferito ? "⭐" : "☆";
  const starColor = isPreferito ? "text-yellow-400" : "text-gray-400";

  card.innerHTML = `
    <div>
      <h2 class="text-xl font-semibold">${crypto.name} (${crypto.symbol.toUpperCase()})</h2>
      <p class="text-gray-600">💰 Prezzo: $${crypto.current_price.toLocaleString()}</p>
      <p class="${color}">📈 24h: ${crypto.price_change_percentage_24h.toFixed(2)}%</p>
      <p class="text-sm text-gray-400">📊 Volume: $${crypto.total_volume.toLocaleString()}</p>
      <button 
        class="favorite-btn ${starColor} text-2xl hover:scale-110 transition"
        data-id="${crypto.id}"
        title="Aggiungi/Rimuovi dai preferiti">
        ${starIcon}
      </button>
    </div>
    <img src="${crypto.image}" alt="${crypto.name}" class="w-10 h-10">
  `;

  const favBtn = card.querySelector(".favorite-btn");
  favBtn.addEventListener("click", async () => {
    if (!currentUser) return;

    const isActive = favBtn.textContent === "⭐";

    if (isActive) {
      await rimuoviPreferito(currentUser.uid, crypto.id);
      favBtn.textContent = "☆";
      favBtn.classList.replace("text-yellow-400", "text-gray-400");
    } else {
      await salvaPreferito(currentUser.uid, crypto);
      favBtn.textContent = "⭐";
      favBtn.classList.replace("text-gray-400", "text-yellow-400");
    }
  });

  return card;
}

function setupSearch() {
  const search = document.getElementById("search");
  search.addEventListener("input", (e) => {
    const searchValue = e.target.value.toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
      const name = card.querySelector("h2").textContent.toLowerCase();
      card.style.display = name.includes(searchValue) ? "flex" : "none";
    });
  });
}

function setupSorting() {
  const btnPrice = document.getElementById("sort-price");
  const btnChange = document.getElementById("sort-change");
  const btnVolume = document.getElementById("sort-volume");
  const btn_favorites = document.getElementById("show-favorite");

  btnPrice.addEventListener("click", () => sortBy("current_price"));
  btnChange.addEventListener("click", () => sortBy("price_change_percentage_24h"));
  btnVolume.addEventListener("click", () => sortBy("total_volume"));
  btn_favorites.addEventListener('click', async () => {
    if (!currentUser) return;
  
    // 1. Prendo solo gli ID dei preferiti
    const preferiti = await caricaPreferiti(currentUser.uid);
    const ids = preferiti.map(p => p.id);
  
    // 2. Filtro l'array completo
    const filtered = fetchData.filter(c => ids.includes(c.id));
  
    // 3. Re-renderizzo SOLO i preferiti
    renderCards(filtered);
  });
}

function sortBy(field) {
  const sorted = [...fetchData].sort((a, b) => {
    return sortDirection === "asc" ? a[field] - b[field] : b[field] - a[field];
  });
  renderCards(sorted);
}

