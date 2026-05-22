import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import './Auth.css';

import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

const Login = () => {
  const { t } = useLanguage();
  const { updateProfile } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState('input'); // 'input' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ email: '', otp: '' });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendOTP = (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(formData.email)) {
      setError(t('auth.invalidEmail') || "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    // Simulate API call for sending OTP
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1200);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.otp.length !== 6) {
      setError(t('auth.invalidOtp') || "Invalid OTP. Please enter 6 digits.");
      return;
    }

    setLoading(true);
    // Simulate API call for verifying OTP
    setTimeout(() => {
      setLoading(false);
      updateProfile({ email: formData.email });
      navigate('/onboarding');
    }, 1200);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      updateProfile({ 
        email: user.email,
        name: user.displayName || '',
        uid: user.uid
      });
      navigate('/onboarding');
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError(t('auth.loginError') || 'Failed to sign in with Google. Ensure Firebase config is added.');
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

        {step === 'input' ? (
          <div className="auth-methods animate-fade-in">
            <button className="btn-secondary w-full google-btn" onClick={handleGoogleLogin} disabled={loading}>
              <img src="https://www.google.com/favicon.ico" alt="Google" className="provider-icon" />
              {t('auth.continueGoogle')}
            </button>
            
            <div className="divider">
              <span>{t('auth.or')}</span>
            </div>

            <form onSubmit={handleSendOTP} className="auth-form">
              <div className="input-group">
                <label>{t('auth.emailLabel')}</label>
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input 
                    type="email" 
                    placeholder="student@example.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
              </div>
              
              {error && <div className="auth-error animate-fade-in">{error}</div>}
              
              <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
                {loading ? t('auth.sending') || 'Sending...' : t('auth.continueBtn')}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          </div>
        ) : (
          <div className="otp-verification animate-fade-in">
            <div className="text-center mb-6">
              <ShieldCheck size={48} className="text-accent mx-auto mb-4" />
              <h3>{t('auth.verifyOtp')}</h3>
              <p className="text-secondary mt-2">
                We've sent a 6-digit code to <br/>
                <strong>{formData.email}</strong>
              </p>
            </div>
            
            <form onSubmit={handleVerifyOTP}>
              <div className="input-group text-center">
                <input 
                  type="text" 
                  maxLength={6}
                  className="otp-input"
                  placeholder="• • • • • •" 
                  value={formData.otp}
                  onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/\D/g, '')})}
                  required 
                />
              </div>

              {error && <div className="auth-error animate-fade-in">{error}</div>}
              
              <button type="submit" className="btn-primary w-full mt-4" disabled={loading || formData.otp.length !== 6}>
                {loading ? t('auth.verifying') || 'Verifying...' : (t('auth.verifyLogin') || 'Verify & Login')}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
            
            <div className="text-center mt-6">
              <button 
                type="button" 
                className="resend-btn flex-center gap-1 mx-auto" 
                onClick={() => setStep('input')}
              >
                <RefreshCw size={14} />
                {t('auth.changeOrResend') || 'Change Method or Resend'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
