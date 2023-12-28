import React from 'react';
import { useFriendRequests } from '../../context/FriendRequestsProvider';
import FriendRequestItem from '../../components/FriendRequestItem';
import { cn } from '../../utils/cn';
import { Search } from 'lucide-react';

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
  const { requests } = useFriendRequests();

  const [search, setSearch] = React.useState('');
  const filteredRequests = requests.filter((request) =>
    request.inviterUsername.toLowerCase().includes(search.toLowerCase())
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
            userId={request.inviterId}
            username={request.inviterUsername}
            key={request.inviterId}
          />
        ))}
      </Container>
    </>
  );
}
