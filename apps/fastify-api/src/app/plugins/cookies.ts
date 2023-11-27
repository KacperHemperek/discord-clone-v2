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

export type RemoveTokenFromCookiesHandler = () => void;

export type CookiesConfig = {
  refreshTokenCookieConfig: CookieSerializeOptions;
  accessTokenCookieConfig: CookieSerializeOptions;
  accessTokenName: string;
  refreshTokenName: string;
};

export default fastifyPlugin(async function (fastify) {
  const authCookieOptions: CookieSerializeOptions = {
    httpOnly: true,
    sameSite: false,
  };

  const accessTokenCookieConfig: CookieSerializeOptions = {
    ...authCookieOptions,
    maxAge: 20 * 1000,
  };
  const refreshTokenCookieConfig: CookieSerializeOptions = {
    ...authCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  const cookieConfig: CookiesConfig = {
    refreshTokenCookieConfig,
    accessTokenCookieConfig,
    accessTokenName: 'accessToken',
    refreshTokenName: 'refreshToken',
  };

  fastify.register(cookie, {
    secret: 'supersecret',
    hook: 'onRequest',
  });

  const addAccessTokenToCookies: AddAccessTokenToCookiesHandler = (
    reply,
    accessToken
  ) => {
    reply.setCookie(
      fastify.cookieConfig.accessTokenName,
      accessToken,
      fastify.cookieConfig.accessTokenCookieConfig
    );
  };

  const addRefreshTokenToCookies: AddRefreshTokenToCookiesHandler = (
    reply,
    refreshToken
  ) => {
    reply.setCookie(
      fastify.cookieConfig.refreshTokenName,
      refreshToken,
      fastify.cookieConfig.refreshTokenCookieConfig
    );
  };

  const getTokensFromCookies: GetTokensFromCookiesHandler = (request) => {
    return {
      accessToken: request.cookies[fastify.cookieConfig.accessTokenName],
      refreshToken: request.cookies[fastify.cookieConfig.refreshTokenName],
    };
  };

  function removeAccessTokenFromCookies() {
    // for some reason clearCookie didn't work for that cookie
    this.setCookie(fastify.cookieConfig.accessTokenName, '', {
      ...fastify.cookieConfig.accessTokenCookieConfig,
      expires: new Date(0),
    });
  }

  function removeRefreshTokenFromCookies() {
    // for some reason clearCookie didn't work for that cookie
    this.setCookie(fastify.cookieConfig.refreshTokenName, '', {
      ...fastify.cookieConfig.refreshTokenCookieConfig,
      expires: new Date(0),
    });
  }

  fastify.decorate('cookieConfig', cookieConfig);

  fastify.decorate('addAccessTokenToCookies', addAccessTokenToCookies);
  fastify.decorate('addRefreshTokenToCookies', addRefreshTokenToCookies);
  fastify.decorate('getTokensFromCookies', getTokensFromCookies);
  fastify.decorateReply(
    'removeAccessTokenFromCookies',
    removeAccessTokenFromCookies
  );
  fastify.decorateReply(
    'removeRefreshTokenFromCookies',
    removeRefreshTokenFromCookies
  );

  fastify.log.info(`[ plugin ] Cookies plugin loaded.`);
});
