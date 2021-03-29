const express = require('express');
const app = express();
const path = require('path');

const { User } = require('./db');
const { run } = require('./game');
const { get } = require('./Leaderboard');

app.get('/run', async(req, res, next)=> {

  try {
    const leaderboard = await get();
    if(!leaderboard.isRunning){
      run();
    }
    res.redirect('/');
  }
  catch(ex){
    next(ex);
  }
});

app.get('/', (req, res, next)=> {
  res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = {
  app,
  run,
  User
};
