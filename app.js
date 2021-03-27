const express = require('express');
const app = express();
const path = require('path');

const { User, run } = require('./db');

app.get('/run', (req, res, next)=> {
  run();
  res.redirect('/');

});

app.get('/', (req, res, next)=> {
  res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = {
  app,
  run,
  User
};
