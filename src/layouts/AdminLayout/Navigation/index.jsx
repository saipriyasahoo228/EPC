import { useContext, useMemo } from 'react';

// project imports
import NavContent from './NavContent';
import { ConfigContext } from 'contexts/ConfigContext';
import useWindowSize from 'hooks/useWindowSize';
import navigation from 'menu-items';
import navitemcollapse from 'menu-items-collapse';
import * as actionType from 'store/actions';
import { usePermissions } from 'contexts/PermissionsContext';

// assets
import avatar2 from 'assets/images/user/avatar-2.jpg';

// -----------------------|| NAVIGATION ||-----------------------//

export default function Navigation() {
  const configContext = useContext(ConfigContext);
  const { collapseMenu, collapseLayout } = configContext.state;
  const windowSize = useWindowSize();
  const { dispatch } = configContext;
  const { can, user } = usePermissions();

  const navToggleHandler = () => {
    dispatch({ type: actionType.COLLAPSE_MENU });
  };

  // Build classes as an array to avoid spreading strings into individual character class names
  let navClass = ['dark-sidebar'];

  // Map top-level group IDs to backend module slugs
  // Update this mapping if you change group IDs in menu-items.js
  const groupIdToSlug = {
    navigation: null, // keep dashboard always visible
    tender: 'tender_allocation',
    engineering: 'engineering',
    procurment: 'procurement',
    inventry: 'inventory',
    construction: 'construction',
    commission: 'commissioning',
    maintenance: 'maintenance',
    account: 'account_ledger',
    accesscontrol: null, // accesscontrol: no slug gating; use is_admin instead
  };

  const rawItems = collapseLayout ? navitemcollapse.items : navigation.items;

  const filteredItems = useMemo(() => {
    // Filter out entire groups the user cannot read
    return rawItems.filter((group) => {
      if (group.id === 'accesscontrol') {
        // Show Access Control group only to admins
        return Boolean(user?.is_admin);
      }
      const slug = groupIdToSlug[group.id];
      if (!slug) return true; // groups without a slug are not permission-gated
      return can(slug, 'can_read');
    });
  }, [rawItems, can, user?.is_admin]);

  let navContent = <NavContent navigation={filteredItems} />;
  navClass = [...navClass, 'pc-sidebar'];
  if (windowSize.width <= 1024 && collapseMenu) {
    navClass = [...navClass, 'mob-sidebar-active'];
  } else if (collapseMenu) {
    navClass = [...navClass, 'navbar-collapsed'];
  }

  let navBarClass = ['navbar-wrapper'];

  let mobileOverlay = <></>;
  if (windowSize.width <= 1024 && collapseMenu) {
    mobileOverlay = <div className="pc-menu-overlay" onClick={navToggleHandler} aria-hidden="true" />;
  }

  let navContentDOM = <div className={navBarClass.join(' ')}>{navContent}</div>;

  return (
    <nav className={navClass.join(' ')}>
      {navContentDOM}
      {mobileOverlay}
    </nav>
  );
}
