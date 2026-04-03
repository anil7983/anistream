/* Home page — auto-cycling hero, live search, scroll animations */
document.addEventListener('DOMContentLoaded', async () => {

  // ── Navbar scroll effect ─────────────────────────────────────────────────
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // ── Live Search ──────────────────────────────────────────────────────────
  const navSearch = document.getElementById('nav-search');
  const searchInput = document.getElementById('nav-search-input');
  const searchDropdown = document.getElementById('search-dropdown');
  let searchDebounce;

  searchInput?.addEventListener('focus', () => navSearch.classList.add('open'));
  document.addEventListener('click', (e) => {
    if (!navSearch.contains(e.target)) navSearch.classList.remove('open');
  });

  searchInput?.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    const q = searchInput.value.trim();
    if (!q) { searchDropdown.innerHTML = '<div class="search-empty">Start typing to search...</div>'; return; }
    searchDropdown.innerHTML = '<div class="search-empty"><span class="spinner-sm"></span></div>';
    searchDebounce = setTimeout(async () => {
      try {
        const { data } = await api.browseAnime({ search: q, limit: 5 });
        if (!data.length) { searchDropdown.innerHTML = '<div class="search-empty">No results found</div>'; return; }
        searchDropdown.innerHTML = data.map(a => `
          <a class="search-result-item" href="/anime.html?id=${a.id}">
            <img class="search-result-thumb" src="${a.cover_image}" alt="" loading="lazy">
            <div class="search-result-info">
              <div class="search-result-title">${a.title_english || a.title}</div>
              <div class="search-result-meta">⭐ ${a.rating?.toFixed(1) || '?'} · ${a.year || ''} · ${a.type || 'TV'}</div>
            </div>
          </a>`).join('');
      } catch { searchDropdown.innerHTML = '<div class="search-empty">Search failed</div>'; }
    }, 350);
  });

  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      window.location.href = `/browse.html?search=${encodeURIComponent(searchInput.value.trim())}`;
    }
  });

  // ── Build card ────────────────────────────────────────────────────────────
  function buildCard(anime, rank = null) {
    const genres = Array.isArray(anime.genres) ? anime.genres : [];
    const synopsis = (anime.synopsis || '').slice(0, 140);
    return `
      <a class="anime-card" href="/anime.html?id=${anime.id}">
        ${rank ? `<span class="rank-badge">#${rank}</span>` : ''}
        <div class="card-poster">
          <img src="${anime.cover_image}" alt="${anime.title}" loading="lazy">
          <span class="card-rating">⭐ ${anime.rating?.toFixed(1) || '?'}</span>
          <span class="card-type-badge">${anime.type || 'TV'}</span>
          <div class="card-overlay">
            <div class="overlay-play">▶</div>
            <p class="overlay-synopsis">${synopsis}${synopsis.length >= 140 ? '…' : ''}</p>
          </div>
        </div>
        <div class="card-info">
          <p class="card-title">${anime.title_english || anime.title}</p>
          <div class="card-meta">
            <span class="card-year">${anime.year || ''}</span>
            ${anime.year ? '<span class="card-dot"></span>' : ''}
            <span class="card-year">${anime.type || 'TV'}</span>
          </div>
          <div class="card-genres">${genres.slice(0, 2).map(g => `<span>${g}</span>`).join('')}</div>
        </div>
      </a>`;
  }

  function fillRow(id, list, ranked = false) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = list.map((a, i) => buildCard(a, ranked ? i + 1 : null)).join('');
  }

  // ── Scroll arrow buttons ──────────────────────────────────────────────────
  document.querySelectorAll('.row-scroll').forEach(row => {
    const track = row.querySelector('.row-track');
    row.querySelector('.scroll-left')?.addEventListener('click', () => track.scrollBy({ left: -600, behavior: 'smooth' }));
    row.querySelector('.scroll-right')?.addEventListener('click', () => track.scrollBy({ left: 600, behavior: 'smooth' }));
  });

  // ── Intersection Observer for row animations ──────────────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.row-section').forEach(s => observer.observe(s));

  // ── AUTO-CYCLING HERO ─────────────────────────────────────────────────────
  let heroAnime = [];
  let heroIndex = 0;
  let heroTimer = null;
  const heroContent = document.getElementById('hero-content');
  const heroSlidesEl = document.getElementById('hero-slides');
  const heroDotsEl = document.getElementById('hero-dots');

  function buildHeroSlides(list) {
    heroSlidesEl.innerHTML = list.map((a, i) => `
      <div class="hero-slide ${i === 0 ? 'active' : ''}"
           style="background-image:url('${a.banner_image || a.cover_image}')"></div>
    `).join('');
    heroDotsEl.innerHTML = list.map((_, i) => `
      <button class="hero-dot ${i === 0 ? 'active' : ''}" data-i="${i}" aria-label="Slide ${i + 1}"></button>
    `).join('');
    heroDotsEl.querySelectorAll('.hero-dot').forEach(btn => {
      btn.addEventListener('click', () => goToHero(+btn.dataset.i));
    });
  }

  function updateHeroContent(anime) {
    const genres = Array.isArray(anime.genres) ? anime.genres : [];
    heroContent.classList.add('fade-out');
    setTimeout(() => {
      document.getElementById('hero-title').textContent = anime.title_english || anime.title;
      document.getElementById('hero-rating').textContent = `⭐ ${anime.rating?.toFixed(1) || 'N/A'}`;
      document.getElementById('hero-year').textContent = anime.year || '';
      document.getElementById('hero-synopsis').textContent = (anime.synopsis || '').slice(0, 240) + '…';
      document.getElementById('hero-genres').innerHTML = genres.slice(0, 3).map(g => `<span class="genre-tag">${g}</span>`).join('');
      document.getElementById('hero-watch-btn').href = `/anime.html?id=${anime.id}`;
      document.getElementById('hero-list-btn').onclick = async () => {
        if (!auth.isLoggedIn()) { window.location.href = '/login.html'; return; }
        try { await api.addWatchlist(anime.id); } catch {}
      };
      heroContent.classList.remove('fade-out');
    }, 300);
  }

  function goToHero(idx) {
    const slides = heroSlidesEl.querySelectorAll('.hero-slide');
    const dots = heroDotsEl.querySelectorAll('.hero-dot');
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[idx]?.classList.add('active');
    dots[idx]?.classList.add('active');
    heroIndex = idx;
    updateHeroContent(heroAnime[idx]);
    clearInterval(heroTimer);
    heroTimer = setInterval(nextHero, 8000);
  }

  function nextHero() { goToHero((heroIndex + 1) % heroAnime.length); }

  // ── Continue Watching ─────────────────────────────────────────────────────
  async function loadContinue() {
    if (!auth.isLoggedIn()) return;
    try {
      const history = await api.getHistory();
      if (!history.length) return;
      document.getElementById('continue-section').style.display = '';
      fillRow('continue-track', history.map(h => ({
        id: h.anime_id, title: h.title, title_english: h.title_english,
        cover_image: h.cover_image, rating: null, genres: [], type: 'TV', year: null, synopsis: ''
      })));
    } catch {}
  }

  // ── Load everything ───────────────────────────────────────────────────────
  try {
    const [trending, action, fantasy, supernatural] = await Promise.all([
      api.getTrending(),
      api.getByGenre('Action'),
      api.getByGenre('Fantasy'),
      api.getByGenre('Supernatural'),
    ]);
    let romance = [];
    try { romance = await api.getByGenre('Romance'); } catch {}

    // Hero — pick top 5
    heroAnime = trending.slice(0, 5);
    buildHeroSlides(heroAnime);
    updateHeroContent(heroAnime[0]);
    heroTimer = setInterval(nextHero, 8000);

    fillRow('trending-track', trending, true);
    fillRow('action-track', action);
    fillRow('isekai-track', fantasy);
    fillRow('romance-track', romance);
    fillRow('supernatural-track', supernatural);

    await loadContinue();
    document.getElementById('loading')?.remove();
  } catch (err) {
    console.error('Homepage load failed:', err);
    document.getElementById('loading')?.remove();
  }
});
