import React from 'react';
import { useEffect, useRef } from 'react';
import NotificationsClient from './notifications';
import { useToast } from '../components/Toast/ToastProvider';

// Keep a single client instance across the app
let client = null;

export default function useNotificationsToasts({ path = '/ws/notifications/' } = {}) {
  const { toast } = useToast();
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!client) {
      client = new NotificationsClient(path);
      client.connect();
    }

    // Subscribe to incoming messages and show toast
    unsubscribeRef.current = client.onMessage((data) => {
      try {
        const payload = typeof data === 'string' ? { message: data } : data || {};

        // Specific handling for server format
        if (payload?.type === 'send_notification') {
          const title = payload.title || '';
          const body = payload.message || '';
          const ts = payload.timestamp ? new Date(payload.timestamp) : null;
          const timeLabel = ts && !isNaN(ts) ? ts.toLocaleString() : null;

          const children = [];
          if (title) children.push(React.createElement('strong', { key: 't' }, title));
          if (title && body) children.push(React.createElement('br', { key: 'br' }));
          if (body) children.push(React.createElement('span', { key: 'b' }, body));
          if (timeLabel)
            children.push(
              React.createElement(
                'div',
                { key: 'ts', style: { opacity: 0.8, fontSize: 12, marginTop: 4 } },
                timeLabel
              )
            );
          const node = React.createElement('div', null, children);
          toast(node, { severity: 'info' });
          return;
        }

        // Generic fallback
        const message = payload.message || payload.body || payload.title || JSON.stringify(payload);
        const severity = (payload.level || payload.type || payload.severity || 'info').toLowerCase();
        // Map possible server-side levels to MUI severities
        const sevMap = {
          debug: 'info',
          info: 'info',
          success: 'success',
          warning: 'warning',
          warn: 'warning',
          error: 'error',
          danger: 'error',
        };
        const sev = sevMap[severity] || 'info';
        toast(message, { severity: sev });
      } catch (e) {
        // Fallback for any unexpected payload
        toast('New notification received', { severity: 'info' });
      }
    });

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
      // We intentionally do not close the socket here to keep it alive globally
    };
  }, [path, toast]);
}
