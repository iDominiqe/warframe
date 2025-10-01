const TRANSLATIONS = {
  ru: {
    "Live cycle dashboard": "Дашборд циклов",
    "Baro Ki'Teer (Void Trader)": "Баро Ки'Тир (Торговец)",
    "Planets show colors and simple environmental effects (night, fog, cold). Hover a planet to see cycle time.": "Планеты показывают цвета и простые эффекты (ночь, туман, холод). Наведи курсор, чтобы увидеть время.",
    "Events & Alerts": "Ивенты и тревоги",
    "Devstreams & News": "Девстримы и Новости",
    "Warframe Server Status": "Статус серверов Warframe",
    "Wiki (placeholder)": "Вики (плейсхолдер)",
    "Baro Ki'Teer Report": "Отчёт о Баро Ки'Тир",
  }
};

function setLang(lang) {
  document.documentElement.lang = (lang === 'ru') ? 'ru' : 'en';
  localStorage.setItem('wf_lang', lang);
  // Example: translate a few headings if present
  if (lang === 'ru') {
    document.querySelectorAll('.title').forEach(el => {
      const t = el.textContent.trim();
      if (TRANSLATIONS.ru[t]) el.textContent = TRANSLATIONS.ru[t];
    });
  } else {
    // For simplicity page reload to restore english original
    location.reload();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('wf_lang') || 'en';
  if (saved === 'ru') setLang('ru');
  document.getElementById('lang-en').addEventListener('click', ()=> setLang('en'));
  document.getElementById('lang-ru').addEventListener('click', ()=> setLang('ru'));
});
