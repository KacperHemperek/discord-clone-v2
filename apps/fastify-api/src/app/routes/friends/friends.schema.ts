import { Type } from '@sinclair/typebox';

export const SendFriendRequestBody = Type.Object({
  email: Type.String(),
});

export const FriendSchema = Type.Object({
  id: Type.String(),
  username: Type.String(),
  active: Type.Boolean(),
  email: Type.String(),
});

export const GetAllFriendsResponseBody = Type.Object({
  friends: Type.Array(FriendSchema),
});

export const RemoveFriendBody = Type.Object({
  friendId: Type.String(),
});
