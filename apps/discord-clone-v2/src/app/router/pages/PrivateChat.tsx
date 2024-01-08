import {
  AllMessagesType,
  ChatMessage,
  NewMessageType,
} from '@shared/types/chats';
import ChatLinkList from '../../components/chats/ChatLinkList';
import React from 'react';
import { getWebsocketConnection } from '../../utils/websocket';
import { useParams } from 'react-router-dom';
import { ChatMessageType, ChatTypes } from '@shared/configs/chats';
import { useAuth } from '../../context/AuthProvider';

export default function PrivateChat() {
  const { user } = useAuth();

  const { chatId } = useParams<{ chatId: string }>();
  const websocketRef = React.useRef<WebSocket | null>(null);

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [chatInfo, setChatInfo] = React.useState<{
    name: string;
    type: ChatTypes;
  } | null>(null);

  React.useEffect(() => {
    const ws = getWebsocketConnection(`/chats/${chatId}/messages`);

    websocketRef.current = ws;

    if (websocketRef.current) {
      websocketRef.current.addEventListener('message', (event) => {
        const data = JSON.parse(event.data) as AllMessagesType | NewMessageType;

        if (data.type === ChatMessageType.allMessages) {
          if (data.chatType === ChatTypes.private) {
            const friend = data.members.find((u) => u.id !== user?.id);
            setChatInfo({ name: friend?.username || '', type: data.chatType });
          }
          if (data.chatType === ChatTypes.group && data.chatName) {
            setChatInfo({ name: data.chatName, type: data.chatType });
          }
          setMessages(data.messages);
        }
      });
    }

    return () => {
      websocketRef.current?.close();
    };
  }, []);

  const placeholder =
    chatInfo && chatInfo.type === ChatTypes.private
      ? `Message @${chatInfo.name}`
      : `Message ${chatInfo?.name}`;

  if (!chatInfo) return null;

  return (
    <>
      <ChatLinkList />
      <div className='flex-grow flex flex-col'>
        <nav className='border-b flex border-dc-neutral-1000 w-full p-3 gap-4'>
          <div className='flex gap-2 font-semibold items-center'>
            {chatInfo?.name}
          </div>
        </nav>

        <div className='flex flex-col-reverse flex-grow px-4 pb-2'>
          {messages.map((message) => (
            <div key={message.id}>{message.text}</div>
          ))}
        </div>
        <div className='w-full flex pt-0 pb-4 px-4'>
          <input
            className='w-full p-2 rounded-md bg-dc-neutral-1000 outline-none'
            placeholder={placeholder}
          />
        </div>
      </div>
    </>
  );
}
