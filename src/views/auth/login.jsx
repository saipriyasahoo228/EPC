// import { useState } from 'react';
// import { useNavigate, NavLink } from 'react-router-dom';
// import { Card, Button, Form, InputGroup } from 'react-bootstrap';
// import FeatherIcon from 'feather-icons-react';
// import epcbackground1 from '../../assets/images/user/epcbackground1.jpg';

// export default function SignIn1() {
//   const navigate = useNavigate();
//   const [userId, setUserId] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleLogin = () => {
//     if (userId === 'admin' && password === 'admin123') {
//       navigate('/dashboard');
//     } else {
//       setError('Invalid user ID or password');
//     }
//   };

//   return (
//     <div
//       className="auth-wrapper"
//       style={{
//         backgroundImage: `url(${epcbackground1})`,
//         backgroundSize: 'cover',
//         backgroundRepeat: 'no-repeat',
//         backgroundPosition: 'center',
//         minHeight: '100vh',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: '1rem',
//       }}
//     >
//       <Card
//         style={{
//           maxWidth: '420px',
//           width: '100%',
//           borderRadius: '1rem',
//           boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
//           background: '#fff',
//         }}
//       >
//         <Card.Body className="p-4">
//           <div className="text-center mb-4">
//             <h4
//               className="mt-3"
//               style={{
//                 background: 'linear-gradient(90deg, #b388eb, #7267ef, #a174f8)',
//                 backgroundSize: '200% auto',
//                 color: 'transparent',
//                 backgroundClip: 'text',
//                 WebkitBackgroundClip: 'text',
//                 fontWeight: 700,
//                 animation: 'shimmer 2.5s linear infinite',
//               }}
//             >
//               WELCOME TO EPC HUB
//             </h4>
//             <p
//               style={{
//                 background: 'linear-gradient(90deg, #d1b3ff, #b388eb, #e0c3fc)',
//                 backgroundSize: '200% auto',
//                 color: 'transparent',
//                 backgroundClip: 'text',
//                 WebkitBackgroundClip: 'text',
//                 fontWeight: 500,
//                 fontSize: '0.95rem',
//                 animation: 'shimmer 3s linear infinite',
//               }}
//             >
//               Engineering, Procurement & Construction
//             </p>
//           </div>

//           <InputGroup className="mb-3">
//             <InputGroup.Text style={{ backgroundColor: '#f4f1fa' }}>
//               <FeatherIcon icon="user" />
//             </InputGroup.Text>
//             <Form.Control
//               type="text"
//               placeholder="User ID"
//               value={userId}
//               onChange={(e) => setUserId(e.target.value)}
//             />
//           </InputGroup>

//           <InputGroup className="mb-3">
//             <InputGroup.Text style={{ backgroundColor: '#f4f1fa' }}>
//               <FeatherIcon icon="lock" />
//             </InputGroup.Text>
//             <Form.Control
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </InputGroup>

//           {error && (
//             <p className="text-danger text-center mb-2" style={{ fontSize: '0.9rem' }}>
//               {error}
//             </p>
//           )}

//           <Form.Group className="d-flex justify-content-between align-items-center mb-3">
//             <Form.Check type="checkbox" label="Remember me" defaultChecked />
//             <NavLink to="#" className="text-muted small">
//               Forgot Password?
//             </NavLink>
//           </Form.Group>

//           <Button
//             className="w-100 mb-3"
//             style={{
//               background: '#7267ef',
//               border: 'none',
//               padding: '0.6rem',
//               fontWeight: 600,
//               transition: '0.3s',
//             }}
//             onClick={handleLogin}
//           >
//             Sign In
//           </Button>
//         </Card.Body>
//       </Card>

//       {/* shimmer animation keyframes */}
//       <style>{`
//         @keyframes shimmer {
//           0% {
//             background-position: 200% center;
//           }
//           100% {
//             background-position: -200% center;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }












import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, Button, Form, InputGroup } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import epcbackground1 from '../../assets/images/user/epcbackground1.jpg';
import { login } from '../../auth'; // Adjust path as needed
import { setUserInfo, setRole } from '../../store'; // Adjust path as needed

export default function SignIn1() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      const { user } = await login(mobileNumber, password);
      dispatch(setUserInfo(user));
      dispatch(setRole(user.isadmin));
      navigate('/dashboard'); // or your main page
    } catch (err) {
      setError('Invalid mobile number or password.');
    }
  };

  return (
    <div
      className="auth-wrapper"
      style={{
        backgroundImage: `url(${epcbackground1})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <Card
        style={{
          maxWidth: '420px',
          width: '100%',
          borderRadius: '1rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          background: '#fff',
        }}
      >
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <h4
              className="mt-3"
              style={{
                background: 'linear-gradient(90deg, #b388eb, #7267ef, #a174f8)',
                backgroundSize: '200% auto',
                color: 'transparent',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                fontWeight: 700,
                animation: 'shimmer 2.5s linear infinite',
              }}
            >
              WELCOME TO EPC HUB
            </h4>
            <p
              style={{
                background: 'linear-gradient(90deg, #d1b3ff, #b388eb, #e0c3fc)',
                backgroundSize: '200% auto',
                color: 'transparent',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                fontWeight: 500,
                fontSize: '0.95rem',
                animation: 'shimmer 3s linear infinite',
              }}
            >
              Engineering, Procurement & Construction
            </p>
          </div>

          <InputGroup className="mb-3">
            <InputGroup.Text style={{ backgroundColor: '#f4f1fa' }}>
              <FeatherIcon icon="phone" />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Mobile Number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text style={{ backgroundColor: '#f4f1fa' }}>
              <FeatherIcon icon="lock" />
            </InputGroup.Text>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>

          {error && (
            <p className="text-danger text-center mb-2" style={{ fontSize: '0.9rem' }}>
              {error}
            </p>
          )}

          <Form.Group className="d-flex justify-content-between align-items-center mb-3">
            <Form.Check type="checkbox" label="Remember me" defaultChecked />
            <NavLink to="#" className="text-muted small">
              Forgot Password?
            </NavLink>
          </Form.Group>

          <Button
            className="w-100 mb-3"
            style={{
              background: '#7267ef',
              border: 'none',
              padding: '0.6rem',
              fontWeight: 600,
              transition: '0.3s',
            }}
            onClick={handleLogin}
          >
            Sign In
          </Button>
        </Card.Body>
      </Card>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </div>
  );
}
