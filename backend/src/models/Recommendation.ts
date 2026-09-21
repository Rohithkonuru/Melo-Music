import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRecommendation extends Document {
  user: Types.ObjectId;
  songs: Array<{
    song: Types.ObjectId;
    score: number;
  }>;
  generatedAt: Date;
  recommendationType: string;
}

const RecommendationSchema = new Schema<IRecommendation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    songs: [
      {
        song: {
          type: Schema.Types.ObjectId,
          ref: 'Song',
          required: true,
        },
        score: {
          type: Number,
          default: 0,
        },
      },
    ],
    generatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    recommendationType: {
      type: String,
      default: 'content-based',
    },
  },
  {
    timestamps: false,
  }
);

export const Recommendation = mongoose.model<IRecommendation>(
  'Recommendation',
  RecommendationSchema
);
