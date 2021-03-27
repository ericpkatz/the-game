const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);
const express = require('express');
const app = express();
const path = require('path');
const chalk = require('chalk');

const Sequelize = require('sequelize');
const { QueryTypes, UUID, UUIDV4, STRING, INTEGER } = Sequelize;
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_gaming');
const faker = require('faker');

const User = conn.define('user', {
  id: { 
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true
  },
  name: STRING 
});

const Point = conn.define('point', {
  value: INTEGER,
  userId: {
    type: UUID,
    allowNull: false
  }
});

Point.belongsTo(User);

Point.addHook('afterCreate', async()=> {
  const leaderBoard = await User.leaderBoard();
  clients.forEach(client => client.send(JSON.stringify(leaderBoard)));
});

Point.addHook('beforeCreate', (points)=> {
  return new Promise(async(res, rej)=> {
    const user = await User.findByPk(points.userId);
    client.zincrby('leaderboard', points.value, JSON.stringify(user), (err, result)=> {
      if(err){
        return rej(err);
      }
      res();
    })
  });
});

User.leaderBoard = function(){
  /*
  return conn.query(`
    select sum(value) total, "userId"
    from points
    group by points."userId"
    order by total desc
    LIMIT 3
  `, { type: QueryTypes.SELECT});
  */
  return new Promise((res, rej)=> {
    client.zrevrange('leaderboard', 0, 3, 'withscores', (err, result)=> {
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
      res(board);
    });
  });
}

const clearRedis = ()=> {
  return new Promise((res, reject)=> {
    client.flushdb((err, result)=> {
      if(err){
        return rej(err);
      }
      res();
    });

  });
};

let running = true;

const run = async()=> {
  await conn.sync({ force: true });
  await clearRedis();
  let users = [];
  while(users.length < 10){
    users.push({ name: `${faker.name.firstName()} ${faker.name.lastName()}`})
  }
  users = await Promise.all(users.map( user => User.create(user)));


  const generatePoints = async()=> {
    const user = faker.random.arrayElement(users);
    await Point.create({ userId: user.id, value: faker.random.number(8) + faker.random.number(3) });
    const leaderBoard = await User.leaderBoard();
    const diff = 50 - leaderBoard[0].score; 
    console.log(chalk.green(`${diff} points to go!`));
    if(leaderBoard[0].score > 50){
      running = false;
    }
    return new Promise((res)=> {
      setTimeout(()=> {
         res();
      }, 500);
    });
  }

  while(running){
    await generatePoints();
  }
};

let port;
const server = app.listen(port = process.env.PORT || 3000, ()=> {
  console.log(`listening on port ${port}`);
  run();
});

const ws = require('ws');
const socketServer = new ws.Server({ server });
let clients = [];
socketServer.on('connection', (client)=> {
  clients.push(client);
});

app.get('/run', (req, res, next)=> {
  if(!running){
    running = true;
    run();
  }
  res.redirect('/');

});

app.get('/', (req, res, next)=> {
  res.sendFile(path.join(__dirname, 'index.html'));
});
