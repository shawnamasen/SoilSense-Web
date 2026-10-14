import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import FormAlert from '../components/FormAlert';
import GoogleIcon from '../components/GoogleIcon';
import { useAuth } from '../context/AuthContext';
import { EMAIL_REGEX, normalizeEmail } from '../validation';
import { friendlyGoogleAuthError } from '../friendlyGoogleAuthError';
function friendlyLoginError(error) {
  const code = error?.code;
  if (code === 'auth/email-not-verified') return 'Please verify your email before signing in.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.';
  if (code === 'auth/admin-profile-missing' || code === 'auth/not-admin' || code === 'permission-denied' || code === 'firestore/permission-denied') {
    return 'Unauthorized. This account does not have administrator access.';
  }
  if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
    return 'Incorrect email or password.';
  }
  if (code === 'auth/network-request-failed') return 'Connection problem. Please try again.';
  return 'Sign-in is currently unavailable. Please try again later.';
}
export default function Login() {
  const {
    loginWithEmail,
    loginWithGoogle
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestedDestination = location.state?.from || '/admin/dashboard';
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const normalizedEmail = normalizeEmail(email);
    if (!EMAIL_REGEX.test(normalizedEmail) || !password) {
      setError('Enter a valid email address and password.');
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(normalizedEmail, password);
      navigate(requestedDestination, {
        replace: true
      });
    } catch (err) {
      setError(friendlyLoginError(err));
    } finally {
      setLoading(false);
    }
  }
  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate(requestedDestination, {
        replace: true
      });
    } catch (err) {
      setError(friendlyGoogleAuthError(err));
    } finally {
      setLoading(false);
    }
  }
  return <AuthShell variant="login" title="Welcome back" subtitle={<>Authorized staff sign in to the <strong>SoilSense Admin Portal</strong></>}>
      <FormAlert>{error}</FormAlert>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label>
          <span className="form-label">Email address</span>
          <span className="form-control-wrap">
            <Mail className="form-control-icon" />
            <input type="email" inputMode="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value.toLowerCase().replace(/\s/g, ''))} maxLength={100} disabled={loading} className="form-control form-control-with-icon" placeholder="Enter your email" required />
          </span>
        </label>

        <label>
          <span className="form-label">Password</span>
          <span className="form-control-wrap">
            <Lock className="form-control-icon" />
            <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value.slice(0, 128))} disabled={loading} className="form-control form-control-with-icon form-control-with-action" placeholder="Enter your password" required />
            <button type="button" onClick={() => setShowPassword(current => !current)} className="input-action" aria-label={showPassword ? 'Hide password' : 'Show password'} disabled={loading}>
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </span>
        </label>

        <div className="auth-forgot-row">
          <Link className="auth-link" to="/forgot-password">Forgot password?</Link>
        </div>

        <button type="submit" disabled={loading} className="primary-button">
          <LogIn /> {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="auth-divider">or continue with</div>

      <button type="button" onClick={handleGoogle} disabled={loading} className="google-button">
        <GoogleIcon /> Continue with Google
      </button>

      <p className="auth-switch-text">
        New administrator? <Link className="auth-link" to="/signup">Create an account</Link>. Signup does not grant dashboard access until an existing administrator authorizes the account.
      </p>
    </AuthShell>;
}
