
const toggleThemeButton = document.getElementById("toggleTheme");
const divCrypto = document.getElementById("cryptoContainer");
const search = document.getElementById("search");
const btnPrice = document.getElementById("sort-price");
const btnChange = document.getElementById("sort-change");
const btnVolume = document.getElementById("sort-volume");
fetchCryptos();


toggleThemeButton.addEventListener("click", function () {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
});

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

let fetchData = []; 
async function fetchCryptos(){
    try {
        const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false");
        if(!response.ok){
            throw new Error("Errore di tipo http" +response.status);
        }else{
            const data = await response.json();
            fetchData = data;
            renderCards(fetchData);
        }
    } catch (error) {
        console.log("errore nella chiamata: "+error)
    }
}

function renderCard(crypto){
    const card = document.createElement('div');
    card.className = "card flex justify-between items-center p-4 bg-white rounded-lg shadow transition hover:scale-105";

    const color = crypto.price_change_percentage_24h < 0 ? "text-red-500" : "text-green-500";

    card.innerHTML = `
        <div>
            <h2 class="text-xl font-semibold">${crypto.name} (${crypto.symbol.toUpperCase()})</h2>
            <p class="text-gray-600">💰 Prezzo: $${crypto.current_price.toLocaleString()}</p>
            <p class="${color}">📈 24h: ${crypto.price_change_percentage_24h.toFixed(2)}%</p>
            <p class="text-sm text-gray-400">📊 Volume: $${crypto.total_volume.toLocaleString()}</p>
        </div>
        <img src="${crypto.image}" alt="${crypto.name}" class="w-10 h-10">
    `;

    divCrypto.appendChild(card);
}

function renderCards(cryptoArray) {
    divCrypto.innerHTML = '';
    cryptoArray.forEach(crypto => renderCard(crypto));
}

search.addEventListener("input", (e) => {
    const searchValue = e.target.value.toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const name = card.querySelector("h2").textContent.toLowerCase();
        const match = name.includes(searchValue);

        card.style.display = match ? "flex" : "none";
    })
})

btnPrice.addEventListener("click", () => {
    const sorted = [...fetchData].sort((a, b) => a.current_price - b.current_price);
    renderCards(sorted);
});

btnChange.addEventListener("click", () => {
    const sorted = [...fetchData].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
    renderCards(sorted);
});

btnVolume.addEventListener("click", () => {
    const sorted = [...fetchData].sort((a, b) => a.total_volume - b.total_volume);
    renderCards(sorted);
});
