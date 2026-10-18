import React, { useState } from "react";
import "./index.css";

const WEATHER_DESCRIPTIONS = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function getWeatherTheme(code) {
  if (code <= 1) return "sunny";
  if (code <= 3 || code === 45 || code === 48) return "cloudy";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return "rainy";
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return "snowy";
  }
  if (code >= 95) return "stormy";
  return "cloudy";
}

function getWeatherIcon(code) {
  if (code === 0) return "☀️";
  if (code === 1 || code === 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 95) return "⛈️";
  return "🌡️";
}

function getWeatherDescription(code) {
  return WEATHER_DESCRIPTIONS[code] || `Code ${code}`;
}

function formatHour(time) {
  return new Date(time).toLocaleTimeString([], {
    hour: "numeric",
    minute: undefined,
  });
}

function SearchBar({ cityInput, setCityInput, onSearch, loading }) {
  return (
    <form className="search-form" onSubmit={onSearch}>
      <label className="search-input-wrap">
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          value={cityInput}
          onChange={(event) => setCityInput(event.target.value)}
          placeholder="Search a city..."
          aria-label="Search a city"
        />
      </label>
      <button className="search-button" type="submit" disabled={loading}>
        {loading ? <><span className="loading-spinner" /> Searching</> : "Explore"}
      </button>
    </form>
  );
}

