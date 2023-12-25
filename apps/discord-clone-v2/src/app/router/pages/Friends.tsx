import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';

export default function FriendsPage() {
  const { user } = useAuth();

  return (
    <div className='flex flex-col flex-grow items-center justify-center'>
      {user ? (
        user.username
      ) : (
        <div className='flex flex-col gap-6 items-center'>
          <Link
            className='font-semibold bg-green-500 p-2 rounded-md text-slate-50'
            to='/login'
          >
            Login test
          </Link>
          <Link
            className='font-semibold bg-green-500 p-2 rounded-md text-slate-50'
            to='/register'
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
}
