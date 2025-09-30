import { API_BASE_URL } from '../constant';
import { getToken } from '../auth';

// Derive ws/wss URL from API_BASE_URL
function buildWsUrl(path) {
  try {
    const base = API_BASE_URL?.replace(/\/$/, '');
    if (!base) return null;
    const url = new URL(base);
    const scheme = url.protocol === 'https:' ? 'wss:' : 'ws:';
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${scheme}//${url.host}${cleanPath}`;
  } catch (e) {
    console.error('WS URL build error:', e);
    return null;
  }
}

class NotificationsClient {
  constructor(path = '/ws/notifications/') {
    this.path = path;
    this.ws = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxBackoffMs = 30000; // 30s cap
    this._manualClose = false;
    this._pingInterval = null;

    // Reconnect when user tokens are updated (e.g., login/logout)
    // Dispatch window.dispatchEvent(new Event('userInfoUpdated')) elsewhere after auth changes
    window.addEventListener('userInfoUpdated', () => {
      this.reconnect(true);
    });
  }

  onMessage(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  _emit(msg) {
    this.listeners.forEach((fn) => {
      try {
        fn(msg);
      } catch (e) {
        console.error('WS listener error', e);
      }
    });
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsBase = buildWsUrl(this.path);
    if (!wsBase) {
      console.error('Cannot build WS URL. Check API_BASE_URL.');
      return;
    }

    const { accessToken } = getToken() || {};
    if (!accessToken) {
      console.error('No access token available for WebSocket auth');
      return;
    }

    const url = `${wsBase}?token=${encodeURIComponent(accessToken)}`; // query auth (current server expects this)

    this._manualClose = false;
    try {
      this.ws = new WebSocket(url);
    } catch (e) {
      console.error('WS init error', e);
      this._scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this._startPing();
      // Connected
    };

    this.ws.onmessage = (ev) => {
      let payload = ev.data;
      try {
        payload = JSON.parse(ev.data);
      } catch (_) {
        // keep as string
      }
      this._emit(payload);
    };

    this.ws.onerror = (err) => {
      console.error('[WS] Error', err);
    };

    this.ws.onclose = (ev) => {
      this._stopPing();
      this.ws = null;
      if (!this._manualClose) this._scheduleReconnect();
    };
  }

  _startPing() {
    this._stopPing();
    this._pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
        } catch (_) {
          // ignore
        }
      }
    }, 30000); // 30s heartbeat
  }

  _stopPing() {
    if (this._pingInterval) {
      clearInterval(this._pingInterval);
      this._pingInterval = null;
    }
  }

  _scheduleReconnect() {
    this.reconnectAttempts += 1;
    const backoff = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), this.maxBackoffMs);
    setTimeout(() => this.connect(), backoff);
  }

  reconnect(immediate = false) {
    this.close();
    if (immediate) {
      this.connect();
    } else {
      this._scheduleReconnect();
    }
  }

  close() {
    this._manualClose = true;
    this._stopPing();
    if (this.ws) {
      try {
        this.ws.close();
      } catch (_) {}
      this.ws = null;
    }
  }

  send(data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    try {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      this.ws.send(payload);
      return true;
    } catch (e) {
      console.error('WS send failed:', e);
      return false;
    }
  }
}

export default NotificationsClient;





























// export class NotificationsClient {
//   constructor({ path = '/ws/notifications/', debug = false, authMode = 'protocol' } = {}) {
//     this.path = path;
//     this.debug = debug;
//     // authMode: 'protocol' | 'query' | 'message'
//     // - protocol: send JWT via Sec-WebSocket-Protocol (recommended to avoid query string)
//     // - query: append ?token=... (legacy)
//     // - message: connect unauthenticated then immediately send an auth message
//     this.authMode = authMode;
//     this.ws = null;
//     this.listeners = new Set();
//     this.reconnectAttempts = 0;
//     this.maxBackoffMs = 30000; // 30s
//     this._manualClose = false;
//     this._pingInterval = null;

