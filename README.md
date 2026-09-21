# 🎵 Melomix 2.0

### AI-Powered Music Discovery & Management Platform

Melomix is a full-stack music discovery and management platform combining personalized recommendations, mood-based playlist generation, natural-language music search, persistent audio playback, listening analytics, and role-based administration.

---

## ✨ Features

### 🎧 Music Experience
* **Persistent Audio Player**: Continuous, gapless audio playback across page navigation with scrubbable seek bar, volume control, mute, and playback error auto-recovery.
* **Queue Management**: Full queue control supporting play next, add to queue, reordering, item removal, and queue clearing.
* **Shuffle and Repeat**: True random shuffle and single-track repeat modes.
* **Favorites (Liked Songs)**: Instant favorite toggling with synchronization across player, cards, rows, and library.
* **Playlists**: Create, rename, delete, and share public or private custom playlists with real-time track addition and removal.
* **Listening History**: Granular chronological history tracking exact stream times and durations without duplicate spam.
* **Global Search**: Debounced multi-entity search across Songs, Artists, Albums, and Playlists with tabbed filters.
* **Artist Pages**: Detailed artist discography with follower counters, top songs, albums, and persistent follow/unfollow support.
* **Mood Filtering**: 9 interactive mood chips (`All`, `Chill`, `Focus`, `Happy`, `Workout`, `Romantic`, `Energetic`, `Sad`, `Sleep`) with instant client-side catalog filtering.

### 🤖 AI Features
* **Content-Based Recommendations**: Scikit-learn TF-IDF vectorization and cosine similarity matching candidate tracks to user listening taste profiles.
* **Cold-Start Handling**: Intelligent fallback providing trending catalog tracks for newly registered accounts with sparse listening history.
* **Mood-Based Playlist Generation**: Generates coherent mood-aligned playlists on demand based on energy, tempo, and lyrical acoustic tags.
* **Natural-Language Music Search**: Semantic query parser extracting detected intent (mood, genre, activity) from conversational queries (e.g., *"calm music for studying at night"*).

### 📊 Analytics
* **Listening Time**: Formatted listening metrics computed from actual streaming durations.
* **Top Genres & Artists**: Interactive distribution breakdowns using Recharts visualizations.
* **Listening Trends**: 7-day listening activity area chart tracking playback session volume.
* **Most Played Tracks**: Ranked table of user's highest frequency songs.

### 🛡️ Administration
* **Role-Based Access Control**: Strict token verification and authorization guards separating standard users and administrators.
* **User Management**: Moderation table with search, role toggling (`user` ↔ `admin`), and safe deletion.
* **Catalog Management**: Moderation interfaces for Songs, Artists, and Albums with search and removal actions.
* **Platform Analytics**: Platform-wide metrics on total registered users, songs, playlists, streams, and catalog distribution.

---

## 🛠️ Tech Stack

### Frontend
* **Core**: React 18, TypeScript, Vite
* **Styling**: Tailwind CSS (Neutral Zinc Design System: `#F8F8FA` Light / `#09090B` Dark)
* **Visualizations**: Recharts
* **Icons**: Lucide React
* **Audio Engine**: HTML5 `<audio>` & Web Audio API (`AudioContext`, `BiquadFilterNode`, `AnalyserNode`)

### Backend
* **Runtime**: Node.js, Express, TypeScript
* **Database**: MongoDB with Mongoose ODM (Dual engine: MongoDB Atlas with automatic `mongodb-memory-server` fallback for zero-friction local development)
* **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing
* **Security & Performance**: Helmet, CORS, Express Rate Limit, Morgan logging

### AI / ML Service
* **Framework**: Python 3.10+, FastAPI, Uvicorn
* **Data Science**: Scikit-learn, NumPy, Pandas
* **Algorithms**: TF-IDF Feature Extraction, Pairwise Cosine Similarity, Regex-based NLP intent parsing

---

## 🏗️ Architecture

```mermaid
graph TD
    Client[React Frontend (Vite + TS)] -->|REST API Requests & JWT| Express[Express.js REST API (Port 5000)]
    Express -->|Mongoose ODM Queries| MongoDB[(MongoDB Database)]
    Express -->|HTTP POST /recommendations| MLService[FastAPI ML Service (Port 8000)]
    MLService -->|TF-IDF & Cosine Similarity| RecEngine[Scikit-learn Recommendation Engine]
```

---

## 📁 Project Structure

```text
melo-music/
├── frontend/               # React 18 single-page application (Vite, Tailwind, Recharts)
├── backend/                # Node.js + Express REST API (TypeScript, Mongoose, JWT)
├── ml-service/             # Python FastAPI machine learning recommendation service
├── docs/                   # Detailed architectural, API, and database specifications
│   ├── architecture.md     # System design, data flow, and component boundaries
│   ├── api.md              # REST API endpoint contracts and payloads
│   └── database.md         # MongoDB collection schemas and indexes
├── docker-compose.yml      # Multi-container production deployment manifest
├── .env.example            # Environment variables configuration template
├── LICENSE                 # MIT License (Rohith Konuru)
└── README.md               # Project documentation
```

---

## 🚀 Installation & Local Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **Python**: v3.10 or higher
* **MongoDB**: Optional (If no external MongoDB instance is provided, the backend automatically initializes an in-memory database server).

### 1. Clone the Repository
```bash
git clone https://github.com/Rohithkonuru/Melo-Music.git
cd Melo-Music
```

### 2. Configure Environment Variables
Copy `.env.example` to `backend/.env` (or configure at root):
```bash
cp .env.example backend/.env
```
*(Leave `MONGODB_URI` empty to use the zero-friction in-memory MongoDB database in development).*

