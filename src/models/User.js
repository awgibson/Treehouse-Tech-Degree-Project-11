const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Schema for the Users
// Validation is used on fullName, emailAddress, password
const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  emailAddress: {
    type: String,
    required: [true, 'E-mail address is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  }
});

// Pre save hook to hash passwords
UserSchema.pre('save', function(next) {
  const user = this; //sets user to the current user being created

  // Hash and salt password with bcrypt
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) return next(err); // throw error if there is one

    user.password = hash; // sets the user password to the hash which overrides the plaintext password

    next();
  });
});

// user authentication
// takes in the email which is unique, the password and allows for a callback function
UserSchema.statics.authenticate = function(email, password, callback) {
  // Find the user by the unique email address
  this.findOne({ emailAddress: email }).exec(function(err, user) {
    // If there is an error, it is sent to the callback function
    // where it was called. Same goes for no user being found in the database
    if (err) {
      callback(err);
    } else if (!user) {
      const err = new Error('User not found.');
      err.status = 401;
      callback(err);
    }

    // Use bcrypt's compare method
    bcrypt.compare(password, user.password, function(err, result) {
      // If it returns a result, authentication passed and sends the user to the
      // callback function, the since there is no error in this case, null is passed as the
      // first parameter
      if (result) {
        return callback(null, user);
      } else {
        // If there is no result, that means the passwords did not match.
        // Throw a 401 error and pass to the callback
        const err = new Error('Passwords do not match.');
        err.status = 401;
        callback(err);
      }
    });
  });
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
