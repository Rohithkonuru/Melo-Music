import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IListeningHistory extends Document {
  user: Types.ObjectId;
  song: Types.ObjectId;
  playedAt: Date;
  durationPlayed: number; // seconds
}

const ListeningHistorySchema = new Schema<IListeningHistory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    song: {
      type: Schema.Types.ObjectId,
      ref: 'Song',
      required: true,
      index: true,
    },
    playedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    durationPlayed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: false,
  }
);

ListeningHistorySchema.index({ user: 1, playedAt: -1 });

export const ListeningHistory = mongoose.model<IListeningHistory>(
  'ListeningHistory',
  ListeningHistorySchema
);
