let clients = [];

const getClients = ()=> clients;

const addClient = (client)=> clients.push(client);

const send = ({ client, message })=> client.send(JSON.stringify(message)); 

const publish = (message)=> {
  getClients().forEach(client => client.send(JSON.stringify(message)));
};

module.exports = {
  getClients,
  addClient,
  publish,
  send
};
