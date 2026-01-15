const timeNowEl = document.getElementById("timeNow");
const phaseEl = document.getElementById("phase");
const nextChangeEl = document.getElementById("nextChange");

async function updateTimer() {
  try {
    const res = await fetch("https://api.warframestat.us/pc/worldstate");
    const data = await res.json();

    const earth = data.cetusCycle; // примем кровь Earth как пример
    const isDay = earth.isDay;
    const timeLeft = earth.timeLeft;

    const current = new Date();
    timeNowEl.textContent = `Current Time: ${current.toLocaleTimeString("en-US")}`;
    phaseEl.textContent = `Current Phase: ${isDay ? "Day" : "Night"}`;
    nextChangeEl.textContent = `Next Change In: ${timeLeft}`;

  } catch (e) {
    console.error("Error loading Warframe data:", e);
  }
}

updateTimer();
setInterval(updateTimer, 30000); // обновлять каждые 30 секунд
