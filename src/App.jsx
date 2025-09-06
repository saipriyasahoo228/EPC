// third party
import { RouterProvider } from 'react-router-dom';

// project imports
import router from 'routes';
import { PermissionProvider } from 'contexts/PermissionsContext';
// -----------------------|| APP ||-----------------------//

export default function App() {
  return (
    <PermissionProvider>
      <RouterProvider router={router} />
    </PermissionProvider>
  );
}
