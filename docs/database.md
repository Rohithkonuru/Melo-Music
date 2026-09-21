# Melomix 2.0 — Database Schema & Data Dictionary

Melomix 2.0 uses MongoDB with Mongoose ODM.

---

## 1. User (`users`)
| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique user identifier |
| `name` | String | Yes | User display name |
| `email` | String | Yes (Unique) | Case-insensitive email address |
| `password` | String | Yes | bcrypt hashed password (`select: false`) |
| `avatar` | String | No | Profile picture URL |
| `role` | String | Yes | `'user'` or `'admin'` (default: `'user'`) |
| `favoriteGenres` | [String] | No | User's preferred genres |
| `favoriteArtists`| [ObjectId] | No | References to `artists` |
| `likedSongs` | [ObjectId] | No | References to `songs` |
| `followedArtists`| [ObjectId] | No | References to `artists` |
| `recentlyPlayed` | [Subdoc] | No | Array of `{ song: ObjectId, playedAt: Date }` |
| `createdAt` | Date | Yes | Timestamp |
| `updatedAt` | Date | Yes | Timestamp |

---

## 2. Song (`songs`)
| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique song identifier |
| `title` | String | Yes | Song title |
| `artist` | ObjectId | Yes | Reference to `artists` collection |
| `artistName` | String | Yes | Denormalized artist name for fast search |
| `album` | ObjectId | No | Reference to `albums` collection |
| `albumTitle` | String | No | Denormalized album title |
| `genre` | String | Yes | Primary genre (e.g. Lo-Fi, Electronic) |
| `duration` | Number | Yes | Track length in seconds |
| `audioUrl` | String | Yes | Direct audio streaming URL |
| `coverUrl` | String | Yes | Artwork image URL |
| `releaseDate` | Date | No | Release date |
| `mood` | String | Yes | Acoustic mood (Chill, Energetic, Focus, etc.) |
| `language` | String | Yes | Default: `'English'` |
| `playCount` | Number | Yes | Total stream count (default: 0) |
| `likeCount` | Number | Yes | Total favorites count (default: 0) |

* **Indexes**:
  * Compound text index: `{ title: 'text', artistName: 'text', genre: 'text', mood: 'text', language: 'text' }`
  * Single field index: `playCount: -1`, `artist: 1`, `genre: 1`, `mood: 1`

---

## 3. Artist (`artists`)
| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique artist identifier |
| `name` | String | Yes (Unique) | Artist stage name |
| `bio` | String | No | Biography / sound description |
| `image` | String | Yes | High-resolution photo |
| `genres` | [String] | No | Associated genres |
| `followers` | Number | Yes | Total follower count (default: 0) |

---

## 4. Album (`albums`)
| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique album identifier |
| `title` | String | Yes | Album title |
| `artist` | ObjectId | Yes | Reference to `artists` |
| `artistName` | String | Yes | Denormalized artist name |
| `coverUrl` | String | Yes | Album cover art URL |
| `releaseDate` | Date | Yes | Release date |
| `songs` | [ObjectId] | No | Array of `songs` references |

---

## 5. Playlist (`playlists`)
| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique playlist identifier |
| `name` | String | Yes | Playlist title |
| `description`| String | No | Description / mood summary |
| `coverUrl` | String | Yes | Artwork cover URL |
| `owner` | ObjectId | Yes | Reference to `users` |
| `songs` | [ObjectId] | No | Ordered list of `songs` references |
| `isPublic` | Boolean | Yes | Privacy toggle (default: `true`) |

---

## 6. ListeningHistory (`listeninghistories`)
| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique history record |
| `user` | ObjectId | Yes | Reference to `users` |
| `song` | ObjectId | Yes | Reference to `songs` |
| `playedAt` | Date | Yes | Playback timestamp |
| `durationPlayed` | Number | Yes | Seconds listened |

* **Index**: `{ user: 1, playedAt: -1 }` (optimized for user timeline queries).

---

## 7. Recommendation (`recommendations`)
| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique recommendation record |
| `user` | ObjectId | Yes | Reference to `users` |
| `songs` | [Subdoc] | Yes | Array of `{ song: ObjectId, score: Number }` |
| `generatedAt`| Date | Yes | Generation timestamp |
| `recommendationType` | String | Yes | e.g. `'content-based'`, `'mood'` |
