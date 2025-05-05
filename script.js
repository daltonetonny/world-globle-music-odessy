document.addEventListener('DOMContentLoaded', () => {
  // Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // Simulated Media Data (Expanded)
  const mediaData = [
    { id: 1, title: 'Afrobeat Hit', artist: 'Burna Boy', source: 'youtube', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', genre: 'afrobeat', type: 'audio' },
    { id: 2, title: 'Pop Anthem', artist: 'Taylor Swift', source: 'youtube', url: 'https://www.w3schools.com/html/mov_bbb.mp4', genre: 'pop', type: 'video' },
    { id: 3, title: 'Rock Classic', artist: 'Queen', source: 'soundcloud', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', genre: 'rock', type: 'audio' },
    { id: 4, title: 'K-pop Dance', artist: 'BTS', source: 'vimeo', url: 'https://www.w3schools.com/html/mov_bbb.mp4', genre: 'kpop', type: 'video' },
    { id: 5, title: 'Jazz Groove', artist: 'Miles Davis', source: 'youtube', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', genre: 'jazz', type: 'audio' },
  ];

  // Audio Player
  let currentSound = null;
  function playAudio(url, visualizerCanvas, playBtn) {
    if (currentSound) currentSound.stop();
    currentSound = new Howl({ src: [url], html5: true });
    currentSound.play();
    confetti({ particleCount: 100, spread: 70, colors: ['#3B82F6', '#EC4899', '#8B5CF6'] });
    setupVisualizer(currentSound, visualizerCanvas);
    playBtn.textContent = 'Pause';
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

  // Ratings
  function setupRatings(card, itemId) {
    const stars = card.querySelectorAll('.star');
    const ratingKey = `rating-${itemId}`;
    const savedRating = localStorage.getItem(ratingKey) || 0;
    stars.forEach(star => {
      const value = star.getAttribute('data-value');
      if (value <= savedRating) star.classList.add('active');
      star.addEventListener('click', () => {
        localStorage.setItem(ratingKey, value);
        stars.forEach(s => {
          s.classList.remove('active');
          if (s.getAttribute('data-value') <= value) s.classList.add('active');
        });
      });
    });
  }

  // Home Page Carousel
  const carouselPlayBtns = document.querySelectorAll('.carousel .play-btn');
  carouselPlayBtns.forEach(btn => {
    let isPlaying = false;
    btn.addEventListener('click', () => {
      const card = btn.closest('.media-card');
      const audio = card.querySelector('audio');
      if (!audio) return;
      if (isPlaying) {
        currentSound.stop();
        btn.textContent = 'Play';
      } else {
        playAudio(audio.src, card.querySelector('.visualizer'), btn);
      }
      isPlaying = !isPlaying;
    });
  });

  // Search Functionality
  function renderResults(results, container, type) {
    container.innerHTML = '';
    results.forEach(item => {
      if (item.type !== type) return;
      const card = document.createElement('div');
      card.className = 'media-card';
      card.innerHTML = `
        ${item.type === 'audio' ? `<audio id="audio-${item.id}" src="${item.url}"></audio>` : `<video id="video-${item.id}" src="${item.url}" controls></video>`}
        <h3>${item.title}</h3>
        <p>${item.artist} - ${item.source}</p>
        ${item.type === 'audio' ? `<button class="play-btn" data-id="${item.id}">Play</button><canvas class="visualizer" width="200" height="50"></canvas>` : ''}
        <div class="rating">
          <span class="star" data-value="1">★</span>
          <span class="star" data-value="2">★</span>
          <span class="star" data-value="3">★</span>
          <span class="star" data-value="4">★</span>
          <span class="star" data-value="5">★</span>
        </div>
      `;
      container.appendChild(card);
      if (item.type === 'audio') {
        const playBtn = card.querySelector('.play-btn');
        let isPlaying = false;
        playBtn.addEventListener('click', () => {
          if (isPlaying) {
            currentSound.stop();
            playBtn.textContent = 'Play';
          } else {
            playAudio(item.url, card.querySelector('.visualizer'), playBtn);
          }
          isPlaying = !isPlaying;
        });
      }
      setupRatings(card, item.id);
    });
  }

  // Music/Video Search
  ['music', 'video'].forEach(type => {
    const searchInput = document.querySelector(`#${type}-search-input`);
    const searchBtn = document.querySelector(`#${type}-search-btn`);
    const sourceFilter = document.querySelector(`#${type}-search-btn`) ? document.querySelector('#source-filter') : null;
    const genreFilter = document.querySelector(`#${type}-search-btn`) ? document.querySelector('#genre-filter') : null;
    const searchResults = document.querySelector('#search-results');

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const query = searchInput.value.toLowerCase();
        const source = sourceFilter.value;
        const genre = genreFilter.value;
        const results = mediaData.filter(item =>
          (item.title.toLowerCase().includes(query) || item.artist.toLowerCase().includes(query)) &&
          (source === 'all' || item.source === source) &&
          (genre === 'all' || item.genre === genre)
        );
        renderResults(results, searchResults, type);
      });
    }
  });

  // Playlist Play All
  const playlistBtns = document.querySelectorAll('.playlist-btn');
  playlistBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const playlist = btn.closest('.playlist');
      const audio = playlist.querySelector('audio');
      if (audio) {
        playAudio(audio.src, playlist.querySelector('.visualizer'), playlist.querySelector('.play-btn'));
      }
    });
  });

  // About Page Confetti
  const confettiBtn = document.querySelector('.confetti-btn');
  if (confettiBtn) {
    confettiBtn.addEventListener('click', () => {
      confetti({ particleCount: 200, spread: 90, colors: ['#3B82F6', '#EC4899', '#8B5CF6'] });
    });
  });
});
