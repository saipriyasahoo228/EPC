import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { usePermissions } from '../../contexts/PermissionsContext';

const Centered = ({ children }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
    {children}
  </Box>
);

const AdminOnly = ({ fallback = null, children }) => {
  const { loading, user } = usePermissions();

  if (loading) {
    return (
      <Centered>
        <CircularProgress />
      </Centered>
    );
  }

  if (!user?.is_admin) {
    if (fallback) return fallback;
    return (
      <Centered>
        <Typography color="error">403 - Admin access required.</Typography>
      </Centered>
    );
  }

  return <>{children}</>;
};

export default AdminOnly;
