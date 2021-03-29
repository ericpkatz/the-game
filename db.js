const { publish } = require('./socketServer');
const { get, add, clear } = require('./Leaderboard');

const chalk = require('chalk');

const Sequelize = require('sequelize');
const { QueryTypes, UUID, UUIDV4, STRING, INTEGER } = Sequelize;
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_gaming');

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

Point.addHook('afterCreate', async(points)=> {
  const user = await User.findByPk(points.userId);
  await add({ user, points });
  const leaderBoard = await get();
  publish(leaderBoard);
});

module.exports = {
  User,
  Point,
  conn
};
