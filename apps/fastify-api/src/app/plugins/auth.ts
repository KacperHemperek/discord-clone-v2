import { FastifyReply, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import auth from '@fastify/auth';
import { AuthUser } from '@shared-types/user';

export type SignTokenHandler = (user: AuthUser) => Promise<string>;

export type DecodedUserToken = AuthUser & {
  iat: number;
  exp: number;
};

export type VerifyTokenHandler = (token: string) => Promise<DecodedUserToken>;

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

  const verifyToken = async (token: string) => {
    return fastify.jwt.verify<DecodedUserToken>(token);
  };

  const deserializeUser: SerializeUserHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const { accessToken, refreshToken } = request.getTokensFromCookies();
    if (accessToken) {
      try {
        const decodedAccessToken = await fastify.verifyToken(accessToken);

        if (decodedAccessToken) {
          request.user = decodedAccessToken;
          fastify.log.info(`[ plugin/auth ] User verified with access token.`);
          return;
        }
      } catch (error) {
        fastify.log.error(
          `[ plugin/auth ] Couldn't verify access token \n${error}`
        );
      }
    }

    if (refreshToken) {
      try {
        const decoded = await fastify.verifyToken(refreshToken);
        if (decoded) {
          request.user = decoded;
          const newAccessToken = await fastify.signAccessToken(decoded);
          reply.addAccessTokenToCookies(newAccessToken);
        }
      } catch (error) {
        fastify.log.error(
          `[ plugin/auth ] Couldn't verify refresh token \n${error}`
        );
      }
      return;
    }

    fastify.log.error(`[ plugin/auth ] User not verified.`);
  };

  fastify.decorate('signAccessToken', signAccessToken);
  fastify.decorate('signRefreshToken', signRefreshToken);
  fastify.decorate('verifyToken', verifyToken);
  fastify.decorate('deserializeUser', deserializeUser);
});
