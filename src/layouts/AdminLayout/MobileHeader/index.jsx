import { useContext, useEffect, useState } from 'react';

// third party
import { Link } from 'react-router-dom';
import { Dropdown, Badge, Button, Spinner } from 'react-bootstrap';

// project imports
import { ConfigContext } from 'contexts/ConfigContext';
import * as actionType from 'store/actions';
import { logout } from 'auth';
import FeatherIcon from 'feather-icons-react';
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
  markAllNotificationsRead,
  clearAllNotifications
} from 'allapi/notification';

// assets
import logo from 'assets/images/logo.svg';
import EngineeringIcon from '@mui/icons-material/Engineering';

// -----------------------|| MOBILE HEADER ||-----------------------//

export default function MobileHeader() {
  const configContext = useContext(ConfigContext);
  const { collapseHeaderMenu } = configContext.state;
  const { dispatch } = configContext;

  const [user, setUser] = useState({ full_name: '', role: '', user_id: '', is_admin: false, groups: [] });
  const [notifs, setNotifs] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifActionLoading, setNotifActionLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  useEffect(() => {
    const readUser = () => {
      try {
        const raw = localStorage.getItem('userInfo');
        if (raw) {
          const u = JSON.parse(raw);
          setUser({
            full_name: u?.full_name || u?.name || 'User',
            role: u?.role || '',
            user_id: u?.user_id || '',
            is_admin: Boolean(u?.is_admin),
            groups: Array.isArray(u?.groups) ? u.groups : [],
          });
        } else {
          setUser({ full_name: 'Guest', role: '', user_id: '', is_admin: false, groups: [] });
        }
      } catch {
        setUser({ full_name: 'User', role: '', user_id: '', is_admin: false, groups: [] });
      }
    };
    readUser();
    window.addEventListener('userInfoUpdated', readUser);
    return () => window.removeEventListener('userInfoUpdated', readUser);
  }, []);

  const roleLc = (user?.role || '').toString().toLowerCase();
  const groupNames = (Array.isArray(user?.groups) ? user.groups : [])
    .map(g => (typeof g === 'string' ? g : (g?.name || g?.title || g?.slug || '')))
    .filter(Boolean)
    .map(s => s.toString().toLowerCase());
  const canAccessSiteExec = Boolean(user?.is_admin) || roleLc === 'site supervisor' || groupNames.includes('site supervisor');

  // Notifications
  const refreshNotifications = async () => {
    try {
      setNotifLoading(true);
      const data = await getNotifications();
      setNotifs(Array.isArray(data) ? data : []);
    } catch (e) {
      // optional toast
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    refreshNotifications();
    const id = setInterval(refreshNotifications, 60_000);
    return () => clearInterval(id);
  }, []);

  const unreadCount = (notifs || []).reduce((acc, n) => acc + (n?.is_read ? 0 : 1), 0);

  const onMarkOne = async (id) => {
    try {
      setNotifActionLoading(true);
      await markNotificationRead(id);
      setNotifs(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
    } finally {
      setNotifActionLoading(false);
    }
  };

  const onDeleteOne = async (id) => {
    try {
      setNotifActionLoading(true);
      await deleteNotification(id);
      setNotifs(prev => prev.filter(n => n.id !== id));
    } finally {
      setNotifActionLoading(false);
    }
  };

  const onMarkAll = async () => {
    try {
      setNotifActionLoading(true);
      await markAllNotificationsRead();
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    } finally {
      setNotifActionLoading(false);
    }
  };

  const onClearAll = async () => {
    try {
      setNotifActionLoading(true);
      await clearAllNotifications();
      setNotifs([]);
    } finally {
      setNotifActionLoading(false);
    }
  };

  const navToggleHandler = () => {
    dispatch({ type: actionType.COLLAPSE_MENU });
  };

  const headerToggleHandler = () => {
    dispatch({ type: actionType.COLLAPSE_HEADERMENU, collapseHeaderMenu: !collapseHeaderMenu });
  };

  return (
    <div className="pc-mob-header pc-header">
      <div className="pcm-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Brand: circular EPC icon + text to match large view */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '2px solid #ffffff',
            background: 'rgba(255,255,255,0.08)'
          }}
        >
          <EngineeringIcon sx={{ fontSize: '1.1rem', color: '#ffffff' }} />
        </span>
        <span
          style={{
            fontWeight: 900,
            fontSize: '1.1rem',
            letterSpacing: '0.3px',
            color: 'transparent',
            backgroundImage: 'linear-gradient(90deg, #ffffff, #e6e6e6)',
            backgroundSize: '200% auto',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          EPC Sync
        </span>
      </div>
      <div className="pcm-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="#" className="pc-head-link" id="mobile-collapse" onClick={navToggleHandler}>
          <div className="hamburger hamburger--arrowturn">
            <div className="hamburger-box">
              <div className="hamburger-inner" />
            </div>
          </div>
        </Link>
        {/* Notifications (mobile) */}
        <Dropdown
          align="end"
          show={notifOpen}
          onToggle={async (isOpen)=>{ setNotifOpen(isOpen); if (isOpen) { await refreshNotifications(); } }}
          popperConfig={{ strategy: 'fixed' }}
        >
          <Dropdown.Toggle as={Button} variant="link" className="pc-head-link p-0 position-relative" style={{ lineHeight: 0 }} onClick={()=> setNotifOpen(prev=>!prev)}>
            <FeatherIcon icon="bell" style={{ color: 'white' }} />
            {unreadCount > 0 && (
              <Badge bg="danger" pill style={{ position: 'absolute', top: -4, right: -4 }}>
                {unreadCount}
              </Badge>
            )}
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-end" style={{ minWidth: 360, zIndex: 2000 }} renderOnMount>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px' }}>
              <strong>Notifications</strong>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Button size="sm" variant="outline-secondary" onClick={onMarkAll} disabled={notifActionLoading || notifs.length===0}>Mark all read</Button>
                <Button size="sm" variant="outline-danger" onClick={onClearAll} disabled={notifActionLoading || notifs.length===0}>Clear all</Button>
                <button type="button" style={{ border:"2px solid", borderRadius: '50%', width: 24, height: 24 }} className="btn-close" aria-label="Close" onClick={()=>setNotifOpen(false)} />
              </div>
            </div>
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {notifLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                  <Spinner animation="border" size="sm" />
                </div>
              ) : (notifs && notifs.length > 0 ? (
                notifs.map(n => (
                  <div key={n.id} style={{ padding: '10px 12px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {!n.is_read && <span title="Unread" style={{ width: 8, height: 8, borderRadius: 8, background: '#0d6efd', display: 'inline-block' }} />}
                        <div style={{ fontWeight: 600 }}>{n.title}</div>
                      </div>
                      <small style={{ opacity: 0.7 }}>{new Date(n.created_at).toLocaleString()}</small>
                    </div>
                    <div style={{ marginTop: 6, whiteSpace: 'normal' }}>{n.message}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      {!n.is_read && (
                        <Button size="sm" variant="outline-primary" onClick={() => onMarkOne(n.id)} disabled={notifActionLoading}>Mark read</Button>
                      )}
                      <Button size="sm" variant="outline-danger" onClick={() => onDeleteOne(n.id)} disabled={notifActionLoading}>Delete</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: 16, textAlign: 'center', opacity: 0.8 }}>No notifications</div>
              ))}
            </div>
          </Dropdown.Menu>
        </Dropdown>
        {/* User menu (three dots) */}
        <Dropdown align="end">
          <Dropdown.Toggle as={Button} variant="link" className="pc-head-link p-0" style={{ lineHeight: 0 }}>
            <i className="material-icons-two-tone">more_vert</i>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-end" style={{ minWidth: 220 }}>
            <div style={{ padding: '8px 12px' }}>
              <div style={{ fontWeight: 600 }}>{user.full_name || 'User'}</div>
              {user.user_id && <small style={{ opacity: 0.8 }}>{user.user_id}</small>}
              <div style={{ marginTop: 6 }}>
                {user.is_admin ? (
                  <Badge bg="danger">Admin</Badge>
                ) : (
                  user.role ? <Badge bg="secondary" title={user.role}>{String(user.role).toUpperCase()}</Badge> : null
                )}
              </div>
            </div>
            {canAccessSiteExec && (
              <div className="px-4">
                <Button as={Link} to="/site-exec-sup" variant="primary" size="sm" className="w-100 rounded-3" style={{ color: '#fff' }}>
                  Supervisor View
                </Button>
              </div>
            )}
            <Dropdown.Divider />
            <div className="px-4 pb-2">
              <Button variant="danger" size="sm" className="w-100 rounded-3" onClick={logout}>Logout</Button>
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
}