//     // Reconnect when user tokens are updated (e.g., login/logout)
//     window.addEventListener('userInfoUpdated', () => {
//       if (this.debug) console.log('[NotificationsClient] userInfoUpdated -> reconnect');
//       this.reconnect(true);
//     });
//   }

//   log(...args) {
//     if (this.debug) console.log('[NotificationsClient]', ...args);
//   }

//   onMessage(fn) {
//     this.listeners.add(fn);
//     return () => this.listeners.delete(fn);
//   }

//   _emit(msg) {
//     this.listeners.forEach((fn) => {
//       try { fn(msg); } catch (e) { console.error('Listener error', e); }
//     });
//   }

//   connect() {
//     if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
//       this.log('Already connected/connecting');
//       return;
//     }

//     const wsBase = buildWsUrl(this.path);
//     if (!wsBase) {
//       console.error('Cannot build WS URL. Check API_BASE_URL.');
//       return;
//     }

//     const { accessToken } = getToken();
//     let url = wsBase;
//     let protocols = undefined;
//     if (this.authMode === 'query' && accessToken) {
//       url = `${wsBase}?token=${encodeURIComponent(accessToken)}`;
//     } else if (this.authMode === 'protocol' && accessToken) {
//       // Two subprotocols: an identifier and the actual token (or Bearer token)
//       // Your Channels consumer/middleware can read from scope['subprotocols']
//       protocols = ['jwt', `Bearer ${accessToken}`];
//     }

//     this._manualClose = false;
//     this.log('Connecting to', url);
//     this.ws = protocols ? new WebSocket(url, protocols) : new WebSocket(url);

//     this.ws.onopen = () => {
//       this.log('Connected');
//       this.reconnectAttempts = 0;
//       // Heartbeat to keep connection alive behind proxies
//       this._startPing();
//       // If using message-based auth, send token immediately after connect
//       if (this.authMode === 'message' && accessToken) {
//         this.send({ type: 'auth', token: accessToken });
//       }
//     };

//     this.ws.onmessage = (ev) => {
//       let payload = ev.data;
//       try { payload = JSON.parse(ev.data); } catch (_) {}
//       this._emit(payload);
//     };

//     this.ws.onerror = (err) => {
//       this.log('Socket error', err);
//     };

//     this.ws.onclose = (ev) => {
//       this._stopPing();
//       this.log('Closed', ev?.code, ev?.reason);
//       this.ws = null;
//       if (!this._manualClose) this._scheduleReconnect();
//     };
//   }

//   _startPing() {
//     this._stopPing();
//     this._pingInterval = setInterval(() => {
//       if (this.ws && this.ws.readyState === WebSocket.OPEN) {
//         try { this.ws.send(JSON.stringify({ type: 'ping', ts: Date.now() })); } catch (_) {}
//       }
//     }, 30000);
//   }

//   _stopPing() {
//     if (this._pingInterval) {
//       clearInterval(this._pingInterval);
//       this._pingInterval = null;
//     }
//   }

//   _scheduleReconnect() {
//     this.reconnectAttempts += 1;
//     const backoff = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), this.maxBackoffMs);
//     this.log(`Reconnecting in ${Math.round(backoff / 1000)}s...`);
//     setTimeout(() => this.connect(), backoff);
//   }

//   reconnect(immediate = false) {
//     this.close();
//     if (immediate) {
//       this.connect();
//     } else {
//       this._scheduleReconnect();
//     }
//   }

//   close() {
//     this._manualClose = true;
//     this._stopPing();
//     if (this.ws) {
//       try { this.ws.close(); } catch (_) {}
//       this.ws = null;
//     }
//   }

//   send(data) {
//     if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
//     try {
//       const payload = typeof data === 'string' ? data : JSON.stringify(data);
//       this.ws.send(payload);
//       return true;
//     } catch (e) {
//       console.error('WS send failed:', e);
//       return false;
//     }
//   }
// }

// // Singleton helper (optional)
// let singleton = null;
// export function getNotificationsClient(options = {}) {
//   if (!singleton) singleton = new NotificationsClient(options);
//   return singleton;
// }
