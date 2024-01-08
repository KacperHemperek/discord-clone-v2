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
  const [chatName, setChatName] = React.useState<string>('');

  React.useEffect(() => {
    const ws = getWebsocketConnection(`/chats/${chatId}/messages`);

    websocketRef.current = ws;

    if (websocketRef.current) {
      websocketRef.current.addEventListener('message', (event) => {
        const data = JSON.parse(event.data) as AllMessagesType | NewMessageType;

        if (data.type === ChatMessageType.allMessages) {
          if (data.chatType === ChatTypes.private) {
            const friend = data.members.find((u) => u.id !== user?.id);
            setChatName(friend?.username || '');
          }
          if (data.chatType === ChatTypes.group && data.chatName) {
            setChatName(data.chatName);
          }
          setMessages(data.messages);
        }
      });
    }

    return () => {
      websocketRef.current?.close();
    };
  }, []);

  return (
    <>
      <ChatLinkList />
      <div className='flex-grow flex flex-col'>
        <nav className='border-b flex border-dc-neutral-1000 w-full p-3 gap-4'>
          <div className='flex gap-2 font-semibold items-center'>
            {chatName}
          </div>
        </nav>
        {messages.map((message) => (
          <div key={message.createdAt as string}>{message.text}</div>
        ))}
        {/* Chat messages */}
      </div>
    </>
  );
}
