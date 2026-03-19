const accessKey = '06719b80-c889-4cd7-854a-67d9abd0c3c6';
    const headers = {
        'X-Yandex-API-Key': accessKey
    };

// Оригинальная ссылка выгрузки погоды
const targetUrl = 'https://api.weather.yandex.ru/v2/forecast?lat=54.7065&lon=20.511';

// Прокси для обхода CORS в браузере
const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; 
const url = proxyUrl + targetUrl;

const weatherContent = document.getElementById('weather-content');

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

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
}

fetch(url, { headers })
    .then(response => {
        if (!response.ok) throw new Error('Ошибка при ответе сервера');
        return response.json();
    })
    .then(json => {
        console.log('Данные от Яндекса:', json);

        //Данные для текущей погоды
        const current = json.fact;
        const temp = current.temp;
        const condition = translateCondition(current.condition);
        const feelsLike = current.feels_like;
        const windSpeed = current.wind_speed;
        const icon = current.icon;

        let html = `
            <div class="current-weather">
                <img src="https://yastatic.net/weather/i/icons/funky/dark/${icon}.svg" width="80" alt="${condition}">
                <div class="temp">${temp > 0 ? '+' : ''}${temp}°C</div>
                <div class="condition">${condition}</div>
                <div class="details">
                    <span>Ощущается: ${feelsLike > 0 ? '+' : ''}${feelsLike}°C</span>
                    <span>Ветер: ${windSpeed} м/с</span>
                </div>
            </div>
            <div class="forecast-container">
        `;

        //Данные для прогноза (берем первые 3 дня из массива forecasts)
        const forecasts = json.forecasts.slice(0, 3);
        
        forecasts.forEach(day => {
            const dateText = formatDate(day.date);
            const dayTemp = day.parts.day.temp_avg; // средняя температура днем
            const nightTemp = day.parts.night.temp_avg; // средняя температура ночью
            const dayIcon = day.parts.day.icon;

            html += `
                <div class="forecast-day">
                    <div class="forecast-date">${dateText}</div>
                    <img class="forecast-icon" src="https://yastatic.net/weather/i/icons/funky/dark/${dayIcon}.svg" alt="icon">
                    <div class="forecast-temps">
                        днём: ${dayTemp > 0 ? '+' : ''}${dayTemp}°<br>
                        ночью: ${nightTemp > 0 ? '+' : ''}${nightTemp}°
                    </div>
                </div>
            `;
        });

        html += `</div>`; // Закрываем контейнер прогноза
        weatherContent.innerHTML = html;
    })
    .catch(error => {
        weatherContent.innerHTML = `<p class="error">Ошибка загрузки.<br>Проверьте CORS-прокси.</p>`;
        console.error('Ошибка fetch:', error);
    });