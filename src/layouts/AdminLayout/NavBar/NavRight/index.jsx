import { useEffect, useState } from 'react';
import { ListGroup, Button, Modal, Badge, Dropdown, Spinner } from 'react-bootstrap';
import { logout } from 'auth';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import { Link } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import {
  getNotifications,
  markNotificationRead,
  deleteNotification,
  markAllNotificationsRead,
  clearAllNotifications
} from 'allapi/notification';

// -----------------------|| NAV RIGHT ||-----------------------//

export default function NavRight() {
  const [user, setUser] = useState({ full_name: '', role: '', user_id: '', is_admin: false, groups: [] });
  const [showConfirm, setShowConfirm] = useState(false);
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

  // Notifications: fetch on mount and on demand
  const refreshNotifications = async () => {
    try {
      setNotifLoading(true);
      const data = await getNotifications();
      setNotifs(Array.isArray(data) ? data : []);
    } catch (e) {
      // Optionally toast
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    refreshNotifications();
    // Optional: polling
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

  return (
    <>
      <ListGroup as="ul" bsPrefix=" " className="list-unstyled" style={{ marginBottom: 0 }}>
        <ListGroup.Item
          as="li"
          bsPrefix=" "
          className="pc-h-item"
          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 14px' }}
        >
          {/* Notifications */}
          <Dropdown
            align="end"
            show={notifOpen}
            onToggle={async (isOpen)=>{ setNotifOpen(isOpen); if (isOpen) { await refreshNotifications(); } }}
            popperConfig={{ strategy: 'fixed' }}
          >
            <Dropdown.Toggle
              variant="light"
              id="notif-toggle"
              className="position-relative"
              style={{ border: 'none', background: 'transparent', padding: 6 }}
              onClick={()=> setNotifOpen(prev=>!prev)}
            >
              <FeatherIcon icon="bell" />
              {unreadCount > 0 && (
                <Badge bg="danger" pill style={{ position: 'absolute', top: -2, right: -2 }}>
                  {unreadCount}
                </Badge>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ minWidth: 360, zIndex: 2000 }} renderOnMount>
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
                        <small style={{ opacity: 0.7 }}>{new Date(n.created_at).toLocaleString("en-IN")}</small>
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

          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontWeight: 600 }}>{user.full_name || 'User'}</span>
            <small style={{ opacity: 0.8 }}>{user.user_id || ''}</small>
          </div>
          <div>
            {user.is_admin ? (
              <Badge bg="danger">Admin</Badge>
            ) : (
              (user.role && <Badge bg="secondary" title={user.role}>{String(user.role).toUpperCase()}</Badge>)
            )}
          </div>
          {canAccessSiteExec && (
            <Link to="/site-exec-sup" className="btn btn-outline-primary btn-sm" style={{ marginLeft: 8 }}>
              Supervisor View
            </Link>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={()=>setShowConfirm(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, paddingInline: 10 }}
            title="Logout"
          >
            <LogoutRounded fontSize="small" />
            Logout
          </Button>
        </ListGroup.Item>
      </ListGroup>

      <Modal show={showConfirm} onHide={()=>setShowConfirm(false)} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title as="h6">Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to logout?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={()=>setShowConfirm(false)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={logout}>Logout</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
