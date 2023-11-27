import { FastifyReply, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import auth from '@fastify/auth';

export default fastifyPlugin(async function (fastify) {
  fastify.register(auth);

  fastify.decorate('serializeUser', serializeUser);
  fastify.log.info(`[ plugin ] Auth plugin loaded.`);

  async function serializeUser(request: FastifyRequest, reply: FastifyReply) {
    const { accessToken, refreshToken } = fastify.getTokensFromCookies(request);
    if (accessToken) {
      const decoded = fastify.jwt.verify(accessToken);

      if (decoded) {
        request.user = decoded;
        return;
      }
    }

    if (refreshToken) {
      const decoded = fastify.jwt.verify(refreshToken);
      if (decoded) {
        request.user = decoded;
        const newAccessToken = fastify.jwt.sign(decoded);
        fastify.addAccessTokenToCookies(reply, newAccessToken);
        return;
      }
    }
  }
});
