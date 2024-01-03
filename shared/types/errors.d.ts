import { StatusCodes } from 'http-status-codes';
import { ValidationResult } from 'fastify';

export type ValidationErrorResponse = {
  statusCode: StatusCodes.BAD_REQUEST;
  message: string;
  field: string;
  cause: ValidationResult[];
  type: 'validation';
};

export type ApiHandledErrorResponse = {
  message: string;
  statusCode: StatusCodes;
  type: 'handled';
};

export type ApiUnhandledErrorResponse = {
  cause: string;
  type: 'unhandled';
} & Omit<ApiHandledErrorResponse, 'type'>;

export type ApiErrorResponse =
  | ApiHandledErrorResponse
  | ApiUnhandledErrorResponse
  | ValidationErrorResponse;
