'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

const routes = require('./routes/index');
const api = require('./routes/api');

// Connect to database
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://localhost:27017/course-api', {
  useNewUrlParser: true
});

// Set console messages for connection status
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Database connected...'));

// set our port
app.set('port', process.env.PORT || 5000);

// morgan gives us http request logging
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// TODO add additional routes here
app.use('/', routes); // '/' route
app.use('/api', api); // '/api' route

// uncomment this route in order to test the global error handler
// app.get('/error', function(req, res) {
//   throw new Error('Test error');
// });

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found'
  });
});

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'MongoError' && err.code === 11000) {
    res.status(err.status || 500).json(err);
  } else {
    res.status(err.status || 500).json({
      error: { message: err.message, status: err.status }
    });
  }
});

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});

module.exports = app;
