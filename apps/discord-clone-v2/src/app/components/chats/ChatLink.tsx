import React from 'react';
import { Link, useMatch } from 'react-router-dom';
import { ChatTypes } from '@shared/configs/chats';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthProvider';

type ChatLinkProps = {
  name: string | null;
  usersCount: number;
  id: string;
  type: ChatTypes;
  users: {
    username: string;
    id: string;
  }[];
};

export default function ChatLink({
  id,
  name,
  usersCount,
  type,
  users,
}: ChatLinkProps) {
  const { user } = useAuth();

  const link = `/home/chats/${id}`;

  const match = useMatch(link);

  if (type === ChatTypes.private) {
    const friend = users.find((friend) => friend.id !== user?.id)!;

    return (
      <Link
        to={link}
        className={cn(
          'w-52 p-2 rounded-sm hover:bg-dc-neutral-900 flex gap-2 cursor-pointer transition-colors duration-100 items-center',
          !!match && 'bg-dc-neutral-850'
        )}
      >
        {/* TODO: replace div with actual user avatar */}
        <div className='w-10 h-10 rounded-full bg-dc-neutral-800' />
        {friend.username}
      </Link>
    );
  }

  return (
    <Link
      to={link}
      className={cn(
        'w-52 p-2 rounded-sm hover:bg-dc-neutral-900 flex flex-col gap-1 cursor-pointer transition-colors duration-100',
        !!match && 'bg-dc-neutral-850'
      )}
    >
      <h4 className='font-medium leading-4'>{name}</h4>
      <p className='text-sm text-dc-neutral-300 leading-3'>
        {usersCount} members
      </p>
    </Link>
  );
}
