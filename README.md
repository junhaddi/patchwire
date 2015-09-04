# Stormwind
Multiplayer game server framework for Node.js

## Quick Start

### Install
`npm install stormwind`

### Use
```JavaScript
// MyGameServer.js
var Server = require('../index.js').Server;
var ClientManager = require('../index.js').ClientManager;

var server = new Server();
var gameLobby = new ClientManager();
gameLobby.on('clientAdded', function() {
    gameLobby.broadcast('chat', {
        message: 'A new player has joined the game.'
    });
});

var server = new Server(function(client) {
  gameLobby.addClient(client);
});

server.listen(3001);
```

## About

Stormwind is a server framework designed for multiplayer games. Originally built to work
with GameMaker: Studio's networking code, it has been standardized to be unassuming about
the client end framework.

Stormwind uses a paradigm of sending "commands" to clients, and in turn, listening for
commands from the client. A command is nothing more than a string identifier, and some
data. A command looks like this:

```JavaScript
{
  command: 'updatePosition',
  x: 200,
  y: 120
}
```

## Client Side

Stormwind speaks JSON via a networking socket. All you need to connect to a Stormwind server
is the ability to connect to a socket. Currently, Stormwind only has official support for
GameMaker as a client library, the code for which can be found
[here](https://github.com/twisterghost/stormwind-gm)