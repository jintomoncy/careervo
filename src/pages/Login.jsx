import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const { t } = useLanguage();
  const { updateProfile } = useUser();
  const { currentUser, loginWithGoogle, signUpWithEmail, loginWithEmail, sendVerification, logout } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    if (currentUser && currentUser.emailVerified) {
      navigate('/onboarding', { replace: true });
    }
  }, [currentUser, navigate]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateEmail(formData.email)) {
      setError(t('auth.invalidEmail') || "Please enter a valid email address.");
      return;
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await signUpWithEmail(formData.email, formData.password);
        await sendVerification(userCredential.user);
        setMessage("Verification email sent! Please check your inbox, verify, and then login.");
        setIsSignUp(false);
        await logout(); // force them to log in after verifying
      } else {
        const userCredential = await loginWithEmail(formData.email, formData.password);
        if (!userCredential.user.emailVerified) {
          setError("Please verify your email before logging in.");
          await logout();
        } else {
          updateProfile({ email: userCredential.user.email, uid: userCredential.user.uid });
          navigate('/onboarding');
        }
      }
    } catch (err) {
      console.error("Email Auth Error:", err);
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await loginWithGoogle();
      const user = result.user; // Extract user properly
      updateProfile({
        email: user.email,
        name: user.displayName || '',
        uid: user.uid
      });
      navigate('/onboarding');
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page flex-center">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header text-center">
          <Sparkles className="logo-icon mx-auto animate-pulse" size={36} />
          <h2>{t('auth.welcome')}</h2>
          <p>{t('auth.subtitle')}</p>
        </div>

        <div className="auth-methods animate-fade-in">
          <button className="btn-secondary w-full google-btn" onClick={handleGoogleLogin} disabled={loading}>
            <img src="https://www.google.com/favicon.ico" alt="Google" className="provider-icon" />
            {t('auth.continueGoogle')}
          </button>

          <div className="divider">
            <span>{t('auth.or')}</span>
          </div>

          <form onSubmit={handleEmailAuth} className="auth-form">
            <div className="input-group">
              <label>{t('auth.emailLabel')}</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group mt-3">
              <label>Password</label>
              <div className="input-with-icon">
                <ShieldCheck size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && <div className="auth-error animate-fade-in">{error}</div>}
            {message && <div className="auth-success animate-fade-in" style={{ color: 'green', marginTop: '10px' }}>{message}</div>}

            <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
              {loading ? (isSignUp ? 'Signing Up...' : 'Logging In...') : (isSignUp ? 'Sign Up' : 'Log In')}
              {!loading && <ArrowRight size={18} />}
            </button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                className="resend-btn"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
              >
                {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
