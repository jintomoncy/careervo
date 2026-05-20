import { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('careervo_lang') || 'en';
  });

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[lang];
    if (!value) return key;
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

  const handleSetLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('careervo_lang', newLang);
  };

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'ml' : 'en';
    setLang(newLang);
    localStorage.setItem('careervo_lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
