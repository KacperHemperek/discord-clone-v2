import { StatusCodes } from 'http-status-codes';
import { ValidationResult } from 'fastify';

export type ValidationErrorResponse = {
  statusCode: StatusCodes.BAD_REQUEST;
  message: string;
  field: string;
  cause: ValidationResult[];
};

export type ApiHandledErrorResponse = {
  message: string;
  statusCode: StatusCodes;
};

export type ApiUnhandledErrorResponse = {
  cause: string;
} & ApiHandledErrorResponse;

export type ApiErrorResponse =
  | ApiHandledErrorResponse
  | ApiUnhandledErrorResponse
  | ValidationErrorResponse;
