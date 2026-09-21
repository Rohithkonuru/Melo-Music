# Melomix 2.0 — REST API Reference

Base URL: `http://localhost:5000/api`

All authenticated endpoints require an `Authorization` header in the format:
```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 1. System Health

### `GET /api/health`
Returns the operational health status of the API, MongoDB connection, and system uptime.
* **Authentication**: Public
* **Response (200)**:
  ```json
  {
    "success": true,
    "message": "Melomix 2.0 API is healthy",
    "timestamp": "2026-09-21T12:00:00.000Z",
    "environment": "development"
  }
  ```

---

## 2. Authentication (`/api/auth`)

### `POST /api/auth/register`
Register a new user account.
* **Body**:
  ```json
  {
    "name": "Alex Rivera",
    "email": "user@melomix.com",
    "password": "password123",
    "confirmPassword": "password123"
  }
  ```
* **Response (201)**: Returns authentication token and sanitized user profile.

### `POST /api/auth/login`
Authenticate existing user with credentials.
* **Body**:
  ```json
  {
    "email": "user@melomix.com",
    "password": "password123"
  }
  ```
* **Response (200)**: Returns JWT bearer token and user object.

### `GET /api/auth/me`
Retrieve active user session profile.
* **Authentication**: Required

### `PUT /api/auth/profile`
Update user display name, avatar, and preferred discovery genres.
* **Authentication**: Required
* **Body**:
  ```json
  {
    "name": "Alex Rivera",
    "avatar": "https://...",
    "favoriteGenres": ["Lo-Fi", "Electronic"]
  }
  ```

---

## 3. Songs (`/api/songs`)

### `GET /api/songs`
List tracks with optional filtering, search, and pagination.
* **Query Parameters**:
  * `page` (number, default: 1)
  * `limit` (number, default: 20)
  * `genre` (string)
  * `mood` (string)
  * `search` (string)
  * `sort` ("popular" | "newest" | "title")

### `GET /api/songs/trending`
Retrieve top trending songs sorted by play count.
* **Query Parameters**: `limit` (default: 10)

### `GET /api/songs/new-releases`
Retrieve recently released tracks.
* **Query Parameters**: `limit` (default: 10)

### `GET /api/songs/:id`
Retrieve single track metadata with populated artist and album references.

### `POST /api/songs`
Create a new song.
* **Authentication**: Admin required

### `PUT /api/songs/:id`
Update existing song metadata.
* **Authentication**: Admin required

### `DELETE /api/songs/:id`
Delete track from catalog.
* **Authentication**: Admin required

### `POST /api/songs/:id/play`
Record a stream event and increment platform play count.

---

## 4. Playlists (`/api/playlists`)

### `GET /api/playlists`
Retrieve public playlists or user's private playlists.
* **Query Parameters**: `userId`, `search`, `limit`, `page`

### `POST /api/playlists`
Create a custom playlist.
* **Authentication**: Required
* **Body**:
  ```json
  {
    "name": "Midnight Chill",
    "description": "Lo-fi beats for late night coding",
    "isPublic": true
  }
  ```

### `GET /api/playlists/:id`
Retrieve playlist metadata and populated song list.

### `PUT /api/playlists/:id`
Update playlist name, description, cover, or privacy setting.
* **Authentication**: Required (Owner or Admin)

### `DELETE /api/playlists/:id`
Delete playlist.
* **Authentication**: Required (Owner or Admin)

### `POST /api/playlists/:id/songs`
Append song to playlist.
* **Authentication**: Required (Owner)
* **Body**: `{ "songId": "65f..." }`

### `DELETE /api/playlists/:id/songs/:songId`
Remove song from playlist.
* **Authentication**: Required (Owner)

---

## 5. Artists (`/api/artists`)

### `GET /api/artists`
List artists with pagination.

### `GET /api/artists/popular`
Retrieve top artists ordered by follower counts.

### `GET /api/artists/:id`
Retrieve artist discography including popular tracks and albums.

---

## 6. Albums (`/api/albums`)

### `GET /api/albums`
List albums with pagination.

### `GET /api/albums/:id`
Retrieve album metadata and tracklist.

---

## 7. Global Search (`/api/search`)

### `GET /api/search`
Multi-entity search across Songs, Artists, Albums, and Playlists.
* **Query Parameters**:
  * `q` (string, required): Search query
  * `type` ("all" | "songs" | "artists" | "albums" | "playlists")
  * `genre` (string, optional)
  * `mood` (string, optional)

---

## 8. User Collections (`/api/users`)

### `GET /api/users/favorites`
Retrieve user's liked tracks.
* **Authentication**: Required

### `POST /api/users/favorites/:songId`
Toggle favorite state for a track.
* **Authentication**: Required
* **Response (200)**: `{ "isLiked": true, "songLikeCount": 42 }`

### `GET /api/users/history`
Retrieve playback history timeline with durations and timestamps.
* **Authentication**: Required

### `POST /api/users/history`
Log a playback event.
* **Authentication**: Required
* **Body**: `{ "songId": "...", "durationPlayed": 180 }`

### `POST /api/users/follow/:artistId`
Toggle follow/unfollow for an artist.
* **Authentication**: Required

---

## 9. AI Recommendations (`/api/recommendations`)

### `GET /api/recommendations`
Retrieve personalized recommendations using TF-IDF cosine similarity against listening history.
* **Authentication**: Required (Falls back to trending tracks for cold-start users)

### `POST /api/recommendations/mood-playlist`
Generate custom mood-based track sequence.
* **Body**:
  ```json
  {
    "mood": "Focus",
    "genre": "Lo-Fi",
    "count": 10
  }
  ```

### `POST /api/recommendations/natural-search`
Natural language music intent query parser.
* **Body**:
  ```json
  { "query": "calm songs for working at night" }
  ```
* **Response (200)**:
  ```json
  {
    "originalQuery": "calm songs for working at night",
    "detectedIntent": { "mood": "Chill", "genre": "Lo-Fi", "activity": "Work" },
    "songs": [...]
  }
  ```

---

## 10. Analytics (`/api/analytics`)

### `GET /api/analytics/user`
Retrieve personalized analytics (total listening time, track counts, top genres, top artists, 7-day activity timeline).
* **Authentication**: Required

### `GET /api/analytics/admin`
Retrieve platform-wide telemetry (total users, songs, playlists, streams, active users, catalog distribution).
* **Authentication**: Admin required

---

## 11. Administration (`/api/admin`)

### `GET /api/admin/users`
List registered platform users with pagination.
* **Authentication**: Admin required

### `PUT /api/admin/users/:id`
Update user role (`user` ↔ `admin`).
* **Authentication**: Admin required

### `DELETE /api/admin/users/:id`
Delete user account.
* **Authentication**: Admin required
