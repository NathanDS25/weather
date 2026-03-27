const searchBtn = document.querySelector('#search-btn');
const cityInput = document.querySelector('#city-input');
const weatherBox = document.querySelector('#weather-box');
const notFound = document.querySelector('#not-found');
const weatherIcon = document.querySelector('#weather-icon');
const temperature = document.querySelector('#temperature');
const description = document.querySelector('#description');
const cityNameDisplay = document.querySelector('#city-name');
const humidity = document.querySelector('#humidity');
const wind = document.querySelector('#wind');
const aqi = document.querySelector('#aqi');

searchBtn.addEventListener('click', () => {
    fetchWeather(cityInput.value);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchWeather(cityInput.value);
});

async function fetchWeather(city) {
    if (!city || city.trim() === '') return;

    try {
        const apiKey = 'a26802c7fc690794471791414640fe94';
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&units=metric&appid=${apiKey}`);
        
        const data = await res.json();
        
        if (!res.ok) {
            weatherBox.classList.remove('active');
            notFound.style.display = 'block';
            document.querySelector('#not-found p').innerText = `API Error: ${data.message || res.status}`;
            document.body.className = '';
            return;
        }

        notFound.style.display = 'none';
        
        temperature.innerHTML = `${Math.round(data.main.temp)}<span>°C</span>`;
        cityNameDisplay.innerHTML = `${data.name}, ${data.sys.country}`;
        humidity.innerHTML = `${data.main.humidity}%`;
        wind.innerHTML = `${Math.round(data.wind.speed * 3.6)} km/h`;
        
        // Fetch AQI
        const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${apiKey}`);
        if (aqiRes.ok) {
            const aqiData = await aqiRes.json();
            const aqiIndex = aqiData.list[0].main.aqi;
            const aqiText = ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"][aqiIndex] || "Unknown";
            aqi.innerHTML = `${aqiIndex} (${aqiText})`;
        } else {
            aqi.innerHTML = "--";
        }

        // Fetch Forecast (Rain Tomorrow)
        const rainTomorrowEl = document.querySelector('#rain-tomorrow');
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${apiKey}`);
        if (forecastRes.ok) {
            const forecastData = await forecastRes.json();

            // Use the city timezone offset to compute tomorrow in location local time
            const timezoneOffsetSeconds = Number(data.timezone || 0);
            const nowUTCms = Date.now();
            const localNowMs = nowUTCms + timezoneOffsetSeconds * 1000;

            const localStartTomorrow = new Date(localNowMs);
            localStartTomorrow.setHours(0, 0, 0, 0);
            localStartTomorrow.setDate(localStartTomorrow.getDate() + 1);

            const localStartDayAfter = new Date(localStartTomorrow);
            localStartDayAfter.setDate(localStartDayAfter.getDate() + 1);

            const utcStartTomorrowSec = Math.floor((localStartTomorrow.getTime() - timezoneOffsetSeconds * 1000) / 1000);
            const utcStartDayAfterSec = Math.floor((localStartDayAfter.getTime() - timezoneOffsetSeconds * 1000) / 1000);

            const tomorrowForecasts = forecastData.list.filter(item => item.dt >= utcStartTomorrowSec && item.dt < utcStartDayAfterSec);
            const willRain = tomorrowForecasts.some(item => {
                return Array.isArray(item.weather) && item.weather.some(w => {
                    const id = Number(w.id || 0);
                    const main = String(w.main || '').toLowerCase();
                    return main.includes('rain') || (id >= 500 && id < 600);
                });
            });

            if (tomorrowForecasts.length === 0) {
                rainTomorrowEl.innerHTML = 'Forecast unavailable';
            } else if (willRain) {
                rainTomorrowEl.innerHTML = '<i class="fa-solid fa-umbrella"></i> Yes, expect rain.';
            } else {
                rainTomorrowEl.innerHTML = '<i class="fa-solid fa-sun"></i> No rain expected.';
            }
        } else {
            rainTomorrowEl.innerHTML = 'Unavailable';
        }

        // Map OpenWeatherMap condition code safely
        const weatherCode = data.weather && data.weather[0] && Number(data.weather[0].id) ? Number(data.weather[0].id) : 800;
        const weatherText = data.weather && data.weather[0] && data.weather[0].description ? data.weather[0].description : 'Clear sky';

        const weatherInfo = mapWeatherCode(weatherCode);
        description.innerHTML = weatherText;
        weatherIcon.className = weatherInfo.iconClass;

        // Update background
        document.body.className = weatherInfo.bgClass;

        weatherBox.classList.add('active');

    } catch (err) {
        console.error(err);
        weatherBox.classList.remove('active');
        notFound.style.display = 'block';
        document.querySelector('#not-found p').innerText = `JS Error: ${err.message}`;
    }
}

function mapWeatherCode(code) {
    let iconClass = "fa-solid fa-cloud";
    let bgClass = "clouds";

    if (code >= 200 && code < 300) {
        iconClass = "fa-solid fa-cloud-bolt";
        bgClass = "thunderstorm";
    } else if (code >= 300 && code < 400) {
        iconClass = "fa-solid fa-cloud-rain";
        bgClass = "rain";
    } else if (code >= 500 && code < 600) {
        iconClass = "fa-solid fa-cloud-showers-heavy";
        bgClass = "rain";
    } else if (code >= 600 && code < 700) {
        iconClass = "fa-solid fa-snowflake";
        bgClass = "snow";
    } else if (code >= 700 && code < 800) {
        iconClass = "fa-solid fa-smog";
        bgClass = "clouds";
    } else if (code === 800) {
        iconClass = "fa-solid fa-sun";
        bgClass = "clear";
    } else if (code > 800) {
        iconClass = (code === 801 || code === 802) ? "fa-solid fa-cloud-sun" : "fa-solid fa-cloud";
        bgClass = "clouds";
    }

    return { iconClass, bgClass };
}

window.onload = () => {
    // Wow effect: load a default city on startup
    fetchWeather("New York");
};
