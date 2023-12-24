import { Link, createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/Home';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    children: [
      {
        path: 'channels',
        element: (
          <div>
            <Link to='/'>To home</Link>
          </div>
        ),
        ErrorBoundary: () => <div>error</div>,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
]);
