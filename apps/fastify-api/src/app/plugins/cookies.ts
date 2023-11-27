import fastifyPlugin from 'fastify-plugin';
import cookie, { CookieSerializeOptions } from '@fastify/cookie';
import { FastifyReply, FastifyRequest } from 'fastify';

export type AddAccessTokenToCookiesHandler = (
  reply: FastifyReply,
  accessToken: string
) => void;

export type AddRefreshTokenToCookiesHandler = (
  reply: FastifyReply,
  refreshToken: string
) => void;

export type GetTokensFromCookiesHandler = (request: FastifyRequest) => {
  accessToken: string;
  refreshToken: string;
};

export type RemoveTokenFromCookiesHandler = (reply: FastifyReply) => void;

export default fastifyPlugin(async function (fastify) {
  const authCookieOptions: CookieSerializeOptions = {
    httpOnly: true,
    sameSite: false,
  };

  fastify.register(cookie, {
    secret: 'supersecret',
    hook: 'onRequest',
  });

  const addAccessTokenToCookies: AddAccessTokenToCookiesHandler = (
    reply,
    accessToken
  ) => {
    reply.setCookie('accessToken', accessToken, {
      ...fastify.authCookieOptions,
      maxAge: 20 * 1000,
    });
  };

  const addRefreshTokenToCookies: AddRefreshTokenToCookiesHandler = (
    reply,
    refreshToken
  ) => {
    reply.setCookie('refreshToken', refreshToken, {
      ...fastify.authCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  };

  const getTokensFromCookies: GetTokensFromCookiesHandler = (request) => {
    return {
      accessToken: request.cookies.accessToken,
      refreshToken: request.cookies.refreshToken,
    };
  };

  const removeAccessTokenFromCookies: RemoveTokenFromCookiesHandler = (
    reply
  ) => {
    reply.clearCookie('accessToken', fastify.authCookieOptions);
  };

  const removeRefreshTokenFromCookies: RemoveTokenFromCookiesHandler = (
    reply
  ) => {
    reply.clearCookie('refreshToken', fastify.authCookieOptions);
  };

  fastify.decorate('authCookieOptions', authCookieOptions);

  fastify.decorate('addAccessTokenToCookies', addAccessTokenToCookies);
  fastify.decorate('addRefreshTokenToCookies', addRefreshTokenToCookies);
  fastify.decorate('getTokensFromCookies', getTokensFromCookies);
  fastify.decorate(
    'removeAccessTokenFromCookies',
    removeAccessTokenFromCookies
  );
  fastify.decorate(
    'removeRefreshTokenFromCookies',
    removeRefreshTokenFromCookies
  );

  fastify.log.info(`[ plugin ] Cookies plugin loaded.`);
});
