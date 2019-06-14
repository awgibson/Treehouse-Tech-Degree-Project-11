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
  res
    .location('/')
    .status(201)
    .end();
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
