import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAlbum extends Document {
  title: string;
  artist: Types.ObjectId;
  artistName: string;
  coverUrl: string;
  releaseDate: Date;
  songs: Types.ObjectId[];
}

const AlbumSchema = new Schema<IAlbum>(
  {
    title: {
      type: String,
      required: [true, 'Album title is required'],
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
    },
    coverUrl: {
      type: String,
      required: [true, 'Cover URL is required'],
      trim: true,
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    songs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Song',
      },
    ],
  },
  {
    timestamps: true,
  }
);

AlbumSchema.index({ title: 'text', artistName: 'text' });

export const Album = mongoose.model<IAlbum>('Album', AlbumSchema);
