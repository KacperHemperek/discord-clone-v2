import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';
import { GetChatsSuccessResponseType } from '@shared/types/chats';

export function useChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const data = await api.get<GetChatsSuccessResponseType>('/chats');

      return data;
    },
  });
}
