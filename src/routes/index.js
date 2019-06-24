const express = require('express');
const router = express.Router();

// GET '/' and send message for root route
router.get('/', (req, res) => {
  res
    .json({
      message: 'Welcome to the Course Review API'
    })
    .status(200);
});

module.exports = router;
