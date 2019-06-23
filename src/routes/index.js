const express = require('express');
const router = express.Router();

// send a friendly greeting for the root route
router.get('/', (req, res) => {
  res
    .json({
      message: 'Welcome to the Course Review API'
    })
    .status(200);
});

module.exports = router;
