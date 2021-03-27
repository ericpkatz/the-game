const { app, run, User } = require('./app');
const { addClient } = require('./socketServer');

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
  client.send(JSON.stringify(await User.leaderBoard()));
});
