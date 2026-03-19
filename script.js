// Твои настройки API
const accessKey = '06719b80-c889-4cd7-854a-67d9abd0c3c6';
const headers = {
    'X-Yandex-API-Key': accessKey // Примечание: иногда Яндекс требует заголовок 'X-Yandex-API-Key'
};

// Оригинальная ссылка из твоего кода
const targetUrl = 'https://api.weather.yandex.ru/v2/forecast?lat=54.7065&lon=20.511';

// Прокси для обхода CORS в браузере (не забудь активировать его по ссылке cors-anywhere.herokuapp.com/corsdemo)
const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; 
const url = proxyUrl + targetUrl;

const weatherContent = document.getElementById('weather-content');

// Функция перевода состояния погоды
function translateCondition(condition) {
    const conditions = {
        'clear': 'ясно',
        'partly-cloudy': 'малооблачно',
        'cloudy': 'облачно с прояснениями',
        'overcast': 'пасмурно',
        'drizzle': 'морось',
        'light-rain': 'небольшой дождь',
        'rain': 'дождь',
        'moderate-rain': 'умеренно сильный дождь',
        'heavy-rain': 'сильный дождь',
        'continuous-heavy-rain': 'длительный сильный дождь',
        'showers': 'ливень',
        'wet-snow': 'дождь со снегом',
        'light-snow': 'небольшой снег',
        'snow': 'снег',
        'snow-showers': 'снегопад',
        'hail': 'град',
        'thunderstorm': 'гроза',
        'thunderstorm-with-rain': 'дождь с грозой',
        'thunderstorm-with-hail': 'гроза с градом'
    };
    return conditions[condition] || condition;
}

// Твой fetch-запрос, интегрированный с интерфейсом
fetch(url, { headers })
    .then(response => {
        if (!response.ok) throw new Error('Ошибка при ответе сервера');
        return response.json();
    })
    .then(json => {
        console.log('Данные от Яндекса:', json); // Вывод в консоль, как в твоем коде

        // Достаем нужные данные из объекта (API прогноза имеет поле fact)
        const temp = json.fact.temp;
        const condition = translateCondition(json.fact.condition);
        const feelsLike = json.fact.feels_like;
        const windSpeed = json.fact.wind_speed;
        const icon = json.fact.icon;

        // Отрисовываем в HTML
        weatherContent.innerHTML = `
            <img src="https://yastatic.net/weather/i/icons/funky/dark/${icon}.svg" width="80" alt="${condition}">
            <div class="temp">${temp > 0 ? '+' : ''}${temp}°C</div>
            <div class="condition">${condition}</div>
            <div class="details">
                <span>Ощущается как: ${feelsLike > 0 ? '+' : ''}${feelsLike}°C</span>
                <span>Ветер: ${windSpeed} м/с</span>
            </div>
        `;
    })
    .catch(error => {
        weatherContent.innerHTML = `<p class="error">Ошибка загрузки.<br>Открой консоль (F12) для деталей.</p>`;
        console.error('Ошибка fetch:', error);
    });