import React from 'react';
import { useAuth } from '../../context/AuthProvider';
import { getWebsocketConnection } from '../../utils/websocket';
import {
  ALL_FRIEND_INVITES_TYPE,
  NEW_FRIEND_INVITE_TYPE,
} from '@configs/friends';

export default function FriendsPage() {
  const { user } = useAuth();

  const friendInviteWs = React.useRef<WebSocket | null>(null);

  React.useEffect(() => {
    console.log(ALL_FRIEND_INVITES_TYPE);
    const ws = getWebsocketConnection('/friends/invites');
    if (!ws) return;

    friendInviteWs.current = ws;

    friendInviteWs.current.onmessage = (event) => {
      console.log(event.data);
    };

    friendInviteWs.current.onclose = () => {
      console.log('closed');
    };

    return () => {
      friendInviteWs.current?.close();
    };
  }, []);

  return (
    <div className='flex flex-col flex-grow items-center justify-center'>
      {user?.username}
    </div>
  );
}
