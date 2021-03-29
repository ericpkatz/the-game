const { app } = require('./app');
const { addClient, send } = require('./socketServer');
const { get } = require('./Leaderboard');
const { run } = require('./game');

let port;

const server = app.listen(port = process.env.PORT || 3000, ()=> {
  console.log(`listening on port ${port}`);
  run();
});

const ws = require('ws');
const socketServer = new ws.Server({ server });
socketServer.on('connection', async(client)=> {
  //remove old sockets
  addClient(client);
  send({ client, message: await get()});
});
