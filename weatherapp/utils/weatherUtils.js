export function mapWeatherCode(code) {
  let iconClass = 'fa-solid fa-cloud';
  let bgClass = 'clouds';

  if (code >= 200 && code < 300) {
    iconClass = 'fa-solid fa-cloud-bolt';
    bgClass = 'thunderstorm';
  } else if (code >= 300 && code < 400) {
    iconClass = 'fa-solid fa-cloud-rain';
    bgClass = 'rain';
  } else if (code >= 500 && code < 600) {
    iconClass = 'fa-solid fa-cloud-showers-heavy';
    bgClass = 'rain';
  } else if (code >= 600 && code < 700) {
    iconClass = 'fa-solid fa-snowflake';
    bgClass = 'snow';
  } else if (code >= 700 && code < 800) {
    iconClass = 'fa-solid fa-smog';
    bgClass = 'clouds';
  } else if (code === 800) {
    iconClass = 'fa-solid fa-sun';
    bgClass = 'clear';
  } else if (code > 800) {
    iconClass = code === 801 || code === 802 ? 'fa-solid fa-cloud-sun' : 'fa-solid fa-cloud';
    bgClass = 'clouds';
  }

  return { iconClass, bgClass };
}
