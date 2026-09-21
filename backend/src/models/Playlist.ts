import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPlaylist extends Document {
  name: string;
  description: string;
  coverUrl: string;
  owner: Types.ObjectId;
  songs: Types.ObjectId[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlaylistSchema = new Schema<IPlaylist>(
  {
    name: {
      type: String,
      required: [true, 'Playlist name is required'],
      trim: true,
      maxlength: 120,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    coverUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    songs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Song',
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

PlaylistSchema.index({ name: 'text', description: 'text' });

export const Playlist = mongoose.model<IPlaylist>('Playlist', PlaylistSchema);
