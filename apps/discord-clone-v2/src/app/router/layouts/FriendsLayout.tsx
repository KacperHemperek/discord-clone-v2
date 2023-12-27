import React from 'react';
import { Outlet } from 'react-router-dom';
import { useFriendRequests } from '../../context/FriendRequestsProvider';
import { FriendsNavLink } from '../../components/FriendsNavLink';

export default function FriendsLayout() {
  const { notifications } = useFriendRequests();

  const hasNotSeenNotifications =
    notifications.filter((n) => !n.seen).length > 0;

  return (
    <div className='flex-grow flex flex-col'>
      <nav className='border-b flex border-dc-neutral-900 w-full p-3 gap-4'>
        <FriendsNavLink to='/home/friends' label='active' />
        <FriendsNavLink to='/home/friends/all' label='All' />
        <FriendsNavLink
          to='/home/friends/requests'
          label='Requests'
          showBadge={hasNotSeenNotifications}
        />
        <FriendsNavLink
          to='/home/friends/invite'
          label='Invite Friend'
          variant='success'
        />
      </nav>
      <Outlet />
    </div>
  );
}
