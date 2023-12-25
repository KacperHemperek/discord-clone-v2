import React from 'react';
import { Outlet } from 'react-router-dom';

export default function BaseLayout() {
  return (
    <div className='flex h-screen max-h-screen bg-dc-neutral-800 overflow-hidden text-dc-neutral-50'>
      <div className='flex flex-col overflow-y-auto bg-dc-neutral-950 p-2'>
        <div className='w-10 h-10 rounded-lg bg-dc-neutral-500'></div>
      </div>
      <div className='p-2 bg-dc-neutral-900'>
        <div className='w-64'>User one</div>
      </div>
      <Outlet />
    </div>
  );
}