function CurrentWeatherCard({ location, current, units }) {
  const weatherCode = current.weather_code;
  const conditionText = getWeatherDescription(weatherCode);
  const theme = getWeatherTheme(weatherCode);

  return (
    <section className={`current-card weather-${theme}`} aria-label="Current weather">
      <div className="current-card-glow" aria-hidden="true" />
      <div className="current-card-top">
        <div className="location-copy">
          <span className="eyebrow"><span className="live-dot" /> CURRENT WEATHER</span>
          <h2>{location.name}</h2>
          <p>{[location.admin1, location.country].filter(Boolean).join(", ")}</p>
        </div>
        <div className="current-weather-icon" role="img" aria-label={conditionText}>
          {getWeatherIcon(weatherCode)}
        </div>
      </div>

      <div className="current-temperature">
        <strong>{Math.round(current.temperature_2m)}°</strong>
        <div>
          <span className="condition-label">{conditionText}</span>
          <span className="feels-like">
            Feels like {Math.round(current.apparent_temperature)}{units.apparent_temperature}
          </span>
        </div>
      </div>

      <div className="current-card-footer">
        <span><span aria-hidden="true">⌖</span> {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°</span>
        <span><span aria-hidden="true">◷</span> {formatHour(current.time)} local time</span>
      </div>
    </section>
  );
}

function ConditionCard({ icon, label, value, note }) {
  return (
    <article className="condition-card">
      <span className="condition-icon" aria-hidden="true">{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span className="condition-note">{note}</span>
      </div>
    </article>
  );
}

function HourlyForecast({ hourly, units, currentTimeStr }) {
  const [showMore, setShowMore] = useState(false);
  const currentHour = currentTimeStr ? currentTimeStr.slice(0, 13) : "";
  const foundIndex = hourly.time.findIndex((time) => time >= currentHour);
  const startIndex = Math.max(0, foundIndex);
  const displayCount = showMore ? 24 : 6;
  const displayHours = hourly.time.slice(startIndex, startIndex + displayCount);

  return (
    <section className="panel forecast-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE NEXT HOURS</span>
          <h2>Hourly forecast</h2>
        </div>
        <button className="text-button" type="button" onClick={() => setShowMore(!showMore)}>
          {showMore ? "Show less" : "Next 24 hours"} <span aria-hidden="true">→</span>
        </button>
      </div>
      <div className="hourly-list">
        {displayHours.map((time, index) => {
          const actualIndex = startIndex + index;
          const code = hourly.weather_code[actualIndex];
          return (
            <article className={`hourly-item${index === 0 ? " is-now" : ""}`} key={time}>
              <span className="hour-time">{index === 0 ? "Now" : formatHour(time)}</span>
              <span className="hour-icon" role="img" aria-label={getWeatherDescription(code)}>
                {getWeatherIcon(code)}
              </span>
              <strong>{Math.round(hourly.temperature_2m[actualIndex])}°</strong>
              <span className="hour-rain">💧 {hourly.precipitation_probability[actualIndex]}%</span>
              <span className="hour-wind">↗ {hourly.wind_speed_10m[actualIndex]} {units.wind_speed_10m}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function WeeklyForecast({ daily, units }) {
  return (
    <section className="panel weekly-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">LOOKING AHEAD</span>
          <h2>7-day forecast</h2>
        </div>
        <span className="forecast-caption">Your week, at a glance</span>
      </div>
      <div className="daily-list">
        {daily.time.map((date, index) => {
          const code = daily.weather_code[index];
          const day = new Date(`${date}T12:00:00`).toLocaleDateString([], { weekday: "short" });
          return (
            <article className="daily-row" key={date}>
              <span className="daily-day">{index === 0 ? "Today" : day}</span>
              <span className="daily-icon" role="img" aria-label={getWeatherDescription(code)}>
                {getWeatherIcon(code)}
              </span>
              <span className="daily-condition">{getWeatherDescription(code)}</span>
              <span className="daily-precip">☂ {daily.precipitation_sum[index]} {units.precipitation_sum}</span>
              <div className="daily-range">
                <span>{Math.round(daily.temperature_2m_min[index])}°</span>
                <div className="range-track"><span /></div>
                <strong>{Math.round(daily.temperature_2m_max[index])}°</strong>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function App() {
  const [cityInput, setCityInput] = useState("");
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (event) => {
    event.preventDefault();
    const query = cityInput.trim();
    if (!query) return;

    setLoading(true);
    setError("");

    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query
      )}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl);
      const geoJson = await geoRes.json();

      if (!geoJson.results || geoJson.results.length === 0) {
        throw new Error(`Location "${query}" was not found.`);
      }

      const match = geoJson.results[0];
      const locInfo = {
        name: match.name,
        country: match.country,
        admin1: match.admin1,
        latitude: match.latitude,
        longitude: match.longitude,
        timezone: match.timezone,
      };

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${locInfo.latitude}&longitude=${locInfo.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&timezone=${encodeURIComponent(
        locInfo.timezone || "auto"
      )}`;

      const weatherRes = await fetch(weatherUrl);
      const data = await weatherRes.json();

      if (data.error) {
        throw new Error(data.reason || "Unable to retrieve weather forecast.");
      }

      setLocation(locInfo);
      setWeatherData(data);
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const current = weatherData?.current;
  const units = weatherData?.current_units;

  return (
    <main className="weather-app">
      <div className="page-shell">
        <header className="page-header">
          <a className="brand" href="#" aria-label="Atmos home">
            <span className="brand-mark" aria-hidden="true">☼</span>
            <span>atmos<span className="brand-period">.</span></span>
          </a>
          <div className="header-note"><span className="header-sparkle">✦</span> A little closer to the sky</div>
          <SearchBar
            cityInput={cityInput}
            setCityInput={setCityInput}
            onSearch={handleSearch}
            loading={loading}
          />
        </header>

        {error && <div className="error-notice" role="alert"><span>!</span> {error}</div>}

        {weatherData && location && current && units ? (
          <>
            <div className="dashboard-heading">
              <div>
                <span className="eyebrow">YOUR PERSONAL FORECAST</span>
                <h1>Weather, made <em>beautiful.</em></h1>
              </div>
              <p>Live conditions for <strong>{location.name}</strong></p>
            </div>
            <section className="overview-grid">
              <CurrentWeatherCard location={location} current={current} units={units} />
              <section className="panel conditions-panel">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">RIGHT NOW</span>
                    <h2>Air conditions</h2>
                  </div>
                  <span className="conditions-orbit" aria-hidden="true">✦</span>
                </div>
                <div className="conditions-grid">
                  <ConditionCard
                    icon="🌡️"
                    label="Feels like"
                    value={`${Math.round(current.apparent_temperature)}${units.apparent_temperature}`}
                    note="Perceived temperature"
                  />
                  <ConditionCard
                    icon="💧"
                    label="Humidity"
                    value={`${current.relative_humidity_2m}${units.relative_humidity_2m}`}
                    note="Relative humidity"
                  />
                  <ConditionCard
                    icon="💨"
                    label="Wind speed"
                    value={`${current.wind_speed_10m} ${units.wind_speed_10m}`}
                    note="At your location"
                  />
                  <ConditionCard
                    icon="🌧️"
                    label="Precipitation"
                    value={`${current.precipitation} ${units.precipitation}`}
                    note="Currently falling"
                  />
                </div>
                <div className="pressure-note">
                  <span aria-hidden="true">◉</span>
                  Surface pressure
                  <strong>{current.surface_pressure} {units.surface_pressure}</strong>
                </div>
              </section>
            </section>

            <HourlyForecast
              hourly={weatherData.hourly}
              units={weatherData.hourly_units}
              currentTimeStr={current.time}
            />
            <WeeklyForecast daily={weatherData.daily} units={weatherData.daily_units} />
          </>
        ) : (
          <section className="welcome-panel">
            <div className="welcome-orbit orbit-one" />
            <div className="welcome-orbit orbit-two" />
            <span className="welcome-icon" aria-hidden="true">🌤️</span>
            <span className="eyebrow">A CLEARER VIEW OF YOUR DAY</span>
            <h1>Find your kind<br />of <em>weather.</em></h1>
            <p>Search any city to see the forecast, hourly outlook, and the little details that help you plan ahead.</p>
            <div className="welcome-categories" aria-label="Weather categories">
              <span>☀️ Clear</span><span>☁️ Cloudy</span><span>🌧️ Rain</span><span>❄️ Snow</span><span>⛈️ Storm</span>
            </div>
          </section>
        )}

        <footer className="page-footer">
          <span>MADE FOR THE MOMENT <span aria-hidden="true">✦</span></span>
          <span>Weather data by Open-Meteo</span>
        </footer>
      </div>
    </main>
  );
}
