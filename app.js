const API = "https://api.warframestat.us/pc";
const starMap = document.getElementById("star-map");
const baroInfo = document.getElementById("baro-info");

const locations = [
  { name: "Cetus (Earth)", key: "cetusCycle", color: "#00aaff" },
  { name: "Fortuna (Venus)", key: "vallisCycle", color: "#ff9900" },
  { name: "Cambion Drift (Deimos)", key: "cambionCycle", color: "#bb00ff" },
  { name: "Duviri Paradox", key: "duviriCycle", color: "#00ffaa" },
  { name: "Zariman", key: "zarimanCycle", color: "#ff0055" },
];

async function fetchData(endpoint) {
  try {
    const res = await fetch(`${API}/${endpoint}`, { cache: "no-store" });
    return res.json();
  } catch (e) {
    console.error("Fetch error:", e);
    return null;
  }
}

async function loadCycles() {
  starMap.innerHTML = "";
  for (const loc of locations) {
    const data = await fetchData(loc.key);
    if (!data) continue;

    const card = document.createElement("div");
    card.className = "card";
    card.style.border = `2px solid ${loc.color}`;
    card.innerHTML = `
      <div class="title">${loc.name}</div>
      <div class="time">${data.state} (${data.timeLeft})</div>
    `;
    starMap.appendChild(card);
  }
}

async function loadBaro() {
  const data = await fetchData("voidTrader");
  if (!data) return (baroInfo.textContent = "Error loading...");
  baroInfo.innerHTML = `
    Next arrival: <b>${data.location}</b> <br>
    Arrives in: ${data.startString}
  `;
}

function init() {
  loadCycles();
  loadBaro();
  setInterval(() => {
    loadCycles();
    loadBaro();
  }, 30000);
}

document.addEventListener("DOMContentLoaded", init);
