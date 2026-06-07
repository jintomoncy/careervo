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
  const { currentUser, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      navigate('/onboarding', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await loginWithGoogle();
      const user = result.user; // Extract user properly
      console.log("Google Login successful:", user.email);

      updateProfile({
        email: user.email,
        name: user.displayName || '',
        uid: user.uid
      });
      
      // Save to Firestore 'students' collection
      try {
        const { db } = await import('../lib/firebase');
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        
        console.log("Saving user to Firestore collection 'students'...");
        await setDoc(doc(db, "students", user.uid), {
          uid: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          createdAt: serverTimestamp()
        }, { merge: true });
        console.log("Firestore save successful.");
      } catch (err) {
        console.error("Firestore Error saving student:", err);
      }

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
          
          {error && <div className="auth-error animate-fade-in mt-4">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default Login;
