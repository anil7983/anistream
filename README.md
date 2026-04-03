# AniStream — Free Anime Streaming Platform

A Netflix-style anime streaming website with a Node.js backend. Watch free, legal full-season anime via official YouTube channels (Muse Asia, VIZ Media, Ani-One Asia).

## ✨ Features

- 🎌 **20+ anime** with full seasons (Attack on Titan, Naruto, FMA Brotherhood, and more)
- 🔐 **User accounts** — register, login, JWT authentication
- 📋 **Watchlist** — save anime to watch later
- 📜 **Watch history** — track what you've watched
- 🔍 **Live search** — real-time search dropdown in navbar
- 🎬 **Auto-cycling hero** — rotating featured anime banner
- 📱 **Fully responsive** — works on mobile, tablet, desktop

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | SQLite (`node:sqlite` — built-in Node 22) |
| Auth | JWT + bcryptjs |
| Streaming | YouTube embed (official channels) |
| Anime Data | Jikan API (MyAnimeList) |

## 📦 Running Locally

### Prerequisites
- Node.js **v22+** (required for `node:sqlite`)

### Setup

```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Seed the anime database (takes ~60s due to Jikan rate limits)
node seed/seed.js

# 3. Start the server
node server.js
```

Then open **http://localhost:3001** in your browser.

**To access from other devices on the same network:**
```
http://192.168.100.1:3001
```

## 🌐 Deployment (Render.com)

This project is configured for one-click deployment on [Render.com](https://render.com):

1. Fork/clone this repo to your GitHub account
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Render auto-detects the `render.yaml` config
5. Set the `JWT_SECRET` environment variable in Render dashboard
6. Deploy! 🎉

## 📁 Project Structure

```
├── index.html          # Homepage with hero & anime rows
├── browse.html         # Browse & search all anime
├── anime.html          # Anime detail page
├── watch.html          # Video player page
├── login.html          # Sign in / Create account
├── profile.html        # User profile, watchlist, history
├── style.css           # All styles (dark anime theme)
├── js/                 # Frontend JavaScript
│   ├── api.js          # API client
│   ├── auth.js         # Auth state management
│   ├── home.js         # Homepage interactions
│   ├── browse.js       # Browse page
│   ├── anime-detail.js # Anime detail page
│   ├── watch.js        # Video player
│   ├── login.js        # Auth forms
│   └── profile.js      # Profile page
├── assets/             # Logo, background images
└── backend/
    ├── server.js       # Express server
    ├── package.json
    ├── db/
    │   └── database.js # SQLite setup & schema
    ├── routes/
    │   ├── auth.js     # /api/auth — login, register
    │   ├── anime.js    # /api/anime — browse, search
    │   └── user.js     # /api/user — watchlist, history
    ├── middleware/
    │   └── auth.js     # JWT middleware
    └── seed/
        └── seed.js     # Database seeder (Jikan API)
```

## 🎬 Legal Notice

All anime content is streamed from official, licensed YouTube channels. This platform does not host any video files. All rights belong to their respective owners.

## 📝 License

MIT — feel free to use this for learning and personal projects.
