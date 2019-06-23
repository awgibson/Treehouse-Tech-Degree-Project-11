const auth = require('basic-auth');
const User = require('../models/User');

function validateLogin(req, res, next) {
  //Grab the basic authentication header
  const user = auth(req);

  // If there is not authentication header
  if (!user) {
    const err = new Error('Authentication data is required');
    err.status = 401;
    next(err);
  } else {
    User.authenticate(user.name, user.pass, (err, user) => {
      if (err) next(err);

      if (!user) {
        const err = new Error(`User does not exist`);
        err.status = 401;
        next(err);
      }
      req.user = user;
      next();
    });
  }
}

module.exports.validateLogin = validateLogin;
