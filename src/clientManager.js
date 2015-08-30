var _ = require('lodash');

class ClientManager {

  constructor() {
    this.clients = [];
    this.commandHandlers = {};
    this.eventHandlers = {};
  }

  getClients() {
    return this.clients;
  }

  getClientCount() {
    return this.clients.length;
  }

  addClient(clientSocket) {

    clientSocket.onData(data => {
      this.handleIncomingCommand(clientSocket, data);
    });

    clientSocket.on('close', () => {
      this.removeClient(clientSocket.socketId);
    });

    clientSocket.on('error', error => {
      console.error(error);
    });

    this.clients.push(clientSocket);
    this.fire('clientAdded', clientSocket);
  }

  removeClient(clientSocketId) {
    var removeIndex = _.map(this.clients, (client, index) => {
      if (client.socketId === clientSocketId) {
        return index;
      }
    });
    _.pullAt(this.clients, removeIndex);
    this.fire('clientRemoved', clientSocketId);
  }

  broadcast(data) {
    this.clients.forEach(client => {
      client.send(data);
    });
  }

  handleIncomingCommand(socket, data) {
    this.fire('commandReceived', {socket: socket, data: data});

    if (this.commandHandlers.hasOwnProperty(data.command)) {
      this.commandHandlers[data.command].forEach(handler => {
        handler(socket, data);
      });
    } else {
      console.warn('No handler defiend for: ', data.command);
    }
  }

  addCommandListener(command, handler) {
    // If there is a command listener for this command already, push.
    if (this.commandHandlers.hasOwnProperty(command)) {
      this.commandHandlers.push(handler);
    } else {
      this.commandHandlers[command] = [handler];
    }
  }

  on(eventName, handler) {
    // If there is a event listener for this event already, push.
    if (this.eventHandlers.hasOwnProperty(eventName)) {
      this.eventHandlers.push(handler);
    } else {
      this.eventHandlers[eventName] = [handler];
    }
  }

  fire(eventName, data) {
    if (this.eventHandlers.hasOwnProperty(eventName)) {
      this.eventHandlers[eventName].forEach(function(handler) {
        if (typeof data !== 'undefined') {
          handler(data);
        } else {
          handler();
        }
      });
    }
  }

}

module.exports = ClientManager;