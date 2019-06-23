//apiTest.js
const request = require('supertest');
const app = require('../src/index');

//==================== user API test ====================

/**
 * Testing get all user endpoint
 */
describe('GET /courses/57029ed4795118be119cc43d', function() {
  it('respond with json containing a list of course', function(done) {
    request(app)
      .get('localhost:5000')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
