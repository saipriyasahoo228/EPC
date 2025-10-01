// import { useState } from 'react';
// import { useNavigate, NavLink } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import { Card, Button, Form, InputGroup } from 'react-bootstrap';
// import FeatherIcon from 'feather-icons-react';
// import epcbackground1 from '../../assets/images/user/epcbackground1.jpg';
// import { login } from '../../auth'; // Adjust path as needed
// import { setUserInfo, setRole } from '../../store'; // Adjust path as needed

// export default function SignIn1() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const [mobileNumber, setMobileNumber] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleLogin = async () => {
//     setError('');
//     try {
//       const { user } = await login(mobileNumber, password);
//       dispatch(setUserInfo(user));
//       dispatch(setRole(user.isadmin));
//       alert('Login successful!');
//       navigate('/dashboard'); // or your main page
//     } catch (err) {
//       setError('Invalid mobile number or password.');
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
//               WELCOME TO EPC SYNC
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
//               <FeatherIcon icon="phone" />
//             </InputGroup.Text>
//             <Form.Control
//               type="text"
//               placeholder="Mobile Number"
//               value={mobileNumber}
//               onChange={(e) => setMobileNumber(e.target.value)}
//               required
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
//               required
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

//       <style>{`
//         @keyframes shimmer {
//           0% { background-position: 200% center; }
//           100% { background-position: -200% center; }
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
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ credential: false, password: false });
  const [errors, setErrors] = useState({ credential: '', password: '' });

  const validate = () => {
    const newErrors = { credential: '', password: '' };
    const mobileOnly = mobileNumber.replace(/\D/g, '');
    if (!mobileOnly) {
      newErrors.credential = 'Mobile number is required.';
    } else if (!/^\d{10}$/.test(mobileOnly)) {
      newErrors.credential = 'Enter a valid 10-digit mobile number.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleLogin = async () => {
    setError('');
    setTouched({ credential: true, password: true });
    const v = validate();
    if (v.credential || v.password) {
      return;
    }
    setLoading(true);
    try {
      const { user } = await login(mobileNumber, password);
      dispatch(setUserInfo(user));
      dispatch(setRole(user.isadmin));
      alert('Login successful!');
      navigate('/dashboard'); // Navigate after login
    } catch (err) {
      setError('Invalid mobile number or password.');
    } finally {
      setLoading(false);
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
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'saturate(120%) blur(6px)'
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
              WELCOME TO EPC SYNC
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

          <Form.Group className="mb-3">
            <Form.Label className="mb-1 fw-semibold text-muted">Mobile Number (10 digits)</Form.Label>
            <InputGroup className="minimal-input">
              <InputGroup.Text style={{ backgroundColor: 'transparent', borderRight: 'none', borderColor: 'rgba(0,0,0,0.08)', color: '#8a8f98' }}>
                <FeatherIcon icon="phone" size={18} />
              </InputGroup.Text>
              <Form.Control
                type="tel"
                inputMode="numeric"
                pattern="\d{10}"
                maxLength={10}
                placeholder="Enter your 10-digit mobile number"
                value={mobileNumber}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setMobileNumber(digits);
                }}
                onBlur={() => { setTouched((t) => ({ ...t, credential: true })); validate(); }}
                isInvalid={touched.credential && !!errors.credential}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.credential}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="mb-1 fw-semibold text-muted">Password</Form.Label>
            <InputGroup className="minimal-input">
              <InputGroup.Text style={{ backgroundColor: 'transparent', borderRight: 'none', borderColor: 'rgba(0,0,0,0.08)', color: '#8a8f98' }}>
                <FeatherIcon icon="lock" size={18} />
              </InputGroup.Text>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => { setTouched((t) => ({ ...t, password: true })); validate(); }}
                isInvalid={touched.password && !!errors.password}
                required
              />
              <Button
                variant="light"
                onClick={() => setShowPassword((s) => !s)}
                style={{
                  background: 'transparent',
                  borderLeft: 'none',
                  borderColor: 'rgba(0,0,0,0.08)',
                  color: '#6b7280',
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  boxShadow: 'none'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                <FeatherIcon icon={showPassword ? 'eye-off' : 'eye'} size={18} />
              </Button>
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          {error && (
            <p className="text-danger text-center mb-2" style={{ fontSize: '0.9rem' }}>
              {error}
            </p>
          )}

          <Form.Group className="d-flex justify-content-between align-items-center mb-3">
            {/* <Form.Check
              type="checkbox"
              label="Remember me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            /> */}
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
              transition: 'transform 0.15s ease, box-shadow 0.2s ease, background-color 0.2s ease',
              opacity: loading ? 0.8 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <span>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </Card.Body>
      </Card>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .auth-wrapper .form-control,
        .auth-wrapper .input-group-text {
          transition: box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
        }
        .auth-wrapper .form-control:focus {
          box-shadow: 0 0 0 0.2rem rgba(114,103,239,0.15);
          border-color: #7267ef;
        }
        .auth-wrapper .minimal-input .input-group-text {
          background: transparent;
          border-right: none;
          color: #8a8f98;
        }
        .auth-wrapper .minimal-input .form-control {
          border-left: none;
          border-color: rgba(0,0,0,0.08);
        }
        .auth-wrapper .minimal-input .form-control:focus {
          border-left: none;
        }
        .auth-wrapper .minimal-input .btn {
          border-color: rgba(0,0,0,0.08);
        }
        .auth-wrapper .btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(114,103,239,0.25);
          background-color: #5f56e6 !important;
        }
        .auth-wrapper .btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 6px 12px rgba(114,103,239,0.2);
        }
        @media (max-width: 480px) {
          .auth-wrapper .card-body { padding: 1.25rem !important; }
        }
      `}</style>
    </div>
  );
}
