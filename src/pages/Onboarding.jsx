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
        setError(lang === 'ml' ? 'ദയവായി ശരിയായ മുഴുവൻ പേര് നൽകുക.' : "Please enter a valid full name.");
        return;
      }
      if (!formData.city.trim()) {
        setError(lang === 'ml' ? 'ദയവായി നിങ്ങളുടെ നഗരം നൽകുക.' : "Please enter your city.");
        return;
      }
      updateProfile({ name: formData.name, city: formData.city });
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
                    placeholder={lang === 'ml' ? 'മുഴുവൻ പേര് ഇവിടെ നൽകുക' : 'John Doe'} 
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
                    placeholder={lang === 'ml' ? 'നഗരത്തിന്റെ പേര് നൽകുക' : 'Kochi'} 
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
