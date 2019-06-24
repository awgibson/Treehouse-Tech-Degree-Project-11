const app = require('../src/index');
const request = require('supertest');
const chai = require('chai');
const { expect } = chai;
const User = require('../src/models/User');

// Create a test user
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
    // Make request through the server using basic auth that matches the test user created above
    // After the request, expect that JSON is returned, a 200 status code is received and that
    // the user returned has the same name as the test user
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

  // Make a GET request with bad credentials and expect JSON and a 401 status to be returned.
  it('return a 401 error for there being invalid', function(done) {
    request(app)
      .get('/api/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'There are no credentials!!!!')
      .expect('Content-Type', /json/)
      .expect(401, done);
  });
});
