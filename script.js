document.addEventListener('DOMContentLoaded', () => {
  // Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // Simulated Media Data
  const mediaData = [
    { id: 1, title: 'Song One', artist: 'Artist A', source: 'youtube', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', genre: 'pop' },
    { id: 2, title: 'Song Two', artist: 'Artist B', source: 'soundcloud', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', genre: 'rock' },
  ];

  // Audio Player
  let currentSound = null;
  function playAudio(url, visualizerCanvas) {
    if (currentSound) currentSound.stop();
    currentSound = new Howl({ src: [url], html5: true });
    currentSound.play();
    confetti({ particleCount: 100, spread: 70, colors: ['#3B82F6', '#EC4899', '#8B5CF6'] });
    setupVisualizer(currentSound, visualizerCanvas);
  }

  // Visualizer
  function setupVisualizer(sound, canvas) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaElementSource(sound._sounds[0]._node);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const ctx = canvas.getContext('2d');

    function drawVisualizer() {
      requestAnimationFrame(drawVisualizer);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 150)`;
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }
    }
    sound.on('play', () => audioCtx.resume().then(drawVisualizer));
  }

  // Home Page Audio
  const featuredAudio = document.querySelector('#featured-audio');
  const featuredPlayBtn = document.querySelector('.featured .play-btn');
  if (featuredPlayBtn) {
    let isPlaying = false;
    featuredPlayBtn.addEventListener('click', () => {
      if (isPlaying) {
        currentSound.stop();
        featuredPlayBtn.textContent = 'Play';
      } else {
        playAudio(featuredAudio.src, document.querySelector('.featured .visualizer'));
        featuredPlayBtn.textContent = 'Pause';
      }
      isPlaying = !isPlaying;
    });
  }

  // Music Search
  const musicSearchInput = document.querySelector('#music-search-input');
  const musicSearchBtn = document.querySelector('#music-search-btn');
  const sourceFilter = document.querySelector('#source-filter');
  const genreFilter = document.querySelector('#genre-filter');
  const searchResults = document.querySelector('#search-results');

  function renderResults(results) {
    searchResults.innerHTML = '';
    results.forEach(item => {
      const card = document.createElement('div');
      card.className = 'media-card';
      card.innerHTML = `
        <audio id="audio-${item.id}" src="${item.url}"></audio>
        <h3>${item.title}</h3>
        <p>${item.artist} - ${item.source}</p>
        <button class="play-btn" data-id="${item.id}">Play</button>
        <canvas class="visualizer" width="200" height="50"></canvas>
      `;
      searchResults.appendChild(card);
      card.querySelector('.play-btn').addEventListener('click', () => {
        playAudio(item.url, card.querySelector('.visualizer'));
      });
    });
  }

  if (musicSearchBtn) {
    musicSearchBtn.addEventListener('click', () => {
      const query = musicSearchInput.value.toLowerCase();
      const source = sourceFilter.value;
      const genre = genreFilter.value;
      const results = mediaData.filter(item =>
        (item.title.toLowerCase().includes(query) || item.artist.toLowerCase().includes(query)) &&
        (source === 'all' || item.source === source) &&
        (genre === 'all' || item.genre === genre)
      );
      renderResults(results);
    });
  }
});
