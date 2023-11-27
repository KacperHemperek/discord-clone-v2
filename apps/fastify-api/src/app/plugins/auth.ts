import { FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import auth from '@fastify/auth';

export default fastifyPlugin(async function (fastify) {
  fastify.register(auth);
  fastify.log.info(`REGISTERING AUTH`);

  fastify.decorate('serializeUser', serializeUser);

  async function serializeUser(request: FastifyRequest) {
    const { accessToken, refreshToken } = fastify.getTokensFromCookies(request);

    if (accessToken) {
      const decoded = fastify.jwt.verify(accessToken);
      console.log({ decoded });

      if (!decoded) {
        return;
      }
      // const { iat: _iat, ...user } = decoded;
      request.user = decoded;

      return;
    }

    if (!refreshToken) {
      return;
    }

    const decoded = fastify.jwt.verify(refreshToken);
  }
});
