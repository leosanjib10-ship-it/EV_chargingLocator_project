import mongoose from 'mongoose';

// ─── Review Schema ────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EvStation',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    photos: [
      {
        type: String
      }
    ],
    isVerified: {
      type: Boolean,
      default: false
    },
    likes: {
      type: Number,
      default: 0
    },
    reply: {
      text: { type: String },
      repliedAt: { type: Date }
    }
  },
  { timestamps: true }
);

// ─── Indexes ────────────────────────────────────────────────
reviewSchema.index({ station: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ user: 1, station: 1 }, { unique: true });

// ─── Model ────────────────────────────────────────────────
const Review = mongoose.model('Review', reviewSchema);

export default Review;