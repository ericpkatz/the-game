const faker = require('faker');

const { get, clear } = require('./Leaderboard');

const { conn, User, Point } = require('./db');

const run = async()=> {
  let running = true;
  await conn.sync({ force: true });
  await clear();
  let users = [{ name: 'Nicks Brother' }, { name: 'French Pastry' } ];
  while(users.length < 10){
    users.push({ name: `${faker.name.firstName()} ${faker.name.lastName()}`})
  }
  users = await Promise.all(users.map( user => User.create(user)));


  const generatePoints = async()=> {
    const user = faker.random.arrayElement(users);
    await Point.create({ userId: user.id, value: faker.random.number(8) + faker.random.number(3) });
    const { leaderBoard, isRunning } = await get();
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

module.exports = { run };
