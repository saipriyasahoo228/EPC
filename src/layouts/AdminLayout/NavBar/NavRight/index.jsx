import { useEffect, useState } from 'react';
import { ListGroup, Button, Modal, Badge } from 'react-bootstrap';
import { logout } from 'auth';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import { Link } from 'react-router-dom';

// -----------------------|| NAV RIGHT ||-----------------------//

export default function NavRight() {
  const [user, setUser] = useState({ full_name: '', role: '', user_id: '', is_admin: false, groups: [] });
  const [showConfirm, setShowConfirm] = useState(false);

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

  return (
    <>
      <ListGroup as="ul" bsPrefix=" " className="list-unstyled" style={{ marginBottom: 0 }}>
        <ListGroup.Item
          as="li"
          bsPrefix=" "
          className="pc-h-item"
          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 14px' }}
        >
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
