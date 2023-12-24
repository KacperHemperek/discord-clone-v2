import Fastify from 'fastify';
import { app } from './app/app';
import { logger } from './app/utils/logger';

const host = process.env.BE_HOST ?? 'localhost';
const port = process.env.BE_PORT ? Number(process.env.BE_PORT) : 4444;

// Instantiate Fastify with some config
const server = Fastify({
  logger: logger,
});

// Register your application as a normal plugin.
server.register(app);

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    server.log.info(`[ ready ] http://${host}:${port}`);
  }
});

// graceful shut down
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    server.close().then(() => {
      server.log.info(`[ close ] http://${host}:${port}`);
    });
  });
});
