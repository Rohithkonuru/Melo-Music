import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role: 'user' | 'admin';
  favoriteGenres: string[];
  favoriteArtists: Types.ObjectId[];
  likedSongs: Types.ObjectId[];
  followedArtists: Types.ObjectId[];
  recentlyPlayed: Array<{
    song: Types.ObjectId;
    playedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Do not expose password hash in default queries
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    favoriteGenres: {
      type: [String],
      default: [],
    },
    favoriteArtists: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Artist',
      },
    ],
    likedSongs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Song',
      },
    ],
    followedArtists: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Artist',
      },
    ],
    recentlyPlayed: [
      {
        song: {
          type: Schema.Types.ObjectId,
          ref: 'Song',
        },
        playedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
