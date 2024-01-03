import { FastifyError } from 'fastify';
import {
  ApiHandledErrorResponse,
  ApiUnhandledErrorResponse,
  ValidationErrorResponse,
} from '@shared/types/errors';
import fastifyPlugin from 'fastify-plugin';
import { ApiError } from '../utils/errors';
import { StatusCodes } from 'http-status-codes';

export const errorHandler = fastifyPlugin(async (fastify) => {
  fastify.setErrorHandler((error: FastifyError | ApiError, request, reply) => {
    fastify.log.error(
      `[${error.statusCode ?? 500}] [${request.method}] ${request.url}: ${
        error.message
      }`
    );

    if (error instanceof ApiError) {
      const errorResponse: ApiHandledErrorResponse = {
        message: error.message,
        statusCode: error.statusCode,
      };

      return reply.code(error.statusCode).send(errorResponse);
    }

    if (error.validation) {
      const field =
        (error.validation[0]?.params['missingProperty'] as
          | string
          | undefined) ?? 'unknown';

      const message = field
        ? `Invalid request body, missing field: ${field}`
        : 'Invalid request body, unknown field missing';

      const errorResponse: ValidationErrorResponse = {
        statusCode: StatusCodes.BAD_REQUEST,
        message,
        field: field,
        cause: error.validation,
      };

      return reply.code(StatusCodes.BAD_REQUEST).send(errorResponse);
    }

    const errorResponse: ApiUnhandledErrorResponse = {
      message: 'Internal Server Error',
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      cause: error.message,
    };

    reply
      .code(error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR)
      .send(errorResponse);
  });
});
