import PropTypes from 'prop-types';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

// react-bootstrap
import { Card, ListGroup } from 'react-bootstrap';

// project imports
import NavGroup from './NavGroup';
import { ConfigContext } from 'contexts/ConfigContext';

// third party
import SimpleBar from 'simplebar-react';

// assets
import logo from 'assets/images/logo.svg';
import EngineeringIcon from '@mui/icons-material/Engineering';
// -----------------------|| NAV CONTENT ||-----------------------//

export default function NavContent({ navigation, activeNav }) {
  const configContext = useContext(ConfigContext);

  const { collapseLayout } = configContext.state;

  const navItems = navigation.map((item) => {
    let navItem = <></>;
    switch (item.type) {
      case 'group':
        if (activeNav) {
          navItem = (
            <div key={`nav-group-${item.id}`}>
              <NavGroup group={item} />
            </div>
          );
        } else {
          navItem = <NavGroup group={item} key={`nav-group-${item.id}`} />;
        }
        return navItem;
      default:
        return false;
    }
  });

  let navContentNode = (
    <SimpleBar style={{ height: 'calc(100vh - 70px)' }}>
      <ListGroup variant="flush" as="ul" bsPrefix=" " className="pc-navbar">
        {navItems}
      </ListGroup>
      <Card className="nav-action-card m-3">
        {/* <Card.Body>
          <h5 className="text-white">Upgrade To Pro</h5>
          <p className="text-white text-opacity-75">To get more features and components</p>
          <a href="https://codedthemes.com/item/dashboardkit-react-admin-template/" target="_blank" className="btn btn-primary">
            Buy Now
          </a>
        </Card.Body> */}
      </Card>
    </SimpleBar>
  );

  if (collapseLayout) {
    navContentNode = (
      <ListGroup variant="flush" as="ul" bsPrefix=" " className="pc-navbar">
        {navItems}
      </ListGroup>
    );
  }

  const mHeader = (
    <div className="m-header">
      <Link to="/dashboard" className="b-brand" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        {/* <img src={logo} alt="" className="logo logo-lg" /> */}
        {/* <i className="material-icons-two-tone" style={{ fontSize: '1.3rem', color: '#7267ef' }}>engineering</i> */}
        {/* <EngineeringIcon sx={{ fontSize: '1.5rem', color: '#ffffff' }} /> */}
        <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 28,
      height: 28,
      borderRadius: '50%',
      border: '2px solid #ffffff',
      background: 'rgba(255,255,255,0.08)',
    }}
  >
    <EngineeringIcon sx={{ fontSize: '1.1rem', color: '#ffffff' }} />
  </span>
        <span
          style={{
            fontWeight: 900,
            fontSize: '1.35rem',
            alignItems: 'center',
            justifyContent: 'center',
            // letterSpacing: '0.4px',
            color: 'white',
            backgroundImage: 'linear-gradient(90deg, #7267ef, #a174f8)',
            backgroundSize: '200% auto',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          EPC Sync
        </span>
      </Link>
    </div>
  );

  let mainContent;

  mainContent = (
    <>
      {mHeader}

      <div className="navbar-content next-scroll">{navContentNode}</div>
    </>
  );

  return <>{mainContent}</>;
}

NavContent.propTypes = { navigation: PropTypes.any, activeNav: PropTypes.any };
