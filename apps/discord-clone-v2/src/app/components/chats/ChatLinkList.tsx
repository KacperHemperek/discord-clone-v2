import React from 'react';
import ChatLink from './ChatLink';
import { useChats } from '../../hooks/reactQuery/useChats';

export default function ChatLinkList() {
  const { data } = useChats();

  return (
    <div className='p-2 bg-dc-neutral-950'>
      {data?.chats.map((chat) => (
        <ChatLink {...chat} key={chat.id} />
      ))}
    </div>
  );
}
