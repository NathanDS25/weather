# Weather App - React Version

A beautiful, transparent weather application built with React and Express.

## Features

✨ **Modern React Components**
- SearchBox - for city search
- WeatherDisplay - shows current weather
- ErrorMessage - displays errors

🎨 **Premium Design**
- Ultra-transparent glass-morphism UI
- Animated gradient background that shifts smoothly
- Hover animations and transitions
- Responsive layout

🌤️ **Real-time Weather Data**
- Current temperature and conditions
- Humidity, wind speed, and AQI
- Tomorrow's rain forecast
- Dynamic background based on weather

## Installation

1. Install dependencies:
```bash
npm install
```

2. To build and run the application:
   - The app is set up to work with Express serving your React app
   - Currently, the JSX files are in `/weatherapp/` directory
   - Express serves the static files

3. Start the server:
```bash
node server.js
```

Then visit `http://localhost:3000`

## Project Structure

```
weather/
├── server.js                          # Express server
├── package.json                       # Dependencies
├── weatherapp/
│   ├── index.html                     # Main HTML with React root
│   ├── main.jsx                       # React entry point
│   ├── App.jsx                        # Main App component
│   ├── components/
│   │   ├── SearchBox.jsx             # Search component
│   │   ├── WeatherDisplay.jsx        # Weather display component
│   │   └── ErrorMessage.jsx          # Error component
│   ├── utils/
│   │   └── weatherUtils.js           # Utility functions
│   └── styles/
│       ├── index.css                 # Main styles
│       └── App.css                   # App component styles
```

## Next Steps (Optional Build Setup)

To enable JSX compilation in the browser, you have options:

### Option 1: Use React from CDN (Simplest)
Update HTML to use React/ReactDOM from CDN and convert JSX to regular JS calls.

### Option 2: Add Vite Build Tool
```bash
npm install --save-dev vite @vitejs/plugin-react
```

Then add to package.json:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "serve": "node server.js"
}
```

### Option 3: Add Webpack
```bash
npm install --save-dev webpack webpack-cli @babel/core @babel/preset-react babel-loader
```

## API

The app uses OpenWeatherMap API:
- Current weather: `api.openweathermap.org/data/2.5/weather`
- Air quality: `api.openweathermap.org/data/2.5/air_pollution`
- Forecast: `api.openweathermap.org/data/2.5/forecast`

API Key: `a26802c7fc690794471791414640fe94` (included for development)

## Styling

The app features:
- Ultra-transparent backgrounds (3% opacity)
- Animated gradient background (15s cycle)
- Smooth hover transitions
- Glass-morphism effect
- Responsive grid layout
- Weather-specific background themes

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

Requires backdrop-filter support for full effect.
