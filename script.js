document.addEventListener('DOMContentLoaded', () => {
  // Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // Data
  const mediaData = [
    { id: 1, title: 'Afrobeat Hit', artist: 'Burna Boy', source: 'youtube', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', genre: 'afrobeat', type: 'audio', isTrending: true, isNew: false },
    { id: 2, title: 'Pop Anthem', artist: 'Taylor Swift', source: 'youtube', url: 'https://www.w3schools.com/html/mov_bbb.mp4', genre: 'pop', type: 'video', isTrending: true, isNew: true },
    { id: 3, title: 'Rock Classic', artist: 'Queen', source: 'soundcloud', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', genre: 'rock', type: 'audio', isTrending: false, isNew: false },
    { id: 4, title: 'K-pop Dance', artist: 'BTS', source: 'youtube', url: 'https://www.w3schools.com/html/mov_bbb.mp4', genre: 'kpop', type: 'video', isTrending: true, isNew: true },
    { id: 5, title: 'Jazz Groove', artist: 'Miles Davis', source: 'youtube', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', genre: 'jazz', type: 'audio', isTrending: false, isNew: false },
    // Simulated 115 more items (80% YouTube)
    ...Array.from({ length: 115 }, (_, i) => ({
      id: i + 6,
      title: `Track ${i + 6}`,
      artist: `Artist ${i % 30 + 1}`,
      source: i % 5 === 0 ? 'soundcloud' : i % 5 === 1 ? 'vimeo' : 'youtube',
      url: i % 2 === 0 ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-' + (i % 3 + 1) + '.mp3' : 'https://www.w3schools.com/html/mov_bbb.mp4',
      genre: ['afrobeat', 'pop', 'rock', 'kpop', 'jazz', 'classical', 'hiphop', 'reggae', 'blues', 'country', 'edm', 'folk', 'latin', 'metal', 'soul'][i % 15],
      type: i % 2 === 0 ? 'audio' : 'video',
      isTrending: i % 6 === 0,
      isNew: i % 8 === 0
    }))
  ];

  const artistData = [
    { id: 1, name: 'Burna Boy', bio: 'Nigerian Afrobeat star known for global hits.', mediaIds: [1] },
    { id: 2, name: 'Taylor Swift', bio: 'American pop icon with chart-topping albums.', mediaIds: [2] },
    { id: 3, name: 'Queen', bio: 'British rock legends with timeless classics.', mediaIds: [3] },
    { id: 4, name: 'BTS', bio: 'South Korean K-pop sensation with a global fanbase.', mediaIds: [4] },
    { id: 5, name: 'Miles Davis', bio: 'Jazz legend known for innovative compositions.', mediaIds: [5] },
    // Simulated 25 more artists
    ...Array.from({ length: 25 }, (_, i) => ({
      id: i + 6,
      name: `Artist ${i + 6}`,
      bio: `Talented artist specializing in various genres.`,
      mediaIds: [i + 6]
    }))
  ];

  const festivalData = [
    { id: 1, name: 'Coachella', description: 'Iconic music festival in California.', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { id: 2, name: 'Tomorrowland', description: 'World-famous EDM festival in Belgium.', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    ...Array.from({ length: 8 }, (_, i) => ({
      id: i + 3,
      name: `Festival ${i + 3}`,
      description: `Exciting music festival with global artists.`,
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
    }))
  ];

  const eventData = [
    { id: 1, name: 'Burna Boy Concert', date: '2025-06-01T20:00:00Z', description: 'Live in Nairobi!' },
    { id: 2, name: 'Taylor Swift Tour', date: '2025-07-15T19:00:00Z', description: 'Global pop sensation.' },
    ...Array.from({ length: 8 }, (_, i) => ({
      id: i + 3,
      name: `Event ${i + 3}`,
      date: `2025-0${i % 6 + 6}-01T20:00:00Z`,
      description: `Upcoming music event.`
    }))
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
    const media = mediaData.find(m => m.url === url);
    if (media) {
      const history = JSON.parse(localStorage.getItem('history') || '[]');
      history.unshift(media);
      localStorage.setItem('history', JSON.stringify(history.slice(0, 50)));
    }
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

  // Favorites
  function setupFavorites(card, itemId) {
    const btn = card.querySelector('.favorite-btn');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favorites.includes(itemId)) btn.textContent = 'Unfavorite';
    btn.addEventListener('click', () => {
      const updatedFavorites = favorites.includes(itemId)
        ? favorites.filter(id => id !== itemId)
        : [...favorites, itemId];
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      btn.textContent = updatedFavorites.includes(itemId) ? 'Unfavorite' : 'Favorite';
    });
  }

  // Render Media
  function renderMedia(results, container, type, showFavorite = true) {
    container.innerHTML = '';
    results.forEach(item => {
      if (type && item.type !== type) return;
      const card = document.createElement('div');
      card.className = 'media-card';
      card.innerHTML = `
        ${item.type === 'audio' ? `<audio id="media-${item.id}" src="${item.url}"></audio>` : `<video id="media-${item.id}" src="${item.url}" controls></video>`}
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
        ${showFavorite ? `<button class="favorite-btn" data-id="${item.id}">Favorite</button>` : ''}
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
      if (showFavorite) setupFavorites(card, item.id);
    });
  }

  // Render Artists
  function renderArtists(results, container) {
    container.innerHTML = '';
    results.forEach(artist => {
      const card = document.createElement('div');
      card.className = 'artist-card';
      const media = mediaData.find(m => artist.mediaIds.includes(m.id));
      card.innerHTML = `
        <h3>${artist.name}</h3>
        <p>${artist.bio}</p>
        ${media ? (media.type === 'audio' ? `<audio id="media-${media.id}" src="${media.url}"></audio><button class="play-btn" data-id="${media.id}">Play</button><canvas class="visualizer" width="200" height="50"></canvas>` : `<video id="media-${media.id}" src="${media.url}" controls></video>`) : ''}
      `;
      container.appendChild(card);
      if (media && media.type === 'audio') {
        const playBtn = card.querySelector('.play-btn');
        let isPlaying = false;
        playBtn.addEventListener('click', () => {
          if (isPlaying) {
            currentSound.stop();
            playBtn.textContent = 'Play';
          } else {
            playAudio(media.url, card.querySelector('.visualizer'), playBtn);
          }
          isPlaying = !isPlaying;
        });
      }
    });
  }

  // Search Function
  function performSearch(query, source, genre, container, type) {
    query = query.toLowerCase();
    const mediaResults = mediaData.filter(item =>
      (item.title.toLowerCase().includes(query) || item.artist.toLowerCase().includes(query)) &&
      (source === 'all' || item.source === source) &&
      (genre === 'all' || item.genre === genre) &&
      (!type || item.type === type)
    );
    const artistResults = artistData.filter(artist =>
      artist.name.toLowerCase().includes(query)
    );
    renderMedia(mediaResults, container, type);
    if (!type) renderArtists(artistResults, container);
  }

  // Home Page
  const homeSearchInput = document.querySelector('#search-input');
  const homeSearchBtn = document.querySelector('#search-btn');
  if (homeSearchInput) {
    const container = document.querySelector('.carousel');
    homeSearchBtn.addEventListener('click', () => {
      performSearch(homeSearchInput.value, 'all', 'all', container, null);
    });
    homeSearchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') performSearch(homeSearchInput.value, 'all', 'all', container, null);
    });
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
      setupRatings(btn.closest('.media-card'), btn.getAttribute('data-id'));
      setupFavorites(btn.closest('.media-card'), btn.getAttribute('data-id'));
    });
  }

  // Music/Video Search
  ['music', 'video'].forEach(type => {
    const searchInput = document.querySelector(`#${type}-search-input`);
    const searchBtn = document.querySelector(`#${type}-search-btn`);
    const sourceFilter = document.querySelector(`#${type}-search-btn`) ? document.querySelector('#source-filter') : null;
    const genreFilter = document.querySelector(`#${type}-search-btn`) ? document.querySelector('#genre-filter') : null;
    const searchResults = document.querySelector('#search-results');

    if (searchInput) {
      const searchHandler = () => {
        performSearch(searchInput.value, sourceFilter.value, genreFilter.value, searchResults, type);
      };
      searchBtn.addEventListener('click', searchHandler);
      searchInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') searchHandler();
      });
    }
  });

  // Playlists
  const playlistsContainer = document.querySelector('#playlists');
  if (playlistsContainer) {
    const createPlaylistBtn = document.querySelector('#create-playlist-btn');
    const playlistNameInput = document.querySelector('#playlist-name');
    const playlists = JSON.parse(localStorage.getItem('playlists') || '[]');
    
    function renderPlaylists() {
      playlistsContainer.innerHTML = '';
      playlists.forEach((playlist, index) => {
        const playlistDiv = document.createElement('div');
        playlistDiv.className = 'playlist';
        playlistDiv.innerHTML = `<h2>${playlist.name}</h2>`;
        renderMedia(playlist.items, playlistDiv, null, false);
        const playAllBtn = document.createElement('button');
        playAllBtn.className = 'playlist-btn';
        playAllBtn.textContent = 'Play All';
        playAllBtn.addEventListener('click', () => {
          const audio = playlistDiv.querySelector('audio');
          if (audio) playAudio(audio.src, playlistDiv.querySelector('.visualizer'), playlistDiv.querySelector('.play-btn'));
        });
        playlistDiv.appendChild(playAllBtn);
        playlistsContainer.appendChild(playlistDiv);
      });
    }

    createPlaylistBtn.addEventListener('click', () => {
      const name = playlistNameInput.value.trim();
      if (name) {
        playlists.push({ name, items: mediaData.slice(0, 3) });
        localStorage.setItem('playlists', JSON.stringify(playlists));
        playlistNameInput.value = '';
        renderPlaylists();
        confetti({ particleCount: 150, spread: 80 });
      }
    });
    renderPlaylists();
  }

  // Artists
  const artistList = document.querySelector('#artist-list');
  if (artistList) {
    renderArtists(artistData, artistList);
  }

  // About Page Confetti
  const confettiBtn = document.querySelector('.confetti-btn');
  if (confettiBtn) {
    confettiBtn.addEventListener('click', () => {
      confetti({ particleCount: 200, spread: 90, colors: ['#3B82F6', '#EC4899', '#8B5CF6'] });
    });
  }
});
