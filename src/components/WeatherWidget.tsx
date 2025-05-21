"use client";
import { useEffect, useState } from "react";

// Replace with your actual API key
const WEATHER_API_KEY = "ccc2f8afa4f7baa1a580a2e99ec40002";

// Optionally, you can move this to an env variable or API route for more security

type WeatherData = {
  temp: number;
  humidity: number;
  condition: string;
  icon: string;
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
          );
          const data = await res.json();
          if (res.ok) {
            setWeather({
              temp: data.main.temp,
              humidity: data.main.humidity,
              condition: data.weather[0].main, // e.g., "Rain", "Clear"
              icon: data.weather[0].icon,
            });
          } else {
            setError(data.message || "Failed to fetch weather.");
          }
        } catch (err) {
          setError("Failed to fetch weather.");
        }
        setLoading(false);
      },
      () => {
        setError("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  }, []);

  if (loading) return <div className="p-4 rounded-xl glass shadow">Loading weather...</div>;
  if (error) return <div className="p-4 rounded-xl glass shadow text-red-500">{error}</div>;
  if (!weather) return null;

  // Map OpenWeatherMap conditions to simple terms
  const conditionMap: Record<string, string> = {
    Rain: "Rainy",
    Drizzle: "Rainy",
    Thunderstorm: "Rainy",
    Clear: "Sunny",
    Clouds: "Cloudy",
    Snow: "Snowy",
    Mist: "Misty",
    Fog: "Foggy",
    Haze: "Hazy",
  };
  const simpleCondition = conditionMap[weather.condition] || weather.condition;

  return (
    <div className="relative p-2 sm:p-4 rounded-xl shadow flex flex-col sm:flex-row items-center gap-2 sm:gap-4 max-w-xs w-full bg-[#3b82f6]">
      <img
        src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
        alt={weather.condition}
        className="w-12 h-12 sm:w-16 sm:h-16 z-10"
      />
      <div className="z-10 flex flex-col gap-1 w-full">
        <div className="text-sm font-bold text-white">Temperature : {Math.round(weather.temp)}°C</div>
        <div className="text-sm font-bold text-white">Humidity: {weather.humidity}%</div>
        <div className="text-sm font-bold text-white">Condition: {simpleCondition}</div>
      </div>
    </div>
  );
} 