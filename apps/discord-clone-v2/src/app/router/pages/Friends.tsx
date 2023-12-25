import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';

export default function FriendsPage() {
  const { user } = useAuth();

  return (
    <div className='flex flex-col flex-grow items-center justify-center'>
      {user?.username}
      <Link to='/home/channels'>Channels</Link>
      <Link to='/home/requests'>Requests</Link>
    </div>
  );
}
