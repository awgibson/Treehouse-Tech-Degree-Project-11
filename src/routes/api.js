// Bring in dependencies
const express = require('express');
const router = express.Router();
const mid = require('../middleware');

// Bring in models
const Course = require('../models/Course');
const User = require('../models/User');
const Review = require('../models/Review');

///////////////////
// USER ROUTES  //
/////////////////

// GET /api/users
// This route uses the middleware login validation and returns
// the logged in user's _id and full name with a 200 status code
router.get('/users', mid.validateLogin, (req, res, next) => {
  res
    .json({ _id: req.user._id, fullName: req.user.fullName })
    .status(200)
    .end();
});

// POST /api/users
// Checks if the password and confirm password are the same then
// creates a new user based on the body of the request.
// If the request is OK it sends a 201 status code
// If the confirm passwords do not match a 400 status code error is sent
// Other errors are handled by mongoose validation or the middleware
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
    err.status = 400;
    next(err);
  }
});

/////////////////////
// COURSE ROUTES //
///////////////////

// GET /api/courses
// Returns list of all courses querying only the _id and titles.
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
// Creates a course from the request body after validating the user is logged in
router.post('/courses', mid.validateLogin, (req, res, next) => {
  const course = req.body; //Sets request to a variable

  // If the middleware validates a user is logged in, the user
  // is set to be the course user to show they own the course
  if (req.user) {
    course.user = req.user;
  }

  // Course is created
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
// Updates a course after validating the user through the middleware
router.put('/courses/:courseId', mid.validateLogin, (req, res, next) => {
  const courseUpdate = req.body; // sets request to variable
  delete courseUpdate._id; // deletes _id in the body if one is provided....I use the id from the URL of the request

  // Finds course by the params...if course does not exist an error is thrown
  Course.findByIdAndUpdate(
    req.params.courseId,
    courseUpdate,
    { new: true },
    (err, course) => {
      if (err) {
        next(err);
      } else if (!course) {
        const err = new Error('Course does not exist');
        err.status = 404;
        next(err);
      } else {
        res.status(204).end();
      }
    }
  );
});

// POST /api/:courseId/reviews
// Post a review for the course in URL after validating login information in the middleware
router.post(
  '/courses/:courseId/reviews',
  mid.validateLogin,
  (req, res, next) => {
    // Build the review with a variable
    // Use the spread operator to add the the request body then specifically set the user _id to match the logged in user
    const reviewPost = {
      ...req.body,
      user: {
        _id: req.user._id
      }
    };

    // Find the course by ID from the params
    Course.findById(req.params.courseId, function(err, course) {
      if (err) {
        next(err);
      } else if (req.user._id.toString() === course.user._id.toString()) {
        // This conditional prevents a user from reviewing their own course
        const err = new Error('You cannot review your own course');
        err.status = 401;
        next(err);
      } else {
        // Creates the review if there are no errors beforehand and the user is not the course owner
        Review.create(reviewPost, function(err, review) {
          if (err) {
            next(err);
          } else {
            // Pushes the review to the course
            course.set({
              reviews: [...course.reviews, review]
            });

            course.save(function(err, course) {
              if (err) {
                next(err);
              } else {
                res
                  .location(`/api/courses/${req.params.courseId}`)
                  .status(201)
                  .end();
              }
            });
          }
        }); // end Review.create
      }
    });
  }
);

// GET /api/courses/:courseID
// Gets a specific course by ID
router.get('/courses/:courseId', (req, res, next) => {
  // Queries the course by the params
  // Use deep population to return only the _id and fullName of the course owner
  // User deep population to return only the _id and fullName of the review user
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
