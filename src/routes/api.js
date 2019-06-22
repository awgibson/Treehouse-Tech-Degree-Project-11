const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const mid = require('../middleware');

const Course = require('../models/Course');
const User = require('../models/User');
const Review = require('../models/Review');

// GET /api/users
router.get('/users', mid.validateLogin, (req, res, next) => {
  res
    .json(req.user)
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
    const err = new Error('Passwords do not match');
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
  Course.create(req.body, err => {
    if (err) {
      next(err);
    } else {
      res
        .location('/')
        .status(201)
        .end();
    }
  });
});

// PUT /api/courses:id
router.put('/courses/:courseId', (req, res, next) => {
  const courseUpdate = req.body;
  delete courseUpdate._id;

  Course.findByIdAndUpdate(
    req.params.courseId,
    courseUpdate,
    { new: true },
    err => {
      if (err) {
        if (err.name === 'CastError') {
          err.message = 'Course ID not found';
        }
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
    Course.findById(req.params.courseId)
      .populate('user')
      .populate('reviews')
      .exec(function(err, course) {
        // const found = course.reviews.find(
        //   review => review.user === req.user._id
        // );

        // if (found) {
        //   console.log('already have review!');
        // }

        if (err) return next(err);

        if (!course) {
          const err = new Error('Course was not found');
          err.status = 404;
          next(err);
        } else if (req.user._id === course.user._id) {
          const err = new Error('You cannot review your own course');
          err.status = 401;
          next(err);
        }

        const review = new Review(req.body);

        if (req.user._id) {
          review.user = req.user._id;
        } else {
          const err = new Error('You must login to post a review');
          err.status = 401;
          next(err);
        }

        course.reviews.push(review);

        course.save(err => {
          if (err) next(err);
        });

        review.save(err => {
          if (err) {
            next(err);
          } else {
            res
              .status(201)
              .location('/courses/' + req.params.courseId)
              .end();
          }
        });
      });
  }
);

// GET /api/courses/:courseID
router.get('/courses/:courseId', (req, res, next) => {
  Course.findById(req.params.courseId)
    .populate('user')
    .populate('reviews')
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
