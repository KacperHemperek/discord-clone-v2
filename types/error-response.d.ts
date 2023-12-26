import { ErrorBaseResponse } from '@api/app/utils/error-response';
import { Static } from '@sinclair/typebox';

export type ErrorBaseResponseType = Static<typeof ErrorBaseResponse>;
