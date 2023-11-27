import { FastifyReply, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import auth from '@fastify/auth';

// TODO: Add types for user
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SignTokenHandler = (user: any) => string;

export type SerializeUserHandler = (
  request: FastifyRequest,
  reply: FastifyReply
) => void;

export default fastifyPlugin(async function (fastify) {
  fastify.register(auth);

  fastify.log.info(`[ plugin ] Auth plugin loaded.`);

  const signAccessToken: SignTokenHandler = (user) => {
    return fastify.jwt.sign(user, {
      expiresIn: '20s',
    });
  };

  const signRefreshToken: SignTokenHandler = (user) => {
    return fastify.jwt.sign(user, {
      expiresIn: '7d',
    });
  };

  const serializeUser: SerializeUserHandler = (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { accessToken, refreshToken } = fastify.getTokensFromCookies(request);
    if (accessToken) {
      try {
        const decodedAccessToken = fastify.jwt.verify(accessToken);
        if (decodedAccessToken) {
          request.user = decodedAccessToken;
          fastify.log.info(`[ plugin/auth ] User verified with access token.`);
        }

        return;
      } catch (error) {
        fastify.log.error(
          `[ plugin/auth ] Couldn't verify access token \n${error}`
        );
      }
    } else {
      fastify.log.info(`[ plugin/auth ] Access token not found.`);
    }

    if (refreshToken) {
      try {
        const decoded = fastify.jwt.verify(refreshToken);
        if (decoded) {
          fastify.log.info(`[ plugin/auth ] User verified with refresh token.`);
          request.user = decoded;
          const newAccessToken = fastify.jwt.sign(decoded, {
            expiresIn: '20s',
          });
          fastify.addAccessTokenToCookies(reply, newAccessToken);
          fastify.log.info(`[ plugin/auth ] New access token created.`);
        }
      } catch (error) {
        fastify.log.error(
          `[ plugin/auth ] Couldn't verify refresh token \n${error}`
        );
      }
      return;
    } else {
      fastify.log.info(`[ plugin/auth ] Refresh token not found.`);
    }

    fastify.log.info(`[ plugin/auth ] User not verified.`);
  };

  fastify.decorate('signAccessToken', signAccessToken);
  fastify.decorate('signRefreshToken', signRefreshToken);
  fastify.decorate('serializeUser', serializeUser);
});
