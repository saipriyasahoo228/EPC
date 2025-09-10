import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { usePermissions } from '../../contexts/PermissionsContext';

const Centered = ({ children }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
    {children}
  </Box>
);

const RequirePermission = ({ slug, action = 'can_read', fallback = null, children }) => {
  const { loading, can } = usePermissions();

  if (loading) {
    return (
      <Centered>
        <CircularProgress />
      </Centered>
    );
  }

  const allowed = can(slug, action);
  if (!allowed) {
    if (fallback) return fallback;
    return (
      <Centered>
        <Typography color="error">403 - Not authorized to access this resource.</Typography>
      </Centered>
    );
  }

  return <>{children}</>;
};

// Render children only if the user has the given permission
export const ShowIfCan = ({ slug, action = 'can_read', children }) => {
  const { loading, can } = usePermissions();
  if (loading) return null;
  return can(slug, action) ? <>{children}</> : null;
};

// Clone a single child element and disable it if permission is missing
// Usage:
//   <DisableIfCannot slug="maintenance" action="can_create">
//     <Button variant="contained">Save</Button>
//   </DisableIfCannot>
export const DisableIfCannot = ({ slug, action, children, reason = 'Not permitted' }) => {
  const { loading, can } = usePermissions();
  const allowed = !loading && can(slug, action);
  const child = React.Children.only(children);
  return React.cloneElement(child, {
    disabled: child.props?.disabled ?? !allowed ? true : false,
    title: !allowed ? reason : child.props?.title,
    'aria-disabled': !allowed || child.props?.['aria-disabled'],
  });
};

export default RequirePermission;
