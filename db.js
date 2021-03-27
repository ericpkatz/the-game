const { getClients } = require('./socketServer');
const { get, add, clear } = require('./Leaderboard');


const END = process.env.END ? process.env.END*1 : 20;

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
  const leaderBoard = await get();
  getClients().forEach(client => client.send(JSON.stringify(leaderBoard)));
});

Point.addHook('beforeCreate', async(points)=> {
  const user = await User.findByPk(points.userId);
  await add({ user, points });
});

User.leaderBoard = function(){
  return get();
}

const clearRedis = ()=> {
  return clear();
};


const run = async()=> {
  let running = true;
  await conn.sync({ force: true });
  await clearRedis();
  let users = [{ name: 'Nicks Brother' }, { name: 'French Pastry' } ];
  while(users.length < 10){
    users.push({ name: `${faker.name.firstName()} ${faker.name.lastName()}`})
  }
  users = await Promise.all(users.map( user => User.create(user)));


  const generatePoints = async()=> {
    const user = faker.random.arrayElement(users);
    await Point.create({ userId: user.id, value: faker.random.number(8) + faker.random.number(3) });
    const { leaderBoard, isRunning } = await User.leaderBoard();
    if(!isRunning){
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

module.exports = {
  User,
  run
};
