import { useContext } from 'react';

// project imports
import NavRight from './NavRight';
import { ConfigContext } from 'contexts/ConfigContext';
import FeatherIcon from 'feather-icons-react';
import useWindowSize from 'hooks/useWindowSize';
import * as actionType from 'store/actions';

// -----------------------|| NAV BAR ||-----------------------//

export default function NavBar() {
  const configContext = useContext(ConfigContext);
  const { headerBackColor } = configContext.state;
  const { dispatch } = configContext;
  const windowSize = useWindowSize();

  const toggleSidebar = () => {
    // Only toggle for desktop views
    if (windowSize.width > 1024) {
      dispatch({ type: actionType.COLLAPSE_MENU });
    }
  };

  let headerClass = ['pc-header', headerBackColor];

  let navBar = (
    <>
      <div className="header-wrapper" style={{ paddingInline: 12, display: 'flex', alignItems: 'center' }}>
        {/* Desktop-only sidebar toggle */}
        {windowSize.width > 1024 && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="btn btn-link p-0 me-3"
            title="Toggle sidebar"
            aria-label="Toggle sidebar"
            style={{ lineHeight: 0 }}
          >
            <FeatherIcon icon="menu" />
          </button>
        )}
        <div className="ms-auto" style={{ marginLeft: 'auto' }}>
          <NavRight />
        </div>
      </div>
    </>
  );

  return <header className={headerClass.join(' ')}>{navBar}</header>;
}
