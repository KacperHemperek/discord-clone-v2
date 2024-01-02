import React from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import FriendRequestItem from '../../components/FriendRequestItem';
import { useFriendRequests } from '../../context/FriendRequestsProvider';
import { cn } from '../../utils/cn';
import { api } from '../../utils/api';

function Container({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('px-10', className)}>{children}</div>;
}

export default function FriendRequests() {
  const { requests, markAllAsSeen, hasNewRequests } = useFriendRequests();

  useQuery({
    enabled: hasNewRequests,
    queryKey: ['seen-all'],
    queryFn: async () => {
      const res = await api('/friends/invites/seen', {
        method: 'PUT',
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data?.message);
        throw new Error(data?.message);
      }
      markAllAsSeen();
      return data;
    },
  });

  const [search, setSearch] = React.useState('');

  const filteredRequests = requests.filter((request) =>
    request.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Container className='pt-4'>
        <div className='bg-dc-neutral-950 px-3 py-1 rounded-md flex items-center gap-3 placeholder:text-dc-neutral-300'>
          <input
            type='text'
            className='bg-transparent outline-none flex-grow ring-0'
            placeholder='Search'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={20} className='text-dc-neutral-300' />
        </div>
      </Container>
      <Container className='py-4'>
        <h1 className='uppercase text-xs font-semibold tracking-[0.02em] text-dc-neutral-200'>
          Waiting - {requests.length}
        </h1>
      </Container>
      <Container className='pb-4 overflow-auto'>
        {filteredRequests.map((request) => (
          <FriendRequestItem
            id={request.id}
            userId={request.id}
            username={request.username}
            key={request.id}
          />
        ))}
      </Container>
    </>
  );
}
