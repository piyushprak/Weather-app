class WeatherApp {
    constructor() {
        this.API_KEY = '5847c9151981e7a3446c30f7783b32ad';
        this.BASE_URL = 'https://api.openweathermap.org/data/2.5';

        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.locationBtn = document.getElementById('locationBtn');
        this.currentWeather = document.getElementById('currentWeather');
        this.forecastContainer = document.getElementById('forecastContainer');
        this.loading = document.getElementById('loading');

        this.init();
    }

    init() {
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.locationBtn.addEventListener('click', () => this.getCurrentLocation());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        this.loadDemoWeather();
    }

    async handleSearch() {
        const city = this.cityInput.value.trim();
        if (!city) return this.showError('Please enter a city name');

        await this.getWeatherByCity(city);
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            return this.showError('Geolocation is not supported by this browser');
        }

        this.showLoading();

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await this.getWeatherByCoords(latitude, longitude);
            },
            () => {
                this.showError('Unable to retrieve your location');
            }
        );
    }

    async getWeatherByCity(city) {
        this.showLoading();
        try {
            const timestamp = new Date().getTime();
            const currentRes = await fetch(`${this.BASE_URL}/weather?q=${city}&appid=${this.API_KEY}&units=metric&_=${timestamp}`);
            if (!currentRes.ok) {
                const err = await currentRes.json();
                throw new Error(err.message || 'City not found');
            }

            const forecastRes = await fetch(`${this.BASE_URL}/forecast?q=${city}&appid=${this.API_KEY}&units=metric`);
            const currentData = await currentRes.json();
            const forecastData = await forecastRes.json();

            this.displayWeather(currentData, forecastData);
        } catch (error) {
            this.showError(error.message);
        }
    }

    async getWeatherByCoords(lat, lon) {
        try {
            const currentRes = await fetch(`${this.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`);
            const forecastRes = await fetch(`${this.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`);

            const currentData = await currentRes.json();
            const forecastData = await forecastRes.json();

            this.displayWeather(currentData, forecastData);
        } catch (error) {
            this.showError('Unable to fetch weather data for your location');
        }
    }

    displayWeather(current, forecast) {
        this.displayCurrentWeather(current);
        this.displayForecast(forecast);
    }

    displayCurrentWeather(data) {
        const icon = this.getWeatherIcon(data.weather[0].main, data.weather[0].icon);
        this.currentWeather.innerHTML = `
            <div class="weather-main">
                <span class="weather-icon-main">${icon}</span>
                <div class="weather-info">
                    <h2 class="city-name">${data.name}, ${data.sys.country}</h2>
                    <p class="weather-desc">${data.weather[0].description}</p>
                    <div class="temperature">${Math.round(data.main.temp)}°C</div>
                </div>
            </div>
            <div class="weather-details">
                <div class="detail-item">
                    <span class="detail-icon">🌡️</span>
                    <div class="detail-label">Feels Like</div>
                    <div class="detail-value">${Math.round(data.main.feels_like)}°C</div>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">💧</span>
                    <div class="detail-label">Humidity</div>
                    <div class="detail-value">${data.main.humidity}%</div>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">💨</span>
                    <div class="detail-label">Wind Speed</div>
                    <div class="detail-value">${data.wind.speed} m/s</div>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">👁️</span>
                    <div class="detail-label">Visibility</div>
                    <div class="detail-value">${(data.visibility / 1000).toFixed(1)} km</div>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">📊</span>
                    <div class="detail-label">Pressure</div>
                    <div class="detail-value">${data.main.pressure} hPa</div>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">🕒</span>
                    <div class="detail-label">Updated</div>
                    <div class="detail-value">${new Date(data.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            </div>
        `;
    }

    displayForecast(data) {
        const dailyForecasts = this.processForecastData(data.list);
        this.forecastContainer.innerHTML = dailyForecasts.map(day => {
            const icon = this.getWeatherIcon(day.weather[0].main, day.weather[0].icon);
            return `
                <div class="forecast-card">
                    <div class="forecast-date">${this.formatDate(day.dt)}</div>
                    <span class="forecast-icon">${icon}</span>
                    <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
                    <div class="forecast-desc">${day.weather[0].description}</div>
                    <div class="forecast-details">
                        <span>💧 ${day.main.humidity}%</span>
                        <span>💨 ${day.wind.speed} m/s</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    processForecastData(forecastList) {
        const dayMap = {};
        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toDateString();
            const hour = date.getHours();

            if (hour === 12) {
                dayMap[dayKey] = item;
            } else if (!dayMap[dayKey]) {
                dayMap[dayKey] = item;
            }
        });
        return Object.values(dayMap).slice(0, 5);
    }

    getWeatherIcon(main, iconCode) {
        const icons = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Drizzle': '🌦️',
            'Thunderstorm': '⛈️',
            'Snow': '🌨️',
            'Mist': '🌫️',
            'Fog': '🌫️',
            'Haze': '🌫️',
            'Smoke': '🌫️',
            'Dust': '🌪️',
            'Sand': '🌪️',
            'Ash': '🌋',
            'Squall': '💨',
            'Tornado': '🌪️'
        };
        return icons[main] || '🌤️';
    }

    formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    showLoading() {
        this.currentWeather.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading weather data...</p>
            </div>
        `;
        this.forecastContainer.innerHTML = '';
    }

    showError(message) {
        this.currentWeather.innerHTML = `
            <div class="error">
                <span class="error-icon">⚠️</span>
                <div class="error-message">${message}</div>
                <div class="error-suggestion">Please try again or search for a different city.</div>
            </div>
        `;
        this.forecastContainer.innerHTML = '';
    }

    loadDemoWeather() {
        const now = Math.floor(Date.now() / 1000);
        const mockCurrent = {
            name: "New York",
            sys: { country: "US" },
            weather: [{ main: "Clear", description: "clear sky", icon: "01d" }],
            main: { temp: 22, feels_like: 25, humidity: 65, pressure: 1013 },
            wind: { speed: 3.5 },
            visibility: 10000,
            dt: now
        };

        const mockForecast = {
            list: Array.from({ length: 5 }, (_, i) => ({
                dt: now + (86400 * i),
                main: { temp: 20 + i, humidity: 60 - i },
                weather: [{ main: "Clear", description: "clear sky", icon: "01d" }],
                wind: { speed: 3 + i }
            }))
        };

        setTimeout(() => {
            this.displayWeather(mockCurrent, mockForecast);
        }, 800);
    }
}

document.addEventListener('DOMContentLoaded', () => new WeatherApp());
