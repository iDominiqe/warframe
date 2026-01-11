const API_URL = 'https://api.warframestat.us/pc';

// Функция для форматирования времени (hh:mm:ss)
function formatTime(ms) {
    if (ms < 0) return "00:00:00";
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Получение данных с API
async function fetchCycleData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        console.error('Error fetching Warframe data:', error);
    }
}

// Обновление интерфейса
function updateUI(data) {
    // 1. Earth (Основная нода для растений)
    updateTimer('earth', data.earthCycle);

    // 2. Cetus (Равнины Эйдолона - Ночь/День)
    updateTimer('cetus', data.cetusCycle);

    // 3. Orb Vallis (Венера)
    updateTimer('vallis', data.vallisCycle);

    // 4. Cambion Drift (Деймос)
    updateTimer('cambion', data.cambionCycle);

    // 5. Duviri (Парадокс)
    // Duviri имеет немного другую структуру, проверяем её
    if(data.duviriCycle) {
        document.getElementById('duviri-state').innerText = data.duviriCycle.state.toUpperCase();
        // Сохраняем дату окончания для таймера
        document.getElementById('duviri-timer').dataset.expiry = data.duviriCycle.expiry;
    }
}

// Вспомогательная функция для обновления конкретного блока
function updateTimer(id, cycleData) {
    const stateEl = document.getElementById(`${id}-state`);
    const timerEl = document.getElementById(`${id}-timer`);

    if (cycleData) {
        // Меняем текст (Day/Night/Warm/Cold)
        // Для Земли и Цетуса важно показывать именно Day или Night
        let stateText = cycleData.state ? cycleData.state.toUpperCase() : 'UNKNOWN';
        
        // Визуальная подсветка (опционально)
        if(stateText === 'NIGHT' || stateText === 'COLD' || stateText === 'FASS') {
            stateEl.style.color = '#55aaff'; // Синий для ночи/холода
        } else {
            stateEl.style.color = '#ffaa00'; // Оранжевый для дня/тепла
        }

        stateEl.innerText = stateText;
        timerEl.dataset.expiry = cycleData.expiry; // Сохраняем время окончания в атрибут
    }
}

// Живой таймер (запускается каждую секунду)
setInterval(() => {
    const timerElements = document.querySelectorAll('[data-expiry]');
    
    timerElements.forEach(el => {
        const expiryDate = new Date(el.dataset.expiry).getTime();
        const now = new Date().getTime();
        const diff = expiryDate - now;

        // Если время вышло, обновляем данные с сервера
        if (diff <= 0) {
            el.innerText = "REFRESHING...";
            fetchCycleData(); // Перезапрос данных
        } else {
            el.innerText = formatTime(diff);
        }
    });
}, 1000);

// Первичный запуск
fetchCycleData();
// Обновлять данные с сервера каждые 2 минуты на всякий случай
setInterval(fetchCycleData, 120000);
