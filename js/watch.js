/* Watch page logic — embeds YouTube playlist player */
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const seasonNum = parseInt(params.get('season') || '1', 10);
  if (!id) { location.href = '/browse.html'; return; }

  try {
    const anime = await api.getAnime(id);
    const season = anime.seasons?.find(s => s.season_number === seasonNum) || anime.seasons?.[0];

    document.title = `Watching: ${anime.title_english || anime.title} — AniStream`;
    document.getElementById('watch-title').textContent =
      `${anime.title_english || anime.title} — ${season?.title || `Season ${seasonNum}`}`;
    document.getElementById('watch-anime-link').href = `/anime.html?id=${id}`;
    document.getElementById('watch-anime-link').textContent = anime.title_english || anime.title;
    document.getElementById('watch-cover').src = anime.cover_image;

    // Embed player
    const iframe = document.getElementById('player-iframe');
    const noStream = document.getElementById('no-stream');

    if (season?.stream_url) {
      iframe.src = season.stream_url;
      iframe.style.display = '';
      noStream.style.display = 'none';
      if (auth.isLoggedIn()) api.addHistory(id, seasonNum, 1).catch(() => {});
    } else {
      iframe.style.display = 'none';
      noStream.style.display = '';
      // Set YouTube search fallback
      const ytBtn = document.getElementById('yt-search-btn');
      if (ytBtn) {
        const q = encodeURIComponent(`${anime.title_english || anime.title} ${season?.title || ''} full episode english sub`);
        ytBtn.href = `https://www.youtube.com/results?search_query=${q}`;
      }
    }

    // Season switcher
    const seasonList = document.getElementById('season-list');
    if (seasonList && anime.seasons?.length) {
      seasonList.innerHTML = anime.seasons.map(s => `
        <a class="season-item ${s.season_number === seasonNum ? 'active' : ''}"
           href="/watch.html?id=${id}&season=${s.season_number}">
          <span class="season-num">S${s.season_number}</span>
          <span class="season-name">${s.title || `Season ${s.season_number}`}</span>
          <span class="ep-num">${s.episode_count || '?'} eps</span>
        </a>`).join('');
    }

    // Prev / Next season buttons
    const total = anime.seasons?.length || 1;
    const prevBtn = document.getElementById('prev-season');
    const nextBtn = document.getElementById('next-season');
    if (prevBtn) { prevBtn.href = `/watch.html?id=${id}&season=${seasonNum - 1}`; prevBtn.style.display = seasonNum > 1 ? '' : 'none'; }
    if (nextBtn) { nextBtn.href = `/watch.html?id=${id}&season=${seasonNum + 1}`; nextBtn.style.display = seasonNum < total ? '' : 'none'; }

    document.getElementById('loading')?.remove();

  } catch (err) {
    console.error(err);
    document.getElementById('loading').innerHTML = `<p class="error-msg">Failed to load. <a href="/browse.html">Browse anime</a></p>`;
  }
});
