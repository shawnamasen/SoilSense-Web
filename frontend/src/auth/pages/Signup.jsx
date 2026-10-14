import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Eye, EyeOff, Lock, Mail, User, UserPlus } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import FormAlert from '../components/FormAlert';
import GoogleIcon from '../components/GoogleIcon';
import { useAuth } from '../context/AuthContext';
import { EMAIL_REGEX, normalizeEmail, validatePassword } from '../validation';
import { friendlyGoogleAuthError } from '../friendlyGoogleAuthError';
const NAME_PART_REGEX = /^[A-Za-z][A-Za-z '\-]{0,29}$/;
function friendlySignupError(error) {
  if (error?.code === 'auth/email-already-in-use') return 'This email is already registered. Try signing in.';
  if (error?.code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.';
  if (error?.code === 'auth/verification-send-failed') return 'Account created, but we could not send a verification email. Please contact an administrator.';
  if (error?.code === 'auth/weak-password') return 'Please choose a stronger password.';
  if (error?.code === 'auth/network-request-failed') return 'Connection problem. Please try again.';
  return 'Unable to create the account. Please try again later.';
}
export default function Signup() {
  const {
    signup,
    loginWithGoogle
  } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const passwordRules = useMemo(() => [{
    label: 'At least 8 characters',
    valid: form.password.length >= 8
  }, {
    label: 'Contains uppercase and lowercase letters',
    valid: /[A-Z]/.test(form.password) && /[a-z]/.test(form.password)
  }, {
    label: 'Contains a number',
    valid: /\d/.test(form.password)
  }, {
    label: 'Contains a special character',
    valid: /[@$!%*?&#^()_\-+=]/.test(form.password)
  }], [form.password]);
  function update(field, value) {
    setForm(current => ({
      ...current,
      [field]: value
    }));
  }
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const name = `${firstName} ${lastName}`.trim().replace(/\s+/g, ' ');
    const email = normalizeEmail(form.email);
    const passwordError = validatePassword(form.password);
    if (!NAME_PART_REGEX.test(firstName)) {
      setError('Enter a valid first name.');
      return;
    }
    if (!NAME_PART_REGEX.test(lastName)) {
      setError('Enter a valid last name.');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError('Use a valid @gmail.com, @phinmaed.com, or authorized @soilsense.com email address.');
      return;
    }
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setLoading(true);
    try {
      const registered = await signup({
        name,
        email,
        password: form.password
      });
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      });
      setSuccess('Registration successful! Please verify your email address and contact the SoilSense administrator for account approval.');
    } catch (err) {
      setError(friendlySignupError(err));
    } finally {
      setLoading(false);
    }
  }
  async function handleGoogle() {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/admin/dashboard', {
        replace: true
      });
    } catch (err) {
      setError(friendlyGoogleAuthError(err));
    } finally {
      setLoading(false);
    }
  }
  return <AuthShell variant="signup" title="Request admin access" subtitle={<>Create a <strong>SoilSense admin sign-in</strong>. Registration alone does not grant administrator access.</>}>
      <FormAlert>{error}</FormAlert>
      <FormAlert type="success">{success}</FormAlert>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-name-grid">
          <label>
            <span className="form-label">First name</span>
            <span className="form-control-wrap">
              <User className="form-control-icon" />
              <input value={form.firstName} onChange={event => update('firstName', event.target.value.replace(/[^A-Za-z '\-]/g, '').slice(0, 30))} autoComplete="given-name" className="form-control form-control-with-icon" placeholder="Enter first name" disabled={loading} required />
            </span>
          </label>

          <label>
            <span className="form-label">Last name</span>
            <span className="form-control-wrap">
              <User className="form-control-icon" />
              <input value={form.lastName} onChange={event => update('lastName', event.target.value.replace(/[^A-Za-z '\-]/g, '').slice(0, 30))} autoComplete="family-name" className="form-control form-control-with-icon" placeholder="Enter last name" disabled={loading} required />
            </span>
          </label>
        </div>

        <label>
          <span className="form-label">Email address</span>
          <span className="form-control-wrap">
            <Mail className="form-control-icon" />
            <input type="email" value={form.email} onChange={event => update('email', event.target.value.toLowerCase().replace(/\s/g, '').slice(0, 100))} autoComplete="email" className="form-control form-control-with-icon" placeholder="Enter your email" disabled={loading} required />
          </span>
        </label>

        <label>
          <span className="form-label">Password</span>
          <span className="form-control-wrap">
            <Lock className="form-control-icon" />
            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={event => update('password', event.target.value.replace(/\s/g, '').slice(0, 64))} autoComplete="new-password" className="form-control form-control-with-icon form-control-with-action" placeholder="Create a password" disabled={loading} required />
            <button type="button" onClick={() => setShowPassword(current => !current)} className="input-action" aria-label={showPassword ? 'Hide password' : 'Show password'} disabled={loading}>
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </span>

          <span className="password-rules">
            {passwordRules.map(rule => {
            const Icon = rule.valid ? CheckCircle2 : Circle;
            return <span key={rule.label} className={`password-rule ${rule.valid ? 'password-rule-valid' : ''}`}>
                  <Icon /> {rule.label}
                </span>;
          })}
          </span>
        </label>

        <button type="submit" disabled={loading} className="primary-button">
          <UserPlus /> {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div className="auth-divider">or continue with</div>

      <button type="button" onClick={handleGoogle} disabled={loading} className="google-button">
        <GoogleIcon /> Google sign-in (approved admins)
      </button>

      <p className="auth-switch-text">
        Already registered? <Link className="auth-link" to="/login">Sign in</Link>
      </p>
    </AuthShell>;
}
