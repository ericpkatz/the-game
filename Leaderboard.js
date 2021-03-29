const { promisify } = require('util');
const END = process.env.END ? process.env.END*1 : 20;

const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);
client.flushdb = promisify(client.flushdb);//bind? 
client.zrevrange = promisify(client.zrevrange);
client.zincrby = promisify(client.zincrby);


const add = ({ user, points})=> {
    return client.zincrby('leaderboard', points.value, JSON.stringify(user));
};

const get = async()=> {
  const result = await client.zrevrange('leaderboard', 0, 4, 'withscores');
  const board = [];
  for(let i = 0; i < result.length; i = i + 2){
    board.push({
      user: result[i],
      score: result[i + 1]
    });
  }
  const topScore = board[0] ? board[0].score : 0;
  return { leaderBoard: board, isRunning: topScore <= END, diff: END - topScore, limit: END};

}

const clear = ()=> {
  return client.flushdb();
};

module.exports = {
  clear,
  add,
  get
};
