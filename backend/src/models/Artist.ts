import mongoose, { Document, Schema } from 'mongoose';

export interface IArtist extends Document {
  name: string;
  bio: string;
  image: string;
  genres: string[];
  followers: number;
  createdAt: Date;
}

const ArtistSchema = new Schema<IArtist>(
  {
    name: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true,
      unique: true,
      index: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Artist image URL is required'],
      trim: true,
    },
    genres: {
      type: [String],
      default: [],
      index: true,
    },
    followers: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ArtistSchema.index({ name: 'text', bio: 'text' });

export const Artist = mongoose.model<IArtist>('Artist', ArtistSchema);
