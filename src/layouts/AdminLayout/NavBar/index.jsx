import { useContext } from 'react';

// project imports
import NavRight from './NavRight';
import { ConfigContext } from 'contexts/ConfigContext';

// -----------------------|| NAV BAR ||-----------------------//

export default function NavBar() {
  const configContext = useContext(ConfigContext);
  const { headerBackColor } = configContext.state;

  let headerClass = ['pc-header', headerBackColor];

  let navBar = (
    <>
      <div className="header-wrapper" style={{ paddingInline: 12 }}>
        <div className="ms-auto" style={{ marginLeft: 'auto' }}>
          <NavRight />
        </div>
      </div>
    </>
  );

  return <header className={headerClass.join(' ')}>{navBar}</header>;
}
