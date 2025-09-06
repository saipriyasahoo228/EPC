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

export default RequirePermission;
