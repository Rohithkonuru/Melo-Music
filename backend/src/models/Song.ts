import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISong extends Document {
  title: string;
  artist: Types.ObjectId;
  artistName: string;
  album?: Types.ObjectId;
  albumTitle?: string;
  genre: string;
  duration: number; // in seconds
  audioUrl: string;
  coverUrl: string;
  releaseDate: Date;
  mood: string;
  language: string;
  playCount: number;
  likeCount: number;
  createdAt: Date;
}

const SongSchema = new Schema<ISong>(
  {
    title: {
      type: String,
      required: [true, 'Song title is required'],
      trim: true,
      index: true,
    },
    artist: {
      type: Schema.Types.ObjectId,
      ref: 'Artist',
      required: [true, 'Artist reference is required'],
      index: true,
    },
    artistName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    album: {
      type: Schema.Types.ObjectId,
      ref: 'Album',
    },
    albumTitle: {
      type: String,
      trim: true,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true,
      index: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration in seconds is required'],
      min: 1,
    },
    audioUrl: {
      type: String,
      required: [true, 'Audio URL is required'],
      trim: true,
    },
    coverUrl: {
      type: String,
      required: [true, 'Cover artwork URL is required'],
      trim: true,
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    mood: {
      type: String,
      required: [true, 'Mood is required'],
      trim: true,
      index: true,
    },
    language: {
      type: String,
      default: 'English',
      trim: true,
      index: true,
    },
    playCount: {
      type: Number,
      default: 0,
      index: true,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound text index for global search
SongSchema.index({
  title: 'text',
  artistName: 'text',
  genre: 'text',
  mood: 'text',
  language: 'text',
});

export const Song = mongoose.model<ISong>('Song', SongSchema);
