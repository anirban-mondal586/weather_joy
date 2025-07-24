window.addEventListener('DOMContentLoaded', () => {

    // --- DOM ELEMENT REFERENCES ---
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const weatherDisplay = document.getElementById('weather-display');
    const weatherDetails = document.getElementById('weather-details');
    const cityNameEl = document.getElementById('city-name');
    const weatherIconEl = document.getElementById('weather-icon');
    const temperatureEl = document.getElementById('temperature');
    const weatherDescriptionEl = document.getElementById('weather-description');
    const dateTimeEl = document.getElementById('date-time');
    const humidityEl = document.getElementById('humidity');
    const windSpeedEl = document.getElementById('wind-speed');
    const feelsLikeEl = document.getElementById('feels-like');
    const bgVideo = document.getElementById('bg-video');
    const weatherAudio = document.getElementById('weather-audio');
    
    // ADDED: New element references
    const cityNav = document.querySelector('.city-nav');
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    const iconMusicOn = document.getElementById('icon-music-on');
    const iconMusicOff = document.getElementById('icon-music-off');

    // --- API AND STATE ---
    const apiKey = '2489b7337f2c31675f02610a42862890'; // Your API Key
    let hasUserInteracted = false;
    let isMusicOn = false; // Music is off by default

    // --- CUSTOMIZABLE MEDIA SOURCES ---
    const weatherMedia = {
        sunny: { video: 'sunny.mp4', audio: 'morning-birdsong-246402.mp3' },
        cloudy: { video: 'cloudy.mp4', audio: 'winter-wind-305577.mp3' },
        rainy: { video: 'Rainy.mp4', audio: 'rainy-ambience-1-237624.mp3' },
        thunderstorm: { video: 'thunder.mp4', audio: 'thunder-strike-wav-321628.mp3' },
        foggy: { video: 'foggy.mp4', audio: 'desert-wind-1-350398.mp3' },
        snowy: { video: 'snow.mp4', audio: 'sound-of-falling-snow-211055.mp3' },
        night: { video: 'night.mp4', audio: 'city-night-crickets-24013.mp3' },
        default: { video: 'default.mp4', audio: 'relaxing-guitar-loop-v9-252352.mp3' }
    };

    // --- CORE FUNCTIONS ---
    const getWeatherData = async (city) => {
        if (!apiKey || apiKey === 'YOUR_API_KEY') {
            displayError("Please add your OpenWeatherMap API key in logic.js");
            return;
        }
        showLoader(true);
        hideError();
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`City not found (${response.status})`);
            const data = await response.json();
            updateUI(data);
            updateActiveCityLink(city); // ADDED: Update active city link
        } catch (error) {
            displayError(error.message);
        } finally {
            showLoader(false);
        }
    };

    const updateUI = (data) => {
        const { name, main, weather, wind } = data;
        cityNameEl.textContent = name;
        temperatureEl.textContent = `${Math.round(main.temp)}°C`;
        weatherDescriptionEl.textContent = weather[0].description;
        dateTimeEl.textContent = new Date().toLocaleString('en-US', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
        humidityEl.textContent = `${main.humidity}%`;
        windSpeedEl.textContent = `${wind.speed} m/s`;
        feelsLikeEl.textContent = `${Math.round(main.feels_like)}°C`;
        const weatherCondition = weather[0].main.toLowerCase();
        const iconCode = weather[0].icon;
        const isDay = iconCode.endsWith('d');
        updateBackgroundAndSound(weatherCondition, isDay);
        weatherIconEl.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@4x.png" alt="${weather[0].description}" style="width:100%; height:100%;">`;
        weatherDisplay.style.display = 'block';
        weatherDetails.style.display = 'grid';
    };

    const updateBackgroundAndSound = (condition, isDay) => {
        let themeKey = 'default';
        if (!isDay) themeKey = 'night';
        else if (condition.includes('clear')) themeKey = 'sunny';
        else if (condition.includes('cloud')) themeKey = 'cloudy';
        else if (condition.includes('rain') || condition.includes('drizzle')) themeKey = 'rainy';
        else if (condition.includes('thunderstorm')) themeKey = 'thunderstorm';
        else if (condition.includes('snow')) themeKey = 'snowy';
        else if (condition.includes('fog') || condition.includes('mist') || condition.includes('haze')) themeKey = 'foggy';
        const media = weatherMedia[themeKey] || weatherMedia.default;
        if (bgVideo.src !== media.video) {
            bgVideo.style.opacity = 0;
            setTimeout(() => {
                bgVideo.src = media.video;
                bgVideo.load();
                bgVideo.play().catch(e => console.error("Video autoplay failed:", e));
                bgVideo.style.opacity = 1;
            }, 500);
        }
        weatherAudio.src = media.audio;
        if (hasUserInteracted && isMusicOn) {
            weatherAudio.load();
            weatherAudio.play().catch(e => console.error("Audio autoplay failed:", e));
        }
    };

    // --- HELPER FUNCTIONS ---
    const showLoader = (show) => { loader.style.display = show ? 'block' : 'none'; if (show) { weatherDisplay.style.display = 'none'; weatherDetails.style.display = 'none'; } };
    const displayError = (message) => { errorMessage.textContent = `Error: ${message}`; errorMessage.style.display = 'block'; weatherDisplay.style.display = 'none'; weatherDetails.style.display = 'none'; };
    const hideError = () => { errorMessage.style.display = 'none'; };

    const handleUserInteraction = () => {
        if (!hasUserInteracted) {
            hasUserInteracted = true;
            if (isMusicOn && weatherAudio.src) {
                weatherAudio.play().catch(e => console.error("Audio could not play:", e));
            }
        }
    };
    
    // ADDED: Function to highlight the active city
    const updateActiveCityLink = (currentCity) => {
        document.querySelectorAll('.city-link').forEach(link => {
            if (link.textContent.toLowerCase() === currentCity.toLowerCase()) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    // --- EVENT LISTENERS ---
    searchBtn.addEventListener('click', () => {
        handleUserInteraction();
        const city = cityInput.value.trim();
        if (city) getWeatherData(city);
    });

    cityInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleUserInteraction();
            const city = cityInput.value.trim();
            if (city) getWeatherData(city);
        }
    });

    // ADDED: Listener for city navigation
    cityNav.addEventListener('click', (event) => {
        event.preventDefault();
        if (event.target.classList.contains('city-link')) {
            handleUserInteraction();
            const city = event.target.textContent;
            getWeatherData(city);
        }
    });

    // ADDED: Listener for music toggle button
    musicToggleBtn.addEventListener('click', () => {
        handleUserInteraction();
        isMusicOn = !isMusicOn;
        if (isMusicOn) {
            weatherAudio.play().catch(e => console.log("Audio waiting for source."));
            iconMusicOn.style.display = 'block';
            iconMusicOff.style.display = 'none';
        } else {
            weatherAudio.pause();
            iconMusicOn.style.display = 'none';
            iconMusicOff.style.display = 'block';
        }
    });

    // --- INITIAL LOAD ---
    getWeatherData('Kolkata');
});
