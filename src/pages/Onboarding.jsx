import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Globe, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import './Auth.css';

const Onboarding = () => {
  const { t, setLang, lang } = useLanguage();
  const { userProfile, updateProfile } = useUser();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: userProfile.name || '',
    city: userProfile.city || '',
    stream: userProfile.stream || '',
    language: lang
  });
  const [error, setError] = useState('');

  const handleNext = (e) => {
    e.preventDefault();
    setError('');

    if (step === 1) {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        setError("Please enter a valid full name.");
        return;
      }
      if (!formData.city.trim()) {
        setError("Please enter your city.");
        return;
      }
      updateProfile({ name: formData.name, city: formData.city });
      setLang(formData.language);
      setStep(2);
    } else {
      if (!formData.stream) {
        setError("Please select a stream to continue.");
        return;
      }
      updateProfile({ stream: formData.stream });
      navigate('/analysis');
    }
  };

  const streams = [
    { id: 'Science', name: 'Science', desc: 'Physics, Chem, Math, Bio' },
    { id: 'Commerce', name: 'Commerce', desc: 'Business, Accounts, Econ' },
    { id: 'Humanities', name: 'Humanities', desc: 'History, Geo, Pol Science' },
    { id: 'Computer Science', name: 'Computer Science', desc: 'With Math/Physics' },
    { id: 'Arts', name: 'Arts & Design', desc: 'Fine Arts, Media' }
  ];

  return (
    <div className="auth-page flex-center">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header text-center">
          <h2>{step === 1 ? t('onboarding.title1') : t('onboarding.title2')}</h2>
          <p>{step === 1 ? t('onboarding.sub1') : t('onboarding.sub2')}</p>
        </div>

        <form onSubmit={handleNext}>
          {step === 1 ? (
            <div className="animate-fade-in">
              <div className="input-group">
                <label>{t('onboarding.fullName')}</label>
                <div className="input-with-icon">
                  <User size={18} />
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="input-group">
                <label>{t('onboarding.city')}</label>
                <div className="input-with-icon">
                  <MapPin size={18} />
                  <input 
                    type="text" 
                    placeholder="Kochi" 
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="input-group">
                <label>{t('onboarding.language')}</label>
                <div className="input-with-icon">
                  <Globe size={18} />
                  <select 
                    required 
                    value={formData.language}
                    onChange={e => setFormData({...formData, language: e.target.value})}
                  >
                    <option value="en">English</option>
                    <option value="ml">Malayalam</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in stream-grid">
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
