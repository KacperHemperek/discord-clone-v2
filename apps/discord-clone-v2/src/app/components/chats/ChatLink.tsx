import React from 'react';
import { Link, useMatch } from 'react-router-dom';
import { cn } from '../../utils/cn';

export default function ChatLink({
  id,
  name,
  usersCount,
}: {
  name: string;
  usersCount: number;
  id: string;
}) {
  const link = `/home/friends/chat/${id}`;

  const match = useMatch(link);

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
