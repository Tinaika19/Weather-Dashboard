const apiKey = '1c881aac6754693b5cad489d651f8dac';

// Add event listener to the search form
document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const city = document.getElementById('city-input').value;
    getCoordinates(city);
});

function getCoordinates(city) {
    const geocodeUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    fetch(geocodeUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.cod !== 200) {
                throw new Error(data.message);
            }
            const lat = data.coord.lat;
            const lon = data.coord.lon;
            getWeather(lat, lon, city);
        })
        .catch(error => console.error('Error fetching coordinates:', error));
}

function getWeather(lat, lon, city) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

    fetch(weatherUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.cod !== '200') {
                throw new Error(data.message);
            }
            updateCurrentWeather(data, city);
            updateForecast(data);
            updateHistory(city);
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

function updateCurrentWeather(data, city) {
    const current = data.list[0];
    document.getElementById('current-city').textContent = city;
    document.getElementById('current-date').textContent = new Date(current.dt * 1000).toLocaleDateString();
    document.getElementById('current-icon').textContent = getWeatherIcon(current.weather[0].icon);
    document.getElementById('current-temp').textContent = `Temp: ${current.main.temp}°F`;
    document.getElementById('current-wind').textContent = `Wind: ${current.wind.speed} MPH`;
    document.getElementById('current-humidity').textContent = `Humidity: ${current.main.humidity}%`;
}

function updateForecast(data) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';
    
    for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const forecastEl = document.createElement('div');
        forecastEl.classList.add('forecast-day');
        
        forecastEl.innerHTML = `
            <h4>${new Date(forecast.dt * 1000).toLocaleDateString()}</h4>
            <span>${getWeatherIcon(forecast.weather[0].icon)}</span>
            <p>Temp: ${forecast.main.temp}°F</p>
            <p>Wind: ${forecast.wind.speed} MPH</p>
            <p>Humidity: ${forecast.main.humidity}%</p>
        `;
        
        forecastContainer.appendChild(forecastEl);
    }
}

function getWeatherIcon(iconCode) {
    const icons = {
        '01d': '🌞',
        '01n': '🌜',
        '02d': '🌤️',
        '02n': '🌤️',
        '03d': '☁️',
        '03n': '☁️',
        '04d': '🌥️',
        '04n': '🌥️',
        '09d': '🌧️',
        '09n': '🌧️',
        '10d': '🌦️',
        '10n': '🌦️',
        '11d': '⛈️',
        '11n': '⛈️',
        '13d': '❄️',
        '13n': '❄️',
        '50d': '🌫️',
        '50n': '🌫️'
    };
    return icons[iconCode] || '';
}

function updateHistory(city) {
    let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem('weatherHistory', JSON.stringify(history));
    }
    displayHistory();
}

function displayHistory() {
    const historyContainer = document.getElementById('search-history');
    historyContainer.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    history.forEach(city => {
        const historyBtn = document.createElement('button');
        historyBtn.textContent = city;
        historyBtn.classList.add('history-btn');
        historyBtn.addEventListener('click', () => getCoordinates(city));
        historyContainer.appendChild(historyBtn);
    });
}

// Load history on page load
document.addEventListener('DOMContentLoaded', displayHistory);
