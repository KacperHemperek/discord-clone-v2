import { FastifyReply, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import auth from '@fastify/auth';
import { DecodedToken, RequestUser } from '../../index';

export type SignTokenHandler = (user: RequestUser) => Promise<string>;

export type VerifyTokenHandler = (token: string) => Promise<DecodedToken>;

export type SerializeUserHandler = (
  request: FastifyRequest,
  reply: FastifyReply
) => void;

export default fastifyPlugin(async function (fastify) {
  fastify.register(auth);

  fastify.log.info(`[ plugin ] Auth plugin loaded.`);

  const signAccessToken: SignTokenHandler = async (user) => {
    return fastify.jwt.sign(user, {
      expiresIn: '20s',
    });
  };

  const signRefreshToken: SignTokenHandler = async (user) => {
    return fastify.jwt.sign(user, {
      expiresIn: '7d',
    });
  };

  const verifyAccessToken = async (token: string) => {
    return fastify.jwt.verify<DecodedToken>(token);
  };

  const serializeUser: SerializeUserHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { accessToken, refreshToken } = fastify.getTokensFromCookies(request);
    if (accessToken) {
      try {
        const decodedAccessToken = await fastify.verifyAccessToken(accessToken);

        if (decodedAccessToken) {
          const user: RequestUser = {
            id: decodedAccessToken.id,
            username: decodedAccessToken.username,
          };
          request.user = user;
          fastify.log.info(`[ plugin/auth ] User verified with access token.`);
          return;
        }
      } catch (error) {
        fastify.log.error(
          `[ plugin/auth ] Couldn't verify access token \n${error}`
        );
      }
    } else {
      fastify.log.error(`[ plugin/auth ] Access token not found.`);
    }

    if (refreshToken) {
      try {
        const decoded = await fastify.verifyAccessToken(refreshToken);
        if (decoded) {
          fastify.log.info(`[ plugin/auth ] User verified with refresh token.`);
          const user = {
            id: decoded.id,
            username: decoded.username,
          };
          request.user = user;
          const newAccessToken = await fastify.signAccessToken(user);
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
      fastify.log.error(`[ plugin/auth ] Refresh token not found.`);
    }

    fastify.log.error(`[ plugin/auth ] User not verified.`);
  };

  fastify.decorate('signAccessToken', signAccessToken);
  fastify.decorate('signRefreshToken', signRefreshToken);
  fastify.decorate('verifyAccessToken', verifyAccessToken);
  fastify.decorate('serializeUser', serializeUser);
});
