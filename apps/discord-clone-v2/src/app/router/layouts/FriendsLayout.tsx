import React from 'react';
import { Outlet } from 'react-router-dom';
import { User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { GetChatsSuccessResponseType } from '@shared/types/chats';
import { useFriendRequests } from '../../context/FriendRequestsProvider';
import { FriendsNavLink } from '../../components/friends/FriendsNavLink';
import { api } from '../../utils/api';

export default function FriendsLayout() {
  const { hasNewRequests } = useFriendRequests();

  const { data } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const data = await api.get<GetChatsSuccessResponseType>('/chats');

      return data;
    },
  });

  return (
    <>
      {/* Friends */}
      <div className='p-2 bg-dc-neutral-950'>
        {data?.chats.map((chat) => (
          <div className='w-52 p-2 rounded-sm hover:bg-dc-neutral-900 flex flex-col gap-1 cursor-pointer'>
            <h4 className='font-medium leading-4'>{chat.name}</h4>
            <p className='text-sm text-dc-neutral-300 leading-3'>
              {chat.usersCount} members
            </p>
          </div>
        ))}
      </div>
      <div className='flex-grow flex flex-col'>
        <nav className='border-b flex border-dc-neutral-1000 w-full p-3 gap-4'>
          <div className='flex gap-2 font-semibold items-center'>
            <User />
            Friends
          </div>

          <div className='border-r border-dc-neutral-600' />

          <div className='flex gap-4'>
            <FriendsNavLink to='/home/friends' label='All' />
            <FriendsNavLink
              to='/home/friends/requests'
              label='Requests'
              showBadge={hasNewRequests}
            />
            <FriendsNavLink
              to='/home/friends/invite'
              label='Invite Friend'
              variant='success'
            />
          </div>
        </nav>
        <Outlet />
      </div>
    </>
  );
}
