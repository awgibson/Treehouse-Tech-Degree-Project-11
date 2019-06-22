const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

UserSchema.pre('save', function(next) {
  const user = this;

  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) return next(err);

    user.password = hash;

    next();
  });
});

// user authentication
UserSchema.statics.authenticate = function(email, password, callback) {
  this.findOne({ emailAddress: email }).exec(function(err, user) {
    if (err) {
      callback(err);
    } else if (!user) {
      const err = new Error('User not found.');
      err.status = 401;
      callback(err);
    }
    bcrypt.compare(password, user.password, function(err, result) {
      if (result) {
        return callback(null, user);
      } else {
        const err = new Error('Passwords do not match.');
        err.status = 401;
        callback(err);
      }
    });
  });
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
