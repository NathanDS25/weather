import React, { useState, useEffect } from "react";

// ==================== UTILITY FUNCTIONS ====================

function mapWeatherCode(code) {
  let iconClass = 'fa-solid fa-cloud';
  let condition = 'clouds';
  if (code >= 200 && code < 300) { iconClass = 'fa-solid fa-cloud-bolt'; condition = 'thunderstorm'; }
  else if (code >= 300 && code < 400) { iconClass = 'fa-solid fa-cloud-rain'; condition = 'drizzle'; }
  else if (code >= 500 && code < 600) { iconClass = 'fa-solid fa-cloud-showers-heavy'; condition = 'rain'; }
  else if (code >= 600 && code < 700) { iconClass = 'fa-solid fa-snowflake'; condition = 'snow'; }
  else if (code >= 700 && code < 800) { iconClass = 'fa-solid fa-smog'; condition = 'mist'; }
  else if (code === 800) { iconClass = 'fa-solid fa-sun'; condition = 'clear'; }
  else if (code > 800) { iconClass = (code === 801 || code === 802) ? 'fa-solid fa-cloud-sun' : 'fa-solid fa-cloud'; condition = 'clouds'; }
  return { iconClass, condition };
}

function getWindDirection(degrees) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(((degrees % 360) < 0 ? degrees + 360 : degrees) / 22.5) % 16];
}

function getMoonPhase(date) {
  const phases = ['🌑 New', '🌒 Waxing', '🌓 Quarter', '🌔 Gibbous', '🌕 Full', '🌖 Waning', '🌗 Quarter', '🌘 Crescent'];
  const newMoon = new Date(2000, 0, 6);
  const cycle = ((date - newMoon) / (24 * 60 * 60 * 1000)) % 29.53;
  return phases[Math.round((cycle / 29.53) * 8) % 8];
}

// ==================== MAIN APP ====================

