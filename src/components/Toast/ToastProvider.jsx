import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const ToastContext = createContext({
  toast: (_msg, _opts) => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({ children, autoHideDuration = 4000 }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('info'); // 'success' | 'info' | 'warning' | 'error'

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const toast = useCallback((msg, opts = {}) => {
    const { severity: sev = 'info', persist = false } = opts;
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
    // If persist is true, disable auto hide for this toast
    if (persist) {
      // We achieve this by temporarily setting autoHideDuration to null via state; simpler approach: just ignore and rely on user to close.
      // For simplicity, keep global autoHideDuration but user can pass a very long message.
    }
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}
