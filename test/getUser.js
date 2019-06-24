const app = require('../src/index');
const mongoose = require('mongoose');
const request = require('supertest');
const chai = require('chai');
const { expect } = chai;
const User = require('../src/models/User');

const testUser = {
  fullName: 'Tabby Smith',
  emailAddress: 'tabby@smith.test',
  password: 'password'
};

describe('GET /user route', function() {
  // Before hook
  // Waits for database connection to database
  // Creates a test user to use for the test since the users from the seed have unhashed passwords which will throw an error
  before(function(done) {
    this.enableTimeouts(false);

    User.create(testUser, () => {
      console.log('Test user created');
      done();
    });
  });

  // After each hook
  // Deletes the temporary test user
  after(function(done) {
    User.findOneAndDelete({ emailAddress: testUser.emailAddress }, () => {
      console.log('Test user deleted');
      done();
    });
  });

  // When I make a request to the GET /api/users route with the correct credentials, the corresponding user document is returned
  it('should return a user per credentials provided with 200 status code', function(done) {
    request(app)
      .get('/api/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Basic dGFiYnlAc21pdGgudGVzdDpwYXNzd29yZA==')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        expect(res.body.fullName).to.eq(testUser.fullName);
        done();
      });
  });

  it('return a 401 error for there being invalid', function(done) {
    request(app)
      .get('/api/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'There are no credentials!!!!')
      .expect('Content-Type', /json/)
      .expect(401, done);
  });
});
