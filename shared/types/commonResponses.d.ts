import { MessageSuccessResponse } from '@api/app/utils/commonResponses';
import { Static } from '@sinclair/typebox';

export type MessageSuccessResponseType = Static<typeof MessageSuccessResponse>;
