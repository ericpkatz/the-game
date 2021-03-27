const END = process.env.END ? process.env.END*1 : 20;

const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);


const add = ({ user, points})=> {
  return new Promise(async(res, rej)=> {
    client.zincrby('leaderboard', points.value, JSON.stringify(user), (err, result)=> {
      if(err){
        return rej(err);
      }
      res();
    })
  });
};

const get = ()=> {
  return new Promise((res, rej)=> {
    client.zrevrange('leaderboard', 0, 4, 'withscores', (err, result)=> {
      if(err){
        return rej(err);
      }
      const board = [];
      for(let i = 0; i < result.length; i = i + 2){
        board.push({
          user: result[i],
          score: result[i + 1]
        });
      }
      const topScore = board[0] ? board[0].score : 0;
      res({ leaderBoard: board, isRunning: topScore <= END, diff: END - topScore, limit: END});
    });
  });

}

const clear = ()=> {
  return new Promise((res, reject)=> {
    client.flushdb((err, result)=> {
      if(err){
        return rej(err);
      }
      res();
    });
  });
};

module.exports = {
  clear,
  add,
  get
};
