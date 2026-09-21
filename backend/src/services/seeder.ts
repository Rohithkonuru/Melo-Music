import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, Song, Artist, Album, Playlist, ListeningHistory, Recommendation } from '../models';
import { artistsData, albumsData, songsData } from './seedData';
import { connectDB, disconnectDB } from '../config/db';

export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('[Seeder] Starting database seeding process...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Song.deleteMany({}),
      Artist.deleteMany({}),
      Album.deleteMany({}),
      Playlist.deleteMany({}),
      ListeningHistory.deleteMany({}),
      Recommendation.deleteMany({}),
    ]);
    console.log('[Seeder] Cleared previous database collections.');

    // 1. Create Demo Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      name: 'Melomix Admin',
      email: 'admin@melomix.com',
      password: hashedPassword,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
      favoriteGenres: ['Electronic', 'Lo-Fi', 'Rock'],
    });

    const standardUser = await User.create({
      name: 'Alex Rivera',
      email: 'user@melomix.com',
      password: hashedPassword,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      favoriteGenres: ['Lo-Fi', 'Jazz', 'Pop'],
    });
    console.log('[Seeder] Created demo users (admin@melomix.com & user@melomix.com).');

    // 2. Insert Artists
    const artistDocMap = new Map<string, mongoose.Types.ObjectId>();
    const createdArtists = await Artist.insertMany(artistsData);
    createdArtists.forEach((artist) => {
      artistDocMap.set(artist.name, artist._id as mongoose.Types.ObjectId);
    });
    console.log(`[Seeder] Seeded ${createdArtists.length} artists.`);

    // 3. Insert Albums
    const albumDocMap = new Map<string, mongoose.Types.ObjectId>();
    const albumDocsToInsert = albumsData.map((album) => {
      const artistId = artistDocMap.get(album.artistName);
      if (!artistId) throw new Error(`Artist not found for album: ${album.title}`);
      return {
        title: album.title,
        artist: artistId,
        artistName: album.artistName,
        coverUrl: album.coverUrl,
        releaseDate: album.releaseDate,
        songs: [],
      };
    });
    const createdAlbums = await Album.insertMany(albumDocsToInsert);
    createdAlbums.forEach((alb) => {
      albumDocMap.set(alb.title, alb._id as mongoose.Types.ObjectId);
    });
    console.log(`[Seeder] Seeded ${createdAlbums.length} albums.`);

    // 4. Insert Songs
    const albumSongMap = new Map<string, mongoose.Types.ObjectId[]>();
    const songDocsToInsert = songsData.map((song) => {
      const artistId = artistDocMap.get(song.artistName);
      if (!artistId) throw new Error(`Artist not found for song: ${song.title}`);

      let albumId: mongoose.Types.ObjectId | undefined = undefined;
      if (song.albumTitle) {
        albumId = albumDocMap.get(song.albumTitle);
      }

      return {
        title: song.title,
        artist: artistId,
        artistName: song.artistName,
        album: albumId,
        albumTitle: song.albumTitle,
        genre: song.genre,
        duration: song.duration,
        audioUrl: song.audioUrl,
        coverUrl: song.coverUrl,
        releaseDate: song.releaseDate,
        mood: song.mood,
        language: song.language,
        playCount: song.playCount,
        likeCount: song.likeCount,
      };
    });

    const createdSongs = await Song.insertMany(songDocsToInsert);
    console.log(`[Seeder] Seeded ${createdSongs.length} songs.`);

    // Update albums with their song IDs
    for (const song of createdSongs) {
      if (song.albumTitle && song.album) {
        const existing = albumSongMap.get(song.albumTitle) || [];
        existing.push(song._id as mongoose.Types.ObjectId);
        albumSongMap.set(song.albumTitle, existing);
      }
    }

    for (const [albumTitle, songIds] of albumSongMap.entries()) {
      await Album.updateOne({ title: albumTitle }, { $set: { songs: songIds } });
    }

    // 5. Create Demo Playlists
    const lofiSongs = createdSongs.filter((s) => s.genre === 'Lo-Fi' || s.mood === 'Chill');
    const workoutSongs = createdSongs.filter((s) => s.genre === 'Electronic' || s.mood === 'Workout');
    const jazzSongs = createdSongs.filter((s) => s.genre === 'Jazz' || s.mood === 'Romantic');

    await Playlist.create([
      {
        name: 'Late Night Deep Focus',
        description: 'Atmospheric lo-fi beats, gentle rain textures, and warm chords for maximum productivity.',
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&h=500&fit=crop',
        owner: standardUser._id,
        songs: lofiSongs.map((s) => s._id),
        isPublic: true,
      },
      {
        name: 'High Adrenaline Workout',
        description: 'Hard-hitting electronic pulses, driving synth bass, and relentless gym energy.',
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop',
        owner: adminUser._id,
        songs: workoutSongs.map((s) => s._id),
        isPublic: true,
      },
      {
        name: 'Velvet Midnight Jazz',
        description: 'Warm brass, smoky keys, and smooth upright bass for unwinding after dusk.',
        coverUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=500&h=500&fit=crop',
        owner: standardUser._id,
        songs: jazzSongs.map((s) => s._id),
        isPublic: true,
      },
    ]);
    console.log('[Seeder] Created demo playlists.');

    // 6. User initial likes and listening history
    const likedSongIds = createdSongs.slice(0, 5).map((s) => s._id as mongoose.Types.ObjectId);
    const followedArtistIds = createdArtists.slice(0, 3).map((a) => a._id as mongoose.Types.ObjectId);

    standardUser.likedSongs = likedSongIds;
    standardUser.followedArtists = followedArtistIds;
    standardUser.recentlyPlayed = createdSongs.slice(0, 4).map((s, idx) => ({
      song: s._id as mongoose.Types.ObjectId,
      playedAt: new Date(Date.now() - idx * 3600 * 1000),
    }));
    await standardUser.save();

    // Insert ListeningHistory documents for analytics
    const historyDocs = createdSongs.slice(0, 6).map((s, idx) => ({
      user: standardUser._id,
      song: s._id,
      playedAt: new Date(Date.now() - idx * 7200 * 1000),
      durationPlayed: s.duration,
    }));
    await ListeningHistory.insertMany(historyDocs);
    console.log('[Seeder] Created listening history records.');

    console.log('[Seeder] Database seeding successfully completed! 🎵');
  } catch (err: any) {
    console.error('[Seeder Error] Failed to seed database:', err);
    throw err;
  }
};

// If run directly via CLI (npm run seed)
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}
