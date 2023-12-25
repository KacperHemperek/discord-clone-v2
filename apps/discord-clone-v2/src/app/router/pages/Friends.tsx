import { Link, useNavigate } from 'react-router-dom';
import { useLogout } from '../../hooks/useLogout';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthProvider';

export default function FriendsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { user } = useAuth();

  const { mutate: logout } = useLogout({
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      navigate('/login');
    },
  });

  return (
    <div className='flex flex-col flex-grow items-center justify-center'>
      {user ? (
        <>
          {user.username}
          <button
            className='font-semibold bg-dc-green-600 p-2 rounded-md text-slate-50'
            onClick={() => logout()}
          >
            Logout
          </button>
        </>
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
