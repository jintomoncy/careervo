import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Globe, ArrowRight, Mail, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import './Auth.css';

const CITIES_DATASET = [
  "Kochi", "Kollam", "Kozhikode", "Kottayam", "Kannur", "Kasaragod", "Trivandrum", 
  "Thrissur", "Alappuzha", "Pathanamthitta", "Idukki", "Wayanad", "Palakkad", "Malappuram",
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", 
  "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", 
  "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", 
  "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", 
  "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", 
  "Ranchi", "Howrah", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", 
  "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad", "Bareilly", "Moradabad", 
  "Mysore", "Gurgaon", "Aligarh", "Jalandhar", "Tiruchirappalli", "Bhubaneswar", "Salem", 
  "Warangal", "Guntur", "Noida", "Nellore", "Jamnagar", "Jhansi", "Udaipur", "Mangalore"
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
  
  const [phoneError, setPhoneError] = useState('');
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

  const handlePhoneChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, ''); // allow only numbers
    const val = rawVal.slice(0, 10); // max 10 digits
    setFormData(prev => ({ ...prev, phone: val }));
    
    if (val && val.length < 10) {
      setPhoneError(lang === 'ml' ? 'ദയവായി ശരിയായ ഫോൺ നമ്പർ നൽകുക' : 'Please enter a valid phone number');
    } else {
      setPhoneError('');
    }
  };

  const handleCityChange = (e) => {
    const val = e.target.value;
    setCityInput(val);
    setFormData(prev => ({ ...prev, city: val }));

    if (val.trim().length > 0) {
      const startsWithMatches = CITIES_DATASET.filter(c => 
        c.toLowerCase().startsWith(val.toLowerCase())
      );
      const containsMatches = CITIES_DATASET.filter(c => 
        !c.toLowerCase().startsWith(val.toLowerCase()) && 
        c.toLowerCase().includes(val.toLowerCase())
      );
      const filtered = [...startsWithMatches, ...containsMatches].slice(0, 8);
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

  const handleNext = async (e) => {
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
      if (formData.phone && formData.phone.length !== 10) {
        setPhoneError(lang === 'ml' ? 'ദയവായി ശരിയായ ഫോൺ നമ്പർ നൽകുക' : 'Please enter a valid phone number');
        setError(lang === 'ml' ? 'ദയവായി ശരിയായ ഫോൺ നമ്പർ നൽകുക.' : "Please enter a valid phone number.");
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
      
      if (userProfile.uid) {
        try {
          await setDoc(doc(db, "users", userProfile.uid), {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            language: formData.language,
            updatedAt: new Date()
          }, { merge: true });
        } catch (err) {
          console.error("Firestore error:", err);
        }
      }

      setLang(formData.language);
      setStep(2);
    } else {
      if (!formData.stream) {
        setError(lang === 'ml' ? 'തുടരുന്നതിനായി ദയവായി ഒരു പഠന ശാഖ തിരഞ്ഞെടുക്കുക.' : "Please select a stream to continue.");
        return;
      }
      updateProfile({ stream: formData.stream });
      
      if (userProfile.uid) {
        try {
          await setDoc(doc(db, "users", userProfile.uid), {
            stream: formData.stream,
            updatedAt: new Date()
          }, { merge: true });
        } catch (err) {
          console.error("Firestore error:", err);
        }
      }

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

              {/* Phone (Optional) */}
              <div className="input-group">
                <label>{lang === 'ml' ? 'ഫോൺ നമ്പർ (ഓപ്ഷണൽ)' : 'Phone Number (Optional)'}</label>
                <div className="input-with-icon">
                  <Phone size={18} />
                  <input 
                    type="tel" 
                    placeholder="+91 9876543210" 
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    maxLength={10}
                  />
                </div>
                {phoneError && <span className="inline-input-error animate-fade-in">{phoneError}</span>}
              </div>

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
