import fastifyPlugin from 'fastify-plugin';
import cookie, { CookieSerializeOptions } from '@fastify/cookie';
import { FastifyReply, FastifyRequest } from 'fastify';

export type AddAccessTokenToCookiesHandler = (accessToken: string) => void;

export type AddRefreshTokenToCookiesHandler = (refreshToken: string) => void;

export type GetTokensFromCookiesHandler = () => {
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
    path: '/',
  };
  const refreshTokenCookieConfig: CookieSerializeOptions = {
    ...authCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
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

  function addAccessTokenToCookies(
    this: FastifyReply,
    accessToken: string
  ): ReturnType<AddAccessTokenToCookiesHandler> {
    this.setCookie(
      fastify.cookieConfig.accessTokenName,
      accessToken,
      fastify.cookieConfig.accessTokenCookieConfig
    );
  }

  function addRefreshTokenToCookies(
    this: FastifyReply,
    refreshToken: string
  ): ReturnType<AddRefreshTokenToCookiesHandler> {
    this.setCookie(
      fastify.cookieConfig.refreshTokenName,
      refreshToken,
      fastify.cookieConfig.refreshTokenCookieConfig
    );
  }

  function getTokensFromCookies(
    this: FastifyRequest
  ): ReturnType<GetTokensFromCookiesHandler> {
    return {
      accessToken: this.cookies[fastify.cookieConfig.accessTokenName] ?? '',
      refreshToken: this.cookies[fastify.cookieConfig.refreshTokenName] ?? '',
    };
  }

  function removeAccessTokenFromCookies(
    this: FastifyReply
  ): ReturnType<RemoveTokenFromCookiesHandler> {
    // for some reason clearCookie didn't work for that cookie
    this.setCookie(fastify.cookieConfig.accessTokenName, '', {
      ...fastify.cookieConfig.accessTokenCookieConfig,
      expires: new Date(0),
    });
  }

  function removeRefreshTokenFromCookies(
    this: FastifyReply
  ): ReturnType<RemoveTokenFromCookiesHandler> {
    // for some reason clearCookie didn't work for that cookie
    this.setCookie(fastify.cookieConfig.refreshTokenName, '', {
      ...fastify.cookieConfig.refreshTokenCookieConfig,
      expires: new Date(0),
    });
  }

  fastify.decorate('cookieConfig', cookieConfig);
  fastify.decorateRequest('getTokensFromCookies', getTokensFromCookies);
  fastify.decorateReply('addAccessTokenToCookies', addAccessTokenToCookies);
  fastify.decorateReply('addRefreshTokenToCookies', addRefreshTokenToCookies);
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
