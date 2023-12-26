import type { FastifyInstance } from 'fastify';

type Message = {
  sender: string;
  message: string;
  type: 'message';
};

type History = {
  messages: Message[];
  type: 'history';
};

export default async function (fastify: FastifyInstance) {
  const messages: Message[] = [];

  function broadcast(message: Message) {
    fastify.websocketServer.clients.forEach((client) => {
      client.send(JSON.stringify(message));
    });
  }

  fastify.get('/', { websocket: true }, (conn, request) => {
    const username = request.query['username'] ?? 'anonymous';

    const history: History = {
      messages,
      type: 'history',
    };

    //send history to a single client that connected
    conn.socket.send(JSON.stringify(history));
    const connectionMessage: Message = {
      sender: 'server',
      message: 'New connection: ' + username + ' say hi!',
      type: 'message',
    };

    messages.unshift(connectionMessage);

    broadcast(connectionMessage);

    conn.socket.on('message', (m) => {
      const incoming = JSON.parse(m.toString());
      const message: Message = {
        sender: username,
        message: incoming.message,
        type: 'message',
      };

      messages.unshift(message);

      broadcast(message);
    });
  });

  fastify.log.info(`[ routes ] WebSockets routes loaded.`);
}
