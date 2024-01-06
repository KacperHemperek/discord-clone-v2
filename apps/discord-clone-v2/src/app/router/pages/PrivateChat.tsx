import ChatLinkList from '../../components/chats/ChatLinkList';
import React from 'react';

export default function PrivateChat() {
  return (
    <>
      <ChatLinkList />
      <div className='flex-grow flex flex-col'>
        <nav className='border-b flex border-dc-neutral-1000 w-full p-3 gap-4'>
          <div className='flex gap-2 font-semibold items-center'>Friends</div>
        </nav>
        {/* Chat messages */}
      </div>
    </>
  );
}
