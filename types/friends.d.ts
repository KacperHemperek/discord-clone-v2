import {
  FriendSchema,
  SendFriendRequestBody,
  GetAllFriendsResponseBody,
} from '@api/app/routes/friends/friends.schema';
import { Static } from '@sinclair/typebox';

export type SendFriendRequestBodyType = Static<typeof SendFriendRequestBody>;

export type FriendType = Static<typeof FriendSchema>;

export type GetAllFriendsResponseBodyType = Static<
  typeof GetAllFriendsResponseBody
>;
