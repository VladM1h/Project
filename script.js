// При загрузке страницы проверяем, есть ли сохраненный ключ
window.onload = () => {
    const savedKey = localStorage.getItem('yandex_api_key');
    if (savedKey) {
        document.getElementById('api-key-input').value = savedKey;
        showWeatherControls();
    }
};

// Новая функция для переключения интерфейса
function saveKeyAndShow() {
    const apiKey = document.getElementById('api-key-input').value.trim();
    if (!apiKey) {
        alert('Пожалуйста, введите API ключ!');
        return;
    }
    localStorage.setItem('yandex_api_key', apiKey);
    showWeatherControls();
}

function showWeatherControls() {
    document.getElementById('api-key-wrapper').style.display = 'none';
    document.getElementById('save-key-btn').style.display = 'none';
    document.getElementById('proxy-auth-btn').style.display = 'none';
    
    document.getElementById('reset-key-link').style.display = 'block';
    document.getElementById('weather-actions').style.display = 'flex';
    document.getElementById('weather-actions').style.flexDirection = 'column';
    document.getElementById('weather-actions').style.gap = '15px';
}

// Функция для сброса ключа
function resetApiKey() {
    localStorage.removeItem('yandex_api_key');
    document.getElementById('api-key-input').value = '';
    
    document.getElementById('api-key-wrapper').style.display = 'block';
    document.getElementById('save-key-btn').style.display = 'block';
    document.getElementById('proxy-auth-btn').style.display = 'block';
    
    document.getElementById('reset-key-link').style.display = 'none';
    document.getElementById('weather-actions').style.display = 'none';
    document.getElementById('weather-card').style.display = 'none';
}

// --- ВАШ КОД БЕЗ ИЗМЕНЕНИЙ НИЖЕ ---

function translateCondition(condition) {
    const conditions = {
        'clear': 'ясно', 'partly-cloudy': 'малооблачно', 'cloudy': 'облачно с прояснениями',
        'overcast': 'пасмурно', 'drizzle': 'морось', 'light-rain': 'небольшой дождь',
        'rain': 'дождь', 'moderate-rain': 'умеренно сильный дождь', 'heavy-rain': 'сильный дождь',
        'continuous-heavy-rain': 'длительный сильный дождь', 'showers': 'ливень',
        'wet-snow': 'дождь со снегом', 'light-snow': 'небольшой снег', 'snow': 'снег',
        'snow-showers': 'снегопад', 'hail': 'град', 'thunderstorm': 'гроза',
        'thunderstorm-with-rain': 'дождь с грозой', 'thunderstorm-with-hail': 'гроза с градом'
    };
    return conditions[condition] || condition;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
}

function fetchWeather() {
    const apiKey = document.getElementById('api-key-input').value.trim();
    const citySelect = document.getElementById('city-select');
    const coords = citySelect.value.split(',');
    const lat = coords[0];
    const lon = coords[1];
    const cityName = citySelect.options[citySelect.selectedIndex].text;

    const weatherCard = document.getElementById('weather-card');
    const weatherContent = document.getElementById('weather-content');
    const loading = document.getElementById('loading');
    
    document.getElementById('city-title').innerText = `Погода в г. ${cityName}`;
    weatherCard.style.display = 'none';
    loading.style.display = 'block';

    const targetUrl = `https://api.weather.yandex.ru/v2/forecast?lat=${lat}&lon=${lon}`;
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; 
    const url = proxyUrl + targetUrl;
    const headers = { 'X-Yandex-Weather-Key': apiKey };

    fetch(url, { headers })
        .then(response => {
            if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);
            return response.json();
        })
        .then(json => {
            loading.style.display = 'none';
            weatherCard.style.display = 'block';
            const current = json.fact;
            let html = `
                <div class="current-weather">
                    <img src="https://yastatic.net/weather/i/icons/funky/dark/${current.icon}.svg" width="80" alt="icon">
                    <div class="temp">${current.temp > 0 ? '+' : ''}${current.temp}°C</div>
                    <div class="condition">${translateCondition(current.condition)}</div>
                    <div class="details">
                        <span>Ощущается: ${current.feels_like > 0 ? '+' : ''}${current.feels_like}°C</span>
                        <span>Ветер: ${current.wind_speed} м/с</span>
                    </div>
                </div>
                <div class="forecast-container">
            `;
            const forecasts = json.forecasts.slice(0, 3);
            forecasts.forEach(day => {
                const dayTemp = day.parts.day.temp_avg;
                const nightTemp = day.parts.night.temp_avg;
                html += `
                    <div class="forecast-day">
                        <div class="forecast-date">${formatDate(day.date)}</div>
                        <img class="forecast-icon" src="https://yastatic.net/weather/i/icons/funky/dark/${day.parts.day.icon}.svg" alt="icon">
                        <div class="forecast-temps">
                            днём: ${dayTemp > 0 ? '+' : ''}${dayTemp}°<br>
                            ночью: ${nightTemp > 0 ? '+' : ''}${nightTemp}°
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
            weatherContent.innerHTML = html;
        })
        .catch(error => {
            loading.style.display = 'none';
            weatherCard.style.display = 'block';
            weatherContent.innerHTML = `<p class="error">Ошибка загрузки.<br>Проверьте API-ключ и доступ к CORS-прокси.</p>`;
            console.error('Ошибка fetch:', error);
        });
}