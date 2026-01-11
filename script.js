// СПИСОК ИСТОЧНИКОВ (Primary -> Backup -> Proxy)
// Если первый не работает, скрипт пойдет ко второму и так далее.
const API_SOURCES = [
    'https://api.warframestat.us/pc', // Официальный API сообщества
    'https://api.warframestat.us/pc/?language=en', // То же, но с явным языком (иногда помогает от кеша)
    // Прокси через allorigins (обходит блокировки CORS и локальные глюки)
    'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://api.warframestat.us/pc')
];

// Функция форматирования времени
function formatTime(ms) {
    if (ms < 0) return "00:00:00";
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Умная функция получения данных (перебирает источники)
async function fetchCycleData() {
    let data = null;
    let errorMsg = '';

    // Проходим по списку источников по очереди
    for (const source of API_SOURCES) {
        try {
            console.log(`Trying source: ${source}`);
            const response = await fetch(source);
            
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            
            // Пробуем прочитать JSON
            const text = await response.text();
            if (!text) throw new Error('Empty response');
            
            data = JSON.parse(text);
            
            // Если мы здесь - значит все получилось, выходим из цикла
            console.log('Data received successfully from:', source);
            break; 
        } catch (error) {
            console.warn(`Failed to fetch from ${source}:`, error);
            errorMsg = error.message;
            // Цикл продолжится к следующему источнику
        }
    }

    if (data) {
        updateUI(data);
    } else {
        console.error('All sources failed.');
        showErrorState();
    }
}

// Если все сломалось, пишем ошибку в интерфейс
function showErrorState() {
    const ids = ['earth', 'cetus', 'vallis', 'cambion', 'duviri'];
    ids.forEach(id => {
        const el = document.getElementById(`${id}-state`);
        if(el) {
            el.innerText = "OFFLINE";
            el.style.color = "red";
        }
    });
}

// Обновление интерфейса
function updateUI(data) {
    // 1. Earth
    updateTimer('earth', data.earthCycle);
    // 2. Cetus
    updateTimer('cetus', data.cetusCycle);
    // 3. Orb Vallis
    updateTimer('vallis', data.vallisCycle);
    // 4. Cambion Drift
    updateTimer('cambion', data.cambionCycle);

    // 5. Duviri (особая логика)
    if(data.duviriCycle) {
        const stateEl = document.getElementById('duviri-state');
        const timerEl = document.getElementById('duviri-timer');
        
        stateEl.innerText = data.duviriCycle.state.toUpperCase();
        stateEl.style.color = '#c5a966'; // Duviri gold
        timerEl.dataset.expiry = data.duviriCycle.expiry;
    }
}

// Вспомогательная функция
function updateTimer(id, cycleData) {
    const stateEl = document.getElementById(`${id}-state`);
    const timerEl = document.getElementById(`${id}-timer`);

    if (cycleData && stateEl && timerEl) {
        let stateText = cycleData.state ? cycleData.state.toUpperCase() : 'UNKNOWN';
        
        // Цвета
        if(stateText.includes('NIGHT') || stateText === 'COLD' || stateText === 'FASS') {
            stateEl.style.color = '#55aaff';
        } else {
            stateEl.style.color = '#ffaa00';
        }

        stateEl.innerText = stateText;
        timerEl.dataset.expiry = cycleData.expiry;
    }
}

// Тикающий таймер (работает локально, не требует запросов каждую секунду)
setInterval(() => {
    const timerElements = document.querySelectorAll('[data-expiry]');
    
    timerElements.forEach(el => {
        const expiryStr = el.dataset.expiry;
        if (!expiryStr) return;

        const expiryDate = new Date(expiryStr).getTime();
        const now = new Date().getTime();
        const diff = expiryDate - now;

        if (diff <= 0) {
            el.innerText = "SYNC...";
            // Не спамим запросами, если данные устарели, ждем следующего цикла обновления
        } else {
            el.innerText = formatTime(diff);
        }
    });
}, 1000);

// Запуск
fetchCycleData();

// Обновляем данные с сервера раз в 60 секунд
setInterval(fetchCycleData, 60000);