---

### 3. Start the Services

#### A. Backend API
```bash
cd backend
npm install
npm run dev
```
*Backend runs at:* `http://localhost:5000`  
*Health Check:* `http://localhost:5000/api/health`

#### B. ML Recommendation Service
```bash
cd ml-service
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
*ML Service runs at:* `http://127.0.0.1:8000`  
*API Docs (Swagger):* `http://127.0.0.1:8000/docs`

#### C. Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Application runs at:* `http://localhost:5173`

---

## 🔐 Demo Credentials

The application includes pre-seeded demo accounts accessible via 1-click fast-fill buttons on the login screen (`/login`):

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Standard User** | `user@melomix.com` | `password123` | Listening, Playlists, Favorites, Analytics |
| **Platform Admin** | `admin@melomix.com` | `password123` | Full Admin Dashboard (`/admin`), User & Catalog Moderation |

---

## 🧪 Testing & Verification

All automated tests have been executed and verified across every service:

```bash
# Frontend Typecheck and Production Build
cd frontend
npm run build
# Result: 0 errors (built in ~7s)

# Backend TypeScript Verification and Automated API Test Suite
cd backend
npx tsc --noEmit
npm test
# Result: 6/6 API tests passed (Health, Songs, Auth, Session, Playlists, AI Recs)

# Python ML Recommendation Engine Tests
cd ml-service
python -m pytest
# Result: 3/3 passed (Health, Content-based Recs, Cold-Start fallback)
```

---

## 🎨 UI & Design Philosophy

Melomix follows a strict design priority:
```text
FUNCTIONALITY > USABILITY > CLEAN DESIGN > ANIMATION
```
* **Neutral Zinc Palette**: High-contrast, restrained zinc color tokens (`#F8F8FA` daylight bright mode and `#09090B` deep dark mode) with zero distracting neon glows or excessive blur effects.
* **Persistent Bottom Player**: Fixed bottom player keeps audio playback uninterrupted as users navigate between pages.
* **Mobile-First Responsive Layout**: Fully tested at mobile viewports (390 × 844) with no horizontal overflow and scrubbable controls.

---

## 🤖 Recommendation System

The recommendation engine operates through a transparent 5-stage pipeline:
1. **Taste Profile Aggregation**: The system collects the user's listened and liked tracks, weighting genre, mood, artist, and language tokens.
2. **TF-IDF Vectorization**: Song metadata across the catalog is transformed into high-dimensional TF-IDF vectors using Scikit-learn's `TfidfVectorizer`.
3. **Cosine Similarity Computation**: Pairwise cosine similarity is computed between the user profile vector and candidate catalog tracks.
4. **Ranking & Filtering**: Candidate tracks are ranked by similarity score, excluding songs the user has already played.
5. **Cold-Start Fallback**: For new users with fewer than 3 playback events, the system automatically falls back to trending catalog tracks.

---

## 🔊 Audio Architecture

* **HTML5 Audio Core**: A singleton HTML5 `<audio>` element mounted in `PlayerContext` guarantees uninterrupted streaming across route transitions.
* **Web Audio API**: The audio element is routed through an `AudioContext` connected to:
  * A 5-band `BiquadFilterNode` hardware equalizer (60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz) supporting acoustic presets (`Flat`, `Bass Boost`, `Vocal Boost`, `Electronic`, `Acoustic`).
  * A 64-bin FFT `AnalyserNode` rendering real-time frequency visuals to an HTML5 canvas spectrum visualizer.
* **Error Recovery**: If a remote stream encounters a network or codec failure, the player shows an inline `"Unable to play this track"` notification with working **Retry** and **Skip** actions.

---

## 🔒 Security

* **Stateless JWT Authentication**: Tokens signed using HMAC SHA-256 with expiration and strict authorization middleware.
* **Password Encryption**: Passwords salted and hashed with `bcryptjs` (10 rounds). Passwords are never returned in database queries (`select: false`).
* **Route Protection**: The `/admin` dashboard is strictly protected against unauthorized access; non-admin users receive an "Access Restricted" screen.
* **Input Validation**: All incoming REST payloads are sanitized and validated to prevent injection.

---

## 🐳 Docker Deployment

Melomix includes a multi-container `docker-compose.yml` configuration:

```bash
# Build and run all services (MongoDB, ML Service, Backend API, Frontend Nginx)
docker-compose up --build -d

# View service logs
docker-compose logs -f

# Shut down services
docker-compose down
```

---

## 📸 Screenshots

| View | Description | Preview |
| :--- | :--- | :---: |
| **Home Page** | Clean daylight interface with "Made for you" and trending tracks | `docs/screenshots/home.png` |
| **Now Playing Drawer** | Synced karaoke lyrics, queue manager, and 5-band equalizer | `docs/screenshots/drawer.png` |
| **Admin Console** | Platform analytics, catalog moderation, and user management | `docs/screenshots/admin.png` |
| **Mobile Layout** | Responsive 390px viewport navigation and player controls | `docs/screenshots/mobile.png` |

---

## 🔮 Future Improvements

* **Collaborative Filtering**: Integration of Matrix Factorization (SVD) for user-user collaborative modeling.
* **Vector Database Integration**: Integration of Milvus or Pinecone for sub-millisecond vector indexing across million-track catalogs.
* **Cloud Audio Uploads**: Direct S3 / Cloudflare R2 bucket integration for artist track uploads.

---

## 👨‍💻 Author

**Rohith Konuru**  
* GitHub: [@Rohithkonuru](https://github.com/Rohithkonuru)  
* Email: `rohithkonuru9@gmail.com`

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.  
Copyright (c) 2026 Rohith Konuru.
