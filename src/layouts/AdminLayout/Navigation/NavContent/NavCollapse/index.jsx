import PropTypes from 'prop-types';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';

// react-bootstrap
import { ListGroup } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';

// project imports
import NavItem from '../NavItem';
import LoopNavCollapse from './index';
import NavIcon from '../NavIcon';
import { ConfigContext } from 'contexts/ConfigContext';
import * as actionType from 'store/actions';
import useWindowSize from 'hooks/useWindowSize';

// -----------------------|| NAV COLLAPSE ||-----------------------//

export default function NavCollapse({ collapse, type }) {
  const configContext = useContext(ConfigContext);
  const { dispatch } = configContext;
  const windowSize = useWindowSize();
  /* eslint-disable @typescript-eslint/no-unused-vars */
  // @ts-ignore
  const location = useLocation();

  const { isOpen, isTrigger, collapseLayout, collapseMenu } = configContext.state;
  const [showFlyout, setShowFlyout] = useState(false);
  const linkRef = useRef(null);
  const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });
  const flyoutRef = useRef(null);

  const recalcPosition = () => {
    if (linkRef.current) {
      const r = linkRef.current.getBoundingClientRect();
      const margin = 8;
      // Prefer aligning to the sidebar's right edge to avoid per-icon variance
      const sidebarEl = document.querySelector('.pc-sidebar');
      const s = sidebarEl ? sidebarEl.getBoundingClientRect() : null;
      const gap = 6; // small visual gap from the rail
      // Estimate flyout width (use measured width if open, otherwise fallback)
      const estimatedWidth = (flyoutRef.current && flyoutRef.current.offsetWidth) || 220;
      let left = Math.round((s ? s.right : r.right) + gap);
      // Clamp so the flyout never overflows the viewport horizontally
      left = Math.min(left, window.innerWidth - estimatedWidth - margin);

      // Vertical placement: align to icon top, clamped to viewport; final clamp after mount exists below
      const estHeight = (flyoutRef.current && flyoutRef.current.offsetHeight) || 300;
      const top = Math.max(margin, Math.min(Math.round(r.top), window.innerHeight - estHeight - margin));
      setFlyoutPos({ top, left });
    }
  };

  useEffect(() => {
    const currentIndex = document.location.pathname
      .toString()
      .split('/')
      .findIndex((id) => id === collapse.id);
    if (currentIndex > -1) {
      dispatch({ type: actionType.COLLAPSE_TOGGLE, menu: { id: collapse.id, type: type } });
    }
  }, [collapse, dispatch, type]);

  let navItems;
  if (collapse.children) {
    const collapses = collapse.children;
    navItems = Object.keys(collapses).map((item) => {
      item = collapses[item];
      switch (item.type) {
        case 'collapse':
          return <LoopNavCollapse key={item.id} collapse={item} type="sub" />;
        case 'item':
          return <NavItem key={item.id} item={item} />;
        default:
          return false;
      }
    });
  }

  let itemTitle = collapse.title;
  if (collapse.icon) {
    itemTitle = <span className="pc-mtext">{collapse.title}</span>;
  }

  let navLinkClass = ['pc-link'];

  let navItemClass = ['pc-item', 'pc-hasmenu'];
  const openIndex = isOpen.findIndex((id) => id === collapse.id);
  if (openIndex > -1) {
    navItemClass = [...navItemClass, 'active'];
    navLinkClass = [...navLinkClass, 'active'];
  }

  const triggerIndex = isTrigger.findIndex((id) => id === collapse.id);
  if (triggerIndex > -1) {
    navItemClass = [...navItemClass, 'pc-trigger'];
  }

  const currentIndex = document.location.pathname
    .toString()
    .split('/')
    .findIndex((id) => id === collapse.id);
  if (currentIndex > -1) {
    navItemClass = [...navItemClass, 'active'];
    navLinkClass = [...navLinkClass, 'active'];
  }

  const isCollapsed = windowSize.width >= 992 && !!collapseMenu;

  const handleClick = (e) => {
    if (isCollapsed) {
      e.preventDefault();
      if (showFlyout) {
        setShowFlyout(false);
      } else {
        // compute position and open
        requestAnimationFrame(() => {
          recalcPosition();
          setShowFlyout(true);
        });
      }
    } else {
      e.preventDefault();
      dispatch({ type: actionType.COLLAPSE_TOGGLE, menu: { id: collapse.id, type } });
    }
  };

  const subContent = (
    <>
      <Link
        to="#"
        ref={linkRef}
        className={navLinkClass.join(' ')}
        onClick={handleClick}
        title={isCollapsed ? collapse.title : undefined}
        aria-label={isCollapsed ? collapse.title : undefined}
      >
        <NavIcon items={collapse} />
        {itemTitle}
        <span className="pc-arrow">
          <FeatherIcon icon="chevron-right" />
        </span>
      </Link>
      {/* Inline submenu when not collapsed; Flyout popover when collapsed on desktop */}
      {!isCollapsed && (
        <ul className="pc-submenu">{navItems}</ul>
      )}
      {isCollapsed && showFlyout && createPortal(
        (
          <div
            role="tooltip"
            id={`popover-${collapse.id}`}
            ref={flyoutRef}
            className="epc-flyout"
            style={{
              position: 'fixed',
              top: flyoutPos.top,
              left: flyoutPos.left,
              transform: 'translate(0, 0)',
              minWidth: 220,
              maxHeight: `calc(100vh - 16px)`,
              overflowY: 'auto',
              borderRadius: 12,
              // border: '1.5px solid rgba(0,0,0,0.08)',
              // boxShadow: '0 20px 30px rgba(0,0,0,.18), 0 20px 20px rgba(0,0,0,.06)',
              // background: '#ffffff',
              // background: 'var(--pc-sidebar-background)',
              background: 'transparent',
              // background: 'rgba(0,0,0,0.8)',
              color: 'var(--pc-sidebar-color, #1f2937)',
              fontWeight: '600',
              zIndex: 3000,
              backdropFilter: 'saturate(180%) blur(6px)',
            }}
          >
            {/* pointer triangle */}
            <div
              style={{
                position: 'absolute',
                left: -6,
                top: 12,
                width: 0,
                height: 0,
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderRight: '6px solid #ffffff',
                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.08))',

              }}
            />
            {/* header */}
            <div
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 1,
                padding: '10px 12px',
                // borderBottom: '4px solid var(--bs-body-bg)',
                // background: '#ffffff',
                background: 'var(--pc-sidebar-background)',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                
              }}
            >
              <strong style={{ fontSize: 13, fontWeight: 'bold' }}>{collapse.title}</strong>
              <span style={{ fontSize: 11, opacity: 0.7 }}>Menu</span>
            </div>
            {/* content */}
            <div style={{ padding: '8px 10px 10px' }}>
              <ListGroup
                variant="flush"
                as="ul"
                className="pc-submenu"
                bsPrefix=" "
                style={{
                  // borderRadius: 10,
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                  background: 'var(--pc-sidebar-background)',
                  // background: 'rgba(28,35,47,0.9)',
                  paddingTop:20,
                  paddingBottom:20,
                  backdropFilter: 'saturate(180%) blur(1px)',
                 
                  
                }}
              >
                {navItems}
              </ListGroup>
            </div>
          </div>
        ),
        document.body
      )}
    </>
  );

  let mainContent;

  mainContent = (
    <ListGroup.Item as="li" bsPrefix=" " className={navItemClass.join(' ')}>
      {subContent}
    </ListGroup.Item>
  );

  // Close on outside click & Escape, and keep aligned on scroll/resize
  useEffect(() => {
    if (!showFlyout) return;
    const onDocClick = (e) => {
      if (flyoutRef.current && flyoutRef.current.contains(e.target)) return;
      if (linkRef.current && linkRef.current.contains(e.target)) return;
      setShowFlyout(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setShowFlyout(false);
    };
    const onScrollOrResize = () => recalcPosition();
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    // After mount, measure flyout height and clamp if needed
    const afterMount = setTimeout(() => {
      if (flyoutRef.current) {
        const f = flyoutRef.current.getBoundingClientRect();
        const margin = 8;
        const newTop = Math.max(margin, Math.min(flyoutPos.top, window.innerHeight - f.height - margin));
        if (newTop !== flyoutPos.top) setFlyoutPos((p) => ({ ...p, top: newTop }));
      }
    }, 0);

    return () => {
      clearTimeout(afterMount);
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      document.removeEventListener('keydown', onKey);
    };
  }, [showFlyout, flyoutPos.top]);

  return <>{mainContent}</>;
}

NavCollapse.propTypes = { collapse: PropTypes.object, type: PropTypes.string };
