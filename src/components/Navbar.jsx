import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import './Navbar.css';

const Navbar = () => {
  const { lang, toggleLanguage, t } = useLanguage();
  const location = useLocation();

  const isFlowActive = ['/login', '/onboarding', '/analysis', '/results'].includes(location.pathname);

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container container flex-between">
        <Link to="/" className="navbar-logo">
          <Sparkles className="logo-icon" size={24} />
          <span>Careervo</span>
        </Link>
        
        {isFlowActive ? (
          <div className="navbar-links">
            <Link to="/analysis" className="nav-link">{lang === 'ml' ? 'ഡാഷ്ബോർഡ്' : 'Dashboard'}</Link>
            <Link to="/results" className="nav-link">{lang === 'ml' ? 'റിസൾട്ട്' : 'Results'}</Link>
            <Link to="/onboarding" className="nav-link">{lang === 'ml' ? 'പ്രൊഫൈൽ' : 'Profile'}</Link>
          </div>
        ) : (
          <div className="navbar-links">
            <Link to="/" className="nav-link">{t('nav.home')}</Link>
            <Link to="/#how-it-works" className="nav-link">{t('nav.howItWorks')}</Link>
            <Link to="/#trending" className="nav-link">{t('nav.trending')}</Link>
          </div>
        )}

        <div className="navbar-actions">
          <button className="lang-toggle btn-secondary" onClick={toggleLanguage}>
            <Globe size={18} />
            <span>{lang === 'en' ? 'ML' : 'EN'}</span>
          </button>
          {!isFlowActive && (
            <Link to="/login" className="btn-primary animate-fade-in">
              {t('nav.start')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
