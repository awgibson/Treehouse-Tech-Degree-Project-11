const auth = require('basic-auth');
const User = require('../models/User');

function validateLogin(req, res, next) {
  //Grab the basic authentication header
  const user = auth(req);

  //Checks if there is are any credentials or a name or a password
  if (!user || !user.name || !user.pass) {
    // Passes an error if any login information is missing
    const err = new Error('A username and password is required');
    err.status = 401;
    return next(err);
  } else {
    // If there is login information, search the database for the user
    User.findOne({ emailAddress: user.name }).exec(function(err, person) {
      // If the user does not exist in the database, throws an error
      if (!person) {
        const err = new Error(`User ${user.name} does not exist`);
        err.status = 401;
        return next(err);
      } else if (person.password === user.pass) {
        // If there is a user and the password matches, set req.user to equal the database entry for the user
        req.user = person;
        next();
      } else if (person.password !== user.pass) {
        // Handles password mismatch
        const err = new Error(`Invalid password for user`);
        err.status = 401;
        next(err);
      } else {
        // Handles any other errors that might occur
        const err = new Error(`There was an issue logging in`);
        err.status = 500;
        next(err);
      }
    });
  }
}

module.exports.validateLogin = validateLogin;