function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('fav')) || []);
  const [recent, setRecent] = useState(() => JSON.parse(localStorage.getItem('recent')) || []);
  const [isCelsius, setIsCelsius] = useState(() => JSON.parse(localStorage.getItem('unit')) !== false);
  const [isDark, setIsDark] = useState(() => JSON.parse(localStorage.getItem('dark')) || false);
  const [city, setCity] = useState('');

  const API_KEY = 'a26802c7fc690794471791414640fe94';

  useEffect(() => {
    document.body.className = isDark ? 'dark-mode' : 'light-mode';
  }, [isDark]);

  const fetchWeather = async (cityName) => {
    if (!cityName || !cityName.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName.trim())}&units=metric&appid=${API_KEY}`);
      const data = await res.json();

      if (!res.ok) { 
        setError(data.message || 'City not found'); 
        setLoading(false); 
        return; 
      }

      const newRecent = [cityName, ...recent.filter(r => r !== cityName)].slice(0, 10);
      setRecent(newRecent);
      localStorage.setItem('recent', JSON.stringify(newRecent));

      const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${API_KEY}`);
      if (aqiRes.ok) setAqi(await aqiRes.json());

      const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${API_KEY}`);
      if (forecastRes.ok) setForecast(await forecastRes.json());

      setWeather(data);
      setCity('');
    } catch (err) {
      setError(err.message || 'Error fetching weather');
    } finally {
      setLoading(false);
    }
  };

  const toggleFav = () => {
    if (!weather) return;
    const isFav = favorites.includes(weather.name);
    const newFav = isFav ? favorites.filter(f => f !== weather.name) : [...favorites, weather.name];
    setFavorites(newFav);
    localStorage.setItem('fav', JSON.stringify(newFav));
  };

  const convertTemp = (t) => isCelsius ? Math.round(t) : Math.round(t * 9 / 5 + 32);
  const convertSpeed = (s) => isCelsius ? Math.round(s * 3.6) : Math.round(s * 2.237);
  const tempUnit = isCelsius ? '°C' : '°F';
  const speedUnit = isCelsius ? 'km/h' : 'mph';

  useEffect(() => {
    if (!weather) {
      fetchWeather('London');
    }
  }, []);

  if (loading && !weather) {
    return (
      <div className="app-wrapper">
        <div className="glass-card large">
          <div className="loading">⏳ Loading weather...</div>
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="app-wrapper">
        <div className="glass-card large">
          <div className="error-box">❌ {error}</div>
          <button onClick={() => fetchWeather('London')} className="modal-button" style={{marginTop: '20px', width: '100%'}}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const { iconClass } = mapWeatherCode(weather.weather[0].id);
  const dailyForecasts = {};
  if (forecast) {
    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyForecasts[date]) dailyForecasts[date] = [];
      dailyForecasts[date].push(item);
    });
  }

  // Get tomorrow's forecast
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString();
  const tomorrowData = dailyForecasts[tomorrowStr] || [];
  const tomorrowWillRain = tomorrowData.some(item => item.weather[0].main.toLowerCase().includes('rain'));
  const tomorrowHasStorm = tomorrowData.some(item => item.weather[0].main.toLowerCase().includes('thunderstorm'));
  const tomorrowRainProb = tomorrowData.length > 0 ? Math.round((tomorrowData.filter(d => d.weather[0].main.toLowerCase().includes('rain')).length / tomorrowData.length) * 100) : 0;
  const tomorrowTemps = tomorrowData.map(d => d.main.temp);
  const tomorrowMax = tomorrowTemps.length > 0 ? convertTemp(Math.max(...tomorrowTemps)) : '—';
  const tomorrowMin = tomorrowTemps.length > 0 ? convertTemp(Math.min(...tomorrowTemps)) : '—';
  const tomorrowCondition = tomorrowData.length > 0 ? tomorrowData[Math.floor(tomorrowData.length / 2)].weather[0].main : 'Unknown';

  return (
    <div className="app-wrapper">
      <div className="app-header">
        <div className="header-left">
          <button className="header-btn" onClick={() => fetchWeather(weather.name)} title="Refresh"><i className="fa-solid fa-sync"></i></button>
          <button className="header-btn" onClick={toggleFav} title="Favorites"><i className={`fa-${favorites.includes(weather.name) ? 'solid' : 'regular'} fa-star`}></i></button>
        </div>
        <div className="header-right">
          <button className="header-btn" onClick={() => setIsCelsius(!isCelsius)} title="Units">{isCelsius ? '°F' : '°C'}</button>
          <button className="header-btn" onClick={() => setIsDark(!isDark)} title="Theme"><i className={`fa-solid fa-${isDark ? 'sun' : 'moon'}`}></i></button>
        </div>
      </div>

      <div className="main-container">
        <div className="glass-card large">
          {/* Search */}
          <div className="search-box">
            <i className="fa-solid fa-location-dot"></i>
            <input type="text" placeholder="Search city..." value={city} onChange={(e) => setCity(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && fetchWeather(e.target.value)} />
            <button onClick={() => fetchWeather(city)}><i className="fa-solid fa-magnifying-glass"></i></button>
          </div>

          {/* Main Weather */}
          <div className="weather-main">
            <div className="icon-wrapper">
              <i className={iconClass}></i>
              <div className="weather-badge">{weather.weather[0].main}</div>
            </div>
            <div className="temp-section">
              <div className="current-temp">{convertTemp(weather.main.temp)}<span className="unit">{tempUnit}</span></div>
              <div className="location-info">
                <p className="city-name">{weather.name}</p>
                <p className="country">{weather.sys.country}</p>
              </div>
            </div>
            <button onClick={toggleFav} className={`fav-btn-large ${favorites.includes(weather.name) ? 'active' : ''}`}><i className={`fa-${favorites.includes(weather.name) ? 'solid' : 'regular'} fa-heart`}></i></button>
          </div>

          {/* Metrics */}
          <div className="metrics-row">
            <div className="metric-card">
              <i className="fa-solid fa-thermometer"></i>
              <p className="metric-label">Feels Like</p>
              <p className="metric-value">{convertTemp(weather.main.feels_like)}{tempUnit}</p>
            </div>
            <div className="metric-card">
              <i className="fa-solid fa-droplets"></i>
              <p className="metric-label">Humidity</p>
              <p className="metric-value">{weather.main.humidity}%</p>
            </div>
            <div className="metric-card">
              <i className="fa-solid fa-wind"></i>
              <p className="metric-label">Wind</p>
              <p className="metric-value">{convertSpeed(weather.wind.speed)} {speedUnit}</p>
            </div>
          </div>

          {/* TOMORROW'S RAIN FORECAST - MAIN QUESTION */}
          <div className={`tomorrow-rain-box ${tomorrowWillRain ? 'will-rain' : 'no-rain'}`}>
            <div className="tomorrow-header">
              <i className={tomorrowWillRain ? 'fa-solid fa-cloud-rain' : 'fa-solid fa-sun'}></i>
              <div className="tomorrow-text">
                <p className="tomorrow-label">Tomorrow in {weather.name}</p>
                <p className="tomorrow-answer">{tomorrowWillRain ? '☔ YES, it will rain!' : '☀️ NO rain expected'}</p>
              </div>
            </div>
            <div className="tomorrow-details">
              <div className="tomorrow-stat">
                <span className="stat-label">Condition:</span>
                <span className="stat-value">{tomorrowCondition}</span>
              </div>
              <div className="tomorrow-stat">
                <span className="stat-label">Temperature:</span>
                <span className="stat-value">{tomorrowMax}° / {tomorrowMin}°</span>
              </div>
              {tomorrowWillRain && <div className="tomorrow-stat">
                <span className="stat-label">Rain Probability:</span>
                <span className="stat-value">{tomorrowRainProb}%</span>
              </div>}
            </div>
          </div>

          {/* Details Grid */}
          <div className="section-title">📊 Details</div>
          <div className="details-grid">
            <div className="detail-card">
              <div className="detail-icon"><i className="fa-solid fa-compass"></i></div>
              <p className="detail-label">Wind Dir</p>
              <p className="detail-value">{getWindDirection(weather.wind.deg)}</p>
            </div>
            <div className="detail-card">
              <div className="detail-icon"><i className="fa-solid fa-eye"></i></div>
              <p className="detail-label">Visibility</p>
              <p className="detail-value">{(weather.visibility / 1000).toFixed(1)} km</p>
            </div>
            <div className="detail-card">
              <div className="detail-icon"><i className="fa-solid fa-gauge"></i></div>
              <p className="detail-label">Pressure</p>
              <p className="detail-value">{weather.main.pressure} mb</p>
            </div>
            <div className="detail-card">
              <div className="detail-icon"><i className="fa-solid fa-water"></i></div>
              <p className="detail-label">Dew Point</p>
              <p className="detail-value">{convertTemp(weather.main.temp - weather.main.humidity / 5)}{tempUnit}</p>
            </div>
            <div className="detail-card">
              <div className="detail-icon"><i className="fa-solid fa-sun"></i></div>
              <p className="detail-label">Sunrise</p>
              <p className="detail-value">{new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="detail-card">
              <div className="detail-icon"><i className="fa-solid fa-moon"></i></div>
              <p className="detail-label">Sunset</p>
              <p className="detail-value">{new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          {/* AQI */}
          {aqi && (
            <div className="aqi-container">
              <div className="section-title">💨 Air Quality</div>
              <div className="aqi-main">
                <div className={`aqi-indicator aqi-${aqi.list[0].main.aqi}`}>
                  <p className="aqi-number">{aqi.list[0].main.aqi}</p>
                </div>
                <div className="aqi-text">
                  <p className="aqi-status">{'Good,Fair,Moderate,Poor,Very Poor'.split(',')[aqi.list[0].main.aqi - 1]}</p>
                  <p className="aqi-info">Air Quality Index</p>
                </div>
              </div>
              <div className="pollutants-grid">
                {[['CO', aqi.list[0].components.co], ['NO₂', aqi.list[0].components.no2], ['O₃', aqi.list[0].components.o3], ['SO₂', aqi.list[0].components.so2], ['PM2.5', aqi.list[0].components.pm2_5], ['PM10', aqi.list[0].components.pm10]].map(([name, val], i) => (
                  <div key={i} className="pollutant-item">
                    <p className="pollutant-name">{name}</p>
                    <p className="pollutant-value">{Math.round(val)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hourly */}
          {forecast && forecast.list.slice(0, 8).length > 0 && (
            <div className="forecast-container">
              <div className="section-title">⏰ 24-Hour</div>
              <div className="hourly-scroll">
                {forecast.list.slice(0, 8).map((item, i) => (
                  <div key={i} className="hourly-card">
                    <p className="hourly-time">{new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <i className={mapWeatherCode(item.weather[0].id).iconClass}></i>
                    <p className="hourly-temp">{convertTemp(item.main.temp)}{tempUnit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5-Day */}
          {forecast && Object.entries(dailyForecasts).slice(0, 5).length > 0 && (
            <div className="forecast-container">
              <div className="section-title">📅 5-Day</div>
              <div className="forecast-grid">
                {Object.entries(dailyForecasts).slice(0, 5).map(([dateStr, items], i) => {
                  const temps = items.map(it => it.main.temp);
                  const max = convertTemp(Math.max(...temps));
                  const min = convertTemp(Math.min(...temps));
                  const item = items[Math.floor(items.length / 2)];
                  const dayName = new Date(dateStr).toLocaleDateString('en', { weekday: 'short' });
                  return (
                    <div key={i} className="forecast-card">
                      <p className="forecast-day">{dayName}</p>
                      <i className={mapWeatherCode(item.weather[0].id).iconClass}></i>
                      <p className="forecast-temps">{max}° / {min}°</p>
                      <p className="forecast-condition">{item.weather[0].main}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rain Info */}
          <div className="rain-info-box">
            <i className={weather.weather[0].main.toLowerCase().includes('rain') ? 'fa-solid fa-umbrella' : 'fa-solid fa-sun'}></i>
            <p>{weather.weather[0].main.toLowerCase().includes('rain') ? '☔ Rainy!' : '☀️ Clear skies!'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
