import Fastify from 'fastify';
import { app } from './app/app';
import {
  AddAccessTokenToCookiesHandler,
  AddRefreshTokenToCookiesHandler,
  GetTokensFromCookiesHandler,
} from './app/plugins/cookies';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 4444;

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
});

// Register your application as a normal plugin.
server.register(app);

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    console.log(`[ ready ] http://${host}:${port}`);
  }
});

// graceful shut down
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    server.close().then(() => {
      console.log(`[ close ] http://${host}:${port}`);
    });
  });
});

type RequestUser = {
  id: string;
  username: string;
};

declare module 'fastify' {
  interface FastifyInstance {
    user: RequestUser | null;
    serializeUser: (request: FastifyRequest) => void;
    addRefreshTokenToCookies: AddRefreshTokenToCookiesHandler;
    addAccessTokenToCookies: AddAccessTokenToCookiesHandler;
    getTokensFromCookies: GetTokensFromCookiesHandler;
  }
}
