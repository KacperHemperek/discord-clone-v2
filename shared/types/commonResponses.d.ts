import {
  ErrorBaseResponse,
  MessageSuccessResponse,
} from '@api/app/utils/commonResponses';
import { Static } from '@sinclair/typebox';

export type ErrorBaseResponseType = Static<typeof ErrorBaseResponse>;

export type MessageSuccessResponseType = Static<typeof MessageSuccessResponse>;
