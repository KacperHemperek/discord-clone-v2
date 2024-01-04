import React from 'react';
import { LogOut } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { useLogout } from '../../hooks/useLogout';
import FriendRequestsProvider from '../../context/FriendRequestsProvider';

export default function BaseLayout() {
  const { mutate } = useLogout();

  function logout() {
    mutate();
  }

  return (
    <FriendRequestsProvider>
      <div className='flex h-screen max-h-screen bg-dc-neutral-900 overflow-hidden text-dc-neutral-50'>
        <div className='flex flex-col bg-dc-neutral-1000 '>
          {/* Channels */}
          <div className='flex-grow overflow-auto p-2 gap-2 flex flex-col'>
            <div className='w-10 h-10 rounded-full bg-dc-neutral-500'></div>
            <div className='w-10 h-10 rounded-full bg-dc-neutral-500'></div>
          </div>
          {/* Settings */}
          <div className='flex flex-col gap-2 px-2 pb-2'>
            <button
              onClick={logout}
              className='p-3  rounded-lg bg-dc-neutral-500 flex items-center justify-center'
            >
              <LogOut className='w-4 h-4' />
            </button>
          </div>
        </div>
        {/* Friends */}
        <div className='p-2 bg-dc-neutral-950'>
          <div className='w-64'>User one</div>
        </div>
        <Outlet />
      </div>
    </FriendRequestsProvider>
  );
}
