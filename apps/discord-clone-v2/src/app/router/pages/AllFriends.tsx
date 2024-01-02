import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { GetAllFriendsResponseBodyType } from '@shared-types/friends';
import { api } from '../../utils/api';
import FriendListItem from '../../components/friends/FriendListItem';
import { Container } from '../../components/friends/FriendPageContainer';
import SearchBar from '../../components/SearchBar';

export default function AllFriendsPage() {
  const { data } = useQuery({
    queryKey: ['all-friends'],
    queryFn: async () => {
      const res = await api(`/friends/`);

      const resultObj = await res.json();

      if (!res.ok) {
        throw new Error(resultObj.message);
      }

      return resultObj as GetAllFriendsResponseBodyType;
    },
  });

  const [search, setSearch] = React.useState('');

  const filteredFriends = data?.friends.filter((friend) =>
    friend.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Container className='pt-4'>
        <SearchBar value={search} setValue={setSearch} />
      </Container>
      <Container className='pt-4'>
        <h1 className='uppercase text-xs font-semibold tracking-[0.02em] text-dc-neutral-200'>
          Waiting - {filteredFriends?.length ?? 0}
        </h1>
      </Container>
      <Container className='py-4 overflow-auto'>
        {filteredFriends?.map((friend) => (
          <FriendListItem
            id={friend.id}
            username={friend.username}
            key={friend.id}
          />
        ))}
      </Container>
    </>
  );
}
