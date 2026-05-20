import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Globe, ArrowRight, Mail, Phone, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import './Auth.css';

const CITIES_DATASET = [
  "Kochi", "Kollam", "Kottayam", "Kannur", "Kasaragod", "Kozhikode", "Trivandrum", 
  "Thrissur", "Alappuzha", "Pathanamthitta", "Idukki", "Wayanad", "Palakkad", "Malappuram",
  "Kolkata", "Kanpur", "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", 
  "Ahmedabad", "Jaipur", "Lucknow", "Surat", "Patna", "Indore", "Bhopal", "Coimbatore"
];

const Onboarding = () => {
  const { t, setLang, lang } = useLanguage();
  const { userProfile, updateProfile } = useUser();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const getInitialName = () => {
    const parts = (userProfile.name || '').trim().split(/\s+/);
    const first = parts[0] || '';
    const last = parts.slice(1).join(' ') || '';
    return { first, last };
  };

  const initName = getInitialName();

  const [formData, setFormData] = useState({
    firstName: initName.first,
    lastName: initName.last,
    email: userProfile.email || '',
    phone: userProfile.phone || '',
    city: userProfile.city || '',
    stream: userProfile.stream || '',
    language: lang
  });
  
  const [phoneState, setPhoneState] = useState(userProfile.phone ? 'verified' : 'idle'); // 'idle', 'verifying', 'verified', 'invalid'
  const [phoneOtp, setPhoneOtp] = useState('');
  const [error, setError] = useState('');

  // Autocomplete state
  const [cityInput, setCityInput] = useState(userProfile.city || '');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(0);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (userProfile.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: userProfile.email }));
    }
  }, [userProfile.email, formData.email]);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const validatePhone = (num) => {
    const cleaned = num.replace(/\D/g, '');
    return cleaned.length === 10 && /^[6-9]/.test(cleaned);
  };

  const handleStartPhoneVerify = () => {
    setError('');
    if (!validatePhone(formData.phone)) {
      setPhoneState('invalid');
      return;
    }
    setPhoneState('verifying');
  };

  const handleVerifyOtp = () => {
    if (phoneOtp === '123456' || phoneOtp.length === 6) {
      setPhoneState('verified');
      setPhoneOtp('');
    } else {
      setError(lang === 'ml' ? 'തെറ്റായ ഒ.ടി.പി കോഡ്.' : 'Invalid verification code. Use 123456');
    }
  };

  const handleCityChange = (e) => {
    const val = e.target.value;
    setCityInput(val);
    setFormData(prev => ({ ...prev, city: val }));

    if (val.trim().length > 0) {
      const filtered = CITIES_DATASET.filter(c => 
        c.toLowerCase().startsWith(val.toLowerCase())
      );
      setCitySuggestions(filtered);
      setShowSuggestions(true);
      setActiveSuggestionIdx(0);
    } else {
      setCitySuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectCity = (city) => {
    setCityInput(city);
    setFormData(prev => ({ ...prev, city }));
    setCitySuggestions([]);
    setShowSuggestions(false);
  };

  const handleCityKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeSuggestionIdx < citySuggestions.length - 1) {
        setActiveSuggestionIdx(prev => prev + 1);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeSuggestionIdx > 0) {
        setActiveSuggestionIdx(prev => prev - 1);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (citySuggestions.length > 0) {
        selectCity(citySuggestions[activeSuggestionIdx]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError(lang === 'ml' ? 'ദയവായി നിങ്ങളുടെ പേര് നൽകുക.' : "Please fill in your first and last name.");
        return;
      }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError(lang === 'ml' ? 'ദയവായി ശരിയായ ഇമെയിൽ നൽകുക.' : "Please enter a valid email address.");
        return;
      }
      if (phoneState !== 'verified') {
        setError(lang === 'ml' ? 'ദയവായി ഫോൺ നമ്പർ വെരിഫൈ ചെയ്യുക.' : "Please verify your phone number to continue.");
        return;
      }
      if (!formData.city.trim()) {
        setError(lang === 'ml' ? 'ദയവായി നിങ്ങളുടെ നഗരം നൽകുക.' : "Please select your city.");
        return;
      }

      updateProfile({
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email,
        phone: formData.phone,
        city: formData.city
      });
      setLang(formData.language);
      setStep(2);
    } else {
      if (!formData.stream) {
        setError(lang === 'ml' ? 'തുടരുന്നതിനായി ദയവായി ഒരു പഠന ശാഖ തിരഞ്ഞെടുക്കുക.' : "Please select a stream to continue.");
        return;
      }
      updateProfile({ stream: formData.stream });
      navigate('/analysis');
    }
  };

  const streams = [
    { id: 'Science', name: lang === 'ml' ? 'സയൻസ്' : 'Science', desc: lang === 'ml' ? 'ഫിസിക്സ്, കെമിസ്ട്രി, മാത്സ്, ബയോളജി' : 'Physics, Chem, Math, Bio' },
    { id: 'Commerce', name: lang === 'ml' ? 'കോമേഴ്‌സ്' : 'Commerce', desc: lang === 'ml' ? 'ബിസിനസ്സ്, അക്കൗണ്ട്സ്, ഇക്കണോമിക്സ്' : 'Business, Accounts, Econ' },
    { id: 'Humanities', name: lang === 'ml' ? 'ഹ്യുമാനിറ്റീസ്' : 'Humanities', desc: lang === 'ml' ? 'ചരിത്രം, ഭൂമിശാസ്ത്രം, പൊളിറ്റിക്കൽ സയൻസ്' : 'History, Geo, Pol Science' },
    { id: 'Computer Science', name: lang === 'ml' ? 'കമ്പ്യൂട്ടർ സയൻസ്' : 'Computer Science', desc: lang === 'ml' ? 'കമ്പ്യൂട്ടർ സയൻസ്, മാത്സ്, ഫിസിക്സ്' : 'With Math/Physics' },
    { id: 'Arts', name: lang === 'ml' ? 'ആർട്സ് & ഡിസൈൻ' : 'Arts & Design', desc: lang === 'ml' ? 'ഫൈൻ ആർട്സ്, മീഡിയ' : 'Fine Arts, Media' }
  ];

  return (
    <div className="auth-page flex-center">
      <div className="auth-card glass-panel onboarding-card animate-fade-in">
        <div className="auth-header text-center">
          <h2>{step === 1 ? (lang === 'ml' ? 'പ്രൊഫൈൽ പൂർത്തിയാക്കുക' : 'Complete Your Profile') : t('onboarding.title2')}</h2>
          <p>{step === 1 ? (lang === 'ml' ? 'വിവരങ്ങൾ നൽകി പ്രൊഫൈൽ പൂർത്തിയാക്കുക.' : 'Complete your registration details.') : t('onboarding.sub2')}</p>
        </div>

        <form onSubmit={handleNext}>
          {step === 1 ? (
            <div className="animate-fade-in flex flex-column gap-1">
              
              {/* First Name & Last Name */}
              <div className="name-fields-row">
                <div className="input-group">
                  <label>{lang === 'ml' ? 'ആദ്യ പേര്' : 'First Name'}</label>
                  <div className="input-with-icon">
                    <User size={18} />
                    <input 
                      type="text" 
                      placeholder="Jane" 
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label>{lang === 'ml' ? 'അവസാന പേര്' : 'Last Name'}</label>
                  <div className="input-with-icon">
                    <User size={18} />
                    <input 
                      type="text" 
                      placeholder="Doe" 
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="input-group">
                <label>{lang === 'ml' ? 'ഇമെയിൽ വിലാസം' : 'Email Address'}</label>
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input 
                    type="email" 
                    placeholder="student@example.com" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
              </div>

              {/* Phone & Verification */}
              <div className="input-group">
                <div className="flex-between">
                  <label>{lang === 'ml' ? 'ഫോൺ നമ്പർ' : 'Phone Number'}</label>
                  {phoneState === 'verified' && (
                    <span className="phone-badge success flex-center gap-1">
                      <CheckCircle size={14} />
                      {lang === 'ml' ? 'വെരിഫൈഡ്' : 'Verified'}
                    </span>
                  )}
                  {phoneState === 'invalid' && (
                    <span className="phone-badge danger flex-center gap-1">
                      <AlertTriangle size={14} />
                      {lang === 'ml' ? 'തെറ്റായ നമ്പർ' : 'Invalid Number'}
                    </span>
                  )}
                </div>
                <div className="phone-input-row flex gap-2">
                  <div className="input-with-icon w-full">
                    <Phone size={18} />
                    <input 
                      type="tel" 
                      placeholder="9876543210" 
                      value={formData.phone}
                      onChange={e => {
                        setFormData({...formData, phone: e.target.value.replace(/\D/g, '')});
                        if (phoneState !== 'verified') setPhoneState('idle');
                      }}
                      disabled={phoneState === 'verified'}
                      required 
                    />
                  </div>
                  {phoneState !== 'verified' && (
                    <button 
                      type="button" 
                      className="btn-secondary verify-trigger-btn"
                      onClick={handleStartPhoneVerify}
                      disabled={formData.phone.length < 10}
                    >
                      {phoneState === 'verifying' ? '...' : (lang === 'ml' ? 'വെരിഫൈ' : 'Verify')}
                    </button>
                  )}
                </div>
              </div>

              {/* Simulated OTP verification input */}
              {phoneState === 'verifying' && (
                <div className="phone-otp-box glass-panel animate-fade-in p-3 rounded-lg flex flex-column gap-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-secondary">
                    <ShieldCheck size={16} className="text-accent" />
                    <span>{lang === 'ml' ? 'നിങ്ങളുടെ കോഡ് നൽകുക (ഡിഫോൾട്ട്: 123456)' : 'Enter OTP (Default code: 123456)'}</span>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      maxLength={6}
                      placeholder="123456" 
                      className="otp-verify-inline-input"
                      value={phoneOtp}
                      onChange={e => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                    />
                    <button 
                      type="button" 
                      className="btn-primary inline-verify-btn"
                      onClick={handleVerifyOtp}
                      disabled={phoneOtp.length !== 6}
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}

              {/* City Autocomplete */}
              <div className="input-group relative" ref={suggestionsRef}>
                <label>{t('onboarding.city')}</label>
                <div className="input-with-icon">
                  <MapPin size={18} />
                  <input 
                    type="text" 
                    placeholder={lang === 'ml' ? 'നഗരത്തിന്റെ പേര് ടൈപ്പ് ചെയ്യുക (ഉദാ: Kochi)' : 'Type city name (e.g. Kochi)'} 
                    value={cityInput}
                    onChange={handleCityChange}
                    onKeyDown={handleCityKeyDown}
                    onFocus={() => { if (cityInput.trim().length > 0) setShowSuggestions(true); }}
                    required 
                  />
                </div>
                {showSuggestions && citySuggestions.length > 0 && (
                  <ul className="autocomplete-suggestions glass-panel animate-fade-in">
                    {citySuggestions.map((city, idx) => (
                      <li 
                        key={city}
                        className={idx === activeSuggestionIdx ? 'active' : ''}
                        onClick={() => selectCity(city)}
                      >
                        {city}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Language preferred */}
              <div className="input-group">
                <label>{t('onboarding.language')}</label>
                <div className="input-with-icon">
                  <Globe size={18} />
                  <select 
                    required 
                    value={formData.language}
                    onChange={e => {
                      setFormData({...formData, language: e.target.value});
                      setLang(e.target.value);
                    }}
                  >
                    <option value="en">English</option>
                    <option value="ml">Malayalam</option>
                  </select>
                </div>
              </div>

            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="stream-grid">
                {streams.map(s => (
                  <div 
                    key={s.id} 
                    className={`stream-card ${formData.stream === s.id ? 'selected' : ''}`}
                    onClick={() => { setFormData({...formData, stream: s.id}); setError(''); }}
                  >
                    <h4>{s.name}</h4>
                    <p>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div className="auth-error animate-fade-in">{error}</div>}

          <button 
            type="submit" 
            className="btn-primary w-full flex-center"
            style={{ marginTop: '32px' }}
            disabled={step === 1 && phoneState !== 'verified'}
          >
            {step === 1 ? t('auth.continueBtn') : t('onboarding.startAnalysis')}
            <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
