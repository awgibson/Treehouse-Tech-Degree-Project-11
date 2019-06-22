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

const User = mongoose.model('User', UserSchema);
module.exports = User;
