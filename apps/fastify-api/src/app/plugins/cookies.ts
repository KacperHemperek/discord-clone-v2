import fastifyPlugin from 'fastify-plugin';
import cookie from '@fastify/cookie';
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

export default fastifyPlugin(async function (fastify) {
  fastify.register(cookie, {
    secret: 'supersecret',
    hook: 'onRequest',
  });

  const addAccessTokenToCookies: AddAccessTokenToCookiesHandler = (
    reply,
    accessToken
  ) => {
    reply.setCookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: false,
    });
  };

  const addRefreshTokenToCookies: AddRefreshTokenToCookiesHandler = (
    reply,
    refreshToken
  ) => {
    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: false,
    });
  };

  const getTokensFromCookies: GetTokensFromCookiesHandler = (request) => {
    console.log('\n\nrequest.cookies ===> ', request.cookies);

    return {
      accessToken: request.cookies.accessToken,
      refreshToken: request.cookies.refreshToken,
    };
  };

  fastify.decorate('addAccessTokenToCookies', addAccessTokenToCookies);
  fastify.decorate('addRefreshTokenToCookies', addRefreshTokenToCookies);
  fastify.decorate('getTokensFromCookies', getTokensFromCookies);
});
