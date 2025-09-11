import { useContext, useEffect, useState } from 'react';

// third party
import { Link } from 'react-router-dom';
import { Dropdown, Badge, Button } from 'react-bootstrap';

// project imports
import { ConfigContext } from 'contexts/ConfigContext';
import * as actionType from 'store/actions';
import { logout } from 'auth';

// assets
import logo from 'assets/images/logo.svg';

// -----------------------|| MOBILE HEADER ||-----------------------//

export default function MobileHeader() {
  const configContext = useContext(ConfigContext);
  const { collapseHeaderMenu } = configContext.state;
  const { dispatch } = configContext;

  const [user, setUser] = useState({ full_name: '', role: '', user_id: '', is_admin: false });
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

  const navToggleHandler = () => {
    dispatch({ type: actionType.COLLAPSE_MENU });
  };

  const headerToggleHandler = () => {
    dispatch({ type: actionType.COLLAPSE_HEADERMENU, collapseHeaderMenu: !collapseHeaderMenu });
  };

  return (
    <div className="pc-mob-header pc-header">
      <div className="pcm-logo">
        <img src={logo} alt="" className="logo logo-lg" />
      </div>
      <div className="pcm-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link to="#" className="pc-head-link" id="mobile-collapse" onClick={navToggleHandler}>
          <div className="hamburger hamburger--arrowturn">
            <div className="hamburger-box">
              <div className="hamburger-inner" />
            </div>
          </div>
        </Link>
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
