import React from 'react';
import { useAuth } from '../../context/AuthProvider';

export default function FriendsPage() {
  const { user } = useAuth();

  return (
    <div className='flex flex-col flex-grow items-center justify-center'>
      {user?.username}
    </div>
  );
}
