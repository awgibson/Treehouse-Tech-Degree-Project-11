const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Course title is required']
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  estimatedTime: {
    type: String
  },
  materialsNeeded: {
    type: String
  },
  steps: [
    {
      stepNumber: {
        type: Number
      },
      title: {
        type: String,
        required: [true, 'Step title is required']
      },
      description: {
        type: String,
        required: [true, 'Step description is required']
      }
    }
  ],
  reviews: { type: [mongoose.Schema.Types.ObjectId], ref: 'Reviews' }
});

const Course = mongoose.model('Course', CourseSchema);
module.exports = Course;
