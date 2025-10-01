const translations = {
  ru: {
    "Open World Cycles": "Циклы открытых локаций",
    "Baro Ki'Teer": "Баро Ки'Тир",
    "Events": "Ивенты",
    "Alerts": "Сигналы тревоги",
    "Devstreams & News": "Девстримы и Новости",
    "Warframe Status": "Статус Warframe",
    "Warframe Wiki": "Варфрейм Вики",
  },
};

document.getElementById("langSwitcher").addEventListener("change", (e) => {
  const lang = e.target.value;
  if (lang === "en") return location.reload();
  document.querySelectorAll("h1, .logo, nav a").forEach((el) => {
    if (translations[lang][el.textContent]) {
      el.textContent = translations[lang][el.textContent];
    }
  });
});
