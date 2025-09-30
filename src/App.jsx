// third party
import { RouterProvider } from 'react-router-dom';

// project imports
import router from 'routes';
import { PermissionProvider } from 'contexts/PermissionsContext';
import ToastProvider from './components/Toast/ToastProvider';
import NotificationsBridge from './realtime/NotificationsBridge';
// -----------------------|| APP ||-----------------------//

export default function App() {
  return (
    <PermissionProvider>
      <ToastProvider>
        <RouterProvider router={router} />
        <NotificationsBridge />
      </ToastProvider>
    </PermissionProvider>
  );
}
