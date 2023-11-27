import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className='flex flex-col h-screen bg-brand items-center justify-center'>
      {user ? (
        JSON.stringify(user)
      ) : (
        <div className='flex flex-col gap-6 items-center'>
          <Link
            className='font-semibold bg-green-500 p-2 rounded-md text-slate-50'
            to='/login'
          >
            Login
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
