import React, { useState, useEffect } from 'react';
import './styles/App.css';
import SearchBox from './components/SearchBox';
import WeatherDisplay from './components/WeatherDisplay';
import ErrorMessage from './components/ErrorMessage';

function App() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_KEY = 'a26802c7fc690794471791414640fe94';

  const fetchWeather = async (city) => {
    if (!city || city.trim() === '') return;

    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      // Fetch weather data
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&units=metric&appid=${API_KEY}`
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || `Error: ${res.status}`);
        setLoading(false);
        return;
      }

      // Fetch AQI data
      const aqiRes = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${API_KEY}`
      );
      let aqi = '--';
      if (aqiRes.ok) {
        const aqiData = await aqiRes.json();
        const aqiIndex = aqiData.list[0].main.aqi;
        const aqiText = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'][aqiIndex] || 'Unknown';
        aqi = `${aqiIndex} (${aqiText})`;
      }

      // Fetch forecast data
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${API_KEY}`
      );
      let rainTomorrow = 'Unavailable';
      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
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

        const tomorrowForecasts = forecastData.list.filter(
          item => item.dt >= utcStartTomorrowSec && item.dt < utcStartDayAfterSec
        );
        const willRain = tomorrowForecasts.some(item => {
          return Array.isArray(item.weather) && item.weather.some(w => {
            const id = Number(w.id || 0);
            const main = String(w.main || '').toLowerCase();
            return main.includes('rain') || (id >= 500 && id < 600);
          });
        });

        if (tomorrowForecasts.length === 0) {
          rainTomorrow = 'Forecast unavailable';
        } else if (willRain) {
          rainTomorrow = 'Yes, expect rain.';
        } else {
          rainTomorrow = 'No rain expected.';
        }
      }

      setWeather({
        ...data,
        aqi,
        rainTomorrow,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load default city on mount
  useEffect(() => {
    fetchWeather('New York');
  }, []);

  return (
    <div className="app">
      <div className="glass-card">
        <SearchBox onSearch={fetchWeather} />
        {error ? (
          <ErrorMessage message={error} />
        ) : weather ? (
          <WeatherDisplay weather={weather} />
        ) : loading ? (
          <div className="loading">
            <p>Loading weather...</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
