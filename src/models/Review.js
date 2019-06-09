const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  postedOn: {
    type: Date,
    default: Date.now()
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be between 1-5'],
    max: [5, 'Rating must be between 1-5']
  },
  review: {
    type: String
  }
});

const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;
