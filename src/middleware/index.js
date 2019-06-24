const auth = require('basic-auth');
const User = require('../models/User');

function validateLogin(req, res, next) {
  //Grab the basic authentication header
  const user = auth(req);

  // If there is not authentication header throw error
  if (!user) {
    const err = new Error('Authentication data is required');
    err.status = 401;
    next(err);
  } else {
    // If there is an authentication header, use the authenticate static method in the
    // User model to authenticate the login
    User.authenticate(user.name, user.pass, (err, user) => {
      if (err) next(err); // throw error of there is one

      // Create error if the user is not found in the database
      if (!user) {
        const err = new Error(`User does not exist`);
        err.status = 401;
        next(err);
      }

      // Sets the user to the req so it can be access by routes in the server
      req.user = user;
      next();
    });
  }
}

module.exports.validateLogin = validateLogin;
