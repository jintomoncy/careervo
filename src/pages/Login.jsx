import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Phone, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './Auth.css';

const Login = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [step, setStep] = useState('input'); // 'input' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ email: '', phone: '', otp: '' });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\+?[1-9]\d{9,11}$/.test(phone.replace(/\s+/g, ''));

  const handleSendOTP = (e) => {
    e.preventDefault();
    setError('');
    
    if (method === 'email' && !validateEmail(formData.email)) {
      setError(t('auth.invalidEmail') || "Please enter a valid email address.");
      return;
    }
    
    if (method === 'phone' && !validatePhone(formData.phone)) {
      setError(t('auth.invalidPhone') || "Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    // Simulate API call for sending OTP
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1500);
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
      navigate('/onboarding');
    }, 1500);
  };

  return (
    <div className="auth-page flex-center">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header text-center">
          <Sparkles className="logo-icon mx-auto" size={32} />
          <h2>{t('auth.welcome')}</h2>
          <p>{t('auth.subtitle')}</p>
        </div>

        {step === 'input' ? (
          <div className="auth-methods animate-fade-in">
            <button className="btn-secondary w-full google-btn">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="provider-icon" />
              {t('auth.continueGoogle')}
            </button>
            
            <div className="divider">
              <span>{t('auth.or')}</span>
            </div>

            <div className="method-toggle">
              <button 
                className={method === 'email' ? 'active' : ''} 
                onClick={() => { setMethod('email'); setError(''); }}
              >
                {t('auth.email')}
              </button>
              <button 
                className={method === 'phone' ? 'active' : ''} 
                onClick={() => { setMethod('phone'); setError(''); }}
              >
                {t('auth.phone')}
              </button>
            </div>

            <form onSubmit={handleSendOTP} className="auth-form">
              {method === 'email' ? (
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
              ) : (
                <div className="input-group">
                  <label>{t('auth.phoneLabel')}</label>
                  <div className="input-with-icon">
                    <Phone size={18} />
                    <input 
                      type="tel" 
                      placeholder="+91 98765 43210" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required 
                    />
                  </div>
                </div>
              )}
              
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
                <strong>{method === 'email' ? formData.email : formData.phone}</strong>
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
                className="resend-btn" 
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
