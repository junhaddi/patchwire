var assert = require('chai').assert;
var sinon = require('sinon');
var _ = require('lodash');
var ClientManager = require('../lib/clientManager.js');
var clientManager;

function getFakeClient() {
  return {
    on: function() {},
    onData: function() {},
    send: sinon.stub(),
    clientId: _.uniqueId()
  };
}

describe('Client Manager', function() {

  beforeEach(function() {
    clientManager = new ClientManager();
  });

  describe('.addClient()', function() {

    it('adds a client', function() {
      clientManager.addClient(getFakeClient());
      assert.equal(clientManager.getClientCount(), 1);
    });

  });

  describe('.removeClient()', function() {

    it('removes a client by an id', function() {
      var fakeSocket = getFakeClient();
      clientManager.addClient(fakeSocket);
      clientManager.removeClient(fakeSocket.clientId);
      assert.equal(clientManager.getClientCount(), 0);
    });

    it('returns the client object it removes', function() {
      var fakeClients = _.times(200, getFakeClient);

      fakeClients.forEach(function(client) {
        clientManager.addClient(client);
      });

      fakeClients = _.shuffle(fakeClients);

      fakeClients.forEach(function(client) {
        var returnedClient = clientManager.removeClient(client.clientId);
        assert.equal(returnedClient.clientId, client.clientId);
      });

    });

  });

  describe('.getClients()', function() {

    it('returns its client array', function() {
      var fakeClients = _.times(10, getFakeClient);
      fakeClients.forEach(clientManager.addClient.bind(clientManager));
      assert.deepEqual(fakeClients, clientManager.getClients());
    });

  });

  describe('.getClientCount()', function() {

    it('returns the number of clients in the ClientManager', function() {
      var clientCount = _.random(1, 200);
      _.times(clientCount, getFakeClient).forEach(clientManager.addClient.bind(clientManager));
      assert.equal(clientManager.getClientCount(), clientCount);
    });

  });

  describe('.set() and .get()', function() {

    var types = [_.random(1, 200), 'testing', {hello: 'world'}];

    types.forEach(function(value) {
      it('can save and retrieve a(n) ' + typeof value, function() {
        clientManager.set('testValue', value);
        assert.deepEqual(clientManager.get('testValue'), value);
      });
    });

  });

  describe('.addCommandListener and .handleIncomingCommand()', function() {

    it('routes commands to their handlers', function() {
      var handlerStub = sinon.stub();
      clientManager.addCommandListener('test', handlerStub);
      clientManager.handleIncomingCommand(getFakeClient(), {command: 'test'});
      clientManager.handleIncomingCommand(getFakeClient(), {command: 'doNotRun'});
      assert(handlerStub.called, 'The registered command handler was never called');
      assert(handlerStub.calledOnce, 'The registered command handler was called too many times');
      assert.equal(handlerStub.firstCall.args[1].command, 'test',
        'The registered command handler was passed the wrong command');
    });

  });

  describe('.broadcast()', function() {

    it('can broadcast to all clients', function() {
      var fakeSocket = getFakeClient();
      var fakeSocket2 = getFakeClient();

      clientManager.addClient(fakeSocket);
      clientManager.addClient(fakeSocket2);

      clientManager.broadcast({testing: true});

      assert(fakeSocket.send.called);
      assert(fakeSocket2.send.called);
    });

  });

  describe('.on() and .fire()', function() {

    it('allows the author to define handlers for events', function() {
      var stub = sinon.stub();
      clientManager.on('testEvent', stub);
      clientManager.fire('testEvent');
      assert(stub.called);
    })

  });

  describe('event: clientDropped', function() {

    it('removes the dropped client', function() {
      var fakeClient = {
        on: function(event, handler) {
          if (event === 'close') {
            this.onCloseHandler = handler;
          }
        },
        onData: sinon.stub(),
        send: sinon.stub(),
        clientId: _.random(0, 200)
      };

      clientManager.addClient(fakeClient);
      assert.isFunction(fakeClient.onCloseHandler, 'a close handler was never set');
      fakeClient.onCloseHandler();
      var clientCount = clientManager.getClientCount();
      assert.equal(clientCount, 0);

    });

  });

});
