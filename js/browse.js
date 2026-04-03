/* Browse page logic */
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('browse-grid');
  const searchInput = document.getElementById('search-input');
  const genreFilter = document.getElementById('genre-filters');
  const sortSelect = document.getElementById('sort-select');
  const pageInfo = document.getElementById('page-info');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const resultsCount = document.getElementById('results-count');

  let currentPage = 1;
  let currentGenre = '';
  let currentSearch = '';
  let currentSort = 'rating';
  let totalPages = 1;

  function buildCard(anime) {
    const genres = Array.isArray(anime.genres) ? anime.genres : [];
    return `
      <a class="anime-card" href="/anime.html?id=${anime.id}">
        <div class="card-poster">
          <img src="${anime.cover_image}" alt="${anime.title}" loading="lazy">
          <div class="card-overlay"><span class="play-btn">▶</span></div>
          <span class="card-rating">⭐ ${anime.rating?.toFixed(1) || '?'}</span>
          <span class="card-type">${anime.type || 'TV'}</span>
        </div>
        <div class="card-info">
          <p class="card-title">${anime.title_english || anime.title}</p>
          <p class="card-year">${anime.year || ''}</p>
          <div class="card-genres">${genres.slice(0,3).map(g=>`<span>${g}</span>`).join('')}</div>
        </div>
      </a>`;
  }

  async function load() {
    grid.innerHTML = '<div class="browse-loading">Loading...</div>';
    try {
      const { data, pagination } = await api.browseAnime({
        search: currentSearch,
        genre: currentGenre,
        sort: currentSort,
        page: currentPage,
        limit: 24,
      });
      totalPages = pagination.pages;
      resultsCount.textContent = `${pagination.total} anime found`;
      pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
      prevBtn.disabled = currentPage <= 1;
      nextBtn.disabled = currentPage >= totalPages;
      grid.innerHTML = data.length ? data.map(buildCard).join('') : '<p class="no-results">No anime found.</p>';
    } catch (err) {
      grid.innerHTML = '<p class="no-results">Failed to load. Please try again.</p>';
    }
  }

  // Load genre chips
  try {
    const genres = await api.getGenres();
    genreFilter.innerHTML = `<button class="genre-chip active" data-genre="">All</button>` +
      genres.map(g => `<button class="genre-chip" data-genre="${g}">${g}</button>`).join('');
    genreFilter.addEventListener('click', e => {
      const btn = e.target.closest('.genre-chip');
      if (!btn) return;
      genreFilter.querySelectorAll('.genre-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentGenre = btn.dataset.genre;
      currentPage = 1;
      load();
    });
  } catch {}

  // Search with debounce
  let debounce;
  searchInput?.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      currentSearch = searchInput.value.trim();
      currentPage = 1;
      load();
    }, 400);
  });

  sortSelect?.addEventListener('change', () => {
    currentSort = sortSelect.value;
    currentPage = 1;
    load();
  });

  prevBtn?.addEventListener('click', () => { if (currentPage > 1) { currentPage--; load(); } });
  nextBtn?.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; load(); } });

  load();
});
