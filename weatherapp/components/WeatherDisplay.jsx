import React, { useEffect } from 'react';
import { mapWeatherCode } from '../utils/weatherUtils';

function WeatherDisplay({ weather }) {
  useEffect(() => {
    const weatherCode = weather.weather && weather.weather[0] ? Number(weather.weather[0].id) : 800;
    const weatherInfo = mapWeatherCode(weatherCode);
    document.body.className = weatherInfo.bgClass;
  }, [weather]);

  const weatherCode = weather.weather && weather.weather[0] ? Number(weather.weather[0].id) : 800;
  const weatherInfo = mapWeatherCode(weatherCode);
  const weatherText = weather.weather && weather.weather[0] ? weather.weather[0].description : 'Clear sky';

  return (
    <div className="weather-box active">
      <div className="weather-icon-container">
        <i className={weatherInfo.iconClass}></i>
      </div>

      <h1 className="temperature">
        {Math.round(weather.main.temp)}
        <span>°C</span>
      </h1>
      <p className="description">{weatherText}</p>
      <p className="city-name">
        {weather.name}, {weather.sys.country}
      </p>

      <div className="details">
        <div className="col">
          <i className="fa-solid fa-water"></i>
          <div>
            <p>{weather.main.humidity}%</p>
            <p>Humidity</p>
          </div>
        </div>

        <div className="col">
          <i className="fa-solid fa-wind"></i>
          <div>
            <p>{Math.round(weather.wind.speed * 3.6)} km/h</p>
            <p>Wind Speed</p>
          </div>
        </div>

        <div className="col">
          <i className="fa-solid fa-lungs"></i>
          <div>
            <p>{weather.aqi}</p>
            <p>AQI</p>
          </div>
        </div>
      </div>

      <div className="forecast-banner">
        <p>Will it rain tomorrow?</p>
        <h2>
          <i
            className={
              weather.rainTomorrow.includes('expect') || weather.rainTomorrow.includes('Yes')
                ? 'fa-solid fa-umbrella'
                : 'fa-solid fa-sun'
            }
            style={{ marginRight: '8px' }}
          ></i>
          {weather.rainTomorrow}
        </h2>
      </div>
    </div>
  );
}

export default WeatherDisplay;
