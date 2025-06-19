let searchBtn = document.getElementById("searchBtn");
let cityInput = document.getElementById("cityInput");

searchBtn.addEventListener("click", () => {
  let cityName = cityInput.value.trim();
  
  if (cityName !== "") {
    getWeather(cityName);
  }
});

function getWeather(city) {
  const apiKey =  "5847c9151981e7a3446c30f7783b32ad";
  const url = "https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric";

  // Show loader before fetch
  document.getElementById("loader").style.display = "block";

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then(data => {
      // Hide loader
      document.getElementById("loader").style.display = "none";

      // Show data
      document.getElementById("cityName").textContent = data.name;
      document.getElementById("temperature").textContent = "🌡 ${data.main.temp} °C";
      document.getElementById("condition").textContent = "⛅ ${data.weather[0].description}";
    })
    .catch(error => {
      // Hide loader
      document.getElementById("loader").style.display = "none";

      // Show error
      document.getElementById("cityName").textContent = "⚠ City not found!";
      document.getElementById("temperature").textContent = "";
      document.getElementById("condition").textContent = "";
    });
}