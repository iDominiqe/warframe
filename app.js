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
    card.style.borderLeft = `4px solid ${loc.color}`;
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
  drawStars();
}

document.addEventListener("DOMContentLoaded", init);

function drawStars() {
  const canvas = document.getElementById("space-bg");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const stars = Array.from({ length: 200 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2,
    d: Math.random() * 0.5,
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Звёзды
    ctx.fillStyle = "white";
    stars.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      s.y += s.d;
      if (s.y > canvas.height) s.y = 0;
    });

    // Луна
    ctx.beginPath();
    ctx.arc(canvas.width - 100, 100, 50, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,200,0.9)";
    ctx.fill();
    ctx.shadowBlur = 20;
    ctx.shadowColor = "yellow";

    requestAnimationFrame(animate);
  }
  animate();
}
