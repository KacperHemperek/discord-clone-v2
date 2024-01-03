import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSuccessResponseType } from '@shared/types/commonResponses';
import FriendRequestItem from '../../components/friends/FriendRequestItem';
import { useFriendRequests } from '../../context/FriendRequestsProvider';
import { api } from '../../utils/api';
import { Container } from '../../components/friends/FriendPageContainer';
import SearchBar from '../../components/SearchBar';

export default function FriendRequestsPage() {
  const { requests, markAllAsSeen, hasNewRequests } = useFriendRequests();

  useQuery({
    enabled: hasNewRequests,
    queryKey: ['seen-all'],
    queryFn: async () => {
      const data = await api.put<MessageSuccessResponseType>(
        '/friends/invites/seen'
      );

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
        <SearchBar value={search} setValue={setSearch} />
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
