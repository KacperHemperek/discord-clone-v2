import { Static } from '@sinclair/typebox';
import {
  CreateChatWithUsersBodySchema,
  CreateChatWithUsersSuccessResponseSchema,
  GetChatsSuccessResponseSchema,
} from '@api/app/routes/chats/chats.schema';

export type CreateChatWithUsersBodyType = Static<
  typeof CreateChatWithUsersBodySchema
>;

export type GetChatsSuccessResponseType = Static<
  typeof GetChatsSuccessResponseSchema
>;

export type CreateChatWithUsersSuccessResponseType = Static<
  typeof CreateChatWithUsersSuccessResponseSchema
>;
