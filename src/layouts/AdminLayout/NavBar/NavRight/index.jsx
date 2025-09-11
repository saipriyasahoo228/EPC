import { useEffect, useState } from 'react';
import { ListGroup, Button, Modal, Badge } from 'react-bootstrap';
import { logout } from 'auth';
import LogoutRounded from '@mui/icons-material/LogoutRounded';

// -----------------------|| NAV RIGHT ||-----------------------//

export default function NavRight() {
  const [user, setUser] = useState({ full_name: '', role: '', user_id: '', is_admin: false });
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
          });
        } else {
          setUser({ full_name: 'Guest', role: '', user_id: '', is_admin: false });
        }
      } catch {
        setUser({ full_name: 'User', role: '', user_id: '', is_admin: false });
      }
    };
    readUser();
    window.addEventListener('userInfoUpdated', readUser);
    return () => window.removeEventListener('userInfoUpdated', readUser);
  }, []);

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
          <Button
            variant="danger"
            size="sm"
            onClick={()=>setShowConfirm(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, paddingInline: 10, borderRadius:100 }}
            title="Logout"
          >
            <LogoutRounded fontSize="small" sx={{ color: '#fff' }}/>
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
