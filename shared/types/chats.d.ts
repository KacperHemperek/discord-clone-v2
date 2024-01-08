import { Static } from '@sinclair/typebox';
import {
  ChatTypes,
  CreateChatWithUsersBodySchema,
  CreateChatWithUsersSuccessResponseSchema,
  GetChatsSuccessResponseSchema,
} from '@api/app/routes/chats/chats.schema';
import { ChatMessageType } from '@api/app/routes/chats/chats.routes';

export type CreateChatWithUsersBodyType = Static<
  typeof CreateChatWithUsersBodySchema
>;

export type GetChatsSuccessResponseType = Static<
  typeof GetChatsSuccessResponseSchema
>;

export type CreateChatWithUsersSuccessResponseType = Static<
  typeof CreateChatWithUsersSuccessResponseSchema
>;

export type ChatMessage = {
  senderId: string;
  text: string | null;
  image: string | null;
  createdAt: Date;
};

export type AllMessagesType = {
  type: ChatMessageType.allMessages;
  messages: ChatMessage[];
  chatName: string | null;
  chatType: ChatTypes;
  members: {
    id: string;
    username: string;
    email: string;
  }[];
};

export type NewMessageType = {
  type: ChatMessageType.newMessage;
  message: ChatMessage;
};
