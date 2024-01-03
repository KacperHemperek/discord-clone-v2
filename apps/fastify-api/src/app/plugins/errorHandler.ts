import { FastifyError } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { ApiError } from '../utils/errors';

export const errorHandler = fastifyPlugin(async (fastify) => {
  fastify.setErrorHandler((error: FastifyError | ApiError, request, reply) => {
    fastify.log.error(
      `[${error.statusCode ?? 500}] [${request.method}] ${request.url}: ${
        error.message
      }`
    );

    if (error instanceof ApiError) {
      return reply.code(error.statusCode).send({
        statusCode: error.statusCode,
        message: error.message,
      });
    }

    if (!error.statusCode) {
      return reply.code(500).send({
        statusCode: 500,
        message: 'Internal server error',
        cause: error.message,
      });
    }

    if (error.validation) {
      const field = error.validation[0]?.params['missingProperty'];

      const message = field
        ? `Invalid request body, missing field: ${field}`
        : 'Invalid request body, unknown field missing';

      return reply.code(error.statusCode).send({
        statusCode: error.statusCode,
        message,
        field: field ?? 'unknown',
        cause: error.validation,
      });
    }

    reply.code(error.statusCode).send({
      statusCode: error.statusCode,
      message: 'Internal Server Error',
      cause: error.message,
    });
  });
});
