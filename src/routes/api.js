const express = require('express');
const router = express.Router();
const mid = require('../middleware');

const Course = require('../models/Course');
const User = require('../models/User');
const Review = require('../models/Review');

// GET /api/users
router.get('/users', mid.validateLogin, (req, res, next) => {
  res
    .json({ _id: req.user._id, fullName: req.user.fullName })
    .status(200)
    .end();
});

// POST /api/users
router.post('/users', (req, res, next) => {
  if (req.body.password === req.body.confirmPassword) {
    User.create(req.body, err => {
      if (err) {
        next(err);
      } else {
        res
          .location('/')
          .status(201)
          .end();
      }
    });
  } else {
    const err = new Error('Password and password confirmation do not match');
    next(err);
  }
});

// GET /api/courses
router.get('/courses', (req, res, next) => {
  Course.find({}, '_id title', (err, courses) => {
    if (err || !courses) {
      const err = new Error(`Unable to retrieve courses.`);
      err.status = 500;
      next(err);
    } else {
      res.json(courses).status(200);
    }
  });
});

// POST /api/courses
router.post('/courses', mid.validateLogin, (req, res, next) => {
  const course = req.body;
  if (req.user) {
    course.user = req.user;
  }

  Course.create(course, err => {
    if (err) {
      next(err);
    } else {
      res
        .location('/api/courses/' + course._id)
        .status(201)
        .end();
    }
  });
});

// PUT /api/courses:id
router.put('/courses/:courseId', mid.validateLogin, (req, res, next) => {
  const courseUpdate = req.body;
  delete courseUpdate._id;

  Course.findByIdAndUpdate(
    req.params.courseId,
    courseUpdate,
    { new: true },
    (err, course) => {
      if (err) {
        next(err);
      } else if (!course) {
        const err = new Error('Course does not exist');
        err.status = 400;
        next(err);
      } else {
        res.status(204).end();
      }
    }
  );
});

// POST /api/:courseId/reviews
router.post(
  '/courses/:courseId/reviews',
  mid.validateLogin,
  (req, res, next) => {
    const reviewPost = {
      ...req.body,
      user: {
        _id: req.user._id
      }
    };
    console.log(reviewPost);
    Course.findById(req.params.courseId, function(err, course) {
      if (err) {
        next(err);
      } else if (req.user._id.toString() === course.user._id.toString()) {
        const err = new Error('You cannot review your own course');
        next(err);
      } else {
        Review.create(reviewPost, function(err, review) {
          if (err) {
            next(err);
          } else {
            // now associate the review with the course

            course.set({
              reviews: [...course.reviews, review]
            });

            course.save(function(err, course) {
              if (err) {
                next(err);
              } else {
                res.location(`/api/courses/${req.params.courseId}`);
                res.status(201);
                res.end();
              }
            });
          }
        }); // end Review.create
      }
    });
  }
);

// GET /api/courses/:courseID
router.get('/courses/:courseId', (req, res, next) => {
  Course.findById(req.params.courseId)
    .populate({ path: 'user', select: '_id fullName' })
    .populate({
      path: 'reviews',
      populate: { path: 'user', select: '_id, fullName' }
    })
    .exec((err, course) => {
      if (err || !course) {
        const err = new Error(`Unable to retrieve course.`);
        err.status = 500;
        next(err);
      } else {
        res.json(course).status(200);
      }
    });
});

module.exports = router;
