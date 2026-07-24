// Weather App
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const API_KEY = "c464a1dca478d483d12ac6d5011b7ead"; // your key

const App = () => {
  const [city, setCity] = useState("");
  const [detectedCity, setDetectedCity] = useState("");
  const [message, setMessage] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);

  // Auto-detect city once
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Reverse geocoding → get city name
            const geoRes = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
            );
            const geoData = await geoRes.json();
            if (geoData.length > 0) {
              setDetectedCity(geoData[0].name);
            }

            // Fetch weather with coordinates
            const weatherRes = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
            );
            const weather = await weatherRes.json();
            setWeatherData(weather);

            // Fetch forecast
            const forecastRes = await fetch(
              `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
            );
            const forecast = await forecastRes.json();
            const dailyForecasts = forecast.list.filter((f) =>
              f.dt_txt.includes("12:00:00")
            );
            setForecastData(dailyForecasts);
          } catch (error) {
            console.error(error);
            setMessage("Could not fetch weather for your location.");
          }
        },
        () => {
          setMessage("Location access denied. Enter a city manually.");
        }
      );
    } else {
      setMessage("Geolocation not supported by this browser.");
    }
  }, []); // ✅ runs only once

  const changeCity = (e) => {
    setCity(e.target.value);
    setMessage("");
  };

  const showWeather = async (e) => {
    e.preventDefault();
    if (city === "") {
      setMessage("Please enter a city name");
      return;
    }

    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          city
        )}&appid=${API_KEY}&units=metric`
      );
      if (!weatherRes.ok) throw new Error("City not found");
      const weather = await weatherRes.json();
      setWeatherData(weather);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          city
        )}&appid=${API_KEY}&units=metric`
      );
      const forecast = await forecastRes.json();
      const dailyForecasts = forecast.list.filter((f) =>
        f.dt_txt.includes("12:00:00")
      );
      setForecastData(dailyForecasts);

      setCity("");
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("City not found");
      setWeatherData(null);
      setForecastData([]);
    }
  };

  // 🎨 Background changes with weather
  const getBackground = () => {
    if (!weatherData) {
      return "linear-gradient(135deg, #89f7fe, #66a6ff)";
    }
    const condition = weatherData.weather[0].main;
    switch (condition) {
      case "Clear":
        return "linear-gradient(135deg, #f6d365, #fda085)"; // Sunny
      case "Clouds":
        return "linear-gradient(135deg, #bdc3c7, #2c3e50)"; // Cloudy
      case "Rain":
        return "linear-gradient(135deg, #00c6ff, #0072ff)"; // Rainy
      case "Snow":
        return "linear-gradient(135deg, #e6e9f0, #eef1f5)"; // Snowy
      default:
        return "linear-gradient(135deg, #89f7fe, #66a6ff)"; // Default
    }
  };

  return (
    <div
      className="vh-100 d-flex justify-content-center align-items-center"
      style={{
        background: getBackground(),
        color: "#fff",
      }}
    >
      <div className="card text-center p-4 shadow-lg" style={{ width: "420px" }}>
        <div className="card-body">
          <h1 className="card-title mb-4">🌤️ Weather App</h1>

          {detectedCity && (
            <p className="text-success">📍 Detected City: {detectedCity}</p>
          )}

          <form
            className="d-flex flex-column align-items-center"
            onSubmit={showWeather}
          >
            <input
              type="text"
              placeholder="Enter city name"
              className="form-control mb-3"
              value={city}
              onChange={changeCity}
            />
            <button type="submit" className="btn btn-primary">
              Get Weather
            </button>
          </form>

          {message && <div className="mt-3 text-danger">{message}</div>}

          {weatherData && (
            <div className="mt-4">
              <h4>
                {weatherData.name}, {weatherData.sys.country}
              </h4>
              <p>🌡️ {Math.round(weatherData.main.temp)}°C</p>
              <p>{weatherData.weather[0].description}</p>
            </div>
          )}

          {forecastData.length > 0 && (
            <div className="mt-4">
              <h5>5-Day Forecast</h5>
              <div className="d-flex justify-content-between">
                {forecastData.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-2 border rounded bg-light text-dark"
                  >
                    <p>
                      {new Date(f.dt_txt).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </p>
                    <p>{Math.round(f.main.temp)}°C</p>
                    <p>{f.weather[0].main}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
