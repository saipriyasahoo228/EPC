// // third party
// import { createRoot } from 'react-dom/client';
// import { ConfigProvider } from './contexts/ConfigContext';

// // project imports
// import App from './App';
// import reportWebVitals from './reportWebVitals';

// // style + assets
// import './index.scss';

// // -----------------------|| REACT DOM RENDER  ||-----------------------//

// const container = document.getElementById('root');
// const root = createRoot(container);
// root.render(
//   <ConfigProvider>
//     <App />
//   </ConfigProvider>
// );

// reportWebVitals();



// third party
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ConfigProvider } from './contexts/ConfigContext';

// project imports
import App from './App';
import store from './store'; // ✅ Make sure this path is correct
import reportWebVitals from './reportWebVitals';

// style + assets
import './index.scss';

// -----------------------|| REACT DOM RENDER ||-----------------------//

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </Provider>
);

reportWebVitals();
