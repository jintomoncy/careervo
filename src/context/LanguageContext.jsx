import { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  // Helper to access nested keys like "home.heroTitle"
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[lang];
    for (let k of keys) {
      if (value[k] === undefined) return key;
      value = value[k];
    }
    
    // Replace params
    let res = value;
    Object.keys(params).forEach(p => {
      res = res.replace(`{${p}}`, params[p]);
    });
    
    return res;
  };

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'ml' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
