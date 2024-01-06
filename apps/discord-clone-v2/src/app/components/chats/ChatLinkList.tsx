import React from 'react';
import ChatLink from './ChatLink';
import { useChats } from '../../hooks/reactQuery/useChats';
import { Link, useMatch } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { User } from 'lucide-react';

function FriendsLink() {
  const link = '/home/friends';

  const linkToMatch = '/home/friends/*';

  const match = useMatch(linkToMatch);

  return (
    <Link
      to={link}
      className={cn(
        'w-52 p-2 rounded-sm hover:bg-dc-neutral-900 flex flex-col gap-1 cursor-pointer transition-colors duration-100 mb-6',
        !!match && 'bg-dc-neutral-850'
      )}
    >
      <h3 className='font-medium text-lg flex gap-2 items-center'>
        <User size={20} />
        Friends
      </h3>
    </Link>
  );
}

export default function ChatLinkList() {
  const { data } = useChats();

  return (
    <div className='p-2 bg-dc-neutral-950'>
      <FriendsLink />

      <h4 className='uppercase text-xs font-semibold tracking-[0.02em] text-dc-neutral-300 pl-2 pb-2'>
        Private messages
      </h4>
      {data?.chats.map((chat) => (
        <ChatLink {...chat} key={chat.id} />
      ))}
    </div>
  );
}
